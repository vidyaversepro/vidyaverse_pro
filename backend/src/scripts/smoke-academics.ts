/**
 * Academics cluster smoke test — gradebook (CCE) + assignments.
 *
 * Run: tsx src/scripts/smoke-academics.ts
 */
import { randomBytes } from 'node:crypto';
import { prisma } from '../config/database.js';
import { gradebookService, cbseGrade } from '../modules/gradebook/gradebook.service.js';
import { assignmentsService } from '../modules/assignments/assignments.service.js';

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
  const sectionId = uuid();
  const studentA = uuid();
  const studentB = uuid();

  // ── Grade band sanity ────────────────────────────────────────────────────────
  check('cce: grade bands map correctly', cbseGrade(95) === 'A1' && cbseGrade(75) === 'B1' && cbseGrade(40) === 'D' && cbseGrade(20) === 'E', `95→A1, 75→B1, 40→D, 20→E`);

  // ── Gradebook ─────────────────────────────────────────────────────────────────
  const fa1 = await gradebookService.createAssessment(inst.id, { sectionId, subjectName: 'Mathematics', name: 'FA1 Unit Test', termType: 'FA1', maxMarks: 20, weightage: 10 });
  const sa1 = await gradebookService.createAssessment(inst.id, { sectionId, subjectName: 'Mathematics', name: 'SA1 Exam', termType: 'SA1', maxMarks: 80, weightage: 30 });
  check('cce: assessments created', !!fa1.id && !!sa1.id, `fa1=${fa1.termType}, sa1=${sa1.termType}`);

  const mark = await gradebookService.enterMark(inst.id, { assessmentId: fa1.id, studentId: studentA, marksObtained: 19 });
  check('cce: mark entry auto-grades (19/20 = 95% → A1)', mark.grade === 'A1', `grade=${mark.grade}`);

  const bulk = await gradebookService.bulkEnterMarks(inst.id, sa1.id, [
    { studentId: studentA, marksObtained: 72 },
    { studentId: studentB, marksObtained: 40 },
  ]);
  check('cce: bulk marks saved', bulk.saved === 2, `saved=${bulk.saved}`);

  const report = await gradebookService.getReportCard(inst.id, sectionId, studentA);
  // Maths: FA1 95%*10 + SA1 90%*30 weighted = (9.5+27)/40 = 91.25% → A1
  const maths = report.subjects.find((s) => s.subjectName === 'Mathematics');
  check('cce: report card weights across terms', !!maths && maths.grade === 'A1' && Math.abs(maths.percent - 91.25) < 0.01, `maths=${maths?.percent}% (${maths?.grade})`);

  // ── Assignments ─────────────────────────────────────────────────────────────
  const hw = await assignmentsService.create(inst.id, { sectionId, subjectName: 'Science', title: 'Chapter 3 Worksheet', dueDate: new Date(Date.now() + 86400000).toISOString(), maxMarks: 10, publish: true });
  check('assignment: created + published', hw.status === 'published', `status=${hw.status}`);

  const sub = await assignmentsService.submit(inst.id, hw.id, { studentId: studentA, content: 'My answers' });
  check('assignment: on-time submission', sub.status === 'submitted', `status=${sub.status}`);

  // Late assignment (due in the past)
  const lateHw = await assignmentsService.create(inst.id, { sectionId, subjectName: 'Science', title: 'Overdue Task', dueDate: new Date(Date.now() - 86400000).toISOString(), publish: true });
  const lateSub = await assignmentsService.submit(inst.id, lateHw.id, { studentId: studentA, content: 'Late answers' });
  check('assignment: late submission auto-flagged', lateSub.status === 'late', `status=${lateSub.status}`);

  const graded = await assignmentsService.grade(inst.id, sub.id, { marksObtained: 9, feedback: 'Well done' });
  check('assignment: grading sets marks + status', graded.status === 'graded' && Number(graded.marksObtained) === 9 && !!graded.gradedAt, `status=${graded.status}, marks=${graded.marksObtained}`);

  // Draft-submission guard
  let guarded = false;
  const draft = await assignmentsService.create(inst.id, { sectionId, subjectName: 'English', title: 'Draft only' });
  try { await assignmentsService.submit(inst.id, draft.id, { studentId: studentA }); } catch { guarded = true; }
  check('assignment: rejects submission to unpublished draft', guarded, `threw=${guarded}`);

  // ── Cleanup ─────────────────────────────────────────────────────────────────
  await prisma.assignmentSubmission.deleteMany({ where: { institutionId: inst.id } });
  await prisma.assignment.deleteMany({ where: { institutionId: inst.id } });
  await prisma.cceMark.deleteMany({ where: { institutionId: inst.id } });
  await prisma.cceAssessment.deleteMany({ where: { institutionId: inst.id } });

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
