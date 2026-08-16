// @ts-nocheck
import { FastifyPluginAsync } from 'fastify';
// @ts-nocheck
import { createMarksheetService } from './marksheet.service.js';
import { getTenantPrisma } from '../../lib/prisma-tenant.js';
function getService(request) {
    if (request.institutionId) {
        return createMarksheetService(getTenantPrisma(request.institutionId));
    }
    return createMarksheetService();
}
import { markEntrySchema, bulkMarkEntrySchema, generateMarksheetSchema, bulkGenerateMarksheetsSchema, marksheetQuerySchema, calculationEngineCreateSchema, } from '@vidyaverse/shared-validation';
const marksheetRoutes: FastifyPluginAsync = async (fastify) => {
    // All routes require authentication
    fastify.addHook('onRequest', fastify.authenticate);
    // ==========================================================================
    // CALCULATION ENGINE ROUTES
    // ==========================================================================
    /**
     * Create calculation engine
     */
    fastify.post('/engines', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin'])],
        handler: async (request, reply) => {
            const institutionId = request.institutionId;
            const data = request.body;
            const engine = await getService(request).createCalculationEngine(institutionId, data);
            return reply.status(201).send({
                success: true,
                data: engine,
            });
        },
    });
    /**
     * List calculation engines
     */
    fastify.get('/engines', {
        preHandler: [fastify.requireInstitution],
        handler: async (request) => {
            const institutionId = request.institutionId;
            const engines = await getService(request).listCalculationEngines(institutionId);
            return {
                success: true,
                data: engines,
            };
        },
    });
    // ==========================================================================
    // MARKS ENTRY ROUTES
    // ==========================================================================
    /**
     * Enter single mark
     */
    fastify.post('/marks', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin', 'teacher'])],
        handler: async (request, reply) => {
            const institutionId = request.institutionId;
            const data = request.body;
            const mark = await getService(request).enterMark(institutionId, data);
            return reply.status(201).send({
                success: true,
                data: mark,
            });
        },
    });
    /**
     * Bulk enter marks
     */
    fastify.post('/marks/bulk', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin', 'teacher'])],
        handler: async (request) => {
            const institutionId = request.institutionId;
            const data = request.body;
            const results = await getService(request).enterMarksBulk(institutionId, data);
            return {
                success: true,
                data: results,
            };
        },
    });
    // ==========================================================================
    // MARKSHEET ROUTES
    // ==========================================================================
    /**
     * Generate single marksheet
     */
    fastify.post('/generate', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin'])],
        handler: async (request, reply) => {
            const institutionId = request.institutionId;
            const data = request.body;
            const marksheet = await getService(request).generate(institutionId, data);
            return reply.status(201).send({
                success: true,
                data: marksheet,
            });
        },
    });
    /**
     * Bulk generate marksheets
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
     * List marksheets
     */
    fastify.get('/', {
        preHandler: [fastify.requireInstitution],
        handler: async (request) => {
            const institutionId = request.institutionId;
            const query = marksheetQuerySchema.parse(request.query);
            const result = await getService(request).list(institutionId, query);
            return {
                success: true,
                data: result.marksheets,
                pagination: result.pagination,
            };
        },
    });
    /**
     * Get marksheet by ID
     */
    fastify.get('/:id', {
        preHandler: [fastify.requireInstitution],
        handler: async (request) => {
            const { id } = request.params;
            const institutionId = request.institutionId;
            const marksheet = await getService(request).getById(id, institutionId);
            return {
                success: true,
                data: marksheet,
            };
        },
    });
    /**
     * Calculate ranks for an exam
     */
    fastify.post('/ranks/:examScheduleId', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin'])],
        handler: async (request) => {
            const { examScheduleId } = request.params;
            await getService(request).calculateRanks(examScheduleId);
            return {
                success: true,
                message: 'Ranks calculated successfully',
            };
        },
    });
};
export default marksheetRoutes;
