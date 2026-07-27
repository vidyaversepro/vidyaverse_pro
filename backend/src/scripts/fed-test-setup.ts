/**
 * Federation browser-walkthrough SETUP (run with backend up, OIDC_ENABLED=true).
 *
 *  1. Sign up a known test user via Better Auth HTTP (so they can log in in the browser).
 *  2. Give them an Institution + UserInstitutionRole membership (so the `memberships`
 *     claim is non-empty in the issued token).
 *  3. Register an OAuth client (oauthApplication) pointing at the static callback page.
 *  4. Generate a PKCE verifier/challenge + state and print the authorize URL.
 *  5. Persist secrets to .fed-test.json for the token-exchange step.
 *
 * Run: tsx src/scripts/fed-test-setup.ts
 */
import { createHash, randomBytes } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { prisma } from '../config/database.js';
import { hashClientSecret } from '../modules/oidc/client-secret-hash.js';

const FRONTEND = process.env.FED_FRONTEND || 'http://localhost:5173';
const REDIRECT_URI = `${FRONTEND}/oauth-callback.html`;
const b64url = (b: Buffer) => b.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

async function main() {
  const tag = randomBytes(3).toString('hex');
  const email = `fed-${tag}@example.test`;
  const password = 'FedTest!2026xyz';
  const name = 'Federation Tester';

  // 1. Sign up via Better Auth (needs trusted origin header or 403).
  const signup = await fetch(`${FRONTEND}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: FRONTEND },
    body: JSON.stringify({ email, password, name }),
  });
  if (signup.status !== 200 && signup.status !== 201) {
    throw new Error(`sign-up failed: ${signup.status} ${await signup.text()}`);
  }

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (!user) throw new Error('signed-up user missing from DB');

  // 2. Institution + membership → populates the `memberships` claim.
  const inst = await prisma.institution.create({
    data: { name: `Fed School ${tag}`, code: `FED-${tag}`, institutionType: 'SCHOOL', subscriptionTier: 'professional', enabledFields: {}, customFields: {}, enabledServices: [] },
  });
  // Institution membership role is `teacher` (InstitutionRole); global_role is a
  // separate axis (GlobalRole) — a normal `user` here.
  await prisma.userInstitutionRole.create({ data: { userId: user.id, institutionId: inst.id, role: 'teacher' } });
  await prisma.user.update({ where: { id: user.id }, data: { globalRole: 'user' } });

  // 3. Register the OAuth client (RP) directly.
  const clientId = `fed-rp-${tag}`;
  const clientSecretPlain = b64url(randomBytes(32));
  const oauthApp = await prisma.oauthApplication.create({
    data: {
      name: 'Federation Test RP',
      clientId,
      clientSecret: await hashClientSecret(clientSecretPlain),
      redirectUrls: REDIRECT_URI,
      type: 'web',
      disabled: false,
    },
  });

  // 4. PKCE + state.
  const codeVerifier = b64url(randomBytes(32));
  const codeChallenge = b64url(createHash('sha256').update(codeVerifier).digest());
  const state = b64url(randomBytes(12));
  const scope = 'openid profile email memberships entitlements';

  const authorizeUrl =
    `${FRONTEND}/api/auth/oauth2/authorize?response_type=code` +
    `&client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&scope=${encodeURIComponent(scope)}` +
    `&state=${encodeURIComponent(state)}` +
    `&code_challenge=${encodeURIComponent(codeChallenge)}` +
    `&code_challenge_method=S256`;

  const artifact = {
    email, password, userId: user.id, institutionId: inst.id, institutionCode: inst.code,
    clientId, clientSecret: clientSecretPlain, redirectUri: REDIRECT_URI,
    codeVerifier, state, scope, authorizeUrl, oauthAppId: oauthApp.id, frontend: FRONTEND,
  };
  writeFileSync(new URL('../../.fed-test.json', import.meta.url), JSON.stringify(artifact, null, 2));

  console.log('\n=== FEDERATION TEST READY ===');
  console.log(`login email    : ${email}`);
  console.log(`login password : ${password}`);
  console.log(`institution    : ${inst.code} (${inst.id})`);
  console.log(`client_id      : ${clientId}`);
  console.log(`redirect_uri   : ${REDIRECT_URI}`);
  console.log(`\nAUTHORIZE_URL=${authorizeUrl}\n`);
  console.log('Artifact written to backend/.fed-test.json');
}

main()
  .then(async () => { await prisma.$disconnect(); process.exit(0); })
  .catch(async (err) => { console.error('SETUP ERROR:', err); await prisma.$disconnect().catch(() => {}); process.exit(1); });
