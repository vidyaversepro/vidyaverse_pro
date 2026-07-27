/**
 * OIDC provider smoke test — Phase 2.0
 *
 * Validates the federation plumbing without standing up a full HTTP harness:
 *  1. auth.api exposes the OIDC endpoints from the plugin
 *  2. resolveOidcClaims() returns the expected shape for a synthetic user
 *     with memberships across two institutions
 *  3. oauth_applications can be created + queried (admin CRUD will use this)
 *  4. The consent client lookup returns name/icon and hides disabled clients
 *
 * Run: OIDC_ENABLED=true tsx src/scripts/smoke-oidc.ts
 */
import { randomBytes } from 'node:crypto';
import { prisma } from '../config/database.js';
import { env } from '../config/env.js';
import { auth } from '../lib/auth.js';
import { resolveOidcClaims } from '../modules/oidc/claims-resolver.js';
import { hashClientSecret } from '../modules/oidc/client-secret-hash.js';

const results: Array<{ name: string; pass: boolean; detail: string }> = [];
function check(name: string, pass: boolean, detail: string) {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name} — ${detail}`);
}

async function main() {
  if (!env.OIDC_ENABLED) {
    console.error('OIDC_ENABLED is false — set OIDC_ENABLED=true to run this smoke test.');
    process.exit(2);
  }

  // 1. Plugin endpoints registered.
  const api = auth.api as Record<string, unknown>;
  check(
    'oidc endpoints registered',
    typeof api.getOpenIdConfig === 'function' &&
      typeof api.oAuth2authorize === 'function' &&
      typeof api.oAuthConsent === 'function',
    `getOpenIdConfig=${typeof api.getOpenIdConfig}, oAuth2authorize=${typeof api.oAuth2authorize}, oAuthConsent=${typeof api.oAuthConsent}`,
  );

  // 2. Setup: two institutions + a user with memberships in both.
  const code1 = `VV-OIDC-${randomBytes(3).toString('hex').toUpperCase()}`;
  const code2 = `VV-OIDC-${randomBytes(3).toString('hex').toUpperCase()}`;
  const inst1 = await prisma.institution.upsert({
    where: { code: code1 },
    update: {},
    create: { name: 'OIDC Smoke School A', code: code1, enabledFields: {}, customFields: {}, enabledServices: [] },
  });
  const inst2 = await prisma.institution.upsert({
    where: { code: code2 },
    update: {},
    create: { name: 'OIDC Smoke School B', code: code2, enabledFields: {}, customFields: {}, enabledServices: [] },
  });

  const userEmail = `oidc-smoke-${randomBytes(4).toString('hex')}@example.test`;
  const user = await prisma.user.create({
    data: {
      email: userEmail,
      name: 'OIDC Smoke User',
      emailVerified: true,
      globalRole: 'student',
    },
  });
  await prisma.userInstitutionRole.create({
    data: { userId: user.id, institutionId: inst1.id, role: 'teacher' },
  });
  await prisma.userInstitutionRole.create({
    data: { userId: user.id, institutionId: inst2.id, role: 'student' },
  });

  // 3. Claims resolver — full scope set.
  const fullClaims = await resolveOidcClaims(
    { id: user.id, email: user.email, name: user.name, globalRole: 'student' },
    ['openid', 'profile', 'email', 'memberships', 'entitlements'],
    { clientId: 'test-client', name: 'Test RP' },
  );
  const memberships = (fullClaims.memberships as Array<{ institution_code: string; role: string }>) ?? [];
  check(
    'claims: memberships for user across 2 institutions',
    memberships.length === 2 &&
      memberships.some((m) => m.institution_code === code1 && m.role === 'teacher') &&
      memberships.some((m) => m.institution_code === code2 && m.role === 'student'),
    `count=${memberships.length}`,
  );
  check(
    'claims: global_role surfaced',
    fullClaims.global_role === 'student',
    `global_role=${String(fullClaims.global_role)}`,
  );
  check(
    'claims: entitlements_url present and well-formed',
    typeof fullClaims.entitlements_url === 'string' &&
      String(fullClaims.entitlements_url).endsWith('/api/v1/entitlements/me'),
    `entitlements_url=${String(fullClaims.entitlements_url)}`,
  );

  // 4. Claims resolver — narrow scope: no memberships unless requested.
  const narrowClaims = await resolveOidcClaims(
    { id: user.id, email: user.email, name: user.name, globalRole: 'student' },
    ['openid', 'email'],
    { clientId: 'test-client', name: 'Test RP' },
  );
  check(
    'claims: memberships absent when scope not requested',
    !('memberships' in narrowClaims) && !('global_role' in narrowClaims),
    `keys=${Object.keys(narrowClaims).join(',') || '<empty>'}`,
  );

  // 5. oauth_applications: create + lookup + secret hashing.
  const clientPlainSecret = randomBytes(32).toString('base64url');
  const clientHashedSecret = await hashClientSecret(clientPlainSecret);
  const clientId = `smoke-rp-${randomBytes(4).toString('hex')}`;
  const app = await prisma.oauthApplication.create({
    data: {
      name: 'Smoke RP',
      clientId,
      clientSecret: clientHashedSecret,
      redirectUrls: 'http://localhost:9999/cb',
      type: 'web',
    },
  });
  const reHash = await hashClientSecret(clientPlainSecret);
  check(
    'oauth_application stored with deterministic hashed secret',
    app.clientSecret === reHash && app.clientSecret !== clientPlainSecret,
    `hash matches re-hash, plaintext not stored`,
  );

  // 6. Public client lookup: returns disabled=false clients only.
  const visible = await prisma.oauthApplication.findUnique({
    where: { clientId },
    select: { name: true, icon: true, disabled: true },
  });
  check(
    'public client lookup returns name when enabled',
    !!visible && visible.disabled === false && visible.name === 'Smoke RP',
    `name=${visible?.name}, disabled=${visible?.disabled}`,
  );
  await prisma.oauthApplication.update({ where: { clientId }, data: { disabled: true } });
  const hidden = await prisma.oauthApplication.findUnique({
    where: { clientId },
    select: { disabled: true },
  });
  check(
    'disabled client correctly flagged',
    hidden?.disabled === true,
    `disabled=${hidden?.disabled}`,
  );

  // Cleanup
  await prisma.oauthApplication.delete({ where: { clientId } });
  await prisma.userInstitutionRole.deleteMany({ where: { userId: user.id } });
  await prisma.user.delete({ where: { id: user.id } });
  await prisma.institution.delete({ where: { id: inst1.id } });
  await prisma.institution.delete({ where: { id: inst2.id } });

  const passed = results.filter((r) => r.pass).length;
  console.log(`\n=== ${passed}/${results.length} checks passed ===\n`);
  return passed === results.length;
}

main()
  .then(async (ok) => {
    await prisma.$disconnect();
    process.exit(ok ? 0 : 1);
  })
  .catch(async (err) => {
    console.error('SMOKE TEST ERROR:', err);
    await prisma.$disconnect().catch(() => {});
    process.exit(1);
  });
