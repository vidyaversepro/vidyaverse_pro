import { AccessToken } from 'livekit-server-sdk';
import { prisma as defaultPrisma } from '../../config/database.js';
import { env } from '../../config/env.js';
import { v4 as uuidv4 } from 'uuid';

export const createCallsService = (tx: any = defaultPrisma) => ({

  async generateToken(
    userId: string,
    userName: string,
    institutionId: string,
    conversationId: string,
    callType: 'audio' | 'video'
  ) {
    // 1. Verify participation
    const participant = await tx.chatParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
      include: { conversation: true },
    });
    if (!participant) throw new Error('NOT_PARTICIPANT');

    // 2. See if there's an active call session for this conversation
    let session = await tx.callSession.findFirst({
      where: { conversationId, endedAt: null },
    });

    if (!session) {
      session = await tx.callSession.create({
        data: {
          institutionId,
          conversationId,
          type: callType,
          hostId: userId,
          livekitRoomName: `conv_${conversationId}_${uuidv4().substring(0, 8)}`,
        },
      });

      // Announce call start in the chat
      await tx.chatMessage.create({
        data: {
          conversationId,
          senderId: userId,
          type: 'call_started',
          content: `${callType === 'video' ? 'Video' : 'Audio'} call started`,
        },
      });
      await tx.chatConversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() },
      });
      // In a full implementation, we'd broadcast this via Redis
    }

    // 3. Generate Livekit token
    const at = new AccessToken(env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET, {
      identity: userId,
      name: userName,
    });
    at.addGrant({
      roomJoin: true,
      room: session.livekitRoomName,
      canPublish: true,
      canSubscribe: true,
    });

    return {
      token: await at.toJwt(),
      roomName: session.livekitRoomName,
      wsUrl: env.LIVEKIT_WS_URL,
      callSessionId: session.id,
    };
  },
});

export const callsService = createCallsService();
