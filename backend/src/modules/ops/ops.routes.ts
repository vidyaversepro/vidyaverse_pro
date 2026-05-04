import { FastifyPluginAsync } from 'fastify';
import { getQueue, QUEUE_NAMES } from '../../utils/job-queue.js';

export const opsRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.addHook('onRequest', fastify.authenticate);

    fastify.post('/trigger-usage-reset', {
        preHandler: [fastify.requireGlobalRole(['super_admin'])],
        handler: async (_request, reply) => {
            await getQueue(QUEUE_NAMES.MONTHLY_USAGE_RESET).add('manual-monthly-reset', { timestamp: Date.now() });
            return reply.send({ success: true, message: 'Monthly usage reset job triggered manually.' });
        }
    });
};
