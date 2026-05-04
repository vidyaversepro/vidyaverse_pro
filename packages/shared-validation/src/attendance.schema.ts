import { z } from 'zod';

// Attendance session
export const attendanceSessionCreateSchema = z.object({
    classId: z.string().uuid(),
    sectionId: z.string().uuid(),
    subjectId: z.string().uuid().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
    type: z.enum(['class', 'event', 'exam', 'activity']).default('class'),
    startTime: z.string().regex(/^\d{2}:\d{2}$/), // HH:MM
    endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    location: z.string().max(255).optional(),
    notes: z.string().max(500).optional(),
});

// Mark attendance (manual)
export const markAttendanceSchema = z.object({
    sessionId: z.string().uuid(),
    records: z.array(z.object({
        studentId: z.string().uuid(),
        status: z.enum(['present', 'absent', 'late', 'excused', 'half_day']),
        remarks: z.string().max(200).optional(),
        arrivalTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    })).min(1),
});

// QR check-in
export const qrCheckInSchema = z.object({
    qrCode: z.string().min(1).max(500),
    deviceId: z.string().max(100).optional(),
    location: z.object({
        latitude: z.number().min(-90).max(90).optional(),
        longitude: z.number().min(-180).max(180).optional(),
    }).optional(),
});

// Update attendance record
export const attendanceRecordUpdateSchema = z.object({
    status: z.enum(['present', 'absent', 'late', 'excused', 'half_day']),
    remarks: z.string().max(200).optional(),
    arrivalTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
});

// Query attendance
export const attendanceQuerySchema = z.object({
    classId: z.string().uuid().optional(),
    sectionId: z.string().uuid().optional(),
    studentId: z.string().uuid().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    type: z.enum(['class', 'event', 'exam', 'activity']).optional(),
    page: z.string().transform(Number).default('1'),
    limit: z.string().transform(Number).default('20'),
});

// Attendance report
export const attendanceReportSchema = z.object({
    sectionId: z.string().uuid(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    format: z.enum(['json', 'csv', 'pdf']).default('json'),
});

export type AttendanceSessionCreateInput = z.infer<typeof attendanceSessionCreateSchema>;
export type MarkAttendanceInput = z.infer<typeof markAttendanceSchema>;
export type QrCheckInInput = z.infer<typeof qrCheckInSchema>;
export type AttendanceRecordUpdateInput = z.infer<typeof attendanceRecordUpdateSchema>;
export type AttendanceQueryInput = z.infer<typeof attendanceQuerySchema>;
export type AttendanceReportInput = z.infer<typeof attendanceReportSchema>;
