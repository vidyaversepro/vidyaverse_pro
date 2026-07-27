import { FastifyPluginAsync } from 'fastify';
import crypto from 'crypto';
import { env } from '../../config/env.js';
import { getTenantPrisma } from '../../lib/prisma-tenant.js';
import { setServiceWindow } from '../../lib/whatsapp/redis-helpers.js';
import { inboundMediaQueue } from '../../config/queue.js';
import { logger } from '../../utils/logger.js';
import { inboundService } from './inbound.service.js';
import { admissionsService } from '../admissions/admissions.service.js';
import { entitlementsService } from '../entitlements/entitlements.service.js';
import type { MediaType } from '@prisma/client';

function verifyMetaSignature(rawBody: string, header: string | undefined, secret: string | undefined): boolean {
  if (!header || !secret || !header.startsWith('sha256=')) return false;
  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function docMediaType(mime: string | undefined): MediaType {
  if (mime?.includes('pdf')) return 'pdf';
  if (mime?.includes('spreadsheet') || mime?.includes('excel')) return 'excel';
  return 'other';
}

/** Process one webhook body asynchronously (after the 200 ack). */
async function processWebhook(body: any): Promise<void> {
  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;
      if (!value) continue;

      const phoneNumberId = value.metadata?.phone_number_id as string | undefined;
      if (!phoneNumberId) continue;
      const institutionId = await inboundService.resolveInstitutionByPhoneNumberId(phoneNumberId);
      if (!institutionId) {
        logger.warn('[inbound] no institution for phone_number_id', { phoneNumberId });
        continue;
      }
      const db = getTenantPrisma(institutionId);

      // Delivery / read / failed status updates
      for (const status of value.statuses ?? []) {
        const ts = new Date(parseInt(status.timestamp, 10) * 1000);
        const data =
          status.status === 'delivered' ? { status: 'delivered', deliveredAt: ts }
          : status.status === 'read' ? { status: 'read', readAt: ts }
          : status.status === 'failed' ? { status: 'failed', failedAt: ts }
          : null;
        if (data) await db.message.updateMany({ where: { waMessageId: status.id }, data });
      }

      // Inbound messages
      for (const msg of value.messages ?? []) {
        const waMessageId = msg.id as string;
        const from = (msg.from as string).startsWith('+') ? msg.from : `+${msg.from}`;

        // Idempotency
        const existing = await db.message.findFirst({ where: { waMessageId } });
        if (existing) continue;

        const guardian = await inboundService.findGuardianByPhone(institutionId, from);
        if (!guardian) {
          // Unregistered number → capture as an admissions lead if the module is enabled.
          if (msg.type === 'text' && (await entitlementsService.isModuleEnabled(institutionId, 'admissions_crm'))) {
            await admissionsService.captureFromWhatsApp(institutionId, from, undefined, msg.text?.body ?? '');
            await inboundService.sendReply(
              institutionId,
              from,
              'नमस्ते! आपकी पूछताछ के लिए धन्यवाद 🙏 हमारी टीम जल्द ही आपसे संपर्क करेगी।',
            );
          } else {
            logger.warn('[inbound] message from unregistered number', { institutionId });
          }
          continue;
        }

        await setServiceWindow(guardian.id);
        await inboundService.recordInboundMessage(institutionId, guardian.id, waMessageId);

        if (msg.type === 'text') {
          await inboundService.handleInboundText(institutionId, guardian, from, msg.text?.body ?? '');
        } else if (msg.type === 'image' || msg.type === 'audio' || msg.type === 'video' || msg.type === 'document') {
          const mediaObj = msg[msg.type];
          const waMediaId = mediaObj?.id as string | undefined;
          const mime = mediaObj?.mime_type as string | undefined;
          if (!waMediaId) continue;
          const mediaType: MediaType = msg.type === 'document' ? docMediaType(mime) : (msg.type as MediaType);

          try {
            const media = await db.inboundMedia.create({
              data: { institutionId, guardianId: guardian.id, waMediaId, mediaType, mimeType: mime ?? null, status: 'received' },
              select: { id: true },
            });
            await inboundMediaQueue.add('process', {
              institutionId,
              guardianId: guardian.id,
              guardianPhone: from,
              inboundMediaId: media.id,
              waMediaId,
              mediaType,
              mimeType: mime,
            });
          } catch (err) {
            // unique waMediaId => already seen; ignore
            logger.debug({ err }, '[inbound] duplicate media skipped');
          }
        }
      }
    }
  }
}

/** Public WhatsApp inbound webhook (no auth; raw-body HMAC verification). */
const inboundWebhooks: FastifyPluginAsync = async (fastify) => {
  fastify.addContentTypeParser('application/json', { parseAs: 'string' }, (req, body, done) => {
    (req as unknown as { rawBody: string }).rawBody = typeof body === 'string' ? body : String(body);
    try {
      done(null, body ? JSON.parse(body as string) : {});
    } catch (err) {
      done(err as Error, undefined);
    }
  });

  fastify.get('/whatsapp', async (request, reply) => {
    const q = request.query as Record<string, string>;
    if (q['hub.mode'] === 'subscribe' && env.WHATSAPP_VERIFY_TOKEN && q['hub.verify_token'] === env.WHATSAPP_VERIFY_TOKEN) {
      return reply.status(200).send(q['hub.challenge']);
    }
    return reply.status(403).send('forbidden');
  });

  fastify.post('/whatsapp', async (request, reply) => {
    const rawBody = (request as unknown as { rawBody: string }).rawBody ?? '';
    const sig = request.headers['x-hub-signature-256'] as string | undefined;
    // Enforce signature when an app secret is configured; allow in dev without one.
    if (env.WHATSAPP_APP_SECRET && !verifyMetaSignature(rawBody, sig, env.WHATSAPP_APP_SECRET)) {
      return reply.status(401).send({ error: 'invalid signature' });
    }
    // Ack fast, process async (Meta retries on non-200/timeout).
    reply.status(200).send({ status: 'ok' });
    processWebhook(request.body).catch((err) => request.log.error({ err }, '[inbound] webhook processing failed'));
  });
};

export default inboundWebhooks;
