import { FastifyRequest, FastifyReply } from 'fastify';
import { createStudentService } from './service.js';
import { getTenantPrisma } from '../../lib/prisma-tenant.js';

function getService(request: FastifyRequest) {
    if (request.institutionId) {
        return createStudentService(getTenantPrisma(request.institutionId));
    }
    return createStudentService();
}
import { NotFoundError } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';

// DataStatus type will be available after prisma generate
type DataStatus = 'pending' | 'filled' | 'enhanced' | 'submitted' | 'approved' | 'rejected';

export const controller = {
    async list(request: FastifyRequest, reply: FastifyReply) {
        const query = request.query as Record<string, string>;
        const result = await getService(request).findAll({
            page: Number(query.page),
            limit: Number(query.limit),
            search: query.search,
            institutionId: query.institutionId || request.institutionId || undefined,
            branchId: query.branchId,
            sectionId: query.sectionId,
            classId: query.classId,
            streamId: query.streamId,
            status: query.status,
            dataStatus: query.dataStatus,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder as 'asc' | 'desc' | undefined,
        });
        return reply.send({ success: true, ...result });
    },

    async getAdmissionSlots(request: FastifyRequest, reply: FastifyReply) {
        const { sectionId } = request.params as { sectionId: string };
        const query = request.query as Record<string, string>;

        const data = await getService(request).getAdmissionSlots(sectionId, {
            page: query.page ? Number(query.page) : undefined,
            limit: query.limit ? Number(query.limit) : undefined,
            status: query.status,
            search: query.search,
        });
        return reply.send({ success: true, ...data });
    },

    async create(request: FastifyRequest, reply: FastifyReply) {
        const body = request.body as any;
        const data = await getService(request).create(body, request.user?.userId);
        return reply.status(201).send({ success: true, data });
    },

    async createBulk(request: FastifyRequest, reply: FastifyReply) {
        const body = request.body as any[];
        const result = await getService(request).createBulk(body);
        return reply.status(201).send({ success: true, ...result });
    },

    async getApprovalQueue(request: FastifyRequest, reply: FastifyReply) {
        const query = request.query as Record<string, string>;
        const data = await getService(request).getApprovalQueue({
            institutionId: request.institutionId || query.institutionId,
            sectionId: query.sectionId,
            productId: query.productId || 'id_card'
        });
        return reply.send({ success: true, data });
    },

    async getOne(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const data = await getService(request).findById(id);
        if (!data) throw new NotFoundError('Student not found');
        return reply.send({ success: true, data });
    },

    async update(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const body = request.body as Record<string, any>;
        const data = await getService(request).update(id, body);
        return reply.send({ success: true, data });
    },

    async saveTab(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id } = request.params as { id: string };
            const body = request.body as { tab: any, data: any };
            logger.info(`[save-tab] Incoming request for student ${id}, tab: ${body.tab}`, body.data);
            const data = await getService(request).saveTab(id, body.tab, body.data, request.institutionId || undefined, request.userRole || undefined);
            return reply.send({ success: true, data });
        } catch (error: any) {
            console.error(`[save-tab ERROR]`, error.stack || error);
            const statusCode = error.statusCode || (error.name === 'ZodError' ? 400 : 500);
            return reply.status(statusCode).send({
                success: false,
                message: error.message || 'Internal Server Error',
                errors: error.errors || undefined
            });
        }
    },

    async uploadPhoto(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };

        try {
            const data = await (request as import('fastify').FastifyRequest & { file: () => Promise<any> }).file();
            if (!data) {
                return reply.status(400).send({ success: false, code: 'INVALID_FORMAT', message: 'No photo provided' });
            }

            const buffer = await data.toBuffer();
            const result = await getService(request).uploadPhoto(id, buffer, request.institutionId || undefined, request.userRole || undefined);

            return reply.send({ success: true, data: result });
        } catch (error: any) {
            if (error.code === 'FST_REQ_FILE_TOO_LARGE') {
                return reply.status(400).send({ success: false, code: 'PHOTO_TOO_LARGE', message: 'File size exceeds 5MB limit' });
            }
            if (error.message && (error.message.includes('format') || error.message.includes('Invalid'))) {
                return reply.status(400).send({ success: false, code: 'INVALID_FORMAT', message: error.message });
            }
            return reply.status(500).send({ success: false, code: 'UPLOAD_FAILED', message: error.message || 'Internal server error' });
        }
    },

    // PUBLIC ONBOARDING CONTROLLERS
    async getByToken(request: FastifyRequest, reply: FastifyReply) {
        const { token } = request.params as { token: string };
        const data = await getService(request).findByToken(token);
        return reply.send({ success: true, data });
    },

    async saveTabByToken(request: FastifyRequest, reply: FastifyReply) {
        const { token } = request.params as { token: string };
        const body = request.body as { tab: string, data: any };
        const data = await getService(request).saveTabByToken(token, body.tab, body.data);
        return reply.send({ success: true, data });
    },

    async uploadPhotoByToken(request: FastifyRequest, reply: FastifyReply) {
        const { token } = request.params as { token: string };
        try {
            const data = await (request as import('fastify').FastifyRequest & { file: () => Promise<any> }).file();
            if (!data) {
                return reply.status(400).send({ success: false, code: 'INVALID_FORMAT', message: 'No photo provided' });
            }

            const buffer = await data.toBuffer();
            const result = await getService(request).uploadPhotoByToken(token, buffer);
            return reply.send({ success: true, data: result });
        } catch (error: any) {
            if (error.code === 'FST_REQ_FILE_TOO_LARGE') {
                return reply.status(400).send({ success: false, code: 'PHOTO_TOO_LARGE', message: 'File size exceeds 5MB limit' });
            }
            if (error.message && (error.message.includes('format') || error.message.includes('Invalid'))) {
                return reply.status(400).send({ success: false, code: 'INVALID_FORMAT', message: error.message });
            }
            return reply.status(500).send({ success: false, code: 'UPLOAD_FAILED', message: error.message || 'Internal server error' });
        }
    },

    async updateDataStatus(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const { dataStatus } = request.body as { dataStatus: DataStatus };
        const data = await getService(request).updateDataStatus(id, dataStatus, request.user?.userId);
        return reply.send({ success: true, data });
    },

    async delete(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        await getService(request).delete(id, request.user?.userId);
        return reply.send({ success: true, message: 'Student deleted' });
    },

    async bulkDelete(request: FastifyRequest, reply: FastifyReply) {
        const { ids } = request.body as { ids: string[] };
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return reply.status(400).send({ success: false, message: 'ids array is required' });
        }
        const result = await getService(request).bulkDelete(ids, request.user?.userId);
        return reply.send({ success: true, ...result });
    },

    async countsBySection(request: FastifyRequest, reply: FastifyReply) {
        const query = request.query as Record<string, string>;
        const institutionId = query.institutionId || request.institutionId;
        if (!institutionId) {
            return reply.status(400).send({ success: false, message: 'institutionId is required' });
        }
        const data = await getService(request).getStudentCountsBySection(institutionId);
        return reply.send({ success: true, data });
    },

    async generateForms(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { sectionId } = request.params as { sectionId: string };
            const institutionId = request.institutionId;

            if (!institutionId) {
                return reply.status(400).send({ success: false, message: 'institutionId is required' });
            }

            const data = await getService(request).generateSectionForms(sectionId, institutionId);
            return reply.send({ success: true, data });
        } catch (error: any) {
            logger.error(`[generateForms ERROR] ${error.message}`, error.stack || error);
            const statusCode = error.statusCode || 500;
            return reply.status(statusCode).send({
                success: false,
                message: error.message || 'Internal Server Error'
            });
        }
    },

    async uploadCsvBulk(request: FastifyRequest, reply: FastifyReply) {
        // Fastify multipart upload
        const data = await (request as any).file();
        if (!data) {
            return reply.status(400).send({ success: false, message: 'No file uploaded' });
        }

        const institutionId = typeof data.fields.institutionId === 'object' && 'value' in data.fields.institutionId ? String(data.fields.institutionId.value) : (request.user as any)?.institutionId || (request as any).institutionId;
        const sectionId = typeof data.fields.sectionId === 'object' && 'value' in data.fields.sectionId ? String(data.fields.sectionId.value) : undefined;

        if (!institutionId) {
            return reply.status(400).send({ success: false, message: 'institutionId is required' });
        }

        if (!sectionId) {
            return reply.status(400).send({ success: false, message: 'sectionId is required' });
        }

        const jobExecutionId = await getService(request).enqueueCsvImportJob({
            institutionId,
            sectionId,
            file: data,
            initiatedBy: request.user?.userId
        });

        return reply.status(202).send({
            success: true,
            message: 'CSV uploaded and processing has started. You can track progress using the job ID.',
            jobExecutionId
        });
    },

    async uploadPhotoZipBulk(request: FastifyRequest, reply: FastifyReply) {
        // Fastify multipart upload
        const data = await (request as any).file();
        if (!data) {
            return reply.status(400).send({ success: false, message: 'No file uploaded' });
        }

        const institutionId = typeof data.fields.institutionId === 'object' && 'value' in data.fields.institutionId ? String(data.fields.institutionId.value) : (request.user as any)?.institutionId || (request as any).institutionId;

        if (!institutionId) {
            return reply.status(400).send({ success: false, message: 'institutionId is required' });
        }

        const jobExecutionId = await getService(request).enqueuePhotoZipImportJob({
            institutionId,
            file: data,
            initiatedBy: request.user?.userId
        });

        return reply.status(202).send({
            success: true,
            message: 'ZIP uploaded and processing has started. You can track progress using the job ID.',
            jobExecutionId
        });
    },

    async getImportProgress(request: FastifyRequest, reply: FastifyReply) {
        const { jobExecutionId } = request.params as { jobExecutionId: string };

        const progress = await getService(request).getImportProgress(jobExecutionId, (request.user as any)?.institutionId || (request as any).institutionId);

        return reply.send({ success: true, data: progress });
    },

    async exportCsv(request: FastifyRequest, reply: FastifyReply) {
        const query = request.query as { sectionId?: string; columns?: string; institutionId?: string };
        const institutionId = query.institutionId || (request.user as any)?.institutionId || (request as any).institutionId;

        if (!institutionId) {
            return reply.status(400).send({ success: false, message: 'institutionId is required' });
        }

        const columns = query.columns ? query.columns.split(',') : [
            'admissionNumber', 'name', 'sex', 'dob', 'contact', 'status', 'academicYear'
        ];

        try {
            const rows = await getService(request).exportStudents({
                institutionId,
                sectionId: query.sectionId,
                columns
            });

            // Convert string[][] to CSV payload
            const csvContent = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

            reply.header('Content-Type', 'text/csv');
            reply.header('Content-Disposition', `attachment; filename="students_export_${Date.now()}.csv"`);

            return reply.send(csvContent);
        } catch (error: any) {
            logger.error(`Export failed: ${error}`);
            return reply.status(400).send({ success: false, message: error.message || 'Export failed' });
        }
    },

    async getAuditLog(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const query = request.query as Record<string, string>;
        const data = await getService(request).getStudentAuditLog(id, {
            page: query.page ? Number(query.page) : undefined,
            limit: query.limit ? Number(query.limit) : undefined,
        });
        return reply.send({ success: true, ...data });
    },

    async bulkRequestPhotos(request: FastifyRequest, reply: FastifyReply) {
        const { studentIds } = request.body as { studentIds: string[] };
        const institutionId = request.institutionId;

        if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
            return reply.status(400).send({ success: false, message: 'studentIds array is required' });
        }

        if (!institutionId) {
            return reply.status(400).send({ success: false, message: 'institutionId is required' });
        }

        const data = await getService(request).bulkRequestPhotos(studentIds, institutionId);
        return reply.send({ success: true, ...data });
    },
    async linkUser(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const { userId } = request.body as { userId: string };
        const data = await getService(request).linkUser(id, userId);
        return reply.send({ success: true, data });
    },
};
