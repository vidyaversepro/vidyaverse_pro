import { describe, it, expect } from 'vitest';
import {
    toPx,
    fromPx,
    formatUnit,
    parseUnitInput,
    PX_PER_UNIT,
} from './units';

describe('units — toPx', () => {
    it('1 inch = 96 px', () => {
        expect(toPx(1, 'in')).toBe(96);
    });

    it('25.4 mm ≈ 96 px (4 decimal tolerance)', () => {
        expect(toPx(25.4, 'mm')).toBeCloseTo(96, 4);
    });

    it('2.54 cm = 96 px', () => {
        expect(toPx(2.54, 'cm')).toBeCloseTo(96, 4);
    });

    it('100 px = 100 px', () => {
        expect(toPx(100, 'px')).toBe(100);
    });
});

describe('units — fromPx', () => {
    it('96 px = 1 inch', () => {
        expect(fromPx(96, 'in')).toBe(1);
    });

    it('96 px ≈ 25.4 mm', () => {
        expect(fromPx(96, 'mm')).toBeCloseTo(25.4, 4);
    });

    it('96 px ≈ 2.54 cm', () => {
        expect(fromPx(96, 'cm')).toBeCloseTo(2.54, 4);
    });

    it('96 px = 96 px', () => {
        expect(fromPx(96, 'px')).toBe(96);
    });
});

describe('units — round-trip consistency', () => {
    it('px → mm → px stays within 0.001px', () => {
        const original = 323.15;
        const converted = toPx(fromPx(original, 'mm'), 'mm');
        expect(Math.abs(converted - original)).toBeLessThan(0.001);
    });

    it('px → in → px stays within 0.001px', () => {
        const original = 842;
        const converted = toPx(fromPx(original, 'in'), 'in');
        expect(Math.abs(converted - original)).toBeLessThan(0.001);
    });
});

describe('units — PX_PER_UNIT constants', () => {
    it('px multiplier is 1', () => {
        expect(PX_PER_UNIT.px).toBe(1);
    });

    it('in multiplier is 96', () => {
        expect(PX_PER_UNIT.in).toBe(96);
    });
});

describe('units — formatUnit', () => {
    it('px is formatted as integer (0 decimals)', () => {
        expect(formatUnit(96, 'px')).toBe('96');
    });

    it('mm is formatted to 1 decimal', () => {
        expect(formatUnit(25.4000001, 'mm')).toBe('25.4');
    });

    it('cm is formatted to 2 decimals', () => {
        expect(formatUnit(2.54001, 'cm')).toBe('2.54');
    });

    it('in is formatted to 3 decimals', () => {
        expect(formatUnit(3.3701, 'in')).toBe('3.370');
    });
});

describe('units — parseUnitInput', () => {
    it('empty string returns null', () => {
        expect(parseUnitInput('', 'mm')).toBeNull();
    });

    it('whitespace-only returns null', () => {
        expect(parseUnitInput('   ', 'mm')).toBeNull();
    });

    it('non-numeric string returns null', () => {
        expect(parseUnitInput('abc', 'px')).toBeNull();
    });

    it('negative value returns null', () => {
        expect(parseUnitInput('-5', 'mm')).toBeNull();
    });

    it('zero returns zero', () => {
        // 0 is technically valid (though canvas won't accept it due to separate min check)
        expect(parseUnitInput('0', 'px')).toBe(0);
    });

    it('valid integer returns number', () => {
        expect(parseUnitInput('210', 'mm')).toBe(210);
    });

    it('valid decimal returns number', () => {
        expect(parseUnitInput('85.6', 'mm')).toBe(85.6);
    });

    it('valid inch value returns number', () => {
        expect(parseUnitInput('3.370', 'in')).toBeCloseTo(3.37, 3);
    });
});
