import { Job } from 'bullmq';
import { createWorker, QUEUE_NAMES, getQueue } from '../utils/job-queue.js';
import { prisma } from '../config/database.js';
import { logger } from '../utils/logger.js';

export async function scheduleMonthlyUsageReset() {
    const queue = getQueue(QUEUE_NAMES.MONTHLY_USAGE_RESET);
    // Add a repeatable job that runs at midnight on the first day of every month
    // pattern: '0 0 1 * *' (minute 0, hour 0, day 1, any month, any day-of-week)
    await queue.add('reset-usage', {}, {
        repeat: {
            pattern: '0 0 1 * *',
        },
        jobId: 'monthly-usage-reset-job' // Ensure single instance
    });
    logger.info('Scheduled monthly usage reset cron job');
}

export function startMonthlyUsageResetWorker() {
    return createWorker(
        QUEUE_NAMES.MONTHLY_USAGE_RESET,
        async (job: Job) => {
            logger.info('Starting monthly usage reset for all active institutions', { jobId: job.id });

            try {
                // Update all active institutions to reset their monthly usage
                const result = await prisma.institution.updateMany({
                    where: {
                        // Optional: only reset active/trial ones, but usually we just reset everyone
                        // to avoid unexpected limits if they reactivate.
                        // We will reset all just to be safe.
                    },
                    data: {
                        monthlyAiUsage: 0,
                        monthlyPdfPages: 0,
                        monthlyEmailSent: 0,
                        // Note: storageUsedMb is NOT reset as it's an absolute counter of current storage.
                    }
                });

                logger.info('Completed monthly usage reset', { 
                    jobId: job.id, 
                    institutionsUpdated: result.count 
                });

                return {
                    success: true,
                    institutionsUpdated: result.count
                };
            } catch (error: any) {
                logger.error('Failed to reset monthly usage', { error: error.message });
                throw error;
            }
        },
        { concurrency: 1 }
    );
}
