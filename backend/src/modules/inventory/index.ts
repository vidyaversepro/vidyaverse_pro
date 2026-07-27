import { FastifyInstance } from 'fastify';
import inventoryRoutes from './inventory.routes.js';

export async function inventoryModule(app: FastifyInstance) {
    app.register(inventoryRoutes, { prefix: '/api/v1/inventory' });
}
