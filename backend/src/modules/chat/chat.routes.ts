import type { FastifyInstance } from 'fastify';
import { chatController } from './chat.controller.js';
import {
  createConversationSchema,
  listMessagesQuerySchema,
} from '@vidyaverse/shared-validation';
import {
  registerClient,
  leaveAllRooms,
  handleIncomingMessage,
} from './chat.ws.js';
import { auth } from '../../lib/auth.js';

export async function chatRoutes(fastify: FastifyInstance) {

  // ── REST routes ─────────────────────────────────────────────
  fastify.get('/conversations', {
    preHandler: [fastify.authenticate],
  }, chatController.listConversations);

  fastify.post('/conversations', {
    preHandler: [fastify.authenticate],
    schema: { body: createConversationSchema },
  }, chatController.createConversation);

  fastify.get('/conversations/:id/messages', {
    preHandler: [fastify.authenticate],
    schema: { querystring: listMessagesQuerySchema },
  }, chatController.getMessages);

  // ── WebSocket route ──────────────────────────────────────────
  // Client URL: ws://host/chat/ws?token=<session>&institutionId=<id>
  fastify.get('/ws', { websocket: true } as any, async (connection: any, request: any) => {
    const socket = connection.socket;
    const query = request.query as Record<string, string>;
    const token        = query.token;
    const institutionId = query.institutionId;

    if (!token || !institutionId) {
      socket.close(4001, 'Missing token or institutionId');
      return;
    }

    let userId: string;
    try {
      // Auth verification using the provided token via mock Headers object
      const url = new URL(request.url, process.env.API_BASE_URL || 'http://localhost:3002');
      const webReq = new Request(url, { 
        method: request.method, 
        headers: new Headers({ authorization: `Bearer ${token}` }) 
      });
      const sessionData = await auth.api.getSession({ headers: webReq.headers });
      if (!sessionData) {
        socket.close(4001, 'Invalid or expired session');
        return;
      }
      userId = sessionData.user.id;
    } catch (err) {
      fastify.log.error({ err }, 'WS session verification failed');
      socket.close(4001, 'Invalid or expired session');
      return;
    }

    const client = {
      socket: socket as any,
      userId,
      institutionId,
      conversationIds: new Set<string>(),
    };

    registerClient(client);

    socket.on('message', (raw: any) =>
      handleIncomingMessage(client, raw as Buffer)
    );
    socket.on('close', () => leaveAllRooms(client));
    socket.on('error', (err: any) => {
      fastify.log.error({ err }, 'Saathi chat WS error');
      leaveAllRooms(client);
    });

    socket.send(JSON.stringify({ type: 'connected', userId }));
  });
}

