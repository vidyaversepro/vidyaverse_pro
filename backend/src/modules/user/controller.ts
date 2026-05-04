import { FastifyRequest, FastifyReply } from 'fastify';
import { service } from './service.js';

export const controller = {
    async getStats(_request: FastifyRequest, reply: FastifyReply) {
        const data = await service.getStats();
        return reply.send({ data });
    },

    async list(request: FastifyRequest<{ Querystring: { page?: number; limit?: number; search?: string; role?: string; institutionId?: string; status?: string } }>, reply: FastifyReply) {
        const result = await service.findAll(request.query);
        return reply.send({ data: result.data, pagination: result.pagination });
    },

    async create(request: FastifyRequest, reply: FastifyReply) {
        try {
            const data = await service.create(request.body);
            return reply.status(201).send({ data });
        } catch (error: any) {
            return reply.status(400).send({ error: error.message });
        }
    },

    async getOne(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const data = await service.findById(request.params.id);
        if (!data) return reply.status(404).send({ error: 'Not found' });
        return reply.send({ data });
    },

    async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const data = await service.update(request.params.id, request.body);
        return reply.send({ data });
    },

    async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        await service.delete(request.params.id);
        return reply.status(204).send();
    },

    async assignRole(request: FastifyRequest<{ Body: { userId: string; institutionId: string; role: string } }>, reply: FastifyReply) {
        const data = await service.assignRole(request.body.userId, request.body.institutionId, request.body.role);
        return reply.send({ data });
    }
};
