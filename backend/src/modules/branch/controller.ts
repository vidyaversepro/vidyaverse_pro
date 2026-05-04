import { FastifyRequest, FastifyReply } from 'fastify';
import { service } from './service.js';
import { NotFoundError } from '../../utils/errors.js';

export const controller = {
    async findAll(request: FastifyRequest, reply: FastifyReply) {
        const query = request.query as Record<string, string>;
        const result = await service.findAll({
            page: Number(query.page),
            limit: Number(query.limit),
            search: query.search,
            institutionId: query.institutionId || request.institutionId || undefined,
        });
        return reply.send({ success: true, ...result });
    },

    async findById(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const branch = await service.findById(id);
        if (!branch) throw new NotFoundError('Branch not found');
        return reply.send({ success: true, data: branch });
    },

    async create(request: FastifyRequest, reply: FastifyReply) {
        const body = request.body as {
            institutionId: string;
            name: string;
            code: string;
            address?: string;
            contactEmail?: string;
            contactPhone?: string;
        };
        const branch = await service.create(body);
        return reply.status(201).send({ success: true, data: branch });
    },

    async update(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const body = request.body as Record<string, any>;
        const branch = await service.update(id, body);
        return reply.send({ success: true, data: branch });
    },

    async delete(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        await service.delete(id);
        return reply.send({ success: true, message: 'Branch deleted' });
    },
};
