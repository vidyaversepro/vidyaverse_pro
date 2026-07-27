import { FastifyInstance } from 'fastify';
import adminRoutes from './admin.routes.js';
import oauthClientsRoutes from '../oidc/oauth-clients.routes.js';
import usersExportRoutes from './users-export.routes.js';

export async function adminModule(app: FastifyInstance) {
    app.register(adminRoutes, { prefix: '/api/v1/admin' });
    app.register(oauthClientsRoutes, { prefix: '/api/v1/admin/oauth-clients' });
    app.register(usersExportRoutes, { prefix: '/api/v1/admin/users/export' });
}
