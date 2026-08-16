// @ts-nocheck
import { FastifyPluginAsync } from 'fastify';
// @ts-nocheck
import { createTransferCertificateService } from './transfer-certificate.service.js';
import { getTenantPrisma } from '../../lib/prisma-tenant.js';
function getService(request) {
    if (request.institutionId) {
        return createTransferCertificateService(getTenantPrisma(request.institutionId));
    }
    return createTransferCertificateService();
}
import { generateTransferCertificateSchema, bulkGenerateTCsSchema, tcQuerySchema, } from '@vidyaverse/shared-validation';
const transferCertificateRoutes = async (fastify) => {
    // Public verification endpoint (no auth)
    fastify.get('/verify/:tcNumber', {
        handler: async (request) => {
            const { tcNumber } = request.params;
            const result = await getService(request).verify(tcNumber);
            return { success: true, data: result };
        },
    });
    // Protected routes
    fastify.register(async (protectedFastify) => {
        protectedFastify.addHook('onRequest', fastify.authenticate);
        /**
         * Generate single TC
         */
        protectedFastify.post('/generate', {
            preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin'])],
            handler: async (request, reply) => {
                const institutionId = request.institutionId;
                const data = request.body;
                const tc = await getService(request).generate(institutionId, data);
                return reply.status(201).send({ success: true, data: tc });
            },
        });
        /**
         * Bulk generate TCs
         */
        protectedFastify.post('/generate/bulk', {
            preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin'])],
            handler: async (request) => {
                const institutionId = request.institutionId;
                const data = request.body;
                const results = await getService(request).generateBulk(institutionId, data);
                return { success: true, data: results };
            },
        });
        /**
         * List TCs
         */
        protectedFastify.get('/', {
            preHandler: [fastify.requireInstitution],
            handler: async (request) => {
                const institutionId = request.institutionId;
                const query = tcQuerySchema.parse(request.query);
                const result = await getService(request).list(institutionId, query);
                return { success: true, data: result.tcs, pagination: result.pagination };
            },
        });
        /**
         * Get TC by ID
         */
        protectedFastify.get('/:id', {
            preHandler: [fastify.requireInstitution],
            handler: async (request) => {
                const { id } = request.params;
                const institutionId = request.institutionId;
                const tc = await getService(request).getById(id, institutionId);
                return { success: true, data: tc };
            },
        });
        /**
         * Mark TC as issued
         */
        protectedFastify.post('/:id/issue', {
            preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin'])],
            handler: async (request) => {
                const { id } = request.params;
                const institutionId = request.institutionId;
                const tc = await getService(request).markAsIssued(id, institutionId);
                return { success: true, data: tc };
            },
        });
        /**
         * Cancel TC
         */
        protectedFastify.post('/:id/cancel', {
            preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin'])],
            handler: async (request) => {
                const { id } = request.params;
                const institutionId = request.institutionId;
                const { reason } = request.body;
                const tc = await getService(request).cancel(id, institutionId, reason);
                return { success: true, data: tc };
            },
        });
    });
};
export default transferCertificateRoutes;
