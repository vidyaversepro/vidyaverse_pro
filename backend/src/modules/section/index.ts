import { FastifyInstance } from 'fastify';
import { routes } from './routes.js';

export async function sectionModule(app: FastifyInstance) {
    app.register(routes, { prefix: '/api/v1/section' });
}
