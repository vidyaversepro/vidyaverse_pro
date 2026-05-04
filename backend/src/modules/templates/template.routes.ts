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
