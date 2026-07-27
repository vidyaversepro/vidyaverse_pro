// @ts-nocheck
import { FastifyPluginAsync } from 'fastify';
import { integrationsService } from './integrations.service.js';
import { entitlementsService } from '../entitlements/entitlements.service.js';

const integrationsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', fastify.authenticate);

  async function gate(req, reply, key: string) {
    if (!integrationsService.isValidKey(key)) {
      reply.status(404).send({ success: false, error: 'Unknown integration' });
      return false;
    }
    if (!(await entitlementsService.isModuleEnabled(req.institutionId, key))) {
      reply.status(403).send({ success: false, error: { code: 'MODULE_DISABLED', message: `The "${key}" module is not enabled.` } });
      return false;
    }
    return true;
  }

  fastify.get('/:key', {
    preHandler: [fastify.requireInstitution],
    handler: async (req, reply) => {
      const { key } = req.params;
      if (!(await gate(req, reply, key))) return;
      const config = await integrationsService.getConfig(req.institutionId, key);
      const health = await integrationsService.checkHealth(req.institutionId, key);
      return { success: true, data: { key, config, health } };
    },
  });

  fastify.put('/:key', {
    preHandler: [fastify.requireInstitution, fastify.requireRole(['main_admin', 'school_admin'])],
    handler: async (req, reply) => {
      const { key } = req.params;
      if (!(await gate(req, reply, key))) return;
      const data = await integrationsService.setConfig(req.institutionId, key, req.body || {});
      return { success: true, data };
    },
  });
};

export default integrationsRoutes;
