import { z } from 'zod';

export const createTemplateSchema = z.object({
    name: z.string().min(1, 'Template name is required').max(255),
    serviceType: z.enum([
        'id_card',
        'certificate',
        'group_photo',
        'portfolio',
        'hall_ticket',
        'marksheet',
        'library_card',
        'transfer_certificate',
    ]),
    templateType: z.enum(['html', 'svg', 'json']).default('html'),
    content: z.string().min(1, 'Template content is required'),
    cssStyles: z.string().optional(),
    widthMm: z.number().positive().default(85.60),
    heightMm: z.number().positive().default(54.00),
    orientation: z.enum(['portrait', 'landscape']).default('landscape'),
    description: z.string().optional(),
    isDefault: z.boolean().default(false),
});

export const updateTemplateSchema = createTemplateSchema.partial().extend({
    isActive: z.boolean().optional(),
});

export const templateQuerySchema = z.object({
    serviceType: z.enum([
        'id_card',
        'certificate',
        'group_photo',
        'portfolio',
        'hall_ticket',
        'marksheet',
        'library_card',
        'transfer_certificate',
    ]).optional(),
    isActive: z.string().transform((v) => v === 'true').optional(),
    page: z.string().transform(Number).default('1'),
    limit: z.string().transform(Number).default('20'),
});

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
export type TemplateQueryInput = z.infer<typeof templateQuerySchema>;
