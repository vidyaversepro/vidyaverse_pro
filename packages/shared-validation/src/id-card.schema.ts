import { z } from 'zod';

export const generateIdCardSchema = z.object({
    studentId: z.string().uuid('Invalid student ID'),
    templateId: z.string().uuid('Invalid template ID').optional(),
});

export const generateBulkIdCardsSchema = z.object({
    institutionId: z.string().uuid().optional(),
    classId: z.string().uuid().optional(),
    streamId: z.string().uuid().optional(),
    sectionId: z.string().uuid().optional(),
    templateId: z.string().uuid('Invalid template ID'),
});

export const idCardQuerySchema = z.object({
    studentId: z.string().uuid().optional(),
    classId: z.string().uuid().optional(),
    sectionId: z.string().uuid().optional(),
    status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
    academicYear: z.string().optional(),
    page: z.string().transform(Number).default('1'),
    limit: z.string().transform(Number).default('20'),
});

export const printIdCardsSchema = z.object({
    idCardIds: z.array(z.string().uuid()).min(1).max(100),
    format: z.enum(['pdf', 'png']).default('pdf'),
    layout: z.enum(['single', 'grid_2x4', 'grid_2x5']).default('grid_2x4'),
});

export type GenerateIdCardInput = z.infer<typeof generateIdCardSchema>;
export type GenerateBulkIdCardsInput = z.infer<typeof generateBulkIdCardsSchema>;
export type IdCardQueryInput = z.infer<typeof idCardQuerySchema>;
export type PrintIdCardsInput = z.infer<typeof printIdCardsSchema>;
