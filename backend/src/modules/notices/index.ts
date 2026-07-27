import { FastifyInstance } from 'fastify';
import noticesRoutes from './notices.routes.js';

export async function noticesModule(app: FastifyInstance) {
    app.register(noticesRoutes, { prefix: '/api/v1/notices' });
}
