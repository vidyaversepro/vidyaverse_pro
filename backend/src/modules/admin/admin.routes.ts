// @ts-nocheck
import { FastifyPluginAsync } from 'fastify';
import { MODULE_REGISTRY } from '../../config/module-registry.js';
import { entitlementsService } from '../entitlements/entitlements.service.js';

const SUPER_ROLES = ['super_admin', 'admin'];

const adminRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', fastify.authenticate);

  // Global super-admin / app-owner gate for every route in this plugin.
  fastify.addHook('preHandler', async (request, reply) => {
    const role = request.user?.globalRole;
    if (!role || !SUPER_ROLES.includes(role)) {
      return reply.status(403).send({ success: false, error: { code: 'FORBIDDEN', message: 'Super-admin access required' } });
    }
  });

  // The full module catalog (registry) — drives the toggle dashboard.
  fastify.get('/modules/catalog', async () => ({ success: true, data: MODULE_REGISTRY }));

  // Resolved entitlements + overrides + usage for one institution.
  fastify.get('/institutions/:id/entitlements', {
    handler: async (request) => ({ success: true, data: await entitlementsService.getEntitlements(request.params.id) }),
  });

  // Update tier and/or per-institution grants/revokes/config.
  fastify.put('/institutions/:id/entitlements', {
    handler: async (request) => {
      const { tier, grants, revokes, moduleConfig } = request.body || {};
      const data = await entitlementsService.setEntitlements(request.params.id, request.user?.userId, {
        tier,
        grants,
        revokes,
        moduleConfig,
      });
      return { success: true, data };
    },
  });
};

export default adminRoutes;
