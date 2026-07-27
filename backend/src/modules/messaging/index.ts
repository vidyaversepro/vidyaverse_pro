import { FastifyInstance } from 'fastify';
import messagingRoutes from './messaging.routes.js';

export async function messagingModule(app: FastifyInstance) {
    app.register(messagingRoutes, { prefix: '/api/v1/messaging' });
}
