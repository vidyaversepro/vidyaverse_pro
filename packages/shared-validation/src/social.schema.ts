import { z } from 'zod';

// ─── Saathi Link Schemas ─────────────────────────────────────────────────────

export const createSaathiRequestSchema = z.object({
    targetUserId: z.string().uuid(),
    context: z.enum(['student', 'teacher', 'parent', 'alumni', 'other']).default('other'),
    message: z.string().max(255).optional(),
});

export const updateSaathiRequestSchema = z.object({
    status: z.enum(['accepted', 'rejected', 'cancelled', 'blocked']),
});

// ─── Relationship Schemas ────────────────────────────────────────────────────

export const createRelationshipSchema = z.object({
    fromUserId: z.string().uuid(),
    toUserId: z.string().uuid(),
    relationshipType: z.enum([
        'guardian_of', 'ward_of', 'sibling',
        'teacher_of', 'student_of',
        'batchmate', 'schoolmate',
    ]),
    institutionId: z.string().uuid().optional(),
    sinceAcademicYear: z.string().max(20).optional(),
});

// ─── Post Schemas ────────────────────────────────────────────────────────────

export const createPostSchema = z.object({
    institutionId: z.string().uuid().optional(),
    scope: z.enum(['class_only', 'institution_only', 'my_saathi', 'public_vidyaverse']).default('institution_only'),
    classId: z.string().uuid().optional(),
    sectionId: z.string().uuid().optional(),
    title: z.string().max(255).optional(),
    body: z.string().min(1).max(5000),
    mediaUrl: z.string().url().optional(),
    linkedArticleId: z.string().uuid().optional(),
});

// ─── Comment Schemas ─────────────────────────────────────────────────────────

export const createCommentSchema = z.object({
    body: z.string().min(1).max(2000),
});
