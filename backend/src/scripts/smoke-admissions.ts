/**
 * Admissions CRM smoke test. Verifies enquiry CRUD + activity timeline,
 * status-change logging, pipeline stats, WhatsApp lead capture + dedupe,
 * and convert-to-student.
 *
 * Run: tsx src/scripts/smoke-admissions.ts
 */
import { prisma } from '../config/database.js';
import { admissionsService } from '../modules/admissions/admissions.service.js';

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
  const klass = await prisma.class.upsert({
    where: { institutionId_name: { institutionId: inst.id, name: 'Class 5' } },
    update: {}, create: { institutionId: inst.id, name: 'Class 5' },
  });
  let section = await prisma.section.findFirst({ where: { classId: klass.id, name: 'A' } });
  section ??= await prisma.section.create({ data: { institutionId: inst.id, classId: klass.id, name: 'A' } });

  // 1. Create enquiry + initial activity
  const enq = await admissionsService.createEnquiry(inst.id, { studentName: 'Riya Verma', guardianName: 'Anil Verma', phone: '919812300011', classInterested: 'Class 6', source: 'walk_in' });
  check('create enquiry', enq.status === 'new' && !!enq.enquiryNumber, `status=${enq.status}, no=${enq.enquiryNumber}`);

  const detail1 = await admissionsService.getEnquiry(inst.id, enq.id);
  check('initial activity logged', detail1.activities.length === 1 && detail1.activities[0].type === 'created', `activities=${detail1.activities.length}`);

  // 2. Add a note
  await admissionsService.addActivity(inst.id, enq.id, { type: 'call', description: 'Called parent, interested' });
  // 3. Status change logs an activity
  await admissionsService.updateEnquiry(inst.id, enq.id, { status: 'contacted' });
  const detail2 = await admissionsService.getEnquiry(inst.id, enq.id);
  const hasStatusChange = detail2.activities.some((a) => a.type === 'status_change');
  check('activity + status-change logging', detail2.activities.length >= 3 && hasStatusChange && detail2.status === 'contacted', `activities=${detail2.activities.length}, status=${detail2.status}`);

  // 4. Pipeline stats
  const stats = await admissionsService.pipelineStats(inst.id);
  check('pipeline stats', stats.total >= 1 && stats.byStatus.contacted >= 1, `total=${stats.total}, contacted=${stats.byStatus.contacted}`);

  // 5. WhatsApp capture + dedupe
  const waPhone = `9198${Date.now().toString().slice(-8)}`;
  const lead1 = await admissionsService.captureFromWhatsApp(inst.id, `+${waPhone}`, undefined, 'Admission ke baare me jankari chahiye');
  const lead2 = await admissionsService.captureFromWhatsApp(inst.id, waPhone, undefined, 'Fees kitni hai?');
  const leadDetail = await admissionsService.getEnquiry(inst.id, lead1.id);
  check('whatsapp capture + dedupe', lead1.id === lead2.id && lead1.source === 'whatsapp' && leadDetail.activities.length >= 2, `sameLead=${lead1.id === lead2.id}, source=${lead1.source}`);

  // 6. Convert to student
  const enq2 = await admissionsService.createEnquiry(inst.id, { studentName: 'Karan Singh', phone: '919812300022', source: 'referral' });
  const conv = await admissionsService.convertToStudent(inst.id, enq2.id, { sectionId: section.id });
  const enq2After = await admissionsService.getEnquiry(inst.id, enq2.id);
  const conv2 = await admissionsService.convertToStudent(inst.id, enq2.id, { sectionId: section.id });
  check(
    'convert to student (idempotent)',
    conv.ok === true && enq2After.status === 'admitted' && !!enq2After.convertedStudentId && conv2.ok === false,
    `converted=${conv.ok}, status=${enq2After.status}, reConvert=${conv2.ok}`,
  );

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
