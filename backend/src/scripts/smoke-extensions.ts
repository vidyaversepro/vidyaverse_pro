/**
 * Extensions cluster smoke test — biometric, fees-advanced, live-classes, mobile-app.
 *
 * Run: tsx src/scripts/smoke-extensions.ts
 */
import { randomBytes } from 'node:crypto';
import { prisma } from '../config/database.js';
import { biometricService } from '../modules/biometric/biometric.service.js';
import { feesAdvancedService } from '../modules/fees-advanced/fees-advanced.service.js';
import { liveClassesService } from '../modules/live-classes/live-classes.service.js';
import { mobileAppService } from '../modules/mobile-app/mobile-app.service.js';

const results: Array<{ name: string; pass: boolean; detail: string }> = [];
function check(name: string, pass: boolean, detail: string) {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name} — ${detail}`);
}
const uuid = () => randomBytes(16).toString('hex').replace(/(.{8})(.{4})(.{4})(.{4})(.{12}).*/, '$1-$2-$3-$4-$5');

async function main() {
  const inst = await prisma.institution.upsert({
    where: { code: 'VV-SMOKE' },
    update: {},
    create: { name: 'Smoke Test School', code: 'VV-SMOKE', enabledFields: {}, customFields: {}, enabledServices: [] },
  });
  const staffId = uuid();
  const studentId = uuid();
  const sectionId = uuid();
  const today = new Date().toISOString().slice(0, 10);

  // ── Biometric ────────────────────────────────────────────────────────────────
  const device = await biometricService.registerDevice(inst.id, { name: 'Main Gate Scanner', deviceType: 'rfid', location: 'Entrance' });
  await biometricService.recordPunch(inst.id, { deviceId: device.id, personType: 'staff', personId: staffId, direction: 'in' });
  const punches = await biometricService.listPunches(inst.id, { personId: staffId });
  check('biometric: device + punch recorded', punches.length >= 1, `punches=${punches.length}`);

  const staffAtt = await biometricService.staffAttendanceForDate(inst.id, today);
  check('biometric: staff punch auto-creates attendance (present)', staffAtt.summary.present >= 1, `present=${staffAtt.summary.present}`);

  await biometricService.markStaffAttendance(inst.id, { staffId: uuid(), attendanceDate: today, status: 'leave' });
  const staffAtt2 = await biometricService.staffAttendanceForDate(inst.id, today);
  check('biometric: manual leave mark reflected', staffAtt2.summary.leave >= 1, `leave=${staffAtt2.summary.leave}`);

  // ── Fees advanced ──────────────────────────────────────────────────────────────
  const concession = await feesAdvancedService.createConcession(inst.id, { studentId, name: 'Merit Scholarship', type: 'merit', percent: 25, academicYear: '2026-2027' });
  check('fees: concession created (percent)', Number(concession.percent) === 25, `percent=${concession.percent}`);

  const plan = await feesAdvancedService.createInstallmentPlan(inst.id, { studentId, totalAmount: 30000, numInstallments: 3, academicYear: '2026-2027', firstDueDate: '2026-01-15' });
  const sum = plan.installments.reduce((s, i) => s + Number(i.amount), 0);
  check('fees: installment plan splits evenly (sum = total)', plan.installments.length === 3 && Math.abs(sum - 30000) < 0.01, `n=${plan.installments.length}, sum=${sum}`);

  await feesAdvancedService.markInstallmentPaid(inst.id, plan.installments[0].id);
  const plans = await feesAdvancedService.listPlans(inst.id, studentId);
  const paidCount = plans[0].installments.filter((i) => i.status === 'paid').length;
  check('fees: installment marked paid', paidCount === 1, `paid=${paidCount}`);

  // Defaulters: the firstDueDate 2026-01-15 is in the past relative to 2026-05-30, so
  // remaining unpaid installments flip to overdue.
  const defaulters = await feesAdvancedService.getDefaulters(inst.id);
  check('fees: defaulter detection flips past-due to overdue', defaulters.overdueInstallments.length >= 1, `overdue=${defaulters.overdueInstallments.length}`);

  // ── Live classes ───────────────────────────────────────────────────────────────
  const live = await liveClassesService.schedule(inst.id, { sectionId, subjectName: 'Physics', title: 'Optics Revision', platform: 'meet', joinUrl: 'https://meet.example/abc', scheduledAt: new Date(Date.now() + 3600000).toISOString(), durationMins: 60 });
  const upcoming = await liveClassesService.list(inst.id, { upcoming: true });
  check('live-classes: scheduled appears in upcoming', upcoming.some((c) => c.id === live.id), `upcoming=${upcoming.length}`);

  const ended = await liveClassesService.attachRecording(inst.id, live.id, 'https://rec.example/abc.mp4');
  check('live-classes: recording attach ends class', ended.status === 'ended' && !!ended.recordingUrl, `status=${ended.status}`);

  // ── Mobile app config ────────────────────────────────────────────────────────────
  await mobileAppService.setConfig(inst.id, { androidUrl: 'https://play.google.com/x', forceUpdate: true, minSupportedVersion: '2.1.0', enabledFeatures: ['fees', 'notices'] });
  const got = await mobileAppService.getConfig(inst.id);
  check('mobile-app: config round-trips via moduleConfig', got.androidUrl === 'https://play.google.com/x' && got.forceUpdate === true && got.enabledFeatures?.length === 2, `android=${got.androidUrl}, force=${got.forceUpdate}`);

  // ── Cleanup ─────────────────────────────────────────────────────────────────
  await prisma.liveClass.deleteMany({ where: { institutionId: inst.id } });
  await prisma.feeInstallment.deleteMany({ where: { institutionId: inst.id } });
  await prisma.feeInstallmentPlan.deleteMany({ where: { institutionId: inst.id } });
  await prisma.feeConcession.deleteMany({ where: { institutionId: inst.id } });
  await prisma.staffAttendance.deleteMany({ where: { institutionId: inst.id } });
  await prisma.biometricPunch.deleteMany({ where: { institutionId: inst.id } });
  await prisma.biometricDevice.deleteMany({ where: { institutionId: inst.id } });
  await prisma.institution.update({ where: { id: inst.id }, data: { moduleConfig: {} } });

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
