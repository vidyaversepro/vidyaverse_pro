// @ts-nocheck
import { FastifyPluginAsync } from 'fastify';
import { createGroupPhotoService } from './group-photo.service.js';
import { getTenantPrisma } from '../../lib/prisma-tenant.js';
function getService(request) {
    if (request.institutionId) {
        return createGroupPhotoService(getTenantPrisma(request.institutionId));
    }
    return createGroupPhotoService();
}
import { uploadGroupPhotoSchema, groupPhotoQuerySchema, extractFacesSchema, matchStudentsSchema, faceExtractionUpdateSchema, } from '@vidyaverse/shared-validation';
const groupPhotoRoutes = async (fastify) => {
    // All routes require authentication
    fastify.addHook('onRequest', fastify.authenticate);
    /**
     * Upload group photo
     */
    fastify.post('/', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin', 'teacher'])],
        handler: async (request, reply) => {
            const institutionId = request.institutionId;
            const data = await request.file();
            if (!data) {
                return reply.status(400).send({
                    success: false,
                    error: { message: 'No file uploaded' },
                });
            }
            // Parse metadata from fields
            const metadata = {};
            for (const [key, value] of Object.entries(data.fields)) {
                if (typeof value === 'object' && value !== null && 'value' in value) {
                    metadata[key] = value.value;
                }
                else if (typeof value === 'string') {
                    metadata[key] = value;
                }
            }
            // Validate metadata
            const validatedData = uploadGroupPhotoSchema.parse(metadata);
            // Get file buffer
            const buffer = await data.toBuffer();
            const result = await getService(request).upload(institutionId, validatedData, {
                buffer,
                filename: data.filename,
                mimetype: data.mimetype,
            });
            return reply.status(201).send({
                success: true,
                data: result,
            });
        },
    });
    /**
     * List group photos
     */
    fastify.get('/', {
        preHandler: [fastify.requireInstitution],
        handler: async (request) => {
            const institutionId = request.institutionId;
            const query = groupPhotoQuerySchema.parse(request.query);
            const result = await getService(request).list(institutionId, query);
            return {
                success: true,
                data: result.photos,
                pagination: result.pagination,
            };
        },
    });
    /**
     * Get group photo by ID
     */
    fastify.get('/:id', {
        preHandler: [fastify.requireInstitution],
        handler: async (request) => {
            const { id } = request.params;
            const institutionId = request.institutionId;
            const photo = await getService(request).getById(id, institutionId);
            return {
                success: true,
                data: photo,
            };
        },
    });
    /**
     * Delete group photo
     */
    fastify.delete('/:id', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin'])],
        handler: async (request) => {
            const { id } = request.params;
            const institutionId = request.institutionId;
            await getService(request).delete(id, institutionId);
            return {
                success: true,
                message: 'Group photo deleted',
            };
        },
    });
    /**
     * Start face extraction
     */
    fastify.post('/:id/extract-faces', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin', 'teacher'])],
        handler: async (request, reply) => {
            const { id } = request.params;
            const institutionId = request.institutionId;
            const options = request.body;
            const result = await getService(request).extractFaces(id, institutionId, options);
            return reply.status(202).send({
                success: true,
                data: result,
            });
        },
    });
    /**
     * Match extracted faces with students
     */
    fastify.post('/:id/match-students', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin', 'teacher'])],
        handler: async (request) => {
            const { id } = request.params;
            const institutionId = request.institutionId;
            const options = request.body;
            const result = await getService(request).matchStudents(id, institutionId, options);
            return {
                success: true,
                data: result,
            };
        },
    });
    /**
     * Update face extraction (manual match/reject)
     */
    fastify.patch('/extractions/:extractionId', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin', 'teacher'])],
        handler: async (request) => {
            const { extractionId } = request.params;
            const institutionId = request.institutionId;
            const data = request.body;
            const extraction = await getService(request).updateExtraction(extractionId, institutionId, data);
            return {
                success: true,
                data: extraction,
            };
        },
    });
    /**
     * Get statistics for a group photo
     */
    fastify.get('/:id/stats', {
        preHandler: [fastify.requireInstitution],
        handler: async (request) => {
            const { id } = request.params;
            const institutionId = request.institutionId;
            const stats = await getService(request).getStats(id, institutionId);
            return {
                success: true,
                data: stats,
            };
        },
    });
};
export default groupPhotoRoutes;
