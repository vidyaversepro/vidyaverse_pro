// @ts-nocheck
import { FastifyPluginAsync } from 'fastify';
import { mobileAppService } from './mobile-app.service.js';
import { requireFeature } from '../entitlements/require-feature.js';

const M = (fastify: any) => [fastify.requireInstitution, requireFeature('mobile_app')];
const ADMIN = ['main_admin', 'school_admin'];

const mobileAppRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.get('/config', {
    preHandler: M(fastify),
    handler: async (req) => ({ success: true, data: await mobileAppService.getConfig(req.institutionId) }),
  });
  fastify.put('/config', {
    preHandler: [...M(fastify), fastify.requireRole(ADMIN)],
    handler: async (req) => ({ success: true, data: await mobileAppService.setConfig(req.institutionId, req.body || {}) }),
  });
};

export default mobileAppRoutes;
