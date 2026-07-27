import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { Prisma } from '@prisma/client';
import { DIGEST_FLUSH_QUEUE_NAME, digestFlushQueue, waOutboxQueue } from '../config/queue.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { getTenantPrisma } from '../lib/prisma-tenant.js';
import { flushDigestBuffer, listDigestBufferGuardianIds } from '../lib/whatsapp/redis-helpers.js';
import { messagingService, type DigestEvent, type WaOutboxJobData } from '../modules/messaging/messaging.service.js';

const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });

/**
 * Flush every guardian's digest buffer into a single batched outbox send.
 * Ported from Urmi's digest worker (KEYS swapped for scanStream).
 */
async function processDigestFlush(): Promise<void> {
  const guardianIds = await listDigestBufferGuardianIds();
  if (guardianIds.length === 0) return;

  for (const guardianId of guardianIds) {
    const events = await flushDigestBuffer<DigestEvent>(guardianId);
    if (events.length === 0) continue;

    const institutionId = events[0].institutionId as string | undefined;
    if (!institutionId) continue;

    const db = getTenantPrisma(institutionId);

    const guardian = await db.guardian.findFirst({
      where: { id: guardianId },
      select: { firstName: true },
    });
    const guardianName = guardian?.firstName ?? 'अभिभावक';
    const summary = messagingService.renderDigestSummary(events);

    // One digest per guardian per 15-min window (dedupe re-entrant flushes).
    const idempotencyKey = `digest:${guardianId}:${new Date().toISOString().slice(0, 16)}`;

    let outboxId: string;
    try {
      const row = await db.outbox.create({
        data: {
          institutionId,
          recipientType: 'guardian',
          recipientId: guardianId,
          channel: 'whatsapp',
          templateCode: 'digest_daily',
          variables: { guardian_name: guardianName, count: String(events.length), summary },
          category: 'utility',
          priority: 'high',
          idempotencyKey,
          status: 'pending',
        },
        select: { id: true },
      });
      outboxId = row.id;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        continue; // already flushed in this window
      }
      throw err;
    }

    for (const ev of events) {
      await db.digestQueue.create({
        data: {
          institutionId,
          guardianId,
          eventType: ev.type ?? 'digest_update',
          eventPayload: ev as unknown as Prisma.InputJsonValue,
          scheduledFor: new Date(),
          sentAt: new Date(),
          outboxId,
        },
      });
    }

    await waOutboxQueue.add('send', { institutionId, outboxId } satisfies WaOutboxJobData);
    logger.info('[digest] flushed', { guardianId, events: events.length, outboxId });
  }
}

export const digestWorker = new Worker(
  DIGEST_FLUSH_QUEUE_NAME,
  async (_job: Job) => {
    await processDigestFlush();
  },
  { connection, concurrency: 1 },
);

digestWorker.on('failed', (job, err) => {
  logger.error(`[digest] job ${job?.id} failed: ${err.message}`);
});

/** Register the repeatable flush jobs (idempotent on jobId). */
export async function scheduleDigestJobs(): Promise<void> {
  await digestFlushQueue.add('flush-interval', {}, {
    repeat: { every: 30 * 60 * 1000 },
    jobId: 'digest-flush-interval',
  });
  await digestFlushQueue.add('flush-eod', {}, {
    repeat: { pattern: '0 17 * * *', tz: 'Asia/Kolkata' },
    jobId: 'digest-flush-eod',
  });
  logger.info('[digest] repeatable jobs scheduled (30-min + 17:00 IST)');
}
