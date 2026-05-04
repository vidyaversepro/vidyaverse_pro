/**
 * units.ts — Pure unit conversion engine for the Template Studio.
 * No React, no side effects. 100% testable.
 *
 * Standard: all dimensions are stored internally in pixels at 96 DPI.
 * CSS px = 1/96 inch (browser standard).
 */

export type DesignUnit = 'px' | 'mm' | 'cm' | 'in';

/** Pixels per unit at 96 DPI */
export const PX_PER_UNIT: Record<DesignUnit, number> = {
    px: 1,
    mm: 96 / 25.4,   // ≈ 3.7795275591
    cm: 96 / 2.54,   // ≈ 37.795275591
    in: 96,
};

/**
 * Convert a value in the given unit to pixels (internal storage).
 */
export function toPx(value: number, unit: DesignUnit): number {
    return value * PX_PER_UNIT[unit];
}

/**
 * Convert pixels to the given display unit.
 */
export function fromPx(px: number, unit: DesignUnit): number {
    return px / PX_PER_UNIT[unit];
}

/** Decimal places per unit — matches CorelDraw / Illustrator conventions */
const DECIMAL_PLACES: Record<DesignUnit, number> = {
    px: 0,
    mm: 1,
    cm: 2,
    in: 3,
};

/**
 * Round a value (already in the display unit) to the appropriate
 * number of decimal places and return as a formatted string.
 */
export function formatUnit(value: number, unit: DesignUnit): string {
    return value.toFixed(DECIMAL_PLACES[unit]);
}

/**
 * Parse a raw string input into a number in the given unit.
 * Returns null if the value is empty, non-numeric, or negative.
 */
export function parseUnitInput(raw: string, unit: DesignUnit): number | null {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const n = parseFloat(trimmed);
    if (isNaN(n)) return null;
    if (n < 0) return null;
    // Reject unreasonably large values (> 2000 in any unit)
    if (unit === 'px' && n > 12000) return null;
    if (unit !== 'px' && toPx(n, unit) > toPx(2000, 'mm')) return null;
    return n;
}

// ─── Document Presets ────────────────────────────────────────────────────────

export interface DocumentPreset {
    /** Physical width in mm */
    widthMm: number;
    /** Physical height in mm */
    heightMm: number;
    /** Suggested display unit for this preset */
    unit: DesignUnit;
}

export const DOCUMENT_PRESETS: Record<string, DocumentPreset> = {
    'ID Card (CR80)':           { widthMm: 85.6,  heightMm: 53.98, unit: 'mm' },
    'Visiting Card (CR80)':     { widthMm: 85.6,  heightMm: 53.98, unit: 'mm' },
    'A4 Portrait':              { widthMm: 210,   heightMm: 297,   unit: 'mm' },
    'A4 Landscape':             { widthMm: 297,   heightMm: 210,   unit: 'mm' },
    'A5 Portrait':              { widthMm: 148,   heightMm: 210,   unit: 'mm' },
    'A5 Landscape':             { widthMm: 210,   heightMm: 148,   unit: 'mm' },
    'Half Letter':              { widthMm: 139.7, heightMm: 215.9, unit: 'in' },
    'Custom':                   { widthMm: 0,     heightMm: 0,     unit: 'mm' },
};

/** Minimum canvas size: 10mm in each dimension */
export const MIN_CANVAS_PX = toPx(10, 'mm');
/** Maximum canvas size: 1200mm in each dimension */
export const MAX_CANVAS_PX = toPx(1200, 'mm');

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Convert a DocumentPreset (stored in mm) to pixel dimensions.
 */
export function presetToPx(preset: DocumentPreset): { widthPx: number; heightPx: number } {
    return {
        widthPx:  toPx(preset.widthMm,  'mm'),
        heightPx: toPx(preset.heightMm, 'mm'),
    };
}

/**
 * Given a ServiceType string, return the best matching preset key.
 * Used by Step 2 of the creation dialog.
 */
export type ServiceType =
    | 'visiting_card'
    | 'id_card'
    | 'certificate'
    | 'hall_ticket'
    | 'marksheet'
    | 'library_card'
    | 'transfer_certificate'
    | 'portfolio'
    | 'group_photo';

export function presetForServiceType(serviceType: ServiceType): string {
    switch (serviceType) {
        case 'visiting_card':
        case 'id_card':
        case 'library_card':
            return 'ID Card (CR80)';
        case 'certificate':
        case 'hall_ticket':
        case 'marksheet':
        case 'transfer_certificate':
            return 'A4 Portrait';
        case 'portfolio':
        case 'group_photo':
            return 'A4 Landscape';
        default:
            return 'A4 Portrait';
    }
}
