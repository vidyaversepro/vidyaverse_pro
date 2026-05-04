export const DPI = 96;

export const unitConversions = {
    mmToPx: (mm: number) => (mm / 25.4) * DPI,
    pxToMm: (px: number) => (px / DPI) * 25.4,
    cmToMm: (cm: number) => cm * 10,
    mmToCm: (mm: number) => mm / 10,
    inToMm: (inch: number) => inch * 25.4,
    mmToIn: (mm: number) => mm / 25.4,
};

export function convertToMm(value: number, from: 'px' | 'mm' | 'cm' | 'in'): number {
    switch (from) {
        case 'px': return unitConversions.pxToMm(value);
        case 'mm': return value;
        case 'cm': return unitConversions.cmToMm(value);
        case 'in': return unitConversions.inToMm(value);
    }
}

export function convertFromMm(value: number, to: 'px' | 'mm' | 'cm' | 'in'): number {
    switch (to) {
        case 'px': return unitConversions.mmToPx(value);
        case 'mm': return value;
        case 'cm': return unitConversions.mmToCm(value);
        case 'in': return unitConversions.mmToIn(value);
    }
}
