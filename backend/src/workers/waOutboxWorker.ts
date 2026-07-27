import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import crypto from 'crypto';
import { WA_OUTBOX_QUEUE_NAME } from '../config/queue.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { prisma } from '../config/database.js';
import { getTenantPrisma } from '../lib/prisma-tenant.js';
import { sendTemplateMessage } from '../lib/whatsapp/client.js';
import { TemplateVariableMissingError } from '../lib/whatsapp/template-mapper.js';
import { checkServiceWindow } from '../lib/whatsapp/redis-helpers.js';
import { entitlementsService } from '../modules/entitlements/entitlements.service.js';
import type { WaOutboxJobData } from '../modules/messaging/messaging.service.js';

const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });
const MAX_ATTEMPTS = 3;

/**
 * Outbox processor. Ported from Urmi: resolve recipient -> check 24h service
 * window -> load approved template -> send via Cloud API -> record + retry.
 */
export const waOutboxWorker = new Worker<WaOutboxJobData>(
  WA_OUTBOX_QUEUE_NAME,
  async (job: Job<WaOutboxJobData>) => {
    const { institutionId, outboxId } = job.data;
    const db = getTenantPrisma(institutionId);

    const outboxRow = await db.outbox.findFirst({ where: { id: outboxId } });
    if (!outboxRow || outboxRow.status !== 'pending') return;

    const attempts = outboxRow.attempts + 1;

    // Resolve recipient WhatsApp number
    let recipientPhone = '';
    if (outboxRow.recipientType === 'guardian') {
      const guardian = await db.guardian.findFirst({
        where: { id: outboxRow.recipientId },
        select: { whatsappNumber: true },
      });
      if (!guardian) throw new Error('Recipient guardian not found');
      recipientPhone = guardian.whatsappNumber;
    } else {
      throw new Error('Staff recipient not implemented yet');
    }

    // An open 24h service window makes the message free-form (category 'service').
    const isWindowOpen = await checkServiceWindow(outboxRow.recipientId);
    const effectiveCategory = isWindowOpen ? 'service' : outboxRow.category;

    const template = await db.messageTemplate.findFirst({
      where: { code: outboxRow.templateCode, status: 'approved' },
      orderBy: { language: 'asc' },
    });
    if (!template) {
      throw new Error(`Template ${outboxRow.templateCode} not found or not approved`);
    }

    const institution = await prisma.institution.findUnique({
      where: { id: institutionId },
      select: { whatsappPhoneNumberId: true },
    });

    // Monthly WhatsApp quota (per subscription tier).
    const quota = await entitlementsService.checkQuota(institutionId, 'whatsapp');
    if (!quota.ok) {
      await db.outbox.update({
        where: { id: outboxId },
        data: { status: 'failed', lastError: `whatsapp_quota_exceeded (${quota.used}/${quota.limit})`, attempts },
      });
      logger.warn('[wa-outbox] monthly WhatsApp quota exceeded', { institutionId, used: quota.used, limit: quota.limit });
      return;
    }

    try {
      const result = await sendTemplateMessage({
        phoneNumberId: institution?.whatsappPhoneNumberId ?? '',
        toWhatsappNumber: recipientPhone,
        templateName: template.metaTemplateName ?? template.code,
        languageCode: template.language,
        placeholders: template.placeholders as Record<string, string[]> | null,
        variables: outboxRow.variables as Record<string, string> | null,
      });

      if (!result.ok) {
        throw new Error(result.error ?? 'WhatsApp send failed');
      }

      const waMessageId =
        result.waMessageId ?? (result.skipped ? `dev-skip-${crypto.randomUUID()}` : undefined);

      await db.outbox.update({
        where: { id: outboxId },
        data: {
          status: 'sent',
          sentAt: new Date(),
          windowUsed: effectiveCategory === 'service',
          attempts,
        },
      });

      await db.message.create({
        data: {
          institutionId,
          outboxId,
          guardianId: outboxRow.recipientType === 'guardian' ? outboxRow.recipientId : null,
          channel: outboxRow.channel,
          templateCode: outboxRow.templateCode,
          waMessageId,
          direction: 'outbound',
          category: effectiveCategory ?? undefined,
          status: result.skipped ? 'skipped_no_creds' : 'sent',
        },
      });

      if (!result.skipped) await entitlementsService.incrementUsage(institutionId, 'whatsapp');
      logger.info('[wa-outbox] sent', { outboxId, waMessageId, skipped: result.skipped ?? false });
    } catch (err) {
      // Missing template variable is a permanent error — never retry or fall back.
      if (err instanceof TemplateVariableMissingError) {
        await db.outbox.update({
          where: { id: outboxId },
          data: { status: 'failed', lastError: err.message, attempts },
        });
        logger.warn('[wa-outbox] template variable missing', { outboxId, error: err.message });
        return;
      }

      const errorMsg = err instanceof Error ? err.message : String(err);

      if (attempts >= MAX_ATTEMPTS) {
        await db.outbox.update({
          where: { id: outboxId },
          data: { status: 'failed', lastError: errorMsg, attempts },
        });
        logger.error('[wa-outbox] giving up after max attempts', { outboxId, attempts, error: errorMsg });
        // (SMS fallback would be enqueued here in a later phase.)
        return;
      }

      await db.outbox.update({
        where: { id: outboxId },
        data: { lastError: errorMsg, attempts },
      });
      throw err; // trigger BullMQ exponential backoff
    }
  },
  { connection, concurrency: 10 },
);

waOutboxWorker.on('failed', (job, err) => {
  logger.error(`[wa-outbox] job ${job?.id} failed: ${err.message}`);
});
