import { FastifyInstance } from 'fastify';
import taxonomyRoutes from './routes.js';
import { isTaxonomyConfigured } from './client.js';
import { logger } from '../../utils/logger.js';

export async function taxonomyModule(app: FastifyInstance) {
    // Postgres-backed and opt-in, same as entitlements: without TAXONOMY_DATABASE_URL
    // these routes are simply not registered, so existing environments boot unchanged.
    if (isTaxonomyConfigured()) {
        app.register(taxonomyRoutes, { prefix: '/api/v1/taxonomy' });
        logger.info('[taxonomy] taxonomy API registered (Postgres)');
    } else {
        logger.info('[taxonomy] taxonomy API not registered — TAXONOMY_DATABASE_URL unset');
    }
}
