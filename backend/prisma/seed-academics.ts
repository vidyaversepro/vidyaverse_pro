/**
 * Idempotent academics seed so marksheet + hall ticket have real source data.
 * Creates, for an institution's students: a subject master, one PUBLISHED exam
 * schedule + timetable (exam_subjects), and marks (out of 100) for every student.
 * The calculation engine is created lazily by marksheet.service on first generate.
 *
 * Run from backend/:  npx tsx prisma/seed-academics.ts <institutionId>
 */
import { prisma } from '../src/config/database.js';

const INSTITUTION = process.argv[2];
if (!INSTITUTION) {
    throw new Error('Usage: npx tsx prisma/seed-academics.ts <institutionId> — no default, must be explicit.');
}
const ACADEMIC_YEAR = '2026-2027';
const EXAM_NAME = 'वार्षिक परीक्षा · Annual Examination 2026-27';
const SUBJECTS = [
    { subjectName: 'हिंदी / Hindi', subjectCode: 'HIN' },
    { subjectName: 'English', subjectCode: 'ENG' },
    { subjectName: 'गणित / Mathematics', subjectCode: 'MAT' },
    { subjectName: 'विज्ञान / Science', subjectCode: 'SCI' },
    { subjectName: 'सामाजिक विज्ञान / Social Science', subjectCode: 'SST' },
    { subjectName: 'संस्कृत / Sanskrit', subjectCode: 'SAN' },
];
const EXAM_DATES = ['2027-03-03', '2027-03-05', '2027-03-07', '2027-03-10', '2027-03-11', '2027-03-12'];

/** Deterministic 45–94 mark from the student id + subject index (stable across runs). */
function markFor(studentId: string, i: number): number {
    const h = studentId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return 45 + ((h + i * 13) % 50);
}

async function main() {
    const students = await prisma.student.findMany({
        where: { institutionId: INSTITUTION },
        include: { section: true },
    });
    if (!students.length) throw new Error(`No students for institution ${INSTITUTION}`);
    const classIds = [...new Set(students.map((s) => s.section?.classId).filter(Boolean))] as string[];

    // 1) Subject master per class (idempotent).
    const subjectByClassAndName = new Map<string, { id: string }>();
    for (const classId of classIds) {
        for (const s of SUBJECTS) {
            let subj = await prisma.subject.findFirst({
                where: { institutionId: INSTITUTION, classId, subjectName: s.subjectName },
            });
            if (!subj) {
                subj = await prisma.subject.create({
                    data: {
                        institutionId: INSTITUTION, classId,
                        subjectName: s.subjectName, subjectCode: s.subjectCode,
                        subjectType: 'theory', isMandatory: true,
                    },
                });
            }
            subjectByClassAndName.set(`${classId}|${s.subjectName}`, subj);
        }
    }

    // 2) One PUBLISHED exam schedule (idempotent by name).
    let schedule = await prisma.examSchedule.findFirst({ where: { institutionId: INSTITUTION, examName: EXAM_NAME } });
    if (!schedule) {
        schedule = await prisma.examSchedule.create({
            data: {
                institutionId: INSTITUTION, examName: EXAM_NAME, examType: 'internal', academicYear: ACADEMIC_YEAR,
                startDate: new Date('2027-03-03'), endDate: new Date('2027-03-12'),
                instructions: 'Report 30 minutes before the exam. Carry your admit card. Electronic devices are prohibited.',
                status: 'published',
            },
        });
    } else if (schedule.status !== 'published') {
        schedule = await prisma.examSchedule.update({ where: { id: schedule.id }, data: { status: 'published' } });
    }

    // 3) Exam timetable (exam_subjects) — idempotent by schedule + subjectName.
    for (let i = 0; i < SUBJECTS.length; i++) {
        const s = SUBJECTS[i];
        const exists = await prisma.examSubject.findFirst({ where: { examScheduleId: schedule.id, subjectName: s.subjectName } });
        if (!exists) {
            await prisma.examSubject.create({
                data: {
                    examScheduleId: schedule.id, subjectName: s.subjectName, subjectCode: s.subjectCode,
                    examDate: new Date(EXAM_DATES[i]), startTime: new Date('1970-01-01T10:00:00'),
                    durationMinutes: 180, venue: 'Main Examination Hall', maxMarks: 100,
                },
            });
        }
    }

    // 4) Marks for every student × subject (idempotent via the compound unique key).
    let markCount = 0;
    for (const student of students) {
        const classId = student.section?.classId;
        if (!classId) continue;
        for (let i = 0; i < SUBJECTS.length; i++) {
            const subj = subjectByClassAndName.get(`${classId}|${SUBJECTS[i].subjectName}`);
            if (!subj) continue;
            const obtained = markFor(student.id, i);
            await prisma.mark.upsert({
                where: { studentId_subjectId_examScheduleId: { studentId: student.id, subjectId: subj.id, examScheduleId: schedule.id } },
                update: { theoryObtainedMarks: obtained, theoryMaxMarks: 100, status: 'approved' },
                create: { studentId: student.id, subjectId: subj.id, examScheduleId: schedule.id, theoryObtainedMarks: obtained, theoryMaxMarks: 100, status: 'approved' },
            });
            markCount++;
        }
    }

    console.log(`✅ Academics seeded for ${INSTITUTION}`);
    console.log(`   classes=${classIds.length}  subjects/class=${SUBJECTS.length}  students=${students.length}  marks=${markCount}`);
    console.log(`   exam '${EXAM_NAME}' status=${schedule.status}  examScheduleId=${schedule.id}`);
    await prisma.$disconnect();
}

main().catch(async (e) => {
    console.error('SEED FAILED:', e);
    await prisma.$disconnect();
    process.exit(1);
});
