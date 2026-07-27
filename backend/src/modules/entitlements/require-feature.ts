import type { FastifyReply, FastifyRequest } from 'fastify';
import { entitlementsService } from './entitlements.service.js';

/**
 * Route preHandler factory that blocks access unless the module is enabled for
 * the request's institution. Use after `requireInstitution`:
 *   preHandler: [fastify.requireInstitution, requireFeature('transport')]
 */
export function requireFeature(key: string) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const institutionId = request.institutionId;
    if (!institutionId) {
      return reply.status(403).send({
        success: false,
        error: { code: 'INSTITUTION_REQUIRED', message: 'Institution context required' },
      });
    }
    const enabled = await entitlementsService.isModuleEnabled(institutionId, key);
    if (!enabled) {
      return reply.status(403).send({
        success: false,
        error: { code: 'MODULE_DISABLED', message: `The "${key}" module is not enabled for this institution.` },
      });
    }
  };
}
