import { prisma } from '../../config/database.js';
import { BadRequestError, NotFoundError } from '../../utils/errors.js';
import { templateService } from '../templates/template.service.js';
import { templateResolver } from '../templates/template-resolver.js';
import { generatePDFFromHTML } from '../../utils/pdf-generator.js';
import { generateStudentQRCode } from '../../utils/qrcode.js';
import { storage } from '../../config/minio.js';
import { logger } from '../../utils/logger.js';
import type {
    GenerateHallTicketInput,
    BulkGenerateHallTicketsInput,
    HallTicketQueryInput,
    ExamScheduleCreateInput,
    ExamScheduleUpdateInput,
    ExamSubjectCreateInput,
} from '@vidyaverse/shared-validation';

export const createHallTicketService = (tx: any = prisma) => ({
    // ============================================================================
    // EXAM SCHEDULE MANAGEMENT
    // ============================================================================

    async createExamSchedule(institutionId: string, data: ExamScheduleCreateInput) {
        const schedule = await tx.examSchedule.create({
            data: {
                institutionId,
                examName: data.examName,
                examType: data.examType,
                academicYear: data.academicYear,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                instructions: data.instructions,
                reportingTime: data.reportingTime ? new Date(`1970-01-01T${data.reportingTime}`) : null,
                status: 'draft',
            },
        });

        logger.info('Exam schedule created', { scheduleId: schedule.id });
        return schedule;
    },

    async updateExamSchedule(
        id: string,
        institutionId: string,
        data: ExamScheduleUpdateInput
    ) {
        await this.getExamScheduleById(id, institutionId);

        const schedule = await tx.examSchedule.update({
            where: { id },
            data: {
                ...(data.examName && { examName: data.examName }),
                ...(data.examType && { examType: data.examType }),
                ...(data.academicYear && { academicYear: data.academicYear }),
                ...(data.startDate && { startDate: new Date(data.startDate) }),
                ...(data.endDate && { endDate: new Date(data.endDate) }),
                ...(data.instructions !== undefined && { instructions: data.instructions }),
                ...(data.reportingTime && {
                    reportingTime: new Date(`1970-01-01T${data.reportingTime}`),
                }),
            },
        });

        return schedule;
    },

    async getExamScheduleById(id: string, institutionId: string) {
        const schedule = await tx.examSchedule.findFirst({
            where: { id, institutionId },
            include: {
                subjects: true,
                _count: {
                    select: { hallTickets: true },
                },
            },
        });

        if (!schedule) {
            throw new NotFoundError('Exam schedule not found');
        }

        return schedule;
    },

    async listExamSchedules(institutionId: string, status?: string) {
        const schedules = await tx.examSchedule.findMany({
            where: {
                institutionId,
                ...(status && { status: status as import('@prisma/client').ExamScheduleStatus }),
            },
            include: {
                _count: {
                    select: { subjects: true, hallTickets: true },
                },
            },
            orderBy: { startDate: 'desc' },
        });

        return schedules;
    },

    async publishExamSchedule(id: string, institutionId: string) {
        const schedule = await this.getExamScheduleById(id, institutionId);

        if (schedule.subjects.length === 0) {
            throw new BadRequestError('Cannot publish schedule without subjects');
        }

        const updated = await tx.examSchedule.update({
            where: { id },
            data: { status: 'published' },
        });

        return updated;
    },

    async addExamSubject(institutionId: string, data: ExamSubjectCreateInput) {
        // Verify exam schedule exists
        await this.getExamScheduleById(data.examScheduleId, institutionId);

        const subject = await tx.examSubject.create({
            data: {
                examScheduleId: data.examScheduleId,
                subjectName: (data as any).subjectName || (data as any).subjectId || 'Unknown',
                subjectCode: (data as any).subjectCode || null,
                examDate: new Date(data.examDate),
                startTime: new Date(`1970-01-01T${data.startTime}`),
                durationMinutes: (data as any).durationMinutes || 120,
                venue: data.venue,
                maxMarks: data.maxMarks,
            },
        });

        return subject;
    },

    // ============================================================================
    // HALL TICKET GENERATION
    // ============================================================================

    async generate(institutionId: string, data: GenerateHallTicketInput) {
        const { studentId, examScheduleId, templateId } = data;

        // Get student with all related data
        const student = await tx.student.findFirst({
            where: { id: studentId, institutionId },
            include: {
                section: {
                    include: {
                        class: true,
                        stream: true,
                    },
                },
                institution: true,
            },
        });

        if (!student) {
            throw new NotFoundError('Student not found');
        }

        // Get exam schedule with subjects
        const examSchedule = await this.getExamScheduleById(examScheduleId, institutionId);

        if (examSchedule.status !== 'published') {
            throw new BadRequestError('Exam schedule must be published to generate hall tickets');
        }

        // Check if hall ticket already exists
        const existing = await tx.hallTicket.findFirst({
            where: { studentId, examScheduleId },
        });

        if (existing) {
            return existing;
        }

        // Get template
        const template = templateId
            ? await templateResolver.resolveById(templateId, institutionId)
            : await templateResolver.resolveTemplate({ institutionId, productType: 'hall_ticket', audience: 'STUDENT' });

        if (!template) {
            throw new Error('No hall ticket template found. Please create a template first.');
        }

        // Generate hall ticket number
        const ticketNumber = await this.generateTicketNumber(institutionId, examScheduleId);

        // Generate QR code
        const qrData = JSON.stringify({
            t: ticketNumber,
            s: student.admissionNumber,
            e: examSchedule.examName,
        });
        const qrCode = await generateStudentQRCode({
            id: student.id,
            admissionNo: student.admissionNumber || '',
            name: student.name,
            institutionCode: student.institution.code || 'VV'
        });

        // Prepare template data
        const templateData = {
            student: {
                id: student.id,
                name: student.name,
                admissionNumber: student.admissionNumber,
                photoUrl: student.photoUrl,
                fatherName: student.fatherName,
                motherName: student.motherName,
                dob: student.dob,
                sex: student.sex,
                address: student.address,
            },
            section: student.section,
            class: student.section.class,
            stream: student.section.stream,
            institution: student.institution,
            exam: {
                name: examSchedule.examName,
                type: examSchedule.examType,
                startDate: examSchedule.startDate,
                endDate: examSchedule.endDate,
                instructions: examSchedule.instructions,
                reportingTime: examSchedule.reportingTime,
                subjects: examSchedule.subjects.map((es: any) => ({
                    name: es.subjectName,
                    code: es.subjectCode,
                    date: es.examDate,
                    startTime: es.startTime,
                    durationMinutes: es.durationMinutes,
                    venue: es.venue,
                    maxMarks: es.maxMarks,
                })),
            },
            hallTicket: {
                number: ticketNumber,
                qrCode,
            },
        };

        // Render template
        const html = await templateService.render(template.id, institutionId, templateData);

        // Generate PDF
        const pdfBuffer = await generatePDFFromHTML(html, {
            width: Number(template.widthMm),
            height: Number(template.heightMm),
            orientation: template.orientation as 'portrait' | 'landscape',
        });

        // Upload to MinIO
        const objectName = storage.generateObjectName(
            institutionId,
            'pdfs',
            `hall-ticket-${ticketNumber}.pdf`
        );
        const pdfUrl = await storage.uploadFile(objectName, pdfBuffer, 'application/pdf');

        // Create database record
        const hallTicket = await tx.hallTicket.create({
            data: {
                studentId,
                institutionId,
                examScheduleId,
                templateId: template.id,
                hallTicketNumber: ticketNumber,
                qrCodeData: qrData,
                pdfUrl,
                status: 'generated',
            },
            include: {
                student: true,
                examSchedule: true,
            },
        });

        logger.info('Hall ticket generated', { ticketNumber, studentId });
        return hallTicket;
    },

    async generateBulk(institutionId: string, data: BulkGenerateHallTicketsInput) {
        const { studentIds, examScheduleId, templateId } = data;
        const results = {
            successful: [] as Record<string, unknown>[],
            failed: [] as { studentId: string; error: string }[],
        };

        for (const studentId of studentIds) {
            try {
                const hallTicket = await this.generate(institutionId, {
                    studentId,
                    examScheduleId,
                    templateId,
                });
                results.successful.push(hallTicket);
            } catch (error: any) {
                results.failed.push({
                    studentId,
                    error: error.message,
                });
            }
        }

        logger.info('Bulk hall ticket generation completed', {
            total: studentIds.length,
            successful: results.successful.length,
            failed: results.failed.length,
        });

        return results;
    },

    async list(institutionId: string, query: HallTicketQueryInput) {
        const { examScheduleId, sectionId, status, page, limit } = query;
        const skip = (page - 1) * limit;

        const where = {
            institutionId,
            ...(examScheduleId && { examScheduleId }),
            ...(sectionId && { student: { sectionId } }),
            ...(status && { status: status as import('@prisma/client').HallTicketStatus }),
        };

        const [tickets, total] = await Promise.all([
            tx.hallTicket.findMany({
                where,
                skip,
                take: limit,
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                            admissionNumber: true,
                            photoUrl: true,
                            section: {
                                include: { class: true },
                            },
                        },
                    },
                    examSchedule: {
                        select: {
                            examName: true,
                            examType: true,
                            startDate: true,
                            endDate: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            tx.hallTicket.count({ where }),
        ]);

        return {
            tickets,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    },

    async getById(id: string, institutionId: string) {
        const ticket = await tx.hallTicket.findFirst({
            where: { id, institutionId },
            include: {
                student: {
                    include: {
                        section: {
                            include: { class: true },
                        },
                    },
                },
                examSchedule: {
                    include: {
                        subjects: true,
                    },
                },
            },
        });

        if (!ticket) {
            throw new NotFoundError('Hall ticket not found');
        }

        return ticket;
    },

    async markAsIssued(id: string, institutionId: string) {
        await this.getById(id, institutionId);

        const ticket = await tx.hallTicket.update({
            where: { id },
            data: {
                status: 'sent',
                sentAt: new Date(),
            },
        });

        return ticket;
    },

    // ============================================================================
    // HELPERS
    // ============================================================================

    async generateTicketNumber(institutionId: string, examScheduleId: string): Promise<string> {
        const count = await tx.hallTicket.count({
            where: { institutionId, examScheduleId },
        });

        const year = new Date().getFullYear();
        const sequence = String(count + 1).padStart(5, '0');

        return `HT${year}${sequence}`;
    },
});

export const hallTicketService = createHallTicketService();
