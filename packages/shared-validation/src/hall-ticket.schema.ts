import { z } from 'zod';

export const generateHallTicketSchema = z.object({
    studentId: z.string().uuid(),
    examScheduleId: z.string().uuid(),
    templateId: z.string().uuid().optional(),
});

export const bulkGenerateHallTicketsSchema = z.object({
    studentIds: z.array(z.string().uuid()).min(1).max(500),
    examScheduleId: z.string().uuid(),
    templateId: z.string().uuid().optional(),
});

export const hallTicketQuerySchema = z.object({
    examScheduleId: z.string().uuid().optional(),
    sectionId: z.string().uuid().optional(),
    status: z.enum(['draft', 'generated', 'issued']).optional(),
    page: z.string().transform(Number).default('1'),
    limit: z.string().transform(Number).default('20'),
});

export const examScheduleCreateSchema = z.object({
    examName: z.string().min(1).max(255),
    examType: z.enum(['internal', 'board', 'competitive']).default('internal'),
    academicYear: z.string().optional(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    instructions: z.string().optional(),
    reportingTime: z.string().optional(),
});

export const examScheduleUpdateSchema = examScheduleCreateSchema.partial();

export const examSubjectCreateSchema = z.object({
    examScheduleId: z.string().uuid(),
    subjectId: z.string().uuid(),
    examDate: z.string().datetime(),
    startTime: z.string(),
    endTime: z.string(),
    venue: z.string().optional(),
    maxMarks: z.number().int().min(1).max(1000).default(100),
    passingMarks: z.number().int().min(0).max(1000).optional(),
});

export type GenerateHallTicketInput = z.infer<typeof generateHallTicketSchema>;
export type BulkGenerateHallTicketsInput = z.infer<typeof bulkGenerateHallTicketsSchema>;
export type HallTicketQueryInput = z.infer<typeof hallTicketQuerySchema>;
export type ExamScheduleCreateInput = z.infer<typeof examScheduleCreateSchema>;
export type ExamScheduleUpdateInput = z.infer<typeof examScheduleUpdateSchema>;
export type ExamSubjectCreateInput = z.infer<typeof examSubjectCreateSchema>;
