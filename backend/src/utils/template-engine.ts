import Handlebars from 'handlebars';
import { format, differenceInYears } from 'date-fns';
import type {
    TemplateDocument,
    TemplatePage,
    TemplateElement,
    TemplateCanvasConfig,
    TextElement,
    ImageElement,
    ShapeElement,
    QrElement,
    BarcodeElement,
    LineElement,
    TableElement,
    BorderStyle,
    BoxShadow,
    ImageFilter,
} from '@vidyaverse/shared-validation';
import { unitConversions } from '@vidyaverse/shared-validation';

// ───────────────────────────────────────────────────────────
// Student Render Data — the contract for variable interpolation
// ───────────────────────────────────────────────────────────

export interface StudentRenderData {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    dob: string;
    gender: string;
    profilePhotoUrl: string;
    rollNumber: string;
    admissionNumber: string;
    class: {
        className: string;
        section: string;
        academicYear: string;
    };
    institution: {
        name: string;
        logoUrl: string;
        address: string;
        city: string;
        state: string;
        phone: string;
        email: string;
        code: string;
    };
    qrData: string;
    barcodeValue: string;
    serialNumber: string;
    [key: string]: unknown;
}

// ───────────────────────────────────────────────────────────
// Handlebars helpers — registered once on module load
// ───────────────────────────────────────────────────────────

export function registerHandlebarsHelpers(): void {
    Handlebars.registerHelper('formatDate', (date: Date | string, formatStr: string) => {
        if (!date) return '';
        const d = typeof date === 'string' ? new Date(date) : date;
        return format(d, formatStr || 'dd/MM/yyyy');
    });

    Handlebars.registerHelper('age', (dob: Date | string) => {
        if (!dob) return '';
        const birthDate = typeof dob === 'string' ? new Date(dob) : dob;
        return differenceInYears(new Date(), birthDate);
    });

    Handlebars.registerHelper('uppercase', (str: string) => str?.toUpperCase() || '');
    Handlebars.registerHelper('lowercase', (str: string) => str?.toLowerCase() || '');
    Handlebars.registerHelper('upper', (str: string) => str?.toUpperCase() || '');
    Handlebars.registerHelper('lower', (str: string) => str?.toLowerCase() || '');

    Handlebars.registerHelper('titlecase', (str: string) => {
        if (!str) return '';
        return str.replace(/\w\S*/g, (txt) =>
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    });

    Handlebars.registerHelper('eq', (a: unknown, b: unknown) => a === b);
    Handlebars.registerHelper('ne', (a: unknown, b: unknown) => a !== b);
    Handlebars.registerHelper('gt', (a: number, b: number) => a > b);
    Handlebars.registerHelper('gte', (a: number, b: number) => a >= b);
    Handlebars.registerHelper('lt', (a: number, b: number) => a < b);
    Handlebars.registerHelper('lte', (a: number, b: number) => a <= b);

    Handlebars.registerHelper('and', (...args) => {
        args.pop();
        return args.every(Boolean);
    });

    Handlebars.registerHelper('or', (...args) => {
        args.pop();
        return args.some(Boolean);
    });

    Handlebars.registerHelper('default', (value: unknown, defaultValue: unknown) => value ?? defaultValue);
    Handlebars.registerHelper('index', (array: unknown[], idx: number) => array?.[idx]);
    // Row numbering / arithmetic for tabular documents (marksheets, hall tickets).
    Handlebars.registerHelper('inc', (v: unknown) => (Number(v) || 0) + 1);
    Handlebars.registerHelper('add', (a: unknown, b: unknown) => (Number(a) || 0) + (Number(b) || 0));
    Handlebars.registerHelper('join', (array: string[], separator: string) => array?.join(separator || ', ') || '');

    Handlebars.registerHelper('truncate', (str: string, length: number) => {
        if (!str) return '';
        if (str.length <= length) return str;
        return str.substring(0, length) + '...';
    });

    Handlebars.registerHelper('academicYear', () => {
        const now = new Date();
        const year = now.getFullYear();
        return now.getMonth() >= 3 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
    });

    Handlebars.registerHelper('currentYear', () => new Date().getFullYear());

    Handlebars.registerHelper('qrcode', (data: string) =>
        new Handlebars.SafeString(`<img src="${data}" alt="QR Code" class="qr-code" />`)
    );

    Handlebars.registerHelper('barcode', (data: string) =>
        new Handlebars.SafeString(`<img src="${data}" alt="Barcode" class="barcode" />`)
    );

    Handlebars.registerHelper('safe', (html: string) => new Handlebars.SafeString(html || ''));

    Handlebars.registerHelper('photo', (photoUrl: string, fallback: string) => {
        const url = (typeof photoUrl === 'string' && photoUrl.startsWith('http'))
            ? photoUrl
            : (fallback || '/placeholder-photo.png');
        return new Handlebars.SafeString(`<img src="${url}" alt="Photo" class="student-photo" />`);
    });
}

// ───────────────────────────────────────────────────────────
// Compile plain Handlebars string (legacy compat)
// ───────────────────────────────────────────────────────────

export function compileTemplate(templateContent: string, data: Record<string, unknown>): string {
    const template = Handlebars.compile(templateContent);
    return template(data);
}

// ───────────────────────────────────────────────────────────
// V2 JSON → HTML Renderer (TemplateDocument aware)
// ───────────────────────────────────────────────────────────

/**
 * Compile a V2 TemplateDocument into HTML page strings.
 * Returns one HTML string per page.
 */
export function compileDocumentToHtml(
    doc: TemplateDocument,
    data: StudentRenderData,
    pageIndices?: number[]
): string[] {
    const { canvasConfig, pages } = doc;
    const pagesToRender = pageIndices
        ? pages.filter((_, i) => pageIndices.includes(i))
        : pages;

    return pagesToRender.map((page) => {
        const visibleElements = page.elements
            .filter((el) => el.visible)
            .sort((a, b) => a.zIndex - b.zIndex);

        const elementsHtml = visibleElements
            .map((el) => renderElement(el, data, canvasConfig))
            .join('\n');

        const bgStyle = buildPageBackground(page, canvasConfig);

        return `<div class="card-page" style="
            position: relative;
            width: ${canvasConfig.widthMm}mm;
            height: ${canvasConfig.heightMm}mm;
            overflow: hidden;
            ${bgStyle}
            box-sizing: border-box;
        ">${elementsHtml}</div>`;
    });
}

/**
 * Legacy JSON → HTML for old-format templates (canvasConfig + elements flat).
 * Preserved for backward compatibility with existing templates.
 */
export function compileJsonTemplateToHtml(templateJson: Record<string, unknown>, data: Record<string, unknown>): string {
    if (!templateJson || typeof templateJson !== 'object') return '';

    const { canvasConfig, elements, pages } = templateJson as Record<string, unknown>;

    // V2 format with pages
    if (pages && Array.isArray(pages)) {
        const doc = templateJson as unknown as TemplateDocument;
        const htmlPages = compileDocumentToHtml(doc, data as unknown as StudentRenderData);
        return htmlPages.join('\n');
    }

    // Legacy flat format
    if (!canvasConfig || !elements || !Array.isArray(elements)) {
        return compileTemplate(
            typeof templateJson === 'string' ? templateJson : JSON.stringify(templateJson),
            data
        );
    }

    const config = canvasConfig as Record<string, unknown>;
    const widthPx = unitConversions.mmToPx(config.widthMm as number);
    const heightPx = unitConversions.mmToPx(config.heightMm as number);

    let html = `<div style="position: relative; width: ${widthPx}px; height: ${heightPx}px; background-color: ${(config.bgColor as string) || '#ffffff'}; overflow: hidden;">`;

    for (const el of elements as Record<string, unknown>[]) {
        const style = `position: absolute; left: ${el.x}px; top: ${el.y}px; width: ${el.width}px; height: ${el.height}px; opacity: ${el.opacity ?? 1}; transform: rotate(${el.rotation || 0}deg);`;

        if (el.type === 'text') {
            const fontStyle = `font-size: ${el.fontSize || 16}px; font-family: ${el.fontFamily || 'Arial'}; color: ${el.fill || '#000000'}; text-align: ${el.align || 'left'}; font-weight: ${el.fontWeight || 'normal'};`;
            const compiledText = compileTemplate((el.text as string) || '', data);
            html += `<div style="${style} ${fontStyle} display: flex; align-items: center;">${compiledText}</div>`;
        } else if (el.type === 'image') {
            const compiledSrc = compileTemplate((el.src as string) || '', data);
            html += `<img src="${compiledSrc}" style="${style} object-fit: cover;" alt="" />`;
        } else if (el.type === 'shape') {
            const shapeStyle = `background-color: ${el.fill || '#cccccc'}; border: ${el.strokeWidth || 0}px solid ${el.stroke || 'transparent'}; border-radius: ${el.shapeType === 'circle' ? '50%' : (el.cornerRadius || 0) + 'px'};`;
            html += `<div style="${style} ${shapeStyle}"></div>`;
        }
    }

    html += `</div>`;
    return html;
}

// ───────────────────────────────────────────────────────────
// V2 Element Renderers
// ───────────────────────────────────────────────────────────

function renderElement(
    el: TemplateElement,
    data: StudentRenderData,
    _canvas: TemplateCanvasConfig
): string {
    const base = buildBaseStyle(el);

    switch (el.type) {
        case 'text':    return renderTextElement(el, data, base);
        case 'image':   return renderImageElement(el, data, base);
        case 'shape':   return renderShapeElement(el, base);
        case 'qr':      return renderQrElement(el, data, base);
        case 'barcode': return renderBarcodeElement(el, data, base);
        case 'line':    return renderLineElement(el, base);
        case 'table':   return renderTableElement(el, data, base);
    }
}

function buildBaseStyle(el: TemplateElement): string {
    return `
        position: absolute;
        left: ${el.x}mm;
        top: ${el.y}mm;
        width: ${el.width}mm;
        height: ${el.height}mm;
        transform: rotate(${el.rotation}deg);
        transform-origin: center center;
        opacity: ${el.opacity};
        z-index: ${el.zIndex};
    `;
}

function renderTextElement(el: TextElement, data: StudentRenderData, base: string): string {
    const compiled = Handlebars.compile(el.content)(data);
    return `<div style="
        ${base}
        font-family: ${el.fontFamily}, sans-serif;
        font-size: ${el.fontSize}pt;
        font-weight: ${el.fontWeight};
        font-style: ${el.fontStyle};
        text-align: ${el.textAlign};
        color: ${el.color};
        line-height: ${el.lineHeight};
        letter-spacing: ${el.letterSpacing}em;
        text-decoration: ${el.textDecoration};
        text-transform: ${el.textTransform};
        ${el.backgroundColor ? `background-color: ${el.backgroundColor};` : ''}
        padding: ${el.padding.top}mm ${el.padding.right}mm ${el.padding.bottom}mm ${el.padding.left}mm;
        ${el.border ? buildBorderStyle(el.border) : ''}
        ${el.borderRadius ? `border-radius: ${el.borderRadius}mm;` : ''}
        overflow: ${el.overflow};
        ${el.wordWrap ? 'word-wrap: break-word; white-space: pre-wrap;' : 'white-space: nowrap;'}
        display: flex;
        align-items: ${el.verticalAlign === 'top' ? 'flex-start' : el.verticalAlign === 'bottom' ? 'flex-end' : 'center'};
    ">${compiled}</div>`;
}

function renderImageElement(el: ImageElement, data: StudentRenderData, base: string): string {
    const rawSrc = Handlebars.compile(el.src)(data);
    const src = (typeof rawSrc === 'string' && rawSrc.startsWith('http')) ? rawSrc : el.fallbackSrc;
    const filterStyle = el.filter ? buildFilterStyle(el.filter) : '';

    return `<div style="${base} overflow: hidden;
        ${el.borderRadius ? `border-radius: ${el.borderRadius}mm;` : ''}
        ${el.border ? buildBorderStyle(el.border) : ''}
    ">
        <img
            src="${src}"
            onerror="this.src='${el.fallbackSrc}'"
            style="width:100%; height:100%; object-fit:${el.objectFit}; object-position:${el.objectPosition}; display:block; ${filterStyle}"
        />
    </div>`;
}

function renderShapeElement(el: ShapeElement, base: string): string {
    const isCircle = el.shape === 'circle' || el.shape === 'ellipse';
    return `<div style="
        ${base}
        background-color: ${el.fill};
        ${el.border ? buildBorderStyle(el.border) : ''}
        ${isCircle ? 'border-radius: 50%;' : (el.borderRadius ? `border-radius: ${el.borderRadius}mm;` : '')}
        ${el.shadow ? buildShadowStyle(el.shadow) : ''}
    "></div>`;
}

function renderQrElement(el: QrElement, data: StudentRenderData, base: string): string {
    const qrSrc = Handlebars.compile(el.data)(data);
    return `<div style="${base}">
        <img src="${qrSrc}" style="width:100%; height:100%; display:block;" />
    </div>`;
}

function renderBarcodeElement(el: BarcodeElement, data: StudentRenderData, base: string): string {
    const barcodeData = Handlebars.compile(el.data)(data);
    return `<div style="${base} display:flex; align-items:center; justify-content:center; font-family:monospace; font-size:12pt;">
        ${barcodeData}
    </div>`;
}

function renderLineElement(el: LineElement, base: string): string {
    const dashStyle = el.strokeDash ? `border-style: dashed;` : '';
    if (el.direction === 'horizontal') {
        return `<div style="${base} border-top: ${el.strokeWidth}mm solid ${el.stroke}; ${dashStyle}"></div>`;
    } else if (el.direction === 'vertical') {
        return `<div style="${base} border-left: ${el.strokeWidth}mm solid ${el.stroke}; ${dashStyle}"></div>`;
    }
    return `<div style="${base} border-top: ${el.strokeWidth}mm solid ${el.stroke}; transform: rotate(45deg); ${dashStyle}"></div>`;
}

function renderTableElement(el: TableElement, data: StudentRenderData, base: string): string {
    const rows = el.rows.map((row) => {
        const cells = row.cells.map((cell) => {
            const compiled = Handlebars.compile(cell.content)(data);
            const tag = row.isHeader ? 'th' : 'td';
            const bg = row.isHeader ? `background-color: ${el.headerBg}; color: ${el.headerTextColor};` : '';
            const colspan = cell.colSpan ? ` colspan="${cell.colSpan}"` : '';
            const rowspan = cell.rowSpan ? ` rowspan="${cell.rowSpan}"` : '';
            return `<${tag}${colspan}${rowspan} style="
                text-align: ${cell.align};
                padding: ${el.cellPadding.top}mm ${el.cellPadding.right}mm ${el.cellPadding.bottom}mm ${el.cellPadding.left}mm;
                border: ${el.borderWidth}mm solid ${el.borderColor};
                ${bg}
            ">${compiled}</${tag}>`;
        }).join('');
        return `<tr>${cells}</tr>`;
    }).join('');

    return `<div style="${base}">
        <table style="width:100%; height:100%; border-collapse:collapse; font-size:${el.fontSize}pt;">
            ${rows}
        </table>
    </div>`;
}

// ───────────────────────────────────────────────────────────
// Style Builders
// ───────────────────────────────────────────────────────────

function buildBorderStyle(b: BorderStyle): string {
    return `border: ${b.width}mm ${b.style} ${b.color};${b.radius ? ` border-radius: ${b.radius}mm;` : ''}`;
}

function buildShadowStyle(s: BoxShadow): string {
    return `box-shadow: ${s.x}mm ${s.y}mm ${s.blur}mm ${s.spread}mm ${s.color};`;
}

function buildFilterStyle(f: ImageFilter): string {
    const parts: string[] = [];
    if (f.brightness !== undefined) parts.push(`brightness(${f.brightness}%)`);
    if (f.contrast !== undefined) parts.push(`contrast(${f.contrast}%)`);
    if (f.saturation !== undefined) parts.push(`saturate(${f.saturation}%)`);
    if (f.grayscale) parts.push('grayscale(100%)');
    if (f.sepia) parts.push('sepia(100%)');
    return parts.length ? `filter: ${parts.join(' ')};` : '';
}

function buildPageBackground(page: TemplatePage, canvas: TemplateCanvasConfig): string {
    const bgColor = page.bgColor || canvas.bgColor || '#ffffff';
    const bgImage = page.bgImageUrl || canvas.bgImageUrl;
    let style = `background-color: ${bgColor};`;
    if (bgImage) {
        style += ` background-image: url('${bgImage}'); background-size: cover; background-position: center;`;
    }
    return style;
}

// Pre-compile for caching (legacy)
export function precompileTemplate(templateContent: string): HandlebarsTemplateDelegate {
    return Handlebars.compile(templateContent);
}

// Initialize helpers on module load
registerHandlebarsHelpers();
