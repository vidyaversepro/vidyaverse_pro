import { z } from 'zod';

// Dashboard overview
export const dashboardQuerySchema = z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    period: z.enum(['today', 'week', 'month', 'quarter', 'year']).default('month'),
});

// Student analytics
export const studentAnalyticsQuerySchema = z.object({
    sectionId: z.string().uuid().optional(),
    classId: z.string().uuid().optional(),
    metric: z.enum(['attendance', 'performance', 'documents']).optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

// Document analytics
export const documentAnalyticsQuerySchema = z.object({
    type: z.enum(['id_card', 'certificate', 'hall_ticket', 'marksheet', 'library_card', 'transfer_certificate', 'portfolio']).optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    groupBy: z.enum(['day', 'week', 'month']).default('day'),
});

// Usage analytics
export const usageAnalyticsQuerySchema = z.object({
    resource: z.enum(['storage', 'api', 'email', 'sms']).optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

// Custom report
export const customReportSchema = z.object({
    name: z.string().min(1).max(100),
    type: z.enum(['students', 'attendance', 'documents', 'finances']),
    filters: z.record(z.any()).optional(),
    columns: z.array(z.string()).optional(),
    groupBy: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
    format: z.enum(['json', 'csv', 'pdf']).default('json'),
});

export type DashboardQueryInput = z.infer<typeof dashboardQuerySchema>;
export type StudentAnalyticsQueryInput = z.infer<typeof studentAnalyticsQuerySchema>;
export type DocumentAnalyticsQueryInput = z.infer<typeof documentAnalyticsQuerySchema>;
export type UsageAnalyticsQueryInput = z.infer<typeof usageAnalyticsQuerySchema>;
export type CustomReportInput = z.infer<typeof customReportSchema>;
