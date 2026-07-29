/**
 * Capability resolution rules.
 *
 * These are the rules that decide whether a paying user keeps what they paid for, so
 * they are tested directly rather than through the HTTP layer. Every case pins a
 * decision that would otherwise be silent when wrong — nobody reports a feature they
 * were given but should not have been.
 */
import { describe, it, expect } from 'vitest';
import {
    effectiveStatus,
    maxTier,
    resolveCapabilities,
} from '../../src/modules/entitlements/capabilities/resolve.js';
import { capabilitiesForTier } from '../../src/modules/entitlements/capabilities/catalogue.js';
import type { SubscriptionInput, Tier } from '../../src/modules/entitlements/capabilities/types.js';

const NOW = new Date('2026-07-29T12:00:00.000Z');
const days = (n: number) => new Date(NOW.getTime() + n * 86_400_000);

function sub(over: Partial<SubscriptionInput> = {}): SubscriptionInput {
    return {
        id: over.id ?? 'sub-1',
        subjectKind: 'user',
        subjectId: 'user-1',
        app: 'pdlms',
        tier: 'premium',
        status: 'active',
        expiresAt: days(30),
        graceUntil: null,
        featureGrants: [],
        featureRevokes: [],
        source: 'test',
        ...over,
    };
}

const resolve = (subscriptions: SubscriptionInput[], now = NOW) =>
    resolveCapabilities({ userId: 'user-1', app: 'pdlms', subscriptions, now });

describe('maxTier', () => {
    it('picks the higher tier regardless of argument order', () => {
        expect(maxTier('free', 'premium')).toBe('premium');
        expect(maxTier('premium', 'free')).toBe('premium');
        expect(maxTier('enterprise', 'premium')).toBe('enterprise');
        expect(maxTier('basic', 'basic')).toBe('basic');
    });
});

describe('effectiveStatus', () => {
    it('is active before expiry', () => {
        expect(effectiveStatus(sub({ expiresAt: days(1) }), NOW)).toBe('active');
    });

    it('treats a null expiry as perpetual', () => {
        expect(effectiveStatus(sub({ expiresAt: null }), NOW)).toBe('active');
    });

    it('falls into grace after expiry but inside the window', () => {
        const s = sub({ expiresAt: days(-1), graceUntil: days(6) });
        expect(effectiveStatus(s, NOW)).toBe('grace');
    });

    it('is none once grace is exhausted', () => {
        const s = sub({ expiresAt: days(-10), graceUntil: days(-3) });
        expect(effectiveStatus(s, NOW)).toBe('none');
    });

    it('is none past expiry when no grace was granted', () => {
        expect(effectiveStatus(sub({ expiresAt: days(-1), graceUntil: null }), NOW)).toBe('none');
    });

    it('ignores a stale `active` row that the clock says has lapsed', () => {
        // A lapse sweep may not have run yet. Access must not depend on a background
        // job having caught up.
        const s = sub({ status: 'active', expiresAt: days(-5), graceUntil: null });
        expect(effectiveStatus(s, NOW)).toBe('none');
    });

    it('honours cancelled and suspended even when not yet expired', () => {
        expect(effectiveStatus(sub({ status: 'cancelled' }), NOW)).toBe('none');
        expect(effectiveStatus(sub({ status: 'suspended' }), NOW)).toBe('none');
    });
});

describe('resolveCapabilities', () => {
    it('grants the free tier with no subscriptions at all', () => {
        const r = resolve([]);
        expect(r.tier).toBe('free');
        expect(r.status).toBe('none');
        expect(r.features).toEqual([...capabilitiesForTier('pdlms', 'free')].sort());
        expect(r.sources).toHaveLength(0);
    });

    it('includes lower tiers cumulatively', () => {
        const r = resolve([sub({ tier: 'premium' })]);
        for (const cap of capabilitiesForTier('pdlms', 'basic')) {
            expect(r.features).toContain(cap);
        }
    });

    it('ignores subscriptions belonging to a different app', () => {
        const r = resolve([sub({ app: 'digiclassroom', tier: 'enterprise' })]);
        expect(r.tier).toBe('free');
        expect(r.sources).toHaveLength(0);
    });

    // ── the rule the whole design turns on ────────────────────────────────────
    it('takes the MAX tier across sources, never the institution', () => {
        const r = resolve([
            sub({ id: 'inst', subjectKind: 'institution', subjectId: 'inst-1', tier: 'basic' }),
            sub({ id: 'own', subjectKind: 'user', tier: 'premium' }),
        ]);
        expect(r.tier).toBe('premium');
    });

    it('a lower-tier institution cannot strip what the user paid for personally', () => {
        const personalOnly = capabilitiesForTier('pdlms', 'premium').filter(
            (c) => !capabilitiesForTier('pdlms', 'basic').includes(c),
        );
        const r = resolve([
            sub({ id: 'inst', subjectKind: 'institution', subjectId: 'inst-1', tier: 'basic' }),
            sub({ id: 'own', tier: 'premium' }),
        ]);
        for (const cap of personalOnly) expect(r.features).toContain(cap);
    });

    it('a revoke on one source does NOT strip a capability another source grants', () => {
        // Applying revokes globally would recreate the very bug the union rule exists
        // to prevent.
        const target = capabilitiesForTier('pdlms', 'premium').at(-1)!;
        const r = resolve([
            sub({ id: 'inst', subjectKind: 'institution', tier: 'premium', featureRevokes: [target] }),
            sub({ id: 'own', tier: 'premium' }),
        ]);
        expect(r.features).toContain(target);
    });

    it('applies a revoke within its own source', () => {
        const target = capabilitiesForTier('pdlms', 'premium').at(-1)!;
        const r = resolve([sub({ tier: 'premium', featureRevokes: [target] })]);
        expect(r.features).not.toContain(target);
    });

    it('honours an ad-hoc grant beyond the tier', () => {
        const r = resolve([sub({ tier: 'free', featureGrants: ['pilot.beta_reader'] })]);
        expect(r.features).toContain('pilot.beta_reader');
        expect(r.tier).toBe('free');
    });

    it('excludes expired sources from the union', () => {
        const r = resolve([sub({ id: 'dead', tier: 'enterprise', expiresAt: days(-30), graceUntil: days(-20) })]);
        expect(r.tier).toBe('free');
        expect(r.sources).toHaveLength(0);
    });

    // ── expiry / grace reporting ──────────────────────────────────────────────
    it('reports the LATEST expiry among active sources', () => {
        const r = resolve([
            sub({ id: 'a', expiresAt: days(10) }),
            sub({ id: 'b', expiresAt: days(45) }),
        ]);
        expect(r.expiresAt).toEqual(days(45));
    });

    it('reports perpetual access as null expiry even alongside a dated source', () => {
        // Regression: `null` means both "unseeded" and "perpetual". Ordering the
        // perpetual source FIRST is what exposes a naive accumulator.
        const r = resolve([
            sub({ id: 'perpetual', expiresAt: null }),
            sub({ id: 'dated', expiresAt: days(10) }),
        ]);
        expect(r.expiresAt).toBeNull();
    });

    it('reports perpetual access as null with the dated source first too', () => {
        const r = resolve([
            sub({ id: 'dated', expiresAt: days(10) }),
            sub({ id: 'perpetual', expiresAt: null }),
        ]);
        expect(r.expiresAt).toBeNull();
    });

    it('an active source outranks one merely in grace', () => {
        const r = resolve([
            sub({ id: 'lapsed', expiresAt: days(-1), graceUntil: days(6) }),
            sub({ id: 'current', expiresAt: days(20) }),
        ]);
        expect(r.status).toBe('active');
        expect(r.graceUntil).toBeNull();
    });

    it('reports grace, with its window, when every source has lapsed', () => {
        const r = resolve([
            sub({ id: 'a', expiresAt: days(-2), graceUntil: days(3) }),
            sub({ id: 'b', expiresAt: days(-1), graceUntil: days(5) }),
        ]);
        expect(r.status).toBe('grace');
        expect(r.graceUntil).toEqual(days(5));
        expect(r.expiresAt).toBeNull();
    });

    it('still grants capabilities while in grace', () => {
        const r = resolve([sub({ tier: 'premium', expiresAt: days(-1), graceUntil: days(6) })]);
        expect(r.tier).toBe('premium');
        expect(r.features).toContain(capabilitiesForTier('pdlms', 'premium').at(-1)!);
    });

    // ── output hygiene ────────────────────────────────────────────────────────
    it('returns features sorted and free of duplicates', () => {
        const r = resolve([sub({ id: 'a', tier: 'premium' }), sub({ id: 'b', tier: 'premium' })]);
        expect(r.features).toEqual([...r.features].sort());
        expect(new Set(r.features).size).toBe(r.features.length);
    });

    it('lists every contributing source for billing attribution', () => {
        const r = resolve([
            sub({ id: 'inst', subjectKind: 'institution', subjectId: 'inst-1', tier: 'basic' }),
            sub({ id: 'own', subjectKind: 'user', tier: 'premium' }),
        ]);
        expect(r.sources.map((s) => s.subscriptionId).sort()).toEqual(['inst', 'own']);
    });

    it.each(['free', 'basic', 'premium', 'enterprise'] as Tier[])(
        'never returns fewer capabilities than the free tier (%s)',
        (tier) => {
            const r = resolve([sub({ tier, featureRevokes: capabilitiesForTier('pdlms', 'enterprise') })]);
            // Even a source that revokes everything cannot take away the free tier,
            // because the free tier is seeded outside any subscription.
            for (const cap of capabilitiesForTier('pdlms', 'free')) {
                expect(r.features).toContain(cap);
            }
        },
    );
});
