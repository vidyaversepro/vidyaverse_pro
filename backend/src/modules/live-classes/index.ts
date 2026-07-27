import { FastifyInstance } from 'fastify';
import liveClassesRoutes from './live-classes.routes.js';

export async function liveClassesModule(app: FastifyInstance) {
    app.register(liveClassesRoutes, { prefix: '/api/v1/live-classes' });
}
