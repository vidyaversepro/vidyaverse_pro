import { z } from 'zod';

export const visitingCardStatusSchema = z.enum([
    'draft',
    'generated',
    'approved',
    'printed',
    'issued',
    'cancelled',
]);

export const visitingCardBaseSchema = z.object({
    studentId: z.string().uuid().optional(),
    userId: z.string().uuid().optional(),
    templateId: z.string().uuid().optional(),
    cardNumber: z.string().min(1).max(50).optional(),
    designation: z.string().max(255).optional(),
    department: z.string().max(255).optional(),
    email: z.string().email().optional(),
    phone: z.string().max(20).optional(),
    website: z.string().url().optional(),
    linkedinUrl: z.string().url().optional(),
});

export const createVisitingCardSchema = visitingCardBaseSchema.refine(data => data.studentId || data.userId, {
    message: "Either studentId or userId must be provided",
    path: ["studentId", "userId"]
});

export const updateVisitingCardSchema = visitingCardBaseSchema.partial().extend({
    status: visitingCardStatusSchema.optional(),
});

export const generateBulkVisitingCardsSchema = z.object({
    studentIds: z.array(z.string().uuid()).optional(),
    userIds: z.array(z.string().uuid()).optional(),
    templateId: z.string().uuid().optional(),
    website: z.string().max(500).optional(),
    linkedinUrl: z.string().max(500).optional(),
}).refine(data => (data.studentIds?.length || 0) > 0 || (data.userIds?.length || 0) > 0, {
    message: "At least one student or user ID must be provided",
});

export const visitingCardQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    search: z.string().optional(),
    status: visitingCardStatusSchema.optional(),
    studentId: z.string().uuid().optional(),
    userId: z.string().uuid().optional(),
    classId: z.string().uuid().optional(),
});

export type CreateVisitingCardInput = z.infer<typeof createVisitingCardSchema>;
export type UpdateVisitingCardInput = z.infer<typeof updateVisitingCardSchema>;
export type GenerateBulkVisitingCardsInput = z.infer<typeof generateBulkVisitingCardsSchema>;
export type VisitingCardQueryInput = z.infer<typeof visitingCardQuerySchema>;
