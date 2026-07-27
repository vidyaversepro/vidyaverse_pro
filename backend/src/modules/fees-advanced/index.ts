import { FastifyInstance } from 'fastify';
import feesAdvancedRoutes from './fees-advanced.routes.js';

export async function feesAdvancedModule(app: FastifyInstance) {
    app.register(feesAdvancedRoutes, { prefix: '/api/v1/fees-advanced' });
}
