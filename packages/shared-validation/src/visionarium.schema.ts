import { z } from 'zod';

// ─── Article Schemas ─────────────────────────────────────────────────────────

export const createArticleSchema = z.object({
    institutionId: z.string().uuid().nullable().optional(),
    title: z.string().min(1).max(255),
    slug: z.string().min(1).max(255),
    body: z.string().min(1),
    summary: z.string().optional(),
    language: z.enum(['hi', 'en', 'hi_en']).default('en'),
    category: z.enum([
        'SCIENCE', 'MATHS', 'HISTORY', 'IT', 'ESSAY', 'POEM',
        'ITIHASA', 'DARSHANA', 'BHARATIYA_VIGYAN', 'GENERAL',
    ]).default('GENERAL'),
    issueId: z.string().uuid().optional(),
    status: z.enum(['draft', 'review', 'published', 'archived']).default('draft'),
});

export const updateArticleSchema = createArticleSchema.partial();

// ─── Issue Schemas ───────────────────────────────────────────────────────────

export const createIssueSchema = z.object({
    title: z.string().min(1).max(255),
    issueCode: z.string().min(1).max(50),
    coverImageUrl: z.string().url().optional(),
    publishDate: z.string(), // ISO date string
});

// ─── Test Series Schemas ─────────────────────────────────────────────────────

export const createTestSeriesSchema = z.object({
    institutionId: z.string().uuid(),
    title: z.string().min(1).max(255),
    description: z.string().optional(),
    classId: z.string().uuid().optional(),
    subjectId: z.string().uuid().optional(),
    language: z.enum(['hi', 'en', 'hi_en']).default('en'),
    totalMarks: z.number().int().positive(),
    metadata: z.any().optional(),
});

export const submitTestAttemptSchema = z.object({
    responseData: z.any(),
    scoreObtained: z.number().min(0).optional(),
});

// ─── Submission Schemas ──────────────────────────────────────────────────────

export const createSubmissionSchema = z.object({
    institutionId: z.string().uuid(),
    studentId: z.string().uuid().optional(),
    title: z.string().min(1).max(255),
    submissionType: z.enum(['article', 'poem', 'story', 'artwork', 'other']).default('article'),
    body: z.string().optional(),
    contentUrl: z.string().url().optional(),
});

export const updateSubmissionSchema = z.object({
    status: z.enum(['submitted', 'accepted', 'rejected', 'published']),
    linkedArticleId: z.string().uuid().optional(),
});
