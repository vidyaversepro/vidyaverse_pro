/**
 * Seed the entitlements database from what Vidyaverse already knows.
 *
 * Institutions already carry a `subscriptionTier` and `subscriptionStatus` in the ERP
 * database, and `user_institution_roles` already records who belongs to which — so
 * the capability service can start out reflecting reality rather than an empty table
 * that quietly denies everyone.
 *
 * Idempotent: subscriptions are keyed by `externalRef`, so re-running updates in
 * place rather than duplicating. Safe to run repeatedly, and safe to run before the
 * cutover as a dry run.
 *
 *   tsx src/scripts/backfill-entitlements.ts [--dry-run]
 *
 * PDLMS and DigiClassroom are deliberately NOT backfilled here: PDLMS has no
 * subscription rows at all, and DCP's live in its own database with a different
 * model. Those are separate, deliberate migrations.
 */
import { prisma } from '../config/database.js';
import { entitlementsDb, isEntitlementsConfigured } from '../modules/entitlements/capabilities/client.js';
import type { Tier } from '../modules/entitlements/capabilities/types.js';

/**
 * Vidyaverse sells starter/professional/enterprise; capabilities are expressed in
 * free/basic/premium/enterprise. `starter` maps to `basic`, not `free` — it is a paid
 * entry tier, and mapping it to free would silently strip paying customers.
 */
const TIER_MAP: Record<string, Tier> = {
    starter: 'basic',
    professional: 'premium',
    enterprise: 'enterprise',
};

/** A trial grants real access, so it lands as `active` rather than a state of its own. */
const STATUS_MAP: Record<string, 'active' | 'suspended' | 'cancelled'> = {
    trial: 'active',
    active: 'active',
    suspended: 'suspended',
    cancelled: 'cancelled',
};

async function main() {
    const dryRun = process.argv.includes('--dry-run');

    if (!isEntitlementsConfigured()) {
        console.error('ENTITLEMENTS_DATABASE_URL is not set — nothing to back fill into.');
        process.exit(1);
    }

    const db = entitlementsDb();
    console.log(`\n=== entitlements backfill${dryRun ? ' (DRY RUN)' : ''} ===\n`);

    // ── institution subscriptions ───────────────────────────────────────────
    const institutions = await prisma.institution.findMany({
        select: {
            id: true,
            name: true,
            code: true,
            subscriptionTier: true,
            subscriptionStatus: true,
            trialEndsAt: true,
        },
    });

    let subsWritten = 0;
    for (const inst of institutions) {
        const tier = TIER_MAP[inst.subscriptionTier];
        const status = STATUS_MAP[inst.subscriptionStatus];
        if (!tier || !status) {
            console.warn(`  ! skipping ${inst.code}: unmapped tier/status (${inst.subscriptionTier}/${inst.subscriptionStatus})`);
            continue;
        }

        // A trial has a real end date; a paid subscription's renewal date is not
        // modelled in the ERP schema, so it is left perpetual rather than invented —
        // guessing an expiry would lock institutions out on a date nobody agreed to.
        const expiresAt = inst.subscriptionStatus === 'trial' ? inst.trialEndsAt : null;

        console.log(
            `  ${inst.code.padEnd(12)} ${inst.subscriptionTier}/${inst.subscriptionStatus} -> ${tier}/${status}${expiresAt ? ` (expires ${expiresAt.toISOString().slice(0, 10)})` : ''}`,
        );

        if (!dryRun) {
            const externalRef = `vidyaverse:institution:${inst.id}`;
            await db.subscription.upsert({
                where: { externalRef },
                create: {
                    subjectKind: 'institution',
                    subjectId: inst.id,
                    app: 'vidyaverse',
                    tier,
                    status,
                    expiresAt,
                    source: 'backfill:institution-tier',
                    externalRef,
                    notes: `Seeded from institutions.subscription_tier for ${inst.name}`,
                },
                update: { tier, status, expiresAt },
            });
        }
        subsWritten++;
    }

    // ── membership mirror ───────────────────────────────────────────────────
    const roles = await prisma.userInstitutionRole.findMany({
        select: { userId: true, institutionId: true },
    });

    let membershipsWritten = 0;
    if (!dryRun) {
        const now = new Date();
        for (const r of roles) {
            await db.institutionMembership.upsert({
                where: { userId_institutionId: { userId: r.userId, institutionId: r.institutionId } },
                create: { userId: r.userId, institutionId: r.institutionId, active: true, syncedAt: now },
                update: { active: true, syncedAt: now },
            });
            membershipsWritten++;
        }

        // Anything mirrored that the ERP no longer knows about is stale — deactivate
        // rather than delete, so a re-admitted member keeps their history.
        const live = new Set(roles.map((r) => `${r.userId}::${r.institutionId}`));
        const mirrored = await db.institutionMembership.findMany({
            where: { active: true },
            select: { id: true, userId: true, institutionId: true },
        });
        const stale = mirrored.filter((m) => !live.has(`${m.userId}::${m.institutionId}`));
        if (stale.length > 0) {
            await db.institutionMembership.updateMany({
                where: { id: { in: stale.map((s) => s.id) } },
                data: { active: false, syncedAt: now },
            });
            console.log(`\n  deactivated ${stale.length} stale membership(s)`);
        }
    } else {
        membershipsWritten = roles.length;
    }

    console.log(
        `\n${dryRun ? 'would write' : 'wrote'}: ${subsWritten} subscription(s), ${membershipsWritten} membership(s)\n`,
    );

    await db.$disconnect();
    await prisma.$disconnect();
}

main().catch(async (err) => {
    console.error('backfill failed:', err);
    process.exit(1);
});
