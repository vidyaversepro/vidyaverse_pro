import type { FastifyRequest, FastifyReply } from 'fastify';
import { createCallsService } from './calls.service.js';
import { getTenantPrisma } from '../../lib/prisma-tenant.js';
import type { LivekitTokenRequest } from '@vidyaverse/shared-validation';

function getService(request: FastifyRequest) {
  if (request.institutionId) {
    return createCallsService(getTenantPrisma(request.institutionId));
  }
  return createCallsService();
}

export const callsController = {
  async generateLivekitToken(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as LivekitTokenRequest;
    const user = request.user as any;

    try {
      const data = await getService(request).generateToken(
        user.userId,
        user.name,
        request.institutionId!,
        body.conversationId,
        body.callType
      );
      return reply.send({ success: true, data });
    } catch (err: any) {
      if (err.message === 'NOT_PARTICIPANT') {
        return reply.status(403).send({ error: 'Not a participant' });
      }
      throw err;
    }
  },
};
