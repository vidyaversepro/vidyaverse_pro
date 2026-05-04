import { prisma } from '../../config/database.js';
import { BadRequestError, NotFoundError } from '../../utils/errors.js';
import { templateResolver } from '../templates/template-resolver.js';
import { templateService } from '../templates/template.service.js';
import { generateVerificationQRCode } from '../../utils/qrcode.js';
import { generatePDFFromHTML, generateImageFromHTML } from '../../utils/pdf-generator.js';
import { uploadToMinio, getMinioFileUrl } from '../../config/minio.js';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import type {
    CreateVisitingCardInput,
    VisitingCardQueryInput,
    GenerateBulkVisitingCardsInput
} from '@vidyaverse/shared-validation';
import { type VisitingCardStatus, type TemplateAudience, ServiceType } from '@prisma/client';

export const createVisitingCardService = (tx: any = prisma) => ({
    /**
     * Generate visiting card
     */
    async create(institutionId: string, data: CreateVisitingCardInput) {
        if (!data.studentId && !data.userId) {
            throw new BadRequestError('Either studentId or userId must be provided');
        }

        // Determine Audience & Fetch data
        let audience: TemplateAudience = 'STUDENT';
        let student = null;
        let user = null;
        let personName = '';
        let personEmail = data.email || '';
        let personPhone = data.phone || '';

        const institution = await tx.institution.findUnique({
            where: { id: institutionId }
        });

        if (!institution) {
            throw new NotFoundError('Institution not found');
        }

        if (data.studentId) {
            audience = 'STUDENT';
            student = await tx.student.findFirst({
                where: { id: data.studentId, institutionId },
                include: {
                    section: {
                        include: { class: true, stream: true },
                    },
                },
            });

            if (!student) throw new NotFoundError('Student not found');
            personName = student.name;
        } else if (data.userId) {
            // Check if user has role in this institution
            const userRole = await tx.userInstitutionRole.findFirst({
                where: { userId: data.userId, institutionId },
                include: { user: true }
            });

            if (!userRole) {
                throw new NotFoundError('User not found in this institution');
            }

            user = userRole.user;
            audience = userRole.role === 'ADMIN' ? 'ADMIN' : 'TEACHER'; // or 'ALL'
            personName = user.name;
            if (!personEmail) personEmail = user.email;
            if (!personPhone) personPhone = user.phone || '';
        }

        // Get template
        let template;
        if (data.templateId) {
            template = await templateResolver.resolveById(data.templateId, institutionId);
            if (template.serviceType !== ServiceType.visiting_card) {
                throw new BadRequestError('Provided template is not a visiting card template');
            }
        } else {
            template = await templateResolver.resolveTemplate({
                institutionId,
                productType: ServiceType.visiting_card,
                audience
            });
        }

        // Generate unique card number
        const cardNumber = await this.generateCardNumber(institutionId);

        // Generate verification URL and QR code
        const verificationUrl = `${env.FRONTEND_URL || 'https://vidyaverse.app'}/verify/vc/${cardNumber}`;
        const qrCode = await generateVerificationQRCode(verificationUrl);

        // Prepare template data
        const templateData = {
            card: {
                number: cardNumber,
                designation: data.designation || (student ? 'Student' : 'Staff'),
                department: data.department || (student?.section?.class?.name || ''),
                email: personEmail,
                phone: personPhone,
                website: data.website || '',
                linkedinUrl: data.linkedinUrl || '',
                issueDate: new Date(),
            },
            person: {
                id: student?.id || user?.id,
                name: personName,
                photoUrl: student?.photoUrl || user?.image,
            },
            student: student ? {
                admissionNo: student.admissionNumber,
                class: student.section?.class?.name || '',
                section: student.section?.name || '',
                stream: student.section?.stream?.name || '',
                fatherName: student.fatherName,
                dob: student.dob,
                bloodGroup: student.bloodGroup,
            } : null,
            institution: {
                name: institution.name,
                logo: institution.logoUrl,
                address: institution.address,
                phone: institution.contactPhone,
                email: institution.contactEmail,
                website: '', // Institution schema might not have website
            },
            qrCode,
            verificationUrl,
        };

        // Render template
        const html = await templateService.render(template.id, institutionId, templateData);

        // Generate PDF (Usually 85.6mm x 54mm for visiting cards)
        const pdfBuffer = await generatePDFFromHTML(html, {
            width: template.widthMm ? Number(template.widthMm) : 85.6,
            height: template.heightMm ? Number(template.heightMm) : 54,
            orientation: template.orientation as 'portrait' | 'landscape' || 'landscape',
        });

        // Upload to MinIO
        const filename = `visiting-cards/${institutionId}/${cardNumber}.pdf`;
        await uploadToMinio(filename, pdfBuffer, 'application/pdf');
        const pdfUrl = await getMinioFileUrl(filename);

        // Generate thumbnail
        const imageBuffer = await generateImageFromHTML(html, {
            width: template.widthMm ? Number(template.widthMm) : 85.6,
            height: template.heightMm ? Number(template.heightMm) : 54,
            scale: 2,
            format: 'png',
        });

        const thumbnailFilename = `visiting-cards/${institutionId}/thumbnails/${cardNumber}.png`;
        await uploadToMinio(thumbnailFilename, imageBuffer, 'image/png');
        const thumbnailUrl = await getMinioFileUrl(thumbnailFilename);

        // Save record
        const visitingCard = await tx.visitingCard.create({
            data: {
                studentId: data.studentId || null,
                userId: data.userId || null,
                institutionId,
                templateId: template.id,
                cardNumber,
                designation: data.designation,
                department: data.department,
                email: personEmail,
                phone: personPhone,
                website: data.website,
                linkedinUrl: data.linkedinUrl,
                frontPdfUrl: pdfUrl,
                thumbnailUrl,
                qrCodeData: qrCode,
                issueDate: new Date(),
                status: 'generated' as VisitingCardStatus,
            },
        });

        logger.info('Visiting card generated', {
            institutionId,
            visitingCardId: visitingCard.id,
            cardNumber,
        });

        return {
            visitingCard,
            pdfUrl,
            thumbnailUrl,
        };
    },

    /**
     * Generate visiting cards in bulk
     */
    async generateBulk(institutionId: string, data: GenerateBulkVisitingCardsInput) {
        const results = {
            successful: [] as string[],
            failed: [] as { id: string; error: string }[],
        };

        const batchSize = 5;
        const ids = [...(data.studentIds || []), ...(data.userIds || [])];
        const isStudentBatch = (data.studentIds?.length || 0) > 0;

        for (let i = 0; i < ids.length; i += batchSize) {
            const batch = ids.slice(i, i + batchSize);

            await Promise.all(
                batch.map(async (id) => {
                    try {
                        const createData: CreateVisitingCardInput = isStudentBatch 
                            ? { studentId: id, templateId: data.templateId }
                            : { userId: id, templateId: data.templateId };

                        await this.create(institutionId, createData);
                        results.successful.push(id);
                    } catch (error: any) {
                        results.failed.push({
                            id,
                            error: error.message,
                        });
                        logger.error('Failed to generate visiting card', { id, error });
                    }
                })
            );
        }

        return results;
    },

    /**
     * List visiting cards
     */
    async list(institutionId: string, query: VisitingCardQueryInput) {
        const { studentId, userId, status, search, page, limit } = query;
        const skip = (page - 1) * limit;

        const where: any = { institutionId };
        if (studentId) where.studentId = studentId;
        if (userId) where.userId = userId;
        if (status) where.status = status as unknown as VisitingCardStatus;

        if (search) {
            where.OR = [
                { cardNumber: { contains: search } },
                { student: { name: { contains: search } } },
                { user: { name: { contains: search } } },
            ];
        }

        const [visitingCards, total] = await Promise.all([
            tx.visitingCard.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                            photoUrl: true,
                            section: { select: { name: true, class: { select: { name: true } } } },
                        },
                    },
                    user: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                            email: true,
                        }
                    },
                    template: {
                        select: { name: true },
                    },
                },
            }),
            tx.visitingCard.count({ where }),
        ]);

        return {
            visitingCards,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    },

    /**
     * Get visiting card by ID
     */
    async getById(id: string, institutionId: string) {
        const visitingCard = await tx.visitingCard.findFirst({
            where: { id, institutionId },
            include: {
                student: true,
                user: true,
                template: true,
            },
        });

        if (!visitingCard) {
            throw new NotFoundError('Visiting card not found');
        }

        return visitingCard;
    },

    /**
     * Generate unique visiting card number
     */
    async generateCardNumber(institutionId: string): Promise<string> {
        const year = new Date().getFullYear();
        const prefix = `VC${year}`;

        const latest = await tx.visitingCard.findFirst({
            where: {
                institutionId,
                cardNumber: { startsWith: prefix },
            },
            orderBy: { cardNumber: 'desc' },
        });

        let sequence = 1;
        if (latest?.cardNumber) {
            const lastSequence = parseInt(latest.cardNumber.slice(-6), 10);
            sequence = lastSequence + 1;
        }

        return `${prefix}${sequence.toString().padStart(6, '0')}`;
    },
});

export const visitingCardService = createVisitingCardService();
