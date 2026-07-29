/**
 * Resend delivery-event webhook. NO auth hook — Resend calls this unauthenticated
 * and it is verified by Svix signature instead. Follows the same shape as the
 * payment webhooks: an encapsulated content-type parser preserves the raw body
 * for signature verification, and Redis gives idempotency since providers retry.
 *
 * This is the whole point of moving to Resend. Shared SMTP silently swallowed
 * bounces, so a dead address was retried indefinitely and reputation damage was
 * invisible until it affected every app on the domain.
 */
import { FastifyPluginAsync } from 'fastify';
import { getRedisClient } from '../../config/redis.js';
import { env } from '../../config/env.js';
import { verifyResendSignature } from '../../lib/email/resend.js';
import { suppress } from '../../lib/email/suppression.js';
import { logger } from '../../utils/logger.js';

interface ResendEvent {
    type?: string;
    data?: {
        email_id?: string;
        to?: string[] | string;
        bounce?: { type?: string; subType?: string; message?: string };
        [key: string]: unknown;
    };
}

const emailWebhooks: FastifyPluginAsync = async (fastify) => {
    fastify.addContentTypeParser('application/json', { parseAs: 'string' }, (req, body, done) => {
        (req as unknown as { rawBody: string }).rawBody = typeof body === 'string' ? body : String(body);
        try {
            done(null, body ? JSON.parse(body as string) : {});
        } catch (err) {
            done(err as Error, undefined);
        }
    });

    fastify.post('/resend', async (request, reply) => {
        if (!env.RESEND_WEBHOOK_SECRET) {
            logger.error('[email] RESEND_WEBHOOK_SECRET is not set — refusing webhook');
            return reply.status(503).send({ error: 'webhook not configured' });
        }

        const rawBody = (request as unknown as { rawBody: string }).rawBody ?? '';
        const headers = request.headers as Record<string, string | undefined>;

        const ok = verifyResendSignature({
            rawBody,
            secret: env.RESEND_WEBHOOK_SECRET,
            id: headers['svix-id'],
            timestamp: headers['svix-timestamp'],
            signature: headers['svix-signature'],
        });
        if (!ok) return reply.status(401).send({ error: 'invalid signature' });

        const event = request.body as ResendEvent;
        const type = event.type ?? '';
        const recipients = Array.isArray(event.data?.to)
            ? event.data!.to as string[]
            : event.data?.to
              ? [event.data.to as string]
              : [];

        if (recipients.length === 0) {
            return reply.status(200).send({ status: 'skipped - no recipient' });
        }

        // Idempotency: Resend retries, and svix-id is stable across retries.
        const svixId = headers['svix-id'];
        if (svixId) {
            const redis = getRedisClient();
            const set = await redis.set(`resend_event:${svixId}`, '1', 'EX', 86400, 'NX');
            if (!set) return reply.status(200).send({ status: 'duplicate' });
        }

        if (type === 'email.bounced') {
            // Only PERMANENT failures suppress. A soft bounce (full mailbox,
            // greylisting, transient DNS) must stay sendable — suppressing on one
            // would lock a user out of their own signup over a temporary blip.
            const bounceType = (event.data?.bounce?.type ?? '').toLowerCase();
            const isPermanent = bounceType === 'permanent' || bounceType === 'hard';
            if (!isPermanent) {
                logger.warn(`[email] soft bounce for ${recipients.join(', ')} — not suppressing (type: ${bounceType || 'unknown'})`);
                return reply.status(200).send({ status: 'soft bounce - ignored' });
            }
            for (const to of recipients) {
                await suppress({
                    email: to,
                    reason: 'hard_bounce',
                    detail: event.data?.bounce?.message ?? event.data?.bounce?.subType,
                });
            }
            return reply.status(200).send({ status: 'suppressed', reason: 'hard_bounce' });
        }

        if (type === 'email.complained') {
            // A spam complaint is an explicit "stop", and it costs far more
            // reputation than a bounce. Always suppress.
            for (const to of recipients) {
                await suppress({ email: to, reason: 'complaint' });
            }
            return reply.status(200).send({ status: 'suppressed', reason: 'complaint' });
        }

        // delivered / opened / clicked / sent — acknowledged, nothing to do.
        return reply.status(200).send({ status: 'ignored', type });
    });
};

export default emailWebhooks;
