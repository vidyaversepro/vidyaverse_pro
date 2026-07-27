import { prisma } from '../../config/database.js';
import { NotFoundError } from '../../utils/errors.js';
import { templateService } from '../templates/template.service.js';
import { templateResolver } from '../templates/template-resolver.js';
import { generatePDFFromHTML } from '../../utils/pdf-generator.js';
import { generateStudentQRCode, generateQRCodeDataURL } from '../../utils/qrcode.js';
import { storage } from '../../config/minio.js';
import { buildBrandingContext } from '../../lib/branding-context.js';
import { toDataUri } from '../../lib/asset-inline.js';
import { logger } from '../../utils/logger.js';
import type {
    GenerateLibraryCardInput,
    BulkGenerateLibraryCardsInput,
    LibraryCardQueryInput,
} from '@vidyaverse/shared-validation';

export const createLibraryCardService = (tx: any = prisma) => ({
    async generate(institutionId: string, data: GenerateLibraryCardInput) {
        const { studentId, templateId, validFrom, validUntil, maxBooks } = data;

        // Get student
        const student = await tx.student.findFirst({
            where: { id: studentId, institutionId },
            include: {
                section: {
                    include: {
                        class: true,
                    },
                },
                institution: true,
            },
        });

        if (!student) {
            throw new NotFoundError('Student not found');
        }

        // Check if library card already exists
        const existing = await tx.libraryCard.findFirst({
            where: { studentId, status: 'active' },
        });

        if (existing) {
            return existing;
        }

        // Get template — resolveTemplate auto-seeds the curated default for any
        // institution that has none yet (same path certificate/hall-ticket use).
        const template = templateId
            ? await templateResolver.resolveById(templateId, institutionId)
            : await templateResolver.resolveTemplate({ institutionId, productType: 'library_card', audience: 'STUDENT' });

        if (!template) {
            throw new Error('No library card template found. Please create a template first.');
        }

        // Generate card number
        const cardNumber = await this.generateCardNumber(institutionId);

        const barcode = await generateQRCodeDataURL(cardNumber);

        // Generate QR code
        const qrData = JSON.stringify({
            c: cardNumber,
            s: student.admissionNumber,
            n: student.name,
        });
        const qrCode = await generateStudentQRCode({
            id: student.id,
            admissionNo: student.admissionNumber || '',
            name: student.name,
            institutionCode: student.institution.code || 'VV'
        });

        // Set validity dates
        const now = new Date();
        const from = validFrom ? new Date(validFrom) : now;
        const until = validUntil ? new Date(validUntil) : new Date(now.setFullYear(now.getFullYear() + 1));

        // Prepare template data — shared branding context + flat keys the curated
        // template binds to, plus legacy nested objects for backward-compat.
        const branding = await buildBrandingContext(institutionId, tx);
        const studentPhoto = await toDataUri(student.photoUrl);
        const templateData = {
            ...branding,
            // Flat keys the curated library card template expects:
            studentName: student.name,
            studentPhoto,
            libraryId: cardNumber,
            admissionNumber: student.admissionNumber,
            className: [student.section?.class?.name, student.section?.name].filter(Boolean).join(' - '),
            validUntil: until.toLocaleDateString('en-GB'),
            qrCode,
            // Legacy nested objects (custom templates may still bind to these):
            student: {
                id: student.id,
                name: student.name,
                admissionNumber: student.admissionNumber,
                photoUrl: student.photoUrl,
                sex: student.sex,
            },
            section: student.section,
            class: student.section.class,
            institution: student.institution,
            libraryCard: {
                cardNumber,
                barcode,
                qrCode,
                validFrom: from,
                validUntil: until,
                maxBooks,
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
            `library-card-${cardNumber}.pdf`
        );
        const pdfUrl = await storage.uploadFile(objectName, pdfBuffer, 'application/pdf');

        // Create database record
        const libraryCard = await tx.libraryCard.create({
            data: {
                studentId,
                institutionId,
                templateId: template.id,
                libraryCardNumber: cardNumber,
                barcodeData: cardNumber,
                qrCodeData: qrData,
                issueDate: from,
                expiryDate: until,
                maxBooksAllowed: maxBooks,
                pdfUrl,
                status: 'active',
            },
            include: {
                student: true,
            },
        });

        logger.info('Library card generated', { cardNumber, studentId });
        return libraryCard;
    },

    async generateBulk(institutionId: string, data: BulkGenerateLibraryCardsInput) {
        const { studentIds, templateId, validFrom, validUntil, maxBooks } = data;
        const results = {
            successful: [] as Record<string, unknown>[],
            failed: [] as { studentId: string; error: string }[],
        };

        for (const studentId of studentIds) {
            try {
                const libraryCard = await this.generate(institutionId, {
                    studentId,
                    templateId,
                    validFrom,
                    validUntil,
                    maxBooks,
                });
                results.successful.push(libraryCard);
            } catch (error: any) {
                results.failed.push({
                    studentId,
                    error: error.message,
                });
            }
        }

        return results;
    },

    async list(institutionId: string, query: LibraryCardQueryInput) {
        const { sectionId, status, page, limit } = query;
        const skip = (page - 1) * limit;

        const where = {
            institutionId,
            ...(sectionId && { student: { sectionId } }),
            ...(status && { status: status as import('@prisma/client').LibraryCardStatus }),
        };

        const [cards, total] = await Promise.all([
            tx.libraryCard.findMany({
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
            tx.libraryCard.count({ where }),
        ]);

        return {
            cards,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    },

    async getById(id: string, institutionId: string) {
        const card = await tx.libraryCard.findFirst({
            where: { id, institutionId },
            include: {
                student: {
                    include: {
                        section: {
                            include: { class: true },
                        },
                    },
                },
            },
        });

        if (!card) {
            throw new NotFoundError('Library card not found');
        }

        return card;
    },

    async suspend(id: string, institutionId: string) {
        await this.getById(id, institutionId);

        return tx.libraryCard.update({
            where: { id },
            data: { status: 'suspended' },
        });
    },

    async reactivate(id: string, institutionId: string) {
        await this.getById(id, institutionId);

        return tx.libraryCard.update({
            where: { id },
            data: { status: 'active' },
        });
    },

    async generateCardNumber(institutionId: string): Promise<string> {
        const count = await tx.libraryCard.count({
            where: { institutionId },
        });

        const year = new Date().getFullYear();
        const sequence = String(count + 1).padStart(5, '0');

        return `LIB${year}${sequence}`;
    },
});

export const libraryCardService = createLibraryCardService();
