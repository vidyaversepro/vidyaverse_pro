import { z } from 'zod';

export const jobQuerySchema = z.object({
    status: z.enum(['queued', 'processing', 'completed', 'failed']).optional(),
    jobType: z.string().optional(),
    page: z.string().transform(Number).default('1'),
    limit: z.string().transform(Number).default('20'),
});

export type JobQueryInput = z.infer<typeof jobQuerySchema>;
