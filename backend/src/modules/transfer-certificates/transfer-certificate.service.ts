import { prisma } from '../../config/database.js';
import { BadRequestError, NotFoundError } from '../../utils/errors.js';
import { templateService } from '../templates/template.service.js';
import { templateResolver } from '../templates/template-resolver.js';
import { generatePDFFromHTML } from '../../utils/pdf-generator.js';
import { generateStudentQRCode } from '../../utils/qrcode.js';
import { storage } from '../../config/minio.js';
import { buildBrandingContext } from '../../lib/branding-context.js';
import { logger } from '../../utils/logger.js';
import type {
    GenerateTransferCertificateInput,
    BulkGenerateTCsInput,
    TCQueryInput,
} from '@vidyaverse/shared-validation';

export const createTransferCertificateService = (tx: any = prisma) => ({
    async generate(institutionId: string, data: GenerateTransferCertificateInput) {
        const { studentId, templateId, reason, remarks, conductGrade, lastAttendanceDate, feesCleared, noDues, characterCertificate } = data;

        // Get student with all details
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

        // Validate prerequisites
        if (!feesCleared) {
            throw new BadRequestError('Cannot generate TC: Fees not cleared');
        }

        if (!noDues) {
            throw new BadRequestError('Cannot generate TC: Student has pending dues');
        }

        // Check if TC already exists
        const existing = await tx.transferCertificate.findFirst({
            where: { studentId, status: { in: ['draft', 'pending_approval', 'issued'] } },
        });

        if (existing) {
            throw new BadRequestError('Transfer certificate already exists for this student');
        }

        // Get template — resolveTemplate auto-seeds the curated default for any
        // institution that has none yet (same path certificate/hall-ticket use).
        const template = templateId
            ? await templateResolver.resolveById(templateId, institutionId)
            : await templateResolver.resolveTemplate({ institutionId, productType: 'transfer_certificate', audience: 'STUDENT' });

        if (!template) {
            throw new Error('No transfer certificate template found. Please create a template first.');
        }

        // Generate TC number
        const tcNumber = await this.generateTCNumber(institutionId);

        // Calculate attendance summary
        const attendanceSummary = await this.getAttendanceSummary(studentId);

        const qrCode = await generateStudentQRCode({
            id: student.id,
            admissionNo: student.admissionNumber || '',
            name: student.name,
            institutionCode: student.institution.code || 'VV'
        });

        // Prepare template data — shared branding context + flat keys the curated
        // template binds to, plus legacy nested objects for backward-compat.
        const branding = await buildBrandingContext(institutionId, tx);
        const fmtDate = (d: any) => (d ? new Date(d).toLocaleDateString('en-GB') : '');
        const titleCase = (s: any) =>
            String(s || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        const academicYear = this.getCurrentAcademicYear();
        const templateData = {
            ...branding,
            // Flat keys the curated transfer-certificate template expects:
            studentName: student.name,
            fatherName: student.fatherName,
            motherName: student.motherName,
            dob: fmtDate(student.dob),
            admissionNumber: student.admissionNumber,
            admissionDate: fmtDate(student.dateOfAdmission),
            leavingDate: fmtDate(lastAttendanceDate),
            className: student.section?.class?.name || '',
            lastClassStudied:
                [student.section?.class?.name, student.section?.name].filter(Boolean).join(' - ') +
                (student.section?.stream?.name ? ` (${student.section.stream.name})` : ''),
            conduct: titleCase(conductGrade) || 'Good',
            reason,
            remarks,
            tcNumber,
            place: (student.institution as any)?.city || '',
            issueDate: fmtDate(new Date()),
            academicYear,
            feeClearanceStatus: feesCleared && noDues ? 'Cleared' : 'Dues Outstanding',
            // Legacy nested objects (custom templates may still bind to these):
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
                dateOfAdmission: student.dateOfAdmission,
                religion: student.religion,
                caste: student.caste,
                aadharNumber: student.aadharNumber,
            },
            section: student.section,
            class: student.section.class,
            stream: student.section.stream,
            institution: student.institution,
            tc: {
                number: tcNumber,
                reason,
                remarks,
                conductGrade,
                lastAttendanceDate: new Date(lastAttendanceDate),
                characterCertificate,
                feesCleared,
                noDues,
                qrCode,
                issueDate: new Date(),
                academicYear,
                attendance: attendanceSummary,
            },
        };

        let mappedConductRemarks: any = conductGrade;
        if (conductGrade === 'very_good') {
            mappedConductRemarks = 'good'; // or map to excellent
        }

        let mappedFeeStatus: any = 'pending';
        if (feesCleared && noDues) {
            mappedFeeStatus = 'cleared';
        } else if (!feesCleared || !noDues) {
            mappedFeeStatus = 'dues_outstanding';
        }

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
            `tc-${tcNumber}.pdf`
        );
        const pdfUrl = await storage.uploadFile(objectName, pdfBuffer, 'application/pdf');

        // Create database record
        const tc = await tx.transferCertificate.create({
            data: {
                studentId,
                institutionId,
                templateId: template.id,
                tcSerialNumber: tcNumber,
                admissionDate: student.dateOfAdmission || new Date(),
                leavingDate: new Date(lastAttendanceDate),
                lastClassStudied: student.section.class.name,
                reasonForLeaving: reason,
                conductRemarks: mappedConductRemarks,
                characterRemarks: remarks,
                feeClearanceStatus: mappedFeeStatus,
                pdfUrl,
                status: 'draft',
            },
            include: {
                student: true,
            },
        });

        // Update student status
        await tx.student.update({
            where: { id: studentId },
            data: { status: 'transferred' },
        });

        logger.info('Transfer certificate generated', { tcNumber, studentId });
        return tc;
    },

    async generateBulk(institutionId: string, data: BulkGenerateTCsInput) {
        const { studentIds, templateId, reason, remarks, conductGrade, lastAttendanceDate, feesCleared, noDues, characterCertificate } = data;
        const results = {
            successful: [] as Record<string, unknown>[],
            failed: [] as { studentId: string; error: string }[],
        };

        for (const studentId of studentIds) {
            try {
                // Get basic info for each student for bulk TC
                const tc = await this.generate(institutionId, {
                    studentId,
                    templateId,
                    reason,
                    remarks,
                    conductGrade: conductGrade || 'good',
                    lastAttendanceDate: lastAttendanceDate || new Date().toISOString(),
                    feesCleared: feesCleared ?? true,
                    noDues: noDues ?? true,
                    characterCertificate: characterCertificate ?? true,
                });
                results.successful.push(tc);
            } catch (error: any) {
                results.failed.push({
                    studentId,
                    error: error.message,
                });
            }
        }

        return results;
    },

    async list(institutionId: string, query: TCQueryInput) {
        const { sectionId, status, reason, page, limit } = query;
        const skip = (page - 1) * limit;

        const where = {
            institutionId,
            ...(sectionId && { student: { sectionId } }),
            ...(status && { status: status as import('@prisma/client').TransferCertificateStatus }),
            ...(reason && { reasonForLeaving: reason }),
        };

        const [tcs, total] = await Promise.all([
            tx.transferCertificate.findMany({
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
                },
                orderBy: { createdAt: 'desc' },
            }),
            tx.transferCertificate.count({ where }),
        ]);

        return {
            tcs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    },

    async getById(id: string, institutionId: string) {
        const tc = await tx.transferCertificate.findFirst({
            where: { id, institutionId },
            include: {
                student: {
                    include: {
                        section: {
                            include: { class: true },
                        },
                        institution: true,
                    },
                },
            },
        });

        if (!tc) {
            throw new NotFoundError('Transfer certificate not found');
        }

        return tc;
    },

    async markAsIssued(id: string, institutionId: string) {
        await this.getById(id, institutionId);

        return tx.transferCertificate.update({
            where: { id },
            data: {
                status: 'issued',
                issuedAt: new Date(),
            },
        });
    },

    async cancel(id: string, institutionId: string, reason: string) {
        const tc = await this.getById(id, institutionId);

        if (tc.status === 'issued') {
            throw new BadRequestError('Cannot cancel an issued transfer certificate');
        }

        await tx.student.update({
            where: { id: tc.studentId },
            data: { status: 'active' },
        });

        return tx.transferCertificate.update({
            where: { id },
            data: {
                status: 'cancelled',
                characterRemarks: reason,
            },
        });
    },

    // Public verification endpoint
    async verify(tcNumber: string) {
        const tc = await tx.transferCertificate.findFirst({
            where: { tcSerialNumber: tcNumber },
            include: {
                student: {
                    select: {
                        name: true,
                        admissionNumber: true,
                        fatherName: true,
                    },
                },
                institution: {
                    select: {
                        name: true,
                        address: true,
                    },
                },
            },
        });

        if (!tc) {
            throw new NotFoundError('Transfer certificate not found');
        }

        return {
            verified: true,
            tcNumber: tc.tcSerialNumber,
            studentName: tc.student.name,
            admissionNumber: tc.student.admissionNumber,
            fatherName: tc.student.fatherName,
            institution: tc.institution.name,
            generatedAt: tc.createdAt,
            issuedAt: tc.issuedAt,
            status: tc.status,
        };
    },

    // Helper methods
    // Real attendance summary from attendance_records (late/excused/half_day count
    // as present; only 'absent' is deducted). Returns zeros when no data exists —
    // we never fabricate attendance figures on a legal document.
    async getAttendanceSummary(studentId: string) {
        const records = await tx.attendanceRecord.findMany({
            where: { studentId },
            select: { status: true },
        });
        const totalDays = records.length;
        const absentDays = records.filter((r: { status: string }) => r.status === 'absent').length;
        const presentDays = totalDays - absentDays;
        const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 10000) / 100 : 0;
        return { totalDays, presentDays, absentDays, percentage };
    },

    getCurrentAcademicYear(): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();

        // Academic year starts in April (India)
        if (month >= 3) {
            return `${year}-${year + 1}`;
        }
        return `${year - 1}-${year}`;
    },

    async generateTCNumber(institutionId: string): Promise<string> {
        const count = await tx.transferCertificate.count({
            where: { institutionId },
        });

        const year = new Date().getFullYear();
        const sequence = String(count + 1).padStart(5, '0');

        return `TC${year}${sequence}`;
    },
});

export const transferCertificateService = createTransferCertificateService();
