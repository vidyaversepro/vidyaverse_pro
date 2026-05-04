import sharp from 'sharp';
import { logger } from './logger.js';

export interface FaceBoundingBox {
    x: number; // normalized 0-1
    y: number; // normalized 0-1
    width: number; // normalized 0-1
    height: number; // normalized 0-1
    confidence: number;
    leftEye?: { x: number; y: number };
    rightEye?: { x: number; y: number };
}

// Phase 2: Wire MediaPipe FaceMesh here. Currently passes null — fallback path active.
export async function cropToPassport(rawBuffer: Buffer, box: FaceBoundingBox | null, targetW = 413, targetH = 531): Promise<Buffer> {
    if (!box || box.confidence < 0.6) {
        logger.debug('No valid face box provided or confidence low. Using fallback top-cover crop.');
        return sharp(rawBuffer)
            .rotate()
            .resize(targetW, targetH, {
                fit: 'cover',
                position: 'top',
            })
            .toBuffer();
    }
    
    // Future Phase 2 implementation for strict face alignment
    // For now, use fallback
    return sharp(rawBuffer)
        .rotate()
        .resize(targetW, targetH, {
            fit: 'cover',
            position: 'top',
        })
        .toBuffer();
}
