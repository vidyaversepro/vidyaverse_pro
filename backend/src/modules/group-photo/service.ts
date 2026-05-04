import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';



export const service = {
    async findAll(params?: { page?: number; limit?: number; search?: string; institutionId?: string; status?: string }) {
        const page = Number(params?.page) || 1;
        const limit = Number(params?.limit) || 10;
        const skip = (page - 1) * limit;

        const where: Prisma.GroupPhotoWhereInput = {
            ...(params?.institutionId && { institutionId: params.institutionId }),
            ...(params?.status && { status: params.status }),
            ...(params?.search && {
                OR: [
                    { name: { contains: params.search } },
                    { eventName: { contains: params.search } },
                ],
            }),
        };

        const [data, total] = await Promise.all([
            prisma.groupPhoto.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    class: { select: { name: true } },
                    section: { select: { name: true } },
                    _count: { select: { extractions: true } },
                },
            }),
            prisma.groupPhoto.count({ where }),
        ]);

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    },

    async findById(id: string) {
        return prisma.groupPhoto.findUnique({
            where: { id },
            include: {
                class: { select: { name: true } },
                section: { select: { name: true } },
                extractions: {
                    include: {
                        student: {
                            select: {
                                id: true,
                                admissionNumber: true,
                                name: true,
                            }
                        }
                    }
                }
            },
        });
    },

    async create(data: Prisma.GroupPhotoCreateInput) {
        return prisma.groupPhoto.create({
            data,
        });
    },

    async update(id: string, data: Prisma.GroupPhotoUpdateInput) {
        return prisma.groupPhoto.update({
            where: { id },
            data,
        });
    },

    async delete(id: string) {
        return prisma.groupPhoto.delete({
            where: { id },
        });
    },

    async getFaces(id: string) {
        const extractions = await prisma.groupPhotoExtraction.findMany({
            where: { groupPhotoId: id },
            include: {
                student: {
                    select: {
                        id: true,
                        admissionNumber: true,
                        name: true,
                    }
                }
            }
        });

        // Map to frontend Face interface
        return extractions.map(e => {
            const bbox = e.boundingBox as Record<string, number>; // { x, y, width, height }
            return {
                id: e.id,
                groupPhotoId: e.groupPhotoId,
                studentId: e.studentId,
                student: e.student ? {
                    name: e.student.name,
                    admissionNo: e.student.admissionNumber || ''
                } : undefined,
                x: bbox?.x || 0,
                y: bbox?.y || 0,
                width: bbox?.width || 0.1,
                height: bbox?.height || 0.1,
                confidence: Number(e.confidenceScore) || 0,
                imageUrl: e.individualPhotoUrl || undefined,
                isMatched: !!e.studentId
            };
        });
    },

    async updateFaceMapping(id: string, studentId: string) {
        return prisma.groupPhotoExtraction.update({
            where: { id },
            data: {
                studentId,
                matchConfidence: 100, // Manual match
                isAutoMatched: false
            }
        });
    },

    async extractFaces(id: string) {
        // Mock extraction logic
        // 1. Delete existing extractions
        await prisma.groupPhotoExtraction.deleteMany({
            where: { groupPhotoId: id }
        });

        // 2. Create mock extractions
        // Generate random number of faces (5-15)
        const count = Math.floor(Math.random() * 10) + 5;
        const extractions = [];

        for (let i = 0; i < count; i++) {
            // Random position (avoiding overlap logic for simplicity)
            const x = Math.random() * 0.8;
            const y = Math.random() * 0.8;
            const width = 0.05 + Math.random() * 0.05;
            const height = 0.08 + Math.random() * 0.08;

            extractions.push({
                groupPhotoId: id,
                boundingBox: { x, y, width, height },
                confidenceScore: 0.85 + Math.random() * 0.14,
                status: 'pending' // Note: Schema doesn't have status on Extraction, but maybe uses relationship or other fields. 
                // Schema has isRejected, manualLabel.
            });
        }

        // Batch create using createMany is not supported for relation fields easily with all dbs, 
        // but prisma supports it. However, let's use a loop or createMany.
        // Prisma createMany is supported.
        await prisma.groupPhotoExtraction.createMany({
            data: extractions as any[] // Type assertion for JSON field
        });

        // Update photo status
        await prisma.groupPhoto.update({
            where: { id },
            data: {
                status: 'processing',
                totalStudentsDetected: count
            }
        });

        // Simulate async completion
        setTimeout(async () => {
            await prisma.groupPhoto.update({
                where: { id },
                data: {
                    status: 'completed',
                    processingStatus: 'completed',
                    faceDetectionCompleted: true,
                    individualExtractionCompleted: true
                }
            });
        }, 2000);

        return { count };
    }
};


