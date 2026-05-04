import { FastifyRequest, FastifyReply } from 'fastify';
import { service } from './service.js';
import {
    createSaathiRequestSchema,
    updateSaathiRequestSchema,
    createRelationshipSchema,
    createPostSchema,
    createCommentSchema,
} from '@vidyaverse/shared-validation';

export const controller = {
    // ─── Saathi Links ────────────────────────────────────────────────────────────

    async createSaathiRequest(request: FastifyRequest, reply: FastifyReply) {
        const body = createSaathiRequestSchema.parse(request.body);
        const userId = request.user?.userId;
        if (!userId) return reply.status(401).send({ success: false, message: 'Unauthorized' });
        const data = await service.createSaathiRequest(userId, body as any);
        return reply.status(201).send({ success: true, data });
    },

    async listSaathiRequests(request: FastifyRequest, reply: FastifyReply) {
        const userId = request.user?.userId;
        if (!userId) return reply.status(401).send({ success: false, message: 'Unauthorized' });
        const direction = ((request.query as Record<string, unknown>).direction || 'all') as 'incoming' | 'outgoing' | 'all';
        const data = await service.listSaathiRequests(userId, direction);
        return reply.send({ success: true, data });
    },

    async updateSaathiRequest(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const body = updateSaathiRequestSchema.parse(request.body);
        const userId = request.user?.userId;
        if (!userId) return reply.status(401).send({ success: false, message: 'Unauthorized' });
        const data = await service.updateSaathiRequest(id, userId, body.status);
        return reply.send({ success: true, data });
    },

    async listAcceptedSaathis(request: FastifyRequest, reply: FastifyReply) {
        const userId = request.user?.userId;
        if (!userId) return reply.status(401).send({ success: false, message: 'Unauthorized' });
        const data = await service.listAcceptedSaathis(userId);
        return reply.send({ success: true, data });
    },

    // ─── Relationships ───────────────────────────────────────────────────────────

    async createRelationship(request: FastifyRequest, reply: FastifyReply) {
        const body = createRelationshipSchema.parse(request.body);
        const data = await service.createRelationship(body as any);
        return reply.status(201).send({ success: true, data });
    },

    async getMyRelationships(request: FastifyRequest, reply: FastifyReply) {
        const userId = request.user?.userId;
        if (!userId) return reply.status(401).send({ success: false, message: 'Unauthorized' });
        const data = await service.getMyRelationships(userId);
        return reply.send({ success: true, data });
    },

    // ─── Posts & Feeds ────────────────────────────────────────────────────────────

    async createPost(request: FastifyRequest, reply: FastifyReply) {
        const body = createPostSchema.parse(request.body);
        const userId = request.user?.userId;
        if (!userId) return reply.status(401).send({ success: false, message: 'Unauthorized' });
        const data = await service.createPost(userId, body);
        return reply.status(201).send({ success: true, data });
    },

    async getInstitutionFeed(request: FastifyRequest, reply: FastifyReply) {
        const query = request.query as Record<string, string>;
        const institutionId = query.institutionId || request.institutionId;
        if (!institutionId) {
            return reply.status(400).send({ success: false, message: 'institutionId is required' });
        }
        const result = await service.getInstitutionFeed(institutionId, {
            page: Number(query.page) || 1,
            limit: Number(query.limit) || 20,
        });
        return reply.send({ success: true, ...result });
    },

    async getClassFeed(request: FastifyRequest, reply: FastifyReply) {
        const query = request.query as Record<string, string>;
        if (!query.classId) {
            return reply.status(400).send({ success: false, message: 'classId is required' });
        }
        const result = await service.getClassFeed(query.classId, query.sectionId, {
            page: Number(query.page) || 1,
            limit: Number(query.limit) || 20,
        });
        return reply.send({ success: true, ...result });
    },

    async getMyPosts(request: FastifyRequest, reply: FastifyReply) {
        const query = request.query as Record<string, string>;
        const userId = request.user?.userId;
        if (!userId) return reply.status(401).send({ success: false, message: 'Unauthorized' });
        const result = await service.getMyPosts(userId, {
            page: Number(query.page) || 1,
            limit: Number(query.limit) || 20,
        });
        return reply.send({ success: true, ...result });
    },

    // ─── Comments ────────────────────────────────────────────────────────────────

    async addComment(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const body = createCommentSchema.parse(request.body);
        const userId = request.user?.userId;
        if (!userId) return reply.status(401).send({ success: false, message: 'Unauthorized' });
        const data = await service.addComment(id, userId, body.body);
        return reply.status(201).send({ success: true, data });
    },

    async getComments(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const data = await service.getComments(id);
        return reply.send({ success: true, data });
    },

    // ─── Reactions ───────────────────────────────────────────────────────────────

    async addReaction(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const userId = request.user?.userId;
        if (!userId) return reply.status(401).send({ success: false, message: 'Unauthorized' });
        const data = await service.addReaction(id, userId);
        return reply.status(201).send({ success: true, data });
    },

    async removeReaction(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const userId = request.user?.userId;
        if (!userId) return reply.status(401).send({ success: false, message: 'Unauthorized' });
        await service.removeReaction(id, userId);
        return reply.send({ success: true, message: 'Reaction removed' });
    },
};
