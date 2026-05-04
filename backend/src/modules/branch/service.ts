import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';



export const service = {
    async findAll(params?: {
        page?: number;
        limit?: number;
        search?: string;
        institutionId?: string;
    }) {
        const page = Number(params?.page) || 1;
        const limit = Number(params?.limit) || 10;
        const skip = (page - 1) * limit;

        const where: Prisma.BranchWhereInput = {
            ...(params?.institutionId && { institutionId: params.institutionId }),
            ...(params?.search && {
                OR: [
                    { name: { contains: params.search } },
                    { code: { contains: params.search } },
                ],
            }),
        };

        const [data, total] = await Promise.all([
            prisma.branch.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: { classes: true, students: true },
                    },
                },
            }),
            prisma.branch.count({ where }),
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
        return prisma.branch.findUnique({
            where: { id },
            include: {
                institution: { select: { id: true, name: true, code: true } },
                _count: { select: { classes: true, students: true } },
            },
        });
    },

    async create(data: {
        institutionId: string;
        name: string;
        code: string;
        address?: string;
        contactEmail?: string;
        contactPhone?: string;
    }) {
        return prisma.branch.create({ data });
    },

    async update(id: string, data: Prisma.BranchUpdateInput) {
        return prisma.branch.update({
            where: { id },
            data,
        });
    },

    async delete(id: string) {
        return prisma.branch.delete({
            where: { id },
        });
    },
};


