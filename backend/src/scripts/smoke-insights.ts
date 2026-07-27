/**
 * Insights cluster smoke test — notices_events, reports_bi, alumni, placement.
 *
 * Run: tsx src/scripts/smoke-insights.ts
 */
import { randomBytes } from 'node:crypto';
import { prisma } from '../config/database.js';
import { noticesService } from '../modules/notices/notices.service.js';
import { reportsService } from '../modules/reports/reports.service.js';
import { alumniService } from '../modules/alumni/alumni.service.js';
import { placementService } from '../modules/placement/placement.service.js';

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

  // ── Notices & Calendar ────────────────────────────────────────────────────────
  const notice = await noticesService.createNotice(inst.id, { title: 'Annual Day', body: 'Annual Day on 15 Dec', category: 'event', audience: 'parents', isPinned: true });
  const activeNotices = await noticesService.listNotices(inst.id, { activeOnly: true });
  check('notices: published + pinned shows in active', activeNotices.some((n) => n.id === notice.id && n.isPinned), `active=${activeNotices.length}`);

  await noticesService.createEvent(inst.id, { title: 'Diwali Break', eventType: 'holiday', eventDate: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10) });
  const upcoming = await noticesService.upcomingEvents(inst.id, 30);
  check('calendar: upcoming event within window', upcoming.some((e) => e.title === 'Diwali Break'), `upcoming=${upcoming.length}`);

  // ── Reports / BI ─────────────────────────────────────────────────────────────
  // seed a little data
  const klass = await prisma.class.upsert({ where: { institutionId_name: { institutionId: inst.id, name: 'Class 12' } }, update: {}, create: { institutionId: inst.id, name: 'Class 12' } });
  let section = await prisma.section.findFirst({ where: { classId: klass.id, name: 'A' } });
  section ??= await prisma.section.create({ data: { institutionId: inst.id, classId: klass.id, name: 'A' } });
  const student = await prisma.student.create({ data: { institutionId: inst.id, sectionId: section.id, name: `BI Student ${randomBytes(2).toString('hex')}`, status: 'active', customData: {} } });
  await prisma.enquiry.create({ data: { institutionId: inst.id, enquiryNumber: `ENQ-${Date.now()}`, studentName: 'Lead A', phone: '919800000001', status: 'admitted' } });
  await prisma.staffMember.create({ data: { institutionId: inst.id, employeeCode: `EMP-${Date.now()}`, firstName: 'Asha', department: 'Science' } });

  const overview = await reportsService.overview(inst.id);
  check('reports: overview KPIs computed', overview.activeStudents >= 1 && overview.staffCount >= 1 && overview.totalEnquiries >= 1, `students=${overview.activeStudents}, staff=${overview.staffCount}, enq=${overview.totalEnquiries}`);

  const funnel = await reportsService.admissionsFunnel(inst.id);
  check('reports: admissions funnel + conversion', funnel.total >= 1 && funnel.conversionRate >= 0, `total=${funnel.total}, conv=${funnel.conversionRate}%`);

  const dept = await reportsService.staffByDepartment(inst.id);
  check('reports: staff grouped by department', dept.some((d) => d.department === 'Science'), `depts=${dept.length}`);

  const saved = await reportsService.saveReport(inst.id, { name: 'My Fee Report', reportType: 'fee-collection' });
  const savedList = await reportsService.listSavedReports(inst.id);
  check('reports: saved report persists', savedList.some((r) => r.id === saved.id), `saved=${savedList.length}`);

  // ── Alumni ─────────────────────────────────────────────────────────────────────
  await alumniService.create(inst.id, { name: 'Rahul Verma', graduationYear: 2018, currentOrganization: 'Infosys', willingToMentor: true });
  await alumniService.create(inst.id, { name: 'Sneha Gupta', graduationYear: 2019, willingToMentor: false });
  const mentors = await alumniService.list(inst.id, { mentorsOnly: true });
  const alumniStats = await alumniService.stats(inst.id);
  check('alumni: mentors filter + stats', mentors.length === 1 && alumniStats.total >= 2 && alumniStats.mentors >= 1, `mentors=${mentors.length}, total=${alumniStats.total}`);

  const aevent = await alumniService.createEvent(inst.id, { title: 'Alumni Meet 2026', eventDate: '2026-12-20' });
  const rsvped = await alumniService.rsvp(inst.id, aevent.id);
  check('alumni: event rsvp increments', rsvped.rsvpCount === 1, `rsvp=${rsvped.rsvpCount}`);

  // ── Placement ──────────────────────────────────────────────────────────────────
  const drive = await placementService.createDrive(inst.id, { companyName: 'TCS', role: 'Software Engineer', packageLpa: 7.5, eligibilityCriteria: '60% throughout' });
  await placementService.apply(inst.id, drive.id, student.id);
  const apps = await placementService.listApplications(inst.id, drive.id);
  check('placement: drive + application', apps.length === 1 && apps[0].status === 'applied', `apps=${apps.length}`);

  const selected = await placementService.setApplicationStatus(inst.id, apps[0].id, 'selected');
  const pstats = await placementService.stats(inst.id);
  check('placement: select + stats (highest package)', selected.status === 'selected' && pstats.selected >= 1 && pstats.highestPackageLpa === 7.5, `selected=${pstats.selected}, top=${pstats.highestPackageLpa}`);

  // ── Cleanup ─────────────────────────────────────────────────────────────────
  await prisma.placementApplication.deleteMany({ where: { institutionId: inst.id } });
  await prisma.placementDrive.deleteMany({ where: { institutionId: inst.id } });
  await prisma.alumniEvent.deleteMany({ where: { institutionId: inst.id } });
  await prisma.alumni.deleteMany({ where: { institutionId: inst.id } });
  await prisma.savedReport.deleteMany({ where: { institutionId: inst.id } });
  await prisma.calendarEvent.deleteMany({ where: { institutionId: inst.id } });
  await prisma.notice.deleteMany({ where: { institutionId: inst.id } });
  await prisma.enquiry.deleteMany({ where: { institutionId: inst.id } });
  await prisma.staffMember.deleteMany({ where: { institutionId: inst.id } });
  await prisma.student.deleteMany({ where: { id: student.id } });

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
