import { Worker, Job } from 'bullmq';
import { CSV_IMPORT_QUEUE_NAME } from '../config/queue.js';

import { prisma } from '../config/database.js';
import { getMinioClient } from '../config/minio.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { BulkCsvImportJobData } from './jobs.js';
import * as csv from 'fast-csv';
import { SlotStatus } from '@prisma/client';
import { nanoid } from 'nanoid';
import { checkDuplicates } from '../modules/student/duplicateDetection.js';

// We reuse the main redis client for the worker, but ioredis connections block on workers
// so BullMQ will create its own internally using the config if we pass connection options.
// Or we can just create a new one.
import Redis from 'ioredis';
const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });

export const csvImportWorker = new Worker<BulkCsvImportJobData>(
    CSV_IMPORT_QUEUE_NAME,
    async (job: Job<BulkCsvImportJobData>) => {
        const { jobExecutionId, institutionId, sectionId, fileKey, expectedCount } = job.data;

        logger.info(`Starting CSV import job ${job.id} for execution ${jobExecutionId}`);

        await prisma.jobExecution.update({
            where: { id: jobExecutionId },
            data: { status: 'processing' }
        });

        // Pre-fetch section and calculate starting numbers
        const section = await prisma.section.findUnique({
            where: { id: sectionId },
            include: { institution: { select: { code: true, academicYear: true } }, class: { select: { branchId: true } } }
        });

        if (!section) {
            throw new Error(`Section ${sectionId} not found`);
        }

        // Strip non-alphanumeric chars from code before extracting prefix to avoid double-hyphens
        const prefix = section.institution.code.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();
        const academicYear = section.institution.academicYear || '2025-2026';
        const yearPart = academicYear.replace(/-/g, '').substring(2, 6) || '2526';

        // 1. Calculate max existing rollNo
        const maxSlot = await prisma.admissionSlot.aggregate({
            where: { sectionId },
            _max: { rollNo: true }
        });

        let nextAvailableRollNo = (maxSlot._max.rollNo || 0) + 1;

        // 2. Determine next admission number sequence
        const lastStudent = await prisma.student.findFirst({
            where: { institutionId, admissionNumber: { startsWith: `${prefix}-${yearPart}-` } },
            orderBy: { admissionNumber: 'desc' },
            select: { admissionNumber: true }
        });

        let lastSeq = lastStudent?.admissionNumber ? parseInt(lastStudent.admissionNumber.split('-').pop() || '0', 10) : 0;

        return new Promise((resolve, reject) => {
            void (async () => {
                try {
                    const s3 = getMinioClient();
                    const { HeadObjectCommand, GetObjectCommand } = await import('@aws-sdk/client-s3');
                    const { env: configEnv } = await import('../config/env.js');
                    await s3.send(new HeadObjectCommand({ Bucket: configEnv.R2_BUCKET_NAME, Key: fileKey }));
                    const response = await s3.send(new GetObjectCommand({ Bucket: configEnv.R2_BUCKET_NAME, Key: fileKey }));
                    const stream = response.Body as NodeJS.ReadableStream;

                    let processedCount = 0;
                    let successCount = 0;
                    let failCount = 0;

                    const chunk: any[] = [];
                    const CHUNK_SIZE = 100;

                    const sanitize = (str: any) => typeof str === 'string' ? str.replace(/<[^>]*>?/gm, '').trim() : null;
                    // Normalize: strip spaces, hyphens, dots from numeric identifiers
                    const normalizeDigits = (str: string | null) => str ? str.replace(/[\s\-.]/g, '') : null;

                    const processChunk = async (rows: any[]) => {
                        // Process each row in its own transaction so one failure
                        // does not roll back the entire batch
                        for (const row of rows) {
                            try {
                                const name = sanitize(row.name);
                                if (!name) {
                                    failCount++;
                                    processedCount++;
                                    logger.warn(`Row skipped: missing name — ${JSON.stringify(row)}`);
                                    continue;
                                }

                                // Normalize Aadhar: strip spaces/hyphens before validation
                                const rawAadhar = sanitize(row.aadharNumber);
                                const aadharNumber = normalizeDigits(rawAadhar);
                                if (aadharNumber && !/^\d{12}$/.test(aadharNumber)) {
                                    failCount++;
                                    processedCount++;
                                    logger.warn(`Row skipped: invalid Aadhar "${rawAadhar}" → "${aadharNumber}" for ${name}`);
                                    continue;
                                }

                                // Normalize phone: strip spaces/hyphens before validation
                                const rawPhone = sanitize(row.guardianPhone);
                                const guardianPhone = normalizeDigits(rawPhone);
                                if (guardianPhone && !/^\d{10}$/.test(guardianPhone)) {
                                    failCount++;
                                    processedCount++;
                                    logger.warn(`Row skipped: invalid phone "${rawPhone}" → "${guardianPhone}" for ${name}`);
                                    continue;
                                }

                                const parsedRollNo = row.rollNo ? parseInt(row.rollNo, 10) : undefined;
                                const rollNo = parsedRollNo || nextAvailableRollNo++;

                                // Duplicate detection before insert (outside transaction — read-only)
                                const dupResult = await checkDuplicates(institutionId, {
                                    aadharNumber: aadharNumber || undefined,
                                    name,
                                    dob: row.dob ? new Date(row.dob) : undefined,
                                });
                                if (dupResult.isDuplicate) {
                                    const matchInfo = dupResult.matches.map(m => `${m.matchType}:${m.name}(${m.admissionNumber})`).join(', ');
                                    logger.warn(`Skipping duplicate student: ${name} — matches: ${matchInfo}`);
                                    failCount++;
                                    processedCount++;
                                    continue;
                                }

                                // Each student insert is its own transaction for isolation
                                await prisma.$transaction(async (tx) => {
                                    let slot = await tx.admissionSlot.findUnique({
                                        where: { sectionId_rollNo: { sectionId, rollNo } }
                                    });

                                    if (slot && slot.status !== SlotStatus.EMPTY) {
                                        throw new Error(`Roll number ${rollNo} is already filled in this section.`);
                                    }

                                    if (!slot) {
                                        slot = await tx.admissionSlot.create({
                                            data: {
                                                sectionId,
                                                rollNo,
                                                status: SlotStatus.FILLED,
                                                token: nanoid(10)
                                            }
                                        });
                                    } else {
                                        slot = await tx.admissionSlot.update({
                                            where: { id: slot.id },
                                            data: { status: SlotStatus.FILLED }
                                        });
                                    }

                                    const admissionNumber = `${prefix}-${yearPart}-${String(lastSeq + 1).padStart(4, '0')}`;
                                    lastSeq++;

                                    // Normalize contact phone as well
                                    const rawContact = sanitize(row.contact);
                                    const contact = normalizeDigits(rawContact);

                                    await tx.student.create({
                                        data: {
                                            institutionId,
                                            sectionId,
                                            branchId: section.class.branchId || undefined,
                                            slotId: slot.id,
                                            name: name,
                                            fatherName: sanitize(row.fatherName),
                                            motherName: sanitize(row.motherName),
                                            guardianName: sanitize(row.guardianName),
                                            guardianPhone: guardianPhone,
                                            contact: contact,
                                            bloodGroup: sanitize(row.bloodGroup) || 'O+',
                                            aadharNumber: aadharNumber,
                                            caste: sanitize(row.caste),
                                            religion: sanitize(row.religion),
                                            sex: (sanitize(row.sex)?.toLowerCase() as import('@prisma/client').Sex) || 'other',
                                            dob: row.dob ? new Date(row.dob) : new Date('2010-01-01'),
                                            dateOfAdmission: row.dateOfAdmission ? new Date(row.dateOfAdmission) : new Date(),
                                            address: row.address?.trim() || null,
                                            city: row.city?.trim() || null,
                                            state: row.state?.trim() || null,
                                            pincode: row.pincode?.trim() || null,
                                            admissionNumber,
                                            academicYear,
                                            status: 'active',
                                            dataStatus: 'filled',
                                            customData: {}
                                        }
                                    });
                                });

                                successCount++;
                            } catch (err) {
                                failCount++;
                                logger.warn(`Row failed: ${JSON.stringify(row)} - ${err}`);
                            }
                            processedCount++;
                        }

                        await job.updateProgress({
                            processed: processedCount,
                            successful: successCount,
                            failed: failCount,
                            total: expectedCount
                        });

                        await prisma.jobExecution.update({
                            where: { id: jobExecutionId },
                            data: {
                                progress: Math.floor((processedCount / expectedCount) * 100),
                                processedItems: processedCount,
                                successfulItems: successCount,
                                failedItems: failCount
                            }
                        });
                    };

                    const csvStream = csv.parse({
                        headers: (headers) => headers.map(header => {
                            if (!header) return header;
                            const h = header.trim().toLowerCase();
                            if (h === 'roll no' || h === 'roll number') return 'rollNo';
                            if (h === 'admission no' || h === 'admission number') return 'admissionNumber';
                            if (h === 'name') return 'name';
                            if (h === 'sex') return 'sex';
                            if (h === 'date of birth') return 'dob';
                            if (h === 'blood group') return 'bloodGroup';
                            if (h === 'aadhar number' || h === 'aadhar no') return 'aadharNumber';
                            if (h === 'father name') return 'fatherName';
                            if (h === 'mother name') return 'motherName';
                            if (h === 'guardian name') return 'guardianName';
                            if (h === 'guardian phone') return 'guardianPhone';
                            if (h === 'parent email') return 'parentEmail';
                            if (h === 'contact' || h === 'phone') return 'contact'; // if they use contact
                            if (h === 'address') return 'address';
                            if (h === 'city') return 'city';
                            if (h === 'state') return 'state';
                            if (h === 'pincode') return 'pincode';
                            if (h === 'date of admission') return 'dateOfAdmission';
                            if (h === 'caste') return 'caste';
                            if (h === 'religion') return 'religion';
                            if (h === 'academic year') return 'academicYear';
                            return header.trim();
                        }),
                        trim: true,
                        ignoreEmpty: true,
                    })
                        .on('error', async (error) => {
                            logger.error(`CSV Parsing error: ${error}`);
                            reject(error);
                        })
                        .on('data', async (row) => {
                            chunk.push(row);
                            if (chunk.length >= CHUNK_SIZE) {
                                csvStream.pause();
                                const rowsToProcess = [...chunk];
                                chunk.length = 0;
                                await processChunk(rowsToProcess);
                                csvStream.resume();
                            }
                        })
                        .on('end', async () => {
                            if (chunk.length > 0) {
                                await processChunk(chunk);
                            }

                            await prisma.jobExecution.update({
                                where: { id: jobExecutionId },
                                data: {
                                    status: 'completed',
                                    progress: 100,
                                    processedItems: processedCount,
                                    successfulItems: successCount,
                                    failedItems: failCount
                                }
                            });

                            logger.info(`Finished CSV import job ${job.id}: ${successCount} success, ${failCount} failed.`);
                            resolve({ successCount, failCount });
                        });

                    stream.pipe(csvStream);
                } catch (error) {
                    logger.error(`Error in CSV import worker: ${error}`);
                    // Guarded on purpose: an unguarded await here skips reject()
                    // if the write itself throws, and the DB being unreachable is
                    // exactly why we may be in this catch — which would leave the
                    // job promise pending forever instead of failing the job.
                    try {
                        await prisma.jobExecution.update({
                            where: { id: jobExecutionId },
                            data: { status: 'failed' }
                        });
                    } catch (markFailedError) {
                        logger.error(`Could not mark job execution ${jobExecutionId} failed: ${markFailedError}`);
                    }
                    reject(error);
                }
            })();
        });
    },
    {
        connection,
        concurrency: 5,
    }
);

csvImportWorker.on('failed', (job, err) => {
    logger.error(`Job ${job?.id} failed with error ${err.message}`);
});
