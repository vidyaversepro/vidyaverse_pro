// @ts-nocheck
import { FastifyPluginAsync } from 'fastify';
import { inboundService } from './inbound.service.js';

const inboundRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.get('/conversations', {
    preHandler: [fastify.requireInstitution],
    handler: async (request) => ({ success: true, data: await inboundService.listConversations(request.institutionId) }),
  });

  fastify.get('/claims', {
    preHandler: [fastify.requireInstitution],
    handler: async (request) => ({ success: true, data: await inboundService.listClaims(request.institutionId, request.query?.status) }),
  });

  fastify.post('/claims/:id/review', {
    preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin'])],
    handler: async (request, reply) => {
      const { decision, amount, rejectionReason } = request.body || {};
      if (decision !== 'approved' && decision !== 'rejected') {
        return reply.status(400).send({ success: false, error: 'decision must be approved or rejected' });
      }
      const data = await inboundService.reviewClaim(request.institutionId, request.params.id, decision, request.user.userId, { amount, rejectionReason });
      return { success: true, data };
    },
  });
};

export default inboundRoutes;
