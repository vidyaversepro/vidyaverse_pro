import { z } from 'zod';

export const institutionRoleSchema = z.enum([
  'main_admin',
  'school_admin',
  'teacher',
  'student',
]);
export type InstitutionRole = z.infer<typeof institutionRoleSchema>;

export const institutionRoleResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    role: institutionRoleSchema.nullable(),
  }),
});
