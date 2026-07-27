import { FastifyRequest, FastifyReply } from 'fastify';
import { createSectionService } from './service.js';
import { getTenantPrisma } from '../../lib/prisma-tenant.js';

function getService(request: FastifyRequest) {
    if (request.institutionId) {
        return createSectionService(getTenantPrisma(request.institutionId));
    }
    return createSectionService();
}
import { NotFoundError } from '../../utils/errors.js';

export const controller = {
    async list(request: FastifyRequest, reply: FastifyReply) {
        const query = request.query as Record<string, string>;
        const result = await getService(request).findAll({
            page: Number(query.page),
            limit: Number(query.limit),
            search: query.search,
            classId: query.classId,
            streamId: query.streamId,
            institutionId: query.institutionId || request.institutionId || undefined,
        });
        return reply.send({ success: true, ...result });
    },

    async create(request: FastifyRequest, reply: FastifyReply) {
        const body = request.body as {
            institutionId: string;
            classId: string;
            streamId?: string;
            name: string;
            expectedStudentCount?: number;
            classTeacherId?: string;
        };
        const data = await getService(request).create(body);
        return reply.status(201).send({ success: true, data });
    },

    async createBulk(request: FastifyRequest, reply: FastifyReply) {
        const body = request.body as {
            institutionId: string;
            classId: string;
            streamId?: string;
            name: string;
            expectedStudentCount?: number;
            classTeacherId?: string;
        }[];
        const data = await getService(request).createBulk(body);
        return reply.status(201).send({ success: true, data });
    },

    async getOne(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const data = await getService(request).findById(id);
        if (!data) throw new NotFoundError('Section not found');
        return reply.send({ success: true, data });
    },

    async update(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const body = request.body as Record<string, any>;
        console.log(`[DEBUG] PATCH /section/${id} - body:`, body, 'institutionId:', request.institutionId);
        try {
            const data = await getService(request).update(id, body);
            return reply.send({ success: true, data });
        } catch (error) {
            console.error(`[DEBUG] Error in section update:`, error);
            throw error;
        }
    },

    async delete(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        await getService(request).delete(id);
        return reply.send({ success: true, message: 'Section deleted' });
    },
};
