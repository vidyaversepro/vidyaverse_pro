import { Job } from 'bullmq';
import {
    createWorker,
    getQueueEvents,
    QUEUE_NAMES,
    type PhotoEnhancementJobData,
    type IdCardGenerationJobData,
    type GroupPhotoJobData,
} from '../utils/job-queue.js';
import { processPhoto } from '../utils/photo-processor.js';
import { prisma } from '../config/database.js';
import { downloadFromMinio, uploadToMinio, getMinioFileUrl } from '../config/minio.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';
import { ID_CARD_WORKER_CONCURRENCY, ID_CARD_BULK_TIMEOUT_MS } from '../utils/worker-config.js';

/**
 * Photo Enhancement Worker
 */
export function startPhotoEnhancementWorker() {
    return createWorker<PhotoEnhancementJobData>(
        QUEUE_NAMES.PHOTO_ENHANCEMENT,
        async (job: Job<PhotoEnhancementJobData>) => {
            const { studentId, institutionId: _institutionId, photoPath, tier } = job.data;

            logger.info('Processing photo enhancement', { studentId, tier, jobId: job.id });

            try {
                // Download original photo
                const photoBuffer = await downloadFromMinio(photoPath);

                // Enhance using canonical processor (tier selection handled internally)
                const effectiveTier = (tier === 3 && !env.ENABLE_AI_ENHANCEMENT) ? 1 : tier;
                if (tier === 3 && !env.ENABLE_AI_ENHANCEMENT) {
                    logger.info('[PhotoEnhancementWorker] Tier 3 requested but AI Enhancement is disabled. Falling back to Tier 1.');
                }
                const result = await processPhoto(photoBuffer, { tier: effectiveTier as 1 | 2 | 3 });

                // Upload enhanced photo
                const enhancedPath = photoPath.replace(/(\.[^.]+)$/, `_enhanced.webp`);
                await uploadToMinio(enhancedPath, result.buffer, 'image/webp');
                const enhancedUrl = await getMinioFileUrl(enhancedPath);

                // Update student record
                await prisma.student.update({
                    where: { id: studentId },
                    data: {
                        photoUrl: enhancedUrl,
                        photoMetadata: {
                            photoEnhanced: true,
                            enhancementTier: tier,
                            qualityScore: result.metadata.qualityScore,
                            appliedEnhancements: result.metadata.appliedEnhancements,
                            enhancedAt: result.metadata.processedAt,
                        },
                    },
                });

                // Update job execution record
                await prisma.jobExecution.update({
                    where: { id: job.id! },
                    data: {
                        status: 'completed',
                        completedAt: new Date(),
                        result: {
                            enhancedUrl,
                            qualityScore: result.metadata.qualityScore,
                            appliedEnhancements: result.metadata.appliedEnhancements,
                        },
                    } as any,
                });

                return {
                    success: true,
                    enhancedUrl,
                    qualityScore: result.metadata.qualityScore,
                };
            } catch (error: any) {
                logger.error('Photo enhancement failed', { studentId, error: error.message });

                await prisma.jobExecution.update({
                    where: { id: job.id! },
                    data: {
                        status: 'failed',
                        completedAt: new Date(),
                        errorMessage: error.message,
                    },
                });

                throw error;
            }
        },
        { concurrency: 3 }
    );
}

import { idCardService } from '../modules/id-cards/id-card.service.js';

/**
 * ID Card Generation Worker
 */
export function startIdCardGenerationWorker() {
    const queueEvents = getQueueEvents(QUEUE_NAMES.ID_CARD_GENERATION);

    queueEvents.on('stalled', async ({ jobId }) => {
        logger.warn('ID Card generation job stalled', { jobId });
        try {
            // Find the job to get the batchId
            const { getQueue } = await import('../utils/job-queue.js');
            const queue = getQueue(QUEUE_NAMES.ID_CARD_GENERATION);
            const job = await queue.getJob(jobId);
            
            if (job && job.data) {
                const jobData = job.data as IdCardGenerationJobData;
                if (jobData.batchId) {
                    const batchId = jobData.batchId;
                    await prisma.idCardBatch.update({
                        where: { id: batchId },
                        data: {
                            status: 'failed',
                            failedStudentIds: JSON.stringify([{ error: 'Worker stalled/crashed during processing' }])
                        }
                    });
                    logger.info('Marked stalled ID card batch as failed', { batchId });
                }
            }
        } catch (error) {
            logger.error('Failed to handle stalled ID card job', { jobId, error });
        }
    });

    return createWorker<IdCardGenerationJobData>(
        QUEUE_NAMES.ID_CARD_GENERATION,
        async (job: Job<IdCardGenerationJobData>) => {
            const { batchId, institutionId, studentIds, templateId } = job.data;

            logger.info('Processing bulk ID card generation job', {
                batchId,
                count: studentIds.length,
                jobId: job.id
            });

            // Delegate the heavy lifting to the service layer
            const result = await idCardService.processBulkJob(
                batchId,
                institutionId,
                studentIds,
                templateId,
                job
            );

            return {
                success: true,
                generated: result.successful,
                failed: result.failed,
            };
        },
        { concurrency: ID_CARD_WORKER_CONCURRENCY, lockDuration: ID_CARD_BULK_TIMEOUT_MS }
    );
}

/**
 * Group Photo Processing Worker
 */
export function startGroupPhotoWorker() {
    return createWorker<GroupPhotoJobData>(
        QUEUE_NAMES.GROUP_PHOTO_PROCESSING,
        async (job: Job<GroupPhotoJobData>) => {
            const { groupPhotoId, institutionId: _institutionId2, action } = job.data;

            logger.info('Processing group photo', { groupPhotoId, action, jobId: job.id });

            switch (action) {
                case 'extract_faces':
                    // TODO: Implement face extraction.
                    //
                    // Until it exists, this MUST clear the photo's status. The
                    // service sets `status: 'processing'` before queueing, and
                    // the only code that ever writes a terminal status is
                    // `matchStudents`, which cannot run before extraction has
                    // produced rows — so returning success here left every photo
                    // a user clicked "Extract Faces" on pinned at 'processing'
                    // forever, with a spinner that never resolved.
                    //
                    // 'failed' is the honest terminal state: no faces were
                    // extracted. Whoever implements extraction should replace
                    // this whole branch, including this write.
                    await prisma.groupPhoto.update({
                        where: { id: groupPhotoId },
                        data: { status: 'failed' },
                    });
                    logger.warn('Face extraction is not implemented; marking photo failed', {
                        groupPhotoId,
                        jobId: job.id,
                    });
                    return { success: false, action, facesExtracted: 0, reason: 'not_implemented' };

                case 'match_students':
                    // TODO: Implement student matching using perceptual hashing
                    return { success: true, action, matched: 0 };

                case 'generate_outputs':
                    // TODO: Implement output generation
                    return { success: true, action, outputs: [] };

                default:
                    throw new Error(`Unknown action: ${action}`);
            }
        },
        { concurrency: 2 }
    );
}

import { startPhotoZipImportWorker } from './photoZipImportWorker.js';
import { startMonthlyUsageResetWorker, scheduleMonthlyUsageReset } from './monthlyUsageResetWorker.js';

/**
 * Start all workers
 */
export function startAllWorkers() {
    logger.info('Starting background job workers...');

    const workers = [
        startPhotoEnhancementWorker(),
        startIdCardGenerationWorker(),
        startGroupPhotoWorker(),
        startPhotoZipImportWorker(),
        startMonthlyUsageResetWorker(),
    ];

    // Schedule cron jobs
    scheduleMonthlyUsageReset().catch(err => logger.error('Failed to schedule monthly reset', { error: err.message }));

    logger.info(`Started ${workers.length} workers`);
    return workers;
}
