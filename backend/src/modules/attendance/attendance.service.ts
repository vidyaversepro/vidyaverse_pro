import { prisma } from '../../config/database.js';
import { cache, getRedisClient } from '../../config/redis.js';
import { BadRequestError, NotFoundError } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';
import crypto from 'crypto';
import type {
    AttendanceSessionCreateInput,
    MarkAttendanceInput,
    QrCheckInInput,
    AttendanceRecordUpdateInput,
    AttendanceQueryInput,
    AttendanceReportInput,
} from '@vidyaverse/shared-validation';
import { messagingService } from '../messaging/messaging.service.js';

// QR code TTL in seconds (5 minutes)
const QR_CODE_TTL = 300;

export const attendanceService = {
    // ============================================================================
    // SESSIONS
    // ============================================================================

    async createSession(institutionId: string, userId: string, data: AttendanceSessionCreateInput) {
        const { classId, sectionId, subjectId, date, type, startTime, endTime, location, notes } = data;

        // Verify section exists
        const section = await prisma.section.findFirst({
            where: { id: sectionId, classId, class: { institutionId } },
            include: { class: true },
        });

        if (!section) {
            throw new NotFoundError('Section not found');
        }

        // Check for duplicate session
        const existing = await prisma.attendanceSession.findFirst({
            where: {
                sectionId,
                date: new Date(date),
                type,
                subjectId,
            },
        });

        if (existing) {
            throw new BadRequestError('Attendance session already exists for this date and type');
        }

        const session = await prisma.attendanceSession.create({
            data: {
                institutionId,
                classId,
                sectionId,
                subjectId,
                createdById: userId,
                date: new Date(date),
                type,
                startTime,
                endTime,
                location,
                notes,
                status: 'open',
            },
            include: {
                section: { include: { class: true } },
                subject: true,
            },
        });

        // Generate QR code for this session
        const qrCode = await this.generateSessionQR(session.id, institutionId);

        logger.info('Attendance session created', { sessionId: session.id, sectionId, date });
        return { ...session, qrCode };
    },

    async getSession(id: string, institutionId: string) {
        const session = await prisma.attendanceSession.findFirst({
            where: { id, institutionId },
            include: {
                section: { include: { class: true } },
                subject: true,
                records: {
                    include: {
                        student: { select: { id: true, name: true, admissionNumber: true, photoUrl: true } },
                    },
                },
            },
        });

        if (!session) {
            throw new NotFoundError('Attendance session not found');
        }

        return session;
    },

    async listSessions(institutionId: string, query: AttendanceQueryInput) {
        const { classId, sectionId, date, startDate, endDate, type, page, limit } = query;
        const skip = (page - 1) * limit;

        const where: any = { institutionId };
        if (classId) where.classId = classId;
        if (sectionId) where.sectionId = sectionId;
        if (type) where.type = type;

        if (date) {
            where.date = new Date(date);
        } else if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }

        const [sessions, total] = await Promise.all([
            prisma.attendanceSession.findMany({
                where,
                skip,
                take: limit,
                include: {
                    section: { include: { class: true } },
                    subject: true,
                    _count: { select: { records: true } },
                },
                orderBy: { date: 'desc' },
            }),
            prisma.attendanceSession.count({ where }),
        ]);

        return {
            sessions,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    },

    async closeSession(id: string, institutionId: string) {
        await this.getSession(id, institutionId);

        // Invalidate QR code
        await cache.delPattern(`attendance:qr:${id}`);

        return prisma.attendanceSession.update({
            where: { id },
            data: { status: 'closed', closedAt: new Date() },
        });
    },

    // ============================================================================
    // ATTENDANCE MARKING
    // ============================================================================

    async markAttendance(institutionId: string, userId: string, data: MarkAttendanceInput) {
        const { sessionId, records } = data;

        const session = await this.getSession(sessionId, institutionId);

        if (session.status === 'closed') {
            throw new BadRequestError('Session is closed');
        }

        // Get students in the section
        const sectionStudents = await prisma.student.findMany({
            where: { sectionId: session.sectionId, status: 'active' },
            select: { id: true },
        });

        const validStudentIds = new Set(sectionStudents.map((s) => s.id));

        // Validate all student IDs
        for (const record of records) {
            if (!validStudentIds.has(record.studentId)) {
                throw new BadRequestError(`Student ${record.studentId} is not in this section`);
            }
        }

        // Upsert attendance records
        const results = await Promise.all(
            records.map((record) =>
                prisma.attendanceRecord.upsert({
                    where: {
                        sessionId_studentId: {
                            sessionId,
                            studentId: record.studentId,
                        },
                    },
                    create: {
                        sessionId,
                        studentId: record.studentId,
                        status: record.status,
                        remarks: record.remarks,
                        arrivalTime: record.arrivalTime,
                        markedById: userId,
                        markedAt: new Date(),
                    },
                    update: {
                        status: record.status,
                        remarks: record.remarks,
                        arrivalTime: record.arrivalTime,
                        markedById: userId,
                        markedAt: new Date(),
                    },
                })
            )
        );

        logger.info('Attendance marked', { sessionId, count: records.length, userId });

        // Best-effort WhatsApp absence alerts (batched via digest). Never blocks marking.
        try {
            await this.dispatchAbsenceDigests(institutionId, session, records);
        } catch (err) {
            logger.warn({ err }, '[attendance] failed to buffer absence digests');
        }

        return results;
    },

    /**
     * Buffer a WhatsApp absence alert for each guardian of an absent student who
     * has notifyAttendance enabled on their guardian↔student edge. Buffered events
     * are batched into a digest by the digest worker.
     */
    async dispatchAbsenceDigests(
        institutionId: string,
        session: { id: string; date: Date },
        records: MarkAttendanceInput['records'],
    ) {
        if (!(await messagingService.isMessagingEnabled(institutionId))) return;

        const absentIds = records.filter((r) => r.status === 'absent').map((r) => r.studentId);
        if (absentIds.length === 0) return;

        const dateStr = new Date(session.date).toISOString().slice(0, 10);

        const links = await prisma.guardianStudentLink.findMany({
            where: { institutionId, studentId: { in: absentIds }, notifyAttendance: true },
            include: { student: { select: { id: true, name: true } } },
        });

        for (const link of links) {
            await messagingService.bufferDigestEvent(institutionId, link.guardianId, {
                type: 'attendance_absent',
                studentId: link.studentId,
                childName: link.student.name,
                text: `${link.student.name} आज (${dateStr}) अनुपस्थित रहा`,
            });
        }
    },

    async updateRecord(recordId: string, institutionId: string, data: AttendanceRecordUpdateInput) {
        const record = await prisma.attendanceRecord.findFirst({
            where: { id: recordId },
            include: { session: true },
        });

        if (!record || record.session.institutionId !== institutionId) {
            throw new NotFoundError('Attendance record not found');
        }

        return prisma.attendanceRecord.update({
            where: { id: recordId },
            data: {
                status: data.status,
                remarks: data.remarks,
                arrivalTime: data.arrivalTime,
            },
        });
    },

    // ============================================================================
    // QR-BASED CHECK-IN
    // ============================================================================

    async generateSessionQR(sessionId: string, institutionId: string) {
        const payload = {
            sid: sessionId,
            iid: institutionId,
            ts: Date.now(),
            nonce: crypto.randomBytes(8).toString('hex'),
        };

        const qrData = Buffer.from(JSON.stringify(payload)).toString('base64');

        // Store in Redis with TTL
        const redisClient = getRedisClient();
        await redisClient.setex(`attendance:qr:${sessionId}`, QR_CODE_TTL, qrData);

        return qrData;
    },

    async refreshQR(sessionId: string, institutionId: string) {
        await this.getSession(sessionId, institutionId);
        return this.generateSessionQR(sessionId, institutionId);
    },

    async processQRCheckIn(studentId: string, institutionId: string, data: QrCheckInInput) {
        const { qrCode } = data;

        // Decode QR
        let payload: any;
        try {
            payload = JSON.parse(Buffer.from(qrCode, 'base64').toString('utf-8'));
        } catch (err) {
            logger.error({ err }, 'Attendance calculation failed during QR decode');
            throw new BadRequestError('Invalid QR code');
        }

        const { sid: sessionId, iid: qrInstitutionId } = payload;

        if (qrInstitutionId !== institutionId) {
            throw new BadRequestError('Invalid QR code for this institution');
        }

        // Verify QR is still valid
        const redisClient = getRedisClient();
        const storedQR = await redisClient.get(`attendance:qr:${sessionId}`);
        if (storedQR !== qrCode) {
            throw new BadRequestError('QR code expired or invalid');
        }

        // Get session
        const session = await this.getSession(sessionId, institutionId);

        if (session.status === 'closed') {
            throw new BadRequestError('Attendance session is closed');
        }

        // Verify student belongs to the section
        const student = await prisma.student.findFirst({
            where: { id: studentId, sectionId: session.sectionId, status: 'active' },
        });

        if (!student) {
            throw new BadRequestError('Student not in this section');
        }

        // Check if already marked
        const existingRecord = await prisma.attendanceRecord.findFirst({
            where: { sessionId, studentId },
        });

        if (existingRecord) {
            throw new BadRequestError('Attendance already marked');
        }

        // Calculate if late
        const now = new Date();
        const [startHour, startMinute] = session.startTime.split(':').map(Number);
        const sessionStart = new Date(session.date);
        sessionStart.setHours(startHour, startMinute, 0, 0);

        const lateThreshold = 15; // minutes
        const isLate = (now.getTime() - sessionStart.getTime()) > lateThreshold * 60 * 1000;

        // Create record
        const record = await prisma.attendanceRecord.create({
            data: {
                sessionId,
                studentId,
                status: isLate ? 'late' : 'present',
                arrivalTime: now.toTimeString().slice(0, 5),
                markedAt: now,
                checkInMethod: 'qr',
            },
            include: {
                student: { select: { id: true, name: true } },
            },
        });

        logger.info('QR check-in successful', { sessionId, studentId, isLate });
        return record;
    },

    // ============================================================================
    // REPORTS
    // ============================================================================

    async getStudentAttendance(studentId: string, institutionId: string, startDate?: string, endDate?: string) {
        const where: any = {
            studentId,
            session: { institutionId },
        };

        if (startDate && endDate) {
            where.session = {
                ...where.session,
                date: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                },
            };
        }

        const records = await prisma.attendanceRecord.findMany({
            where,
            include: {
                session: {
                    select: { date: true, type: true, subject: true },
                },
            },
            orderBy: { session: { date: 'desc' } },
        });

        // Calculate stats
        const total = records.length;
        const present = records.filter((r) => r.status === 'present').length;
        const late = records.filter((r) => r.status === 'late').length;
        const absent = records.filter((r) => r.status === 'absent').length;
        const excused = records.filter((r) => r.status === 'excused').length;

        return {
            records,
            stats: {
                total,
                present,
                late,
                absent,
                excused,
                attendanceRate: total > 0 ? ((present + late) / total * 100).toFixed(1) : '0',
            },
        };
    },

    async getSectionReport(institutionId: string, data: AttendanceReportInput) {
        const { sectionId, startDate, endDate } = data;

        // Get all students in section
        const students = await prisma.student.findMany({
            where: { sectionId, status: 'active' },
            select: { id: true, name: true, admissionNumber: true },
            orderBy: { name: 'asc' },
        });

        // Get all sessions in date range
        const sessions = await prisma.attendanceSession.findMany({
            where: {
                institutionId,
                sectionId,
                date: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                },
            },
            include: {
                records: true,
            },
            orderBy: { date: 'asc' },
        });

        // Build report
        const report = students.map((student) => {
            let present = 0;
            let late = 0;
            let absent = 0;
            let excused = 0;

            sessions.forEach((session) => {
                const record = session.records.find((r) => r.studentId === student.id);
                if (record) {
                    switch (record.status) {
                        case 'present':
                            present++;
                            break;
                        case 'late':
                            late++;
                            break;
                        case 'absent':
                            absent++;
                            break;
                        case 'excused':
                            excused++;
                            break;
                    }
                } else {
                    absent++; // Not marked = absent
                }
            });

            const total = sessions.length;
            const attendanceRate = total > 0 ? ((present + late) / total * 100).toFixed(1) : '0';

            return {
                student,
                present,
                late,
                absent,
                excused,
                total,
                attendanceRate,
            };
        });

        return {
            sectionId,
            dateRange: { startDate, endDate },
            totalSessions: sessions.length,
            students: report,
        };
    },

    async getDailyStats(institutionId: string, date: string) {
        const targetDate = new Date(date);

        const sessions = await prisma.attendanceSession.findMany({
            where: { institutionId, date: targetDate },
            include: {
                section: { include: { class: true } },
                records: true,
            },
        });

        const stats = sessions.map((session) => {
            const present = session.records.filter((r) => r.status === 'present').length;
            const late = session.records.filter((r) => r.status === 'late').length;
            const absent = session.records.filter((r) => r.status === 'absent').length;

            return {
                sessionId: session.id,
                class: session.section.class.name,
                section: session.section.name,
                type: session.type,
                present,
                late,
                absent,
                total: session.records.length,
            };
        });

        const totals = stats.reduce(
            (acc, s) => ({
                present: acc.present + s.present,
                late: acc.late + s.late,
                absent: acc.absent + s.absent,
                total: acc.total + s.total,
            }),
            { present: 0, late: 0, absent: 0, total: 0 }
        );

        return { date, sessions: stats, totals };
    },
};
