import { prisma } from '../config/database.js';
import { Prisma } from '@prisma/client';

const modelsWithInstitutionId = new Set(
    Prisma.dmmf.datamodel.models
        .filter(m => m.fields.some(f => f.name === 'institutionId'))
        .map(m => m.name)
);

/**
 * Creates a tenant-scoped Prisma client that automatically injects
 * `institutionId` into read and write operations for models that support it.
 * 
 * This guarantees true data isolation between tenants at the ORM level.
 */
export function getTenantPrisma(institutionId: string) {
    if (!institutionId) {
        throw new Error('Tenant Prisma Client requires an institutionId');
    }

    return prisma.$extends({
        query: {
            $allModels: {
                // Intercept find operations
                async findUnique({ model, args, query }) {
                    if (!model || !modelsWithInstitutionId.has(model)) return query(args);
                    return query({
                        ...args,
                        where: { ...(args as any).where, institutionId }
                    });
                },
                async findFirst({ model, args, query }) {
                    if (!model || !modelsWithInstitutionId.has(model)) return query(args);
                    return query({
                        ...args,
                        where: { ...(args as any).where, institutionId }
                    });
                },
                async findMany({ model, args, query }) {
                    if (!model || !modelsWithInstitutionId.has(model)) return query(args);
                    return query({
                        ...args,
                        where: { ...(args as any).where, institutionId }
                    });
                },
                async count({ model, args, query }) {
                    if (!model || !modelsWithInstitutionId.has(model)) return query(args);
                    return query({
                        ...args,
                        where: { ...(args as any).where, institutionId }
                    });
                },
                async aggregate({ model, args, query }) {
                    if (!model || !modelsWithInstitutionId.has(model)) return query(args);
                    return query({
                        ...args,
                        where: { ...(args as any).where, institutionId }
                    });
                },
                async groupBy({ model, args, query }) {
                    if (!model || !modelsWithInstitutionId.has(model)) return query(args);
                    return query({
                        ...args,
                        where: { ...(args as any).where, institutionId }
                    });
                },

                // Intercept write operations
                async create({ model, args, query }) {
                    if (!model || !modelsWithInstitutionId.has(model)) return query(args);
                    // Ensure the institutionId is forcibly injected into the payload
                    return query({
                        ...args,
                        data: {
                            ...(args as any).data,
                            institutionId
                        }
                    });
                },
                async createMany({ model, args, query }) {
                    if (!model || !modelsWithInstitutionId.has(model)) return query(args);
                    // Handle array of data or single object
                    const dataArgs = (args as any).data;
                    const data = Array.isArray(dataArgs) 
                        ? dataArgs.map((item: any) => ({ ...item, institutionId }))
                        : { ...dataArgs, institutionId };
                        
                    return query({
                        ...args,
                        data
                    });
                },
                async update({ model, args, query }) {
                    if (!model || !modelsWithInstitutionId.has(model)) return query(args);
                    return query({
                        ...args,
                        where: { ...(args as any).where, institutionId }
                    });
                },
                async updateMany({ model, args, query }) {
                    if (!model || !modelsWithInstitutionId.has(model)) return query(args);
                    return query({
                        ...args,
                        where: { ...(args as any).where, institutionId }
                    });
                },
                async delete({ model, args, query }) {
                    if (!model || !modelsWithInstitutionId.has(model)) return query(args);
                    return query({
                        ...args,
                        where: { ...(args as any).where, institutionId }
                    });
                },
                async deleteMany({ model, args, query }) {
                    if (!model || !modelsWithInstitutionId.has(model)) return query(args);
                    return query({
                        ...args,
                        where: { ...(args as any).where, institutionId }
                    });
                },
                async upsert({ model, args, query }) {
                    if (!model || !modelsWithInstitutionId.has(model)) return query(args);
                    return query({
                        ...args,
                        where: { ...(args as any).where, institutionId },
                        create: { ...(args as any).create, institutionId }
                    });
                }
            }
        }
    });
}
