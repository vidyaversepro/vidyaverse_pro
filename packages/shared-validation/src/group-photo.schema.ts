import { z } from 'zod';

export const uploadGroupPhotoSchema = z.object({
    name: z.string().min(1, 'Photo name is required').max(255),
    eventName: z.string().optional(),
    eventDate: z.string().datetime().optional(),
    classId: z.string().uuid().optional(),
    sectionId: z.string().uuid().optional(),
    description: z.string().optional(),
});

export const groupPhotoQuerySchema = z.object({
    classId: z.string().uuid().optional(),
    sectionId: z.string().uuid().optional(),
    status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
    page: z.string().transform(Number).default('1'),
    limit: z.string().transform(Number).default('20'),
});

export const extractFacesSchema = z.object({
    minFaceSize: z.number().int().min(20).max(200).default(50),
    confidenceThreshold: z.number().min(0.5).max(1).default(0.8),
});

export const matchStudentsSchema = z.object({
    similarityThreshold: z.number().int().min(50).max(100).default(85),
    autoApprove: z.boolean().default(false),
});

export const faceExtractionUpdateSchema = z.object({
    studentId: z.string().uuid().optional().nullable(),
    isRejected: z.boolean().optional(),
    manualLabel: z.string().optional(),
});

export type UploadGroupPhotoInput = z.infer<typeof uploadGroupPhotoSchema>;
export type GroupPhotoQueryInput = z.infer<typeof groupPhotoQuerySchema>;
export type ExtractFacesInput = z.infer<typeof extractFacesSchema>;
export type MatchStudentsInput = z.infer<typeof matchStudentsSchema>;
export type FaceExtractionUpdateInput = z.infer<typeof faceExtractionUpdateSchema>;
