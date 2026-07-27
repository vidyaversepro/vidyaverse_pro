import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { env } from './env.js';

// BullMQ requires maxRetriesPerRequest to be null
const connection = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
});

export const CSV_IMPORT_QUEUE_NAME = 'BULK_STUDENT_CSV_IMPORT';

export const csvImportQueue = new Queue(CSV_IMPORT_QUEUE_NAME, {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
        removeOnComplete: {
            age: 3600, // Keep for 1 hour
            count: 100, // Keep up to 100
        },
        removeOnFail: {
            age: 24 * 3600, // Keep for 24 hours
        }
    }
});

export const PHOTO_ZIP_IMPORT_QUEUE_NAME = 'BULK_PHOTO_ZIP_IMPORT';

export const photoZipImportQueue = new Queue(PHOTO_ZIP_IMPORT_QUEUE_NAME, {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
        removeOnComplete: {
            age: 3600, // Keep for 1 hour
            count: 100, // Keep up to 100
        },
        removeOnFail: {
            age: 24 * 3600, // Keep for 24 hours
        }
    }
});

// ── WhatsApp messaging rail (Phase 1) ───────────────────────────────────────
export const WA_OUTBOX_QUEUE_NAME = 'WHATSAPP_OUTBOX';

export const waOutboxQueue = new Queue(WA_OUTBOX_QUEUE_NAME, {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000,
        },
        removeOnComplete: {
            age: 3600,
            count: 500,
        },
        removeOnFail: {
            age: 24 * 3600,
        }
    }
});

export const DIGEST_FLUSH_QUEUE_NAME = 'WHATSAPP_DIGEST_FLUSH';

export const digestFlushQueue = new Queue(DIGEST_FLUSH_QUEUE_NAME, {
    connection,
    defaultJobOptions: {
        attempts: 2,
        removeOnComplete: {
            age: 3600,
            count: 100,
        },
        removeOnFail: {
            age: 24 * 3600,
        }
    }
});

export const INBOUND_MEDIA_QUEUE_NAME = 'WHATSAPP_INBOUND_MEDIA';

export const inboundMediaQueue = new Queue(INBOUND_MEDIA_QUEUE_NAME, {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000,
        },
        removeOnComplete: {
            age: 3600,
            count: 200,
        },
        removeOnFail: {
            age: 24 * 3600,
        }
    }
});
