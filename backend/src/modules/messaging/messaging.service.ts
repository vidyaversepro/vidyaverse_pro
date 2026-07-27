import crypto from 'crypto';
import { Prisma } from '@prisma/client';
import type {
  TemplateCategory,
  OutboxChannel,
  OutboxPriority,
  RecipientType,
} from '@prisma/client';
import { prisma } from '../../config/database.js';
import { getTenantPrisma } from '../../lib/prisma-tenant.js';
import { waOutboxQueue } from '../../config/queue.js';
import { addToDigestBuffer } from '../../lib/whatsapp/redis-helpers.js';
import { logger } from '../../utils/logger.js';
import { DEFAULT_TEMPLATE_CATALOG } from './template-catalog.js';
import { entitlementsService } from '../entitlements/entitlements.service.js';

/** Feature key stored in Institution.enabledServices to gate the rail. */
export const MESSAGING_SERVICE_KEY = 'whatsapp_messaging';

export interface WaOutboxJobData {
  institutionId: string;
  outboxId: string;
}

export type DigestFlushJobData = Record<string, never>;

export interface EnqueueMessageParams {
  institutionId: string;
  recipientType: RecipientType;
  recipientId: string;
  templateCode: string;
  variables: Record<string, string>;
  channel?: OutboxChannel;
  category?: TemplateCategory;
  priority?: OutboxPriority;
  /** Pass a deterministic key to dedupe (e.g. `${studentId}:${date}:absent`). */
  idempotencyKey?: string;
}

export interface DigestEvent {
  type: string;
  studentId?: string;
  childName?: string;
  text: string;
  [key: string]: unknown;
}

export const messagingService = {
  async isMessagingEnabled(institutionId: string): Promise<boolean> {
    return entitlementsService.isModuleEnabled(institutionId, MESSAGING_SERVICE_KEY);
  },

  /** Create an outbox row and enqueue it for delivery. Idempotent on idempotencyKey. */
  async enqueueMessage(params: EnqueueMessageParams): Promise<{ enqueued: boolean; outboxId?: string; deduped?: boolean }> {
    const db = getTenantPrisma(params.institutionId);
    const idempotencyKey = params.idempotencyKey ?? crypto.randomUUID();

    try {
      const row = await db.outbox.create({
        data: {
          institutionId: params.institutionId,
          recipientType: params.recipientType,
          recipientId: params.recipientId,
          channel: params.channel ?? 'whatsapp',
          templateCode: params.templateCode,
          variables: params.variables,
          category: params.category ?? 'utility',
          priority: params.priority ?? 'normal',
          idempotencyKey,
          status: 'pending',
        },
        select: { id: true },
      });

      await waOutboxQueue.add('send', {
        institutionId: params.institutionId,
        outboxId: row.id,
      } satisfies WaOutboxJobData);

      return { enqueued: true, outboxId: row.id };
    } catch (err) {
      // Unique violation on idempotencyKey => already enqueued, treat as no-op.
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        return { enqueued: false, deduped: true };
      }
      throw err;
    }
  },

  /** Add an event to a guardian's 30-minute digest buffer (batched send). */
  async bufferDigestEvent(institutionId: string, guardianId: string, event: DigestEvent): Promise<void> {
    await addToDigestBuffer(guardianId, { ...event, institutionId, guardianId });
  },

  renderDigestSummary(events: DigestEvent[]): string {
    return events.map((e, i) => `${i + 1}. ${e.text}`).join('\n');
  },

  /** Provision the starter Hindi template catalog for an institution. */
  async provisionDefaultTemplates(institutionId: string): Promise<{ provisioned: number }> {
    let provisioned = 0;
    for (const t of DEFAULT_TEMPLATE_CATALOG) {
      await prisma.messageTemplate.upsert({
        where: {
          institutionId_code_language: {
            institutionId,
            code: t.code,
            language: t.language,
          },
        },
        update: {
          bodyText: t.bodyText,
          placeholders: t.placeholders,
          buttonConfig: t.buttonConfig ? (t.buttonConfig as Prisma.InputJsonValue) : Prisma.JsonNull,
          category: t.category,
        },
        create: {
          institutionId,
          code: t.code,
          metaTemplateName: t.code,
          category: t.category,
          channel: 'whatsapp',
          language: t.language,
          bodyText: t.bodyText,
          placeholders: t.placeholders,
          buttonConfig: t.buttonConfig ? (t.buttonConfig as Prisma.InputJsonValue) : Prisma.JsonNull,
          // Provisioned ready-to-use for dev; production must sync Meta approval.
          status: 'approved',
        },
      });
      provisioned += 1;
    }
    logger.info('Provisioned WhatsApp templates', { institutionId, provisioned });
    return { provisioned };
  },

  async listTemplates(institutionId: string) {
    const db = getTenantPrisma(institutionId);
    return db.messageTemplate.findMany({ orderBy: { code: 'asc' } });
  },

  async listMessages(institutionId: string, opts: { guardianId?: string; limit?: number } = {}) {
    const db = getTenantPrisma(institutionId);
    return db.message.findMany({
      where: opts.guardianId ? { guardianId: opts.guardianId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: Math.min(opts.limit ?? 50, 200),
    });
  },
};
