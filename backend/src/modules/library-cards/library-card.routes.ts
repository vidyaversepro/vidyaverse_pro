// @ts-nocheck
import { FastifyPluginAsync } from 'fastify';
import { createLibraryCardService } from './library-card.service.js';
import { getTenantPrisma } from '../../lib/prisma-tenant.js';
function getService(request) {
    if (request.institutionId) {
        return createLibraryCardService(getTenantPrisma(request.institutionId));
    }
    return createLibraryCardService();
}
import { generateLibraryCardSchema, bulkGenerateLibraryCardsSchema, libraryCardQuerySchema, bookTransactionSchema, } from '@vidyaverse/shared-validation';
const libraryCardRoutes = async (fastify) => {
    fastify.addHook('onRequest', fastify.authenticate);
    /**
     * Generate single library card
     */
    fastify.post('/generate', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin', 'librarian'])],
        handler: async (request, reply) => {
            const institutionId = request.institutionId;
            const data = request.body;
            const card = await getService(request).generate(institutionId, data);
            return reply.status(201).send({ success: true, data: card });
        },
    });
    /**
     * Bulk generate library cards
     */
    fastify.post('/generate/bulk', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin'])],
        handler: async (request) => {
            const institutionId = request.institutionId;
            const data = request.body;
            const results = await getService(request).generateBulk(institutionId, data);
            return { success: true, data: results };
        },
    });
    /**
     * List library cards
     */
    fastify.get('/', {
        preHandler: [fastify.requireInstitution],
        handler: async (request) => {
            const institutionId = request.institutionId;
            const query = libraryCardQuerySchema.parse(request.query);
            const result = await getService(request).list(institutionId, query);
            return { success: true, data: result.cards, pagination: result.pagination };
        },
    });
    /**
     * Get library card by ID
     */
    fastify.get('/:id', {
        preHandler: [fastify.requireInstitution],
        handler: async (request) => {
            const { id } = request.params;
            const institutionId = request.institutionId;
            const card = await getService(request).getById(id, institutionId);
            return { success: true, data: card };
        },
    });
    /**
     * Suspend library card
     */
    fastify.post('/:id/suspend', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin', 'librarian'])],
        handler: async (request) => {
            const { id } = request.params;
            const institutionId = request.institutionId;
            const card = await getService(request).suspend(id, institutionId);
            return { success: true, data: card };
        },
    });
    /**
     * Reactivate library card
     */
    fastify.post('/:id/reactivate', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin', 'librarian'])],
        handler: async (request) => {
            const { id } = request.params;
            const institutionId = request.institutionId;
            const card = await getService(request).reactivate(id, institutionId);
            return { success: true, data: card };
        },
    });
    /**
     * Record book transaction (issue/return)
     */
    fastify.post('/transactions', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin', 'librarian'])],
        handler: async (request, reply) => {
            const data = request.body;
            const transaction = await getService(request).recordTransaction(data);
            return reply.status(201).send({ success: true, data: transaction });
        },
    });
    /**
     * Return book
     */
    fastify.post('/transactions/:transactionId/return', {
        preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin', 'librarian'])],
        handler: async (request) => {
            const { transactionId } = request.params;
            const { fineAmount } = request.body;
            const transaction = await getService(request).returnBook(transactionId, new Date(), fineAmount);
            return { success: true, data: transaction };
        },
    });
};
export default libraryCardRoutes;
