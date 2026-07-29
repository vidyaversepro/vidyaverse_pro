/**
 * Pure capability resolution. No I/O, no clock of its own — `now` is always passed
 * in, so every rule here is directly testable.
 *
 * The rule the whole design turns on: **access is the UNION of all active sources,
 * taking the MAX tier per app.** It is never a hierarchy. If an institution's
 * subscription took precedence over a personal one, an institution on a lower tier
 * would strip features a student had paid for themselves.
 */
import { capabilitiesForTier, freeCapabilities } from './catalogue.js';
import {
    TIER_ORDER,
    type AppKey,
    type CapabilitySource,
    type CapabilityStatus,
    type ResolvedCapabilities,
    type SubscriptionInput,
    type Tier,
} from './types.js';

/** Higher of two tiers, by declaration order. */
export function maxTier(a: Tier, b: Tier): Tier {
    return TIER_ORDER.indexOf(a) >= TIER_ORDER.indexOf(b) ? a : b;
}

/**
 * Effective state of one subscription at `now`.
 *
 * Stored status is authoritative for the states a human or a payment event sets
 * (`cancelled`, `suspended`), but `active` is checked against the clock: a row can
 * sit marked active long after it lapsed if no sweep has run yet, and access must
 * not depend on a background job having caught up.
 */
export function effectiveStatus(sub: SubscriptionInput, now: Date): CapabilityStatus {
    if (sub.status === 'cancelled' || sub.status === 'suspended') return 'none';

    // No expiry means perpetual — comped and internal grants.
    if (sub.expiresAt === null) return sub.status === 'expired' ? 'none' : 'active';

    if (now < sub.expiresAt) return 'active';

    // Past expiry: inside the grace window access continues, so a payment blip does
    // not lock a paying customer out mid-term.
    if (sub.graceUntil !== null && now < sub.graceUntil) return 'grace';

    return 'none';
}

/**
 * Capabilities a single subscription contributes.
 *
 * Revokes are applied WITHIN the subscription, not across the whole result. Applying
 * them globally would let a revoke on one source strip a capability another source
 * legitimately grants — reintroducing exactly the "institution overrides personal"
 * bug the union rule exists to prevent.
 */
function contribution(sub: SubscriptionInput, app: AppKey): Set<string> {
    const set = new Set<string>(capabilitiesForTier(app, sub.tier));
    for (const g of sub.featureGrants) set.add(g);
    for (const r of sub.featureRevokes) set.delete(r);
    return set;
}

/**
 * Resolve one user's capabilities for one app.
 *
 * `subscriptions` must already be scoped to this app and to subjects the user is
 * entitled through — their own, plus institutions where they hold an ACTIVE
 * membership. Filtering membership here would require identity data this module
 * deliberately does not hold.
 */
export function resolveCapabilities(args: {
    userId: string;
    app: AppKey;
    subscriptions: readonly SubscriptionInput[];
    now: Date;
}): ResolvedCapabilities {
    const { userId, app, subscriptions, now } = args;

    // Everyone gets the free tier — it is a product commitment, not a fallback.
    const features = new Set<string>(freeCapabilities(app));
    let tier: Tier = 'free';
    let status: CapabilityStatus = 'none';
    let expiresAt: Date | null = null;
    let graceUntil: Date | null = null;
    const sources: CapabilitySource[] = [];

    let sawActive = false;
    let sawGrace = false;
    // `null` is overloaded — it means both "nothing seen yet" and "perpetual" — so
    // perpetuity is tracked separately rather than inferred from a null date.
    let hasPerpetualActive = false;

    for (const sub of subscriptions) {
        if (sub.app !== app) continue;

        const state = effectiveStatus(sub, now);
        if (state === 'none') continue;

        for (const cap of contribution(sub, app)) features.add(cap);
        tier = maxTier(tier, sub.tier);

        if (state === 'active') {
            sawActive = true;
            // Latest expiry across active sources: when access actually lapses.
            if (sub.expiresAt === null) {
                hasPerpetualActive = true;
            } else if (expiresAt === null || sub.expiresAt > expiresAt) {
                expiresAt = sub.expiresAt;
            }
        } else {
            sawGrace = true;
            // Unlike expiry, a grace window is never perpetual — `effectiveStatus`
            // only returns 'grace' when graceUntil is a real date — so null here
            // means "nothing seen yet" and never "no limit".
            if (sub.graceUntil !== null && (graceUntil === null || sub.graceUntil > graceUntil)) {
                graceUntil = sub.graceUntil;
            }
        }

        sources.push({
            subscriptionId: sub.id,
            subjectKind: sub.subjectKind,
            subjectId: sub.subjectId,
            tier: sub.tier,
            status: state,
            expiresAt: sub.expiresAt,
            graceUntil: sub.graceUntil,
            source: sub.source,
        });
    }

    // An active source outranks one merely in grace: if anything is genuinely paid
    // and current, the user is not in a dunning state.
    status = sawActive ? 'active' : sawGrace ? 'grace' : 'none';

    return {
        userId,
        app,
        tier,
        features: [...features].sort(),
        status,
        // A perpetual active source means access never lapses, whatever dated
        // sources sit alongside it.
        expiresAt: sawActive ? (hasPerpetualActive ? null : expiresAt) : null,
        graceUntil: sawActive ? null : sawGrace ? graceUntil : null,
        sources,
        resolvedAt: now,
    };
}
