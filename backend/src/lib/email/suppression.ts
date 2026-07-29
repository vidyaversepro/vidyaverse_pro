/**
 * Suppression list — addresses that permanently failed and must not be mailed.
 *
 * Reputation is shared across the whole trio: Vidyaverse, PDLMS and DigiClassroom
 * send as the same domain, so repeatedly hammering a dead address here degrades
 * delivery for all three. Suppressing at send time is what keeps a bounce from
 * turning into a domain-wide deliverability problem.
 */
import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';
import { normaliseEmail as normalise } from './normalise.js';

export type SuppressionReason = 'hard_bounce' | 'complaint';

/** True when this address must not be mailed. Never throws — a lookup failure must not block a send. */
export async function isSuppressed(email: string): Promise<boolean> {
    try {
        const hit = await prisma.emailSuppression.findUnique({
            where: { email: normalise(email) },
            select: { id: true },
        });
        return hit !== null;
    } catch (err) {
        // Fail OPEN: a database blip should degrade to "send anyway" rather than
        // silently swallowing every email in the system.
        logger.error(`[email] suppression lookup failed for ${email}: ${(err as Error).message}`);
        return false;
    }
}

/** Record a permanent failure. Idempotent — providers retry webhooks. */
export async function suppress(opts: {
    email: string;
    reason: SuppressionReason;
    detail?: string;
    source?: string;
}): Promise<void> {
    const email = normalise(opts.email);
    const row = await prisma.emailSuppression.upsert({
        where: { email },
        create: {
            email,
            reason: opts.reason,
            detail: opts.detail ?? null,
            source: opts.source ?? 'resend',
        },
        // A complaint is worse news than a bounce, so let it overwrite; don't let a
        // later bounce downgrade a complaint.
        update:
            opts.reason === 'complaint'
                ? { reason: opts.reason, detail: opts.detail ?? null }
                : { detail: opts.detail ?? null },
        select: { reason: true },
    });
    // Log the reason actually held, not the one that arrived — a bounce landing on
    // an already-complained address leaves 'complaint' standing, and logging the
    // incoming value there would misreport the record's real state.
    logger.warn(`[email] suppressed ${email} (${row.reason})`);
}

/**
 * Remove an address from the list. Needed for genuine false positives — a
 * typo'd domain that later becomes valid, or a user who resubscribes — and for
 * support to unblock an account without a database console.
 */
export async function unsuppress(email: string): Promise<boolean> {
    const { count } = await prisma.emailSuppression.deleteMany({
        where: { email: normalise(email) },
    });
    if (count > 0) logger.info(`[email] un-suppressed ${normalise(email)}`);
    return count > 0;
}
