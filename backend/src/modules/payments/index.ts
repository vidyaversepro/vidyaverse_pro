import { FastifyInstance } from 'fastify';
import paymentsRoutes from './payments.routes.js';
import paymentsWebhooks from './payments.webhooks.js';

export async function paymentsModule(app: FastifyInstance) {
    // Authenticated admin routes
    app.register(paymentsRoutes, { prefix: '/api/v1/payments' });
    // Public gateway webhooks (separate plugin => no auth hook, raw-body parsing)
    app.register(paymentsWebhooks, { prefix: '/api/v1/payments/webhooks' });
}
