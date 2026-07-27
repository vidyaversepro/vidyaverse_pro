/**
 * Integrations connector smoke test — config round-trip via moduleConfig +
 * graceful health checks (unreachable URL must NOT throw; unconfigured key
 * reports configured:false).
 *
 * Run: tsx src/scripts/smoke-integrations.ts
 */
import { prisma } from '../config/database.js';
import { integrationsService } from '../modules/integrations/integrations.service.js';

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

  // 1. Config round-trip (library) — healthUrl points at a closed port on purpose.
  await integrationsService.setConfig(inst.id, 'library', { baseUrl: 'http://localhost:3333', healthUrl: 'http://127.0.0.1:59999', tenantRef: 'demo-school.edu' });
  const cfg = await integrationsService.getConfig(inst.id, 'library');
  check('config round-trip', cfg.baseUrl === 'http://localhost:3333' && cfg.tenantRef === 'demo-school.edu', `baseUrl=${cfg.baseUrl}, tenantRef=${cfg.tenantRef}`);

  // 2. Health check against unreachable URL must degrade gracefully (no throw).
  const health = await integrationsService.checkHealth(inst.id, 'library');
  check('health graceful on unreachable', health.configured === true && health.reachable === false, `configured=${health.configured}, reachable=${health.reachable}`);

  // 3. Unconfigured key reports configured:false.
  await integrationsService.setConfig(inst.id, 'ai_tutor', {});
  const health2 = await integrationsService.checkHealth(inst.id, 'ai_tutor');
  check('unconfigured key', health2.configured === false && health2.reachable === false, `configured=${health2.configured}`);

  // 4. Both integrations stored independently in moduleConfig.
  const lib = await integrationsService.getConfig(inst.id, 'library');
  const ai = await integrationsService.getConfig(inst.id, 'ai_tutor');
  check('independent config slots', lib.baseUrl === 'http://localhost:3333' && !ai.baseUrl, `library set, ai_tutor empty`);

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
