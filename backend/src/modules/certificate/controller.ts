import { FastifyRequest, FastifyReply } from 'fastify';
import { service } from './service.js';

export const controller = {
    async list(_request: FastifyRequest, reply: FastifyReply) {
        const data = await service.findAll();
        return reply.send({ data });
    },

    async create(request: FastifyRequest, reply: FastifyReply) {
        const data = await service.create(request.body);
        return reply.status(201).send({ data });
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
    }
};
