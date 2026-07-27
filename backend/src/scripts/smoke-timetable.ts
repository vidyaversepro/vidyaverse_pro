/**
 * Timetable smoke test — periods, slot assignment, teacher double-booking clash
 * rejection, section/teacher timetables, substitution.
 *
 * Run: tsx src/scripts/smoke-timetable.ts
 */
import crypto from 'crypto';
import { prisma } from '../config/database.js';
import { timetableService } from '../modules/timetable/timetable.service.js';

const results: Array<{ name: string; pass: boolean; detail: string }> = [];
function check(name: string, pass: boolean, detail: string) {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name} — ${detail}`);
}

async function ensurePeriod(institutionId: string, name: string, start: string, end: string, seq: number) {
  const existing = await prisma.timetablePeriod.findFirst({ where: { institutionId, name } });
  return existing ?? timetableService.createPeriod(institutionId, { name, startTime: start, endTime: end, sequence: seq });
}

async function main() {
  const inst = await prisma.institution.upsert({
    where: { code: 'VV-SMOKE' },
    update: {},
    create: { name: 'Smoke Test School', code: 'VV-SMOKE', enabledFields: {}, customFields: {}, enabledServices: [] },
  });
  const klass = await prisma.class.upsert({ where: { institutionId_name: { institutionId: inst.id, name: 'Class 5' } }, update: {}, create: { institutionId: inst.id, name: 'Class 5' } });
  let sectionA = await prisma.section.findFirst({ where: { classId: klass.id, name: 'A' } });
  sectionA ??= await prisma.section.create({ data: { institutionId: inst.id, classId: klass.id, name: 'A' } });
  let sectionB = await prisma.section.findFirst({ where: { classId: klass.id, name: 'B' } });
  sectionB ??= await prisma.section.create({ data: { institutionId: inst.id, classId: klass.id, name: 'B' } });

  const teacher1 = crypto.randomUUID();
  const teacher2 = crypto.randomUUID();

  // 1. Periods
  const p1 = await ensurePeriod(inst.id, 'Period 1', '08:00', '08:45', 1);
  await ensurePeriod(inst.id, 'Period 2', '08:45', '09:30', 2);
  const periods = await timetableService.listPeriods(inst.id);
  check('periods created', periods.length >= 2, `periods=${periods.length}`);

  // 2. Slot assignment
  const slot = await timetableService.setSlot(inst.id, { sectionId: sectionA.id, dayOfWeek: 'monday', periodId: p1.id, subjectName: 'Mathematics', teacherId: teacher1, room: 'R101' });
  check('slot assigned', slot.subjectName === 'Mathematics' && slot.teacherId === teacher1, `subject=${slot.subjectName}`);

  // 3. Teacher double-booking clash rejected (same teacher, same day+period, other section)
  let clashRejected = false;
  try {
    await timetableService.setSlot(inst.id, { sectionId: sectionB.id, dayOfWeek: 'monday', periodId: p1.id, subjectName: 'Science', teacherId: teacher1 });
  } catch {
    clashRejected = true;
  }
  check('teacher double-booking rejected', clashRejected, `rejected=${clashRejected}`);

  // 4. Section + teacher timetables
  const sectionTT = await timetableService.getSectionTimetable(inst.id, sectionA.id);
  const teacherTT = await timetableService.getTeacherTimetable(inst.id, teacher1);
  check('section + teacher timetables', sectionTT.length >= 1 && teacherTT.length >= 1 && !!sectionTT[0].period, `section=${sectionTT.length}, teacher=${teacherTT.length}`);

  // 5. Substitution (substitute teacher2 is free that period)
  const sub = await timetableService.createSubstitution(inst.id, { slotId: slot.id, date: '2026-06-10', substituteTeacherId: teacher2, reason: 'Teacher on leave' });
  check('substitution created', sub.slotId === slot.id && sub.originalTeacherId === teacher1 && sub.substituteTeacherId === teacher2, `orig=${sub.originalTeacherId === teacher1}, sub set=${!!sub.substituteTeacherId}`);

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
