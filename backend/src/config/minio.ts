import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from './env.js';
import { logger } from '../utils/logger.js';
import { CircuitBreaker } from '../utils/circuit-breaker.js';

// ─── S3-Compatible Client (Cloudflare R2) ───────────────────────────────────

let s3Client: S3Client | null = null;

const storageBreaker = new CircuitBreaker('r2-storage', {
    failureThreshold: 3,
    resetTimeoutMs: 15_000,
});

export function getS3Client(): S3Client {
    if (!s3Client) {
        s3Client = new S3Client({
            region: env.R2_REGION,
            endpoint: env.R2_ENDPOINT,
            credentials: {
                accessKeyId: env.R2_ACCESS_KEY_ID,
                secretAccessKey: env.R2_SECRET_ACCESS_KEY,
            },
            // R2 requires path-style addressing
            forcePathStyle: true,
        });
    }
    return s3Client;
}

/**
 * Backward-compatible alias — callers that imported getMinioClient
 * now get the S3Client. Useful only for the csvImportWorker / student service
 * that need the raw client for streaming.
 */
export function getMinioClient(): S3Client {
    return getS3Client();
}

/**
 * Initialize storage — verifies connectivity by issuing a HeadBucket-like call.
 * R2 doesn't need bucket creation (it's pre-configured in the dashboard).
 */
export async function initializeMinio(): Promise<void> {
    try {
        const client = getS3Client();
        // Quick HEAD on a known-missing key to verify credentials & connectivity
        await client.send(new HeadObjectCommand({
            Bucket: env.R2_BUCKET_NAME,
            Key: '__health-check__',
        })).catch((err: any) => {
            // 404 = bucket exists, key doesn't → credentials work
            if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) return;
            throw err;
        });
        logger.info(`✅ R2 storage connected — bucket "${env.R2_BUCKET_NAME}"`);
    } catch (error) {
        logger.error(`❌ R2 storage initialization failed: ${error}`);
        throw error;
    }
}

// ─── High-level Storage Utilities ───────────────────────────────────────────

export const storage = {
    async uploadFile(
        objectName: string,
        buffer: Buffer,
        contentType: string
    ): Promise<string> {
        return storageBreaker.execute(async () => {
            const client = getS3Client();
            await client.send(new PutObjectCommand({
                Bucket: env.R2_BUCKET_NAME,
                Key: objectName,
                Body: buffer,
                ContentType: contentType,
            }));
            return `${env.R2_PUBLIC_URL}/${objectName}`;
        });
    },

    async deleteFile(objectName: string): Promise<void> {
        return storageBreaker.execute(async () => {
            const client = getS3Client();
            await client.send(new DeleteObjectCommand({
                Bucket: env.R2_BUCKET_NAME,
                Key: objectName,
            }));
        });
    },

    async getSignedUrl(objectName: string, expirySeconds = 3600): Promise<string> {
        return storageBreaker.execute(async () => {
            const client = getS3Client();
            const command = new GetObjectCommand({
                Bucket: env.R2_BUCKET_NAME,
                Key: objectName,
            });
            return getSignedUrl(client, command, { expiresIn: expirySeconds });
        });
    },

    async fileExists(objectName: string): Promise<boolean> {
        return storageBreaker.execute(async () => {
            const client = getS3Client();
            try {
                await client.send(new HeadObjectCommand({
                    Bucket: env.R2_BUCKET_NAME,
                    Key: objectName,
                }));
                return true;
            } catch (err: any) {
                if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
                    return false;
                }
                logger.warn({ err, objectName }, 'R2 HeadObject check failed');
                return false;
            }
        });
    },

    generateObjectName(
        institutionId: string,
        type: 'photos' | 'documents' | 'templates' | 'signatures' | 'pdfs',
        filename: string
    ): string {
        const timestamp = Date.now();
        const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
        return `${institutionId}/${type}/${timestamp}-${sanitizedFilename}`;
    },
};

// ─── Helper Function Exports (worker/service compatibility) ─────────────────

export async function uploadToMinio(
    objectPath: string,
    buffer: Buffer,
    contentType: string
): Promise<void> {
    return storageBreaker.execute(async () => {
        const client = getS3Client();
        await client.send(new PutObjectCommand({
            Bucket: env.R2_BUCKET_NAME,
            Key: objectPath,
            Body: buffer,
            ContentType: contentType,
        }));
    });
}

export async function getMinioFileUrl(objectPath: string): Promise<string> {
    // Build public URL directly — no presigning needed for public-read bucket
    return `${env.R2_PUBLIC_URL}/${objectPath}`;
}

export async function downloadFromMinio(objectPath: string): Promise<Buffer> {
    return storageBreaker.execute(async () => {
        const client = getS3Client();

        // Handle full URLs by extracting the key
        const key = extractKey(objectPath) ?? objectPath;

        const response = await client.send(new GetObjectCommand({
            Bucket: env.R2_BUCKET_NAME,
            Key: key,
        }));

        // AWS SDK v3 returns a readable stream — collect into Buffer
        const stream = response.Body as NodeJS.ReadableStream;
        return new Promise((resolve, reject) => {
            const chunks: Buffer[] = [];
            stream.on('data', (chunk: Buffer) => chunks.push(chunk));
            stream.on('end', () => resolve(Buffer.concat(chunks)));
            stream.on('error', reject);
        });
    });
}

// ─── Photo Pipeline v2 Utilities ────────────────────────────────────────────

/**
 * Extract the object key from a full URL (R2 public or legacy MinIO).
 * Returns null if the URL is empty or unparseable.
 */
export function extractKey(url: string): string | null {
    if (!url) return null;
    if (!url.startsWith('http')) return url; // Already a plain key
    try {
        const parsed = new URL(url);
        // For R2 public URL: https://storage.vgraphics.in/{key}
        const publicHost = new URL(env.R2_PUBLIC_URL).host;
        if (parsed.host === publicHost) {
            return parsed.pathname.startsWith('/')
                ? parsed.pathname.slice(1)
                : parsed.pathname;
        }

        // Legacy MinIO URL: pathname = /{bucket}/{key...}
        const pathname = parsed.pathname.startsWith('/')
            ? parsed.pathname.slice(1)
            : parsed.pathname;
        const bucketPrefix = `${env.R2_BUCKET_NAME}/`;
        if (pathname.startsWith(bucketPrefix)) {
            return pathname.slice(bucketPrefix.length);
        }
        // Fallback: return everything after the first slash
        const slashIdx = pathname.indexOf('/');
        return slashIdx >= 0 ? pathname.slice(slashIdx + 1) : null;
    } catch {
        return null;
    }
}

/**
 * Backward-compatible alias for extractKey.
 */
export function legacyExtractKey(url: string): string | null {
    return extractKey(url);
}

/**
 * Canonical photo key for versioned student photos.
 */
export function buildPhotoKey(institutionId: string, studentId: string, version: number): string {
    return `photos/${institutionId}/${studentId}/photo_${version}.webp`;
}

/**
 * Canonical thumbnail key for versioned student thumbnails.
 */
export function buildThumbKey(institutionId: string, studentId: string, version: number): string {
    return `photos/${institutionId}/${studentId}/thumb_${version}.webp`;
}

/**
 * Delete a single object from R2. Wrapped in circuit breaker.
 */
export async function deleteObject(objectKey: string): Promise<void> {
    return storageBreaker.execute(async () => {
        const client = getS3Client();
        await client.send(new DeleteObjectCommand({
            Bucket: env.R2_BUCKET_NAME,
            Key: objectKey,
        }));
    });
}

/**
 * Get a presigned URL for secure, time-limited access.
 * @param objectKeyOrUrl - Raw object key or full URL
 * @param ttlSeconds - Time-to-live in seconds (default: 3600 = 1 hour)
 */
export async function getPresignedUrl(objectKeyOrUrl: string, ttlSeconds: number = 3600): Promise<string> {
    return storageBreaker.execute(async () => {
        const client = getS3Client();
        const key = extractKey(objectKeyOrUrl) ?? objectKeyOrUrl;
        const command = new GetObjectCommand({
            Bucket: env.R2_BUCKET_NAME,
            Key: key,
        });
        return getSignedUrl(client, command, { expiresIn: ttlSeconds });
    });
}

/**
 * Get a presigned URL that forces a download via Content-Disposition header.
 * @param objectKeyOrUrl - Raw object key or full URL
 * @param filename - The default filename to suggest for download
 * @param ttlSeconds - Time-to-live in seconds (default: 3600)
 */
export async function getPresignedDownloadUrl(objectKeyOrUrl: string, filename: string, ttlSeconds: number = 3600): Promise<string> {
    return storageBreaker.execute(async () => {
        const client = getS3Client();
        const key = extractKey(objectKeyOrUrl) ?? objectKeyOrUrl;
        const command = new GetObjectCommand({
            Bucket: env.R2_BUCKET_NAME,
            Key: key,
            ResponseContentDisposition: `attachment; filename="${filename}"`,
        });
        return getSignedUrl(client, command, { expiresIn: ttlSeconds });
    });
}
