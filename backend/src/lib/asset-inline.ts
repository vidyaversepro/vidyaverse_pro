/** Shared: fetch a storage object and return a base64 data URI (robust in
 * Puppeteer regardless of bucket public access / presigned TTLs). '' on failure. */
import { downloadFromMinio, extractKey } from '../config/minio.js';

export async function toDataUri(objectKeyOrUrl?: string | null): Promise<string> {
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
