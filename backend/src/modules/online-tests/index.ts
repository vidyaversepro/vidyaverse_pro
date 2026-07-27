import { FastifyInstance } from 'fastify';
import onlineTestsRoutes from './online-tests.routes.js';

export async function onlineTestsModule(app: FastifyInstance) {
    app.register(onlineTestsRoutes, { prefix: '/api/v1/online-tests' });
}
