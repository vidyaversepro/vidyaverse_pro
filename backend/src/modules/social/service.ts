import { prisma } from '../../config/database';
import { Prisma, type SaathiLinkStatus } from '@prisma/client';



// Inverse relationship mapping
const INVERSE_RELATIONSHIP: Record<string, string> = {
    guardian_of: 'ward_of',
    ward_of: 'guardian_of',
    teacher_of: 'student_of',
    student_of: 'teacher_of',
    sibling: 'sibling',
    batchmate: 'batchmate',
    schoolmate: 'schoolmate',
};

export const service = {
    // â”€â”€â”€ Relationships â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    async createRelationship(data: {
        fromUserId: string;
        toUserId: string;
        relationshipType: string;
        institutionId?: string;
        sinceAcademicYear?: string;
    }) {
        const inverseType = INVERSE_RELATIONSHIP[data.relationshipType];
        if (!inverseType) throw new Error(`Unknown relationship type: ${data.relationshipType}`);

        // Use transaction to create both directions atomically
        return prisma.$transaction(async (tx) => {
            const forward = await tx.socialRelationship.create({
                data: {
                    fromUserId: data.fromUserId,
                    toUserId: data.toUserId,
                    relationshipType: data.relationshipType as import('@prisma/client').SocialRelationshipType,
                    institutionId: data.institutionId,
                    sinceAcademicYear: data.sinceAcademicYear,
                },
            });

            // Auto-insert inverse (skip if symmetric and already same direction)
            await tx.socialRelationship.upsert({
                where: {
                    fromUserId_toUserId_relationshipType: {
                        fromUserId: data.toUserId,
                        toUserId: data.fromUserId,
                        relationshipType: inverseType as import('@prisma/client').SocialRelationshipType,
                    },
                },
                create: {
                    fromUserId: data.toUserId,
                    toUserId: data.fromUserId,
                    relationshipType: inverseType as import('@prisma/client').SocialRelationshipType,
                    institutionId: data.institutionId,
                    sinceAcademicYear: data.sinceAcademicYear,
                },
                update: {}, // no-op if already exists
            });

            return forward;
        });
    },

    async getMyRelationships(userId: string) {
        return prisma.socialRelationship.findMany({
            where: { fromUserId: userId },
            include: {
                toUser: { select: { id: true, name: true, email: true } },
                institution: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    },

    // â”€â”€â”€ Saathi Links â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    async createSaathiRequest(requesterId: string, data: { targetUserId: string; context: string; message?: string }) {
        // Prevent self-link
        if (requesterId === data.targetUserId) throw new Error('Cannot send Saathi request to yourself');

        return prisma.socialSaathiLink.create({
            data: {
                requesterUserId: requesterId,
                targetUserId: data.targetUserId,
                context: data.context as never,
                message: data.message,
            },
        });
    },

    async listSaathiRequests(userId: string, direction: 'incoming' | 'outgoing' | 'all') {
        const where: Prisma.SocialSaathiLinkWhereInput = {};
        if (direction === 'incoming') where.targetUserId = userId;
        else if (direction === 'outgoing') where.requesterUserId = userId;
        else where.OR = [{ requesterUserId: userId }, { targetUserId: userId }];

        return prisma.socialSaathiLink.findMany({
            where,
            include: {
                requester: { select: { id: true, name: true, email: true } },
                target: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    },

    async updateSaathiRequest(id: string, userId: string, status: string) {
        // Ensure the user is the target (for accept/reject) or requester (for cancel)
        const link = await prisma.socialSaathiLink.findUnique({ where: { id } });
        if (!link) throw new Error('Saathi request not found');

        if (['accepted', 'rejected'].includes(status) && link.targetUserId !== userId) {
            throw new Error('Only the target user can accept or reject');
        }
        if (status === 'cancelled' && link.requesterUserId !== userId) {
            throw new Error('Only the requester can cancel');
        }

        return prisma.socialSaathiLink.update({
            where: { id },
            data: { status: status as SaathiLinkStatus },
        });
    },

    async listAcceptedSaathis(userId: string) {
        const links = await prisma.socialSaathiLink.findMany({
            where: {
                status: 'accepted',
                OR: [{ requesterUserId: userId }, { targetUserId: userId }],
            },
            include: {
                requester: { select: { id: true, name: true, email: true } },
                target: { select: { id: true, name: true, email: true } },
            },
            orderBy: { updatedAt: 'desc' },
        });

        // Normalize: return the "other" user in each link
        return links.map((link) => {
            const otherUser = link.requesterUserId === userId ? link.target : link.requester;
            return {
                linkId: link.id,
                saathi: otherUser,
                context: link.context,
                since: link.createdAt,
            };
        });
    },

    // â”€â”€â”€ Posts & Feeds â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    async createPost(authorUserId: string, data: any) {
        return prisma.socialPost.create({
            data: {
                authorUserId,
                institutionId: data.institutionId,
                authorStudentId: data.authorStudentId,
                scope: data.scope,
                classId: data.classId,
                sectionId: data.sectionId,
                title: data.title,
                body: data.body,
                mediaUrl: data.mediaUrl,
                linkedArticleId: data.linkedArticleId,
            },
            include: {
                authorUser: { select: { id: true, name: true } },
                _count: { select: { comments: true, reactions: true } },
            },
        });
    },

    async getInstitutionFeed(institutionId: string, opts: { page?: number; limit?: number }) {
        const page = Math.max(1, opts.page || 1);
        const limit = Math.min(50, Math.max(1, opts.limit || 20));
        const skip = (page - 1) * limit;

        const where: Prisma.SocialPostWhereInput = {
            institutionId,
            scope: { in: ['institution_only', 'public_vidyaverse'] },
        };

        const [data, total] = await Promise.all([
            prisma.socialPost.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    authorUser: { select: { id: true, name: true } },
                    authorStudent: { select: { id: true, name: true } },
                    linkedArticle: { select: { id: true, title: true, slug: true } },
                    _count: { select: { comments: true, reactions: true } },
                },
            }),
            prisma.socialPost.count({ where }),
        ]);

        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    },

    async getClassFeed(classId: string, sectionId: string | undefined, opts: { page?: number; limit?: number }) {
        const page = Math.max(1, opts.page || 1);
        const limit = Math.min(50, Math.max(1, opts.limit || 20));
        const skip = (page - 1) * limit;

        const where: Prisma.SocialPostWhereInput = {
            scope: 'class_only',
            classId,
        };
        if (sectionId) where.sectionId = sectionId;

        const [data, total] = await Promise.all([
            prisma.socialPost.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    authorUser: { select: { id: true, name: true } },
                    authorStudent: { select: { id: true, name: true } },
                    _count: { select: { comments: true, reactions: true } },
                },
            }),
            prisma.socialPost.count({ where }),
        ]);

        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    },

    async getMyPosts(userId: string, opts: { page?: number; limit?: number }) {
        const page = Math.max(1, opts.page || 1);
        const limit = Math.min(50, Math.max(1, opts.limit || 20));
        const skip = (page - 1) * limit;

        const where: Prisma.SocialPostWhereInput = { authorUserId: userId };

        const [data, total] = await Promise.all([
            prisma.socialPost.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: { select: { comments: true, reactions: true } },
                },
            }),
            prisma.socialPost.count({ where }),
        ]);

        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    },

    // â”€â”€â”€ Comments â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    async addComment(postId: string, authorUserId: string, body: string) {
        return prisma.socialComment.create({
            data: { postId, authorUserId, body },
            include: {
                authorUser: { select: { id: true, name: true } },
            },
        });
    },

    async getComments(postId: string) {
        return prisma.socialComment.findMany({
            where: { postId },
            orderBy: { createdAt: 'asc' },
            include: {
                authorUser: { select: { id: true, name: true } },
            },
        });
    },

    // â”€â”€â”€ Reactions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    async addReaction(postId: string, userId: string) {
        return prisma.socialReaction.upsert({
            where: { postId_userId: { postId, userId } },
            create: { postId, userId, reactionType: 'prerna' },
            update: {}, // no-op if already exists
        });
    },

    async removeReaction(postId: string, userId: string) {
        return prisma.socialReaction.deleteMany({
            where: { postId, userId },
        });
    },
};


