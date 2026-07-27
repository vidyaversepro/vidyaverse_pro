import { prisma as defaultPrisma } from '../../config/database.js';

export const createChatService = (tx: any = defaultPrisma) => ({

  async listConversations(userId: string, institutionId: string) {
    return tx.chatConversation.findMany({
      where: {
        institutionId,
        participants: { some: { userId } },
      },
      include: {
        participants: {
          include: { user: { select: { id: true, name: true } } },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });
  },

  async createConversation(
    userId: string,
    institutionId: string,
    type: 'direct' | 'group',
    name: string | undefined,
    participantUserIds: string[]
  ) {
    // Idempotency: return existing direct conversation if one already exists
    if (type === 'direct' && participantUserIds.length === 1) {
      const otherId = participantUserIds[0];
      const existing = await tx.chatConversation.findFirst({
        where: {
          institutionId,
          type: 'direct',
          AND: [
            { participants: { some: { userId } } },
            { participants: { some: { userId: otherId } } },
          ],
        },
        include: {
          participants: {
            include: { user: { select: { id: true, name: true } } },
          },
        },
      });
      if (existing) return existing;
    }

    const allIds = [...new Set([userId, ...participantUserIds])];
    return tx.chatConversation.create({
      data: {
        institutionId,
        type,
        name,
        participants: {
          create: allIds.map((uid) => ({
            userId: uid,
            isAdmin: uid === userId,
          })),
        },
      },
      include: {
        participants: {
          include: { user: { select: { id: true, name: true } } },
        },
      },
    });
  },

  async getMessages(
    conversationId: string,
    userId: string,
    cursor: string | undefined,
    limit: number
  ) {
    const participant = await tx.chatParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    if (!participant) throw new Error('NOT_PARTICIPANT');

    return tx.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: { sender: { select: { id: true, name: true } } },
    });
  },
});

export const chatService = createChatService();
