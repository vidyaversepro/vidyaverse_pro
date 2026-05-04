import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';



export const service = {
    // ─── Articles ────────────────────────────────────────────────────────────────

    async findAllArticles(opts: {
        page?: number;
        limit?: number;
        institutionId?: string;
        category?: string;
        language?: string;
        issueId?: string;
        status?: string;
    }) {
        const page = Math.max(1, opts.page || 1);
        const limit = Math.min(50, Math.max(1, opts.limit || 20));
        const skip = (page - 1) * limit;

        const where: Prisma.VisionariumArticleWhereInput = {};

        if (opts.institutionId) where.institutionId = opts.institutionId;
        if (opts.category) where.category = opts.category as Prisma.VisionariumArticleWhereInput['category'];
        if (opts.language) where.language = opts.language as Prisma.VisionariumArticleWhereInput['language'];
        if (opts.issueId) where.issueId = opts.issueId;
        if (opts.status) where.status = opts.status as Prisma.VisionariumArticleWhereInput['status'];

        const [data, total] = await Promise.all([
            prisma.visionariumArticle.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    authorUser: { select: { id: true, name: true } },
                    authorStudent: { select: { id: true, name: true } },
                    issue: { select: { id: true, title: true, issueCode: true } },
                },
            }),
            prisma.visionariumArticle.count({ where }),
        ]);

        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    },

    async findArticleById(id: string) {
        return prisma.visionariumArticle.findUnique({
            where: { id },
            include: {
                authorUser: { select: { id: true, name: true } },
                authorStudent: { select: { id: true, name: true } },
                issue: true,
            },
        });
    },

    async createArticle(data: any, authorUserId: string) {
        return prisma.visionariumArticle.create({
            data: {
                ...data,
                authorUserId,
                publishedAt: data.status === 'published' ? new Date() : null,
            },
        });
    },

    async updateArticle(id: string, data: any) {
        const updateData = { ...data };
        if (data.status === 'published' && !updateData.publishedAt) {
            updateData.publishedAt = new Date();
        }
        return prisma.visionariumArticle.update({
            where: { id },
            data: updateData,
        });
    },

    // ─── Issues ──────────────────────────────────────────────────────────────────

    async findAllIssues(opts: { page?: number; limit?: number }) {
        const page = Math.max(1, opts.page || 1);
        const limit = Math.min(50, Math.max(1, opts.limit || 20));
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            prisma.visionariumIssue.findMany({
                skip,
                take: limit,
                orderBy: { publishDate: 'desc' },
                include: { _count: { select: { articles: true } } },
            }),
            prisma.visionariumIssue.count(),
        ]);

        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    },

    async findIssueById(id: string) {
        return prisma.visionariumIssue.findUnique({
            where: { id },
            include: {
                articles: {
                    where: { status: 'published' },
                    orderBy: { createdAt: 'desc' },
                    include: {
                        authorUser: { select: { id: true, name: true } },
                        authorStudent: { select: { id: true, name: true } },
                    },
                },
            },
        });
    },

    async createIssue(data: any) {
        return prisma.visionariumIssue.create({
            data: {
                title: data.title,
                issueCode: data.issueCode,
                coverImageUrl: data.coverImageUrl,
                publishDate: new Date(data.publishDate),
            },
        });
    },

    // ─── Test Series ─────────────────────────────────────────────────────────────

    async findAllTestSeries(opts: {
        page?: number;
        limit?: number;
        institutionId?: string;
        classId?: string;
        subjectId?: string;
    }) {
        const page = Math.max(1, opts.page || 1);
        const limit = Math.min(50, Math.max(1, opts.limit || 20));
        const skip = (page - 1) * limit;

        const where: Prisma.VisionariumTestSeriesWhereInput = {};
        if (opts.institutionId) where.institutionId = opts.institutionId;
        if (opts.classId) where.classId = opts.classId;
        if (opts.subjectId) where.subjectId = opts.subjectId;

        const [data, total] = await Promise.all([
            prisma.visionariumTestSeries.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    class: { select: { id: true, name: true } },
                    subject: { select: { id: true, subjectName: true } },
                    _count: { select: { attempts: true } },
                },
            }),
            prisma.visionariumTestSeries.count({ where }),
        ]);

        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    },

    async findTestSeriesById(id: string) {
        return prisma.visionariumTestSeries.findUnique({
            where: { id },
            include: {
                class: { select: { id: true, name: true } },
                subject: { select: { id: true, subjectName: true } },
            },
        });
    },

    async createTestSeries(data: any) {
        return prisma.visionariumTestSeries.create({ data });
    },

    // ─── Test Attempts ───────────────────────────────────────────────────────────

    async submitTestAttempt(testSeriesId: string, studentId: string, data: any) {
        return prisma.visionariumTestAttempt.create({
            data: {
                testSeriesId,
                studentId,
                scoreObtained: data.scoreObtained,
                responseData: data.responseData,
                completedAt: new Date(),
            },
        });
    },

    async getMyAttempts(testSeriesId: string, studentId: string) {
        return prisma.visionariumTestAttempt.findMany({
            where: { testSeriesId, studentId },
            orderBy: { createdAt: 'desc' },
        });
    },

    // ─── Submissions ─────────────────────────────────────────────────────────────

    async findAllSubmissions(opts: {
        page?: number;
        limit?: number;
        institutionId?: string;
        status?: string;
        submittedByUserId?: string;
    }) {
        const page = Math.max(1, opts.page || 1);
        const limit = Math.min(50, Math.max(1, opts.limit || 20));
        const skip = (page - 1) * limit;

        const where: Prisma.VisionariumSubmissionWhereInput = {};
        if (opts.institutionId) where.institutionId = opts.institutionId;
        if (opts.status) where.status = opts.status as Prisma.VisionariumSubmissionWhereInput['status'];
        if (opts.submittedByUserId) where.submittedByUserId = opts.submittedByUserId;

        const [data, total] = await Promise.all([
            prisma.visionariumSubmission.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    submittedBy: { select: { id: true, name: true } },
                    student: { select: { id: true, name: true } },
                    linkedArticle: { select: { id: true, title: true, slug: true } },
                },
            }),
            prisma.visionariumSubmission.count({ where }),
        ]);

        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    },

    async createSubmission(data: any, userId: string) {
        return prisma.visionariumSubmission.create({
            data: {
                ...data,
                submittedByUserId: userId,
            },
        });
    },

    async updateSubmission(id: string, data: { status: string; linkedArticleId?: string }) {
        // When promoting to article, use a transaction
        if (data.status === 'published' && data.linkedArticleId) {
            return prisma.$transaction(async (tx) => {
                const updated = await tx.visionariumSubmission.update({
                    where: { id },
                    data: {
                        status: data.status as Prisma.VisionariumSubmissionUpdateInput['status'],
                        linkedArticleId: data.linkedArticleId,
                    },
                });
                return updated;
            });
        }

        return prisma.visionariumSubmission.update({
            where: { id },
            data: {
                status: data.status as Prisma.VisionariumSubmissionUpdateInput['status'],
                linkedArticleId: data.linkedArticleId,
            },
        });
    },
};
