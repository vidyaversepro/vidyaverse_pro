import { z } from 'zod';

export const linkStudentUserSchema = z.object({
  userId: z.string().uuid('Must be a valid user UUID').nullable(),
});

export type LinkStudentUserInput = z.infer<typeof linkStudentUserSchema>;
