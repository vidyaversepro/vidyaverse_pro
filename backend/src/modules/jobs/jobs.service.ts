import { prisma } from '../../config/database.js';
import type { JobQueryInput } from '@vidyaverse/shared-validation';

export function createJobService(tx: any = prisma) {
    return {
        /**
         * List job executions for an institution
         */
        async list(institutionId: string, query: JobQueryInput) {
            const { status, jobType, page, limit } = query;
            const skip = (page - 1) * limit;

            const whereClause: any = {
                institutionId,
            };

            if (status) {
                whereClause.status = status;
            }

            if (jobType) {
                whereClause.jobType = jobType;
            }

            const [jobs, total] = await Promise.all([
                tx.jobExecution.findMany({
                    where: whereClause,
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit,
                }),
                tx.jobExecution.count({ where: whereClause }),
            ]);

            return {
                jobs,
                pagination: {
                    total,
                    pages: Math.ceil(total / limit),
                    page,
                    limit,
                },
            };
        },

        /**
         * Get a single job execution by ID
         */
        async getById(id: string, institutionId: string) {
            const job = await tx.jobExecution.findUnique({
                where: { id },
            });

            if (!job || job.institutionId !== institutionId) {
                throw new Error('Job not found');
            }

            return job;
        },
    };
}
