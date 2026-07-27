import { FastifyInstance } from 'fastify';
import admissionsRoutes from './admissions.routes.js';

export async function admissionsModule(app: FastifyInstance) {
    app.register(admissionsRoutes, { prefix: '/api/v1/admissions' });
}
