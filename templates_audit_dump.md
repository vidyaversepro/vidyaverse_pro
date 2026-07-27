### backend/src/modules/templates/template.routes.ts
`	ypescript
// @ts-nocheck
import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { TemplateElement } from './template.types.js';
import { createTemplateService } from './template.service.js';
import { getTenantPrisma } from '../../lib/prisma-tenant.js';
import { prisma } from '../../config/database.js';
import { TEMPLATE_VARIABLE_REGISTRY } from '../../utils/pii-masking.js';
import { ServiceType } from '@prisma/client';

const UpdateTemplateBodySchema = z.object({
    name: z.string().trim().min(1).max(100).optional(),
    description: z.string().max(500).optional().nullable(),
    content: z.record(z.string(), z.unknown()).optional(),
    cssStyles: z.string().max(10000).optional().nullable(),
});
function getService(request) {
    if (request.institutionId) {
        return createTemplateService(getTenantPrisma(request.institutionId));
    }
    return createTemplateService();
}
const templateRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.addHook('onRequest', fastify.authenticate);
    /**
     * Create template
     */
    fastify.post('/', {
        preHandler: [fastify.requireInstitution],
        handler: async (request: any, reply) => {
            const body = request.body as Record<string, any>;
            let institutionId =
                request.institutionId ?? // institution-level admins get this from session
                body?.institutionId ?? null;     // super admins pass it in body

            // Robust fallback: If still null and user is a super admin, find an institution
            if (!institutionId && request.user?.globalRole === 'super_admin') {
                // Try from their roles first
                const userRole = await prisma.userInstitutionRole.findFirst({
                    where: { userId: request.user.userId },
                    select: { institutionId: true },
                });
                institutionId = userRole?.institutionId;
                
                // If they have no explicit roles, grab the first institution in the system
                if (!institutionId) {
                    const firstInst = await prisma.institution.findFirst({ select: { id: true }});
                    institutionId = firstInst?.id ?? null;
                }
            }

            if (!institutionId) {
                return reply.status(400).send({
                    success: false,
                    message: 'institutionId is required. Super admins must include it in the request body.',
                });
            }

            // Ensure request.institutionId is set for getService() tenant scoping
            request.institutionId = institutionId;

            const data = body;
            const template = await getService(request).create(institutionId, data);
            return { success: true, data: template };
        },
    });
    
    /**
     * Get variables for template service type
     */
    fastify.get('/variables', {
        handler: async (request: FastifyRequest<{ Querystring: { serviceType: ServiceType } }>, reply) => {
            const { serviceType } = request.query;
            
            if (!serviceType) {
                return reply.status(400).send({
                    success: false,
                    message: 'serviceType is required as a query parameter',
                });
            }

            const variables = TEMPLATE_VARIABLE_REGISTRY[serviceType];
            
            if (!variables) {
                 return reply.status(400).send({
                    success: false,
                    message: `Invalid serviceType or no variables found for ${serviceType}`,
                });
            }

            return { success: true, data: variables };
        },
    });

    /**
     * Preview template (generates PDF on the fly)
     */
    fastify.post('/preview', {
        config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
        preHandler: [fastify.requireInstitution],
        handler: async (request: FastifyRequest<{ Body: { template: any, data?: any, serviceType?: ServiceType } }>, reply) => {
            const body = request.body;
            const templateJson = body?.template;
            let dummyData = body?.data;
            const serviceType = body?.serviceType || templateJson?.serviceType || 'id_card';

            if (!templateJson) {
                return reply.status(400).send({
                    success: false,
                    message: 'template object is required in the request body',
                });
            }

            const { compileJsonTemplateToHtml } = await import('../../utils/template-engine.js');
            const { generatePDFFromHTML } = await import('../../utils/pdf-generator.js');
            const { generateDummyRenderData } = await import('../../utils/preview-generator.js');

            if (!dummyData) {
                dummyData = generateDummyRenderData(serviceType as ServiceType);
            }

            const widthMm = templateJson.canvasConfig?.widthMm || templateJson.widthMm || 85.60;
            const heightMm = templateJson.canvasConfig?.heightMm || templateJson.heightMm || 54.00;
            const orientation = templateJson.canvasConfig?.orientation || templateJson.orientation || 'landscape';

            const html = compileJsonTemplateToHtml(templateJson, dummyData);

            const pdfBuffer = await generatePDFFromHTML(html, {
                width: Number(widthMm),
                height: Number(heightMm),
                orientation: orientation as any,
            });

            return {
                success: true,
                data: {
                    pdfBase64: pdfBuffer.toString('base64')
                }
            };
        },
    });

    /**
     * Preview a curated DEFAULT template (by service type) with sample data +
     * the institution's real branding. Returns a PNG (base64) for in-app preview.
     */
    fastify.get('/preview-default/:serviceType', {
        config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
        preHandler: [fastify.requireInstitution],
        handler: async (request: any, reply) => {
            const { serviceType } = request.params;
            const institutionId = request.institutionId;
            const { getDefaultTemplate, getSampleData } = await import('../../lib/default-templates/index.js');
            const def = getDefaultTemplate(serviceType);
            if (!def) return reply.status(404).send({ success: false, message: `No curated default for '${serviceType}'` });

            const { buildBrandingContext } = await import('../../lib/branding-context.js');
            const { wrapHtmlDocument } = await import('../../lib/document-base.js');
            const { compileTemplate } = await import('../../utils/template-engine.js');
            const { generateImageFromHTML } = await import('../../utils/pdf-generator.js');
            const { generateStudentQRCode } = await import('../../utils/qrcode.js');

            const branding = await buildBrandingContext(institutionId);
            const sample = getSampleData(serviceType);
            const qrCode = await generateStudentQRCode({
                id: 'preview',
                admissionNo: sample.admissionNumber || sample.student?.admissionNumber || 'PREVIEW',
                name: sample.studentName || sample.student?.name || sample.name || 'Preview',
                institutionCode: 'VV',
            });
            const data: any = { ...branding, ...sample, qrCode };
            if (data.results) data.results.qrCode = qrCode;

            const html = wrapHtmlDocument(compileTemplate(def.html, data));
            const png = await generateImageFromHTML(html, {
                width: def.widthMm, height: def.heightMm, scale: def.widthMm < 120 ? 4 : 2, format: 'png',
            });
            return { success: true, data: { serviceType, mime: 'image/png', pngBase64: png.toString('base64'), width: def.widthMm, height: def.heightMm } };
        },
    });

    /**
     * Lint a template's variables/helpers against the per-service-type catalog.
     */
    fastify.post('/lint', {
        preHandler: [fastify.requireInstitution],
        handler: async (request: any, reply) => {
            const { content, serviceType } = request.body || {};
            if (typeof content !== 'string' || !serviceType) {
                return reply.status(400).send({ success: false, message: 'content (string) and serviceType are required' });
            }
            const { getSampleData } = await import('../../lib/default-templates/index.js');
            const { lintTemplate, allowedRootsFromSample } = await import('../../lib/template-lint.js');
            const { buildBrandingContext } = await import('../../lib/branding-context.js');
            const branding = await buildBrandingContext(request.institutionId);
            const allowed = allowedRootsFromSample(getSampleData(serviceType), Object.keys(branding));
            const result = lintTemplate(content, allowed);
            return { success: result.ok, data: result };
        },
    });

    /**
     * List templates
     */
    fastify.get('/', {
        preHandler: [fastify.requireInstitution],
        handler: async (request: FastifyRequest) => {
            const institutionId = request.institutionId;
            const { page, limit, serviceType, targetAudience, search } = request.query || {};

            const filters: any = {};
            if (serviceType) filters.serviceType = serviceType;
            if (targetAudience) filters.targetAudience = targetAudience;
            if (search) filters.search = search;

            let pagination: any = undefined;
            if (page && limit) {
                pagination = {
                    page: parseInt(page),
                    limit: parseInt(limit)
                };
            }

            const service = getService(request);
            const templates = await service.list(institutionId, filters, pagination);
            
            // If it returns paginated object { data, pagination }, we return it directly,
            // otherwise just { data }
            return { success: true, ...templates };
        },
    });
    /**
     * Get template by ID
     */
    fastify.get('/:id', {
        preHandler: [fastify.requireInstitution],
        handler: async (request: FastifyRequest<{ Params: { id: string } }>) => {
            const { id } = request.params;
            const institutionId = (request as FastifyRequest & { institutionId?: string }).institutionId;
            const template = await getService(request).getById(id, institutionId);
            return { success: true, data: template };
        },
    });
    /**
     * Get default template for a type
     */
    fastify.get('/default/:type', {
        preHandler: [fastify.requireInstitution],
        handler: async (request: FastifyRequest<{ Params: { type: string } }>) => {
            const { type } = request.params;
            const institutionId = (request as FastifyRequest & { institutionId?: string }).institutionId;
            const template = await getService(request).getDefault(institutionId, type);
            return { success: true, data: template };
        },
    });
    /**
     * Render template with data
     */
    fastify.post('/:id/render', {
        preHandler: [fastify.requireInstitution],
        handler: async (request) => {
            const { id } = request.params;
            const institutionId = request.institutionId;
            const data = request.body;
            const html = await getService(request).render(id, institutionId, data);
            return { success: true, data: { html } };
        },
    });
    /**
     * Upload asset (image/svg) to template
     */
    fastify.post('/:id/assets', {
        preHandler: [fastify.requireInstitution],
        handler: async (request: FastifyRequest<{ Params: { id: string }, Body: unknown }>) => {
            const { id } = request.params;
            const institutionId = request.institutionId;

            const data = await request.file();
            if (!data) {
                return { success: false, error: { message: 'No file uploaded' } };
            }

            const buffer = await data.toBuffer();
             
            const result = await getService(request).uploadAsset(
                id,
                institutionId || null,
                buffer,
                data.mimetype,
                data.filename
            );

            return { success: true, data: result };
        },
    });

    /**
     * Update template by ID
     */
    fastify.patch('/:id', {
        preHandler: [fastify.requireInstitution],
        handler: async (request: FastifyRequest<{ Params: { id: string }, Body: unknown }>) => {
            const { id } = request.params;
            const institutionId = (request as FastifyRequest & { institutionId?: string }).institutionId;
            const body = UpdateTemplateBodySchema.parse(request.body);
            const template = await getService(request).update(id, institutionId || '', body);
            return { success: true, data: template };
        },
    });
    /**
     * Set template as default
     */
    fastify.patch('/:id/default', {
        preHandler: [fastify.requireInstitution],
        handler: async (request) => {
            const { id } = request.params;
            const institutionId = request.institutionId;
            const template = await getService(request).setDefault(id, institutionId);
            return { success: true, data: template };
        },
    });

    /**
     * Delete template by ID
     */
    fastify.delete('/:id', {
        preHandler: [fastify.requireInstitution],
        handler: async (request: FastifyRequest<{ Params: { id: string } }>) => {
            const { id } = request.params;
            const institutionId = (request as FastifyRequest & { institutionId?: string }).institutionId;
            await getService(request).delete(id, institutionId || null);
            return { success: true, message: 'Template deleted successfully' };
        },
    });
};
export default templateRoutes;

`

### backend/src/modules/templates/template.service.ts
`	ypescript
import { prisma } from '../../config/database.js';
import { type ServiceType } from '@prisma/client';
import { compileTemplate } from '../../utils/template-engine.js';
import { wrapHtmlDocument } from '../../lib/document-base.js';
import { NotFoundError, BadRequestError } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';
import { JSDOM } from 'jsdom';
import createDOMPurify from 'dompurify';
import { nanoid } from 'nanoid';
import path from 'path';
import fs from 'fs/promises';

const window = new JSDOM('').window;
const purify = createDOMPurify(window as any);

export const createTemplateService = (tx: any = prisma) => ({
    /**
     * Get template by ID
     */
    
    /**
     * Create template
     */
    async create(institutionId: string, data: any) {
        return tx.template.create({
            data: {
                institutionId,
                name: data.name,
                serviceType: data.serviceType,
                templateType: data.templateType || 'html',
                content: typeof data.content === 'object' ? JSON.stringify(data.content) : data.content,
                targetAudience: data.targetAudience || 'ALL',
                description: data.description,
                widthMm: data.widthMm || 85.60,
                heightMm: data.heightMm || 54.00,
                orientation: data.orientation || 'landscape'
            }
        });
    },
    async list(
        institutionId?: string | null,
        filters?: { serviceType?: ServiceType; targetAudience?: any; search?: string },
        pagination?: { page: number; limit: number }
    ) {
        const where: any = {
            ...(institutionId ? { institutionId } : {}),
            ...(filters?.serviceType ? { serviceType: filters.serviceType } : {}),
            ...(filters?.targetAudience ? { targetAudience: filters.targetAudience } : {}),
        };

        if (filters?.search) {
            where.OR = [
                { name: { contains: filters.search } },
                { description: { contains: filters.search } }
            ];
        }

        if (pagination) {
            const skip = (pagination.page - 1) * pagination.limit;
            const [data, total] = await Promise.all([
                tx.template.findMany({
                    where,
                    skip,
                    take: pagination.limit,
                    orderBy: { updatedAt: 'desc' },
                }),
                tx.template.count({ where }),
            ]);

            return {
                data,
                pagination: {
                    total,
                    page: pagination.page,
                    limit: pagination.limit,
                    totalPages: Math.ceil(total / pagination.limit),
                },
            };
        }

        const data = await tx.template.findMany({
            where,
            orderBy: { updatedAt: 'desc' },
        });

        return { data };
    },

    /**
     * Get template by ID
     */
    async getById(templateId: string, institutionId?: string | null) {
        const template = await tx.template.findFirst({
            where: { id: templateId, ...(institutionId ? { institutionId } : {}) },
        });

        if (!template) {
            throw new NotFoundError('Template not found');
        }

        return template;
    },

    /**
     * Upload asset (image or SVG) for a template
     */
    async uploadAsset(templateId: string, institutionId: string | null, fileBuffer: Buffer, mimetype: string, filename: string) {
        // Only allow specific mimetypes
        const allowedMimetypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
        if (!allowedMimetypes.includes(mimetype)) {
            throw new BadRequestError('Invalid file type. Only JPG, PNG, WEBP, and SVG are allowed.');
        }

        let processBuffer = fileBuffer;

        // Sanitize SVG
        if (mimetype === 'image/svg+xml') {
            const rawSvg = processBuffer.toString('utf-8');
            const cleanSvg = purify.sanitize(rawSvg, {
                USE_PROFILES: { svg: true },
            });
            processBuffer = Buffer.from(cleanSvg, 'utf-8');
        }

        // Verify template exists and belongs to institution
        const template = await tx.template.findFirst({
            where: {
                id: templateId,
                ...(institutionId ? { institutionId } : {})
            }
        });

        if (!template) {
            throw new NotFoundError('Template not found or unauthorized');
        }

        const ext = path.extname(filename) || (mimetype === 'image/svg+xml' ? '.svg' : '.png');
        const uniqueName = `${nanoid()}${ext}`;
        const relativePath = `templates/${templateId}/assets/${uniqueName}`;

        // Save to local filesystem (uploads directory at project root)
        const uploadsDir = path.resolve(process.cwd(), 'uploads', 'templates', templateId, 'assets');
        await fs.mkdir(uploadsDir, { recursive: true });
        const filePath = path.join(uploadsDir, uniqueName);
        await fs.writeFile(filePath, processBuffer);

        // Return a URL that maps to the static file route (relative path for proxy compatibility)
        const url = `/uploads/${relativePath}`;
        logger.info({ url, filePath }, 'Template asset uploaded to local disk');
        return { url };
    },

    /**
     * Get the default template for a given type
     */
    async getDefault(institutionId: string | null | undefined, type: string) {
        const template = await tx.template.findFirst({
            where: { serviceType: type as ServiceType, isDefault: true, ...(institutionId ? { institutionId } : {}) },
            orderBy: { updatedAt: 'desc' },
        });

        if (!template) {
            // Fall back to any template of the same type
            return tx.template.findFirst({
                where: { serviceType: type as ServiceType, ...(institutionId ? { institutionId } : {}) },
                orderBy: { updatedAt: 'desc' },
            });
        }

        return template;
    },

    /**
     * Render a template with data
     */
    async render(templateId: string, institutionId: string | null | undefined, data: Record<string, unknown>) {
        const template = await this.getById(templateId, institutionId);
        if (!template.content) {
            throw new NotFoundError('Template has no HTML content');
        }

        try {
            const { applyMasking } = await import('../../utils/pii-masking.js');
            const maskedData = applyMasking(data);

            // JSON templates (Studio canvas: elements[]/pages[]) must go through
            // the layout renderer; only raw-HTML templates are plain Handlebars.
            const content = template.content.trim();
            const isJson = (template.templateType || '').toLowerCase() === 'json'
                || (content.startsWith('{') && (content.includes('"elements"') || content.includes('"pages"')));
            if (isJson) {
                const { compileJsonTemplateToHtml } = await import('../../utils/template-engine.js');
                return wrapHtmlDocument(compileJsonTemplateToHtml(JSON.parse(content), maskedData));
            }
            // Wrap raw-HTML templates in the shared document base (bundled fonts
            // + reset) so Hindi/English render identically everywhere.
            return wrapHtmlDocument(compileTemplate(template.content, maskedData));
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Template rendering failed';
            logger.error('Template rendering error', { templateId, error: message });
            throw new Error(`Template rendering failed: ${message}`);
        }
    },

    /**
     * Set a template as default for its service type and audience
     */
    async setDefault(templateId: string, institutionId: string) {
        const template = await this.getById(templateId, institutionId);

        // Transaction to ensure atomicity
        return tx.$transaction(async (prismaProvider: any) => {
            // Unset current default for this serviceType and targetAudience
            await prismaProvider.template.updateMany({
                where: {
                    institutionId,
                    serviceType: template.serviceType,
                    targetAudience: template.targetAudience,
                    isDefault: true,
                },
                data: { isDefault: false },
            });

            // Set this one as default
            return prismaProvider.template.update({
                where: { id: template.id },
                data: { isDefault: true },
            });
        });
    },

    /**
     * Update a template
     */
    async update(
        templateId: string,
        institutionId: string,
        data: {
            name?: string;
            description?: string | null;
            content?: Record<string, unknown>;
            cssStyles?: string | null;
        }
    ) {
        const template = await this.getById(templateId, institutionId);

        // Determine new content: serialize if provided, else keep existing.
        let content = template.content;
        if (data.content) {
            content = JSON.stringify(data.content);
        }

        return tx.template.update({
            where: { id: template.id },
            data: {
                name: data.name ?? template.name,
                description: data.description ?? template.description,
                content, // scalar string
                cssStyles: data.cssStyles ?? template.cssStyles,
            },
        });
    },

    /**
     * Delete a template
     */
    async delete(templateId: string, institutionId?: string | null) {
        const template = await this.getById(templateId, institutionId);
        try {
            return await tx.template.delete({
                where: { id: template.id },
            });
        } catch (error: any) {
            if (error.code === 'P2003') {
                throw new BadRequestError('This template is currently in use by generated documents and cannot be deleted.');
            }
            throw error;
        }
    },
});

export const templateService = createTemplateService();

`

### backend/src/modules/templates/template-resolver.ts
`	ypescript
import { prisma } from '../../config/database.js';
import { ServiceType, TemplateAudience, Template } from '@prisma/client';
import { CircuitBreaker } from '../../utils/circuit-breaker.js';
import { NotFoundError } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';

export interface TemplateResolutionContext {
    institutionId: string;
    productType: ServiceType;
    audience: TemplateAudience;
}

const templateResolverBreaker = new CircuitBreaker('TemplateResolver', { failureThreshold: 3, resetTimeoutMs: 30000 });

export class TemplateResolverService {
    /**
     * Resolves the most appropriate template for the given context using a waterfall approach.
     */
    async resolveTemplate(ctx: TemplateResolutionContext): Promise<Template> {
        return templateResolverBreaker.execute(async () => {
            // 1. Institution-specific, audience-specific, isDefault: true
            let template = await prisma.template.findFirst({
                where: {
                    institutionId: ctx.institutionId,
                    serviceType: ctx.productType,
                    targetAudience: ctx.audience,
                    isDefault: true,
                    isActive: true,
                },
                orderBy: { updatedAt: 'desc' },
            });

            if (template) {
                logger.debug(`Template resolved via Strategy 1 (Institution + Specific Audience)`, { templateId: template.id, ctx });
                return template;
            }

            // 2. Institution-specific, audience = ALL, isDefault: true
            template = await prisma.template.findFirst({
                where: {
                    institutionId: ctx.institutionId,
                    serviceType: ctx.productType,
                    targetAudience: 'ALL',
                    isDefault: true,
                    isActive: true,
                },
                orderBy: { updatedAt: 'desc' },
            });

            if (template) {
                logger.debug(`Template resolved via Strategy 2 (Institution + ALL Audience)`, { templateId: template.id, ctx });
                return template;
            }

            // 3. Fallback: Any active template for the institution matching the product, preferably the requested audience
            template = await prisma.template.findFirst({
                where: {
                    institutionId: ctx.institutionId,
                    serviceType: ctx.productType,
                    isActive: true,
                    OR: [
                        { targetAudience: ctx.audience },
                        { targetAudience: 'ALL' }
                    ]
                },
                orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
            });

            if (template) {
                logger.debug(`Template resolved via Strategy 3 (Fallback to any active)`, { templateId: template.id, ctx });
                return template;
            }

            // 4. Final fallback: auto-seed the curated default HTML template for
            //    this service type so every institution generates out of the box.
            const { getDefaultTemplate } = await import('../../lib/default-templates/index.js');
            const def = getDefaultTemplate(ctx.productType);
            if (def) {
                logger.info(`No template found — seeding curated default for ${ctx.productType}`, { institutionId: ctx.institutionId });
                return prisma.template.create({
                    data: {
                        institutionId: ctx.institutionId,
                        name: def.name,
                        serviceType: ctx.productType,
                        templateType: 'html',
                        content: def.html,
                        targetAudience: ctx.audience,
                        widthMm: def.widthMm,
                        heightMm: def.heightMm,
                        orientation: def.orientation,
                        isDefault: true,
                        isActive: true,
                    },
                });
            }

            logger.error(`Template resolution failed`, { ctx });
            throw new NotFoundError(`No suitable template found for ${ctx.productType}`);
        });
    }

    /**
     * Resolves a template by exact ID, ensuring it belongs to the institution
     */
    async resolveById(templateId: string, institutionId: string): Promise<Template> {
        return templateResolverBreaker.execute(async () => {
            const template = await prisma.template.findFirst({
                where: {
                    id: templateId,
                    institutionId,
                    isActive: true,
                }
            });

            if (!template) {
                throw new NotFoundError('Template not found or inactive');
            }

            return template;
        });
    }
}

export const templateResolver = new TemplateResolverService();

`

### backend/src/utils/pdf-generator.ts
`	ypescript
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

`

### backend/src/utils/template-engine.ts
`	ypescript
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

`

### backend/src/modules/marksheets/marksheet.routes.ts
`	ypescript
// @ts-nocheck
import { FastifyPluginAsync } from 'fastify';
// @ts-nocheck
import { createMarksheetService } from './marksheet.service.js';
import { getTenantPrisma } from '../../lib/prisma-tenant.js';
function getService(request) {
    if (request.institutionId) {
        return createMarksheetService(getTenantPrisma(request.institutionId));
    }
    return createMarksheetService();
}
import { markEntrySchema, bulkMarkEntrySchema, generateMarksheetSchema, bulkGenerateMarksheetsSchema, marksheetQuerySchema, calculationEngineCreateSchema, } from '@vidyaverse/shared-validation';
const marksheetRoutes: FastifyPluginAsync = async (fastify) => {
    // All routes require authentication
    fastify.addHook('onRequest', fastify.authenticate);
    // ==========================================================================
    // CALCULATION ENGINE ROUTES
    // ==========================================================================
    /**
     * Create calculation engine
     */
    fastify.post('/engines', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin'])],
        handler: async (request, reply) => {
            const institutionId = request.institutionId;
            const data = request.body;
            const engine = await getService(request).createCalculationEngine(institutionId, data);
            return reply.status(201).send({
                success: true,
                data: engine,
            });
        },
    });
    /**
     * List calculation engines
     */
    fastify.get('/engines', {
        preHandler: [fastify.requireInstitution],
        handler: async (request) => {
            const institutionId = request.institutionId;
            const engines = await getService(request).listCalculationEngines(institutionId);
            return {
                success: true,
                data: engines,
            };
        },
    });
    // ==========================================================================
    // MARKS ENTRY ROUTES
    // ==========================================================================
    /**
     * Enter single mark
     */
    fastify.post('/marks', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin', 'teacher'])],
        handler: async (request, reply) => {
            const institutionId = request.institutionId;
            const data = request.body;
            const mark = await getService(request).enterMark(institutionId, data);
            return reply.status(201).send({
                success: true,
                data: mark,
            });
        },
    });
    /**
     * Bulk enter marks
     */
    fastify.post('/marks/bulk', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin', 'teacher'])],
        handler: async (request) => {
            const institutionId = request.institutionId;
            const data = request.body;
            const results = await getService(request).enterMarksBulk(institutionId, data);
            return {
                success: true,
                data: results,
            };
        },
    });
    // ==========================================================================
    // MARKSHEET ROUTES
    // ==========================================================================
    /**
     * Generate single marksheet
     */
    fastify.post('/generate', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin'])],
        handler: async (request, reply) => {
            const institutionId = request.institutionId;
            const data = request.body;
            const marksheet = await getService(request).generate(institutionId, data);
            return reply.status(201).send({
                success: true,
                data: marksheet,
            });
        },
    });
    /**
     * Bulk generate marksheets
     */
    fastify.post('/generate/bulk', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin'])],
        handler: async (request) => {
            const institutionId = request.institutionId;
            const data = request.body;
            const results = await getService(request).generateBulk(institutionId, data);
            return {
                success: true,
                data: results,
            };
        },
    });
    /**
     * List marksheets
     */
    fastify.get('/', {
        preHandler: [fastify.requireInstitution],
        handler: async (request) => {
            const institutionId = request.institutionId;
            const query = request.query;
            const result = await getService(request).list(institutionId, query);
            return {
                success: true,
                data: result.marksheets,
                pagination: result.pagination,
            };
        },
    });
    /**
     * Get marksheet by ID
     */
    fastify.get('/:id', {
        preHandler: [fastify.requireInstitution],
        handler: async (request) => {
            const { id } = request.params;
            const institutionId = request.institutionId;
            const marksheet = await getService(request).getById(id, institutionId);
            return {
                success: true,
                data: marksheet,
            };
        },
    });
    /**
     * Calculate ranks for an exam
     */
    fastify.post('/ranks/:examScheduleId', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin'])],
        handler: async (request) => {
            const { examScheduleId } = request.params;
            await getService(request).calculateRanks(examScheduleId);
            return {
                success: true,
                message: 'Ranks calculated successfully',
            };
        },
    });
};
export default marksheetRoutes;

`

### backend/src/modules/marksheets/marksheet.service.ts
`	ypescript
import { prisma } from '../../config/database.js';
import { BadRequestError, NotFoundError } from '../../utils/errors.js';
import { templateService } from '../templates/template.service.js';
import { templateResolver } from '../templates/template-resolver.js';
import { generatePDFFromHTML } from '../../utils/pdf-generator.js';
import { generateStudentQRCode } from '../../utils/qrcode.js';
import { storage } from '../../config/minio.js';
import { buildBrandingContext } from '../../lib/branding-context.js';
import { toDataUri } from '../../lib/asset-inline.js';
import { logger } from '../../utils/logger.js';
import type {
    MarkEntryInput,
    BulkMarkEntryInput,
    GenerateMarksheetInput,
    BulkGenerateMarksheetsInput,
    MarksheetQueryInput,
    CalculationEngineCreateInput,
} from '@vidyaverse/shared-validation';

interface GradeMapping {
    minPercent: number;
    maxPercent: number;
    grade: string;
    gradePoint?: number;
    remarks?: string;
}

interface CalculationResult {
    totalMarks: number;
    maxMarks: number;
    percentage: number;
    grade: string;
    gradePoint?: number;
    remarks?: string;
    isPassed: boolean;
    subjectResults: SubjectResult[];
}

interface SubjectResult {
    subjectId: string;
    subjectName: string;
    marksObtained: number;
    maxMarks: number;
    percentage: number;
    grade: string;
    isPassed: boolean;
}

export const createMarksheetService = (tx: any = prisma) => ({
    // ============================================================================
    // CALCULATION ENGINE MANAGEMENT
    // ============================================================================

    async createCalculationEngine(institutionId: string, data: CalculationEngineCreateInput) {
        const engine = await tx.calculationEngine.create({
            data: {
                institutionId,
                academicYear: (data as any).academicYear || '2023-2024',
                cgpaFormula: (data as any).formula || '',
                percentageFormula: (data as any).formula || '',
                percentileFormula: (data as any).formula || '',
                gradeScale: (data as any).gradeMapping || {},
            },
        });

        logger.info('Calculation engine created', { engineId: engine.id });
        return engine;
    },

    async getCalculationEngine(id: string, institutionId: string) {
        const engine = await tx.calculationEngine.findFirst({
            where: { id, institutionId },
        });

        if (!engine) {
            throw new NotFoundError('Calculation engine not found');
        }

        return engine;
    },

    async listCalculationEngines(institutionId: string) {
        return tx.calculationEngine.findMany({
            where: { institutionId, isActive: true },
            orderBy: { createdAt: 'desc' },
        });
    },

    // Get-or-create the institution's calculation engine. Marksheet.calculationEngineId
    // is a required FK, so every institution needs one; created lazily with the
    // standard CBSE-style grade scale (matches calculateResults' built-in default).
    async ensureCalculationEngine(institutionId: string, academicYear: string) {
        const existing = await tx.calculationEngine.findFirst({
            where: { institutionId, isActive: true },
            orderBy: { createdAt: 'desc' },
        });
        if (existing) return existing;

        const now = new Date().getFullYear();
        return tx.calculationEngine.create({
            data: {
                institutionId,
                academicYear: academicYear || `${now}-${now + 1}`,
                cgpaFormula: 'sum(gradePoints)/subjectCount',
                percentageFormula: 'sum(obtained)/sum(max)*100',
                percentileFormula: 'rankBasedPercentile',
                gradeScale: [
                    { minPercent: 91, maxPercent: 100, grade: 'A+', gradePoint: 10, remarks: 'Outstanding' },
                    { minPercent: 81, maxPercent: 90, grade: 'A', gradePoint: 9, remarks: 'Excellent' },
                    { minPercent: 71, maxPercent: 80, grade: 'B+', gradePoint: 8, remarks: 'Very Good' },
                    { minPercent: 61, maxPercent: 70, grade: 'B', gradePoint: 7, remarks: 'Good' },
                    { minPercent: 51, maxPercent: 60, grade: 'C+', gradePoint: 6, remarks: 'Above Average' },
                    { minPercent: 41, maxPercent: 50, grade: 'C', gradePoint: 5, remarks: 'Average' },
                    { minPercent: 33, maxPercent: 40, grade: 'D', gradePoint: 4, remarks: 'Pass' },
                    { minPercent: 0, maxPercent: 32, grade: 'F', gradePoint: 0, remarks: 'Fail' },
                ],
            },
        });
    },

    // ============================================================================
    // MARKS ENTRY
    // ============================================================================

    async enterMark(institutionId: string, data: MarkEntryInput) {
        // Verify student exists
        const student = await tx.student.findFirst({
            where: { id: data.studentId, institutionId },
        });

        if (!student) {
            throw new NotFoundError('Student not found');
        }

        // Check for existing mark
        const existing = await tx.mark.findFirst({
            where: {
                studentId: data.studentId,
                examScheduleId: data.examScheduleId,
                subjectId: data.subjectId,
            },
        });

        if (existing) {
            // Update existing mark
            return tx.mark.update({
                where: { id: existing.id },
                data: {
                    theoryObtainedMarks: data.marksObtained,
                    practicalObtainedMarks: data.practicalMarks,
                    theoryMaxMarks: data.theoryMarks,
                    grade: data.gradeOverride,
                },
            });
        }

        // Create new mark
        return tx.mark.create({
            data: {
                studentId: data.studentId,
                examScheduleId: data.examScheduleId,
                subjectId: data.subjectId,
                theoryObtainedMarks: data.marksObtained,
                practicalObtainedMarks: data.practicalMarks,
                theoryMaxMarks: data.theoryMarks,
                grade: data.gradeOverride,
            },
        });
    },

    async enterMarksBulk(institutionId: string, data: BulkMarkEntryInput) {
        const results = {
            successful: 0,
            failed: [] as { studentId: string; error: string }[],
        };

        for (const entry of data.entries) {
            try {
                await this.enterMark(institutionId, {
                    studentId: entry.studentId,
                    examScheduleId: data.examScheduleId,
                    subjectId: data.subjectId,
                    marksObtained: entry.marksObtained,
                    practicalMarks: entry.practicalMarks,
                    theoryMarks: entry.theoryMarks,
                });
                results.successful++;
            } catch (error: any) {
                results.failed.push({
                    studentId: entry.studentId,
                    error: error.message,
                });
            }
        }

        return results;
    },

    async getMarksForEntry(institutionId: string, examScheduleId: string, sectionId: string, subjectId: string) {
        // Find all students in this section
        const students = await tx.student.findMany({
            where: {
                sectionId,
                institutionId,
                status: 'active'
            },
            select: {
                id: true,
                enrollmentNumber: true,
                rollNumber: true,
                user: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: [{ rollNumber: 'asc' }, { user: { name: 'asc' } }]
        });

        // Find existing marks for these students for this exam & subject
        const studentIds = students.map((s: any) => s.id);
        const marks = await tx.mark.findMany({
            where: {
                examScheduleId,
                subjectId,
                studentId: { in: studentIds }
            }
        });

        // Map them together
        return students.map((student: any) => {
            const mark = marks.find((m: any) => m.studentId === student.id);
            return {
                studentId: student.id,
                enrollmentNumber: student.enrollmentNumber,
                rollNumber: student.rollNumber,
                studentName: student.user.name,
                marksObtained: mark && mark.theoryObtainedMarks ? Number(mark.theoryObtainedMarks) : null,
                practicalMarks: mark && mark.practicalObtainedMarks ? Number(mark.practicalObtainedMarks) : null,
                theoryMarks: mark && mark.theoryMaxMarks ? mark.theoryMaxMarks : null,
                markId: mark && mark.id ? mark.id : null,
            };
        });
    },


    async listSubjects(institutionId: string, classId: string) {
        return tx.subject.findMany({
            where: { institutionId, classId },
            orderBy: { subjectName: 'asc' },
        });
    },

    // ============================================================================
    // RESULT CALCULATION
    // ============================================================================

    async calculateResults(
        studentId: string,
        examScheduleId: string,
        institutionId: string,
        engineId?: string
    ): Promise<CalculationResult> {
        // Get all marks for this student in this exam
        const marks = await tx.mark.findMany({
            where: { studentId, examScheduleId },
            include: {
                subject: true,
            },
        });

        if (marks.length === 0) {
            throw new BadRequestError('No marks found for this student');
        }

        // Get exam subjects to know max marks
        const examSchedule = await tx.examSchedule.findFirst({
            where: { id: examScheduleId, institutionId },
            include: {
                subjects: true,
            },
        });

        if (!examSchedule) {
            throw new NotFoundError('Exam schedule not found');
        }

        // Get calculation engine
        let gradeMapping: GradeMapping[] = [
            { minPercent: 91, maxPercent: 100, grade: 'A+', gradePoint: 10, remarks: 'Outstanding' },
            { minPercent: 81, maxPercent: 90, grade: 'A', gradePoint: 9, remarks: 'Excellent' },
            { minPercent: 71, maxPercent: 80, grade: 'B+', gradePoint: 8, remarks: 'Very Good' },
            { minPercent: 61, maxPercent: 70, grade: 'B', gradePoint: 7, remarks: 'Good' },
            { minPercent: 51, maxPercent: 60, grade: 'C+', gradePoint: 6, remarks: 'Above Average' },
            { minPercent: 41, maxPercent: 50, grade: 'C', gradePoint: 5, remarks: 'Average' },
            { minPercent: 33, maxPercent: 40, grade: 'D', gradePoint: 4, remarks: 'Pass' },
            { minPercent: 0, maxPercent: 32, grade: 'F', gradePoint: 0, remarks: 'Fail' },
        ];
        let passingPercent = 33;

        if (engineId) {
            const engine = await this.getCalculationEngine(engineId, institutionId);
            gradeMapping = engine.gradeScale as unknown as GradeMapping[];
            passingPercent = 33;
        }

        // Calculate subject-wise results
        const subjectResults: SubjectResult[] = [];
        let totalMarks = 0;
        let totalMaxMarks = 0;
        let allSubjectsPassed = true;

        for (const mark of marks) {
            const examSubject = examSchedule.subjects.find((s: any) => s.subjectId === mark.subjectId) as any;
            const maxMarks = examSubject?.maxMarks || 100;
            const marksObtained = Number(mark.theoryObtainedMarks || mark.totalObtainedMarks || 0);
            const percentage = (marksObtained / maxMarks) * 100;
            const grade = this.getGrade(percentage, gradeMapping);
            const isPassed = percentage >= passingPercent;

            if (!isPassed) {
                allSubjectsPassed = false;
            }

            subjectResults.push({
                subjectId: mark.subjectId,
                subjectName: mark.subject.subjectName,
                marksObtained: marksObtained,
                maxMarks,
                percentage: Math.round(percentage * 100) / 100,
                grade: mark.grade || grade,
                isPassed,
            });

            totalMarks += marksObtained;
            totalMaxMarks += maxMarks;
        }

        const overallPercentage = (totalMarks / totalMaxMarks) * 100;
        const overallGrade = this.getGrade(overallPercentage, gradeMapping);
        const gradeInfo = gradeMapping.find(
            (g) => overallPercentage >= g.minPercent && overallPercentage <= g.maxPercent
        );

        return {
            totalMarks,
            maxMarks: totalMaxMarks,
            percentage: Math.round(overallPercentage * 100) / 100,
            grade: overallGrade,
            gradePoint: gradeInfo?.gradePoint,
            remarks: gradeInfo?.remarks,
            isPassed: allSubjectsPassed && overallPercentage >= passingPercent,
            subjectResults,
        };
    },

    getGrade(percentage: number, gradeMapping: GradeMapping[]): string {
        for (const mapping of gradeMapping) {
            if (percentage >= mapping.minPercent && percentage <= mapping.maxPercent) {
                return mapping.grade;
            }
        }
        return 'F';
    },

    // ============================================================================
    // MARKSHEET GENERATION
    // ============================================================================

    async generate(institutionId: string, data: GenerateMarksheetInput) {
        const { studentId, examScheduleId, templateId } = data;

        // Get student
        const student = await tx.student.findFirst({
            where: { id: studentId, institutionId },
            include: {
                section: {
                    include: {
                        class: true,
                        stream: true,
                    },
                },
                institution: true,
            },
        });

        if (!student) {
            throw new NotFoundError('Student not found');
        }

        // Calculate results
        const results = await this.calculateResults(studentId, examScheduleId, institutionId);

        // Get exam schedule
        const examSchedule = await tx.examSchedule.findFirst({
            where: { id: examScheduleId },
        });

        // Ensure the required calculation-engine FK is satisfied (was '' before).
        const calculationEngine = await this.ensureCalculationEngine(
            institutionId,
            examSchedule?.academicYear || ''
        );

        // Check if marksheet already exists
        const existing = await tx.marksheet.findFirst({
            where: { studentId, examScheduleId },
        });

        if (existing) {
            return existing;
        }

        // Get template — resolveTemplate auto-seeds the curated default for any
        // institution that has none yet (same path certificate/hall-ticket use).
        const template = templateId
            ? await templateResolver.resolveById(templateId, institutionId)
            : await templateResolver.resolveTemplate({ institutionId, productType: 'marksheet', audience: 'STUDENT' });

        // Generate marksheet number
        const marksheetNumber = await this.generateMarksheetNumber(institutionId, examScheduleId);

        // Generate QR code
        // QR data for verification (preserved for future use)
        // const qrData = JSON.stringify({
        //     m: marksheetNumber,
        //     s: student.admissionNumber,
        //     p: results.percentage,
        //     g: results.grade,
        // });
        const qrCode = await generateStudentQRCode({
            id: student.id,
            admissionNo: student.admissionNumber || '',
            name: student.name,
            institutionCode: student.institution.code || 'VV'
        });

        // Prepare template data — shared branding context + flat keys the curated
        // template expects, plus marksheet-specific data.
        const branding = await buildBrandingContext(institutionId, tx);
        const studentPhoto = await toDataUri(student.photoUrl);
        const templateData = {
            ...branding,
            examName: examSchedule?.examName || 'Examination',
            academicYear: examSchedule?.academicYear || (student.institution as any)?.academicYear || '',
            studentPhoto,
            student: {
                id: student.id,
                name: student.name,
                admissionNumber: student.admissionNumber,
                photoUrl: student.photoUrl,
                fatherName: student.fatherName,
                motherName: student.motherName,
                dob: student.dob,
            },
            section: student.section,
            class: student.section.class,
            stream: student.section.stream,
            institution: student.institution,
            exam: {
                name: examSchedule?.examName,
                type: examSchedule?.examType,
                academicYear: examSchedule?.academicYear,
            },
            results: {
                ...results,
                marksheetNumber,
                qrCode,
            },
            subjects: results.subjectResults,
        };

        if (!template) {
            throw new Error('No marksheet template found. Please create a template first.');
        }

        // Render template
        const html = await templateService.render(template.id, institutionId, templateData);

        // Generate PDF
        const pdfBuffer = await generatePDFFromHTML(html, {
            width: Number(template.widthMm),
            height: Number(template.heightMm),
            orientation: template.orientation as 'portrait' | 'landscape',
        });

        // Upload to MinIO
        const objectName = storage.generateObjectName(
            institutionId,
            'pdfs',
            `marksheet-${marksheetNumber}.pdf`
        );
        const pdfUrl = await storage.uploadFile(objectName, pdfBuffer, 'application/pdf');

        // Create database record
        const marksheet = await tx.marksheet.create({
            data: {
                studentId,
                institutionId,
                examScheduleId,
                templateId: template.id,
                calculationEngineId: calculationEngine.id,
                totalPercentage: results.percentage,
                grade: results.grade,
                cgpa: results.gradePoint,
                classRank: null, // Calculated separately
                pdfUrl,
                status: 'generated',
            },
            include: {
                student: true,
                examSchedule: true,
            },
        });

        logger.info('Marksheet generated', { marksheetNumber, studentId });
        return marksheet;
    },

    async generateBulk(institutionId: string, data: BulkGenerateMarksheetsInput) {
        const { studentIds, examScheduleId, templateId } = data;
        const results = {
            successful: [] as Record<string, unknown>[],
            failed: [] as { studentId: string; error: string }[],
        };

        for (const studentId of studentIds) {
            try {
                const marksheet = await this.generate(institutionId, {
                    studentId,
                    examScheduleId,
                    templateId,
                });
                results.successful.push(marksheet);
            } catch (error: any) {
                results.failed.push({
                    studentId,
                    error: error.message,
                });
            }
        }

        // Calculate ranks after all marksheets are generated
        await this.calculateRanks(examScheduleId);

        return results;
    },

    async calculateRanks(examScheduleId: string) {
        const marksheets = await tx.marksheet.findMany({
            where: { examScheduleId },
            orderBy: { totalPercentage: 'desc' },
        });

        for (let i = 0; i < marksheets.length; i++) {
            await tx.marksheet.update({
                where: { id: marksheets[i].id },
                data: { classRank: i + 1 },
            });
        }
    },

    async list(institutionId: string, query: MarksheetQueryInput) {
        const { examScheduleId, sectionId, status, page, limit } = query;
        const skip = (page - 1) * limit;

        const where = {
            institutionId,
            ...(examScheduleId && { examScheduleId }),
            ...(sectionId && { student: { sectionId } }),
            ...(status && { status }),
        };

        const [marksheets, total] = await Promise.all([
            tx.marksheet.findMany({
                where,
                skip,
                take: limit,
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                            admissionNumber: true,
                            section: {
                                include: { class: true },
                            },
                        },
                    },
                    examSchedule: {
                        select: {
                            examName: true,
                            examType: true,
                        },
                    },
                },
                orderBy: [{ totalPercentage: 'desc' } as any, { classRank: 'asc' } as any],
            }),
            tx.marksheet.count({ where }),
        ]);

        return {
            marksheets,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    },

    async getById(id: string, institutionId: string) {
        const marksheet = await tx.marksheet.findFirst({
            where: { id, institutionId },
            include: {
                student: {
                    include: {
                        section: {
                            include: { class: true },
                        },
                    },
                },
                examSchedule: true,
            },
        });

        if (!marksheet) {
            throw new NotFoundError('Marksheet not found');
        }

        return marksheet;
    },

    // ============================================================================
    // HELPERS
    // ============================================================================

    async generateMarksheetNumber(institutionId: string, examScheduleId: string): Promise<string> {
        const count = await tx.marksheet.count({
            where: { institutionId, examScheduleId },
        });

        const year = new Date().getFullYear();
        const sequence = String(count + 1).padStart(5, '0');

        return `MS${year}${sequence}`;
    },
});

export const marksheetService = createMarksheetService();

`

### frontend/src/pages/templates/TemplatesPage.tsx
`	ypescript
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
    Plus,
    Search,
    FileText,
    CreditCard,
    Award,
    ClipboardList,
    BarChart3,
    Library,
    FileCheck,
    Users,
    Eye,
    Edit,
    Copy,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Contact,
    Star,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useTemplates, useSetDefaultTemplate, type Template, useDeleteTemplate, useDuplicateTemplate } from '@/lib/queries/templates/template-queries';
import { cn } from '@/lib/utils';

const serviceTypeIcons: Record<string, React.ElementType> = {
    id_card: CreditCard,
    certificate: Award,
    group_photo: Users,
    hall_ticket: ClipboardList,
    marksheet: BarChart3,
    library_card: Library,
    transfer_certificate: FileCheck,
    portfolio: FileText,
    visiting_card: Contact,
};

const serviceTypeColors: Record<string, string> = {
    id_card: 'from-[#E63946] to-[#C41E3A]',
    certificate: 'from-amber-500 to-orange-500',
    group_photo: 'from-blue-500 to-cyan-500',
    hall_ticket: 'from-red-500 to-pink-500',
    marksheet: 'from-emerald-500 to-green-500',
    library_card: 'from-indigo-500 to-blue-500',
    transfer_certificate: 'from-gray-500 to-slate-500',
    portfolio: 'from-pink-500 to-rose-500',
    visiting_card: 'from-violet-500 to-purple-600',
};

export default function TemplatesPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [selectedAudience, setSelectedAudience] = useState<string | null>(null);

    const { data, isLoading } = useTemplates({
        page: page.toString(),
        limit: '12',
        serviceType: (selectedType || undefined) as never,
        targetAudience: (selectedAudience || undefined) as never,
        search: searchQuery || undefined,
    });

    const setDefaultTemplateMutation = useSetDefaultTemplate();
    const deleteMutation = useDeleteTemplate();
    const duplicateMutation = useDuplicateTemplate();

    const handleSetDefault = async (templateId: string) => {
        try {
            await setDefaultTemplateMutation.mutateAsync(templateId);
            toast.success('Template set as default successfully');
            queryClient.invalidateQueries({ queryKey: ['templates'] });
        } catch {
            toast.error('Failed to set template as default');
        }
    };

    const handleDelete = async (templateId: string) => {
        if (window.confirm('Are you sure you want to delete this template?')) {
            try {
                await deleteMutation.mutateAsync(templateId);
                toast.success('Template deleted successfully');
            } catch (error: any) {
                const message = error.response?.data?.error?.message || error.response?.data?.message || 'Failed to delete template';
                toast.error(message);
            }
        }
    };

    const handleDuplicate = async (templateId: string) => {
        try {
            await duplicateMutation.mutateAsync(templateId);
            toast.success('Template duplicated successfully');
        } catch {
            toast.error('Failed to duplicate template');
        }
    };

    const serviceTypes = [
        { value: 'id_card', label: 'ID Cards' },
        { value: 'visiting_card', label: 'Visiting Cards' },
        { value: 'certificate', label: 'Certificates' },
        { value: 'hall_ticket', label: 'Hall Tickets' },
        { value: 'marksheet', label: 'Marksheets' },
        { value: 'library_card', label: 'Library Cards' },
        { value: 'transfer_certificate', label: 'Transfer Certs' },
    ];

    const audienceTypes = [
        { value: 'ALL', label: 'All Users' },
        { value: 'STUDENT', label: 'Students' },
        { value: 'TEACHER', label: 'Teachers' },
        { value: 'ADMIN', label: 'Admin' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Templates</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Manage document templates for all services
                    </p>
                </div>
                <Button 
                    onClick={() => navigate('/app/templates/new')}
                    className="bg-gradient-to-r from-[#E63946] to-[#C41E3A] hover:from-[#D32F3F] hover:to-[#B01A30] shadow-lg shadow-red-500/20"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Template
                </Button>
            </div>

            {/* Service Type Filters */}
            <div className="flex flex-wrap gap-2">
                <Button
                    variant={!selectedType ? 'default' : 'outline'}
                    size="sm"
                    className={!selectedType ? 'bg-gradient-to-r from-[#E63946] to-[#C41E3A]' : ''}
                    onClick={() => setSelectedType(null)}
                >
                    All Templates
                </Button>
                {serviceTypes.map((type) => {
                    const Icon = serviceTypeIcons[type.value];
                    return (
                        <Button
                            key={type.value}
                            variant={selectedType === type.value ? 'default' : 'outline'}
                            size="sm"
                            className={selectedType === type.value ? `bg-gradient-to-r ${serviceTypeColors[type.value]} text-white border-transparent` : ''}
                            onClick={() => setSelectedType(type.value)}
                        >
                            <Icon className="w-4 h-4 mr-2" />
                            {type.label}
                        </Button>
                    );
                })}
            </div>

            {/* Audience Filters */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <Button
                    variant={!selectedAudience ? 'secondary' : 'ghost'}
                    size="sm"
                    className={!selectedAudience ? 'bg-gray-200 dark:bg-gray-800' : 'text-gray-500'}
                    onClick={() => setSelectedAudience(null)}
                >
                    Any Audience
                </Button>
                {audienceTypes.map((audience) => (
                    <Button
                        key={audience.value}
                        variant={selectedAudience === audience.value ? 'secondary' : 'ghost'}
                        size="sm"
                        className={selectedAudience === audience.value ? 'bg-gray-200 dark:bg-gray-800' : 'text-gray-500'}
                        onClick={() => setSelectedAudience(audience.value)}
                    >
                        {audience.label}
                    </Button>
                ))}
            </div>

            {/* Search */}
            <Card className="border-0 shadow-lg">
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search templates..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {isLoading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                        </div>
                    ))
                ) : data?.data?.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                            <FileText className="w-8 h-8 text-[#E63946]" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Templates Yet</h3>
                        <p className="text-gray-500 mt-1">Create your first template to get started.</p>
                    </div>
                ) : (
                    data?.data?.map((template: Template) => {
                        const Icon = serviceTypeIcons[template.serviceType] || FileText;
                        return (
                            <motion.div
                                key={template.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ y: -4 }}
                                className="group"
                            >
                                <Card className="border-0 shadow-lg overflow-hidden hover:shadow-xl transition-all h-full">
                                    {/* Header with gradient */}
                                    <div
                                        className={cn(
                                            'h-24 relative bg-gradient-to-br',
                                            serviceTypeColors[template.serviceType] || 'from-gray-500 to-slate-500'
                                        )}
                                    >
                                        <div className="absolute inset-0 bg-black/10" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Icon className="w-10 h-10 text-white/80" />
                                        </div>

                                        {/* Default badge */}
                                        {template.isDefault && (
                                            <div className="absolute top-2 left-2 px-2 py-0.5 bg-white/20 backdrop-blur rounded text-xs text-white font-medium">
                                                Default
                                            </div>
                                        )}

                                        {/* Status indicator */}
                                        <div
                                            className={cn(
                                                'absolute top-2 right-2 w-2 h-2 rounded-full',
                                                template.isActive ? 'bg-green-400' : 'bg-red-400'
                                            )}
                                        />
                                    </div>

                                    <CardContent className="p-4">
                                        {/* Title */}
                                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                                            {template.name}
                                        </h3>

                                        {/* Description */}
                                        <p className="text-sm text-gray-500 mt-1 line-clamp-2 min-h-[40px]">
                                            {template.description || 'No description'}
                                        </p>

                                        {/* Meta */}
                                        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-gray-400">
                                            <span className="capitalize">{template.targetAudience?.toLowerCase() || 'all'}</span>
                                            <span>•</span>
                                            <span>{template.widthMm}×{template.heightMm}mm</span>
                                            <span>•</span>
                                            <span className="capitalize">{template.orientation}</span>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1 flex-wrap mt-4 pt-3 border-t dark:border-gray-700">
                                            <Button size="sm" variant="ghost" className="flex-1" onClick={() => navigate(`/app/templates/${template.id}/edit`)}>
                                                <Eye className="w-4 h-4 mr-1" />
                                                Preview
                                            </Button>
                                            <Button size="sm" variant="ghost" onClick={() => handleSetDefault(template.id)} disabled={setDefaultTemplateMutation.isPending || template.isDefault} title="Set Default">
                                                <Star className={cn("w-4 h-4", template.isDefault ? "fill-yellow-400 text-yellow-400" : "")} />
                                            </Button>
                                            <Button size="sm" variant="ghost" title="Edit" onClick={() => navigate(`/app/templates/${template.id}/edit`)}>
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button size="sm" variant="ghost" title="Duplicate" onClick={() => handleDuplicate(template.id)} disabled={duplicateMutation.isPending}>
                                                <Copy className="w-4 h-4" />
                                            </Button>
                                            <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(template.id)} disabled={deleteMutation.isPending}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* Pagination */}
            {data?.pagination && data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Page {page} of {data.pagination.totalPages}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={page === 1}
                            onClick={() => setPage((p) => p - 1)}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={page >= data.pagination.totalPages}
                            onClick={() => setPage((p) => p + 1)}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

`

### frontend/src/pages/templates/TemplateNewPage.tsx
`	ypescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ChevronRight, ChevronLeft, ArrowLeft } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';

import { useCreateTemplate } from '@/lib/queries/templates/template-queries';
import { extractApiErrorMessage } from '@/lib/extractApiErrorMessage';
import {
  DesignUnit,
  DOCUMENT_PRESETS,
  ServiceType,
  presetForServiceType,
  toPx,
  fromPx,
  formatUnit,
  MIN_CANVAS_PX,
  MAX_CANVAS_PX,
} from '@/lib/units';
import { cn } from '@/lib/utils';

// --- Validation Schemas ---

const Step1Schema = z.object({
  name: z.string().trim().min(3, 'Name must be at least 3 characters').max(100),
  serviceType: z.string().min(1, 'Please select a product type'),
  targetAudience: z.string().min(1, 'Please select a target audience'),
  description: z.string().max(500).optional(),
});

const Step2Schema = z.object({
  widthPx: z.number().min(MIN_CANVAS_PX).max(MAX_CANVAS_PX),
  heightPx: z.number().min(MIN_CANVAS_PX).max(MAX_CANVAS_PX),
  unit: z.enum(['px', 'mm', 'cm', 'in']),
  orientation: z.enum(['portrait', 'landscape']),
});

const Step3Schema = z.object({
  pageCount: z.number().int().min(1).max(20),
  hasBackSide: z.boolean(),
  bleedMm: z.number().min(0).max(10),
  dpi: z.union([z.literal(72), z.literal(300), z.literal(600)]),
  colorMode: z.enum(['rgb', 'cmyk']),
});

const TemplateCreationSchema = Step1Schema.merge(Step2Schema).merge(Step3Schema);
type TemplateCreationForm = z.infer<typeof TemplateCreationSchema>;

type Step = 1 | 2 | 3;

export default function TemplateNewPage() {
  const navigate = useNavigate();
  const createTemplate = useCreateTemplate(); // Renamed from createMutation

  const [step, setStep] = useState<Step>(1);

  // Initialize form
  const form = useForm<TemplateCreationForm>({
    resolver: zodResolver(TemplateCreationSchema),
    defaultValues: {
      name: '',
      serviceType: '',
      targetAudience: '',
      description: '',
      widthPx: toPx(210, 'mm'),
      heightPx: toPx(297, 'mm'),
      unit: 'mm',
      orientation: 'portrait',
      pageCount: 1,
      hasBackSide: false,
      bleedMm: 0,
      dpi: 300,
      colorMode: 'rgb',
    },
    mode: 'onChange',
  });

  const { watch, setValue, trigger, handleSubmit } = form;

  // Watchers for reactive UI
  const currentServiceType = watch('serviceType');
  const widthPx = watch('widthPx');
  const heightPx = watch('heightPx');
  const unit = watch('unit') as DesignUnit;
  const orientation = watch('orientation');
  const pages = watch('pageCount');

  // --- Handlers ---

  const handleNext = async () => {
    let isValid = false;
    if (step === 1) {
      isValid = await trigger(['name', 'serviceType', 'targetAudience', 'description']);
      // Auto-preset on moving to step 2 based on selected serviceType
      if (isValid && currentServiceType) {
        const presetKey = presetForServiceType(currentServiceType as ServiceType);
        const preset = DOCUMENT_PRESETS[presetKey];
        if (preset) {
            setValue('unit', preset.unit);
            setValue('widthPx', toPx(preset.widthMm, 'mm'));
            setValue('heightPx', toPx(preset.heightMm, 'mm'));
            setValue('orientation', preset.widthMm > preset.heightMm ? 'landscape' : 'portrait');
        }
      }
    } else if (step === 2) {
      isValid = await trigger(['widthPx', 'heightPx', 'unit', 'orientation']);
    }
    if (isValid) setStep((s) => (s + 1) as Step);
  };

  const handleBack = () => {
    setStep((s) => Math.max(1, s - 1) as Step);
  };

  const onOpenChange = (open: boolean) => {
    if (!open) navigate('/app/templates');
  };

  const onSubmit = async (data: TemplateCreationForm) => {
    if (step < 3) {
      handleNext();
      return;
    }

    const payload = {
        name: data.name,
        serviceType: data.serviceType,
        targetAudience: data.targetAudience,
        description: data.description,
        widthMm: fromPx(data.widthPx, 'mm'), // backend expects mm
        heightMm: fromPx(data.heightPx, 'mm'),
        orientation: data.orientation,
        templateType: 'json', // Default to JSON for the editor blocks
        content: {
            elements: [],
            canvasConfig: {
                widthMm: fromPx(data.widthPx, 'mm'),
                heightMm: fromPx(data.heightPx, 'mm'),
                scale: 1,
                bgColor: '#ffffff'
            },
            printConfig: {
                pageCount: data.pageCount,
                hasBackSide: data.hasBackSide,
                bleedMm: data.bleedMm,
                dpi: data.dpi,
                colorMode: data.colorMode
            }
        }
    };

    try {
        const newTemplate = await createTemplate.mutateAsync(payload);
        // Navigate to studio with the new template's ID
        navigate(`/app/templates/${newTemplate.id}/edit`);
        toast.success('Template created successfully!');
    } catch (error) {
        // Extract meaningful message from API error response
        const message = extractApiErrorMessage(error);
        // Show toast — use existing toast utility
        toast.error(message ?? 'Failed to create template. Please try again.');
        // Do NOT navigate away — keep user on the form
    }
  };

  // Unit conversion helpers for display
  const displayWidth = formatUnit(fromPx(widthPx, unit), unit);
  const displayHeight = formatUnit(fromPx(heightPx, unit), unit);

  const handleWidthChange = (valStr: string) => {
    const parsed = parseFloat(valStr);
    if (!isNaN(parsed)) {
      setValue('widthPx', toPx(parsed, unit), { shouldValidate: true });
    }
  };

  const handleHeightChange = (valStr: string) => {
    const parsed = parseFloat(valStr);
    if (!isNaN(parsed)) {
      setValue('heightPx', toPx(parsed, unit), { shouldValidate: true });
    }
  };

  const handleUnitChange = (newUnit: DesignUnit) => {
    setValue('unit', newUnit);
    // Doesn't change actual pixel dimensions, only display unit
  };

  const handlePresetSelect = (presetKey: string) => {
    const preset = DOCUMENT_PRESETS[presetKey];
    if (preset && preset.widthMm > 0) {
      setValue('unit', preset.unit);
      setValue('widthPx', toPx(preset.widthMm, 'mm'));
      setValue('heightPx', toPx(preset.heightMm, 'mm'));
      setValue('orientation', preset.widthMm > preset.heightMm ? 'landscape' : 'portrait');
    }
  };

  const toggleOrientation = () => {
    setValue('orientation', orientation === 'portrait' ? 'landscape' : 'portrait');
    // Swap dimensions
    const w = widthPx;
    setValue('widthPx', heightPx);
    setValue('heightPx', w);
  };

  return (
    <div className="fixed inset-0 bg-[#f8f9fa] z-50 flex items-center justify-center p-4">
      {/* Background purely aesthetic for the page */}
      <div className="absolute top-4 left-4">
        <Button variant="ghost" onClick={() => navigate('/app/templates')} className="text-slate-500 hover:text-slate-700">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Templates
        </Button>
      </div>

      <Dialog open={true} onOpenChange={onOpenChange}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-[600px] p-0 overflow-y-auto max-h-[90vh] border-0 shadow-2xl rounded-2xl">
          <div className="bg-[#b7102a] text-white p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-extrabold tracking-tight text-white m-0">Create New Template</DialogTitle>
              <DialogDescription className="text-white/80 mt-1 font-medium">
                Step {step} of 3 — {step === 1 ? 'Template Details' : step === 2 ? 'Canvas Size' : 'Pages & Print'}
              </DialogDescription>
            </DialogHeader>
            {/* Progress Bar */}
            <div className="flex gap-2 mt-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className={cn("h-1.5 flex-1 rounded-full", step >= i ? "bg-white" : "bg-white/30")} />
                ))}
            </div>
          </div>

          <Form {...form}>
            <form 
              onSubmit={handleSubmit(onSubmit)} 
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
                  e.preventDefault();
                  if (step < 3) handleNext();
                }
              }}
              className="p-6 bg-white space-y-6"
            >
              
              {/* --- STEP 1: Details --- */}
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Template Name <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Student ID Card 2026" className="rounded-xl bg-slate-50 border-slate-200" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="serviceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Type <span className="text-red-500">*</span></FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="rounded-xl bg-slate-50 border-slate-200">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="visiting_card">🪪 Visiting Card</SelectItem>
                              <SelectItem value="id_card">🆔 ID Card</SelectItem>
                              <SelectItem value="certificate">🏆 Certificate</SelectItem>
                              <SelectItem value="hall_ticket">📋 Hall Ticket</SelectItem>
                              <SelectItem value="marksheet">📊 Marksheet</SelectItem>
                              <SelectItem value="library_card">📚 Library Card</SelectItem>
                              <SelectItem value="transfer_certificate">📁 Transfer Certificate</SelectItem>
                              <SelectItem value="portfolio">🌐 Portfolio Page</SelectItem>
                              <SelectItem value="group_photo">📸 Group Photo Overlay</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="targetAudience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Audience <span className="text-red-500">*</span></FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="rounded-xl bg-slate-50 border-slate-200">
                                <SelectValue placeholder="Select audience" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ALL">👥 All (Students/Staff)</SelectItem>
                              <SelectItem value="STUDENT">🎓 Students Only</SelectItem>
                              <SelectItem value="TEACHER">👩‍🏫 Teachers & Staff Only</SelectItem>
                              <SelectItem value="ADMIN">🏛️ Admin Users Only</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Brief details about this template's usage..." className="rounded-xl bg-slate-50 border-slate-200 resize-none h-20" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* --- STEP 2: Dimensions --- */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div>
                    <FormLabel className="mb-2 block">Preset Sizes</FormLabel>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {Object.entries(DOCUMENT_PRESETS).filter(([key]) => key !== 'Custom').slice(0, 4).map(([key, p]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handlePresetSelect(key)}
                          className={cn(
                            "flex flex-col items-center justify-center p-2 rounded-xl border text-xs text-center transition-colors",
                            Math.abs(widthPx - toPx(p.widthMm, 'mm')) < 1 && Math.abs(heightPx - toPx(p.heightMm, 'mm')) < 1
                              ? "bg-[#ffdad8] border-[#b7102a] text-[#410007] font-bold"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                          )}
                        >
                          <span className="truncate w-full">{key.split(' ')[0]}</span>
                          <span className="text-[9px] opacity-70 mt-1">{p.widthMm}×{p.heightMm}mm</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 shadow-inner">
                    <FormField
                      control={form.control}
                      name="widthPx"
                      render={() => (
                        <FormItem>
                          <FormLabel className="text-slate-500">Width</FormLabel>
                          <FormControl>
                            <Input
                                type="number"
                                value={displayWidth}
                                onChange={(e) => handleWidthChange(e.target.value)}
                                className="font-mono font-bold"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="heightPx"
                      render={() => (
                        <FormItem>
                          <FormLabel className="text-slate-500">Height</FormLabel>
                          <FormControl>
                            <Input
                                type="number"
                                value={displayHeight}
                                onChange={(e) => handleHeightChange(e.target.value)}
                                className="font-mono font-bold"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-500">Unit</FormLabel>
                          <Select onValueChange={handleUnitChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="font-bold bg-white">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="px">px</SelectItem>
                              <SelectItem value="mm">mm</SelectItem>
                              <SelectItem value="cm">cm</SelectItem>
                              <SelectItem value="in">in</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex items-center justify-between px-2">
                    <FormLabel className="text-slate-600">Orientation</FormLabel>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                            type="button"
                            onClick={() => orientation !== 'portrait' && toggleOrientation()}
                            className={cn("px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors", orientation === 'portrait' ? "bg-white shadow text-slate-900" : "text-slate-500")}
                        >
                            Portrait
                        </button>
                        <button
                            type="button"
                            onClick={() => orientation !== 'landscape' && toggleOrientation()}
                            className={cn("px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors", orientation === 'landscape' ? "bg-white shadow text-slate-900" : "text-slate-500")}
                        >
                            Landscape
                        </button>
                    </div>
                  </div>
                  
                  {/* Live Mini Preview Box */}
                  <div className="flex flex-col items-center justify-center pt-2">
                      <div className="relative flex items-center justify-center w-full h-32 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden">
                          {/* Standard A4 reference background (210x297) -> aspect ratio 1:1.414 */}
                          <div className="absolute border border-slate-300 border-dashed" style={{ width: '60px', height: '85px' }} />
                          {/* The actual canvas preview (relative ratio) */}
                          <div 
                            className="bg-white border-2 border-[#b7102a] shadow-md z-10 transition-all duration-300 flex items-center justify-center" 
                            style={{ 
                                // Scale relative to a reference 100px. A max bounding box logic for the preview tile
                                width: Math.min((widthPx / Math.max(widthPx, heightPx)) * 100, 100),
                                height: Math.min((heightPx / Math.max(widthPx, heightPx)) * 100, 100)
                            }}
                          >
                            <span className="text-[10px] text-slate-300 font-mono rotate-45 pointer-events-none tracking-widest leading-none">CANVAS</span>
                          </div>
                          <span className="absolute bottom-2 right-3 text-[10px] text-slate-400 font-medium">Relative to A4 Size</span>
                      </div>
                  </div>
                </div>
              )}

              {/* --- STEP 3: Print Settings --- */}
              {step === 3 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="pageCount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number of Pages</FormLabel>
                            <FormControl>
                              <Input type="number" min={1} max={20} className="rounded-xl w-32 font-bold text-center" {...field} onChange={e => field.onChange(parseInt(e.target.value)||1)} />
                            </FormControl>
                            <p className="text-[11px] text-slate-500 mt-1">Cards usually 1 page, Portfolios 2+.</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {pages === 1 && (
                          <FormField
                            control={form.control}
                            name="hasBackSide"
                            render={({ field }) => (
                              <FormItem className="flex flex-col justify-start">
                                <FormLabel className="mb-3 block pt-1">Has Back Side?</FormLabel>
                                <div className="flex flex-wrap items-center gap-3">
                                    <Switch 
                                        checked={field.value} 
                                        onCheckedChange={(checked) => {
                                            field.onChange(checked);
                                            setValue('pageCount', checked ? 2 : 1, { shouldValidate: true });
                                        }} 
                                        className="data-[state=checked]:bg-[#b7102a]" 
                                    />
                                    <span className="text-sm font-semibold">{field.value ? 'Yes (Double-sided)' : 'No (Single-sided)'}</span>
                                </div>
                              </FormItem>
                            )}
                          />
                      )}
                  </div>

                  <hr className="border-slate-100" />

                  <FormField
                    control={form.control}
                    name="bleedMm"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between max-w-sm">
                            <FormLabel className="flex items-center gap-2">Bleed Margin ({unit}) <span title="Extra area around canvas for safe print trimming" className="text-slate-300 cursor-help">ⓘ</span></FormLabel>
                            <FormControl>
                                <Input 
                                    type="number" 
                                    min={0} 
                                    max={100} 
                                    step="any" 
                                    className="w-20 text-center font-bold" 
                                    {...field} 
                                    value={formatUnit(fromPx(field.value, 'mm'), unit) /* We just format the underlying mm value into the selected display unit temporarily for UI.*/} 
                                    onChange={e => {
                                        const parsed = parseFloat(e.target.value) || 0;
                                        // Store in DB consistently as mm, so we convert the user's unit input back to mm via PX
                                        const pxValue = toPx(parsed, unit);
                                        const mmValue = fromPx(pxValue, 'mm');
                                        field.onChange(mmValue);
                                    }} 
                                />
                            </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dpi"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Print Resolution <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(val: string) => field.onChange(Number(val))}
                            defaultValue={field.value.toString()}
                            className="space-y-1"
                          >
                            <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <RadioGroupItem value="72" id="r1" className="text-[#b7102a]" />
                                <FormLabel htmlFor="r1" className="font-medium cursor-pointer">Screen Quality (72 DPI) <span className="text-slate-400 font-normal">— digital only</span></FormLabel>
                            </div>
                            <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <RadioGroupItem value="300" id="r2" className="text-[#b7102a]" />
                                <FormLabel htmlFor="r2" className="font-medium cursor-pointer">Print Quality (300 DPI) <span className="text-slate-400 font-normal">— standard print</span></FormLabel>
                            </div>
                            <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <RadioGroupItem value="600" id="r3" className="text-[#b7102a]" />
                                <FormLabel htmlFor="r3" className="font-medium cursor-pointer">High Quality (600 DPI) <span className="text-slate-400 font-normal">— professional press</span></FormLabel>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="colorMode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color Mode <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-wrap gap-4"
                          >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="rgb" id="c1" className="text-[#b7102a]" />
                                <FormLabel htmlFor="c1" className="cursor-pointer font-medium">RGB <span className="text-slate-400 font-normal text-xs">(Digital)</span></FormLabel>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="cmyk" id="c2" className="text-[#b7102a]" />
                                <FormLabel htmlFor="c2" className="cursor-pointer font-medium">CMYK-ready <span className="text-slate-400 font-normal text-xs">(Print)</span></FormLabel>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mt-6">
                      <p className="text-[11px] font-bold text-blue-800 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 block"></span> Summary
                      </p>
                      <p className="text-xs text-blue-900 leading-relaxed font-medium">
                          You are creating a <span className="font-bold">{watch('serviceType')?.replace('_', ' ') || 'Template'}</span> 
                          {' '}({Math.round(fromPx(widthPx, 'mm'))}×{Math.round(fromPx(heightPx, 'mm'))}mm) 
                          for <span className="font-bold">{watch('targetAudience')}</span> audiences.
                          <br />
                          <span className="opacity-80 mt-1 block">Settings: {pages} page(s) · {watch('hasBackSide') ? 'Double' : 'Single'}-sided · {watch('dpi')} DPI · {watch('colorMode').toUpperCase()}</span>
                      </p>
                  </div>
                </div>
              )}

              {/* --- Footer Controls --- */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={handleBack} 
                    disabled={step === 1 || createTemplate.isPending}
                    className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>

                {step < 3 ? (
                  <Button 
                    type="button" 
                    onClick={handleNext} 
                    className="bg-[#191c1d] hover:bg-slate-800 text-white rounded-xl px-6"
                  >
                    Next Step <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button 
                      type="submit" 
                      className="bg-[#b7102a] text-white hover:bg-[#a60e26] w-full"
                      disabled={createTemplate.isPending}
                  >
                      {createTemplate.isPending ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating...
                        </>
                      ) : 'Create Template'}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

`

### frontend/src/pages/templates/TemplateEditorPage.tsx
`	ypescript
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Save, Eye, Undo2, Redo2,
    MousePointer2, Type, Square, Minus, Upload, QrCode,
    Grid3X3, ChevronDown, ZoomIn, ZoomOut, Maximize2,
    Bold, Italic, AlignLeft, AlignCenter, AlignRight,
    Trash2, ChevronUp, Copy, ArrowUpToLine, ArrowDownToLine, ChevronLeft, ChevronRight,
    Magnet, Layers
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { Z_INDEX } from '@/styles/zIndex';
import { useEditorStore } from './store/editor.store';
import ElementsLibrary from './components/ElementsLibrary';
import LayersPanel from './components/LayersPanel';
import CanvasEditor from './components/CanvasEditor';
import PropertiesInspector from './components/PropertiesInspector';
import { useTemplate, useUpdateTemplate } from '@/lib/queries';

type Tool = 'select' | 'text' | 'shape' | 'line' | 'upload' | 'qrcode' | 'table' | 'layers';

const TOOLS: { id: Tool; icon: React.ElementType; label: string }[] = [
    { id: 'select', icon: MousePointer2, label: 'Cursor' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'shape', icon: Square, label: 'Shape' },
    { id: 'line', icon: Minus, label: 'Line' },
    { id: 'upload', icon: Upload, label: 'Upload' },
    { id: 'qrcode', icon: QrCode, label: 'QR Code' },
    { id: 'table', icon: Grid3X3, label: 'Table' },
    { id: 'layers', icon: Layers, label: 'Layers' },
];

export default function TemplateEditorPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const { 
        undo, redo, historyIndex, history, 
        pages, currentPageId, setCurrentPageId, addPage, addPageBefore, duplicatePage, deletePage,
        canvasConfig, setPages, setCanvasConfig, removeElement, updateElement, selectedNodeIds,
        isDirty, markClean,
        showGrid, snapToGrid, toggleGrid, toggleSnap, gridSizeMm, setGridSize,
    } = useEditorStore();

    // Derived state for the active page
    const currentPageIndex = pages.findIndex(p => p.id === currentPageId);
    const currentPage = pages[currentPageIndex] || pages[0];
    const elements = currentPage?.elements || [];
    const selectedElements = elements.filter(el => selectedNodeIds.includes(el.id));
    const selectedElement = selectedElements.length === 1 ? selectedElements[0] : null;

    // Redirect /new/edit to /new dialog flow
    useEffect(() => {
        if (id === 'new') {
            navigate('/app/templates/new', { replace: true });
        }
    }, [id, navigate]);

    // Keyboard shortcuts (Ctrl+S, Ctrl+Z, Ctrl+Y)
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                undo();
            }
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                redo();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    });

    const [activeTool, setActiveTool] = useState<Tool>('select');
    const [leftPanelOpen, setLeftPanelOpen] = useState(true);
    const [canvasSettingsOpen, setCanvasSettingsOpen] = useState(true);
    const [zoom, setZoom] = useState(85);
    const [templateName, setTemplateName] = useState('Untitled Template');
    const [lastSaved, setLastSaved] = useState<string | null>(null);

    const templateQuery = useTemplate(id as string, { enabled: id !== 'new' && !!id });
    const updateMutation = useUpdateTemplate();

    useEffect(() => {
        if (templateQuery.data) {
            if (templateQuery.data.name) setTemplateName(templateQuery.data.name);
            
            let content = templateQuery.data.content as any;
            if (typeof content === 'string') {
                try {
                    content = JSON.parse(content);
                } catch (e) {
                    console.error('Failed to parse template content:', e);
                }
            }
            
            if (content?.pages && Array.isArray(content.pages)) {
                setPages(content.pages);
            } else if (content?.elements && Array.isArray(content.elements)) {
                setPages([{ id: 'page_1', name: 'Page 1', elements: content.elements }]);
            }
            if (content?.canvasConfig) setCanvasConfig(content.canvasConfig);
        }
    }, [templateQuery.data, setPages, setCanvasConfig]);

    const handleSave = async () => {
        if (!id || id === 'new') {
            toast({ title: 'Please create a template first via the templates list', variant: 'destructive' });
            return;
        }
        try {
            await updateMutation.mutateAsync({ id, data: { content: { pages, canvasConfig } } });
            const now = new Date();
            setLastSaved(`${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`);
            markClean();
            toast({ title: 'Template saved successfully' });
        } catch {
            toast({ title: 'Failed to save template', variant: 'destructive' });
        }
    };

    const canvasLabelW = Math.round(canvasConfig.widthMm * 10) / 10;
    const canvasLabelH = Math.round(canvasConfig.heightMm * 10) / 10;
    const canvasLabel = `${canvasLabelW} × ${canvasLabelH} mm`;

    return (
        <div className="bg-[#f8f9fa] text-[#191c1d] h-screen flex flex-col overflow-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>
            {/* ── TOP NAVBAR ─────────────────────────────────────────────────── */}
            <header className="fixed top-0 w-full z-50 flex flex-wrap justify-between items-center px-4 sm:px-6 bg-white/70 backdrop-blur-md min-h-16 py-2 sm:py-0 border-b border-white/50 gap-2"
                style={{ boxShadow: '0px 4px 20px rgba(25,28,29,0.04)' }}>
                {/* Left: Back + Title */}
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                    <button
                        onClick={() => navigate('/app/templates')}
                        className="p-2 hover:bg-slate-100/50 rounded-lg transition-colors active:scale-95 duration-150"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </button>
                    <div className="h-6 w-px bg-slate-200" />
                    <div className="flex flex-col">
                        <input
                            className="bg-transparent border-none p-0 font-bold text-[#b7102a] tracking-tighter text-lg focus:ring-0 w-48 focus:outline-none"
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                        />
                        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-medium flex items-center gap-1.5">
                            {isDirty && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
                            {lastSaved ? (isDirty ? 'Unsaved changes' : `Saved at ${lastSaved}`) : id === 'new' ? 'Unsaved draft' : 'Draft'}
                        </span>
                    </div>
                </div>

                {/* Center: Canvas size badge */}
                <div className="hidden sm:block absolute left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 bg-slate-50 border-b-2 border-[#b7102a] text-[#b7102a] font-bold text-sm tracking-tight">
                        {canvasLabel}
                    </span>
                </div>

                {/* Right: Controls */}
                <div className="flex items-center gap-2 flex-wrap justify-end">
                    {/* Undo / Redo / Zoom */}
                    <div className="flex items-center bg-slate-50/50 rounded-lg p-1 mr-2">
                        <button className="p-1.5 hover:bg-white rounded transition-colors disabled:opacity-30" onClick={undo} disabled={historyIndex === 0} title="Undo">
                            <Undo2 className="w-4 h-4 text-slate-500" />
                        </button>
                        <button className="p-1.5 hover:bg-white rounded transition-colors disabled:opacity-30" onClick={redo} disabled={historyIndex === history.length - 1} title="Redo">
                            <Redo2 className="w-4 h-4 text-slate-500" />
                        </button>
                        <div className="w-px h-4 bg-slate-200 mx-1" />
                        <button className="flex items-center gap-1 px-2 py-1.5 hover:bg-white rounded transition-colors text-slate-500 text-sm font-medium">
                            {zoom}%
                            <ChevronDown className="w-3 h-3" />
                        </button>
                        <div className="w-px h-4 bg-slate-200 mx-1" />
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={toggleGrid}
                                    className={cn('p-1.5 rounded transition-colors', showGrid ? 'bg-[#ffdad8] text-[#b7102a]' : 'hover:bg-white text-slate-400')}
                                    title="Toggle Grid"
                                >
                                    <Grid3X3 className="w-4 h-4" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>Toggle Grid</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={toggleSnap}
                                    className={cn('p-1.5 rounded transition-colors', snapToGrid ? 'bg-[#ffdad8] text-[#b7102a]' : 'hover:bg-white text-slate-400')}
                                    title="Snap to Grid"
                                >
                                    <Magnet className="w-4 h-4" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>Snap to Grid</TooltipContent>
                        </Tooltip>
                    </div>
                    <button className="px-4 py-2 text-[#b7102a] font-medium text-sm hover:bg-slate-100/50 rounded-lg transition-colors flex items-center gap-1.5">
                        <Eye className="w-4 h-4" />
                        Preview
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={updateMutation.isPending}
                        className="px-6 py-2 bg-gradient-to-br from-[#b7102a] to-[#db313f] text-white font-bold text-sm rounded-xl shadow-lg active:scale-95 transition-all disabled:opacity-60 flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        {updateMutation.isPending ? 'Saving…' : 'Save'}
                    </button>
                </div>
            </header>

            {/* ── MAIN 3-PANEL LAYOUT ────────────────────────────────────────── */}
            <main className="flex flex-1 mt-16 overflow-hidden">

                {/* LEFT ICON RAIL */}
                <nav className="fixed left-0 top-16 h-[calc(100vh-64px)] w-16 flex flex-col items-center py-4 bg-[#f3f4f5] border-r border-slate-200/60"
                    style={{ zIndex: Z_INDEX.STUDIO_LEFT_PANEL, boxShadow: '2px 0 8px rgba(25,28,29,0.04)' }}>
                    <div className="flex flex-col gap-1 w-full px-2">
                        {TOOLS.map(({ id: toolId, icon: Icon, label }) => (
                            <button
                                key={toolId}
                                onClick={() => {
                                    setActiveTool(toolId);
                                    if (toolId !== 'select') setLeftPanelOpen(true);
                                }}
                                className={cn(
                                    'rounded-xl p-2 flex flex-col items-center justify-center transition-all duration-200',
                                    activeTool === toolId
                                        ? 'bg-[#ffdad8] text-[#410007]'
                                        : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                                )}
                                title={label}
                            >
                                <Icon className="w-5 h-5" strokeWidth={activeTool === toolId ? 2.5 : 1.8} />
                                <span className="font-medium uppercase tracking-tighter mt-1" style={{ fontSize: '9px' }}>{label}</span>
                            </button>
                        ))}
                    </div>
                </nav>

                {/* LEFT SLIDING ELEMENTS PANEL */}
                <AnimatePresence>
                    {leftPanelOpen && (
                        <motion.aside
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 280, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            className="ml-16 bg-white border-r border-slate-100 overflow-y-auto shrink-0 overflow-hidden"
                            style={{ zIndex: Z_INDEX.STUDIO_LEFT_PANEL, boxShadow: '2px 0 8px rgba(25,28,29,0.04)' }}
                        >
                            <div style={{ width: 280 }}>
                                {activeTool === 'layers' ? <LayersPanel /> : <ElementsLibrary />}
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* Without AnimatePresence, reserve rail space */}
                {!leftPanelOpen && <div className="ml-16" />}

                {/* CENTER CANVAS WORKSPACE */}
                <section className="flex-1 relative overflow-auto flex items-center justify-center"
                    style={{
                        backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
                        backgroundSize: '24px 24px',
                        backgroundColor: '#f0f1f2',
                    }}>

                    {/* The Konva canvas */}
                    <CanvasEditor zoom={zoom} />
                    
                    {/* Floating Page Manager Panel */}
                    <TooltipProvider delayDuration={300}>
                        <div 
                            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 flex-wrap justify-center p-2 rounded-2xl shadow-2xl border border-white/50"
                            style={{ zIndex: Z_INDEX.STUDIO_FLOATING_TOOLS, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)' }}
                        >
                            <div className="flex items-center justify-between min-w-[100px] gap-2 px-2 border-r border-slate-200">
                                <button 
                                    onClick={() => setCurrentPageId(pages[currentPageIndex - 1]?.id)} 
                                    disabled={currentPageIndex === 0}
                                    className="p-1.5 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-30 text-slate-600"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="text-xs font-semibold tracking-wide text-slate-700 select-none">
                                    {currentPageIndex + 1} / {pages.length}
                                </span>
                                <button 
                                    onClick={() => setCurrentPageId(pages[currentPageIndex + 1]?.id)} 
                                    disabled={currentPageIndex === pages.length - 1}
                                    className="p-1.5 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-30 text-slate-600"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex items-center gap-1 px-1 border-r border-slate-200">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button onClick={() => addPageBefore(currentPageId)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600">
                                            <ArrowUpToLine className="w-4 h-4" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>Add blank page before</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button onClick={() => addPage(currentPageId)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600">
                                            <ArrowDownToLine className="w-4 h-4" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>Add blank page after</TooltipContent>
                                </Tooltip>
                            </div>

                            <div className="flex items-center gap-1 px-1 border-r border-slate-200">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button onClick={() => duplicatePage(currentPageId)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600">
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>Duplicate this page</TooltipContent>
                                </Tooltip>
                            </div>

                            <div className="flex items-center px-1">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button 
                                            onClick={() => deletePage(currentPageId)} 
                                            disabled={pages.length <= 1}
                                            className="p-2 hover:bg-[#ffdad8] hover:text-[#ba1a1a] rounded-xl transition-colors text-slate-500 disabled:opacity-30"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>Delete this page</TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                    </TooltipProvider>

                    {/* Floating context toolbar (shown when element is selected) */}
                    <AnimatePresence>
                        {selectedElement && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 8 }}
                                className="fixed top-[72px] left-1/2 -translate-x-1/2 flex items-center gap-1 flex-wrap justify-center p-1.5 rounded-xl shadow-xl border border-white/50"
                                style={{ zIndex: Z_INDEX.STUDIO_FLOATING_TOOLS, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)' }}
                            >
                                {selectedElement.type === 'text' && (
                                    <>
                                        <button
                                            onClick={() => updateElement(selectedElement.id, { fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold' })}
                                            className={cn('p-1.5 hover:bg-white rounded transition-colors', selectedElement.fontWeight === 'bold' ? 'bg-[#ffdad8] text-[#410007]' : '')}
                                        ><Bold className="w-4 h-4" /></button>
                                        <button className="p-1.5 hover:bg-white rounded transition-colors">
                                            <Italic className="w-4 h-4" />
                                        </button>
                                        <div className="w-px h-4 bg-slate-200/80 mx-1" />
                                        {(['left', 'center', 'right'] as const).map((a) => (
                                            <button
                                                key={a}
                                                onClick={() => updateElement(selectedElement.id, { align: a })}
                                                className={cn('p-1.5 hover:bg-white rounded transition-colors', selectedElement.align === a ? 'bg-slate-100' : '')}
                                            >
                                                {a === 'left' && <AlignLeft className="w-4 h-4" />}
                                                {a === 'center' && <AlignCenter className="w-4 h-4" />}
                                                {a === 'right' && <AlignRight className="w-4 h-4" />}
                                            </button>
                                        ))}
                                        <div className="w-px h-4 bg-slate-200/80 mx-1" />
                                        <button className="px-2 py-1 text-xs font-bold hover:bg-white rounded">
                                            {selectedElement.fontSize || 16}px
                                        </button>
                                        <div
                                            className="w-5 h-5 rounded-full border-2 border-white shadow-sm cursor-pointer mx-1"
                                            style={{ backgroundColor: selectedElement.fill || '#191c1d' }}
                                        />
                                    </>
                                )}
                                <div className="w-px h-4 bg-slate-200/80 mx-1" />
                                <button
                                    onClick={() => removeElement(selectedElement.id)}
                                    className="p-1.5 hover:bg-red-50 text-red-500 rounded transition-colors"
                                ><Trash2 className="w-4 h-4" /></button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Floating zoom control */}
                    <div className="fixed bottom-6 right-4 sm:right-[304px] flex items-center gap-3 px-4 py-2 rounded-full border border-white z-30"
                        style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        <button onClick={() => setZoom(z => Math.max(25, z - 10))} className="text-slate-500 hover:text-[#b7102a] transition-colors">
                            <ZoomOut className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-bold text-slate-700 w-9 text-center">{zoom}%</span>
                        <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="text-slate-500 hover:text-[#b7102a] transition-colors">
                            <ZoomIn className="w-4 h-4" />
                        </button>
                        <div className="w-px h-4 bg-slate-200" />
                        <button onClick={() => setZoom(100)} className="text-slate-500 hover:text-[#b7102a] transition-colors" title="Fit to screen">
                            <Maximize2 className="w-4 h-4" />
                        </button>
                    </div>
                </section>

                {/* RIGHT PROPERTIES PANEL */}
                <aside className="w-72 bg-white border-l border-slate-100 flex flex-col z-30 shrink-0"
                    style={{ boxShadow: '-2px 0 8px rgba(25,28,29,0.04)', zIndex: Z_INDEX.STUDIO_RIGHT_PANEL }}>

                    {/* Main properties */}
                    <div className="flex-1 overflow-y-auto">
                        <PropertiesInspector />
                    </div>

                    {/* Canvas Settings collapsible footer */}
                    <div className="border-t border-slate-100 bg-slate-50/50">
                        <button
                            onClick={() => setCanvasSettingsOpen(!canvasSettingsOpen)}
                            className="flex items-center justify-between w-full px-6 py-4"
                        >
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Canvas Settings</span>
                            {canvasSettingsOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </button>
                        <AnimatePresence>
                            {canvasSettingsOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-6 pb-6 space-y-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[10px] text-slate-400 font-medium block mb-1">Width (mm)</label>
                                                <input
                                                    type="number"
                                                    value={canvasConfig.widthMm}
                                                    onChange={(e) => setCanvasConfig({ widthMm: Number(e.target.value) })}
                                                    className="w-full text-xs font-bold bg-white border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-[#b7102a]"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-slate-400 font-medium block mb-1">Height (mm)</label>
                                                <input
                                                    type="number"
                                                    value={canvasConfig.heightMm}
                                                    onChange={(e) => setCanvasConfig({ heightMm: Number(e.target.value) })}
                                                    className="w-full text-xs font-bold bg-white border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-[#b7102a]"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-slate-600">Grid Size (mm)</span>
                                            <input
                                                type="number"
                                                value={gridSizeMm}
                                                onChange={(e) => setGridSize(Number(e.target.value))}
                                                min={1}
                                                max={50}
                                                className="w-16 text-xs font-bold bg-white border border-slate-200 rounded-lg p-2 text-center focus:outline-none focus:ring-1 focus:ring-[#b7102a]"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-slate-600">Background Color</span>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={canvasConfig.bgColor || '#ffffff'}
                                                    onChange={(e) => setCanvasConfig({ bgColor: e.target.value })}
                                                    className="w-7 h-7 rounded border border-slate-200 cursor-pointer p-0.5"
                                                />
                                                <span className="text-xs font-mono text-slate-500">{canvasConfig.bgColor || '#ffffff'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </aside>
            </main>
        </div>
    );
}

`

### frontend/src/lib/queries/templates/template-queries.ts
`	ypescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';
import { authClient } from '../../auth.client';
import { PaginatedResponse } from '../shared/types';

export interface Template {
    id: string;
    name: string;
    serviceType: string;
    templateType: string;
    widthMm: number;
    heightMm: number;
    orientation: string;
    description?: string;
    targetAudience?: string;
    content?: any;
    isDefault: boolean;
    isActive: boolean;
    version: number;
    createdAt: string;
}

export const useTemplates = (params?: Record<string, string | undefined>) => {
    return useQuery({
        queryKey: ['templates', params],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Template>>('/templates', { params });
            return response.data;
        },
    });
};

export const useSetDefaultTemplate = () => {
    return useMutation({
        mutationFn: async (id: string) => {
            const response = await api.patch<{ success: boolean; data: Template }>(`/templates/${id}/default`);
            return response.data;
        },
    });
};

export const useTemplate = (id: string, options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: ['template', id],
        queryFn: async () => {
            const response = await api.get<{ success: boolean; data: Template }>(`/templates/${id}`);
            return response.data.data;
        },
        enabled: options?.enabled !== false && !!id,
    });
};

export const useUpdateTemplate = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Template> & { content?: any } }) => {
            const response = await api.patch<{ success: boolean; data: Template }>(`/templates/${id}`, data);
            return response.data.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['templates'] });
            if (data?.id) {
                queryClient.invalidateQueries({ queryKey: ['template', data.id] });
            }
        },
    });
};

export const useCreateTemplate = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: Partial<Template> & { institutionId?: string }) => {
            const sessionResult = await authClient.getSession();
            const sessionData = sessionResult?.data;
            const fallbackInstitutionId = (sessionData?.session as any)?.activeInstitutionId 
                ?? (sessionData?.session as any)?.institutionId 
                ?? (sessionData?.user as any)?.institutionId;
                
            const payload = {
                ...data,
                institutionId: data.institutionId ?? fallbackInstitutionId
            };
            
            const response = await api.post<{ success: boolean; data: Template }>('/templates', payload);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['templates'] }); // Assuming templateKeys.lists() is not defined, keeping original for now.
        },
        onError: (error: unknown) => {
            throw error; // Re-throw so component can show a toast
        }
    });
};

export const useUploadTemplateAsset = () => {
    return useMutation({
        mutationFn: async ({ id, file }: { id: string; file: File }) => {
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await api.post<{ success: boolean; data: { url: string } }>(
                `/templates/${id}/assets`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            return response.data.data.url;
        },
    });
};

export const useDeleteTemplate = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const response = await api.delete<{ success: boolean; message: string }>(`/templates/${id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['templates'] });
        },
    });
};

export const useDuplicateTemplate = () => {
    const queryClient = useQueryClient();
    const createTemplate = useCreateTemplate();
    const { mutateAsync } = createTemplate;
    
    return useMutation({
        mutationFn: async (id: string) => {
            const response = await api.get<{ success: boolean; data: Template }>(`/templates/${id}`);
            const originalTemplate = response.data.data;
            
            const newTemplateData = {
                name: `${originalTemplate.name} (Copy)`,
                serviceType: originalTemplate.serviceType,
                templateType: originalTemplate.templateType,
                widthMm: originalTemplate.widthMm,
                heightMm: originalTemplate.heightMm,
                orientation: originalTemplate.orientation,
                description: originalTemplate.description,
                targetAudience: originalTemplate.targetAudience,
                content: originalTemplate.content,
                institutionId: (originalTemplate as any).institutionId
            };
            
            return await mutateAsync(newTemplateData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['templates'] });
        },
    });
};

`



### backend/src/utils/pii-masking.ts
`	ypescript
export interface TemplateVariable {
    key: string;
    label: string;
    category: string;
    handlebarsExpression: string;
    isMasked: boolean;
    maskFn?: (value: any) => any;
    sampleValue: any;
}

export function maskAadhaar(aadhar: string | null | undefined): string {
    if (!aadhar) return '';
    const clean = aadhar.replace(/\s+/g, '');
    if (clean.length < 4) return clean;
    return 'XXXX XXXX ' + clean.slice(-4);
}

export function defaultPhotoUrl(photoUrl: string | null | undefined): string {
    return photoUrl || '/placeholder-photo.png';
}

export function maskPhone(phone: string | null | undefined): string {
    if (!phone) return '';
    const clean = phone.replace(/\s+/g, '');
    if (clean.length <= 4) return clean;
    return '*'.repeat(clean.length - 4) + clean.slice(-4);
}

export function maskEmail(email: string | null | undefined): string {
    if (!email || !email.includes('@')) return email || '';
    const [local, domain] = email.split('@');
    const domainParts = domain.split('.');
    const tld = domainParts.length > 1 ? domainParts.pop() : '';
    return `${local}@***${tld ? '.' + tld : ''}`;
}

export const TEMPLATE_VARIABLE_REGISTRY: Record<string, TemplateVariable[]> = {
    'id_card': [
        {
            key: 'student.name',
            label: 'Student Name',
            category: 'Student Details',
            handlebarsExpression: '{{student.name}}',
            isMasked: false,
            sampleValue: 'John Doe',
        },
        {
            key: 'student.fullName',
            label: 'Student Full Name',
            category: 'Student Details',
            handlebarsExpression: '{{student.fullName}}',
            isMasked: false,
            sampleValue: 'John Doe',
        },
        {
            key: 'student.admissionNo',
            label: 'Admission Number',
            category: 'Student Details',
            handlebarsExpression: '{{student.admissionNo}}',
            isMasked: false,
            sampleValue: 'ADM2025001',
        },
        {
            key: 'student.fatherName',
            label: "Father's Name",
            category: 'Student Details',
            handlebarsExpression: '{{student.fatherName}}',
            isMasked: false,
            sampleValue: 'Richard Doe',
        },
        {
            key: 'student.motherName',
            label: "Mother's Name",
            category: 'Student Details',
            handlebarsExpression: '{{student.motherName}}',
            isMasked: false,
            sampleValue: 'Jane Doe',
        },
        {
            key: 'student.dateOfBirth',
            label: 'Date of Birth',
            category: 'Student Details',
            handlebarsExpression: '{{student.dateOfBirth}}',
            isMasked: false,
            sampleValue: '2010-05-15',
        },
        {
            key: 'student.gender',
            label: 'Gender',
            category: 'Student Details',
            handlebarsExpression: '{{student.gender}}',
            isMasked: false,
            sampleValue: 'Male',
        },
        {
            key: 'student.bloodGroup',
            label: 'Blood Group',
            category: 'Student Details',
            handlebarsExpression: '{{student.bloodGroup}}',
            isMasked: false,
            sampleValue: 'O+',
        },
        {
            key: 'student.phone',
            label: 'Phone Number',
            category: 'Contact Details',
            handlebarsExpression: '{{student.phone}}',
            isMasked: true,
            maskFn: maskPhone,
            sampleValue: '******3210',
        },
        {
            key: 'student.email',
            label: 'Email',
            category: 'Contact Details',
            handlebarsExpression: '{{student.email}}',
            isMasked: true,
            maskFn: maskEmail,
            sampleValue: 'parent@***.com',
        },
        {
            key: 'student.address',
            label: 'Address',
            category: 'Contact Details',
            handlebarsExpression: '{{student.address}}',
            isMasked: false,
            sampleValue: '123 School Lane, City',
        },
        {
            key: 'student.aadharNumber',
            label: 'Aadhaar Number',
            category: 'Student Details',
            handlebarsExpression: '{{student.aadharNumber}}',
            isMasked: true,
            maskFn: maskAadhaar,
            sampleValue: 'XXXX XXXX 1234',
        },
        {
            key: 'student.photoUrl',
            label: 'Photo URL',
            category: 'Media',
            handlebarsExpression: '{{student.photoUrl}}',
            isMasked: true,
            maskFn: defaultPhotoUrl,
            sampleValue: '/placeholder-photo.png',
        },
        {
            key: 'class.name',
            label: 'Class Name',
            category: 'Academic Details',
            handlebarsExpression: '{{class.name}}',
            isMasked: false,
            sampleValue: 'Class X',
        },
        {
            key: 'class.section',
            label: 'Section',
            category: 'Academic Details',
            handlebarsExpression: '{{class.section}}',
            isMasked: false,
            sampleValue: 'A',
        },
        {
            key: 'stream.name',
            label: 'Stream Name',
            category: 'Academic Details',
            handlebarsExpression: '{{stream.name}}',
            isMasked: false,
            sampleValue: 'Science',
        },
        {
            key: 'institution.name',
            label: 'Institution Name',
            category: 'Institution Details',
            handlebarsExpression: '{{institution.name}}',
            isMasked: false,
            sampleValue: 'Vidyaverse Public School',
        },
        {
            key: 'institution.code',
            label: 'Institution Code',
            category: 'Institution Details',
            handlebarsExpression: '{{institution.code}}',
            isMasked: false,
            sampleValue: 'VVPS',
        },
        {
            key: 'institution.logo',
            label: 'Institution Logo',
            category: 'Institution Details',
            handlebarsExpression: '{{institution.logo}}',
            isMasked: false,
            sampleValue: '/logo.png',
        },
        {
            key: 'institution.address',
            label: 'Institution Address',
            category: 'Institution Details',
            handlebarsExpression: '{{institution.address}}',
            isMasked: false,
            sampleValue: 'Main Campus, Tech City',
        },
        {
            key: 'institution.phone',
            label: 'Institution Phone',
            category: 'Institution Details',
            handlebarsExpression: '{{institution.phone}}',
            isMasked: false,
            sampleValue: '011-2345678',
        },
        {
            key: 'institution.email',
            label: 'Institution Email',
            category: 'Institution Details',
            handlebarsExpression: '{{institution.email}}',
            isMasked: false,
            sampleValue: 'info@vvps.edu',
        },
        {
            key: 'academicYear',
            label: 'Academic Year',
            category: 'Academic Details',
            handlebarsExpression: '{{academicYear}}',
            isMasked: false,
            sampleValue: '2025-2026',
        },
        {
            key: 'issueDate',
            label: 'Issue Date',
            category: 'Card Details',
            handlebarsExpression: '{{issueDate}}',
            isMasked: false,
            sampleValue: '2025-04-01',
        },
        {
            key: 'validUntil',
            label: 'Valid Until',
            category: 'Card Details',
            handlebarsExpression: '{{validUntil}}',
            isMasked: false,
            sampleValue: '2026-03-31',
        },
        {
            key: 'qrCode',
            label: 'QR Code Data',
            category: 'Media',
            handlebarsExpression: '{{qrCode}}',
            isMasked: false,
            sampleValue: 'data:image/png;base64,...',
        }
    ]
};

export function applyMasking(data: Record<string, any>): Record<string, any> {
    const masked = JSON.parse(JSON.stringify(data)); // Deep copy to avoid mutating original

    if (masked.student) {
        if ('aadharNumber' in masked.student) {
            masked.student.aadharNumber = maskAadhaar(masked.student.aadharNumber);
        }
        if ('phone' in masked.student) {
            masked.student.phone = maskPhone(masked.student.phone);
        }
        if ('email' in masked.student) {
            masked.student.email = maskEmail(masked.student.email);
        }
        if ('photoUrl' in masked.student) {
            masked.student.photoUrl = defaultPhotoUrl(masked.student.photoUrl);
        }
    }

    return masked;
}

`

### backend/src/lib/default-templates/index.ts
`	ypescript
/**
 * Registry of curated default templates (HTML/Handlebars) per ServiceType.
 * Single source for: lazy-seeding defaults, the in-app preview, and lint.
 * Branding keys are supplied separately by buildBrandingContext().
 */
import { ID_CARD_HTML } from './id-card.js';
import { MARKSHEET_HTML } from './marksheet.js';
import { CERTIFICATE_HTML } from './certificate.js';
import { HALL_TICKET_HTML } from './hall-ticket.js';
import { TRANSFER_CERTIFICATE_HTML } from './transfer-certificate.js';
import { LIBRARY_CARD_HTML } from './library-card.js';
import { VISITING_CARD_HTML } from './visiting-card.js';

export interface DefaultTemplate {
    name: string;
    html: string;
    widthMm: number;
    heightMm: number;
    orientation: 'portrait' | 'landscape';
    /** Type-specific sample data for preview/lint (branding merged in by caller). */
    sample: Record<string, any>;
}

export const DEFAULT_TEMPLATES: Record<string, DefaultTemplate> = {
    id_card: {
        name: 'Student ID Card — Standard', html: ID_CARD_HTML, widthMm: 85.6, heightMm: 53.98, orientation: 'landscape',
        sample: {
            studentName: 'आरव शर्मा · Aarav Sharma', admissionNo: 'VG0-2620-0001', className: 'XI - A',
            dob: '14/03/2012', bloodGroup: 'B+', fatherName: 'राजेश शर्मा / Rajesh Sharma', phone: '+91 98765 43210',
            academicYear: '2026-2027', validUntil: '31/03/2027', photoUrl: '', qrCode: '',
        },
    },
    marksheet: {
        name: 'Marksheet — Standard', html: MARKSHEET_HTML, widthMm: 210, heightMm: 297, orientation: 'portrait',
        sample: {
            examName: 'वार्षिक परीक्षा · Annual Examination', academicYear: '2026-2027',
            student: { name: 'आरव शर्मा · Aarav Sharma', admissionNumber: 'VG0-2620-0001', fatherName: 'राजेश शर्मा', motherName: 'सुनीता शर्मा', dob: '2012-03-14' },
            class: { name: 'XI' }, section: { name: 'A' }, stream: { name: 'Science' },
            subjects: ['हिंदी / Hindi', 'English', 'गणित / Mathematics', 'विज्ञान / Science', 'सामाजिक विज्ञान / Social Science', 'संस्कृत / Sanskrit', 'कंप्यूटर / Computer'].map((subjectName, i) => {
                const marksObtained = 62 + ((i * 8) % 36);
                return { subjectName, maxMarks: 100, marksObtained, percentage: marksObtained, grade: marksObtained >= 81 ? 'A' : marksObtained >= 71 ? 'B+' : 'B' };
            }),
            results: { totalMarks: 0, maxMarks: 700, percentage: 0, grade: 'A', result: 'उत्तीर्ण · PASS', marksheetNumber: 'MS-2026-VG-0001' },
        },
    },
    certificate: {
        name: 'Certificate — Standard', html: CERTIFICATE_HTML, widthMm: 297, heightMm: 210, orientation: 'landscape',
        sample: {
            certificateTitle: 'MERIT', studentName: 'आरव शर्मा · Aarav Sharma', className: 'XI-A', academicYear: '2026-2027',
            place: 'Surat', issueDate: '14/06/2026', certificateNumber: 'CRT-2026-VG-0001',
            bodyHtml: 'of Class <b>XI-A</b> has secured <b>First Position</b> in the Annual Examination 2026-27 with distinction, and is hereby awarded this Certificate of Merit in recognition of outstanding academic excellence.',
        },
    },
    hall_ticket: {
        name: 'Hall Ticket — Standard', html: HALL_TICKET_HTML, widthMm: 210, heightMm: 297, orientation: 'portrait',
        sample: {
            studentName: 'आरव शर्मा · Aarav Sharma', rollNo: '11A-07', admissionNumber: 'VG0-2620-0001', className: 'XI - A',
            examName: 'वार्षिक परीक्षा · Annual Examination', academicYear: '2026-2027', examCenter: 'Main Campus, Rander',
            schedule: [
                { date: '03/03/2027', day: 'सोम / Mon', subject: 'हिंदी / Hindi', time: '10:00 – 13:00' },
                { date: '05/03/2027', day: 'बुध / Wed', subject: 'English', time: '10:00 – 13:00' },
                { date: '07/03/2027', day: 'शुक्र / Fri', subject: 'गणित / Mathematics', time: '10:00 – 13:00' },
                { date: '10/03/2027', day: 'सोम / Mon', subject: 'विज्ञान / Science', time: '10:00 – 13:00' },
            ],
        },
    },
    transfer_certificate: {
        name: 'Transfer Certificate — Standard', html: TRANSFER_CERTIFICATE_HTML, widthMm: 210, heightMm: 297, orientation: 'portrait',
        sample: {
            studentName: 'आरव शर्मा · Aarav Sharma', fatherName: 'राजेश शर्मा / Rajesh Sharma', motherName: 'सुनीता शर्मा / Sunita Sharma',
            dob: '14/03/2012', dobWords: 'Fourteenth March Two Thousand Twelve', admissionNumber: 'VG0-2620-0001', admissionDate: '01/04/2020',
            leavingDate: '31/03/2026', className: 'XI', lastClassStudied: 'XI - A (Science)', conduct: 'Excellent / उत्तम',
            reason: 'अभिभावक का स्थानांतरण / Parent relocation', remarks: 'All dues cleared. No disciplinary record.',
            tcNumber: 'TC-2026-VG-0001', place: 'Surat', issueDate: '14/06/2026', academicYear: '2025-2026',
        },
    },
    library_card: {
        name: 'Library Card — Standard', html: LIBRARY_CARD_HTML, widthMm: 85.6, heightMm: 53.98, orientation: 'landscape',
        sample: { studentName: 'AARAV SHARMA', libraryId: 'LIB-2026-0042', admissionNumber: 'VG0-2620-0001', className: 'XI - A', validUntil: '31/03/2027' },
    },
    visiting_card: {
        name: 'Visiting Card — Standard', html: VISITING_CARD_HTML, widthMm: 85.6, heightMm: 53.98, orientation: 'landscape',
        sample: { name: 'Virat Sharma', designation: 'Principal · प्रधानाचार्य', phone: '+91 98765 43210', email: 'principal@viratgurukul.in', website: 'www.viratgurukul.in' },
    },
};

export function getDefaultTemplate(serviceType: string): DefaultTemplate | null {
    return DEFAULT_TEMPLATES[serviceType] || null;
}

/** Type-specific sample data (compute derived totals for marksheet). */
export function getSampleData(serviceType: string): Record<string, any> {
    const def = DEFAULT_TEMPLATES[serviceType];
    if (!def) return {};
    const sample = JSON.parse(JSON.stringify(def.sample));
    if (serviceType === 'marksheet' && Array.isArray(sample.subjects)) {
        const total = sample.subjects.reduce((s: number, x: any) => s + (x.marksObtained || 0), 0);
        sample.results.totalMarks = total;
        sample.results.percentage = Math.round((total / sample.results.maxMarks) * 10000) / 100;
    }
    return sample;
}

`

### backend/src/lib/branding-context.ts
`	ypescript
/**
 * Shared branding context for ALL printable documents.
 * Returns the flat, unified branding vocabulary every default template expects,
 * with logo/signature/seal inlined as data URIs and the principal resolved from
 * institution_authorities (preferring PRINCIPAL, else lowest displayOrder).
 *
 * Reuse this in every document service's templateData so branding is identical
 * across ID cards, marksheets, certificates, etc.
 */
import { prisma } from '../config/database.js';
import { toDataUri } from './asset-inline.js';

const ROLE_LABELS: Record<string, string> = {
    PRINCIPAL: 'Principal', VICE_CHANCELLOR: 'Vice Chancellor', HOD: 'Head of Department',
    REGISTRAR: 'Registrar', DEAN: 'Dean', DIRECTOR: 'Director', COORDINATOR: 'Coordinator', TEACHER: 'Teacher',
};

export interface BrandingContext {
    institutionName: string;
    institutionAddress: string;
    institutionLogo: string;
    principalSignature: string;
    principalName: string;
    principalTitle: string;
    schoolSeal: string;
}

export async function buildBrandingContext(institutionId: string, tx: any = prisma): Promise<BrandingContext> {
    const inst = await tx.institution.findUnique({
        where: { id: institutionId },
        select: { name: true, address: true, logoUrl: true, signatureUrl: true, sealUrl: true, signatureTitle: true },
    });
    const authorities = await tx.institutionAuthority.findMany({
        where: { institutionId },
        orderBy: { displayOrder: 'asc' },
        select: { name: true, designation: true, roleType: true, signatureUrl: true },
    });
    const principal =
        authorities.find((a: { roleType: string }) => a.roleType === 'PRINCIPAL') || authorities[0] || null;

    const [institutionLogo, principalSignature, schoolSeal] = await Promise.all([
        toDataUri(inst?.logoUrl),
        toDataUri(principal?.signatureUrl || inst?.signatureUrl),
        toDataUri(inst?.sealUrl),
    ]);

    return {
        institutionName: inst?.name || '',
        institutionAddress: inst?.address || '',
        institutionLogo,
        principalSignature,
        principalName: principal?.name || '',
        principalTitle:
            principal?.designation || (principal ? ROLE_LABELS[principal.roleType] : '') ||
            inst?.signatureTitle || 'Principal',
        schoolSeal,
    };
}

`

### backend/src/lib/document-base.ts
`	ypescript
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

`

### frontend/src/pages/templates/components/ElementsLibrary.tsx
`	ypescript
import { useEditorStore } from '../store/editor.store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// Dynamic fields available for templates
const DYNAMIC_FIELDS = [
    { key: '{{studentName}}', icon: '👤', label: 'Student Name' },
    { key: '{{admissionNo}}', icon: '🔖', label: 'Admission No' },
    { key: '{{rollNo}}', icon: '#', label: 'Roll No' },
    { key: '{{className}}', icon: '📚', label: 'Class / Grade' },
    { key: '{{dob}}', icon: '🎂', label: 'Date of Birth' },
    { key: '{{photo}}', icon: '📷', label: 'Photo' },
    { key: '{{bloodGroup}}', icon: '🩸', label: 'Blood Group' },
    { key: '{{institutionName}}', icon: '🏛', label: 'Institution Name' },
    { key: '{{institutionLogo}}', icon: '🖼', label: 'Institution Logo' },
    { key: '{{issueDate}}', icon: '📅', label: 'Issue Date' },
    { key: '{{qrCode}}', icon: '⬛', label: 'QR Code' },
];

export default function ElementsLibrary() {
    const { addElement } = useEditorStore();

    return (
        <div className="flex flex-col h-full bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>
            <div className="px-6 pt-6 pb-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Design Assets</p>
            </div>

            <ScrollArea className="flex-1">
                <div className="px-6 pb-8 space-y-8">

                    {/* ── TEXT STYLES ─────────────────────────── */}
                    <section>
                        <h3 className="text-sm font-semibold text-slate-700 mb-3">Text Styles</h3>
                        <div className="space-y-2.5">
                            <button
                                onClick={() => addElement({ type: 'text', text: 'Add Heading', fontSize: 32, fontWeight: 'bold', fill: '#191c1d', width: 300, height: 50 })}
                                className="w-full p-3 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors text-left border-l-4 border-[#b7102a]"
                            >
                                <span className="text-xl font-extrabold block text-slate-800">Add Heading</span>
                            </button>
                            <button
                                onClick={() => addElement({ type: 'text', text: 'Add Subheading', fontSize: 20, fontWeight: 'bold', fill: '#191c1d', width: 250, height: 40 })}
                                className="w-full p-3 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors text-left"
                            >
                                <span className="text-base font-semibold block text-slate-700">Add Subheading</span>
                            </button>
                            <button
                                onClick={() => addElement({ type: 'text', text: 'Add body text here', fontSize: 14, fill: '#5b403f', width: 220, height: 30 })}
                                className="w-full p-3 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors text-left"
                            >
                                <span className="text-sm block text-slate-500">Add body text</span>
                            </button>
                        </div>
                    </section>

                    {/* ── SHAPES ──────────────────────────────── */}
                    <section>
                        <h3 className="text-sm font-semibold text-slate-700 mb-3">Shapes</h3>
                        <div className="grid grid-cols-3 gap-2.5">
                            <button
                                onClick={() => addElement({ type: 'shape', shapeType: 'rect', fill: '#e1e3e4', width: 120, height: 80, stroke: '#8f6f6e', strokeWidth: 0 })}
                                className="aspect-square bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-center transition-colors"
                            >
                                <div className="w-9 h-9 bg-slate-300 rounded" />
                            </button>
                            <button
                                onClick={() => addElement({ type: 'shape', shapeType: 'circle', fill: '#e1e3e4', width: 100, height: 100, stroke: '#8f6f6e', strokeWidth: 0 })}
                                className="aspect-square bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-center transition-colors"
                            >
                                <div className="w-9 h-9 bg-slate-300 rounded-full" />
                            </button>
                            <button
                                onClick={() => addElement({ type: 'line', direction: 'horizontal', stroke: '#191c1d', strokeWidth: 2, width: 200, height: 2 })}
                                className="aspect-square bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-center transition-colors"
                            >
                                <div className="w-8 h-0.5 bg-slate-400 rounded" />
                            </button>
                        </div>
                    </section>

                    {/* ── QR & BARCODE ──────────────────────────── */}
                    <section>
                        <h3 className="text-sm font-semibold text-slate-700 mb-3">Codes</h3>
                        <div className="grid grid-cols-2 gap-2.5">
                            <button
                                onClick={() => addElement({ type: 'qr', data: '{{studentId}}', width: 100, height: 100 })}
                                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl flex flex-col items-center gap-2 transition-colors"
                            >
                                <div className="w-8 h-8 border-2 border-slate-400 rounded grid grid-cols-3 gap-px p-1">
                                    <div className="bg-slate-400" /><div className="bg-slate-400" /><div className="bg-slate-400" />
                                    <div className="bg-slate-400" /><div /><div className="bg-slate-400" />
                                    <div className="bg-slate-400" /><div className="bg-slate-400" /><div className="bg-slate-400" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase">QR Code</span>
                            </button>
                            <button
                                onClick={() => addElement({ type: 'barcode', data: '{{admissionNo}}', width: 200, height: 60 })}
                                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl flex flex-col items-center gap-2 transition-colors"
                            >
                                <div className="flex gap-px items-end h-8">
                                    {[3, 5, 2, 4, 6, 3, 5, 2, 4, 6, 3, 5].map((h, i) => (
                                        <div key={i} className="w-0.5 bg-slate-400" style={{ height: h * 4 }} />
                                    ))}
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Barcode</span>
                            </button>
                        </div>
                    </section>

                    {/* ── DYNAMIC FIELDS ──────────────────────── */}
                    <section>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-slate-700">Dynamic Fields</h3>
                            <span className="px-1.5 py-0.5 bg-[#ffdad8] text-[#410007] text-[10px] font-bold rounded">LIVE</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                            These fields are replaced with real student data when generating documents.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {DYNAMIC_FIELDS.map(({ key, icon, label }) => (
                                <button
                                    key={key}
                                    onClick={() => addElement({
                                        type: 'text',
                                        text: key,
                                        fontSize: 14,
                                        fill: '#b7102a',
                                        fontWeight: 'bold',
                                        width: 180,
                                        height: 28
                                    })}
                                    title={`Add ${label}`}
                                    className={cn(
                                        'px-2.5 py-1.5 bg-slate-50 border border-slate-200 text-[11px] font-medium rounded-full',
                                        'hover:border-[#b7102a] hover:bg-[#ffdad8]/20 hover:text-[#b7102a]',
                                        'transition-all flex items-center gap-1.5 cursor-pointer'
                                    )}
                                >
                                    <span>{icon}</span>
                                    <span>{key}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* ── BACKGROUND PATTERNS ─────────────────── */}
                    <section>
                        <h3 className="text-sm font-semibold text-slate-700 mb-3">Backgrounds</h3>
                        <div className="grid grid-cols-3 gap-2">
                            {['#ffffff', '#ffdad8', '#f0fdf4', '#eff6ff', '#fefce8', '#f5f3ff'].map(color => (
                                <button
                                    key={color}
                                    title={color}
                                    className="aspect-square rounded-xl border-2 border-white shadow-sm hover:scale-105 transition-transform"
                                    style={{ backgroundColor: color, outline: '1px solid #e1e3e4' }}
                                />
                            ))}
                        </div>
                    </section>
                </div>
            </ScrollArea>
        </div>
    );
}

`

