import { FastifyRequest, FastifyReply } from 'fastify';
import { createStreamService } from './service.js';
import { getTenantPrisma } from '../../lib/prisma-tenant.js';

function getService(request: FastifyRequest) {
    if (request.institutionId) {
        return createStreamService(getTenantPrisma(request.institutionId));
    }
    return createStreamService();
}
import { NotFoundError } from '../../utils/errors.js';

export const controller = {
    async list(request: FastifyRequest, reply: FastifyReply) {
        const query = request.query as Record<string, string>;
        const result = await getService(request).findAll({
            classId: query.classId,
            institutionId: query.institutionId || request.institutionId || undefined,
        });
        return reply.send({ success: true, ...result });
    },

    async create(request: FastifyRequest, reply: FastifyReply) {
        const body = request.body as {
            institutionId: string;
            classId: string;
            name: string;
            description?: string;
            displayOrder?: number;
        };
        const data = await getService(request).create(body);
        return reply.status(201).send({ success: true, data });
    },

    async getOne(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const data = await getService(request).findById(id);
        if (!data) throw new NotFoundError('Stream not found');
        return reply.send({ success: true, data });
    },

    async update(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const body = request.body as Record<string, any>;
        const data = await getService(request).update(id, body);
        return reply.send({ success: true, data });
    },

    async delete(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        await getService(request).delete(id);
        return reply.send({ success: true, message: 'Stream deleted' });
    },
};
