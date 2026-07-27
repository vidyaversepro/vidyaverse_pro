// @ts-nocheck
import { FastifyPluginAsync } from 'fastify';
import { entitlementsService } from './entitlements.service.js';

/** Institution-side: the requesting tenant's own entitlements (drives UI gating). */
const entitlementsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.get('/me', {
    preHandler: [fastify.requireInstitution],
    handler: async (request) => {
      // A super-admin who hasn't selected an institution yet has no context.
      // Return null gracefully instead of crashing on a null lookup.
      if (!request.institutionId) {
        return { success: true, data: null };
      }
      return {
        success: true,
        data: await entitlementsService.getEntitlements(request.institutionId),
      };
    },
  });
};

export default entitlementsRoutes;
