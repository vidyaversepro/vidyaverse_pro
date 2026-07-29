/**
 * The resolved-capability contract served to relying parties.
 *
 * The hub returns RESOLVED capabilities, never raw subscriptions. If each app had to
 * combine subscriptions itself, three apps implementing the union rule would produce
 * three subtly different answers — and the failure mode is silent, since nobody
 * reports a feature they were wrongly given.
 */

/** Products in the trio. Mirrors the AppKey enum in the entitlements schema. */
export type AppKey = 'vidyaverse' | 'pdlms' | 'digiclassroom';

/**
 * Tiers, weakest first. Order is meaningful — `maxTier` compares by index — so this
 * array must stay append-only and in step with the Tier enum in the schema.
 */
export const TIER_ORDER = ['free', 'basic', 'premium', 'enterprise'] as const;
export type Tier = (typeof TIER_ORDER)[number];

/** Effective access state, after expiry and grace have been applied to the clock. */
export type CapabilityStatus = 'active' | 'grace' | 'none';

export type SubjectKind = 'user' | 'institution';

/** One subscription, as the resolver needs to see it. */
export interface SubscriptionInput {
    id: string;
    subjectKind: SubjectKind;
    subjectId: string;
    app: AppKey;
    tier: Tier;
    /** Stored status. A row marked `active` can still be past its expiry — the
     *  resolver decides from the clock, not from this field alone. */
    status: 'active' | 'grace' | 'expired' | 'cancelled' | 'suspended';
    expiresAt: Date | null;
    graceUntil: Date | null;
    featureGrants: string[];
    featureRevokes: string[];
    source: string;
}

/** Why the user has what they have — surfaced for support and billing attribution. */
export interface CapabilitySource {
    subscriptionId: string;
    subjectKind: SubjectKind;
    subjectId: string;
    tier: Tier;
    status: Exclude<CapabilityStatus, 'none'>;
    expiresAt: Date | null;
    graceUntil: Date | null;
    source: string;
}

/** What an RP receives. Stable shape — RPs cache it. */
export interface ResolvedCapabilities {
    userId: string;
    app: AppKey;
    /** Highest tier across all contributing sources. */
    tier: Tier;
    /** Union of every contributing source's capabilities, sorted for stable output. */
    features: string[];
    status: CapabilityStatus;
    /**
     * When access lapses if nothing is renewed — the LATEST expiry among contributing
     * sources. Null means perpetual (a comped or internal grant).
     */
    expiresAt: Date | null;
    /** End of the grace window, when status is `grace`. */
    graceUntil: Date | null;
    /**
     * Billing attribution only. NEVER use this to compute access — that is what the
     * union rule exists to prevent.
     */
    sources: CapabilitySource[];
    /** When this answer was computed. Lets an RP reason about staleness. */
    resolvedAt: Date;
}
