import { FastifyInstance } from 'fastify';
import financeRoutes from './finance.routes.js';

export async function financeModule(app: FastifyInstance) {
    app.register(financeRoutes, { prefix: '/api/v1/finance' });
}
