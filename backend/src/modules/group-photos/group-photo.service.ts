import { prisma } from '../../config/database.js';
import { BadRequestError, NotFoundError } from '../../utils/errors.js';
import { uploadToMinio, getMinioFileUrl, downloadFromMinio } from '../../config/minio.js';
import { generatePerceptualHash, calculateSimilarity } from '../../utils/perceptual-hash.js';
import { processImage } from '../../utils/photo-processor.js';
import { addJob, QUEUE_NAMES } from '../../utils/job-queue.js';
import { logger } from '../../utils/logger.js';
import type {
    UploadGroupPhotoInput,
    GroupPhotoQueryInput,
    ExtractFacesInput,
    MatchStudentsInput,
    FaceExtractionUpdateInput,
} from '@vidyaverse/shared-validation';

export const createGroupPhotoService = (tx: any = prisma) => ({
    /**
     * Upload a new group photo
     */
    async upload(
        institutionId: string,
        data: UploadGroupPhotoInput,
        file: { buffer: Buffer; filename: string; mimetype: string }
    ) {
        // Process image
        const processedBuffer = await processImage(file.buffer, {
            maxWidth: 4000,
            maxHeight: 3000,
            quality: 90,
            format: 'jpeg',
        });

        // Generate thumbnail
        const thumbnailBuffer = await processImage(file.buffer, {
            maxWidth: 400,
            maxHeight: 400,
            quality: 75,
            format: 'webp',
        });

        // Generate perceptual hash for duplicate detection
        const pHash = await generatePerceptualHash(file.buffer);

        // Check for duplicates in institution
        const existingPhotos = await tx.groupPhoto.findMany({
            where: { institutionId },
            select: { id: true, perceptualHash: true, name: true },
        });

        const duplicates = existingPhotos.filter((photo: any) => {
            if (!photo.perceptualHash) return false;
            const similarity = calculateSimilarity(pHash, photo.perceptualHash);
            return similarity >= 90;
        });

        if (duplicates.length > 0) {
            logger.warn('Potential duplicate group photo detected', {
                newPhoto: data.name,
                duplicateOf: duplicates.map((d: any) => d.name),
            });
        }

        // Upload to MinIO
        const timestamp = Date.now();
        const photoPath = `group-photos/${institutionId}/${timestamp}_original.jpg`;
        const thumbnailPath = `group-photos/${institutionId}/${timestamp}_thumb.jpg`;

        await uploadToMinio(photoPath, processedBuffer, 'image/jpeg');
        await uploadToMinio(thumbnailPath, thumbnailBuffer, 'image/jpeg');

        const photoUrl = await getMinioFileUrl(photoPath);
        const thumbnailUrl = await getMinioFileUrl(thumbnailPath);

        // Create database record
        const groupPhoto = await tx.groupPhoto.create({
            data: {
                institutionId,
                name: data.name,
                eventName: data.eventName,
                eventDate: data.eventDate ? new Date(data.eventDate) : null,
                classId: data.classId,
                sectionId: data.sectionId,
                description: data.description,
                photoUrl,
                thumbnailUrl,
                perceptualHash: pHash,
                status: 'pending',
                metadata: {
                    originalFilename: file.filename,
                    uploadedAt: new Date().toISOString(),
                    possibleDuplicates: duplicates.map((d: any) => d.id),
                },
            },
        });

        logger.info('Group photo uploaded', { groupPhotoId: groupPhoto.id });

        return {
            groupPhoto,
            hasPossibleDuplicates: duplicates.length > 0,
            duplicates: duplicates.map((d: any) => ({ id: d.id, name: d.name })),
        };
    },

    /**
     * List group photos
     */
    async list(institutionId: string, query: GroupPhotoQueryInput) {
        const { classId, sectionId, status, page, limit } = query;
        const skip = (page - 1) * limit;

        const where = {
            institutionId,
            ...(classId && { classId }),
            ...(sectionId && { sectionId }),
            ...(status && { status }),
        };

        const [photos, total] = await Promise.all([
            tx.groupPhoto.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    class: { select: { name: true } },
                    section: { select: { name: true } },
                    _count: { select: { extractions: true } },
                },
            }),
            tx.groupPhoto.count({ where }),
        ]);

        return {
            photos,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    },

    /**
     * Get group photo by ID
     */
    async getById(id: string, institutionId: string) {
        const photo = await tx.groupPhoto.findFirst({
            where: { id, institutionId },
            include: {
                class: true,
                section: true,
                extractions: {
                    include: {
                        student: {
                            select: {
                                id: true,
                                admissionNumber: true,
                                name: true,
                                photoUrl: true,
                            },
                        },
                    },
                },
            },
        });

        if (!photo) {
            throw new NotFoundError('Group photo not found');
        }

        return photo;
    },

    /**
     * Delete group photo
     */
    async delete(id: string, institutionId: string) {
        await this.getById(id, institutionId);

        await tx.groupPhotoExtraction.deleteMany({
            where: { groupPhotoId: id },
        });

        await tx.groupPhoto.delete({ where: { id } });

        return { success: true };
    },

    /**
     * Start face extraction job
     */
    async extractFaces(id: string, institutionId: string, options: ExtractFacesInput) {
        const photo = await this.getById(id, institutionId);

        if (photo.status === 'processing') {
            throw new BadRequestError('Photo is already being processed');
        }

        // Update status
        await tx.groupPhoto.update({
            where: { id },
            data: { status: 'processing' },
        });

        // Queue the job
        const job = await addJob(QUEUE_NAMES.GROUP_PHOTO_PROCESSING, 'extract-faces', {
            groupPhotoId: id,
            institutionId,
            action: 'extract_faces',
            options,
        });

        logger.info('Face extraction job queued', { groupPhotoId: id, jobId: job.id });

        return {
            jobId: job.id,
            status: 'processing',
        };
    },

    /**
     * Match extracted faces with students
     */
    async matchStudents(id: string, institutionId: string, options: MatchStudentsInput) {
        const photo = await this.getById(id, institutionId);

        if (photo.extractions.length === 0) {
            throw new BadRequestError('No faces extracted yet. Run face extraction first.');
        }

        // Get all students with photos in the institution
        const students = await tx.student.findMany({
            where: {
                institutionId,
                photoUrl: { not: null },
                ...(photo.classId && { section: { classId: photo.classId } }),
                ...(photo.sectionId && { sectionId: photo.sectionId }),
            },
            select: {
                id: true,
                admissionNumber: true,
                name: true,
                photoUrl: true,
            },
        });

        // For each unmatched extraction, try to match with students
        const unmatchedExtractions = photo.extractions.filter((e: any) => !e.studentId && !e.isRejected);
        const matchResults: Array<{
            extractionId: string;
            studentId: string | null;
            confidence: number;
        }> = [];

        for (const extraction of unmatchedExtractions) {
            if (!extraction.faceHash) continue;

            let bestMatch: { studentId: string; confidence: number } | null = null;

            for (const student of students) {
                if (!student.photoUrl) continue;

                try {
                    const studentPhotoBuffer = await downloadFromMinio(student.photoUrl);
                    const studentHash = await generatePerceptualHash(studentPhotoBuffer);
                    const similarity = calculateSimilarity(extraction.faceHash, studentHash);

                    if (similarity >= options.similarityThreshold) {
                        if (!bestMatch || similarity > bestMatch.confidence) {
                            bestMatch = { studentId: student.id, confidence: similarity };
                        }
                    }
                } catch (error) {
                    // Skip if we can't process student photo
                    continue;
                }
            }

            if (bestMatch && options.autoApprove) {
                await tx.groupPhotoExtraction.update({
                    where: { id: extraction.id },
                    data: {
                        studentId: bestMatch.studentId,
                        matchConfidence: bestMatch.confidence,
                        isAutoMatched: true,
                    },
                });
            }

            matchResults.push({
                extractionId: extraction.id,
                studentId: bestMatch?.studentId || null,
                confidence: bestMatch?.confidence || 0,
            });
        }

        // Update photo status
        await tx.groupPhoto.update({
            where: { id },
            data: { status: 'completed' },
        });

        return {
            totalExtractions: photo.extractions.length,
            matchedCount: matchResults.filter((r) => r.studentId).length,
            results: matchResults,
        };
    },

    /**
     * Update face extraction (manual matching/rejection)
     */
    async updateExtraction(
        extractionId: string,
        institutionId: string,
        data: FaceExtractionUpdateInput
    ) {
        const extraction = await tx.groupPhotoExtraction.findFirst({
            where: { id: extractionId },
            include: { groupPhoto: true },
        });

        if (!extraction || extraction.groupPhoto.institutionId !== institutionId) {
            throw new NotFoundError('Face extraction not found');
        }

        const updated = await tx.groupPhotoExtraction.update({
            where: { id: extractionId },
            data: {
                studentId: data.studentId,
                isRejected: data.isRejected,
                manualLabel: data.manualLabel,
                isAutoMatched: false,
            },
            include: {
                student: {
                    select: {
                        id: true,
                        admissionNumber: true,
                        name: true,
                    },
                },
            },
        });

        return updated;
    },

    /**
     * Get statistics for a group photo
     */
    async getStats(id: string, institutionId: string) {
        const photo = await this.getById(id, institutionId);

        const totalFaces = photo.extractions.length;
        const matched = photo.extractions.filter((e: any) => e.studentId).length;
        const rejected = photo.extractions.filter((e: any) => e.isRejected).length;
        const pending = totalFaces - matched - rejected;

        return {
            totalFaces,
            matched,
            rejected,
            pending,
            matchPercentage: totalFaces > 0 ? Math.round((matched / totalFaces) * 100) : 0,
        };
    },
});

export const groupPhotoService = createGroupPhotoService();
