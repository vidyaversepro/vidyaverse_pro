// @ts-nocheck
import { FastifyPluginAsync } from 'fastify';
// @ts-nocheck
import { createCertificateService } from './certificate.service.js';
import { getTenantPrisma } from '../../lib/prisma-tenant.js';
function getService(request) {
    if (request.institutionId) {
        return createCertificateService(getTenantPrisma(request.institutionId));
    }
    return createCertificateService();
}
import { createCertificateSchema, generateBulkCertificatesSchema, certificateQuerySchema, } from '@vidyaverse/shared-validation';
const certificateRoutes: FastifyPluginAsync = async (fastify) => {
    /**
     * Public endpoint: Verify certificate
     */
    fastify.get('/verify/:certificateNo', {
        handler: async (request) => {
            const { certificateNo } = request.params;
            const result = await getService(request).verify(certificateNo);
            return result;
        },
    });
    // Protected routes - require authentication
    fastify.register(async (protectedRoutes) => {
        protectedRoutes.addHook('onRequest', fastify.authenticate);
        /**
         * Create/generate certificate for a student
         */
        protectedRoutes.post('/', {
            preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin', 'teacher'])],
            handler: async (request, reply) => {
                const institutionId = request.institutionId;
                const data = request.body;
                const result = await getService(request).create(institutionId, data);
                return reply.status(201).send({
                    success: true,
                    data: result,
                });
            },
        });
        /**
         * Generate certificates in bulk
         */
        protectedRoutes.post('/bulk', {
            preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin'])],
            handler: async (request, reply) => {
                const institutionId = request.institutionId;
                const data = request.body;
                const results = await getService(request).generateBulk(institutionId, data);
                return reply.status(201).send({
                    success: true,
                    data: results,
                });
            },
        });
        /**
         * List certificates
         */
        protectedRoutes.get('/', {
            preHandler: [fastify.requireInstitution],
            handler: async (request) => {
                const institutionId = request.institutionId;
                const query = request.query;
                const result = await getService(request).list(institutionId, query);
                return {
                    success: true,
                    data: result.certificates,
                    pagination: result.pagination,
                };
            },
        });
        /**
         * Get certificate by ID
         */
        protectedRoutes.get('/:id', {
            preHandler: [fastify.requireInstitution],
            handler: async (request) => {
                const { id } = request.params;
                const institutionId = request.institutionId;
                const certificate = await getService(request).getById(id, institutionId);
                return {
                    success: true,
                    data: certificate,
                };
            },
        });
        /**
         * Download certificate PDF
         */
        protectedRoutes.get('/:id/download', {
            preHandler: [fastify.requireInstitution],
            handler: async (request, reply) => {
                const { id } = request.params;
                const institutionId = request.institutionId;
                const certificate = await getService(request).getById(id, institutionId);
                if (!certificate.pdfUrl) {
                    return reply.status(404).send({
                        success: false,
                        error: 'PDF not available',
                    });
                }
                return reply.redirect(certificate.pdfUrl);
            },
        });
    });
};
export default certificateRoutes;
