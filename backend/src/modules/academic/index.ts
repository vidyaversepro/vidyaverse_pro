import { FastifyInstance } from 'fastify';
import academicRoutes from './routes.js';
import { logger } from '../../utils/logger.js';

export async function academicModule(app: FastifyInstance) {
    // Cross-app Class/Section resolution — what relying parties consume to learn a
    // student's grade level. Reads the main ERP tables directly (no opt-in gate,
    // unlike entitlements' separate Postgres datasource — there is only one source
    // of truth here and it is always configured).
    app.register(academicRoutes, { prefix: '/api/v1/academic' });
    logger.info('[academic] profile API registered');
}
