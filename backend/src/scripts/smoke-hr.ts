/**
 * HR & Payroll smoke test — staff, salary structure, payslip computation
 * (gross/PF/PT/net), bulk payroll run (idempotent), leave request + approval.
 *
 * Run: tsx src/scripts/smoke-hr.ts
 */
import { prisma } from '../config/database.js';
import { hrService } from '../modules/hr/hr.service.js';

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

  // 1. Staff (idempotent on employeeCode)
  let staff = await prisma.staffMember.findFirst({ where: { institutionId: inst.id, employeeCode: 'EMP-SMOKE-001' } });
  if (!staff) {
    staff = await hrService.createStaff(inst.id, { employeeCode: 'EMP-SMOKE-001', firstName: 'Meena', lastName: 'Iyer', designation: 'Teacher', department: 'Science' });
  }
  check('create staff', !!staff && staff.employeeCode === 'EMP-SMOKE-001', `code=${staff.employeeCode}`);

  // 2. Salary structure
  await hrService.setSalaryStructure(inst.id, staff.id, {
    basic: 30000, hra: 12000, conveyance: 1600, special: 5000,
    pfEnabled: true, esiEnabled: false, professionalTax: 200,
  });

  // 3. Payslip math: gross 48600; PF = 12% of min(30000,15000)=1800; PT 200; net 46600
  const payslip = await hrService.generatePayslip(inst.id, staff.id, 6, 2026);
  const gross = Number(payslip.grossEarnings);
  const ded = Number(payslip.totalDeductions);
  const net = Number(payslip.netPay);
  check('payslip computation', gross === 48600 && ded === 2000 && net === 46600, `gross=${gross}, deductions=${ded} (PF1800+PT200), net=${net}`);

  // 4. Bulk payroll run (idempotent upsert)
  const run = await hrService.runPayroll(inst.id, 6, 2026);
  check('bulk payroll run', run.generated >= 1, `generated=${run.generated}, skipped=${run.skipped}, staff=${run.totalStaff}`);

  // 5. Leave request + approval
  const leave = await hrService.requestLeave(inst.id, staff.id, { type: 'casual', fromDate: '2026-06-01', toDate: '2026-06-03', reason: 'Family function' });
  const reviewed = await hrService.reviewLeave(inst.id, leave.id, 'approved');
  check('leave request + approval', leave.days === 3 && reviewed.status === 'approved', `days=${leave.days}, status=${reviewed.status}`);

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
