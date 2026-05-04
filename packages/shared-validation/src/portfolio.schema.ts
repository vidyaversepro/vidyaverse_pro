import { z } from 'zod';

// Portfolio creation/update
export const portfolioCreateSchema = z.object({
    studentId: z.string().uuid(),
    templateId: z.string().uuid().optional(),
    title: z.string().min(1).max(255).optional(),
    bio: z.string().max(2000).optional(),
    theme: z.enum(['modern', 'classic', 'minimal', 'colorful', 'professional']).default('modern'),
    customDomain: z.string().regex(/^[a-z0-9-]+$/).max(50).optional(),
    isPublic: z.boolean().default(true),
});

export const portfolioUpdateSchema = portfolioCreateSchema.partial().omit({ studentId: true });

// Portfolio sections
export const portfolioSectionCreateSchema = z.object({
    portfolioId: z.string().uuid(),
    type: z.enum(['about', 'education', 'skills', 'achievements', 'projects', 'gallery', 'contact', 'custom']),
    title: z.string().min(1).max(100),
    content: z.any(), // JSON content varies by section type
    order: z.number().int().min(0).default(0),
    isVisible: z.boolean().default(true),
});

export const portfolioSectionUpdateSchema = portfolioSectionCreateSchema.partial().omit({ portfolioId: true });

// Achievement entry
export const achievementSchema = z.object({
    title: z.string().min(1).max(255),
    description: z.string().max(1000).optional(),
    category: z.enum(['academic', 'sports', 'arts', 'leadership', 'community', 'other']),
    date: z.string().datetime().optional(),
    issuer: z.string().max(255).optional(),
    certificateUrl: z.string().url().optional(),
    imageUrl: z.string().url().optional(),
});

// Project entry
export const projectSchema = z.object({
    title: z.string().min(1).max(255),
    description: z.string().max(2000).optional(),
    technologies: z.array(z.string()).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    projectUrl: z.string().url().optional(),
    repositoryUrl: z.string().url().optional(),
    imageUrls: z.array(z.string().url()).max(5).optional(),
});

// Skill entry
export const skillSchema = z.object({
    name: z.string().min(1).max(100),
    category: z.enum(['language', 'technical', 'soft', 'tool', 'other']),
    proficiency: z.number().int().min(1).max(5).optional(),
    yearsOfExperience: z.number().min(0).max(50).optional(),
});

// Gallery item
export const galleryItemSchema = z.object({
    title: z.string().max(100).optional(),
    description: z.string().max(500).optional(),
    imageUrl: z.string().url(),
    thumbnailUrl: z.string().url().optional(),
    category: z.string().max(50).optional(),
});

// Portfolio query
export const portfolioQuerySchema = z.object({
    sectionId: z.string().uuid().optional(),
    isPublic: z.string().transform((v) => v === 'true').optional(),
    theme: z.enum(['modern', 'classic', 'minimal', 'colorful', 'professional']).optional(),
    page: z.string().transform(Number).default('1'),
    limit: z.string().transform(Number).default('20'),
});

// Static site generation
export const generateStaticSiteSchema = z.object({
    portfolioId: z.string().uuid(),
    format: z.enum(['html', 'pdf']).default('html'),
    includeAnalytics: z.boolean().default(false),
});

export type PortfolioCreateInput = z.infer<typeof portfolioCreateSchema>;
export type PortfolioUpdateInput = z.infer<typeof portfolioUpdateSchema>;
export type PortfolioSectionCreateInput = z.infer<typeof portfolioSectionCreateSchema>;
export type PortfolioSectionUpdateInput = z.infer<typeof portfolioSectionUpdateSchema>;
export type AchievementInput = z.infer<typeof achievementSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type SkillInput = z.infer<typeof skillSchema>;
export type GalleryItemInput = z.infer<typeof galleryItemSchema>;
export type PortfolioQueryInput = z.infer<typeof portfolioQuerySchema>;
export type GenerateStaticSiteInput = z.infer<typeof generateStaticSiteSchema>;
