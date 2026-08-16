// @ts-nocheck
import { FastifyPluginAsync } from 'fastify';
// @ts-nocheck
import { createVisitingCardService } from './service.js';
import { getTenantPrisma } from '../../lib/prisma-tenant.js';
import { visitingCardQuerySchema } from '@vidyaverse/shared-validation';

function getService(request: any) {
    if (request.institutionId) {
        return createVisitingCardService(getTenantPrisma(request.institutionId));
    }
    return createVisitingCardService();
}



const visitingCardRoutes: FastifyPluginAsync = async (fastify) => {
    // Public endpoint: Verify visiting card
    fastify.get('/verify/:cardNumber', {
        handler: async (request: any) => {
            const { cardNumber } = request.params;
            const card = await getService(request).list(null as any, { search: cardNumber } as any);
            if (card.visitingCards && card.visitingCards.length > 0) {
                return { valid: true, card: card.visitingCards[0] };
            }
            return { valid: false, message: 'Card not found' };
        },
    });

    // Protected routes
    fastify.register(async (protectedRoutes) => {
        protectedRoutes.addHook('onRequest', fastify.authenticate);

        /**
         * Create/generate visiting card
         */
        protectedRoutes.post('/', {
            preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin', 'teacher'])],
            handler: async (request: any, reply) => {
                const institutionId = request.institutionId;
                const data = request.body;
                const result = await getService(request).create(institutionId, data);

                return reply.status(201).send({
                    success: true,
                    data: result,
                });
            },
        });

        /**
         * Generate visiting cards in bulk
         */
        protectedRoutes.post('/bulk', {
            preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin'])],
            handler: async (request: any, reply) => {
                const institutionId = request.institutionId;
                const data = request.body;
                const results = await getService(request).generateBulk(institutionId, data);

                return reply.status(201).send({
                    success: true,
                    data: results,
                });
            },
        });

        /**
         * List visiting cards
         */
        protectedRoutes.get('/', {
            preHandler: [fastify.requireInstitution],
            handler: async (request: any) => {
                const institutionId = request.institutionId;
                const query = visitingCardQuerySchema.parse(request.query);
                const result = await getService(request).list(institutionId, query);

                return {
                    success: true,
                    data: result.visitingCards,
                    pagination: result.pagination,
                };
            },
        });

        /**
         * Get visiting card by ID
         */
        protectedRoutes.get('/:id', {
            preHandler: [fastify.requireInstitution],
            handler: async (request: any) => {
                const { id } = request.params;
                const institutionId = request.institutionId;
                const card = await getService(request).getById(id, institutionId);

                return {
                    success: true,
                    data: card,
                };
            },
        });

        /**
         * Download visiting card PDF
         */
        protectedRoutes.get('/:id/download', {
            preHandler: [fastify.requireInstitution],
            handler: async (request: any, reply) => {
                const { id } = request.params;
                const institutionId = request.institutionId;
                const card = await getService(request).getById(id, institutionId);

                if (!card.frontPdfUrl) {
                    return reply.status(404).send({
                        success: false,
                        error: 'PDF not available',
                    });
                }

                return reply.redirect(card.frontPdfUrl);
            },
        });
    });
};

export default visitingCardRoutes;
