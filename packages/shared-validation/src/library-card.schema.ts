import { z } from 'zod';

export const generateLibraryCardSchema = z.object({
    studentId: z.string().uuid(),
    templateId: z.string().uuid().optional(),
    validFrom: z.string().datetime().optional(),
    validUntil: z.string().datetime().optional(),
    maxBooks: z.number().int().min(1).max(20).default(5),
});

export const bulkGenerateLibraryCardsSchema = z.object({
    studentIds: z.array(z.string().uuid()).min(1).max(500),
    templateId: z.string().uuid().optional(),
    validFrom: z.string().datetime().optional(),
    validUntil: z.string().datetime().optional(),
    maxBooks: z.number().int().min(1).max(20).default(5),
});

export const libraryCardQuerySchema = z.object({
    sectionId: z.string().uuid().optional(),
    status: z.enum(['active', 'expired', 'suspended']).optional(),
    page: z.string().transform(Number).default('1'),
    limit: z.string().transform(Number).default('20'),
});

export const bookTransactionSchema = z.object({
    libraryCardId: z.string().uuid(),
    bookTitle: z.string().min(1).max(255),
    bookId: z.string().optional(),
    issueDate: z.string().datetime(),
    dueDate: z.string().datetime(),
    returnDate: z.string().datetime().optional(),
    fineAmount: z.number().min(0).optional(),
});

export type GenerateLibraryCardInput = z.infer<typeof generateLibraryCardSchema>;
export type BulkGenerateLibraryCardsInput = z.infer<typeof bulkGenerateLibraryCardsSchema>;
export type LibraryCardQueryInput = z.infer<typeof libraryCardQuerySchema>;
export type BookTransactionInput = z.infer<typeof bookTransactionSchema>;
