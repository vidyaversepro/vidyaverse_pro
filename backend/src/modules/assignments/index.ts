import { FastifyInstance } from 'fastify';
import assignmentsRoutes from './assignments.routes.js';

export async function assignmentsModule(app: FastifyInstance) {
    app.register(assignmentsRoutes, { prefix: '/api/v1/assignments' });
}
