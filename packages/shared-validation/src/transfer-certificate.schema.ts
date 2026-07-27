import { z } from 'zod';

export const generateTransferCertificateSchema = z.object({
    studentId: z.string().uuid(),
    templateId: z.string().uuid().optional(),
    reason: z.enum(['transfer', 'withdrawal', 'completion', 'migration', 'other']).default('transfer'),
    remarks: z.string().max(1000).optional(),
    conductGrade: z.enum(['excellent', 'very_good', 'good', 'satisfactory', 'needs_improvement']).default('good'),
    lastAttendanceDate: z.string().datetime(),
    feesCleared: z.boolean().default(false),
    noDues: z.boolean().default(false),
    characterCertificate: z.boolean().default(true),
});

export const bulkGenerateTCsSchema = z.object({
    studentIds: z.array(z.string().uuid()).min(1).max(100),
    templateId: z.string().uuid().optional(),
    reason: z.enum(['transfer', 'withdrawal', 'completion', 'migration', 'other']).default('transfer'),
    remarks: z.string().max(1000).optional(),
    conductGrade: z.enum(['excellent', 'very_good', 'good', 'satisfactory', 'needs_improvement']).default('good'),
    lastAttendanceDate: z.string().datetime().optional(),
    feesCleared: z.boolean().default(false),
    noDues: z.boolean().default(false),
    characterCertificate: z.boolean().default(true),
});

export const tcQuerySchema = z.object({
    sectionId: z.string().uuid().optional(),
    status: z.enum(['draft', 'pending_approval', 'issued', 'cancelled']).optional(),
    reason: z.enum(['transfer', 'withdrawal', 'completion', 'migration', 'other']).optional(),
    page: z.string().transform(Number).default('1'),
    limit: z.string().transform(Number).default('20'),
});

export const verifyTCSchema = z.object({
    tcNumber: z.string().min(1),
});

export type GenerateTransferCertificateInput = z.infer<typeof generateTransferCertificateSchema>;
export type BulkGenerateTCsInput = z.infer<typeof bulkGenerateTCsSchema>;
export type TCQueryInput = z.infer<typeof tcQuerySchema>;
export type VerifyTCInput = z.infer<typeof verifyTCSchema>;
