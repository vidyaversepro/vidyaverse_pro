import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';
import crypto from 'crypto';
import { sendInstitutionInvitationEmail } from '../../utils/mailer.js';



export const service = {
    async findAll(params?: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        tier?: string;
    }) {
        const page = Number(params?.page) || 1;
        const limit = Number(params?.limit) || 10;
        const skip = (page - 1) * limit;

        const where: Prisma.InstitutionWhereInput = {
            ...(params?.search && {
                OR: [
                    { name: { contains: params.search } },
                    { code: { contains: params.search } },
                    { contactEmail: { contains: params.search } },
                ],
            }),
            ...(params?.status && params.status !== 'All' && { subscriptionStatus: params.status as Prisma.EnumSubscriptionStatusFilter | import('@prisma/client').SubscriptionStatus }),
            ...(params?.tier && params.tier !== 'All' && { subscriptionTier: params.tier as Prisma.EnumSubscriptionTierFilter | import('@prisma/client').SubscriptionTier }),
        };

        const [data, total] = await Promise.all([
            prisma.institution.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: { students: true },
                    },
                },
            }),
            prisma.institution.count({ where }),
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
        return prisma.institution.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { students: true },
                },
            },
        });
    },

    async checkUniqueness(code?: string, adminEmail?: string, contactEmail?: string, excludeInstitutionId?: string) {
        const errors: Record<string, string> = {};

        if (code) {
            const existingCode = await prisma.institution.findFirst({
                where: {
                    code,
                    ...(excludeInstitutionId ? { id: { not: excludeInstitutionId } } : {})
                },
                select: { id: true },
            });
            if (existingCode) {
                errors.code = `Institution code '${code}' is already in use.`;
            }
        }

        if (adminEmail) {
            const existingUser = await prisma.user.findFirst({
                where: { email: adminEmail },
                select: { id: true },
            });
            const existingInvitation = await prisma.adminInvitation.findFirst({
                where: { email: adminEmail, status: 'pending' },
                select: { id: true },
            });
            if (existingUser || existingInvitation) {
                errors.adminEmail = `Admin email '${adminEmail}' is already registered or invited.`;
            }
        }

        if (contactEmail) {
            const existingContact = await prisma.institution.findFirst({
                where: {
                    contactEmail,
                    ...(excludeInstitutionId ? { id: { not: excludeInstitutionId } } : {})
                },
                select: { id: true },
            });
            if (existingContact) {
                errors.contactEmail = `Contact email '${contactEmail}' is already used by another institution.`;
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
        };
    },

    async create(data: Prisma.InstitutionCreateInput & { adminEmail: string }) {
        const { adminEmail, ...institutionData } = data;

        // Pre-submission validation locally
        const uniquenessCheck = await this.checkUniqueness(
            institutionData.code,
            adminEmail,
            institutionData.contactEmail || undefined
        );

        if (!uniquenessCheck.isValid) {
            const error = new Error('Database constraint violation');
            (error as Error & { status?: number }).status = 409;
            (error as Error & { validationErrors?: any }).validationErrors = uniquenessCheck.errors;
            throw error;
        }

        // Generate secure 24-hour token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        try {
            const result = await prisma.$transaction(async (tx) => {
                const institution = await tx.institution.create({
                    data: {
                        ...institutionData,
                        enabledFields: institutionData.enabledFields || {},
                        customFields: institutionData.customFields || {},
                        enabledServices: institutionData.enabledServices || {},
                    },
                });

                const invitation = await tx.adminInvitation.create({
                    data: {
                        institutionId: institution.id,
                        email: adminEmail,
                        token,
                        expiresAt,
                    },
                });

                return { institution, invitation };
            });

            // Attempt to send email
            try {
                await sendInstitutionInvitationEmail(adminEmail, token, institutionData.name);
            } catch (error) {
                console.error('Failed to send invitation email to admin:', error);
                // Non-blocking error for the transaction
            }

            return result.institution;
        } catch (error: any) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                const target = error.meta?.target as string | string[];
                const duplicateField = Array.isArray(target) ? target[0] : target || 'unknown';

                const customError = new Error(`Unique constraint failed on field: ${duplicateField}`);
                (customError as Error & { status?: number }).status = 409;
                (customError as Error & { validationErrors?: any }).validationErrors = {
                    [duplicateField]: `The value provided for ${duplicateField} is already in use.`,
                };
                throw customError;
            }
            throw error;
        }
    },

    async update(id: string, data: Prisma.InstitutionUpdateInput) {
        return prisma.institution.update({
            where: { id },
            data,
        });
    },

    async delete(id: string) {
        return prisma.institution.delete({
            where: { id },
        });
    },

    // ============================================================================
    // ONBOARDING & BRANDING
    // ============================================================================

    async updateBranding(
        id: string,
        data: {
            logoUrl?: string;
            darkLogoUrl?: string;
            signatureUrl?: string;
            sealUrl?: string;
            signatureTitle?: string;
        }
    ) {
        // Undefined fields are skipped by Prisma, so only provided assets update.
        return prisma.institution.update({
            where: { id },
            data,
        });
    },

    async completeOnboarding(id: string, data: { institutionType?: import('@prisma/client').InstitutionType }) {
        return prisma.institution.update({
            where: { id },
            data: {
                ...(data.institutionType && { institutionType: data.institutionType }),
                onboardingCompleted: true,
            },
        });
    },

    // ============================================================================
    // AUTHORITIES
    // ============================================================================

    async getAuthorities(institutionId: string) {
        return prisma.institutionAuthority.findMany({
            where: { institutionId },
            orderBy: { displayOrder: 'asc' },
        });
    },

    async createAuthority(institutionId: string, data: Prisma.InstitutionAuthorityCreateWithoutInstitutionInput) {
        return prisma.institutionAuthority.create({
            data: {
                ...data,
                institution: { connect: { id: institutionId } },
            },
        });
    },

    async updateAuthority(id: string, data: Prisma.InstitutionAuthorityUpdateInput) {
        return prisma.institutionAuthority.update({
            where: { id },
            data,
        });
    },

    async deleteAuthority(id: string) {
        return prisma.institutionAuthority.delete({
            where: { id },
        });
    },
};



