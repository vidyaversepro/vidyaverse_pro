import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { INBOUND_MEDIA_QUEUE_NAME } from '../config/queue.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { getTenantPrisma } from '../lib/prisma-tenant.js';
import { uploadToMinio } from '../config/minio.js';
import { inboundService } from '../modules/inbound/inbound.service.js';
import { transcribeAudio } from '../lib/ai/voice.js';
import type { MediaType } from '@prisma/client';

interface InboundMediaJob {
  institutionId: string;
  guardianId: string;
  guardianPhone: string;
  inboundMediaId: string;
  waMediaId: string;
  mediaType: MediaType;
  mimeType?: string;
}

const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });

/** Download a WhatsApp media object (two-step: metadata URL, then bytes). */
async function downloadWhatsAppMedia(waMediaId: string): Promise<{ buffer: Buffer; mime?: string } | null> {
  const token = env.WHATSAPP_ACCESS_TOKEN;
  if (!token) return null; // dev: no creds, skip actual download
  const metaRes = await fetch(`https://graph.facebook.com/${env.WHATSAPP_API_VERSION}/${waMediaId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!metaRes.ok) throw new Error(`media meta ${metaRes.status}`);
  const meta = (await metaRes.json()) as { url?: string; mime_type?: string };
  if (!meta.url) return null;
  const fileRes = await fetch(meta.url, { headers: { Authorization: `Bearer ${token}` } });
  if (!fileRes.ok) throw new Error(`media download ${fileRes.status}`);
  return { buffer: Buffer.from(await fileRes.arrayBuffer()), mime: meta.mime_type };
}

export const inboundMediaWorker = new Worker<InboundMediaJob>(
  INBOUND_MEDIA_QUEUE_NAME,
  async (job: Job<InboundMediaJob>) => {
    const { institutionId, guardianId, guardianPhone, inboundMediaId, waMediaId, mediaType } = job.data;
    const db = getTenantPrisma(institutionId);

    const objectPath = `inbound/${institutionId}/${waMediaId}`;
    let stored = false;
    let fileSize: number | undefined;
    let mediaBuffer: Buffer | null = null;
    try {
      const dl = await downloadWhatsAppMedia(waMediaId);
      if (dl) {
        await uploadToMinio(objectPath, dl.buffer, dl.mime ?? 'application/octet-stream');
        stored = true;
        fileSize = dl.buffer.length;
        mediaBuffer = dl.buffer;
      }
    } catch (err) {
      logger.warn({ err }, '[inbound-media] download/store failed');
    }

    await db.inboundMedia.update({
      where: { id: inboundMediaId },
      data: { objectPath, status: stored ? 'stored' : 'received', fileSizeBytes: fileSize ?? null },
    });

    // Routing. Production: replace the image heuristic with Claude vision classification.
    if (mediaType === 'image') {
      const claim = await inboundService.createPaymentClaim({ institutionId, guardianId, objectPath, mediaType });
      await db.inboundMedia.update({
        where: { id: inboundMediaId },
        data: { intentDetected: 'payment_proof', actionTaken: claim ? 'claim_created' : 'no_open_invoice', visionUsed: false, status: 'processed', processedAt: new Date() },
      });
      await inboundService.sendReply(
        institutionId,
        guardianPhone,
        claim ? 'आपका भुगतान प्रमाण प्राप्त हुआ। समीक्षा के बाद पुष्टि भेजी जाएगी। 🙏' : 'चित्र प्राप्त हुआ। धन्यवाद!',
      );
    } else if (mediaType === 'audio') {
      const tr = await transcribeAudio(mediaBuffer, { mimeType: job.data.mimeType });
      if (tr.text) {
        const g = await db.guardian.findFirst({ where: { id: guardianId }, select: { firstName: true } });
        await db.inboundMedia.update({
          where: { id: inboundMediaId },
          data: { transcript: tr.text, intentDetected: 'voice_query', actionTaken: `transcribed:${tr.provider}`, status: 'processed', processedAt: new Date() },
        });
        // Route the transcript through the same text pipeline (classify -> reply).
        await inboundService.handleInboundText(institutionId, { id: guardianId, firstName: g?.firstName ?? 'अभिभावक' }, guardianPhone, tr.text);
      } else {
        await db.inboundMedia.update({
          where: { id: inboundMediaId },
          data: { intentDetected: 'voice_note', actionTaken: 'no_transcription', status: 'processed', processedAt: new Date() },
        });
        await inboundService.sendReply(institutionId, guardianPhone, 'आपका वॉइस संदेश प्राप्त हुआ। हमारा स्टाफ़ शीघ्र संपर्क करेगा।');
      }
    } else {
      await db.inboundMedia.update({
        where: { id: inboundMediaId },
        data: { intentDetected: 'document_submission', actionTaken: 'stored', status: 'processed', processedAt: new Date() },
      });
      await inboundService.sendReply(institutionId, guardianPhone, 'आपका दस्तावेज़ प्राप्त हुआ। धन्यवाद!');
    }

    logger.info('[inbound-media] processed', { inboundMediaId, mediaType, stored });
    return { ok: true };
  },
  { connection, concurrency: 5 },
);

inboundMediaWorker.on('failed', (job, err) => {
  logger.error(`[inbound-media] job ${job?.id} failed: ${err.message}`);
});
