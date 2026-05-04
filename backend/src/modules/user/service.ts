import { prisma } from '../../config/database';
import { Prisma, GlobalRole } from '@prisma/client';
import bcrypt from 'bcryptjs';



export const service = {
    async getStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [totalUsers, superAdmins, activeToday] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({
                where: { globalRole: 'super_admin' },
            }),
            prisma.user.count({
                where: {
                    OR: [
                        { createdAt: { gte: today } },
                        { lastLoginAt: { gte: today } },
                    ],
                },
            }),
        ]);

        return {
            totalUsers,
            superAdmins,
            activeToday,
        };
    },

    async findAll(params?: {
        page?: number;
        limit?: number;
        search?: string;
        role?: string;
        institutionId?: string;
        status?: string;
    }) {
        const page = Number(params?.page) || 1;
        const limit = Number(params?.limit) || 10;
        const skip = (page - 1) * limit;

        const AND: Prisma.UserWhereInput[] = [];

        if (params?.search) {
            AND.push({
                OR: [
                    { name: { contains: params.search } },
                    { email: { contains: params.search } },
                ],
            });
        }

        if (params?.role && params.role !== 'All Roles') {
            const isGlobalRole = ['super_admin', 'support'].includes(params.role);
            const roleFilter: Prisma.UserWhereInput[] = [
                {
                    institutionRoles: {
                        some: { role: params.role as import('@prisma/client').InstitutionRole },
                    },
                }
            ];

            if (isGlobalRole) {
                roleFilter.push({ globalRole: params.role as GlobalRole });
            }

            AND.push({ OR: roleFilter });
        }

        if (params?.institutionId && params.institutionId !== 'All') {
            AND.push({
                institutionRoles: {
                    some: { institutionId: params.institutionId },
                },
            });
        }

        if (params?.status && params.status !== 'All') {
            AND.push({
                isActive: params.status === 'Active',
            });
        }

        const where: Prisma.UserWhereInput = AND.length > 0 ? { AND } : {};

        const [data, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    institutionRoles: {
                        include: {
                            institution: {
                                select: { name: true },
                            },
                        },
                    },
                },
            }),
            prisma.user.count({ where }),
        ]);

        // Passwords are now handled by Better Auth's Account model
        const sanitizedData = data.map(user => {
            return user;
        });

        return {
            data: sanitizedData,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    },

    async findById(id: string) {
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                institutionRoles: {
                    include: {
                        institution: {
                            select: { name: true },
                        },
                    },
                },
            },
        });

        if (!user) return null;
        return user;
    },

    async create(data: any) {
        const { password, institutionRoles, ...userData } = data;
        const passwordHash = await bcrypt.hash(password, 10);

        return prisma.user.create({
            data: {
                ...userData,
                passwordHash,
                ...(institutionRoles && {
                    institutionRoles: {
                        create: institutionRoles, // expect array of { institutionId, role }
                    },
                }),
            },
        });
    },

    async update(id: string, data: any) {
        const { password, institutionRoles, ...userData } = data;

        if (password) {
            userData.passwordHash = await bcrypt.hash(password, 10);
        }

        // Handle role updates separately if needed, simplified for now
        // This complexity suggests a separate endpoint for roles might be better, 
        // but for now providing basic update.

        return prisma.user.update({
            where: { id },
            data: userData,
        });
    },

    async delete(id: string) {
        return prisma.user.delete({
            where: { id },
        });
    },

    async assignRole(userId: string, institutionId: string, role: string) {
        // Upsert logic for roles
        return prisma.userInstitutionRole.upsert({
            where: {
                userId_institutionId: {
                    userId,
                    institutionId,
                },
            },
            update: { role: role as import('@prisma/client').InstitutionRole },
            create: {
                userId,
                institutionId,
                role: role as import('@prisma/client').InstitutionRole,
            },
        });
    }
};



