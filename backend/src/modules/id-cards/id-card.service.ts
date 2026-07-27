import { prisma } from '../../config/database.js';
import { BadRequestError, NotFoundError } from '../../utils/errors.js';
import { templateService } from '../templates/template.service.js';
import { templateResolver } from '../templates/template-resolver.js';
import { generateStudentQRCode } from '../../utils/qrcode.js';
import { generatePDFFromHTML, generateImageFromHTML, generateMultiPagePDF } from '../../utils/pdf-generator.js';
import { uploadToMinio, getMinioFileUrl, downloadFromMinio, getPresignedUrl, deleteObject, extractKey } from '../../config/minio.js';
import { logger } from '../../utils/logger.js';
import { addJob, QUEUE_NAMES } from '../../utils/job-queue.js';
import { ID_CARD_PUPPETEER_CONCURRENCY } from '../../utils/worker-config.js';
import { mergeChunked } from '../../utils/pdf-merger.js';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs/promises';
import { randomUUID } from 'crypto';
import type { IdCardQueryInput, PrintIdCardsInput } from '@vidyaverse/shared-validation';

/**
 * Fetch a storage object and return it as a base64 data URI so Puppeteer can
 * render it without depending on bucket public-read access or presigned TTLs.
 * Returns '' on any failure (missing/legacy/broken URLs) so the template can
 * degrade gracefully via {{#if}} guards.
 */
async function toDataUri(objectKeyOrUrl?: string | null): Promise<string> {
    if (!objectKeyOrUrl) return '';
    try {
        const key = extractKey(objectKeyOrUrl) ?? objectKeyOrUrl;
        const buf = await downloadFromMinio(key);
        const ext = (key.split('.').pop() || '').toLowerCase().split('?')[0];
        const mime =
            ext === 'png' ? 'image/png'
            : ext === 'webp' ? 'image/webp'
            : ext === 'svg' ? 'image/svg+xml'
            : ext === 'gif' ? 'image/gif'
            : 'image/jpeg';
        return `data:${mime};base64,${buf.toString('base64')}`;
    } catch {
        return '';
    }
}

/** dd/mm/yyyy or '' */
function fmtDate(d?: Date | string | null): string {
    if (!d) return '';
    const dt = typeof d === 'string' ? new Date(d) : d;
    if (isNaN(dt.getTime())) return '';
    return dt.toLocaleDateString('en-GB');
}

export const createIdCardService = (tx: any = prisma) => ({
    /**
     * Generate ID card for a single student
     */
    async generateForStudent(
        institutionId: string,
        studentId: string,
        templateId?: string,
        prefetchedStudent?: any
    ) {
        // Get student with all required data
        const student = prefetchedStudent || await tx.student.findFirst({
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

        // Get template (use provided or resolved)
        const template = templateId
            ? await templateResolver.resolveById(templateId, institutionId)
            : await templateResolver.resolveTemplate({
                  institutionId,
                  productType: 'id_card',
                  audience: 'STUDENT'
              });

        if (!template) {
            throw new BadRequestError('No ID card template found. Please create one first.');
        }

        // Generate QR code
        const qrCode = await generateStudentQRCode({
            id: student.id,
            admissionNo: student.admissionNumber || '',
            name: student.name,
            institutionCode: student.institution.code || 'VV',
        });

        // Principal signature comes from the institution's signing authorities
        // (the canonical store populated during onboarding's Authority step).
        // Prefer the PRINCIPAL, else the lowest displayOrder. Fall back to the
        // legacy institution.signatureUrl only if no authority exists.
        const authorities = await tx.institutionAuthority.findMany({
            where: { institutionId },
            orderBy: { displayOrder: 'asc' },
            select: { name: true, designation: true, roleType: true, signatureUrl: true },
        });
        const principal =
            authorities.find((a: { roleType: string }) => a.roleType === 'PRINCIPAL') || authorities[0] || null;

        const ROLE_LABELS: Record<string, string> = {
            PRINCIPAL: 'Principal', VICE_CHANCELLOR: 'Vice Chancellor', HOD: 'Head of Department',
            REGISTRAR: 'Registrar', DEAN: 'Dean', DIRECTOR: 'Director', COORDINATOR: 'Coordinator', TEACHER: 'Teacher',
        };
        const principalName = principal?.name || '';
        const principalTitle =
            principal?.designation || (principal ? ROLE_LABELS[principal.roleType] : '') ||
            student.institution.signatureTitle || 'Principal';

        // Inline all images as data URIs (robust in Puppeteer regardless of
        // bucket public access / presigned TTLs).
        const [photo, institutionLogo, principalSignature, schoolSeal] = await Promise.all([
            toDataUri(student.photoUrl),
            toDataUri(student.institution.logoUrl),
            toDataUri(principal?.signatureUrl || student.institution.signatureUrl),
            toDataUri(student.institution.sealUrl),
        ]);

        const validUntilDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        const className = [student.section?.class?.name, student.section?.name].filter(Boolean).join(' - ');
        const fullAddress = [student.address, student.city, student.state, student.pincode].filter(Boolean).join(', ');

        // Unified render data. Flat keys match the Studio editor's variable
        // vocabulary ({{studentName}}, {{institutionLogo}}, {{qrCode}}, …);
        // nested student/class/institution objects are kept for older templates.
        const flat = {
            // Student
            studentName: student.name,
            studentId: student.id,
            admissionNo: student.admissionNumber || '',
            admissionNumber: student.admissionNumber || '',
            rollNo: (student as any).rollNo ?? '',
            className,
            section: student.section?.name || '',
            stream: student.section?.stream?.name || '',
            dob: fmtDate(student.dob),
            gender: student.sex || '',
            bloodGroup: student.bloodGroup || '',
            fatherName: student.fatherName || '',
            motherName: student.motherName || '',
            guardianName: student.guardianName || '',
            phone: student.contact || student.guardianPhone || '',
            email: student.parentEmail || '',
            address: fullAddress,
            photo,
            photoUrl: photo,
            // Institution / branding
            institutionName: student.institution.name,
            institutionLogo,
            institutionAddress: student.institution.address || '',
            institutionPhone: student.institution.contactPhone || '',
            institutionEmail: student.institution.contactEmail || '',
            institutionCode: student.institution.code || '',
            principalSignature,
            principalName,
            principalTitle,
            schoolSeal,
            // Meta
            academicYear: this.getCurrentAcademicYear(),
            issueDate: fmtDate(new Date()),
            validUntil: fmtDate(validUntilDate),
            qrCode,
            qrData: qrCode,
        };

        const templateData = {
            ...flat,
            student: {
                ...flat,
                name: student.name,
                fullName: student.name,
                dateOfBirth: fmtDate(student.dob),
            },
            class: { name: student.section?.class?.name || '', section: student.section?.name || '', className },
            stream: { name: student.section?.stream?.name || '' },
            institution: {
                name: student.institution.name,
                code: student.institution.code,
                logo: institutionLogo,
                logoUrl: institutionLogo,
                address: student.institution.address,
                phone: student.institution.contactPhone,
                email: student.institution.contactEmail,
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
        const filename = `id-cards/${institutionId}/${student.admissionNumber || student.id}_${Date.now()}.pdf`;
        await uploadToMinio(filename, pdfBuffer, 'application/pdf');
        const pdfUrl = await getMinioFileUrl(filename);

        // Generate thumbnail image
        const imageBuffer = await generateImageFromHTML(html, {
            width: Number(template.widthMm),
            height: Number(template.heightMm),
            scale: 2,
            format: 'png',
        });

        const thumbnailFilename = `id-cards/${institutionId}/thumbnails/${student.admissionNumber || student.id}_${Date.now()}.png`;
        await uploadToMinio(thumbnailFilename, imageBuffer, 'image/png');
        const thumbnailUrl = await getMinioFileUrl(thumbnailFilename);

        // Save ID card record
        const idCard = await tx.idCard.create({
            data: {
                studentId: student.id,
                institutionId,
                templateId: template.id,
                pdfUrl,
                pdfObjectPath: filename,
                cardFrontUrl: thumbnailUrl,
                cardFrontObjectPath: thumbnailFilename,
                validUntil: validUntilDate,
                status: 'issued',
            },
        });

        logger.info('ID card generated', { studentId, idCardId: idCard.id });

        return {
            idCard,
            pdfUrl,
            thumbnailUrl,
            pdfBuffer,
        };
    },

    /**
     * Generate ID cards in bulk — optimized with batched DB fetch + IdCardBatch tracking
     */
    async generateBulk(
        institutionId: string,
        templateId: string,
        classId?: string,
        streamId?: string,
        sectionId?: string
    ) {
        // Resolve target students internally
        const queryWhere: any = { institutionId };
        if (classId || streamId || sectionId) {
            queryWhere.section = {
                ...(classId && { classId }),
                ...(streamId && { streamId }),
                ...(sectionId && { id: sectionId }),
            };
        }

        const targetStudents = await tx.student.findMany({
            where: queryWhere,
            select: { id: true },
        });

        if (targetStudents.length === 0) {
            throw new BadRequestError('No students found matching the selected criteria');
        }

        const studentIds = targetStudents.map((s: {id: string}) => s.id);

        // STEP 1 — Create batch record for async tracking
        const batch = await tx.idCardBatch.create({
            data: {
                institutionId,
                templateId: templateId || '',
                totalRequested: studentIds.length,
                totalSucceeded: 0,
                totalFailed: 0,
                failedStudentIds: '',
                status: 'processing',
            },
        });

        // STEP 2 — Enqueue to BullMQ worker
        try {
            await addJob(QUEUE_NAMES.ID_CARD_GENERATION, 'generate-bulk', {
                batchId: batch.id,
                institutionId,
                studentIds,
                templateId,
            });
        } catch (error) {
            logger.error({ err: error, batchId: batch.id }, 'Failed to enqueue bulk generation job');
            await tx.idCardBatch.update({
                where: { id: batch.id },
                data: {
                    status: 'failed',
                    failedStudentIds: JSON.stringify([{ error: 'Queue unavailable' }]),
                },
            });
            throw new BadRequestError('Service Unavailable: Queue system is down. Please try again later.');
        }

        return { batchId: batch.id };
    },

    /**
     * Internal async processor for bulk ID card generation (called by BullMQ worker).
     */
    async processBulkJob(
        batchId: string,
        institutionId: string,
        studentIds: string[],
        templateId?: string,
        job?: import('bullmq').Job
    ) {
        const startTime = Date.now();
        const tmpFiles: string[] = [];
        let mergedOutputPath: string | null = null;

        try {
            // Get batch to know createdAt for idempotency
            const batch = await tx.idCardBatch.findUnique({
                where: { id: batchId },
                select: { createdAt: true }
            });
            if (!batch) {
                throw new Error(`Batch not found: ${batchId}`);
            }

            // Batch-fetch ALL students in one query (eliminates N+1)
            const students = await tx.student.findMany({
                where: {
                    id: { in: studentIds },
                    institutionId,
                },
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

            const studentMap = new Map(students.map((s: { id: string }) => [s.id, s]));

            const results = {
                successful: [] as string[],
                failed: [] as { studentId: string; error: string }[],
            };

            // Process students in concurrent chunks (env-driven, see worker-config.ts)
            const CONCURRENCY = ID_CARD_PUPPETEER_CONCURRENCY;
            for (let i = 0; i < studentIds.length; i += CONCURRENCY) {
                const chunk = studentIds.slice(i, i + CONCURRENCY);
                
                const promises = chunk.map(async (studentId) => {
                    try {
                        const student = studentMap.get(studentId);
                        if (!student) {
                            results.failed.push({ studentId, error: 'Student not found' });
                            return null;
                        }

                        // Idempotency check: check if IdCard exists for this template generated after batch start
                        const existingIdCard = await tx.idCard.findFirst({
                            where: {
                                studentId,
                                templateId,
                                createdAt: { gte: batch.createdAt }
                            }
                        });

                        let pdfBuffer: Buffer;

                        if (existingIdCard && (existingIdCard.pdfObjectPath || existingIdCard.pdfUrl)) {
                            logger.info({ studentId, idCardId: existingIdCard.id }, 'Skipping generation, using existing ID card for batch');
                            pdfBuffer = await downloadFromMinio(existingIdCard.pdfObjectPath || existingIdCard.pdfUrl!);
                            results.successful.push(studentId);
                        } else {
                            const res = await this.generateForStudent(institutionId, studentId, templateId, student);
                            if (res.pdfBuffer) {
                                pdfBuffer = res.pdfBuffer;
                            } else {
                                throw new Error('No PDF buffer returned from generator');
                            }
                            results.successful.push(studentId);
                        }

                        // Save the single buffer to disk temporarily
                        const tmpPath = path.join(os.tmpdir(), `vidyaverse-id-${randomUUID()}.pdf`);
                        await fs.writeFile(tmpPath, pdfBuffer);
                        return tmpPath;

                    } catch (error: unknown) {
                        const message = error instanceof Error ? error.message : 'Unknown error';
                        results.failed.push({ studentId, error: message });
                        logger.error({ studentId, err: error }, 'Failed to generate ID card');
                        return null;
                    }
                });

                const paths = await Promise.all(promises);
                for (const p of paths) {
                    if (p) tmpFiles.push(p);
                }

                // Increment progress in DB per chunk
                await tx.idCardBatch.update({
                    where: { id: batchId },
                    data: {
                        totalSucceeded: results.successful.length,
                        totalFailed: results.failed.length,
                    }
                });

                // Update BullMQ job progress
                if (job) {
                    const progress = Math.round(((i + chunk.length) / studentIds.length) * 100);
                    await job.updateProgress(Math.min(progress, 100));
                }
            }

            // Save merged PDF and upload
            // TODO: For batches > 300 students, the in-memory pdf-lib merge will
            //       hit memory pressure. Replace with Ghostscript stream merge when
            //       the production environment supports it (see pdf-merger.ts).
            let batchPdfUrl = null;
            if (results.successful.length > 0 && tmpFiles.length > 0) {
                try {
                    logger.info({ batchId, count: results.successful.length }, 'Merging individual PDF files from disk');

                    // Use chunked merge to keep peak memory bounded
                    mergedOutputPath = path.join(os.tmpdir(), `vidyaverse-batch-${batchId}.pdf`);
                    const mergeResult = await mergeChunked(tmpFiles, mergedOutputPath);
                    if (mergeResult.skippedFiles.length > 0) {
                        logger.warn({ batchId, skippedCount: mergeResult.skippedFiles.length }, 'Some individual PDFs were corrupt and skipped during merge');
                    }

                    const mergedBuffer = await fs.readFile(mergedOutputPath);
                    const mergedFilename = `id-cards/${institutionId}/batch_${batchId}_${Date.now()}.pdf`;
                    await uploadToMinio(mergedFilename, mergedBuffer, 'application/pdf');
                    batchPdfUrl = await getMinioFileUrl(mergedFilename);
                } catch (err) {
                    logger.error({ err, batchId }, 'Failed to save and upload batch PDF');
                }
            }

            // Update batch record with final status
            const processingTimeMs = Date.now() - startTime;
            await tx.idCardBatch.update({
                where: { id: batchId },
                data: {
                    failedStudentIds: JSON.stringify(results.failed.map(f => f.studentId)),
                    status: results.failed.length === studentIds.length ? 'failed' : 'completed',
                    processingTimeMs,
                    pdfUrl: batchPdfUrl,
                },
            });
            
            return {
                successful: results.successful.length,
                failed: results.failed.length,
            };

        } catch (fatalError: any) {
            logger.error({ err: fatalError, batchId }, 'Fatal exception during bulk generation');
            await tx.idCardBatch.update({
                where: { id: batchId },
                data: {
                    status: 'failed',
                    failedStudentIds: JSON.stringify([{ error: fatalError.message || 'Fatal crash' }]),
                }
            });
            throw fatalError; // Bubble up so BullMQ can retry or move to dead letter queue
        } finally {
            // Clean up all temporary files (individual PDFs + merged output)
            const allTempFiles = mergedOutputPath
                ? [...tmpFiles, mergedOutputPath]
                : tmpFiles;
            await Promise.allSettled(
                allTempFiles.map(f => fs.unlink(f).catch(err =>
                    logger.warn({ err, tmpFile: f }, 'Failed to delete temporary PDF file')
                ))
            );
        }
    },

    /**
     * Get batch generation status (for frontend polling)
     */
    async getBatchStatus(batchId: string, institutionId: string) {
        const batch = await tx.idCardBatch.findFirst({
            where: { id: batchId, institutionId },
        });
        if (!batch) {
            throw new NotFoundError('Batch not found');
        }
        return batch;
    },

    /**
     * List ID cards with filters
     */
    async list(institutionId: string, query: IdCardQueryInput) {
        // Query params arrive as raw strings from the route (the schema isn't
        // enforced on this handler), so coerce defensively.
        const q = query as any;
        const page = Math.max(1, Number(q.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(q.limit) || 20));
        const search = typeof q.search === 'string' ? q.search.trim() : '';
        const { studentId, classId, sectionId, status } = q;
        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = { institutionId };

        if (studentId) where.studentId = studentId;
        if (status) where.status = status;

        if (classId || sectionId) {
            where.student = {
                section: {
                    ...(sectionId && { id: sectionId }),
                    ...(classId && { classId }),
                },
            };
        }

        // Free-text search over student name / admission number.
        if (search) {
            where.student = {
                ...(where.student || {}),
                OR: [
                    { name: { contains: search } },
                    { admissionNumber: { contains: search } },
                ],
            };
        }

        const [idCards, total] = await Promise.all([
            tx.idCard.findMany({
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
            tx.idCard.count({ where }),
        ]);

        const idCardsWithUrls = await Promise.all(idCards.map(async (card: any) => {
            const result = { ...card };
            // The UI reads student.admissionNo; the column is admissionNumber.
            if (result.student) {
                result.student = { ...result.student, admissionNo: result.student.admissionNumber };
            }
            if (card.pdfObjectPath) {
                result.pdfUrl = await getPresignedUrl(card.pdfObjectPath, 3600);
            }
            if (card.cardFrontObjectPath) {
                result.cardFrontUrl = await getPresignedUrl(card.cardFrontObjectPath, 3600);
            }
            if (card.cardBackObjectPath) {
                result.cardBackUrl = await getPresignedUrl(card.cardBackObjectPath, 3600);
            }
            return result;
        }));

        return {
            idCards: idCardsWithUrls,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    },

    /**
     * Get ID card by ID
     */
    async getById(id: string, institutionId: string) {
        const idCard = await tx.idCard.findFirst({
            where: { id, institutionId },
            include: {
                student: true,
                template: true,
            },
        });

        if (!idCard) {
            throw new NotFoundError('ID card not found');
        }

        if (idCard.pdfObjectPath) {
            idCard.pdfUrl = await getPresignedUrl(idCard.pdfObjectPath, 3600);
        }
        if (idCard.cardFrontObjectPath) {
            idCard.cardFrontUrl = await getPresignedUrl(idCard.cardFrontObjectPath, 3600);
        }
        if (idCard.cardBackObjectPath) {
            idCard.cardBackUrl = await getPresignedUrl(idCard.cardBackObjectPath, 3600);
        }

        return idCard;
    },

    /**
     * Update mutable fields of an ID card (status / validity).
     */
    async update(
        id: string,
        institutionId: string,
        data: { status?: string; validUntil?: string | Date | null }
    ) {
        const existing = await tx.idCard.findFirst({ where: { id, institutionId } });
        if (!existing) {
            throw new NotFoundError('ID card not found');
        }

        const ALLOWED_STATUSES = ['draft', 'pending_approval', 'approved', 'printed', 'issued', 'cancelled'];
        const patch: any = {};

        if (data.status !== undefined) {
            if (!ALLOWED_STATUSES.includes(data.status)) {
                throw new BadRequestError(`Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}`);
            }
            patch.status = data.status;
        }
        if (data.validUntil !== undefined) {
            patch.validUntil = data.validUntil ? new Date(data.validUntil) : null;
        }

        if (Object.keys(patch).length === 0) {
            return existing;
        }

        return tx.idCard.update({ where: { id }, data: patch });
    },

    /**
     * Delete an ID card (and best-effort remove its storage objects).
     */
    async remove(id: string, institutionId: string) {
        const existing = await tx.idCard.findFirst({ where: { id, institutionId } });
        if (!existing) {
            throw new NotFoundError('ID card not found');
        }

        // Best-effort storage cleanup — never block the delete on storage errors.
        const objectPaths = [
            existing.pdfObjectPath,
            existing.cardFrontObjectPath,
            existing.cardBackObjectPath,
        ].filter(Boolean) as string[];
        await Promise.allSettled(objectPaths.map((p) => deleteObject(p)));

        await tx.idCard.delete({ where: { id } });
        return { id, deleted: true };
    },

    /**
     * Print multiple ID cards in a layout
     */
    async print(institutionId: string, input: PrintIdCardsInput) {
        const { idCardIds, format: _format, layout } = input;

        // Get all ID cards
        const idCards = await tx.idCard.findMany({
            where: {
                id: { in: idCardIds },
                institutionId,
            },
            include: {
                student: {
                    include: {
                        section: { include: { class: true, stream: true } },
                        institution: true,
                    },
                },
                template: true,
            },
        });

        if (idCards.length !== idCardIds.length) {
            throw new BadRequestError('Some ID cards were not found');
        }

        // Regenerate HTML for each card
        const htmlPages: string[] = [];

        for (const idCard of idCards) {
            const template = idCard.template;
            if (!template) continue;

            const qrCode = await generateStudentQRCode({
                id: idCard.student.id,
                admissionNo: idCard.student.admissionNumber || '',
                name: idCard.student.name,
                institutionCode: idCard.student.institution.code || 'VV',
            });

            const templateData = {
                student: {
                    ...idCard.student,
                    fullName: idCard.student.name,
                    photoUrl: idCard.student.photoUrl
                        ? await getPresignedUrl(idCard.student.photoUrl, 3600)
                        : '/placeholder-photo.png',
                },
                class: {
                    name: idCard.student.section?.class?.name || '',
                    section: idCard.student.section?.name || '',
                },
                institution: idCard.student.institution,
                academicYear: this.getCurrentAcademicYear(),
                qrCode,
            };

            const html = await templateService.render(template.id, institutionId, templateData);
            htmlPages.push(html);
        }

        // Generate based on layout
        if (layout === 'single') {
            // One card per page
            const pdfBuffer = await generateMultiPagePDF(htmlPages, {
                width: Number(idCards[0].template?.widthMm) || 85.6,
                height: Number(idCards[0].template?.heightMm) || 54,
            });

            const filename = `prints/${institutionId}/id-cards-${Date.now()}.pdf`;
            await uploadToMinio(filename, pdfBuffer, 'application/pdf');
            return { url: await getMinioFileUrl(filename) };
        }

        // Grid layouts (2x4 or 2x5 on A4)
        const cardsPerPage = layout === 'grid_2x4' ? 8 : 10;
        const a4Width = 210;
        const a4Height = 297;

        const gridPages: string[] = [];
        for (let i = 0; i < htmlPages.length; i += cardsPerPage) {
            const pageCards = htmlPages.slice(i, i + cardsPerPage);
            const gridHtml = `
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 5mm; padding: 10mm;">
          ${pageCards.map((card) => `<div style="width: 85.6mm; height: 54mm;">${card}</div>`).join('')}
        </div>
      `;
            gridPages.push(gridHtml);
        }

        const pdfBuffer = await generateMultiPagePDF(gridPages, {
            width: a4Width,
            height: a4Height,
        });

        const filename = `prints/${institutionId}/id-cards-grid-${Date.now()}.pdf`;
        await uploadToMinio(filename, pdfBuffer, 'application/pdf');
        return { url: await getMinioFileUrl(filename) };
    },

    /**
     * Get current academic year (April to March)
     */
    getCurrentAcademicYear(): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        // Academic year starts in April (month 3)
        if (month >= 3) {
            return `${year}-${year + 1}`;
        }
        return `${year - 1}-${year}`;
    },
});

export const idCardService = createIdCardService();
