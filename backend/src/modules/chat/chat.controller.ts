import type { FastifyRequest, FastifyReply } from 'fastify';
import { createChatService } from './chat.service.js';
import { getTenantPrisma } from '../../lib/prisma-tenant.js';
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
    const data = await getService(request).createConversation(
      user.userId,
      request.institutionId!,
      body.type,
      body.name,
      body.participantUserIds
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
