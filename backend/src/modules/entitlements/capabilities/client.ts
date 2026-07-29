/**
 * Postgres client for the entitlements schema.
 *
 * A second Prisma client, separate from the MySQL ERP one. Lazily constructed so a
 * deployment without ENTITLEMENTS_DATABASE_URL boots normally with the capability
 * API simply not registered — the same opt-in pattern the OIDC provider and
 * federation use.
 */
// TYPE-ONLY import: erased at compile time, so it emits no runtime require. The
// generated client is loaded lazily below instead.
//
// This matters more than it looks. A top-level runtime import of this path takes the
// ENTIRE BACKEND down at boot on any deployment where the client has not been
// generated — including the identity provider, which every app in the trio depends
// on for login. The capability service is opt-in; a deployment that has not enabled
// it must not even notice this module exists.
import type { PrismaClient } from '../../../../node_modules/.prisma/entitlements-client/index.js';
import { createRequire } from 'node:module';
import { env } from '../../../config/env.js';
import { logger } from '../../../utils/logger.js';

const requireFromHere = createRequire(import.meta.url);

let client: PrismaClient | null = null;

/** True when this deployment has been given an entitlements database. */
export function isEntitlementsConfigured(): boolean {
    return Boolean(env.ENTITLEMENTS_DATABASE_URL);
}

/**
 * The shared client. Throws if called without configuration — callers should gate on
 * `isEntitlementsConfigured()` rather than catching this.
 */
export function entitlementsDb(): PrismaClient {
    if (!env.ENTITLEMENTS_DATABASE_URL) {
        throw new Error(
            'ENTITLEMENTS_DATABASE_URL is not set — the capability service is not available in this environment.',
        );
    }
    if (!client) {
        // Loaded here rather than at module scope so that a deployment which has not
        // run `prisma generate --schema prisma/entitlements/schema.prisma` fails only
        // on this call — which nothing reaches unless the feature is configured —
        // instead of failing to boot at all.
        const mod = requireFromHere(
            '../../../../node_modules/.prisma/entitlements-client/index.js',
        ) as { PrismaClient: new (opts: unknown) => PrismaClient };

        client = new mod.PrismaClient({
            datasources: { db: { url: env.ENTITLEMENTS_DATABASE_URL } },
        });
        logger.info('[entitlements] Postgres client initialised');
    }
    return client;
}

/** Close the pool on shutdown. Safe to call when never initialised. */
export async function disconnectEntitlementsDb(): Promise<void> {
    if (client) {
        await client.$disconnect();
        client = null;
    }
}

export type { PrismaClient as EntitlementsClient };
