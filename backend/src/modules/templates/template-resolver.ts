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
                orderBy: { isDefault: 'desc', updatedAt: 'desc' },
            });

            if (template) {
                logger.debug(`Template resolved via Strategy 3 (Fallback to any active)`, { templateId: template.id, ctx });
                return template;
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
