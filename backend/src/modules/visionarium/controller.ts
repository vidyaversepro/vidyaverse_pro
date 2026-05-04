import { FastifyRequest, FastifyReply } from 'fastify';
import { service } from './service.js';
import { NotFoundError } from '../../utils/errors.js';
import {
    createArticleSchema,
    updateArticleSchema,
    createIssueSchema,
    createTestSeriesSchema,
    submitTestAttemptSchema,
    createSubmissionSchema,
    updateSubmissionSchema,
} from '@vidyaverse/shared-validation';

export const controller = {
    // ─── Articles ────────────────────────────────────────────────────────────────

    async listArticles(request: FastifyRequest, reply: FastifyReply) {
        const query = request.query as Record<string, string>;
        const result = await service.findAllArticles({
            page: Number(query.page) || 1,
            limit: Number(query.limit) || 20,
            institutionId: query.institutionId || request.institutionId || undefined,
            category: query.category,
            language: query.language,
            issueId: query.issueId,
            status: query.status,
        });
        return reply.send({ success: true, ...result });
    },

    async getArticle(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const data = await service.findArticleById(id);
        if (!data) throw new NotFoundError('Article not found');
        return reply.send({ success: true, data });
    },

    async createArticle(request: FastifyRequest, reply: FastifyReply) {
        const body = createArticleSchema.parse(request.body);
        // If standard authentication is used, request.user exists
        const userId = request.user?.userId;
        if (!userId) {
            return reply.status(401).send({ success: false, message: 'Unauthorized' });
        }
        const data = await service.createArticle(body, userId);
        return reply.status(201).send({ success: true, data });
    },

    async updateArticle(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const body = updateArticleSchema.parse(request.body);
        const data = await service.updateArticle(id, body);
        return reply.send({ success: true, data });
    },

    // ─── Issues ──────────────────────────────────────────────────────────────────

    async listIssues(request: FastifyRequest, reply: FastifyReply) {
        const query = request.query as Record<string, string>;
        const result = await service.findAllIssues({
            page: Number(query.page) || 1,
            limit: Number(query.limit) || 20,
        });
        return reply.send({ success: true, ...result });
    },

    async getIssue(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const data = await service.findIssueById(id);
        if (!data) throw new NotFoundError('Issue not found');
        return reply.send({ success: true, data });
    },

    async createIssue(request: FastifyRequest, reply: FastifyReply) {
        const body = createIssueSchema.parse(request.body);
        const data = await service.createIssue(body);
        return reply.status(201).send({ success: true, data });
    },

    // ─── Test Series ─────────────────────────────────────────────────────────────

    async listTestSeries(request: FastifyRequest, reply: FastifyReply) {
        const query = request.query as Record<string, string>;
        const result = await service.findAllTestSeries({
            page: Number(query.page) || 1,
            limit: Number(query.limit) || 20,
            institutionId: query.institutionId || request.institutionId || undefined,
            classId: query.classId,
            subjectId: query.subjectId,
        });
        return reply.send({ success: true, ...result });
    },

    async getTestSeries(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const data = await service.findTestSeriesById(id);
        if (!data) throw new NotFoundError('Test Series not found');
        return reply.send({ success: true, data });
    },

    async createTestSeries(request: FastifyRequest, reply: FastifyReply) {
        const body = createTestSeriesSchema.parse(request.body);
        const data = await service.createTestSeries(body);
        return reply.status(201).send({ success: true, data });
    },

    // ─── Test Attempts ───────────────────────────────────────────────────────────

    async submitAttempt(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const body = submitTestAttemptSchema.parse(request.body);
        // studentId must come from
        const query = request.query as Record<string, unknown>;
        const requestBody = request.body as any | undefined;
        const studentId = (query.studentId || requestBody?.studentId) as string | undefined;
        if (!studentId) {
            return reply.status(400).send({ success: false, message: 'studentId is required' });
        }
        const data = await service.submitTestAttempt(id, studentId, body);
        return reply.status(201).send({ success: true, data });
    },

    async getMyAttempts(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const query = request.query as Record<string, unknown>;
        const studentId = query.studentId as string | undefined;
        if (!studentId) {
            return reply.status(400).send({ success: false, message: 'studentId is required' });
        }
        const data = await service.getMyAttempts(id, studentId);
        return reply.send({ success: true, data });
    },

    // ─── Submissions ─────────────────────────────────────────────────────────────

    async listSubmissions(request: FastifyRequest, reply: FastifyReply) {
        const query = request.query as Record<string, string>;
        const result = await service.findAllSubmissions({
            page: Number(query.page) || 1,
            limit: Number(query.limit) || 20,
            institutionId: query.institutionId || request.institutionId || undefined,
            status: query.status,
            submittedByUserId: query.submittedByUserId,
        });
        return reply.send({ success: true, ...result });
    },

    async createSubmission(request: FastifyRequest, reply: FastifyReply) {
        const body = createSubmissionSchema.parse(request.body);
        const userId = request.user?.userId;
        if (!userId) {
            return reply.status(401).send({ success: false, message: 'Unauthorized' });
        }
        const data = await service.createSubmission(body, userId);
        return reply.status(201).send({ success: true, data });
    },

    async updateSubmission(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const body = updateSubmissionSchema.parse(request.body);
        const data = await service.updateSubmission(id, body);
        return reply.send({ success: true, data });
    },
};
