import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';



export const createClassService = (tx: any = prisma) => ({
    async findAll(params?: {
        page?: number;
        limit?: number;
        search?: string;
        institutionId?: string;
        branchId?: string;
    }) {
        const page = Number(params?.page) || 1;
        const limit = Number(params?.limit) || 50;
        const skip = (page - 1) * limit;

        const where: Prisma.ClassWhereInput = {
            ...(params?.institutionId && { institutionId: params.institutionId }),
            ...(params?.branchId && { branchId: params.branchId }),
            ...(params?.search && {
                name: { contains: params.search },
            }),
        };

        const [data, total] = await Promise.all([
            tx.class.findMany({
                where,
                skip,
                take: limit,
                orderBy: { displayOrder: 'asc' },
                include: {
                    _count: { select: { sections: true, streams: true } },
                    branch: { select: { id: true, name: true } },
                },
            }),
            tx.class.count({ where }),
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
        return tx.class.findUnique({
            where: { id },
            include: {
                institution: { select: { id: true, name: true } },
                branch: { select: { id: true, name: true } },
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
        branchId?: string;
        name: string;
        displayOrder?: number;
        streamsEnabled?: boolean;
    }) {
        return tx.class.create({ data });
    },

    async update(id: string, data: Prisma.ClassUpdateInput) {
        return tx.class.update({
            where: { id },
            data,
        });
    },

    async delete(id: string) {
        return tx.class.delete({
            where: { id },
        });
    },
});

export const service = createClassService();


