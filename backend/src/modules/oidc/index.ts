import { FastifyInstance } from 'fastify';
import oauthPublicRoutes from './oauth-public.routes.js';

export async function oidcModule(app: FastifyInstance) {
    app.register(oauthPublicRoutes, { prefix: '/api/v1/oauth' });
}
