import { z } from 'zod';

export const audienceTypeSchema = z.enum(['students', 'staff', 'both']);
export type AudienceType = z.infer<typeof audienceTypeSchema>;
