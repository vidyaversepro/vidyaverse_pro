import { FastifyInstance } from 'fastify';
import entitlementsRoutes from './entitlements.routes.js';
import capabilitiesRoutes from './capabilities/routes.js';
import adminSubscriptionRoutes from './capabilities/admin.routes.js';
import { isEntitlementsConfigured } from './capabilities/client.js';
import { logger } from '../../utils/logger.js';

export async function entitlementsModule(app: FastifyInstance) {
    // Institution-scoped ERP module gating for Vidyaverse's own UI. MySQL-backed.
    app.register(entitlementsRoutes, { prefix: '/api/v1/entitlements' });

    // Cross-app resolved capabilities — what the relying parties consume.
    // Postgres-backed and opt-in: without ENTITLEMENTS_DATABASE_URL these routes are
    // simply not registered, so existing environments boot unchanged.
    if (isEntitlementsConfigured()) {
        app.register(capabilitiesRoutes, { prefix: '/api/v1/entitlements' });
        app.register(adminSubscriptionRoutes, { prefix: '/api/v1/entitlements/admin' });
        logger.info('[entitlements] capability API registered (Postgres)');
    } else {
        logger.info('[entitlements] capability API not registered — ENTITLEMENTS_DATABASE_URL unset');
    }
}
