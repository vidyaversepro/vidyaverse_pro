import { FastifyInstance } from 'fastify';
import { routes } from './routes.js';

export async function groupPhotoModule(app: FastifyInstance) {
    app.register(routes, { prefix: '/api/v1/group-photo' });
}
