import type { WebSocket } from 'ws';
import type { FastifyInstance } from 'fastify';
import { prisma } from '../../config/database.js';
import { getRedisClient } from '../../config/redis.js';

type WsClient = {
  socket: WebSocket;
  userId: string;
  institutionId: string;
  conversationIds: Set<string>;
};

// Per-process room registry. Redis pub/sub bridges multiple Fastify instances.
const rooms   = new Map<string, Set<WsClient>>(); // conversationId → clients
const clients = new Map<string, WsClient>();       // userId → client

const CHANNEL_PREFIX = 'ws:saathi:';

export async function initChatWsSubscriber(fastify: FastifyInstance) {
  // duplicate() gives a dedicated subscribe-mode connection
  // so the shared ioredis client stays free for regular commands.
  const sub = getRedisClient().duplicate();
  await sub.psubscribe(`${CHANNEL_PREFIX}*`);

  sub.on('pmessage', (_pattern: string, channel: string, rawMsg: string) => {
    const conversationId = channel.replace(CHANNEL_PREFIX, '');
    const room = rooms.get(conversationId);
    if (!room) return;
    room.forEach((client) => {
      if (client.socket.readyState === 1 /* OPEN */) {
        client.socket.send(rawMsg);
      }
    });
  });

  fastify.log.info('Saathi chat WebSocket Redis subscriber active');
}

export function registerClient(client: WsClient) {
  clients.set(client.userId, client);
}

export function joinRoom(conversationId: string, client: WsClient) {
  if (!rooms.has(conversationId)) rooms.set(conversationId, new Set());
  rooms.get(conversationId)!.add(client);
  client.conversationIds.add(conversationId);
}

export function leaveAllRooms(client: WsClient) {
  client.conversationIds.forEach((cid) => {
    const room = rooms.get(cid);
    if (room) {
      room.delete(client);
      if (room.size === 0) rooms.delete(cid);
    }
  });
  client.conversationIds.clear();
  clients.delete(client.userId);
}

async function broadcast(conversationId: string, payload: object) {
  // Publish to Redis → every Fastify instance receives it and relays to
  // their local WebSocket clients in that room.
  await getRedisClient().publish(
    `${CHANNEL_PREFIX}${conversationId}`,
    JSON.stringify(payload)
  );
}

export async function handleIncomingMessage(
  client: WsClient,
  raw: Buffer | string
) {
  let parsed: { type: string; payload: any };
  try {
    parsed = JSON.parse(raw.toString());
  } catch {
    client.socket.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
    return;
  }

  const { type, payload } = parsed;

  // ── join: subscribe this socket to a conversation ──────────
  if (type === 'join') {
    const participant = await prisma.chatParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: payload.conversationId,
          userId: client.userId,
        },
      },
    });
    if (!participant) {
      client.socket.send(JSON.stringify({ type: 'error', message: 'Not a participant' }));
      return;
    }
    joinRoom(payload.conversationId, client);
    client.socket.send(
      JSON.stringify({ type: 'joined', conversationId: payload.conversationId })
    );
    return;
  }

  // ── message:send ────────────────────────────────────────────
  if (type === 'message:send') {
    const { conversationId, content, messageType = 'text', metadata } = payload;
    if (!client.conversationIds.has(conversationId)) {
      client.socket.send(
        JSON.stringify({ type: 'error', message: 'Not joined to conversation' })
      );
      return;
    }
    const message = await prisma.chatMessage.create({
      data: {
        conversationId,
        senderId: client.userId,
        type: messageType,
        content,
        metadata: metadata ?? undefined,
      },
      include: { sender: { select: { id: true, name: true } } },
    });
    await prisma.chatConversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });
    await broadcast(conversationId, { type: 'message:new', payload: message });
    return;
  }

  // ── typing indicators ────────────────────────────────────────
  if (type === 'typing:start' || type === 'typing:stop') {
    if (!client.conversationIds.has(payload.conversationId)) return;
    await broadcast(payload.conversationId, {
      type,
      payload: { conversationId: payload.conversationId, userId: client.userId },
    });
    return;
  }

  // ── read receipt ─────────────────────────────────────────────
  if (type === 'message:read') {
    const { conversationId } = payload;
    await prisma.chatParticipant.update({
      where: {
        conversationId_userId: { conversationId, userId: client.userId },
      },
      data: { lastReadAt: new Date() },
    });
    await broadcast(conversationId, {
      type: 'message:read',
      payload: { conversationId, userId: client.userId, at: new Date().toISOString() },
    });
  }
}
