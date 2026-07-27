import { FastifyInstance } from 'fastify';
import placementRoutes from './placement.routes.js';

export async function placementModule(app: FastifyInstance) {
    app.register(placementRoutes, { prefix: '/api/v1/placement' });
}
