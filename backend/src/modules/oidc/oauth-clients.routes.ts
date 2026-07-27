// @ts-nocheck
/**
 * Super-admin CRUD for OIDC relying parties (PDLMS, DCP).
 *
 * Storage: oauth_applications table (owned by Better Auth oidc-provider plugin).
 * Secret strategy: clientSecret is generated on create/rotate, returned in the
 * response body ONCE (plaintext), then HMAC-hashed at rest (see
 * client-secret-hash.ts). It is never returned by GET.
 *
 * Registered at /api/v1/admin/oauth-clients under the existing admin module's
 * super-admin gate.
 */
import { FastifyPluginAsync } from 'fastify';
import { randomBytes } from 'node:crypto';
import { prisma } from '../../config/database.js';
import { hashClientSecret } from './client-secret-hash.js';

const SUPER_ROLES = ['super_admin', 'admin'];

function generateClientId(name: string): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 32);
  return `${slug}-${randomBytes(6).toString('hex')}`;
}

function generateClientSecret(): string {
  return randomBytes(32).toString('base64url');
}

function safeView(row) {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    clientId: row.clientId,
    redirectUrls: row.redirectUrls ? row.redirectUrls.split(',').map((s) => s.trim()).filter(Boolean) : [],
    type: row.type,
    disabled: row.disabled,
    metadata: row.metadata ? JSON.parse(row.metadata) : null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

const oauthClientsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', fastify.authenticate);
  fastify.addHook('preHandler', async (request, reply) => {
    const role = request.user?.globalRole;
    if (!role || !SUPER_ROLES.includes(role)) {
      return reply.status(403).send({ success: false, error: { code: 'FORBIDDEN', message: 'Super-admin access required' } });
    }
  });

  // List all registered RPs (secrets never returned).
  fastify.get('/', async () => {
    const rows = await prisma.oauthApplication.findMany({ orderBy: { createdAt: 'desc' } });
    return { success: true, data: rows.map(safeView) };
  });

  // Register a new RP. Returns clientSecret plaintext ONCE.
  fastify.post('/', async (request, reply) => {
    const { name, redirectUrls, type = 'web', icon, metadata } = request.body || {};
    if (!name || typeof name !== 'string') {
      return reply.status(400).send({ success: false, error: { code: 'BAD_REQUEST', message: 'name is required' } });
    }
    if (!Array.isArray(redirectUrls) || redirectUrls.length === 0) {
      return reply.status(400).send({ success: false, error: { code: 'BAD_REQUEST', message: 'redirectUrls must be a non-empty array' } });
    }

    const clientId = generateClientId(name);
    const clientSecretPlain = generateClientSecret();
    const clientSecretHashed = await hashClientSecret(clientSecretPlain);

    const row = await prisma.oauthApplication.create({
      data: {
        name,
        icon: icon ?? null,
        clientId,
        clientSecret: clientSecretHashed,
        redirectUrls: redirectUrls.join(','),
        type,
        disabled: false,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    return {
      success: true,
      data: { ...safeView(row), clientSecret: clientSecretPlain },
      warning: 'Save the clientSecret now — it will not be shown again.',
    };
  });

  // Rotate the client secret. Returns new plaintext ONCE.
  fastify.post('/:clientId/rotate', async (request, reply) => {
    const { clientId } = request.params;
    const existing = await prisma.oauthApplication.findUnique({ where: { clientId } });
    if (!existing) {
      return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Client not found' } });
    }

    const newSecretPlain = generateClientSecret();
    const newSecretHashed = await hashClientSecret(newSecretPlain);

    const row = await prisma.oauthApplication.update({
      where: { clientId },
      data: { clientSecret: newSecretHashed },
    });

    return {
      success: true,
      data: { ...safeView(row), clientSecret: newSecretPlain },
      warning: 'The previous clientSecret is now invalid. Save the new one — it will not be shown again.',
    };
  });

  // Disable / enable. Tokens already issued continue to work until they expire;
  // new authorization requests are rejected.
  fastify.post('/:clientId/disable', async (request, reply) => {
    const { clientId } = request.params;
    const row = await prisma.oauthApplication.update({ where: { clientId }, data: { disabled: true } });
    return { success: true, data: safeView(row) };
  });
  fastify.post('/:clientId/enable', async (request, reply) => {
    const { clientId } = request.params;
    const row = await prisma.oauthApplication.update({ where: { clientId }, data: { disabled: false } });
    return { success: true, data: safeView(row) };
  });

  // Hard delete. Cascades to access tokens and consents.
  fastify.delete('/:clientId', async (request) => {
    const { clientId } = request.params;
    await prisma.oauthApplication.delete({ where: { clientId } });
    return { success: true };
  });
};

export default oauthClientsRoutes;
