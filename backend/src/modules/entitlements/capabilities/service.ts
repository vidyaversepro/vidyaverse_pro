/**
 * Capability service — the read path relying parties depend on.
 *
 * Availability policy, which is the part worth being explicit about:
 *
 *   fresh   (< 5 min)   serve from cache
 *   stale   (< 30 min)  serve from cache AND refresh in the background
 *   beyond  (> 30 min)  fail closed
 *
 * Serving stale indefinitely would mean a hub outage silently granting access
 * forever; failing closed the instant the hub hiccups would lock paying users out of
 * a book mid-sentence. The ceiling is the compromise: brief outages are invisible,
 * sustained ones stop granting access.
 *
 * Suspension is the deliberate exception — it is checked at session validation, not
 * here, so it takes effect immediately rather than within the cache TTL.
 */
import { cache } from '../../../config/redis.js';
import { logger } from '../../../utils/logger.js';
import { entitlementsDb } from './client.js';
import { resolveCapabilities } from './resolve.js';
import { dispatchInvalidation } from './webhook-dispatch.js';
import type {
    AppKey,
    ResolvedCapabilities,
    SubjectKind,
    SubscriptionInput,
    Tier,
} from './types.js';

/** Serve from cache without hitting Postgres for this long. */
export const FRESH_TTL_SECONDS = 5 * 60;
/** Beyond this, a cached answer is no longer safe to serve and we fail closed. */
export const STALE_CEILING_SECONDS = 30 * 60;
/** Redis key. Per user AND app, so invalidating one app does not evict the others. */
export const cacheKey = (userId: string, app: AppKey) => `ent:${userId}:${app}`;

interface CacheEnvelope {
    /** Epoch millis when this answer was computed — freshness is derived, not assumed. */
    cachedAt: number;
    /** Dates are strings after a JSON round-trip; revived on read. */
    payload: SerialisedCapabilities;
}

type SerialisedCapabilities = Omit<
    ResolvedCapabilities,
    'expiresAt' | 'graceUntil' | 'resolvedAt' | 'sources'
> & {
    expiresAt: string | null;
    graceUntil: string | null;
    resolvedAt: string;
    sources: Array<
        Omit<ResolvedCapabilities['sources'][number], 'expiresAt' | 'graceUntil'> & {
            expiresAt: string | null;
            graceUntil: string | null;
        }
    >;
};

const toDate = (v: string | null): Date | null => (v === null ? null : new Date(v));

function revive(p: SerialisedCapabilities): ResolvedCapabilities {
    return {
        ...p,
        expiresAt: toDate(p.expiresAt),
        graceUntil: toDate(p.graceUntil),
        resolvedAt: new Date(p.resolvedAt),
        sources: p.sources.map((s) => ({
            ...s,
            expiresAt: toDate(s.expiresAt),
            graceUntil: toDate(s.graceUntil),
        })),
    };
}

/**
 * Every subscription that could entitle this user for this app: their own, plus any
 * institution where they hold an ACTIVE membership.
 */
async function loadSubscriptions(userId: string, app: AppKey): Promise<SubscriptionInput[]> {
    const db = entitlementsDb();

    const memberships = await db.institutionMembership.findMany({
        where: { userId, active: true },
        select: { institutionId: true },
    });
    const institutionIds = memberships.map((m) => m.institutionId);

    const rows = await db.subscription.findMany({
        where: {
            app,
            OR: [
                { subjectKind: 'user', subjectId: userId },
                ...(institutionIds.length > 0
                    ? [{ subjectKind: 'institution' as const, subjectId: { in: institutionIds } }]
                    : []),
            ],
            // Terminal states can never contribute, so keep them out of the hot path.
            status: { notIn: ['cancelled', 'suspended'] },
        },
    });

    return rows.map((r) => ({
        id: r.id,
        subjectKind: r.subjectKind as SubjectKind,
        subjectId: r.subjectId,
        app: r.app as AppKey,
        tier: r.tier as Tier,
        status: r.status as SubscriptionInput['status'],
        expiresAt: r.expiresAt,
        graceUntil: r.graceUntil,
        featureGrants: r.featureGrants,
        featureRevokes: r.featureRevokes,
        source: r.source,
    }));
}

/** Resolve straight from Postgres, bypassing the cache, and repopulate it. */
export async function resolveFromSource(
    userId: string,
    app: AppKey,
    now = new Date(),
): Promise<ResolvedCapabilities> {
    const subscriptions = await loadSubscriptions(userId, app);
    const resolved = resolveCapabilities({ userId, app, subscriptions, now });

    const envelope: CacheEnvelope = {
        cachedAt: now.getTime(),
        payload: resolved as unknown as SerialisedCapabilities,
    };
    // Held for the full stale ceiling, not just the fresh TTL — the whole point of
    // stale-while-revalidate is that the entry outlives its freshness.
    await cache.set(cacheKey(userId, app), envelope, STALE_CEILING_SECONDS);

    return resolved;
}

export class CapabilitiesUnavailableError extends Error {
    readonly statusCode = 503;
    constructor(message = 'Entitlements are temporarily unavailable. Please try again shortly.') {
        super(message);
        this.name = 'CapabilitiesUnavailableError';
    }
}

/**
 * Resolve capabilities, honouring the cache policy above.
 *
 * @throws CapabilitiesUnavailableError when the source is unreachable and no cached
 *         answer is young enough to serve.
 */
export async function getCapabilities(
    userId: string,
    app: AppKey,
    now = new Date(),
): Promise<ResolvedCapabilities> {
    const key = cacheKey(userId, app);
    const cached = await cache.get<CacheEnvelope>(key);
    const ageSeconds = cached ? (now.getTime() - cached.cachedAt) / 1000 : Infinity;

    if (cached && ageSeconds < FRESH_TTL_SECONDS) {
        return revive(cached.payload);
    }

    try {
        return await resolveFromSource(userId, app, now);
    } catch (err) {
        const reason = (err as Error).message;

        if (cached && ageSeconds < STALE_CEILING_SECONDS) {
            logger.warn(
                `[entitlements] source unreachable, serving stale for ${userId}/${app} (age ${Math.round(ageSeconds)}s): ${reason}`,
            );
            return revive(cached.payload);
        }

        logger.error(
            `[entitlements] source unreachable and no usable cache for ${userId}/${app} — failing closed: ${reason}`,
        );
        throw new CapabilitiesUnavailableError();
    }
}

/**
 * Drop a user's cached answer so the next read re-resolves.
 *
 * Called on the active path — membership approved or revoked, subscription changed,
 * account suspended — which is what makes those changes near-instant instead of
 * waiting out the TTL.
 */
export async function invalidate(
    userId: string,
    app?: AppKey,
    options: { reason?: string; notifyRelyingParties?: boolean } = {},
): Promise<void> {
    if (app) {
        await cache.del(cacheKey(userId, app));
    } else {
        await cache.delPattern(`ent:${userId}:*`);
    }
    logger.info(`[entitlements] invalidated cache for ${userId}${app ? `/${app}` : ' (all apps)'}`);

    // The RPs hold their own caches. Told now, they are correct immediately; not
    // told, they are correct within their TTL — so this is best-effort by design and
    // never awaited into the caller's failure path.
    if (options.notifyRelyingParties !== false) {
        void dispatchInvalidation({
            userIds: [userId],
            app,
            reason: options.reason ?? 'capabilities.changed',
        });
    }
}

/**
 * Invalidate every member of an institution. Used when an institution's subscription
 * changes, which alters entitlements for everyone inside it.
 */
export async function invalidateInstitution(institutionId: string): Promise<number> {
    const members = await entitlementsDb().institutionMembership.findMany({
        where: { institutionId, active: true },
        select: { userId: true },
    });

    // Clear locally per member, but notify the RPs ONCE with the whole batch — a
    // large institution would otherwise mean thousands of individual webhooks.
    await Promise.all(
        members.map((m) => invalidate(m.userId, undefined, { notifyRelyingParties: false })),
    );

    if (members.length > 0) {
        void dispatchInvalidation({
            userIds: members.map((m) => m.userId),
            reason: 'institution.subscription.changed',
        });
    }

    return members.length;
}
