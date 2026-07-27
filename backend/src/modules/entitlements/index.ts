import { FastifyInstance } from 'fastify';
import entitlementsRoutes from './entitlements.routes.js';

export async function entitlementsModule(app: FastifyInstance) {
    app.register(entitlementsRoutes, { prefix: '/api/v1/entitlements' });
}
