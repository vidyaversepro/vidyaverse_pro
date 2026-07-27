/**
 * Online Tests + Question Bank smoke test (assessments_online).
 * Verifies question bank, test composition (totalMarks summed), attempt start
 * (gated on published), and MCQ/true_false auto-grading.
 *
 * Run: tsx src/scripts/smoke-online-tests.ts
 */
import { randomBytes } from 'node:crypto';
import { prisma } from '../config/database.js';
import { onlineTestsService } from '../modules/online-tests/online-tests.service.js';

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
  const studentId = uuid();

  // 1. Question bank — 2 MCQ + 1 true_false.
  const q1 = await onlineTestsService.createQuestion(inst.id, { subject: 'Science', questionText: 'H2O is?', type: 'mcq', options: [{ key: 'A', text: 'Water' }, { key: 'B', text: 'Salt' }], correctOption: 'A', marks: 2 });
  const q2 = await onlineTestsService.createQuestion(inst.id, { subject: 'Science', questionText: 'Speed of light is constant?', type: 'true_false', correctOption: 'true', marks: 3 });
  const q3 = await onlineTestsService.createQuestion(inst.id, { subject: 'Science', questionText: 'Sun rises in?', type: 'mcq', options: [{ key: 'A', text: 'West' }, { key: 'B', text: 'East' }], correctOption: 'B', marks: 5 });
  const qList = await onlineTestsService.listQuestions(inst.id, { subject: 'Science' });
  check('question bank: create + list', qList.length >= 3, `count=${qList.length}`);

  // 2. Objective question requires correctOption.
  let rejected = false;
  try { await onlineTestsService.createQuestion(inst.id, { subject: 'X', questionText: 'no answer', type: 'mcq' }); } catch { rejected = true; }
  check('question: objective requires correctOption', rejected, `rejected=${rejected}`);

  // 3. Test composition: totalMarks = 2+3+5 = 10.
  const test = await onlineTestsService.createTest(inst.id, { title: 'Science Quiz', subject: 'Science', questionIds: [q1.id, q2.id, q3.id], durationMins: 20 });
  check('test: totalMarks summed from questions', test.totalMarks === 10, `totalMarks=${test.totalMarks}`);

  // 4. Attempt blocked while draft.
  let blocked = false;
  try { await onlineTestsService.startAttempt(inst.id, test.id, studentId); } catch { blocked = true; }
  check('attempt: blocked while test is draft', blocked, `blocked=${blocked}`);

  // 5. Publish → start attempt.
  await onlineTestsService.setTestStatus(inst.id, test.id, 'published');
  const attempt = await onlineTestsService.startAttempt(inst.id, test.id, studentId);
  check('attempt: starts after publish (maxScore set)', attempt.status === 'in_progress' && attempt.maxScore === 10, `status=${attempt.status}, maxScore=${attempt.maxScore}`);

  // 6. Submit with q1 correct (A), q2 wrong (false), q3 correct (B) → 2 + 0 + 5 = 7, fully graded.
  const graded = await onlineTestsService.submitAttempt(inst.id, attempt.id, { [q1.id]: 'A', [q2.id]: 'false', [q3.id]: 'B' });
  check('attempt: auto-grades objective answers (7/10) + graded', graded.score === 7 && graded.status === 'graded', `score=${graded.score}, status=${graded.status}`);

  // 7. Double-submit blocked.
  let resub = false;
  try { await onlineTestsService.submitAttempt(inst.id, attempt.id, {}); } catch { resub = true; }
  check('attempt: re-submit blocked', resub, `resub=${resub}`);

  // 8. short_answer present → status stays submitted (awaiting manual).
  const sa = await onlineTestsService.createQuestion(inst.id, { subject: 'Eng', questionText: 'Define noun', type: 'short_answer', marks: 4 });
  const t2 = await onlineTestsService.createTest(inst.id, { title: 'Eng', questionIds: [q1.id, sa.id] });
  await onlineTestsService.setTestStatus(inst.id, t2.id, 'published');
  const a2 = await onlineTestsService.startAttempt(inst.id, t2.id, uuid());
  const sub2 = await onlineTestsService.submitAttempt(inst.id, a2.id, { [q1.id]: 'A' });
  check('attempt: short_answer keeps status submitted (manual grade)', sub2.status === 'submitted' && sub2.score === 2, `status=${sub2.status}, score=${sub2.score}`);

  // Cleanup
  await prisma.onlineTestAttempt.deleteMany({ where: { institutionId: inst.id } });
  await prisma.onlineTest.deleteMany({ where: { institutionId: inst.id } });
  await prisma.questionBankItem.deleteMany({ where: { institutionId: inst.id } });

  const passed = results.filter((r) => r.pass).length;
  console.log(`\n=== ${passed}/${results.length} checks passed ===\n`);
  return passed === results.length;
}

main()
  .then(async (ok) => { await prisma.$disconnect(); process.exit(ok ? 0 : 1); })
  .catch(async (err) => { console.error('SMOKE TEST ERROR:', err); await prisma.$disconnect().catch(() => {}); process.exit(1); });
