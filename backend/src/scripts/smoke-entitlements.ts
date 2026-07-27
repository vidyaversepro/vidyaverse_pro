/**
 * Entitlement engine smoke test. Verifies tier resolution, per-institution
 * grant/revoke overrides, tier changes preserving overrides, institution-type
 * applicability filtering, and core-always-on.
 *
 * Run: tsx src/scripts/smoke-entitlements.ts
 */
import { prisma } from '../config/database.js';
import { entitlementsService } from '../modules/entitlements/entitlements.service.js';

const results: Array<{ name: string; pass: boolean; detail: string }> = [];
function check(name: string, pass: boolean, detail: string) {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name} — ${detail}`);
}

async function main() {
  const inst = await prisma.institution.upsert({
    where: { code: 'VV-SMOKE' },
    update: {},
    create: { name: 'Smoke Test School', code: 'VV-SMOKE', enabledFields: {}, customFields: {}, enabledServices: [] },
  });
  const id = inst.id;

  // Reset to a clean starter baseline.
  await entitlementsService.setEntitlements(id, undefined, { tier: 'starter', grants: [], revokes: [] });

  // 1. Starter defaults include starter modules, exclude pro modules + add-ons.
  let ent = await entitlementsService.getEntitlements(id);
  check(
    'starter tier resolution',
    ent.enabledModules.includes('fees') &&
      ent.enabledModules.includes('whatsapp_messaging') &&
      !ent.enabledModules.includes('transport') &&
      !ent.enabledModules.includes('voice'),
    `fees=${ent.enabledModules.includes('fees')}, transport=${ent.enabledModules.includes('transport')}, voice(addon)=${ent.enabledModules.includes('voice')}`,
  );

  // 2. Core always-on regardless of tier.
  check('core module always enabled', await entitlementsService.isModuleEnabled(id, 'sis'), 'sis=true');

  // 3. Grant an add-on / pro module above tier.
  await entitlementsService.setEntitlements(id, undefined, { grants: ['transport', 'voice'] });
  check(
    'grant override enables module',
    (await entitlementsService.isModuleEnabled(id, 'transport')) && (await entitlementsService.isModuleEnabled(id, 'voice')),
    'transport + voice enabled via grant',
  );

  // 4. Revoke a tier-default module.
  await entitlementsService.setEntitlements(id, undefined, { revokes: ['certificate'] });
  check(
    'revoke override disables default',
    !(await entitlementsService.isModuleEnabled(id, 'certificate')),
    'certificate disabled despite starter default',
  );

  // 5. Tier change reseeds defaults but preserves overrides.
  await entitlementsService.setEntitlements(id, undefined, { tier: 'professional' });
  ent = await entitlementsService.getEntitlements(id);
  check(
    'tier change preserves overrides',
    ent.enabledModules.includes('examination') && // pro default now on
      ent.enabledModules.includes('transport') && // grant persists
      !ent.enabledModules.includes('certificate'), // revoke persists
    `examination=${ent.enabledModules.includes('examination')}, transport(grant)=${ent.enabledModules.includes('transport')}, certificate(revoke)=${ent.enabledModules.includes('certificate')}`,
  );

  // 6. Applicability filter: a SCHOOL cannot get HIGHER_ED-only modules even if granted.
  await entitlementsService.setEntitlements(id, undefined, { grants: ['transport', 'voice', 'alumni'] });
  check(
    'institution-type applicability filter',
    !(await entitlementsService.isModuleEnabled(id, 'alumni')),
    'alumni (college/univ only) stays off for a SCHOOL even when granted',
  );

  // 7. Quota metering: increment advances the counter; over-limit blocks.
  const q1 = await entitlementsService.checkQuota(id, 'whatsapp', 1);
  await entitlementsService.incrementUsage(id, 'whatsapp', 5);
  const q2 = await entitlementsService.checkQuota(id, 'whatsapp', 1);
  const qBlock = await entitlementsService.checkQuota(id, 'whatsapp', 10_000_000);
  check(
    'quota meters + blocks over limit',
    q1.ok && q2.used === q1.used + 5 && !qBlock.ok,
    `used ${q1.used}→${q2.used}, block@10M=${!qBlock.ok}`,
  );

  // Cleanup → back to clean starter.
  await entitlementsService.setEntitlements(id, undefined, { tier: 'starter', grants: [], revokes: [] });

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
