/**
 * Postgres client for the taxonomy schema.
 *
 * A third Prisma client (after the MySQL ERP one and the entitlements Postgres one),
 * lazily constructed so a deployment without TAXONOMY_DATABASE_URL boots normally
 * with the taxonomy API simply not registered — the same opt-in pattern entitlements
 * uses.
 */
// TYPE-ONLY import: erased at compile time, so it emits no runtime require. The
// generated client is loaded lazily below instead — see entitlements/capabilities/
// client.ts for why a top-level runtime import here would be dangerous (it would take
// the entire backend, including the OIDC provider every app depends on, down at boot
// on any deployment where this client has not been generated).
import type { PrismaClient } from '../../../node_modules/.prisma/taxonomy-client/index.js';
import { createRequire } from 'node:module';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

const requireFromHere = createRequire(import.meta.url);

let client: PrismaClient | null = null;

/** True when this deployment has been given a taxonomy database. */
export function isTaxonomyConfigured(): boolean {
    return Boolean(env.TAXONOMY_DATABASE_URL);
}

/**
 * The shared client. Throws if called without configuration — callers should gate on
 * `isTaxonomyConfigured()` rather than catching this.
 */
export function taxonomyDb(): PrismaClient {
    if (!env.TAXONOMY_DATABASE_URL) {
        throw new Error(
            'TAXONOMY_DATABASE_URL is not set — the taxonomy service is not available in this environment.',
        );
    }
    if (!client) {
        // Loaded here rather than at module scope so that a deployment which has not
        // run `prisma generate --schema prisma/taxonomy/schema.prisma` fails only on
        // this call — which nothing reaches unless the feature is configured —
        // instead of failing to boot at all.
        const mod = requireFromHere(
            '../../../node_modules/.prisma/taxonomy-client/index.js',
        ) as { PrismaClient: new (opts: unknown) => PrismaClient };

        client = new mod.PrismaClient({
            datasources: { db: { url: env.TAXONOMY_DATABASE_URL } },
        });
        logger.info('[taxonomy] Postgres client initialised');
    }
    return client;
}

/** Close the pool on shutdown. Safe to call when never initialised. */
export async function disconnectTaxonomyDb(): Promise<void> {
    if (client) {
        await client.$disconnect();
        client = null;
    }
}

export type { PrismaClient as TaxonomyClient };
