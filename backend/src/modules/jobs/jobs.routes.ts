import { FastifyPluginAsync } from 'fastify';
import { createJobService } from './jobs.service.js';
import { jobEvents } from '../../events/sse-emitter.js';

function getService() {
    return createJobService();
}

const jobsRoutes: FastifyPluginAsync = async (fastify) => {
    // All routes require authentication
    fastify.addHook('onRequest', fastify.authenticate);

    fastify.post('/monthly-reset/trigger', {
        handler: async (request, reply) => {
            if (request.user?.globalRole !== 'super_admin') {
                return reply.status(403).send({ success: false, message: 'Only super_admin can trigger this' });
            }
            const { getQueue, QUEUE_NAMES } = await import('../../utils/job-queue.js');
            const queue = getQueue(QUEUE_NAMES.MONTHLY_USAGE_RESET);
            await queue.add('reset-usage-manual', {}, {
                jobId: `manual-reset-${Date.now()}`
            });
            return { success: true, message: 'Monthly usage reset job triggered manually' };
        },
    });

    fastify.get('/', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin'])],
        handler: async (request) => {
            const institutionId = request.institutionId!;
            const query = request.query as any;
            const result = await getService().list(institutionId, query);
            return {
                success: true,
                data: result.jobs,
                pagination: result.pagination,
            };
        },
    });

    fastify.get('/:id', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin'])],
        handler: async (request) => {
            const { id } = request.params as any;
            const institutionId = request.institutionId!;
            const job = await getService().getById(id, institutionId);
            return {
                success: true,
                data: job,
            };
        },
    });

    fastify.get('/:id/progress', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin'])],
        handler: async (request, reply) => {
            const { id } = request.params as any;
            
            reply.raw.setHeader('Content-Type', 'text/event-stream');
            reply.raw.setHeader('Cache-Control', 'no-cache');
            reply.raw.setHeader('Connection', 'keep-alive');
            reply.raw.setHeader('X-Accel-Buffering', 'no'); // Prevent NGINX buffering

            reply.hijack(); // Tell fastify we'll handle the response stream

            const eventName = `job:${id}`;
            const listener = (data: any) => {
                reply.raw.write(`data: ${JSON.stringify(data)}\n\n`);
            };

            jobEvents.on(eventName, listener);

            // Send initial connection successful event
            reply.raw.write(`data: ${JSON.stringify({ status: 'connected' })}\n\n`);

            // Heartbeat to keep connection alive
            const heartbeat = setInterval(() => {
                reply.raw.write(':\n\n');
            }, 15000);

            request.raw.on('close', () => {
                clearInterval(heartbeat);
                jobEvents.off(eventName, listener);
            });
        },
    });
};

export default jobsRoutes;
