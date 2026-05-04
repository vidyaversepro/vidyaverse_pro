import { logger } from './logger.js';
import { acquireBrowser, releaseBrowser, closePool } from './browser-pool.js';

/**
 * Close all browser instances (for cleanup / graceful shutdown).
 * Delegates to the browser pool.
 */
export async function closeBrowser(): Promise<void> {
    await closePool();
}

export interface PDFGenerationOptions {
    width: number;  // in mm
    height: number; // in mm
    orientation?: 'portrait' | 'landscape';
    margin?: {
        top?: string;
        right?: string;
        bottom?: string;
        left?: string;
    };
    printBackground?: boolean;
    displayHeaderFooter?: boolean;
    headerTemplate?: string;
    footerTemplate?: string;
}

/**
 * Generate PDF from HTML content
 */
export async function generatePDFFromHTML(
    html: string,
    options: PDFGenerationOptions
): Promise<Buffer> {
    const browser = await acquireBrowser();
    const page = await browser.newPage();

    try {
        // Set viewport
        await page.setViewport({
            width: Math.round(options.width * 3.78), // mm to pixels (approx 96 DPI)
            height: Math.round(options.height * 3.78),
        });

        // Set HTML content
        await page.setContent(html, {
            waitUntil: ['load', 'networkidle0'],
            timeout: 30000,
        });

        // Wait for fonts and images to load
        await page.evaluateHandle('document.fonts.ready');

        // Generate PDF
        const pdfBuffer = await page.pdf({
            width: `${options.width}mm`,
            height: `${options.height}mm`,
            printBackground: options.printBackground ?? true,
            margin: options.margin ?? { top: '0', right: '0', bottom: '0', left: '0' },
            displayHeaderFooter: options.displayHeaderFooter ?? false,
            headerTemplate: options.headerTemplate,
            footerTemplate: options.footerTemplate,
        });

        return Buffer.from(pdfBuffer);
    } finally {
        await page.close();
        releaseBrowser(browser);
    }
}

/**
 * Generate PNG screenshot from HTML content
 */
export async function generateImageFromHTML(
    html: string,
    options: {
        width: number;
        height: number;
        scale?: number;
        format?: 'png' | 'jpeg' | 'webp';
        quality?: number;
    }
): Promise<Buffer> {
    const browser = await acquireBrowser();
    const page = await browser.newPage();

    try {
        const scale = options.scale ?? 2; // Default 2x for high DPI

        await page.setViewport({
            width: Math.round(options.width * 3.78),
            height: Math.round(options.height * 3.78),
            deviceScaleFactor: scale,
        });

        await page.setContent(html, {
            waitUntil: ['load', 'networkidle0'],
            timeout: 30000,
        });

        await page.evaluateHandle('document.fonts.ready');

        const screenshot = await page.screenshot({
            type: options.format ?? 'png',
            quality: options.format === 'jpeg' ? (options.quality ?? 90) : undefined,
            fullPage: true,
        });

        return Buffer.from(screenshot);
    } finally {
        await page.close();
        releaseBrowser(browser);
    }
}

/**
 * Generate multiple PDFs in batch (more efficient)
 */
export async function generatePDFBatch(
    items: Array<{ html: string; filename: string }>,
    options: PDFGenerationOptions
): Promise<Array<{ filename: string; buffer: Buffer }>> {
    const browser = await acquireBrowser();
    const results: Array<{ filename: string; buffer: Buffer }> = [];

    try {
        // Process in parallel with concurrency limit
        const concurrency = 3;
        for (let i = 0; i < items.length; i += concurrency) {
            const batch = items.slice(i, i + concurrency);
            const batchResults = await Promise.all(
                batch.map(async (item) => {
                    const page = await browser.newPage();
                    try {
                        await page.setViewport({
                            width: Math.round(options.width * 3.78),
                            height: Math.round(options.height * 3.78),
                        });

                        await page.setContent(item.html, {
                            waitUntil: ['load', 'networkidle0'],
                            timeout: 30000,
                        });

                        await page.evaluateHandle('document.fonts.ready');

                        const pdfBuffer = await page.pdf({
                            width: `${options.width}mm`,
                            height: `${options.height}mm`,
                            printBackground: true,
                            margin: { top: '0', right: '0', bottom: '0', left: '0' },
                        });

                        return { filename: item.filename, buffer: Buffer.from(pdfBuffer) };
                    } finally {
                        await page.close();
                    }
                })
            );
            results.push(...batchResults);
        }
    } finally {
        releaseBrowser(browser);
    }

    return results;
}

/**
 * Generate a multi-page PDF from HTML chunks using Puppeteer page breaks.
 * Best for small batches of grid layouts.
 */
export async function generateMultiPagePDF(
    pages: string[],
    options: PDFGenerationOptions
): Promise<Buffer> {
    const browser = await acquireBrowser();
    const page = await browser.newPage();

    try {
        const combinedHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          @page { size: ${options.width}mm ${options.height}mm; margin: 0; }
          .page { width: ${options.width}mm; height: ${options.height}mm; page-break-after: always; overflow: hidden; }
          .page:last-child { page-break-after: avoid; }
        </style>
      </head>
      <body>
        ${pages.map(html => `<div class="page">${html}</div>`).join('')}
      </body>
      </html>
    `;

        await page.setContent(combinedHtml, {
            waitUntil: ['load', 'networkidle0'],
            timeout: 60000,
        });

        await page.evaluateHandle('document.fonts.ready');

        const pdfBuffer = await page.pdf({
            width: `${options.width}mm`,
            height: `${options.height}mm`,
            printBackground: true,
            margin: { top: '0', right: '0', bottom: '0', left: '0' },
        });

        return Buffer.from(pdfBuffer);
    } finally {
        await page.close();
        releaseBrowser(browser);
    }
}

import { PDFDocument, PDFPage } from 'pdf-lib';

/**
 * Merge multiple PDF buffers into a single buffer using pdf-lib
 */
export async function mergePDFs(pdfBuffers: Buffer[]): Promise<Buffer> {
    if (pdfBuffers.length === 0) {
        throw new Error('No PDF buffers to merge');
    }

    const mergedPdf = await PDFDocument.create();

    for (const buffer of pdfBuffers) {
        try {
            const pdf = await PDFDocument.load(buffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page: PDFPage) => mergedPdf.addPage(page));
        } catch (error) {
            logger.error('Failed to merge a PDF page:', error);
        }
    }

    const mergedPdfBytes = await mergedPdf.save();
    return Buffer.from(mergedPdfBytes);
}
