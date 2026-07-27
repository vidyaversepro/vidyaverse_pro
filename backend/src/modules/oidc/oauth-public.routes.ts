// @ts-nocheck
/**
 * Public-but-narrow endpoint for the consent screen to display branding
 * (client name + icon) when redirecting to /oauth/consent. Reveals only
 * info already implicit in the client_id URL parameter.
 */
import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../../config/database.js';

const oauthPublicRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/clients/:clientId', async (request, reply) => {
    const { clientId } = request.params;
    const row = await prisma.oauthApplication.findUnique({
      where: { clientId },
      select: { name: true, icon: true, disabled: true },
    });
    if (!row || row.disabled) {
      return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Client not found' } });
    }
    return { success: true, data: { name: row.name, icon: row.icon } };
  });
};

export default oauthPublicRoutes;
