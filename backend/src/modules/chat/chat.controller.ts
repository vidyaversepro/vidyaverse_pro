import type { FastifyRequest, FastifyReply } from 'fastify';
import { createChatService } from './chat.service.js';
import { getTenantPrisma } from '../../lib/prisma-tenant.js';
import { prisma } from '../../config/database.js';
import type {
  CreateConversationInput,
  ListMessagesQuery,
} from '@vidyaverse/shared-validation';

function getService(request: FastifyRequest) {
  if (request.institutionId) {
    return createChatService(getTenantPrisma(request.institutionId));
  }
  return createChatService();
}

export const chatController = {
  async listConversations(request: FastifyRequest, reply: FastifyReply) {
    const user = request.user as any;
    const data = await getService(request).listConversations(
      user.userId,
      request.institutionId!
    );
    return reply.send({ success: true, data });
  },

  async createConversation(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as CreateConversationInput;
    const user = request.user as any;
    const targets = body.participantUserIds ?? [];

    // Platform admins (super_admin / support) may open conversations across
    // institutions — e.g. a platform admin messaging a school contact.
    // Regular school users are confined to participants who share one of their
    // own institutions, so a student/teacher/admin cannot DM arbitrary users in
    // other tenants. The conversation's own institutionId is left as-is (the
    // chat routes don't resolve one) so listing behaviour is unchanged.
    const isPlatformAdmin = ['super_admin', 'support'].includes(user.globalRole);
    if (!isPlatformAdmin && targets.length > 0) {
      const callerRoles = await prisma.userInstitutionRole.findMany({
        where: { userId: user.userId },
        select: { institutionId: true },
      });
      const callerInstitutionIds = [...new Set(callerRoles.map((r) => r.institutionId))];
      if (callerInstitutionIds.length === 0) {
        return reply.status(403).send({ error: 'No institution context for chat' });
      }
      const shared = await prisma.userInstitutionRole.findMany({
        where: { userId: { in: targets }, institutionId: { in: callerInstitutionIds } },
        select: { userId: true },
      });
      const reachable = new Set(shared.map((r) => r.userId));
      const outsiders = targets.filter((id) => !reachable.has(id));
      if (outsiders.length > 0) {
        return reply.status(403).send({ error: 'Participants must share your institution' });
      }
    }

    const data = await getService(request).createConversation(
      user.userId,
      request.institutionId!,
      body.type,
      body.name,
      targets
    );
    return reply.status(201).send({ success: true, data });
  },

  async getMessages(request: FastifyRequest, reply: FastifyReply) {
    const { id: conversationId } = request.params as { id: string };
    const query = request.query as ListMessagesQuery;
    const user = request.user as any;
    try {
      const data = await getService(request).getMessages(
        conversationId,
        user.userId,
        query.cursor,
        query.limit
      );
      return reply.send({ success: true, data });
    } catch (err: any) {
      if (err.message === 'NOT_PARTICIPANT') {
        return reply
          .status(403)
          .send({ error: 'Not a participant in this conversation' });
      }
      throw err;
    }
  },
};
