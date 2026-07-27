import { FastifyInstance } from 'fastify';
import inboundRoutes from './inbound.routes.js';
import inboundWebhooks from './inbound.webhooks.js';

export async function inboundModule(app: FastifyInstance) {
    // Authenticated admin routes (conversations, fee-payment claims review)
    app.register(inboundRoutes, { prefix: '/api/v1/inbound' });
    // Public WhatsApp inbound webhook (separate plugin => no auth, raw-body HMAC)
    app.register(inboundWebhooks, { prefix: '/api/v1/inbound/webhooks' });
}
