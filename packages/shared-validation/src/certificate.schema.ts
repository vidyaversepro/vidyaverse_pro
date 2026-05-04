import { z } from 'zod';

export const createCertificateSchema = z.object({
    studentId: z.string().uuid('Invalid student ID'),
    templateId: z.string().uuid('Invalid template ID').optional(),
    certificateType: z.enum([
        'merit',
        'participation',
        'achievement',
        'completion',
        'appreciation',
        'sports',
        'cultural',
        'custom',
    ]),
    title: z.string().min(1, 'Certificate title is required').max(255),
    description: z.string().optional(),
    eventName: z.string().optional(),
    eventDate: z.string().datetime().optional(),
    position: z.string().optional(), // e.g., "1st", "Runner-up"
    grade: z.string().optional(),
    customFields: z.record(z.string()).optional(),
});

export const generateBulkCertificatesSchema = z.object({
    studentIds: z.array(z.string().uuid()).min(1).max(500),
    templateId: z.string().uuid('Invalid template ID').optional(),
    certificateType: z.enum([
        'merit',
        'participation',
        'achievement',
        'completion',
        'appreciation',
        'sports',
        'cultural',
        'custom',
    ]),
    title: z.string().min(1, 'Certificate title is required').max(255),
    description: z.string().optional(),
    eventName: z.string().optional(),
    eventDate: z.string().datetime().optional(),
});

export const certificateQuerySchema = z.object({
    studentId: z.string().uuid().optional(),
    certificateType: z.string().optional(),
    classId: z.string().uuid().optional(),
    status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
    page: z.string().transform(Number).default('1'),
    limit: z.string().transform(Number).default('20'),
});

export type CreateCertificateInput = z.infer<typeof createCertificateSchema>;
export type GenerateBulkCertificatesInput = z.infer<typeof generateBulkCertificatesSchema>;
export type CertificateQueryInput = z.infer<typeof certificateQuerySchema>;
