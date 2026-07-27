import { FastifyInstance } from 'fastify';
import integrationsRoutes from './integrations.routes.js';

export async function integrationsModule(app: FastifyInstance) {
    app.register(integrationsRoutes, { prefix: '/api/v1/integrations' });
}
