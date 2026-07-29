/**
 * Mirrors Vidyaverse's memberships into the entitlements database.
 *
 * Capability resolution needs to know which institutions a user belongs to, so an
 * institution's subscription can fan out to its members. That fact lives in
 * `user_institution_roles` in the MySQL ERP database — which the entitlements schema
 * deliberately cannot join to, because it keeps no foreign keys into the ERP tables
 * and must stay extractable into its own service.
 *
 * So it is mirrored instead. Resolution then stays a single-database read on the hot
 * path, and the mirror is refreshed from two directions:
 *
 *   - **on membership change** (approval, revocation, role change) — authoritative
 *     and immediate;
 *   - **at login** — self-healing, so a missed event cannot leave a user permanently
 *     unable to see the institution access they are paying for.
 *
 * Revoked memberships are marked inactive rather than deleted, so a re-admitted
 * student keeps their history.
 */
import { prisma } from '../../../config/database.js';
import { logger } from '../../../utils/logger.js';
import { entitlementsDb, isEntitlementsConfigured } from './client.js';
import { invalidate } from './service.js';

export interface MembershipSyncResult {
    userId: string;
    activated: number;
    deactivated: number;
    unchanged: number;
}

/**
 * Reconcile one user's memberships against the ERP database.
 *
 * Never throws: this runs on the login path, and a mirror that is briefly out of date
 * is a far better failure than a user who cannot sign in. Errors are logged and the
 * caller continues.
 */
export async function syncUserMemberships(userId: string): Promise<MembershipSyncResult | null> {
    if (!isEntitlementsConfigured()) return null;

    const empty: MembershipSyncResult = { userId, activated: 0, deactivated: 0, unchanged: 0 };

    try {
        const db = entitlementsDb();

        const [current, mirrored] = await Promise.all([
            prisma.userInstitutionRole.findMany({
                where: { userId },
                select: { institutionId: true },
            }),
            db.institutionMembership.findMany({
                where: { userId },
                select: { institutionId: true, active: true },
            }),
        ]);

        const currentIds = new Set(current.map((m) => m.institutionId));
        const mirroredById = new Map(mirrored.map((m) => [m.institutionId, m.active]));

        const toActivate = [...currentIds].filter((id) => mirroredById.get(id) !== true);
        const toDeactivate = [...mirroredById.entries()]
            .filter(([id, active]) => active && !currentIds.has(id))
            .map(([id]) => id);

        if (toActivate.length === 0 && toDeactivate.length === 0) {
            return { ...empty, unchanged: currentIds.size };
        }

        const now = new Date();

        await db.$transaction([
            ...toActivate.map((institutionId) =>
                db.institutionMembership.upsert({
                    where: { userId_institutionId: { userId, institutionId } },
                    create: { userId, institutionId, active: true, syncedAt: now },
                    update: { active: true, syncedAt: now },
                }),
            ),
            ...(toDeactivate.length > 0
                ? [
                      db.institutionMembership.updateMany({
                          where: { userId, institutionId: { in: toDeactivate } },
                          data: { active: false, syncedAt: now },
                      }),
                  ]
                : []),
        ]);

        // Membership drives which institution subscriptions apply, so any change here
        // invalidates every cached answer for this user.
        await invalidate(userId);

        logger.info(
            `[entitlements] membership sync for ${userId}: +${toActivate.length} -${toDeactivate.length}`,
        );

        return {
            userId,
            activated: toActivate.length,
            deactivated: toDeactivate.length,
            unchanged: currentIds.size - toActivate.length,
        };
    } catch (err) {
        logger.error(`[entitlements] membership sync failed for ${userId}: ${(err as Error).message}`);
        return null;
    }
}

/**
 * Reconcile every member of one institution. Used when an institution-wide change
 * lands (bulk import, institution suspended) rather than a single membership event.
 */
export async function syncInstitutionMemberships(institutionId: string): Promise<number> {
    if (!isEntitlementsConfigured()) return 0;

    const members = await prisma.userInstitutionRole.findMany({
        where: { institutionId },
        select: { userId: true },
    });

    // Sequential on purpose: this is a background reconcile, and a bulk import of a
    // few thousand students should not open a connection per member.
    for (const m of members) {
        await syncUserMemberships(m.userId);
    }

    logger.info(`[entitlements] institution sync for ${institutionId}: ${members.length} members`);
    return members.length;
}
