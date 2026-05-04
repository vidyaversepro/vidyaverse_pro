// @ts-nocheck
import { FastifyPluginAsync } from 'fastify';
// @ts-nocheck
import { createHallTicketService } from './hall-ticket.service.js';
import { getTenantPrisma } from '../../lib/prisma-tenant.js';
function getService(request) {
    if (request.institutionId) {
        return createHallTicketService(getTenantPrisma(request.institutionId));
    }
    return createHallTicketService();
}
import { generateHallTicketSchema, bulkGenerateHallTicketsSchema, hallTicketQuerySchema, examScheduleCreateSchema, examScheduleUpdateSchema, examSubjectCreateSchema, } from '@vidyaverse/shared-validation';
const hallTicketRoutes = async (fastify) => {
    // All routes require authentication
    fastify.addHook('onRequest', fastify.authenticate);
    // ==========================================================================
    // EXAM SCHEDULE ROUTES
    // ==========================================================================
    /**
     * Create exam schedule
     */
    fastify.post('/exam-schedules', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin'])],
        handler: async (request, reply) => {
            const institutionId = request.institutionId;
            const data = request.body;
            const schedule = await getService(request).createExamSchedule(institutionId, data);
            return reply.status(201).send({
                success: true,
                data: schedule,
            });
        },
    });
    /**
     * List exam schedules
     */
    fastify.get('/exam-schedules', {
        preHandler: [fastify.requireInstitution],
        handler: async (request) => {
            const institutionId = request.institutionId;
            const { status } = request.query;
            const schedules = await getService(request).listExamSchedules(institutionId, status);
            return {
                success: true,
                data: schedules,
            };
        },
    });
    /**
     * Get exam schedule by ID
     */
    fastify.get('/exam-schedules/:id', {
        preHandler: [fastify.requireInstitution],
        handler: async (request) => {
            const { id } = request.params;
            const institutionId = request.institutionId;
            const schedule = await getService(request).getExamScheduleById(id, institutionId);
            return {
                success: true,
                data: schedule,
            };
        },
    });
    /**
     * Update exam schedule
     */
    fastify.patch('/exam-schedules/:id', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin'])],
        handler: async (request) => {
            const { id } = request.params;
            const institutionId = request.institutionId;
            const data = request.body;
            const schedule = await getService(request).updateExamSchedule(id, institutionId, data);
            return {
                success: true,
                data: schedule,
            };
        },
    });
    /**
     * Publish exam schedule
     */
    fastify.post('/exam-schedules/:id/publish', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin'])],
        handler: async (request) => {
            const { id } = request.params;
            const institutionId = request.institutionId;
            const schedule = await getService(request).publishExamSchedule(id, institutionId);
            return {
                success: true,
                data: schedule,
            };
        },
    });
    /**
     * Add subject to exam schedule
     */
    fastify.post('/exam-schedules/subjects', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin'])],
        handler: async (request, reply) => {
            const institutionId = request.institutionId;
            const data = request.body;
            const subject = await getService(request).addExamSubject(institutionId, data);
            return reply.status(201).send({
                success: true,
                data: subject,
            });
        },
    });
    // ==========================================================================
    // HALL TICKET ROUTES
    // ==========================================================================
    /**
     * Generate single hall ticket
     */
    fastify.post('/generate', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin', 'teacher'])],
        handler: async (request, reply) => {
            const institutionId = request.institutionId;
            const data = request.body;
            const ticket = await getService(request).generate(institutionId, data);
            return reply.status(201).send({
                success: true,
                data: ticket,
            });
        },
    });
    /**
     * Bulk generate hall tickets
     */
    fastify.post('/generate/bulk', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin'])],
        handler: async (request) => {
            const institutionId = request.institutionId;
            const data = request.body;
            const results = await getService(request).generateBulk(institutionId, data);
            return {
                success: true,
                data: results,
            };
        },
    });
    /**
     * List hall tickets
     */
    fastify.get('/', {
        preHandler: [fastify.requireInstitution],
        handler: async (request) => {
            const institutionId = request.institutionId;
            const query = request.query;
            const result = await getService(request).list(institutionId, query);
            return {
                success: true,
                data: result.tickets,
                pagination: result.pagination,
            };
        },
    });
    /**
     * Get hall ticket by ID
     */
    fastify.get('/:id', {
        preHandler: [fastify.requireInstitution],
        handler: async (request) => {
            const { id } = request.params;
            const institutionId = request.institutionId;
            const ticket = await getService(request).getById(id, institutionId);
            return {
                success: true,
                data: ticket,
            };
        },
    });
    /**
     * Mark hall ticket as issued
     */
    fastify.post('/:id/issue', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin', 'teacher'])],
        handler: async (request) => {
            const { id } = request.params;
            const institutionId = request.institutionId;
            const ticket = await getService(request).markAsIssued(id, institutionId);
            return {
                success: true,
                data: ticket,
            };
        },
    });
};
export default hallTicketRoutes;
