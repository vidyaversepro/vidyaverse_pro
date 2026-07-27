/**
 * Federation token-exchange + claim verification (run after the browser captures
 * the authorization code).
 *
 * Usage: tsx src/scripts/fed-test-exchange.ts <authorization_code>
 *
 * Reads backend/.fed-test.json for client_secret + code_verifier + redirect_uri,
 * exchanges the code at the token endpoint, decodes the id_token, asserts the
 * custom claims (sub/email/memberships/entitlements_url), then calls /userinfo.
 */
import { readFileSync } from 'node:fs';
import { prisma } from '../config/database.js';

const FRONTEND = process.env.FED_FRONTEND || 'http://localhost:5173';

const results: Array<{ name: string; pass: boolean; detail: string }> = [];
function check(name: string, pass: boolean, detail: string) {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name} — ${detail}`);
}

function decodeJwt(token: string): Record<string, unknown> {
  const payload = token.split('.')[1];
  return JSON.parse(Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8'));
}

async function main() {
  const code = process.argv[2];
  if (!code) throw new Error('usage: fed-test-exchange.ts <code>');
  const art = JSON.parse(readFileSync(new URL('../../.fed-test.json', import.meta.url), 'utf-8'));

  // 1. Exchange code → tokens (client_secret_post + PKCE verifier).
  const tokenRes = await fetch(`${FRONTEND}/api/auth/oauth2/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded', origin: FRONTEND },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: art.redirectUri,
      client_id: art.clientId,
      client_secret: art.clientSecret,
      code_verifier: art.codeVerifier,
    }),
  });
  const tokens = (await tokenRes.json()) as Record<string, string>;
  check('token: code exchange returns id_token + access_token', tokenRes.status === 200 && !!tokens.id_token && !!tokens.access_token, `status=${tokenRes.status}, keys=${Object.keys(tokens).join(',')}`);
  if (!tokens.id_token) { console.log('token error body:', JSON.stringify(tokens)); throw new Error('no id_token'); }

  // 2. Decode + assert ID-token claims.
  const claims = decodeJwt(tokens.id_token);
  check('id_token: sub + email + iss present', !!claims.sub && claims.email === art.email && typeof claims.iss === 'string', `email=${claims.email}, iss=${claims.iss}`);

  const memberships = (claims.memberships as Array<{ institution_code: string; role: string }>) ?? [];
  check('id_token: memberships claim populated for the test institution', Array.isArray(memberships) && memberships.some((m) => m.institution_code === art.institutionCode && m.role === 'teacher'), `memberships=${JSON.stringify(memberships)}`);
  check('id_token: global_role + entitlements_url custom claims present', claims.global_role === 'user' && typeof claims.entitlements_url === 'string' && String(claims.entitlements_url).endsWith('/api/v1/entitlements/me'), `global_role=${claims.global_role}, ent_url=${claims.entitlements_url}`);

  // 3. /userinfo with the access token.
  const ui = await fetch(`${FRONTEND}/api/auth/oauth2/userinfo`, { headers: { authorization: `Bearer ${tokens.access_token}`, origin: FRONTEND } });
  const uinfo = (await ui.json()) as Record<string, unknown>;
  check('userinfo: returns the same subject + email', ui.status === 200 && uinfo.email === art.email && uinfo.sub === claims.sub, `status=${ui.status}, email=${uinfo.email}`);

  // ── Cleanup the test artifacts ────────────────────────────────────────────────
  await prisma.oauthAccessToken.deleteMany({ where: { clientId: art.clientId } }).catch(() => {});
  await prisma.oauthApplication.deleteMany({ where: { clientId: art.clientId } }).catch(() => {});
  await prisma.userInstitutionRole.deleteMany({ where: { userId: art.userId } }).catch(() => {});
  await prisma.institution.deleteMany({ where: { id: art.institutionId } }).catch(() => {});
  await prisma.session.deleteMany({ where: { userId: art.userId } }).catch(() => {});
  await prisma.account.deleteMany({ where: { userId: art.userId } }).catch(() => {});
  await prisma.user.delete({ where: { id: art.userId } }).catch(() => {});

  const passed = results.filter((r) => r.pass).length;
  console.log(`\n=== ${passed}/${results.length} federation token checks passed ===\n`);
  return passed === results.length;
}

main()
  .then(async (ok) => { await prisma.$disconnect(); process.exit(ok ? 0 : 1); })
  .catch(async (err) => { console.error('EXCHANGE ERROR:', err); await prisma.$disconnect().catch(() => {}); process.exit(1); });
