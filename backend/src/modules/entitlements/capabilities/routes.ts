/**
 * Capability API — what relying parties call.
 *
 * This is the endpoint advertised as `entitlements_url` in the id_token. Identity and
 * memberships travel in the token because they are stable; capabilities deliberately
 * do NOT, because a token cannot be revoked and entitlements must be able to change
 * within minutes of a cancellation.
 */
import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { CapabilitiesUnavailableError, getCapabilities, invalidate } from './service.js';
import { authenticateSessionOrToken } from './bearer-auth.js';
import { TIER_ORDER, type AppKey } from './types.js';

const APP_KEYS = ['vidyaverse', 'pdlms', 'digiclassroom'] as const;

const querySchema = z.object({
    app: z.enum(APP_KEYS),
});

const capabilitiesRoutes: FastifyPluginAsync = async (fastify) => {
    // Session cookie OR OIDC access token. Relying parties call this server-side and
    // hold a token, not a hub session — see bearer-auth.ts.
    fastify.addHook('onRequest', authenticateSessionOrToken);

    /**
     * Resolved capabilities for the signed-in user.
     *
     * Scoped to the caller's own session on purpose — there is no `userId` parameter.
     * An RP asking "what may THIS user do" always has that user's session; letting it
     * ask about arbitrary users would turn a read endpoint into an enumeration one.
     */
    fastify.get('/capabilities', async (request, reply) => {
        const parsed = querySchema.safeParse(request.query);
        if (!parsed.success) {
            return reply.status(400).send({
                success: false,
                error: `query parameter 'app' must be one of: ${APP_KEYS.join(', ')}`,
            });
        }

        const userId = request.user?.userId;
        if (!userId) {
            return reply.status(401).send({ success: false, error: 'Not authenticated' });
        }

        try {
            const capabilities = await getCapabilities(userId, parsed.data.app as AppKey);
            return reply.send({ success: true, data: capabilities });
        } catch (err) {
            if (err instanceof CapabilitiesUnavailableError) {
                // 503 + Retry-After, not 403: the user may well be entitled — we just
                // cannot currently prove it. An RP must not treat this as "denied" and
                // downgrade the account.
                return reply.status(503).header('retry-after', '30').send({
                    success: false,
                    error: err.message,
                    code: 'ENTITLEMENTS_UNAVAILABLE',
                });
            }
            throw err;
        }
    });

    /**
     * Force a re-resolve for the signed-in user. Useful straight after a purchase, so
     * the buyer does not wait out the cache TTL to see what they just bought.
     */
    fastify.post('/capabilities/refresh', async (request, reply) => {
        const userId = request.user?.userId;
        if (!userId) {
            return reply.status(401).send({ success: false, error: 'Not authenticated' });
        }
        await invalidate(userId);
        return reply.send({ success: true });
    });

    /** The capability vocabulary, so clients can render tier comparisons. */
    fastify.get('/capabilities/tiers', async (_request, reply) => {
        return reply.send({ success: true, data: { tiers: TIER_ORDER, apps: APP_KEYS } });
    });
};

export default capabilitiesRoutes;
