/**
 * Outbound invalidation webhooks to the relying parties.
 *
 * Each RP caches the capability answers it fetches. The 5-minute TTL is the backstop
 * that guarantees eventual correctness; this is what makes the common cases feel
 * instant — a purchase visible immediately rather than after a coffee.
 *
 * Deliberately best-effort. A failed webhook degrades to "the RP notices within five
 * minutes", which is exactly the behaviour we would have without it, so a dispatch
 * failure must never fail the operation that triggered it. That is also why there is
 * no retry queue: the TTL already is the retry.
 *
 * Signed with HMAC-SHA256 over `${timestamp}.${body}` — the timestamp is inside the
 * signed material so a captured request cannot be replayed later.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '../../../config/env.js';
import { logger } from '../../../utils/logger.js';
import type { AppKey } from './types.js';

/** Where each relying party listens. Unset apps are simply not notified. */
function endpointFor(app: AppKey): string | null {
    const origin =
        app === 'pdlms' ? env.PDLMS_ORIGIN : app === 'digiclassroom' ? env.DCP_ORIGIN : null;
    if (!origin) return null;
    return `${origin.replace(/\/$/, '')}/api/internal/entitlements/invalidate`;
}

export interface InvalidationEvent {
    /** Users whose cached capabilities are now wrong. */
    userIds: string[];
    /** Narrow the invalidation when only one app is affected. */
    app?: AppKey;
    /** For the RP's logs: 'subscription.created', 'membership.revoked', … */
    reason: string;
}

/** Sign a webhook body. Exported so the RP-side verifier can be tested against it. */
export function signPayload(body: string, timestamp: string, secret: string): string {
    return createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex');
}

/**
 * Verify an inbound signature. Lives here so the signing and checking rules cannot
 * drift apart; relying parties should implement the same three lines.
 */
export function verifySignature(args: {
    body: string;
    timestamp: string | undefined;
    signature: string | undefined;
    secret: string;
    toleranceSeconds?: number;
}): boolean {
    const { body, timestamp, signature, secret } = args;
    if (!timestamp || !signature) return false;

    const ts = Number(timestamp);
    if (!Number.isFinite(ts)) return false;
    if (Math.abs(Date.now() / 1000 - ts) > (args.toleranceSeconds ?? 300)) return false;

    const expected = signPayload(body, timestamp, secret);
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Notify the relying parties. Never throws.
 *
 * @returns how many endpoints accepted the notification.
 */
export async function dispatchInvalidation(event: InvalidationEvent): Promise<number> {
    const secret = env.ENTITLEMENTS_WEBHOOK_SECRET;
    if (!secret) {
        // Unsigned invalidation would let anyone flush another user's cache, so with
        // no secret configured we simply rely on the TTL.
        return 0;
    }
    if (event.userIds.length === 0) return 0;

    const targets: AppKey[] = event.app ? [event.app] : ['pdlms', 'digiclassroom'];
    const body = JSON.stringify(event);
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = signPayload(body, timestamp, secret);

    const results = await Promise.allSettled(
        targets.map(async (app) => {
            const url = endpointFor(app);
            if (!url) return false;

            // Short timeout: this runs inside a request the user is waiting on, and
            // an unreachable RP must not hold it open.
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 3000);
            try {
                const res = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                        'x-entitlements-timestamp': timestamp,
                        'x-entitlements-signature': signature,
                    },
                    body,
                    signal: controller.signal,
                });
                if (!res.ok) {
                    logger.warn(`[entitlements] invalidation webhook to ${app} returned ${res.status}`);
                    return false;
                }
                return true;
            } catch (err) {
                logger.warn(
                    `[entitlements] invalidation webhook to ${app} failed (falling back to TTL): ${(err as Error).message}`,
                );
                return false;
            } finally {
                clearTimeout(timer);
            }
        }),
    );

    const delivered = results.filter((r) => r.status === 'fulfilled' && r.value).length;
    logger.info(
        `[entitlements] invalidation dispatched (${event.reason}): ${delivered}/${targets.length} endpoints, ${event.userIds.length} user(s)`,
    );
    return delivered;
}
