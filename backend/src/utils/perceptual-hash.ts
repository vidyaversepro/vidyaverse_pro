import sharp from 'sharp';

/**
 * Generate perceptual hash (pHash) for image similarity detection
 * This is a simplified implementation - production would use a dedicated library
 *
 * The grid MUST stay 16x16. The output is one hex character per four pixels, so
 * the grid alone fixes the string length: 16x16 = 256 px = 256 bits = 64 hex
 * chars, which is exactly the width of every column this is stored in
 * (`group_photos.perceptual_hash` and `group_photo_extractions.face_hash`, both
 * VarChar(64)).
 *
 * It was 32x32, i.e. 1024 px -> 256 hex chars, four times what the column can
 * hold, so `POST /group-photos` failed with Prisma P2000 ("value too long")
 * on EVERY upload, for any image, from the day it shipped. Nothing had ever
 * caught it because the frontend was calling `/group-photo` (singular) and
 * never reached this code. Verified safe to change: `group_photos` held 0 rows
 * in dev and 0 in production, so no stored hash exists to invalidate — which
 * matters because `hammingDistance` throws outright on a length mismatch.
 */
export async function generatePerceptualHash(buffer: Buffer): Promise<string> {
    // 1. Reduce size to 16x16 — see the note above before changing this
    const resized = await sharp(buffer)
        .resize(16, 16, { fit: 'fill' })
        .grayscale()
        .raw()
        .toBuffer();

    // 2. Compute mean pixel value
    const pixels = Array.from(resized);
    const mean = pixels.reduce((a, b) => a + b, 0) / pixels.length;

    // 3. Generate hash: 1 if pixel > mean, 0 otherwise
    let hash = '';
    for (const pixel of pixels) {
        hash += pixel > mean ? '1' : '0';
    }

    // 4. Convert to hex
    let hexHash = '';
    for (let i = 0; i < hash.length; i += 4) {
        const nibble = hash.slice(i, i + 4);
        hexHash += parseInt(nibble, 2).toString(16);
    }

    return hexHash;
}

/**
 * Calculate Hamming distance between two hashes
 */
export function hammingDistance(hash1: string, hash2: string): number {
    if (hash1.length !== hash2.length) {
        throw new Error('Hashes must be same length');
    }

    let distance = 0;
    for (let i = 0; i < hash1.length; i++) {
        const n1 = parseInt(hash1[i], 16);
        const n2 = parseInt(hash2[i], 16);
        const xor = n1 ^ n2;
        // Count bits in XOR result
        distance += xor.toString(2).split('1').length - 1;
    }

    return distance;
}

/**
 * Calculate similarity percentage (0-100)
 */
export function calculateSimilarity(hash1: string, hash2: string): number {
    const distance = hammingDistance(hash1, hash2);
    const maxDistance = hash1.length * 4; // 4 bits per hex char
    return Math.round((1 - distance / maxDistance) * 100);
}

/**
 * Check if two images are similar (threshold based)
 */
export function areSimilar(hash1: string, hash2: string, threshold: number = 85): boolean {
    return calculateSimilarity(hash1, hash2) >= threshold;
}

/**
 * Generate average hash (aHash) - faster but less accurate
 */
export async function generateAverageHash(buffer: Buffer): Promise<string> {
    // 1. Reduce to 8x8
    const resized = await sharp(buffer)
        .resize(8, 8, { fit: 'fill' })
        .grayscale()
        .raw()
        .toBuffer();

    // 2. Compute mean
    const pixels = Array.from(resized);
    const mean = pixels.reduce((a, b) => a + b, 0) / pixels.length;

    // 3. Generate 64-bit hash
    let hash = '';
    for (const pixel of pixels) {
        hash += pixel > mean ? '1' : '0';
    }

    // 4. Convert to hex (16 chars)
    let hexHash = '';
    for (let i = 0; i < hash.length; i += 4) {
        const nibble = hash.slice(i, i + 4);
        hexHash += parseInt(nibble, 2).toString(16);
    }

    return hexHash;
}

/**
 * Generate difference hash (dHash) - good for detecting shifts
 */
export async function generateDifferenceHash(buffer: Buffer): Promise<string> {
    // 1. Reduce to 9x8 (need 9 width for 8 differences)
    const resized = await sharp(buffer)
        .resize(9, 8, { fit: 'fill' })
        .grayscale()
        .raw()
        .toBuffer();

    const pixels = Array.from(resized);

    // 2. Compare adjacent pixels
    let hash = '';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const left = pixels[row * 9 + col];
            const right = pixels[row * 9 + col + 1];
            hash += left > right ? '1' : '0';
        }
    }

    // 3. Convert to hex
    let hexHash = '';
    for (let i = 0; i < hash.length; i += 4) {
        const nibble = hash.slice(i, i + 4);
        hexHash += parseInt(nibble, 2).toString(16);
    }

    return hexHash;
}

/**
 * Find duplicate images in a collection
 */
export async function findDuplicates(
    images: Array<{ id: string; buffer: Buffer }>,
    threshold: number = 90
): Promise<Array<{ id1: string; id2: string; similarity: number }>> {
    // Generate hashes for all images
    const hashes = await Promise.all(
        images.map(async (img) => ({
            id: img.id,
            hash: await generatePerceptualHash(img.buffer),
        }))
    );

    // Compare all pairs
    const duplicates: Array<{ id1: string; id2: string; similarity: number }> = [];

    for (let i = 0; i < hashes.length; i++) {
        for (let j = i + 1; j < hashes.length; j++) {
            const similarity = calculateSimilarity(hashes[i].hash, hashes[j].hash);
            if (similarity >= threshold) {
                duplicates.push({
                    id1: hashes[i].id,
                    id2: hashes[j].id,
                    similarity,
                });
            }
        }
    }

    return duplicates;
}

/**
 * Extract color histogram for advanced matching
 */
export async function extractColorHistogram(buffer: Buffer): Promise<{
    red: number[];
    green: number[];
    blue: number[];
}> {
    const { data, info } = await sharp(buffer)
        .resize(100, 100, { fit: 'fill' })
        .raw()
        .toBuffer({ resolveWithObject: true });

    const bins = 16;
    const red = new Array(bins).fill(0);
    const green = new Array(bins).fill(0);
    const blue = new Array(bins).fill(0);

    for (let i = 0; i < data.length; i += info.channels) {
        red[Math.floor(data[i] / (256 / bins))]++;
        green[Math.floor(data[i + 1] / (256 / bins))]++;
        blue[Math.floor(data[i + 2] / (256 / bins))]++;
    }

    // Normalize
    const total = (info.width ?? 100) * (info.height ?? 100);
    return {
        red: red.map(v => v / total),
        green: green.map(v => v / total),
        blue: blue.map(v => v / total),
    };
}
