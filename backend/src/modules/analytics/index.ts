import { FastifyInstance } from 'fastify';
import analyticsRoutes from './analytics.routes.js';

export { analyticsService } from './analytics.service.js';

export async function analyticsModule(app: FastifyInstance) {
    app.register(analyticsRoutes, { prefix: '/api/v1/analytics' });
}
