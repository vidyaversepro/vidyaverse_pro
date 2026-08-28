// @ts-nocheck
import { FastifyPluginAsync } from 'fastify';
import { attendanceService } from './attendance.service.js';
import { attendanceSessionCreateSchema, markAttendanceSchema, qrCheckInSchema, attendanceRecordUpdateSchema, attendanceQuerySchema, attendanceReportSchema, } from '@vidyaverse/shared-validation';
const attendanceRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.addHook('onRequest', fastify.authenticate);
    // ============================================================================
    // SESSIONS
    // ============================================================================
    /**
     * Create attendance session
     */
    fastify.post('/sessions', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin', 'teacher'])],
        handler: async (request, reply) => {
            const institutionId = request.institutionId;
            const userId = request.user.userId;
            const data = request.body;
            const session = await attendanceService.createSession(institutionId, userId, data);
            return reply.status(201).send({ success: true, data: session });
        },
    });
    /**
     * List attendance sessions
     */
    fastify.get('/sessions', {
        preHandler: [fastify.requireInstitution],
        handler: async (request) => {
            const institutionId = request.institutionId;
            const query = attendanceQuerySchema.parse(request.query);
            const result = await attendanceService.listSessions(institutionId, query);
            return { success: true, data: result.sessions, pagination: result.pagination };
        },
    });
    /**
     * Get session by ID
     */
    fastify.get('/sessions/:id', {
        preHandler: [fastify.requireInstitution],
        handler: async (request) => {
            const { id } = request.params;
            const institutionId = request.institutionId;
            const session = await attendanceService.getSession(id, institutionId);
            return { success: true, data: session };
        },
    });
    /**
     * Close session
     */
    fastify.post('/sessions/:id/close', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin', 'teacher'])],
        handler: async (request) => {
            const { id } = request.params;
            const institutionId = request.institutionId;
            const session = await attendanceService.closeSession(id, institutionId);
            return { success: true, data: session };
        },
    });
    /**
     * Refresh QR code
     */
    fastify.post('/sessions/:id/refresh-qr', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin', 'teacher'])],
        handler: async (request) => {
            const { id } = request.params;
            const institutionId = request.institutionId;
            const qrCode = await attendanceService.refreshQR(id, institutionId);
            return { success: true, data: { qrCode } };
        },
    });
    // ============================================================================
    // MARKING ATTENDANCE
    // ============================================================================
    /**
     * Mark attendance (bulk)
     */
    fastify.post('/mark', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin', 'teacher'])],
        handler: async (request) => {
            const institutionId = request.institutionId;
            const userId = request.user.userId;
            const data = request.body;
            const records = await attendanceService.markAttendance(institutionId, userId, data);
            return { success: true, data: records };
        },
    });
    /**
     * QR check-in (for student app)
     */
    fastify.post('/check-in', {
        preHandler: [fastify.requireInstitution],
        handler: async (request) => {
            const institutionId = request.institutionId;
            const studentId = request.user.studentId; // Assuming student context
            if (!studentId) {
                throw new Error('Student ID is required for check-in');
            }
            const data = request.body;
            const record = await attendanceService.processQRCheckIn(studentId, institutionId, data);
            return { success: true, data: record };
        },
    });
    /**
     * Update attendance record
     */
    fastify.patch('/records/:recordId', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin', 'teacher'])],
        handler: async (request) => {
            const { recordId } = request.params;
            const institutionId = request.institutionId;
            const data = request.body;
            const record = await attendanceService.updateRecord(recordId, institutionId, data);
            return { success: true, data: record };
        },
    });
    // ============================================================================
    // REPORTS
    // ============================================================================
    /**
     * Get student attendance
     */
    fastify.get('/students/:studentId', {
        preHandler: [fastify.requireInstitution],
        handler: async (request) => {
            const { studentId } = request.params;
            const institutionId = request.institutionId;
            const { startDate, endDate } = request.query;
            const result = await attendanceService.getStudentAttendance(studentId, institutionId, startDate, endDate);
            return { success: true, data: result };
        },
    });
    /**
     * Get section report
     */
    fastify.post('/reports/section', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin', 'teacher'])],
        handler: async (request) => {
            const institutionId = request.institutionId;
            const data = request.body;
            const report = await attendanceService.getSectionReport(institutionId, data);
            return { success: true, data: report };
        },
    });
    /**
     * Get daily stats
     */
    fastify.get('/stats/daily', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin'])],
        handler: async (request) => {
            const institutionId = request.institutionId;
            const { date } = request.query;
            const stats = await attendanceService.getDailyStats(institutionId, date || new Date().toISOString().split('T')[0]);
            return { success: true, data: stats };
        },
    });
};
export default attendanceRoutes;
