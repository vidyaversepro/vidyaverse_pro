/**
 * Federation full-flow test (headless browser-equivalent). Replicates exactly
 * what a browser does in the OIDC authorization-code + PKCE flow, end to end:
 *
 *   1. GET /authorize unauthenticated → redirect to the login page (login gate)
 *   2. the SPA /login + /oauth/consent routes actually serve (frontend up)
 *   3. the consent page's data source (/api/v1/oauth/clients/:id) returns branding
 *   4. POST sign-in → session cookie
 *   5. GET /authorize authenticated → consent required → consent_code
 *   6. POST /oauth2/consent {accept:true} → redirectURI with ?code=
 *   7. POST /oauth2/token (code + PKCE verifier + client secret) → id_token/access_token
 *   8. decode id_token → assert sub/email/memberships/global_role/entitlements_url
 *   9. GET /userinfo (bearer) → same subject
 *
 * Run (backend OIDC on + frontend up, after fed-test-setup.ts):
 *   tsx src/scripts/fed-test-flow.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { prisma } from '../config/database.js';

const results: Array<{ name: string; pass: boolean; detail: string }> = [];
function check(name: string, pass: boolean, detail: string) {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name} — ${detail}`);
}

const jar = new Map<string, string>();
function cookieHeader() { return Array.from(jar.entries()).map(([k, v]) => `${k}=${v}`).join('; '); }
function absorb(res: Response) {
  const h = res.headers as Headers & { getSetCookie?: () => string[] };
  const cs = h.getSetCookie ? h.getSetCookie() : (res.headers.get('set-cookie') ? [res.headers.get('set-cookie')!] : []);
  for (const c of cs) { const kv = c.split(';')[0]; const i = kv.indexOf('='); if (i > 0) jar.set(kv.slice(0, i).trim(), kv.slice(i + 1).trim()); }
}

async function main() {
  const art = JSON.parse(readFileSync(new URL('../../.fed-test.json', import.meta.url), 'utf-8'));
  const FE: string = art.frontend; // http://localhost:5173 (frontend / SPA + proxy)
  const BE: string = process.env.FED_BACKEND || 'http://localhost:3002'; // backend directly
  const authorizePath = art.authorizeUrl.slice(FE.length); // /api/auth/oauth2/authorize?...

  // /api calls go straight to the backend (eliminates the dev-proxy as a variable);
  // the frontend (FE) is still verified to serve the SPA routes in check 2.
  const req = (method: string, url: string, opts: { body?: string; form?: Record<string, string>; bearer?: string } = {}) => {
    const headers: Record<string, string> = { origin: FE };
    if (jar.size) headers.cookie = cookieHeader();
    if (opts.bearer) headers.authorization = `Bearer ${opts.bearer}`;
    let body: string | undefined;
    if (opts.form) { headers['content-type'] = 'application/x-www-form-urlencoded'; body = new URLSearchParams(opts.form).toString(); }
    else if (opts.body) { headers['content-type'] = 'application/json'; body = opts.body; }
    return fetch(url.startsWith('http') ? url : `${BE}${url}`, { method, headers, body, redirect: 'manual' });
  };

  // Better Auth authorize is dual-mode: a browser top-level navigation gets a 302
  // (Location header); a programmatic client gets 200 {redirect:true, url}. This
  // headless client is the latter, so resolve the "next URL" from either form.
  // (The real browser UI follows the 302s automatically — same destination.)
  const nextUrl = async (res: Response): Promise<{ status: number; url: string }> => {
    const loc = res.headers.get('location');
    if (loc) return { status: res.status, url: loc };
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      const j = await res.json().catch(() => null) as { redirect?: boolean; url?: string } | null;
      if (j?.url) return { status: res.status, url: j.url };
    }
    return { status: res.status, url: '' };
  };

  // 1. Unauthenticated authorize → login gate.
  const n1 = await nextUrl(await req('GET', authorizePath));
  check('1. unauthenticated /authorize → routes to /login', n1.url.includes('/login'), `status=${n1.status}, next=${n1.url.slice(0, 60)}`);

  // 2. SPA routes serve (frontend up). Tolerant: a down frontend just fails this
  // one check rather than aborting the token-capture flow.
  let loginStatus = 0; let consentStatus = 0;
  try { loginStatus = (await fetch(`${FE}/login`)).status; consentStatus = (await fetch(`${FE}/oauth/consent`)).status; } catch { /* frontend not running */ }
  check('2. frontend serves /login and /oauth/consent', loginStatus === 200 && consentStatus === 200, `login=${loginStatus}, consent=${consentStatus} (0 = frontend down, non-fatal)`);

  // 3. Consent page data source returns client branding.
  const clientInfo = await (await req('GET', `/api/v1/oauth/clients/${art.clientId}`)).json() as { data?: { name?: string } };
  check('3. consent branding endpoint returns client name', clientInfo?.data?.name === 'Federation Test RP', `name=${clientInfo?.data?.name}`);

  // 4. Sign in → session cookie.
  const signin = await req('POST', '/api/auth/sign-in/email', { body: JSON.stringify({ email: art.email, password: art.password }) });
  absorb(signin);
  check('4. sign-in establishes session cookie', signin.status === 200 && jar.size > 0, `status=${signin.status}, cookies=${jar.size}`);

  // 5. Authenticated authorize → consent required (or code directly).
  const n2 = await nextUrl(await req('GET', authorizePath));
  let code = '';
  let consentCode = '';
  if (n2.url.includes('/oauth/consent')) {
    consentCode = new URL(n2.url, FE).searchParams.get('consent_code') || '';
  } else if (n2.url.includes('code=')) {
    code = new URL(n2.url, FE).searchParams.get('code') || '';
  }
  check('5. authenticated /authorize → consent step (consent_code issued)', !!consentCode || !!code, `next=${n2.url.slice(0, 70)}`);

  // 6. Consent accept → redirectURI with code.
  if (!code) {
    const consent = await req('POST', '/api/auth/oauth2/consent', { body: JSON.stringify({ accept: true, consent_code: consentCode }) });
    const cj = await consent.json() as { redirectURI?: string };
    const redirectURI = cj.redirectURI || '';
    code = redirectURI ? (new URL(redirectURI).searchParams.get('code') || '') : '';
    check('6. consent accept returns redirectURI with authorization code', consent.status === 200 && redirectURI.startsWith(art.redirectUri) && !!code, `status=${consent.status}, code=${code ? code.slice(0, 10) + '…' : 'none'}`);
  } else {
    check('6. consent accept returns redirectURI with authorization code', true, 'code issued without separate consent (already consented)');
  }

  // 7. Token exchange (PKCE + client secret).
  const tokenRes = await req('POST', '/api/auth/oauth2/token', { form: { grant_type: 'authorization_code', code, redirect_uri: art.redirectUri, client_id: art.clientId, client_secret: art.clientSecret, code_verifier: art.codeVerifier } });
  const tokens = await tokenRes.json() as Record<string, string>;
  check('7. code → token exchange returns id_token + access_token', tokenRes.status === 200 && !!tokens.id_token && !!tokens.access_token, `status=${tokenRes.status}, keys=${Object.keys(tokens).join(',')}`);

  if (tokens.id_token) {
    // Persist the REAL issued id_token so the PDLMS/DCP RP-side tests can feed it
    // to their JIT provisioning (proves the actual issuer→consumer claim contract).
    writeFileSync(new URL('../../.fed-token.json', import.meta.url), JSON.stringify({ idToken: tokens.id_token, email: art.email, institutionCode: art.institutionCode, institutionId: art.institutionId }, null, 2));

    const claims = JSON.parse(Buffer.from(tokens.id_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8')) as Record<string, unknown>;
    check('8a. id_token: sub + email + iss', !!claims.sub && claims.email === art.email && typeof claims.iss === 'string', `email=${claims.email}, iss=${claims.iss}`);
    const memberships = (claims.memberships as Array<{ institution_code: string; role: string }>) ?? [];
    check('8b. id_token: memberships claim (teacher @ test institution)', memberships.some((m) => m.institution_code === art.institutionCode && m.role === 'teacher'), `memberships=${JSON.stringify(memberships)}`);
    check('8c. id_token: global_role + entitlements_url custom claims', claims.global_role === 'user' && String(claims.entitlements_url || '').endsWith('/api/v1/entitlements/me'), `global_role=${claims.global_role}, ent_url=${claims.entitlements_url}`);

    // 9. userinfo with the access token.
    const ui = await req('GET', '/api/auth/oauth2/userinfo', { bearer: tokens.access_token });
    const uinfo = await ui.json() as Record<string, unknown>;
    check('9. userinfo returns same subject + email', ui.status === 200 && uinfo.email === art.email && uinfo.sub === claims.sub, `status=${ui.status}, email=${uinfo.email}`);
  }

  // ── Cleanup ──────────────────────────────────────────────────────────────────
  await prisma.oauthAccessToken.deleteMany({ where: { clientId: art.clientId } }).catch(() => {});
  await prisma.oauthConsent.deleteMany({ where: { userId: art.userId } }).catch(() => {});
  await prisma.oauthApplication.deleteMany({ where: { clientId: art.clientId } }).catch(() => {});
  await prisma.userInstitutionRole.deleteMany({ where: { userId: art.userId } }).catch(() => {});
  await prisma.institution.deleteMany({ where: { id: art.institutionId } }).catch(() => {});
  await prisma.session.deleteMany({ where: { userId: art.userId } }).catch(() => {});
  await prisma.account.deleteMany({ where: { userId: art.userId } }).catch(() => {});
  await prisma.user.delete({ where: { id: art.userId } }).catch(() => {});

  const passed = results.filter((r) => r.pass).length;
  console.log(`\n=== ${passed}/${results.length} federation flow checks passed ===\n`);
  return passed === results.length;
}

main()
  .then(async (ok) => { await prisma.$disconnect(); process.exit(ok ? 0 : 1); })
  .catch(async (err) => { console.error('FLOW ERROR:', err); await prisma.$disconnect().catch(() => {}); process.exit(1); });
