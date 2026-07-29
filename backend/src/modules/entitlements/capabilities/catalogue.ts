/**
 * Which capabilities each tier grants, per app.
 *
 * Deliberately code rather than a database table: this is the definition of the
 * product, it changes at release cadence rather than at runtime, and keeping it here
 * means it is reviewed, diffable and unit-testable. Per-customer deviations belong on
 * the subscription row (`featureGrants` / `featureRevokes`), not here.
 *
 * Tiers are CUMULATIVE — each inherits everything below it — so a capability is
 * declared once, at the lowest tier that includes it.
 */
import { TIER_ORDER, type AppKey, type Tier } from './types.js';

/** Capabilities introduced at each tier, per app. Lower tiers are inherited. */
const TIER_CAPABILITIES: Record<AppKey, Record<Tier, readonly string[]>> = {
    vidyaverse: {
        free: ['saathi.feed', 'profile.manage', 'institution.join_request'],
        basic: ['visionarium.read', 'saathi.groups'],
        premium: ['visionarium.contribute', 'saathi.calls', 'analytics.personal'],
        enterprise: ['analytics.institution', 'api.access'],
    },
    pdlms: {
        free: ['catalog.browse', 'books.read_free', 'annotations.own'],
        basic: ['books.read_licensed', 'flashcards.create', 'reading.progress'],
        premium: ['audiobooks.listen', 'varta.ai_chat', 'ebook.offline'],
        enterprise: ['library.admin', 'analytics.institution'],
    },
    digiclassroom: {
        free: ['courses.browse', 'shabdkosh.lookup', 'sanchika.notes'],
        basic: ['courses.enrol', 'practest.attempt'],
        premium: ['virat_gyankosh.rag', 'practest.analytics', 'courses.certificates'],
        enterprise: ['classroom.admin', 'analytics.institution'],
    },
};

/**
 * Every capability a tier confers for an app, including inherited lower tiers.
 * Returns a fresh array so callers cannot mutate the catalogue.
 */
export function capabilitiesForTier(app: AppKey, tier: Tier): string[] {
    const perTier = TIER_CAPABILITIES[app];
    const upto = TIER_ORDER.indexOf(tier);
    const out: string[] = [];
    for (let i = 0; i <= upto; i++) {
        out.push(...perTier[TIER_ORDER[i]]);
    }
    return out;
}

/**
 * The capabilities available with no subscription at all. Every user gets these —
 * the trio's free tiers are a product commitment, not an absence of entitlement.
 */
export function freeCapabilities(app: AppKey): string[] {
    return capabilitiesForTier(app, 'free');
}

/** All known capability keys for an app — used to validate grants/revokes at write time. */
export function knownCapabilities(app: AppKey): Set<string> {
    return new Set(capabilitiesForTier(app, TIER_ORDER[TIER_ORDER.length - 1]));
}
