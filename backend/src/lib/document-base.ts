/**
 * Shared document base for all printable HTML templates.
 *
 * Injects the bundled bilingual font (Latin + Devanagari) and a small reset so
 * EVERY template renders crisp Hindi + English without depending on OS fonts
 * (prod Linux/Chromium ship no Indic fonts). Templates only describe their
 * unique layout; the engine guarantees fonts + print-color fidelity.
 */
import { FONT_B64 } from './document-fonts.js';

function face(family: string, weight: number, b64: string): string {
    return `@font-face{font-family:'${family}';font-style:normal;font-weight:${weight};font-display:swap;src:url(data:font/woff2;base64,${b64}) format('woff2');}`;
}

let cachedFontCss: string | null = null;
export function documentFontCss(): string {
    if (cachedFontCss) return cachedFontCss;
    // Two families + per-glyph fallback: Latin chars resolve to NotoLatin,
    // Devanagari chars fall through to NotoDeva. No unicode-range needed.
    cachedFontCss = [
        face('NotoLatin', 400, FONT_B64.latin400),
        face('NotoLatin', 700, FONT_B64.latin700),
        face('NotoDeva', 400, FONT_B64.deva400),
        face('NotoDeva', 700, FONT_B64.deva700),
    ].join('');
    return cachedFontCss;
}

const BASE_CSS = `
*{margin:0;padding:0;box-sizing:border-box;}
html,body{font-family:'NotoLatin','NotoDeva',Arial,Helvetica,sans-serif;color:#1f2937;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
@page{margin:0;}
img{max-width:100%;}
`;

/**
 * Wrap a template's inner HTML into a full, font-embedded document.
 * Idempotent: if the content is already a full document, it is returned as-is.
 */
export function wrapHtmlDocument(inner: string): string {
    if (!inner) return inner;
    const head = inner.trimStart().slice(0, 60).toLowerCase();
    if (head.startsWith('<!doctype') || head.startsWith('<html')) return inner;
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${documentFontCss()}${BASE_CSS}</style></head><body>${inner}</body></html>`;
}
