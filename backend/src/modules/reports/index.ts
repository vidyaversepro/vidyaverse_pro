import { FastifyInstance } from 'fastify';
import reportsRoutes from './reports.routes.js';

export async function reportsModule(app: FastifyInstance) {
    app.register(reportsRoutes, { prefix: '/api/v1/reports' });
}
