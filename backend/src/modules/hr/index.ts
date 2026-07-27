import { FastifyInstance } from 'fastify';
import hrRoutes from './hr.routes.js';

export async function hrModule(app: FastifyInstance) {
    app.register(hrRoutes, { prefix: '/api/v1/hr' });
}
