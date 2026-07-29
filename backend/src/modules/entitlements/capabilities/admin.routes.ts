/**
 * Subscription administration.
 *
 * Purchases route through Vidyaverse by product design, so this is where a
 * subscription is actually created — whether by a payment webhook, a sales-led
 * enterprise deal, or support granting a comp. Without it the only way to create one
 * is raw SQL against the entitlements database.
 *
 * Super-admin only. A subscription is money and access; nothing below that role
 * should be able to mint one.
 */
import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { logger } from '../../../utils/logger.js';
import { entitlementsDb } from './client.js';
import { knownCapabilities } from './catalogue.js';
import { invalidate, invalidateInstitution, resolveFromSource } from './service.js';
import { syncInstitutionMemberships, syncUserMemberships } from './membership-sync.js';
import { TIER_ORDER, type AppKey } from './types.js';

const SUPER_ROLES = ['super_admin', 'admin'];

const APP_KEYS = ['vidyaverse', 'pdlms', 'digiclassroom'] as const;
const SUBJECT_KINDS = ['user', 'institution'] as const;
const STATUSES = ['active', 'grace', 'expired', 'cancelled', 'suspended'] as const;

const createSchema = z.object({
    subjectKind: z.enum(SUBJECT_KINDS),
    subjectId: z.string().min(1).max(64),
    app: z.enum(APP_KEYS),
    tier: z.enum(TIER_ORDER),
    expiresAt: z.coerce.date().nullable().optional(),
    graceUntil: z.coerce.date().nullable().optional(),
    featureGrants: z.array(z.string()).default([]),
    featureRevokes: z.array(z.string()).default([]),
    source: z.string().max(64).default('manual'),
    externalRef: z.string().max(255).nullable().optional(),
    notes: z.string().nullable().optional(),
});

const updateSchema = createSchema
    .partial()
    .omit({ subjectKind: true, subjectId: true, app: true })
    .extend({ status: z.enum(STATUSES).optional() });

/**
 * Grants and revokes are free-text in the database so a pilot capability can be
 * granted before it exists in the catalogue — but a typo there silently grants
 * nothing, so unknown keys are surfaced as a warning rather than accepted in silence.
 */
function unknownKeys(app: AppKey, keys: string[]): string[] {
    const known = knownCapabilities(app);
    return keys.filter((k) => !known.has(k));
}

const adminSubscriptionRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.addHook('onRequest', fastify.authenticate);

    /** List subscriptions for one subject. */
    fastify.get('/subscriptions', {
        preHandler: [fastify.requireRole(SUPER_ROLES)],
        handler: async (request, reply) => {
            const q = z
                .object({
                    subjectKind: z.enum(SUBJECT_KINDS).optional(),
                    subjectId: z.string().optional(),
                    app: z.enum(APP_KEYS).optional(),
                })
                .safeParse(request.query);
            if (!q.success) {
                return reply.status(400).send({ success: false, error: 'invalid query' });
            }
            const rows = await entitlementsDb().subscription.findMany({
                where: {
                    ...(q.data.subjectKind ? { subjectKind: q.data.subjectKind } : {}),
                    ...(q.data.subjectId ? { subjectId: q.data.subjectId } : {}),
                    ...(q.data.app ? { app: q.data.app } : {}),
                },
                orderBy: { createdAt: 'desc' },
                take: 200,
            });
            return reply.send({ success: true, data: rows });
        },
    });

    /** Create a subscription. */
    fastify.post('/subscriptions', {
        preHandler: [fastify.requireRole(SUPER_ROLES)],
        handler: async (request, reply) => {
            const parsed = createSchema.safeParse(request.body);
            if (!parsed.success) {
                return reply
                    .status(400)
                    .send({ success: false, error: parsed.error.flatten() });
            }
            const input = parsed.data;

            const unknown = [
                ...unknownKeys(input.app, input.featureGrants),
                ...unknownKeys(input.app, input.featureRevokes),
            ];

            const created = await entitlementsDb().subscription.create({
                data: {
                    subjectKind: input.subjectKind,
                    subjectId: input.subjectId,
                    app: input.app,
                    tier: input.tier,
                    expiresAt: input.expiresAt ?? null,
                    graceUntil: input.graceUntil ?? null,
                    featureGrants: input.featureGrants,
                    featureRevokes: input.featureRevokes,
                    source: input.source,
                    externalRef: input.externalRef ?? null,
                    notes: input.notes ?? null,
                },
            });

            // A new subscription changes access immediately — do not make the buyer
            // wait out the cache TTL to receive what they just paid for.
            const affected = await invalidateForSubject(input.subjectKind, input.subjectId);

            logger.info(
                `[entitlements] subscription created ${created.id} (${input.subjectKind}:${input.subjectId} ${input.app}/${input.tier}) by ${request.user?.userId}`,
            );

            return reply.status(201).send({
                success: true,
                data: created,
                meta: { cachesInvalidated: affected, unknownCapabilityKeys: unknown },
            });
        },
    });

    /** Update a subscription — tier change, renewal, cancellation. */
    fastify.patch('/subscriptions/:id', {
        preHandler: [fastify.requireRole(SUPER_ROLES)],
        handler: async (request, reply) => {
            const { id } = request.params as { id: string };
            const parsed = updateSchema.safeParse(request.body);
            if (!parsed.success) {
                return reply.status(400).send({ success: false, error: parsed.error.flatten() });
            }

            const existing = await entitlementsDb().subscription.findUnique({ where: { id } });
            if (!existing) {
                return reply.status(404).send({ success: false, error: 'Subscription not found' });
            }

            const updated = await entitlementsDb().subscription.update({
                where: { id },
                data: parsed.data,
            });

            const affected = await invalidateForSubject(
                existing.subjectKind as (typeof SUBJECT_KINDS)[number],
                existing.subjectId,
            );

            logger.info(
                `[entitlements] subscription ${id} updated by ${request.user?.userId}`,
            );

            return reply.send({ success: true, data: updated, meta: { cachesInvalidated: affected } });
        },
    });

    /**
     * Preview what a subject currently resolves to, bypassing the cache.
     * Support needs to answer "why can this user not see X" without waiting for a TTL.
     */
    fastify.get('/subscriptions/preview', {
        preHandler: [fastify.requireRole(SUPER_ROLES)],
        handler: async (request, reply) => {
            const q = z
                .object({ userId: z.string().min(1), app: z.enum(APP_KEYS) })
                .safeParse(request.query);
            if (!q.success) {
                return reply.status(400).send({ success: false, error: 'userId and app are required' });
            }
            const data = await resolveFromSource(q.data.userId, q.data.app as AppKey);
            return reply.send({ success: true, data });
        },
    });

    /** Force a membership re-mirror. The login path does this too; this is for support. */
    fastify.post('/memberships/sync', {
        preHandler: [fastify.requireRole(SUPER_ROLES)],
        handler: async (request, reply) => {
            const b = z
                .object({ userId: z.string().optional(), institutionId: z.string().optional() })
                .safeParse(request.body);
            if (!b.success || (!b.data.userId && !b.data.institutionId)) {
                return reply
                    .status(400)
                    .send({ success: false, error: 'one of userId or institutionId is required' });
            }
            const data = b.data.userId
                ? await syncUserMemberships(b.data.userId)
                : { members: await syncInstitutionMemberships(b.data.institutionId as string) };
            return reply.send({ success: true, data });
        },
    });
};

/** A user subscription touches one cache; an institution's touches every member's. */
async function invalidateForSubject(
    subjectKind: (typeof SUBJECT_KINDS)[number],
    subjectId: string,
): Promise<number> {
    if (subjectKind === 'user') {
        await invalidate(subjectId);
        return 1;
    }
    return invalidateInstitution(subjectId);
}

export default adminSubscriptionRoutes;
