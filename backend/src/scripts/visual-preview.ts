/**
 * Render every curated default template (real institution branding + sample data)
 * to a local PNG so the output can be visually inspected. Same render path as the
 * in-app preview: registry HTML -> Handlebars -> document-base (fonts) -> Puppeteer image.
 *
 * Run from backend/:  npx tsx src/scripts/visual-preview.ts <institutionId> [outDir]
 */
import { prisma } from '../config/database.js';
import { DEFAULT_TEMPLATES, getSampleData } from '../lib/default-templates/index.js';
import { buildBrandingContext } from '../lib/branding-context.js';
import { compileTemplate } from '../utils/template-engine.js';
import { wrapHtmlDocument } from '../lib/document-base.js';
import { generateImageFromHTML } from '../utils/pdf-generator.js';
import fs from 'fs/promises';
import path from 'path';

const INSTITUTION = process.argv[2];
if (!INSTITUTION) {
    throw new Error('Usage: npx tsx src/scripts/visual-preview.ts <institutionId> [outDir] — no default, must be explicit.');
}
const OUT = process.argv[3] || path.join(process.env.TEMP || '.', 'vv-previews');

async function main() {
    await fs.mkdir(OUT, { recursive: true });
    const branding = await buildBrandingContext(INSTITUTION);
    for (const [type, def] of Object.entries(DEFAULT_TEMPLATES)) {
        try {
            const data = { ...branding, ...getSampleData(type) };
            const html = wrapHtmlDocument(compileTemplate(def.html, data));
            const png = await generateImageFromHTML(html, {
                width: def.widthMm, height: def.heightMm, scale: 1.5, format: 'png',
            });
            const file = path.join(OUT, `${type}.png`);
            await fs.writeFile(file, png);
            console.log(`OK   ${type.padEnd(22)} -> ${file} (${Math.round(png.length / 1024)} KB)`);
        } catch (e: any) {
            console.log(`FAIL ${type.padEnd(22)} ${e?.message || e}`);
        }
    }
    await prisma.$disconnect();
    process.exit(0);
}

main().catch(async (e) => {
    console.error('VISUAL PREVIEW FAILED:', e);
    await prisma.$disconnect();
    process.exit(1);
});
