/**
 * LIVE HTTP integration test — exercises the real Fastify stack end-to-end:
 * Better Auth session cookie → authenticate → super-admin bypass → requireFeature
 * entitlement gating → tenant-scoped handlers. This covers the HTTP/auth/gating
 * layer that the service-level smoke tests do NOT.
 *
 * Assumes the backend is already running on BASE (default http://localhost:3002).
 * Run: tsx src/scripts/live-http-test.ts
 */
import { randomBytes } from 'node:crypto';
import { InstitutionType } from '@prisma/client';
import { prisma } from '../config/database.js';
import { isApplicable } from '../config/module-registry.js';

const BASE = process.env.LIVE_BASE || 'http://localhost:3002';

const results: Array<{ name: string; pass: boolean; detail: string }> = [];
function check(name: string, pass: boolean, detail: string) {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name} — ${detail}`);
}

// Simple cookie jar: name → value.
const jar = new Map<string, string>();
function cookieHeader() {
  return Array.from(jar.entries()).map(([k, v]) => `${k}=${v}`).join('; ');
}
function absorbSetCookie(res: Response) {
  const h = res.headers as Headers & { getSetCookie?: () => string[] };
  const cookies = h.getSetCookie ? h.getSetCookie() : (res.headers.get('set-cookie') ? [res.headers.get('set-cookie')!] : []);
  for (const c of cookies) {
    const kv = c.split(';')[0];
    const eq = kv.indexOf('=');
    if (eq > 0) jar.set(kv.slice(0, eq).trim(), kv.slice(eq + 1).trim());
  }
}

async function http(method: string, path: string, opts: { body?: unknown; instId?: string; noCookie?: boolean } = {}) {
  // Origin must be a trusted origin or Better Auth rejects state-changing calls (CSRF).
  const headers: Record<string, string> = { 'content-type': 'application/json', origin: BASE };
  if (!opts.noCookie && jar.size) headers.cookie = cookieHeader();
  if (opts.instId) headers['x-institution-id'] = opts.instId;
  const res = await fetch(`${BASE}${path}`, { method, headers, body: opts.body ? JSON.stringify(opts.body) : undefined, redirect: 'manual' });
  absorbSetCookie(res);
  let json: unknown = null;
  try { json = await res.json(); } catch { /* non-json */ }
  return { status: res.status, json: json as Record<string, unknown> | null };
}

const NEW_MODULES: Array<{ key: string; getPath: string }> = [
  { key: 'hostel', getPath: '/api/v1/hostel/blocks' },
  { key: 'inventory', getPath: '/api/v1/inventory/categories' },
  { key: 'health', getPath: '/api/v1/health-module/visits' },
  { key: 'visitor', getPath: '/api/v1/visitor/logs' },
  { key: 'gradebook_cce', getPath: '/api/v1/gradebook/assessments' },
  { key: 'notices_events', getPath: '/api/v1/notices/notices' },
  { key: 'reports_bi', getPath: '/api/v1/reports/overview' },
  { key: 'alumni', getPath: '/api/v1/alumni/' },
  { key: 'placement', getPath: '/api/v1/placement/drives' },
  { key: 'attendance_biometric', getPath: '/api/v1/biometric/devices' },
  { key: 'fees_advanced', getPath: '/api/v1/fees-advanced/concessions' },
  { key: 'live_classes', getPath: '/api/v1/live-classes/' },
  { key: 'mobile_app', getPath: '/api/v1/mobile-app/config' },
  { key: 'assessments_online', getPath: '/api/v1/online-tests/questions' },
];
const ALL_KEYS = ['alumni', 'assessments_online', 'assignments', 'attendance_biometric', 'fees_advanced', 'gradebook_cce', 'health', 'hostel', 'inventory', 'live_classes', 'mobile_app', 'notices_events', 'placement', 'reports_bi', 'visitor'];

async function main() {
  const tag = randomBytes(4).toString('hex');
  const email = `livetest-${tag}@example.test`;
  const password = 'LiveTest!2026xyz';

  // 0. Unauthenticated call must be 401.
  const unauth = await http('GET', '/api/v1/hostel/blocks', { noCookie: true, instId: 'x' });
  check('auth: unauthenticated → 401', unauth.status === 401, `status=${unauth.status}`);

  // 1. Sign up via Better Auth (autoSignIn=true → sets session cookie).
  const signup = await http('POST', '/api/auth/sign-up/email', { body: { email, password, name: 'Live Tester' } });
  check('auth: sign-up issues session cookie', jar.size > 0 && (signup.status === 200 || signup.status === 201), `status=${signup.status}, cookies=${jar.size}`);

  // 2. Promote to super_admin (DB) — getSession reads globalRole fresh each request.
  const me = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (!me) throw new Error('signed-up user not found in DB');
  await prisma.user.update({ where: { id: me.id }, data: { globalRole: 'super_admin' } });

  // 3. Create two institutions: A (target, will get all modules) + B (control, starter/no grants).
  const instA = await prisma.institution.create({ data: { name: `Live A ${tag}`, code: `LIVE-A-${tag}`, institutionType: 'SCHOOL', subscriptionTier: 'enterprise', enabledFields: {}, customFields: {}, enabledServices: [] } });
  const instB = await prisma.institution.create({ data: { name: `Live B ${tag}`, code: `LIVE-B-${tag}`, institutionType: 'SCHOOL', subscriptionTier: 'starter', enabledFields: {}, customFields: {}, enabledServices: [] } });

  // 4. Super-admin verified: hit the admin catalog (super-admin-gated route).
  const catalog = await http('GET', '/api/v1/admin/modules/catalog');
  check('rbac: super-admin reaches admin catalog', catalog.status === 200 && Array.isArray(catalog.json?.data), `status=${catalog.status}`);

  // 5. Enable all new modules on A via the real admin entitlements API.
  const setEnt = await http('PUT', `/api/v1/admin/institutions/${instA.id}/entitlements`, { body: { tier: 'enterprise', grants: ALL_KEYS } });
  check('entitlements: admin grant write succeeds', setEnt.status === 200, `status=${setEnt.status}`);

  // 6. /entitlements/me reflects the grants — but ONLY for modules applicable to
  // the institution's type. alumni/placement/live_classes are higher-ed and must
  // NOT be enabled for a SCHOOL even when explicitly granted (institutionType
  // filter takes precedence — the core multi-tenant guard).
  const SCHOOL = InstitutionType.SCHOOL;
  const applicableKeys = ALL_KEYS.filter((k) => isApplicable(k, SCHOOL));
  const nonApplicableKeys = ALL_KEYS.filter((k) => !isApplicable(k, SCHOOL));
  const entMe = await http('GET', '/api/v1/entitlements/me', { instId: instA.id });
  const enabled = (entMe.json?.data as { enabledModules?: string[] } | undefined)?.enabledModules ?? [];
  const applicableAllEnabled = applicableKeys.every((k) => enabled.includes(k));
  const nonApplicableAllExcluded = nonApplicableKeys.every((k) => !enabled.includes(k));
  check('entitlements: /me enables granted+applicable, excludes non-applicable', entMe.status === 200 && applicableAllEnabled && nonApplicableAllExcluded, `applicable=${applicableKeys.length} all-on=${applicableAllEnabled}; higher-ed-excluded=${nonApplicableAllExcluded} (${nonApplicableKeys.join(',')})`);

  // 7. Per-module reachability on A: applicable → reachable (not 401/403/404);
  //    non-applicable (higher-ed) → 403 even though granted.
  let okApplicable = 0;
  let okGatedByType = 0;
  let nApplicable = 0;
  let nByType = 0;
  for (const m of NEW_MODULES) {
    const applicable = isApplicable(m.key, SCHOOL);
    const r = await http('GET', m.getPath, { instId: instA.id });
    if (applicable) {
      nApplicable += 1;
      if (r.status !== 401 && r.status !== 403 && r.status !== 404) okApplicable += 1;
      else console.log(`   · APPLICABLE ${m.key} ${m.getPath} → ${r.status} (expected reachable)`);
    } else {
      nByType += 1;
      if (r.status === 403) okGatedByType += 1;
      else console.log(`   · HIGHER-ED ${m.key} ${m.getPath} → ${r.status} (expected 403)`);
    }
  }
  check('modules: applicable endpoints reachable on enabled SCHOOL', okApplicable === nApplicable, `${okApplicable}/${nApplicable}`);
  check('modules: higher-ed endpoints 403 on SCHOOL despite grant', okGatedByType === nByType, `${okGatedByType}/${nByType}`);

  // 8. Gating: an applicable module on B (no grants, starter) → 403.
  const gated = await http('GET', '/api/v1/biometric/devices', { instId: instB.id });
  check('entitlements: ungranted module on control institution → 403', gated.status === 403, `status=${gated.status}`);

  // 9. Real write→read round trip through HTTP (hostel block).
  const blockName = `Block-${tag}`;
  const create = await http('POST', '/api/v1/hostel/blocks', { instId: instA.id, body: { name: blockName, type: 'boys', totalRooms: 10 } });
  const list = await http('GET', '/api/v1/hostel/blocks', { instId: instA.id });
  const found = Array.isArray(list.json?.data) && (list.json!.data as Array<{ name: string }>).some((b) => b.name === blockName);
  check('round-trip: POST hostel block then GET shows it', (create.status === 200 || create.status === 201) && found, `create=${create.status}, found=${found}`);

  // ── Cleanup ──────────────────────────────────────────────────────────────────
  await prisma.hostelRoom.deleteMany({ where: { institutionId: instA.id } }).catch(() => {});
  await prisma.hostelBlock.deleteMany({ where: { institutionId: instA.id } }).catch(() => {});
  await prisma.userInstitutionRole.deleteMany({ where: { userId: me.id } }).catch(() => {});
  await prisma.institution.deleteMany({ where: { id: { in: [instA.id, instB.id] } } }).catch(() => {});
  await prisma.session.deleteMany({ where: { userId: me.id } }).catch(() => {});
  await prisma.account.deleteMany({ where: { userId: me.id } }).catch(() => {});
  await prisma.user.delete({ where: { id: me.id } }).catch(() => {});

  const passed = results.filter((r) => r.pass).length;
  console.log(`\n=== ${passed}/${results.length} live HTTP checks passed ===\n`);
  return passed === results.length;
}

main()
  .then(async (ok) => { await prisma.$disconnect(); process.exit(ok ? 0 : 1); })
  .catch(async (err) => { console.error('LIVE TEST ERROR:', err); await prisma.$disconnect().catch(() => {}); process.exit(1); });
