import { FastifyInstance } from 'fastify';
import visitorRoutes from './visitor.routes.js';

export async function visitorModule(app: FastifyInstance) {
    app.register(visitorRoutes, { prefix: '/api/v1/visitor' });
}
