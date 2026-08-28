// @ts-nocheck
import { FastifyPluginAsync } from 'fastify';
import { createPortfolioService } from './portfolio.service.js';
import { getTenantPrisma } from '../../lib/prisma-tenant.js';
function getService(request) {
    if (request.institutionId) {
        return createPortfolioService(getTenantPrisma(request.institutionId));
    }
    return createPortfolioService();
}
import { portfolioCreateSchema, portfolioUpdateSchema, portfolioSectionCreateSchema, portfolioSectionUpdateSchema, portfolioQuerySchema, generateStaticSiteSchema, } from '@vidyaverse/shared-validation';
const portfolioRoutes: FastifyPluginAsync = async (fastify) => {
    // Public endpoint - view portfolio by slug
    fastify.get('/public/:slug', {
        handler: async (request) => {
            const { slug } = request.params;
            const portfolio = await getService(request).getBySlug(slug);
            return { success: true, data: portfolio };
        },
    });
    // Protected routes
    fastify.register(async (protectedFastify) => {
        protectedFastify.addHook('onRequest', fastify.authenticate);
        /**
         * Create portfolio
         */
        protectedFastify.post('/', {
            preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin', 'teacher'])],
            handler: async (request, reply) => {
                const institutionId = request.institutionId;
                const data = request.body;
                const portfolio = await getService(request).create(institutionId, data);
                return reply.status(201).send({ success: true, data: portfolio });
            },
        });
        /**
         * List portfolios
         */
        protectedFastify.get('/', {
            preHandler: [fastify.requireInstitution],
            handler: async (request) => {
                const institutionId = request.institutionId;
                const query = request.query;
                const result = await getService(request).list(institutionId, query);
                return { success: true, data: result.portfolios, pagination: result.pagination };
            },
        });
        /**
         * Get portfolio by ID
         */
        protectedFastify.get('/:id', {
            preHandler: [fastify.requireInstitution],
            handler: async (request) => {
                const { id } = request.params;
                const institutionId = request.institutionId;
                const portfolio = await getService(request).getById(id, institutionId);
                return { success: true, data: portfolio };
            },
        });
        /**
         * Update portfolio
         */
        protectedFastify.patch('/:id', {
            preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin', 'teacher'])],
            handler: async (request) => {
                const { id } = request.params;
                const institutionId = request.institutionId;
                const data = request.body;
                const portfolio = await getService(request).update(id, institutionId, data);
                return { success: true, data: portfolio };
            },
        });
        /**
         * Delete portfolio
         */
        protectedFastify.delete('/:id', {
            preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin'])],
            handler: async (request) => {
                const { id } = request.params;
                const institutionId = request.institutionId;
                await getService(request).delete(id, institutionId);
                return { success: true, message: 'Portfolio deleted' };
            },
        });
        /**
         * Publish portfolio
         */
        protectedFastify.post('/:id/publish', {
            preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin', 'teacher'])],
            handler: async (request) => {
                const { id } = request.params;
                const institutionId = request.institutionId;
                const portfolio = await getService(request).publish(id, institutionId);
                return { success: true, data: portfolio };
            },
        });
        /**
         * Unpublish portfolio
         */
        protectedFastify.post('/:id/unpublish', {
            preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin', 'teacher'])],
            handler: async (request) => {
                const { id } = request.params;
                const institutionId = request.institutionId;
                const portfolio = await getService(request).unpublish(id, institutionId);
                return { success: true, data: portfolio };
            },
        });
        /**
         * Generate static site
         */
        protectedFastify.post('/generate-static', {
            preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin'])],
            handler: async (request) => {
                const institutionId = request.institutionId;
                const data = request.body;
                const result = await getService(request).generateStaticSite(institutionId, data);
                return { success: true, data: result };
            },
        });
        // ========================================================================
        // SECTION ENDPOINTS
        // ========================================================================
        /**
         * Create section
         */
        protectedFastify.post('/sections', {
            preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin', 'teacher'])],
            handler: async (request, reply) => {
                const institutionId = request.institutionId;
                const data = request.body;
                const section = await getService(request).createSection(institutionId, data);
                return reply.status(201).send({ success: true, data: section });
            },
        });
        /**
         * Update section
         */
        protectedFastify.patch('/sections/:sectionId', {
            preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin', 'teacher'])],
            handler: async (request) => {
                const { sectionId } = request.params;
                const institutionId = request.institutionId;
                const data = request.body;
                const section = await getService(request).updateSection(sectionId, institutionId, data);
                return { success: true, data: section };
            },
        });
        /**
         * Delete section
         */
        protectedFastify.delete('/sections/:sectionId', {
            preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin', 'teacher'])],
            handler: async (request) => {
                const { sectionId } = request.params;
                const institutionId = request.institutionId;
                await getService(request).deleteSection(sectionId, institutionId);
                return { success: true, message: 'Section deleted' };
            },
        });
        /**
         * Reorder sections
         */
        protectedFastify.post('/:id/reorder-sections', {
            preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin', 'teacher'])],
            handler: async (request) => {
                const { id } = request.params;
                const institutionId = request.institutionId;
                const { sectionIds } = request.body;
                const portfolio = await getService(request).reorderSections(id, institutionId, sectionIds);
                return { success: true, data: portfolio };
            },
        });
    });
};
export default portfolioRoutes;
