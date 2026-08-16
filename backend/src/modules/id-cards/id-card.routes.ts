// @ts-nocheck
import { FastifyPluginAsync } from 'fastify';
// @ts-nocheck
import { createIdCardService } from './id-card.service.js';
import { getTenantPrisma } from '../../lib/prisma-tenant.js';
import { logAudit } from '../../utils/audit.js';
import { getPresignedDownloadUrl } from '../../config/minio.js';

function getService(request) {
    if (request.institutionId) {
        return createIdCardService(getTenantPrisma(request.institutionId));
    }
    return createIdCardService();
}
import { generateIdCardSchema, generateBulkIdCardsSchema, idCardQuerySchema, printIdCardsSchema, } from '@vidyaverse/shared-validation';
const idCardRoutes = async (fastify) => {
    // All routes require authentication
    fastify.addHook('onRequest', fastify.authenticate);
    /**
     * Generate ID card for a single student
     */
    fastify.post('/generate', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin', 'teacher'])],
        handler: async (request, reply) => {
            const institutionId = request.institutionId;
            const { studentId, templateId } = request.body;
            const result = await getService(request).generateForStudent(institutionId, studentId, templateId);
            return reply.status(201).send({
                success: true,
                data: result,
            });
        },
    });
    /**
     * Generate ID cards in bulk
     */
    fastify.post('/generate-bulk', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin'])],
        handler: async (request, reply) => {
            const institutionId = request.institutionId;
            const { classId, streamId, sectionId, templateId } = request.body as any;
            const results = await getService(request).generateBulk(institutionId, templateId, classId, streamId, sectionId);
            return reply.status(201).send({
                success: true,
                data: results,
            });
        },
    });
    /**
     * List ID cards
     */
    fastify.get('/', {
        preHandler: [fastify.requireInstitution],
        handler: async (request) => {
            const institutionId = request.institutionId;
            const query = idCardQuerySchema.parse(request.query);
            const result = await getService(request).list(institutionId, query);
            return {
                success: true,
                data: result.idCards,
                pagination: result.pagination,
            };
        },
    });
    /**
     * Get ID card by ID
     */
    fastify.get('/:id', {
        preHandler: [fastify.requireInstitution],
        handler: async (request) => {
            const { id } = request.params;
            const institutionId = request.institutionId;
            const idCard = await getService(request).getById(id, institutionId);
            return {
                success: true,
                data: idCard,
            };
        },
    });
    /**
     * Update an ID card (status / validity)
     */
    fastify.patch('/:id', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin', 'teacher'])],
        handler: async (request, reply) => {
            const { id } = request.params as any;
            const institutionId = request.institutionId;
            const result = await getService(request).update(id, institutionId, request.body as any);
            return reply.send({ success: true, data: result });
        },
    });
    /**
     * Delete an ID card
     */
    fastify.delete('/:id', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin'])],
        handler: async (request, reply) => {
            const { id } = request.params as any;
            const institutionId = request.institutionId;
            const result = await getService(request).remove(id, institutionId);
            return reply.send({ success: true, data: result });
        },
    });
    /**
     * Print multiple ID cards
     */
    fastify.post('/print', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin', 'teacher'])],
        handler: async (request) => {
            const institutionId = request.institutionId;
            const input = request.body;
            const result = await getService(request).print(institutionId, input);
            return {
                success: true,
                data: result,
            };
        },
    });
    /**
     * Download ID card PDF
     */
    fastify.get('/:id/download', {
        config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
        preHandler: [fastify.requireInstitution],
        handler: async (request: any, reply) => {
            const { id } = request.params;
            const institutionId = request.institutionId;
            const idCard = await getService(request).getById(id, institutionId);

            let downloadUrl = idCard.pdfUrl;
            if (idCard.pdfObjectPath) {
                downloadUrl = await getPresignedDownloadUrl(idCard.pdfObjectPath, `id-card-${idCard.student?.admissionNumber || id}.pdf`);
            }

            if (!downloadUrl) {
                return reply.status(404).send({
                    success: false,
                    error: 'PDF not available',
                });
            }

            logAudit({
                action: 'Downloaded ID Card',
                userId: request.user?.id,
                institutionId,
                entityType: 'idCard',
                entityId: id,
                ipAddress: request.ip,
                userAgent: request.headers['user-agent'],
            });

            return {
                success: true,
                url: downloadUrl,
            };
        },
    });
    /**
     * Get batch generation status
     */
    fastify.get('/batches/:batchId', {
        preHandler: [fastify.requireInstitution],
        handler: async (request: any) => {
            const { batchId } = request.params;
            const institutionId = request.institutionId;
            const batch = await getService(request).getBatchStatus(batchId, institutionId);
            return {
                success: true,
                data: batch,
            };
        },
    });
};
export default idCardRoutes;
