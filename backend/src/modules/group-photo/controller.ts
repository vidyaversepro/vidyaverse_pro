import { FastifyRequest, FastifyReply } from 'fastify';
import { service } from './service.js';

export const controller = {
    async list(request: FastifyRequest<{ Querystring: { page?: number; limit?: number; search?: string; institutionId?: string; status?: string } }>, reply: FastifyReply) {
        const data = await service.findAll(request.query);
        return reply.send(data);
    },

    async create(request: FastifyRequest, reply: FastifyReply) {
        const data = await service.create(request.body as never);
        return reply.status(201).send({ data });
    },

    async getOne(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const data = await service.findById(request.params.id);
        if (!data) return reply.status(404).send({ error: 'Not found' });
        return reply.send({ data });
    },

    async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const data = await service.update(request.params.id, request.body as never);
        return reply.send({ data });
    },

    async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        await service.delete(request.params.id);
        return reply.status(204).send();
    },

    async getFaces(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const data = await service.getFaces(request.params.id);
        return reply.send({ data });
    },

    async updateFaceMapping(request: FastifyRequest<{ Params: { id: string }, Body: { studentId: string } }>, reply: FastifyReply) {
        const { studentId } = request.body;
        const data = await service.updateFaceMapping(request.params.id, studentId);
        return reply.send({ data });
    },

    async extractFaces(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const data = await service.extractFaces(request.params.id);
        return reply.send({ data });
    }
};
