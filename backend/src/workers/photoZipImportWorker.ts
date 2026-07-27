import { Worker, Job } from 'bullmq';
import { QUEUE_NAMES, type PhotoZipImportJobData } from '../utils/job-queue.js';
import { prisma } from '../config/database.js';
import { downloadFromMinio, uploadToMinio, getMinioFileUrl, deleteObject, extractKey, buildPhotoKey, buildThumbKey } from '../config/minio.js';
import { logger } from '../utils/logger.js';
import { getRedisClient } from '../config/redis.js';
import AdmZip from 'adm-zip';
import { processPhoto, generateThumbnail } from '../utils/photo-processor.js';
import path from 'path';

export function startPhotoZipImportWorker() {
    logger.info('Initializing Photo ZIP Import Worker');

    // Blocking BullMQ worker needs a dedicated connection with
    // maxRetriesPerRequest: null (can't share the app's client).
    const connection = getRedisClient().duplicate({ maxRetriesPerRequest: null });

    return new Worker<PhotoZipImportJobData>(
        QUEUE_NAMES.PHOTO_ZIP_IMPORT,
        async (job: Job<PhotoZipImportJobData>) => {
            const { institutionId, zipFilePath } = job.data;

            // We need the JobExecution record ID which is stored in job.id
            const jobExecutionId = job.id;
            
            logger.info(`Starting Photo ZIP import job ${job.id} for institution ${institutionId}`);

            if (jobExecutionId) {
                await prisma.jobExecution.update({
                    where: { id: jobExecutionId },
                    data: { status: 'processing' }
                });
            }

            const unmatchedFiles: string[] = [];
            let processedCount = 0;
            let failedCount = 0;

            try {
                // 1. Download ZIP from MinIO
                logger.info(`Downloading ZIP file from MinIO: ${zipFilePath}`);
                const zipBuffer = await downloadFromMinio(zipFilePath);
                
                // 2. Parse ZIP
                const zip = new AdmZip(zipBuffer);
                const zipEntries = zip.getEntries();

                // Filter to only image entries for total count
                const imageEntries = zipEntries.filter(entry => {
                    if (entry.isDirectory) return false;
                    const fileName = entry.entryName;
                    if (fileName.includes('__MACOSX/') || fileName.split('/').pop()?.startsWith('.')) return false;
                    const ext = path.extname(fileName).toLowerCase();
                    return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
                });
                const totalImages = imageEntries.length;
                
                for (const entry of imageEntries) {
                    const fileName = entry.entryName;
                    const ext = path.extname(fileName).toLowerCase();

                    // Extract admission number from filename (e.g. ADM-2526-0001.jpg -> ADM-2526-0001)
                    const baseName = path.basename(fileName, ext);
                    const admissionNumber = baseName.trim();
                    
                    if (!admissionNumber) {
                        unmatchedFiles.push(fileName);
                        continue;
                    }

                    try {
                        // Find student by admission number and institution
                        const student = await prisma.student.findFirst({
                            where: {
                                institutionId,
                                admissionNumber: admissionNumber
                            },
                            select: {
                                id: true,
                                admissionNumber: true,
                                photoUrl: true,
                                thumbUrl: true,
                                photoVersion: true,
                            }
                        });

                        if (!student) {
                            logger.warn(`No student found for admission number: ${admissionNumber} (File: ${fileName})`);
                            unmatchedFiles.push(fileName);
                            continue;
                        }

                        logger.info(`Processing photo for student: ${student.admissionNumber} (${student.id})`);
                        
                        const imgBuffer = entry.getData();

                        // Delete old MinIO objects to prevent storage leaks
                        if (student.photoUrl) {
                            const oldKey = extractKey(student.photoUrl);
                            if (oldKey) await deleteObject(oldKey).catch(() => {});
                        }
                        if (student.thumbUrl) {
                            const oldThumbKey = extractKey(student.thumbUrl);
                            if (oldThumbKey) await deleteObject(oldThumbKey).catch(() => {});
                        }

                        // Process through canonical pipeline (Tier 1 = basic resize/format)
                        const result = await processPhoto(imgBuffer, { tier: 1 });
                        const thumbBuffer = await generateThumbnail(result.buffer);

                        // Compute next version
                        const nextVersion = (student.photoVersion ?? 0) + 1;

                        // Upload to canonical versioned keys
                        const photoKey = buildPhotoKey(institutionId, student.id, nextVersion);
                        const thumbKey = buildThumbKey(institutionId, student.id, nextVersion);
                        
                        await uploadToMinio(photoKey, result.buffer, 'image/webp');
                        const photoUrl = await getMinioFileUrl(photoKey);
                        
                        await uploadToMinio(thumbKey, thumbBuffer, 'image/webp');
                        const thumbUrl = await getMinioFileUrl(thumbKey);

                        // Update Student record with all metadata
                        await prisma.student.update({
                            where: { id: student.id },
                            data: {
                                photoUrl,
                                thumbUrl,
                                photoHash: result.hash,
                                photoVersion: nextVersion,
                                photoUpdatedAt: new Date(),
                                photoMetadata: {
                                    ...result.metadata,
                                    uploadedVia: 'zip-bulk',
                                },
                            }
                        });

                        processedCount++;

                        // Report progress via BullMQ (consumed by SSE endpoint)
                        await job.updateProgress({
                            processed: processedCount,
                            failed: failedCount,
                            total: totalImages,
                            currentFile: fileName,
                        });

                    } catch (error: any) {
                        logger.error(`Error processing file ${fileName}: ${error.message}`);
                        failedCount++;
                        unmatchedFiles.push(`${fileName} (Error: ${error.message})`);
                    }
                }

                // Finalize job execution
                if (jobExecutionId) {
                    await prisma.jobExecution.update({
                        where: { id: jobExecutionId },
                        data: {
                            status: 'completed',
                            completedAt: new Date(),
                            resultData: {
                                processedCount,
                                failedCount,
                                unmatchedFilesCount: unmatchedFiles.length,
                                unmatchedFiles
                            } as any
                        }
                    });
                }

                return {
                    success: true,
                    processedCount,
                    failedCount,
                    unmatchedFiles
                };

            } catch (error: any) {
                logger.error(`Photo ZIP Import Worker Error: ${error.message}`);
                
                if (jobExecutionId) {
                    await prisma.jobExecution.update({
                        where: { id: jobExecutionId },
                        data: {
                            status: 'failed',
                            completedAt: new Date(),
                            errorMessage: error.message,
                            resultData: {
                                processedCount,
                                failedCount,
                                unmatchedFilesCount: unmatchedFiles.length,
                                unmatchedFiles
                            } as any
                        }
                    });
                }
                
                throw error;
            }
        },
        { 
            connection,
            concurrency: 1 // Memory safety: only one ZIP extraction at a time
        }
    );
}
