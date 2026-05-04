// @ts-nocheck
import { FastifyPluginAsync } from 'fastify';
// @ts-nocheck
import { approvalService } from './approval.service.js';
import { approvalRequestCreateSchema, approvalRequestUpdateSchema, processApprovalSchema, approvalWorkflowCreateSchema, approvalQuerySchema, } from '@vidyaverse/shared-validation';
const approvalRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.addHook('onRequest', fastify.authenticate);
    // ============================================================================
    // WORKFLOWS
    // ============================================================================
    /**
     * Create workflow
     */
    fastify.post('/workflows', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin'])],
        handler: async (request, reply) => {
            const institutionId = request.institutionId;
            const data = approvalWorkflowCreateSchema.parse(request.body);
            const workflow = await approvalService.createWorkflow(institutionId, data);
            return reply.status(201).send({ success: true, data: workflow });
        },
    });
    /**
     * List workflows
     */
    fastify.get('/workflows', {
        preHandler: [fastify.requireInstitution],
        handler: async (request) => {
            const institutionId = request.institutionId;
            const { type } = request.query;
            const workflows = await approvalService.listWorkflows(institutionId, type);
            return { success: true, data: workflows };
        },
    });
    /**
     * Toggle workflow active status
     */
    fastify.patch('/workflows/:id/toggle', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin'])],
        handler: async (request) => {
            const { id } = request.params;
            const institutionId = request.institutionId;
            const { isActive } = request.body;
            const workflow = await approvalService.toggleWorkflow(id, institutionId, isActive);
            return { success: true, data: workflow };
        },
    });
    // ============================================================================
    // REQUESTS
    // ============================================================================
    /**
     * Create approval request
     */
    fastify.post('/requests', {
        preHandler: [fastify.requireInstitution],
        handler: async (request, reply) => {
            const institutionId = request.institutionId;
            const userId = request.user.userId;
            const data = approvalRequestCreateSchema.parse(request.body);
            const approvalRequest = await approvalService.createRequest(institutionId, userId, data);
            return reply.status(201).send({ success: true, data: approvalRequest });
        },
    });
    /**
     * List approval requests
     */
    fastify.get('/requests', {
        preHandler: [fastify.requireInstitution],
        handler: async (request) => {
            const institutionId = request.institutionId;
            const userId = request.user.userId;
            // GET /requests calls listRequests, let's pass the correct institution role instead of globalRole
            const userRole = request.userRole.role;
            const query = approvalQuerySchema.parse(request.query);
            const result = await approvalService.listRequests(institutionId, userId, userRole, query);
            return { success: true, data: result.requests, pagination: result.pagination };
        },
    });
    /**
     * Get approval request by ID
     */
    fastify.get('/requests/:id', {
        preHandler: [fastify.requireInstitution],
        handler: async (request) => {
            const { id } = request.params;
            const institutionId = request.institutionId;
            const approvalRequest = await approvalService.getRequest(id, institutionId);
            return { success: true, data: approvalRequest };
        },
    });
    /**
     * Update approval request
     */
    fastify.patch('/requests/:id', {
        preHandler: [fastify.requireInstitution],
        handler: async (request) => {
            const { id } = request.params;
            const institutionId = request.institutionId;
            const userId = request.user.userId;
            const data = approvalRequestUpdateSchema.parse(request.body);
            const approvalRequest = await approvalService.updateRequest(id, institutionId, userId, data);
            return { success: true, data: approvalRequest };
        },
    });
    /**
     * Process approval (approve/reject)
     */
    fastify.post('/requests/:id/process', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin', 'teacher', 'accountant'])],
        handler: async (request) => {
            const { id } = request.params;
            const institutionId = request.institutionId;
            const userId = request.user.userId;
            const userRole = request.userRole.role;
            const data = processApprovalSchema.parse(request.body);
            const approvalRequest = await approvalService.processApproval(id, institutionId, userId, userRole, data);
            return { success: true, data: approvalRequest };
        },
    });
    /**
     * Cancel approval request
     */
    fastify.post('/requests/:id/cancel', {
        preHandler: [fastify.requireInstitution],
        handler: async (request) => {
            const { id } = request.params;
            const institutionId = request.institutionId;
            const userId = request.user.userId;
            const approvalRequest = await approvalService.cancelRequest(id, institutionId, userId);
            return { success: true, data: approvalRequest };
        },
    });
    // ============================================================================
    // STATS
    // ============================================================================
    /**
     * Get approval statistics
     */
    fastify.get('/stats', {
        preHandler: [fastify.requireInstitution],
        handler: async (request) => {
            const institutionId = request.institutionId;
            const userId = request.user.userId;
            const stats = await approvalService.getApprovalStats(institutionId, userId);
            return { success: true, data: stats };
        },
    });
};
export default approvalRoutes;
