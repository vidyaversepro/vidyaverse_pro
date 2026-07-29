/**
 * Postgres client for the entitlements schema.
 *
 * A second Prisma client, separate from the MySQL ERP one. Lazily constructed so a
 * deployment without ENTITLEMENTS_DATABASE_URL boots normally with the capability
 * API simply not registered — the same opt-in pattern the OIDC provider and
 * federation use.
 */
import { PrismaClient } from '../../../../node_modules/.prisma/entitlements-client/index.js';
import { env } from '../../../config/env.js';
import { logger } from '../../../utils/logger.js';

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
        client = new PrismaClient({
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
