import { FastifyInstance } from 'fastify';
import alumniRoutes from './alumni.routes.js';

export async function alumniModule(app: FastifyInstance) {
    app.register(alumniRoutes, { prefix: '/api/v1/alumni' });
}
