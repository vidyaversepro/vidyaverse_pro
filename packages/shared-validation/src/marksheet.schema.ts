import { z } from 'zod';

export const markEntrySchema = z.object({
    studentId: z.string().uuid(),
    examScheduleId: z.string().uuid(),
    subjectId: z.string().uuid(),
    marksObtained: z.number().min(0).max(1000),
    practicalMarks: z.number().min(0).max(1000).optional(),
    theoryMarks: z.number().min(0).max(1000).optional(),
    gradeOverride: z.string().max(10).optional(),
    remarks: z.string().max(500).optional(),
});

export const bulkMarkEntrySchema = z.object({
    examScheduleId: z.string().uuid(),
    subjectId: z.string().uuid(),
    entries: z.array(
        z.object({
            studentId: z.string().uuid(),
            marksObtained: z.number().min(0).max(1000),
            practicalMarks: z.number().min(0).max(1000).optional(),
            theoryMarks: z.number().min(0).max(1000).optional(),
        })
    ).min(1).max(100),
});

export const generateMarksheetSchema = z.object({
    studentId: z.string().uuid(),
    examScheduleId: z.string().uuid(),
    templateId: z.string().uuid().optional(),
});

export const bulkGenerateMarksheetsSchema = z.object({
    studentIds: z.array(z.string().uuid()).min(1).max(500),
    examScheduleId: z.string().uuid(),
    templateId: z.string().uuid().optional(),
});

export const marksheetQuerySchema = z.object({
    examScheduleId: z.string().uuid().optional(),
    sectionId: z.string().uuid().optional(),
    status: z.enum(['draft', 'generated', 'published']).optional(),
    page: z.string().transform(Number).default('1'),
    limit: z.string().transform(Number).default('20'),
});

export const markEntryQuerySchema = z.object({
    examScheduleId: z.string().uuid(),
    sectionId: z.string().uuid(),
    subjectId: z.string().uuid(),
});

export const calculationEngineCreateSchema = z.object({
    name: z.string().min(1).max(255),
    description: z.string().optional(),
    formula: z.string().min(1), // JSON formula definition
    gradeMapping: z.array(
        z.object({
            minPercent: z.number().min(0).max(100),
            maxPercent: z.number().min(0).max(100),
            grade: z.string().max(10),
            gradePoint: z.number().min(0).max(10).optional(),
            remarks: z.string().optional(),
        })
    ),
    passingPercent: z.number().min(0).max(100).default(33),
    includeInternalMarks: z.boolean().default(false),
    internalMarksWeight: z.number().min(0).max(100).optional(),
});

export type MarkEntryInput = z.infer<typeof markEntrySchema>;
export type BulkMarkEntryInput = z.infer<typeof bulkMarkEntrySchema>;
export type GenerateMarksheetInput = z.infer<typeof generateMarksheetSchema>;
export type BulkGenerateMarksheetsInput = z.infer<typeof bulkGenerateMarksheetsSchema>;
export type MarksheetQueryInput = z.infer<typeof marksheetQuerySchema>;
export type MarkEntryQueryInput = z.infer<typeof markEntryQuerySchema>;
export type CalculationEngineCreateInput = z.infer<typeof calculationEngineCreateSchema>;
