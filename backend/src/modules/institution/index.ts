import { FastifyInstance } from 'fastify';
import { routes } from './routes.js';

export async function institutionModule(app: FastifyInstance) {
    app.register(routes, { prefix: '/api/v1/institution' });
}
