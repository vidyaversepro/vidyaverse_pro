import sharp from 'sharp';
import crypto from 'crypto';
import { uploadToMinio, getMinioFileUrl, buildPhotoKey, buildThumbKey } from '../config/minio.js';
import { logger } from './logger.js';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ProcessingOptions {
    /** Enhancement tier: 1 = basic resize, 2 = normalise+sharpen, 3 = AI (future) */
    tier: 1 | 2 | 3;
    /** Target width in pixels (default: 413 — 35 mm at 300 DPI) */
    targetWidth?: number;
    /** Target height in pixels (default: 531 — 45 mm at 300 DPI) */
    targetHeight?: number;
    /** WebP quality 0–100 (default: 88) */
    quality?: number;
}

export interface ProcessingResult {
    buffer: Buffer;
    hash: string;
    metadata: {
        tier: number;
        originalWidth: number;
        originalHeight: number;
        processedWidth: number;
        processedHeight: number;
        qualityScore: number;
        appliedEnhancements: string[];
        processedAt: string;
    };
}

// Legacy compat interface for group-photo.service.ts
export interface ImageProcessingOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
    background?: { r: number; g: number; b: number; alpha?: number };
}

// ─── Canonical Pipeline ─────────────────────────────────────────────────────

/**
 * The canonical photo processing pipeline.
 * Validate → EXIF rotate → resize → enhance → encode WebP → hash → quality score.
 */
export async function processPhoto(
    rawBuffer: Buffer,
    options: ProcessingOptions
): Promise<ProcessingResult> {
    const {
        tier,
        targetWidth = 413,
        targetHeight = 531,
        quality = 88,
    } = options;

    const appliedEnhancements: string[] = [];

    // Step 1: Validate input format
    const inputMeta = await sharp(rawBuffer, { failOnError: true }).metadata();
    if (!inputMeta.format || !['jpeg', 'png', 'webp'].includes(inputMeta.format)) {
        throw new Error(
            `Unsupported image format: "${inputMeta.format || 'unknown'}". ` +
            `Accepted formats: JPEG, PNG, WebP.`
        );
    }

    // Step 2: EXIF auto-rotate + resize
    let pipeline = sharp(rawBuffer)
        .rotate() // EXIF auto-orientation
        .resize(targetWidth, targetHeight, {
            fit: 'cover',
            position: 'top', // Favour head/face in passport photos
        });
    appliedEnhancements.push('exif_rotate', `resize_${targetWidth}x${targetHeight}`);

    // Step 3: Tier 2+ enhancements
    if (tier >= 2) {
        pipeline = pipeline
            .normalise({ lower: 1, upper: 99 })
            .modulate({ brightness: 1.02, saturation: 1.05 })
            .linear(1.05, -(0.05 * 128))
            .sharpen({ sigma: 0.8, m1: 0, m2: 3, x1: 2, y2: 15, y3: 15 });
        appliedEnhancements.push('normalise', 'modulate', 'contrast', 'sharpen');
    }

    // Step 4: Encode to WebP with sRGB ICC and 300 DPI
    const processed = await pipeline
        .webp({ quality, effort: 4, smartSubsample: true })
        .withIccProfile('srgb')
        .withMetadata({ density: 300 })
        .toBuffer();
    appliedEnhancements.push('webp_srgb_300dpi');

    // Step 5: SHA-256 hash
    const hash = crypto.createHash('sha256').update(processed).digest('hex');

    // Step 6: Quality score via Laplacian variance
    const qualityScore = await computeQualityScore(processed);

    // Get output dimensions
    const outputMeta = await sharp(processed).metadata();

    return {
        buffer: processed,
        hash,
        metadata: {
            tier,
            originalWidth: inputMeta.width || 0,
            originalHeight: inputMeta.height || 0,
            processedWidth: outputMeta.width || targetWidth,
            processedHeight: outputMeta.height || targetHeight,
            qualityScore,
            appliedEnhancements,
            processedAt: new Date().toISOString(),
        },
    };
}

/**
 * Generate a 200×267 WebP thumbnail at quality 75.
 */
export async function generateThumbnail(rawBuffer: Buffer): Promise<Buffer> {
    return sharp(rawBuffer)
        .rotate()
        .resize(200, 267, {
            fit: 'cover',
            position: 'top',
        })
        .webp({ quality: 75 })
        .toBuffer();
}

// ─── Upload Helpers ─────────────────────────────────────────────────────────

/**
 * Upload a processed photo to MinIO using the canonical key structure.
 * Returns the full URL.
 */
export async function uploadProcessedPhoto(
    buffer: Buffer,
    institutionId: string,
    studentId: string,
    version: number
): Promise<string> {
    const key = buildPhotoKey(institutionId, studentId, version);
    await uploadToMinio(key, buffer, 'image/webp');
    return getMinioFileUrl(key);
}

/**
 * Upload a thumbnail to MinIO using the canonical key structure.
 * Returns the full URL.
 */
export async function uploadProcessedThumb(
    buffer: Buffer,
    institutionId: string,
    studentId: string,
    version: number
): Promise<string> {
    const key = buildThumbKey(institutionId, studentId, version);
    await uploadToMinio(key, buffer, 'image/webp');
    return getMinioFileUrl(key);
}

// ─── Backward-Compat Wrappers ───────────────────────────────────────────────
// These are re-exported for callers that haven't migrated yet (group-photo.service.ts)

/**
 * Legacy processImage wrapper. Matches the old image-processor.ts signature.
 */
export async function processImage(
    buffer: Buffer,
    options: ImageProcessingOptions = {}
): Promise<Buffer> {
    const {
        maxWidth = 800,
        maxHeight = 800,
        quality = 85,
        format = 'jpeg',
        fit = 'inside',
        background = { r: 255, g: 255, b: 255 },
    } = options;

    let pipeline = sharp(buffer);
    const metadata = await pipeline.metadata();

    if (
        (metadata.width && metadata.width > maxWidth) ||
        (metadata.height && metadata.height > maxHeight)
    ) {
        pipeline = pipeline.resize(maxWidth, maxHeight, {
            fit,
            withoutEnlargement: true,
            background,
        });
    }

    switch (format) {
        case 'jpeg':
            pipeline = pipeline.jpeg({ quality, progressive: true });
            break;
        case 'png':
            pipeline = pipeline.png({ compressionLevel: 9 });
            break;
        case 'webp':
            pipeline = pipeline.webp({ quality });
            break;
    }

    return pipeline.toBuffer();
}

// ─── Internal Helpers ───────────────────────────────────────────────────────

/**
 * Compute image sharpness quality score using Laplacian variance.
 * Returns a number 0–100 where higher = sharper.
 */
async function computeQualityScore(imageBuffer: Buffer): Promise<number> {
    try {
        const { data, info } = await sharp(imageBuffer)
            .greyscale()
            .raw()
            .toBuffer({ resolveWithObject: true });

        const { width, height } = info;
        if (width < 3 || height < 1) return 0;

        // Compute Laplacian (1D horizontal kernel: [1, -2, 1])
        const laplacianValues: number[] = [];
        for (let y = 0; y < height; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = y * width + x;
                const val = data[idx - 1] - 2 * data[idx] + data[idx + 1];
                laplacianValues.push(val);
            }
        }

        if (laplacianValues.length === 0) return 0;

        // Compute variance
        const mean = laplacianValues.reduce((s, v) => s + v, 0) / laplacianValues.length;
        const variance = laplacianValues.reduce((s, v) => s + (v - mean) ** 2, 0) / laplacianValues.length;

        // Scale: divide by 8, clamp to 0–100
        return Math.min(100, Math.max(0, Math.round(variance / 8)));
    } catch (err) {
        logger.warn({ err }, 'Quality score computation failed, returning 0');
        return 0;
    }
}
