import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';



export const createStreamService = (tx: any = prisma) => ({
    async findAll(params?: {
        classId?: string;
        institutionId?: string;
    }) {
        const where: Prisma.StreamWhereInput = {
            ...(params?.classId && { classId: params.classId }),
            ...(params?.institutionId && { institutionId: params.institutionId }),
        };

        const data = await tx.stream.findMany({
            where,
            orderBy: { displayOrder: 'asc' },
            include: {
                _count: { select: { sections: true } },
            },
        });

        return { data };
    },

    async findById(id: string) {
        return tx.stream.findUnique({
            where: { id },
            include: {
                class: { select: { id: true, name: true } },
                sections: {
                    orderBy: { name: 'asc' },
                    include: {
                        _count: { select: { students: true } },
                    },
                },
                _count: { select: { sections: true } },
            },
        });
    },

    async create(data: {
        institutionId: string;
        classId: string;
        name: string;
        description?: string;
        displayOrder?: number;
    }) {
        return tx.stream.create({ data });
    },

    async update(id: string, data: Prisma.StreamUpdateInput) {
        return tx.stream.update({
            where: { id },
            data,
        });
    },

    async delete(id: string) {
        return tx.stream.delete({
            where: { id },
        });
    },
});

export const service = createStreamService();


