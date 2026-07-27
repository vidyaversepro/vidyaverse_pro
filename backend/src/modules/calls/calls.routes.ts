import type { FastifyInstance } from 'fastify';
import { callsController } from './calls.controller.js';
import { livekitTokenRequestSchema } from '@vidyaverse/shared-validation';

export async function callsRoutes(fastify: FastifyInstance) {
  fastify.post('/token', {
    preHandler: [fastify.authenticate],
    schema: { body: livekitTokenRequestSchema },
  }, callsController.generateLivekitToken);
}
