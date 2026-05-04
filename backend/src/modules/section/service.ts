import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';
import { createStudentService } from '../student/service.js';



export const createSectionService = (tx: any = prisma) => ({
    async findAll(params?: {
        page?: number;
        limit?: number;
        search?: string;
        classId?: string;
        streamId?: string;
        institutionId?: string;
    }) {
        const page = Number(params?.page) || 1;
        const limit = Number(params?.limit) || 50;
        const skip = (page - 1) * limit;

        const where: Prisma.SectionWhereInput = {
            ...(params?.classId && { classId: params.classId }),
            ...(params?.streamId && { streamId: params.streamId }),
            ...(params?.institutionId && { institutionId: params.institutionId }),
            ...(params?.search && {
                name: { contains: params.search },
            }),
        };

        const [data, total] = await Promise.all([
            tx.section.findMany({
                where,
                skip,
                take: limit,
                orderBy: { name: 'asc' },
                include: {
                    class: { select: { id: true, name: true } },
                    stream: { select: { id: true, name: true } },
                    classTeacher: { select: { id: true, name: true } },
                    _count: { select: { students: true } },
                },
            }),
            tx.section.count({ where }),
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
        return tx.section.findUnique({
            where: { id },
            include: {
                class: {
                    select: { id: true, name: true },
                },
                institution: { select: { id: true, name: true } },
                _count: { select: { students: true } },
            },
        });
    },

    async create(data: {
        institutionId: string;
        classId: string;
        streamId?: string;
        name: string;
        expectedStudentCount?: number;
        classTeacherId?: string;
    }) {
        const section = await tx.section.create({ data });

        if (section.expectedStudentCount > 0) {
            await createStudentService(tx).generateSectionForms(section.id, data.institutionId).catch(console.error);
        }

        return section;
    },

    async createBulk(data: {
        institutionId: string;
        classId: string;
        streamId?: string;
        name: string;
        expectedStudentCount?: number;
        classTeacherId?: string;
    }[]) {
        // Find existing sections to avoid regenerating forms for them
        const existingSections = await tx.section.findMany({
            where: { institutionId: data[0]?.institutionId },
            select: { classId: true, streamId: true, name: true }
        });

        const existingSet = new Set(existingSections.map((s: any) => `${s.classId}-${s.streamId || 'none'}-${s.name}`));

        const result = await tx.section.createMany({
            data,
            skipDuplicates: true,
        });

        // Trigger generation for newly added sections with capacity
        const newSections = data.filter(s => !existingSet.has(`${s.classId}-${s.streamId || 'none'}-${s.name}`));

        // We have to fetch them to get their generated IDs
        if (newSections.length > 0) {
            const addedSections = await tx.section.findMany({
                where: {
                    institutionId: data[0]?.institutionId,
                    OR: newSections.map(s => ({ classId: s.classId, streamId: s.streamId || null, name: s.name }))
                },
                select: { id: true, expectedStudentCount: true, institutionId: true }
            });

            for (const s of addedSections) {
                if (s.expectedStudentCount > 0) {
                    await createStudentService(tx).generateSectionForms(s.id, s.institutionId).catch(console.error);
                }
            }
        }

        return result;
    },

    async update(id: string, data: Prisma.SectionUpdateInput) {
        const section = await tx.section.update({
            where: { id },
            data,
        });

        if (section.expectedStudentCount > 0) {
            await createStudentService(tx).generateSectionForms(section.id, section.institutionId).catch(console.error);
        }

        return section;
    },

    async delete(id: string) {
        return tx.section.delete({
            where: { id },
        });
    },
});

export const service = createSectionService();


