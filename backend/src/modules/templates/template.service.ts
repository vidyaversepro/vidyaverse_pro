import { prisma } from '../../config/database.js';
import { type ServiceType } from '@prisma/client';
import { compileTemplate } from '../../utils/template-engine.js';
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
            return compileTemplate(template.content, maskedData);
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
