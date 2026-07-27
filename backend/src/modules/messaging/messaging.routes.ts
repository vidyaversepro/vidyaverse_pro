// @ts-nocheck
import { FastifyPluginAsync } from 'fastify';
import { messagingService } from './messaging.service.js';

const messagingRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', fastify.authenticate);

  // List this institution's WhatsApp templates
  fastify.get('/templates', {
    preHandler: [fastify.requireInstitution],
    handler: async (request) => {
      const data = await messagingService.listTemplates(request.institutionId);
      return { success: true, data };
    },
  });

  // Provision the default Hindi template catalog
  fastify.post('/templates/provision', {
    preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin'])],
    handler: async (request) => {
      const data = await messagingService.provisionDefaultTemplates(request.institutionId);
      return { success: true, data };
    },
  });

  // Enqueue a templated message to a guardian (manual / test send)
  fastify.post('/send', {
    preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin', 'teacher'])],
    handler: async (request, reply) => {
      const { recipientId, templateCode, variables, priority, idempotencyKey } = request.body;
      if (!recipientId || !templateCode) {
        return reply.status(400).send({ success: false, error: 'recipientId and templateCode are required' });
      }
      const data = await messagingService.enqueueMessage({
        institutionId: request.institutionId,
        recipientType: 'guardian',
        recipientId,
        templateCode,
        variables: variables || {},
        priority,
        idempotencyKey,
      });
      return reply.status(202).send({ success: true, data });
    },
  });

  // Delivery log
  fastify.get('/messages', {
    preHandler: [fastify.requireInstitution],
    handler: async (request) => {
      const { guardianId, limit } = request.query;
      const data = await messagingService.listMessages(request.institutionId, {
        guardianId,
        limit: limit ? Number(limit) : undefined,
      });
      return { success: true, data };
    },
  });
};

export default messagingRoutes;
