import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../../config/database.js';
import { getRedisClient } from '../../config/redis.js';
import { env } from '../../config/env.js';
import { verifyRazorpaySignature } from '../../lib/payments/razorpay.js';
import { paymentsService } from './payments.service.js';

/**
 * Public payment-gateway webhooks. NO auth hook (called by Razorpay/Cashfree).
 * A content-type parser preserves the raw body for HMAC verification; it is
 * encapsulated to this plugin so the rest of the app keeps normal JSON parsing.
 */
const paymentsWebhooks: FastifyPluginAsync = async (fastify) => {
  fastify.addContentTypeParser('application/json', { parseAs: 'string' }, (req, body, done) => {
    (req as unknown as { rawBody: string }).rawBody = typeof body === 'string' ? body : String(body);
    try {
      done(null, body ? JSON.parse(body as string) : {});
    } catch (err) {
      done(err as Error, undefined);
    }
  });

  fastify.post('/razorpay', async (request, reply) => {
    const rawBody = (request as unknown as { rawBody: string }).rawBody ?? '';
    const signature = request.headers['x-razorpay-signature'] as string | undefined;

    if (!verifyRazorpaySignature(rawBody, signature, env.RAZORPAY_WEBHOOK_SECRET)) {
      return reply.status(401).send({ error: 'invalid signature' });
    }

    const payload = request.body as {
      event?: string;
      payload?: { payment?: { entity?: { id: string; order_id?: string; amount: number; method?: string; notes?: Record<string, string> } } };
    };

    if (payload.event === 'payment.captured') {
      const entity = payload.payload?.payment?.entity;
      const invoiceId = entity?.notes?.invoice_id;
      if (!entity || !invoiceId) {
        return reply.status(200).send({ status: 'skipped - no invoice_id' });
      }

      // Idempotency: first writer wins for 24h.
      const redis = getRedisClient();
      const key = `razorpay_event:${entity.id}`;
      const set = await redis.set(key, '1', 'EX', 86400, 'NX');
      if (!set) return reply.status(200).send({ status: 'duplicate' });

      try {
        // Look up institutionId cross-tenant (base client) before scoping.
        const invoice = await prisma.feeInvoice.findUnique({ where: { id: invoiceId }, select: { institutionId: true } });
        if (!invoice) return reply.status(200).send({ status: 'unknown invoice' });

        await paymentsService.markInvoicePaid({
          institutionId: invoice.institutionId,
          invoiceId,
          amount: entity.amount / 100,
          gatewayProvider: 'razorpay',
          gatewayPaymentId: entity.id,
          gatewayOrderId: entity.order_id,
          method: 'upi',
          guardianId: entity.notes?.guardian_id || undefined,
        });
      } catch (err) {
        await redis.del(key); // allow retry
        request.log.error({ err }, '[payments] razorpay webhook processing failed');
        return reply.status(500).send({ error: 'processing error' });
      }
    }

    return reply.status(200).send({ status: 'ok' });
  });

  // Cashfree fallback — normalize to the same markInvoicePaid path (Phase 2b).
  fastify.post('/cashfree', async (_request, reply) => {
    return reply.status(200).send({ status: 'not implemented' });
  });
};

export default paymentsWebhooks;
