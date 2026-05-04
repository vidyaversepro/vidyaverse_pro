/**
 * Internal asset URL resolution for server-side rendering (Puppeteer).
 *
 * For client-facing pages, presigned URLs (1-hour TTL) are used.
 * For server-side Puppeteer rendering (ID cards, certificates, etc.)
 * we use the permanent public R2 URL — it never expires and works
 * regardless of how long the batch job runs.
 */
import { env } from '../config/env.js';
import { extractKey, getPresignedUrl } from '../config/minio.js';

/**
 * Build a permanent public URL for a storage object.
 * Only valid for R2 buckets with public-read access.
 */
export function getPublicStorageUrl(objectPath: string): string {
    // If it's already a full public URL, return as-is
    if (objectPath.startsWith(env.R2_PUBLIC_URL)) return objectPath;
    // Strip any leading slash
    const key = objectPath.startsWith('/') ? objectPath.slice(1) : objectPath;
    return `${env.R2_PUBLIC_URL}/${key}`;
}

/**
 * Resolve a photo URL/key for use in either server-side rendering or client display.
 *
 * @param objectKeyOrUrl - Raw R2 object key, full R2 public URL, or null
 * @param context        - 'server' uses permanent public URL; 'client' uses presigned URL
 * @returns A usable URL string, or a placeholder path
 */
export async function resolvePhotoUrl(
    objectKeyOrUrl: string | null | undefined,
    context: 'server' | 'client'
): Promise<string> {
    if (!objectKeyOrUrl) return '/placeholder-photo.png';

    // Normalize to a bare object key
    const key = extractKey(objectKeyOrUrl) ?? objectKeyOrUrl;

    if (context === 'server') {
        return getPublicStorageUrl(key);
    }

    // Client context: short-lived presigned URL
    return getPresignedUrl(key, 3600);
}
