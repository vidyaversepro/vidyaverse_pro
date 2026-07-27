/**
 * Deterministic HMAC-SHA256 keyed hash of OIDC client secrets at rest.
 *
 * Better Auth's `storeClientSecret.hash` is invoked both on storage and on
 * verification (the plugin string-compares `hash(input) == stored`). That
 * forbids per-record salt; we use BETTER_AUTH_SECRET as the HMAC key instead,
 * which still defeats rainbow-table extraction if the DB is leaked.
 *
 * Client secrets themselves are 256-bit random strings (`generateClientSecret`),
 * so this is sufficient — they have full entropy to begin with.
 */
import { createHmac } from 'node:crypto';
import { env } from '../../config/env.js';

export async function hashClientSecret(secret: string): Promise<string> {
  return createHmac('sha256', env.BETTER_AUTH_SECRET).update(secret).digest('hex');
}
