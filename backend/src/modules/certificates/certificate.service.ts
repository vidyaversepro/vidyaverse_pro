import { prisma } from '../../config/database.js';
import { BadRequestError, NotFoundError } from '../../utils/errors.js';
import { templateService } from '../templates/template.service.js';
import { generateVerificationQRCode } from '../../utils/qrcode.js';
import { templateResolver } from '../templates/template-resolver.js';
import { generatePDFFromHTML, generateImageFromHTML } from '../../utils/pdf-generator.js';
import { uploadToMinio, getMinioFileUrl } from '../../config/minio.js';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import type {
    CreateCertificateInput,
    CertificateQueryInput,
    GenerateBulkCertificatesInput
} from '@vidyaverse/shared-validation';
import type { CertificateType, CertificateStatus } from '@prisma/client';

export const createCertificateService = (tx: any = prisma) => ({
    /**
     * Generate certificate for a student
     */
    async create(institutionId: string, data: CreateCertificateInput) {
        // Get student with related data
        const student = await tx.student.findFirst({
            where: { id: data.studentId, institutionId },
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

        // Get template
        const template = data.templateId
            ? await templateResolver.resolveById(data.templateId, institutionId)
            : await templateResolver.resolveTemplate({ institutionId, productType: 'certificate', audience: 'STUDENT' });

        if (!template) {
            throw new BadRequestError('No certificate template found. Please create one first.');
        }

        // Generate unique certificate number
        const certificateNo = await this.generateCertificateNumber(institutionId);

        // Generate verification URL and QR code
        const verificationUrl = `${env.FRONTEND_URL || 'https://vidyaverse.app'}/verify/${certificateNo}`;
        const qrCode = await generateVerificationQRCode(verificationUrl);

        // Prepare template data
        const templateData = {
            certificate: {
                number: certificateNo,
                type: data.certificateType,
                title: data.title,
                description: data.description,
                eventName: data.eventName,
                eventDate: data.eventDate ? new Date(data.eventDate) : null,
                position: data.position,
                grade: data.grade,
                issueDate: new Date(),
                ...data.customFields,
            },
            student: {
                id: student.id,
                admissionNo: student.admissionNumber,
                name: student.name,
                fullName: student.name,
                fatherName: student.fatherName,
                dateOfBirth: student.dob,
                gender: student.sex,
                photoUrl: student.photoUrl,
            },
            class: {
                name: student.section?.class?.name || '',
                section: student.section?.name || '',
            },
            stream: {
                name: student.section?.stream?.name || '',
            },
            institution: {
                name: student.institution.name,
                logo: student.institution.logoUrl,
                address: student.institution.address,
                phone: student.institution.contactPhone,
                email: student.institution.contactEmail,
                signature: student.institution.signatureUrl,
                signatureTitle: student.institution.signatureTitle,
            },
            qrCode,
            verificationUrl,
        };

        // Render template
        const html = await templateService.render(template.id, institutionId, templateData);

        // Generate PDF (A4 size for certificates)
        const pdfBuffer = await generatePDFFromHTML(html, {
            width: template.widthMm ? Number(template.widthMm) : 297, // A4 landscape width
            height: template.heightMm ? Number(template.heightMm) : 210, // A4 landscape height
            orientation: template.orientation as 'portrait' | 'landscape' || 'landscape',
        });

        // Upload to MinIO
        const filename = `certificates/${institutionId}/${certificateNo}.pdf`;
        await uploadToMinio(filename, pdfBuffer, 'application/pdf');
        const pdfUrl = await getMinioFileUrl(filename);

        // Generate thumbnail
        const imageBuffer = await generateImageFromHTML(html, {
            width: template.widthMm ? Number(template.widthMm) : 297,
            height: template.heightMm ? Number(template.heightMm) : 210,
            scale: 1.5,
            format: 'png',
        });

        const thumbnailFilename = `certificates/${institutionId}/thumbnails/${certificateNo}.png`;
        await uploadToMinio(thumbnailFilename, imageBuffer, 'image/png');
        const thumbnailUrl = await getMinioFileUrl(thumbnailFilename);

        // Save certificate record
        const certificate = await tx.certificate.create({
            data: {
                studentId: student.id,
                institutionId,
                templateId: template.id,
                certificateNumber: certificateNo,
                certificateType: data.certificateType as unknown as CertificateType,
                title: data.title,
                description: data.description,
                achievementDetails: JSON.stringify({
                    eventName: data.eventName,
                    eventDate: data.eventDate,
                    position: data.position,
                    customFields: data.customFields,
                }),
                issueDate: new Date(),
                pdfUrl,
                status: 'generated' as CertificateStatus,
            },
        });

        logger.info('Certificate generated', {
            studentId: student.id,
            certificateId: certificate.id,
            certificateNo,
        });

        return {
            certificate,
            pdfUrl,
            thumbnailUrl,
        };
    },

    /**
     * Generate certificates in bulk
     */
    async generateBulk(institutionId: string, data: GenerateBulkCertificatesInput) {
        const results = {
            successful: [] as string[],
            failed: [] as { studentId: string; error: string }[],
        };

        const batchSize = 5;
        for (let i = 0; i < data.studentIds.length; i += batchSize) {
            const batch = data.studentIds.slice(i, i + batchSize);

            await Promise.all(
                batch.map(async (studentId) => {
                    try {
                        await this.create(institutionId, {
                            studentId,
                            templateId: data.templateId,
                            certificateType: data.certificateType as any,
                            title: data.title,
                            description: data.description,
                            eventName: data.eventName,
                            eventDate: data.eventDate,
                        });
                        results.successful.push(studentId);
                    } catch (error: any) {
                        results.failed.push({
                            studentId,
                            error: error.message,
                        });
                        logger.error('Failed to generate certificate', { studentId, error });
                    }
                })
            );
        }

        return results;
    },

    /**
     * List certificates
     */
    async list(institutionId: string, query: CertificateQueryInput) {
        const { studentId, certificateType, classId, status, page, limit } = query;
        const skip = (page - 1) * limit;

        const where: any = { institutionId };
        if (studentId) where.studentId = studentId;
        if (certificateType) where.certificateType = certificateType;
        if (status) where.status = status as unknown as CertificateStatus;

        if (classId) {
            where.student = {
                section: { classId },
            };
        }

        const [certificates, total] = await Promise.all([
            tx.certificate.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    student: {
                        select: {
                            id: true,
                            admissionNumber: true,
                            name: true,
                            photoUrl: true,
                            section: {
                                select: {
                                    name: true,
                                    class: { select: { name: true } },
                                },
                            },
                        },
                    },
                    template: {
                        select: { name: true },
                    },
                },
            }),
            tx.certificate.count({ where }),
        ]);

        return {
            certificates,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    },

    /**
     * Get certificate by ID
     */
    async getById(id: string, institutionId: string) {
        const certificate = await tx.certificate.findFirst({
            where: { id, institutionId },
            include: {
                student: true,
                template: true,
            },
        });

        if (!certificate) {
            throw new NotFoundError('Certificate not found');
        }

        return certificate;
    },

    /**
     * Verify certificate by certificate number (public endpoint)
     */
    async verify(certificateNo: string) {
        const certificate = await tx.certificate.findFirst({
            where: { certificateNumber: certificateNo },
            include: {
                student: {
                    select: {
                        name: true,
                        admissionNumber: true,
                    },
                },
                institution: {
                    select: {
                        name: true,
                        logoUrl: true,
                    },
                },
            },
        });

        if (!certificate) {
            return { valid: false, message: 'Certificate not found' };
        }

        return {
            valid: true,
            certificate: {
                certificateNo: certificate.certificateNumber,
                title: certificate.title,
                type: certificate.certificateType,
                issuedTo: certificate.student.name,
                admissionNo: certificate.student.admissionNumber,
                issuedBy: certificate.institution.name,
                issuedOn: certificate.createdAt,
                eventName: certificate.achievementDetails ? JSON.parse(certificate.achievementDetails).eventName : null,
                position: certificate.achievementDetails ? JSON.parse(certificate.achievementDetails).position : null,
            },
        };
    },

    /**
     * Generate unique certificate number
     */
    async generateCertificateNumber(institutionId: string): Promise<string> {
        const year = new Date().getFullYear();
        const prefix = `CERT${year}`;

        // Get the latest certificate number for this year
        const latest = await tx.certificate.findFirst({
            where: {
                institutionId,
                certificateNumber: { startsWith: prefix },
            },
            orderBy: { certificateNumber: 'desc' },
        });

        let sequence = 1;
        if (latest?.certificateNumber) {
            const lastSequence = parseInt(latest.certificateNumber.slice(-6), 10);
            sequence = lastSequence + 1;
        }

        return `${prefix}${sequence.toString().padStart(6, '0')}`;
    },
});

export const certificateService = createCertificateService();
