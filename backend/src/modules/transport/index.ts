import { FastifyInstance } from 'fastify';
import transportRoutes from './transport.routes.js';

export async function transportModule(app: FastifyInstance) {
    app.register(transportRoutes, { prefix: '/api/v1/transport' });
}
