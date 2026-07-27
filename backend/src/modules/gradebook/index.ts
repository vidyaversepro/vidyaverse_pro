import { FastifyInstance } from 'fastify';
import gradebookRoutes from './gradebook.routes.js';

export async function gradebookModule(app: FastifyInstance) {
    app.register(gradebookRoutes, { prefix: '/api/v1/gradebook' });
}
