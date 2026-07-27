import { Queue, Worker, Job, QueueEvents } from 'bullmq';
import { getRedisClient } from '../config/redis.js';
import { logger } from './logger.js';

// Queue names
export const QUEUE_NAMES = {
    PHOTO_ENHANCEMENT: 'photo-enhancement',
    ID_CARD_GENERATION: 'id-card-generation',
    CERTIFICATE_GENERATION: 'certificate-generation',
    GROUP_PHOTO_PROCESSING: 'group-photo-processing',
    EMAIL_NOTIFICATION: 'email-notification',
    VISITING_CARD_GENERATION: 'visiting-card-generation',
    PHOTO_ZIP_IMPORT: 'photo-zip-import',
    MONTHLY_USAGE_RESET: 'monthly-usage-reset',
} as const;

// Job data types
export interface PhotoEnhancementJobData {
    studentId: string;
    institutionId: string;
    photoPath: string;
    tier: 1 | 2 | 3;
}

export interface IdCardGenerationJobData {
    batchId: string;
    studentIds: string[];
    institutionId: string;
    templateId?: string;
}

export interface VisitingCardGenerationJobData {
    studentIds?: string[];
    userIds?: string[];
    institutionId: string;
    templateId?: string;
}

export interface GroupPhotoJobData {
    groupPhotoId: string;
    institutionId: string;
    action: 'extract_faces' | 'match_students' | 'generate_outputs';
}

export interface EmailJobData {
    to: string;
    subject: string;
    template: string;
    data: Record<string, unknown>;
}

export interface PhotoZipImportJobData {
    institutionId: string;
    zipFilePath: string; // MinIO path where the raw zip is uploaded
    userId: string;      // The user who initiated the import
}

// Queue instances (lazy initialization)
const queues: Map<string, Queue> = new Map();
const workers: Map<string, Worker> = new Map();
const queueEvents: Map<string, QueueEvents> = new Map();

/**
 * Get or create a queue
 */
export function getQueue<T = unknown>(name: string): Queue<T> {
    if (!queues.has(name)) {
        const redis = getRedisClient();
        const queue = new Queue<T>(name, {
            connection: redis.duplicate(),
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000,
                },
                removeOnComplete: {
                    count: 100,
                    age: 24 * 60 * 60, // 24 hours
                },
                removeOnFail: {
                    count: 50,
                },
            },
        });
        queues.set(name, queue as Queue);
        logger.info(`Queue created: ${name}`);
    }
    return queues.get(name) as Queue<T>;
}

/**
 * Create a worker for a queue
 */
export function createWorker<T = unknown, R = unknown>(
    queueName: string,
    processor: (job: Job<T>) => Promise<R>,
    options: { concurrency?: number; lockDuration?: number } = {}
): Worker<T, R> {
    const redis = getRedisClient();
    const worker = new Worker<T, R>(queueName, processor, {
        // BullMQ blocking workers require maxRetriesPerRequest: null on the
        // connection; duplicate() otherwise inherits the app client's value.
        connection: redis.duplicate({ maxRetriesPerRequest: null }),
        concurrency: options.concurrency ?? 5,
        lockDuration: options.lockDuration,
    });

    worker.on('completed', (job) => {
        logger.info(`Job completed: ${queueName}/${job.id}`, { jobId: job.id });
    });

    worker.on('failed', (job, error) => {
        logger.error(`Job failed: ${queueName}/${job?.id}`, {
            jobId: job?.id,
            error: error.message
        });
    });

    worker.on('error', (error) => {
        logger.error(`Worker error: ${queueName}`, { error: error.message });
    });

    workers.set(queueName, worker as Worker);
    logger.info(`Worker created: ${queueName} (concurrency: ${options.concurrency ?? 5})`);

    return worker;
}

/**
 * Get queue events for monitoring
 */
export function getQueueEvents(queueName: string): QueueEvents {
    if (!queueEvents.has(queueName)) {
        const redis = getRedisClient();
        const events = new QueueEvents(queueName, {
            // QueueEvents also uses blocking reads → needs maxRetriesPerRequest: null.
            connection: redis.duplicate({ maxRetriesPerRequest: null }),
        });
        queueEvents.set(queueName, events);
    }
    return queueEvents.get(queueName)!;
}

/**
 * Add a job to a queue
 */
export async function addJob<T>(
    queueName: string,
    jobName: string,
    data: T,
    options: {
        priority?: number;
        delay?: number;
        jobId?: string;
    } = {}
): Promise<Job<T>> {
    const queue = getQueue<T>(queueName);
    const job = await queue.add(jobName as any, data as any, {
        priority: options.priority,
        delay: options.delay,
        jobId: options.jobId,
    });

    logger.debug(`Job added: ${queueName}/${job.id}`, { jobName, data });
    return job as unknown as Job<T>;
}

/**
 * Wait for a job to complete
 */
export async function waitForJob<T>(
    queueName: string,
    jobId: string,
    timeout: number = 30000
): Promise<T | null> {
    const events = getQueueEvents(queueName);

    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error(`Job ${jobId} timed out after ${timeout}ms`));
        }, timeout);

        events.on('completed', ({ jobId: completedId, returnvalue }) => {
            if (completedId === jobId) {
                clearTimeout(timer);
                resolve(returnvalue as T);
            }
        });

        events.on('failed', ({ jobId: failedId, failedReason }) => {
            if (failedId === jobId) {
                clearTimeout(timer);
                reject(new Error(failedReason));
            }
        });
    });
}

/**
 * Get job by ID
 */
export async function getJob<T>(queueName: string, jobId: string): Promise<Job<T> | null> {
    const queue = getQueue<T>(queueName);
    return queue.getJob(jobId) as Promise<Job<T> | null>;
}

/**
 * Get queue status
 */
export async function getQueueStatus(queueName: string): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
}> {
    const queue = getQueue(queueName);
    const [waiting, active, completed, failed, delayed] = await Promise.all([
        queue.getWaitingCount(),
        queue.getActiveCount(),
        queue.getCompletedCount(),
        queue.getFailedCount(),
        queue.getDelayedCount(),
    ]);
    return { waiting, active, completed, failed, delayed };
}

/**
 * Cleanup: close all connections
 */
export async function closeQueues(): Promise<void> {
    const closePromises: Promise<void>[] = [];

    for (const [name, worker] of workers) {
        closePromises.push(worker.close().then(() => logger.info(`Worker closed: ${name}`)));
    }

    for (const [name, queue] of queues) {
        closePromises.push(queue.close().then(() => logger.info(`Queue closed: ${name}`)));
    }

    for (const [name, events] of queueEvents) {
        closePromises.push(events.close().then(() => logger.info(`QueueEvents closed: ${name}`)));
    }

    await Promise.all(closePromises);
    workers.clear();
    queues.clear();
    queueEvents.clear();
}
