import { FastifyInstance } from 'fastify';
import healthRoutes from './health.routes.js';

export async function healthModule(app: FastifyInstance) {
    app.register(healthRoutes, { prefix: '/api/v1/health-module' });
}
