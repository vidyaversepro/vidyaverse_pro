import { FastifyInstance } from 'fastify';
import mobileAppRoutes from './mobile-app.routes.js';

export async function mobileAppModule(app: FastifyInstance) {
    app.register(mobileAppRoutes, { prefix: '/api/v1/mobile-app' });
}
