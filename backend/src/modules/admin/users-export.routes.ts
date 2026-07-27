// @ts-nocheck
/**
 * Reconciliation source for federation rollout (Phase 3).
 *
 * Returns a paginated stream of Vidyaverse users with the minimum payload
 * RPs (PDLMS, DCP) need to match their local users against. Consumed by
 * `scripts/reconcile-with-vidyaverse.ts` on each RP.
 *
 * Super-admin only. Cursor pagination by user id (lexicographically ordered).
 */
import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../../config/database.js';

const SUPER_ROLES = ['super_admin', 'admin'];

const usersExportRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', fastify.authenticate);
  fastify.addHook('preHandler', async (request, reply) => {
    const role = request.user?.globalRole;
    if (!role || !SUPER_ROLES.includes(role)) {
      return reply.status(403).send({ success: false, error: { code: 'FORBIDDEN', message: 'Super-admin access required' } });
    }
  });

  fastify.get('/', async (request) => {
    const { cursor, limit: limitRaw } = (request.query || {});
    const limit = Math.min(Math.max(parseInt(limitRaw, 10) || 500, 1), 1000);

    const users = await prisma.user.findMany({
      take: limit + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: 'asc' },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        alternateEmails: true,
        institutionRoles: {
          select: {
            institutionId: true,
            role: true,
            institution: { select: { code: true, name: true } },
          },
        },
      },
    });

    const hasMore = users.length > limit;
    const page = hasMore ? users.slice(0, limit) : users;

    return {
      success: true,
      data: page.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        emailVerified: u.emailVerified,
        alternateEmails: (u.alternateEmails as string[] | null) ?? [],
        memberships: u.institutionRoles.map((r) => ({
          institutionId: r.institutionId,
          institutionCode: r.institution.code,
          institutionName: r.institution.name,
          role: r.role,
        })),
      })),
      nextCursor: hasMore ? page[page.length - 1].id : null,
    };
  });
};

export default usersExportRoutes;
