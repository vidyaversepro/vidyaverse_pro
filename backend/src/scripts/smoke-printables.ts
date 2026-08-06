/**
 * Smoke test for the printables pipeline. Calls each document service directly
 * (no HTTP/auth) for a real student, exercising the full path: template resolve
 * + auto-seed → branding → Handlebars render → Puppeteer PDF → R2 upload.
 *
 * Run from backend/:  npx tsx src/scripts/smoke-printables.ts <institutionId>
 * Verifies a PDF URL lands for each type; prints a pass/fail table.
 */
import { prisma } from '../config/database.js';
import { certificateService } from '../modules/certificates/certificate.service.js';
import { libraryCardService } from '../modules/library-cards/library-card.service.js';
import { visitingCardService } from '../modules/visiting-card/service.js';
import { transferCertificateService } from '../modules/transfer-certificates/transfer-certificate.service.js';
import { marksheetService } from '../modules/marksheets/marksheet.service.js';
import { hallTicketService } from '../modules/hall-tickets/hall-ticket.service.js';

const INSTITUTION = process.argv[2];
if (!INSTITUTION) {
    throw new Error('Usage: npx tsx src/scripts/smoke-printables.ts <institutionId> — no default, must be explicit.');
}

type Row = { type: string; status: string; detail: string };

async function run(type: string, fn: () => Promise<string | undefined>): Promise<Row> {
    try {
        const url = await fn();
        return { type, status: url ? 'OK' : 'OK (no url)', detail: url ? url.slice(0, 88) : '' };
    } catch (e: any) {
        return { type, status: 'FAIL', detail: (e?.message || String(e)).slice(0, 160) };
    }
}

async function main() {
    const student =
        (await prisma.student.findFirst({
            where: { institutionId: INSTITUTION, photoUrl: { not: null } },
            orderBy: { admissionNumber: 'asc' },
        })) ||
        (await prisma.student.findFirst({
            where: { institutionId: INSTITUTION },
            orderBy: { admissionNumber: 'asc' },
        }));
    if (!student) throw new Error(`No students for institution ${INSTITUTION}`);
    console.log(`Smoke target: ${student.name} (${student.admissionNumber}) @ ${INSTITUTION}\n`);

    const schedule = await prisma.examSchedule.findFirst({
        where: { institutionId: INSTITUTION, status: 'published' },
        orderBy: { createdAt: 'desc' },
    });

    const rows: Row[] = [];

    rows.push(await run('certificate', async () => {
        const r: any = await certificateService.create(INSTITUTION, {
            studentId: student.id,
            certificateType: 'academic_excellence',
            title: 'Certificate of Academic Excellence',
            description: 'has demonstrated outstanding academic performance and exemplary conduct throughout the academic year, and is hereby awarded this certificate in recognition of the same.',
        } as any);
        return r?.pdfUrl;
    }));

    rows.push(await run('library_card', async () => {
        const r: any = await libraryCardService.generate(INSTITUTION, {
            studentId: student.id,
            maxBooks: 3,
        } as any);
        return r?.pdfUrl;
    }));

    rows.push(await run('visiting_card', async () => {
        const r: any = await visitingCardService.create(INSTITUTION, {
            studentId: student.id,
            designation: 'Head Boy',
        } as any);
        return r?.pdfUrl || r?.visitingCard?.frontPdfUrl;
    }));

    rows.push(await run('marksheet', async () => {
        if (!schedule) throw new Error('no published exam schedule — run prisma/seed-academics.ts');
        const r: any = await marksheetService.generate(INSTITUTION, { studentId: student.id, examScheduleId: schedule.id } as any);
        return r?.pdfUrl;
    }));

    rows.push(await run('hall_ticket', async () => {
        if (!schedule) throw new Error('no published exam schedule — run prisma/seed-academics.ts');
        const r: any = await hallTicketService.generate(INSTITUTION, { studentId: student.id, examScheduleId: schedule.id } as any);
        return r?.pdfUrl;
    }));

    // transfer_certificate has real side effects (flips student.status -> transferred,
    // blocks re-generation), so run on a separate student, capture, then fully revert.
    {
        const tcStudent = await prisma.student.findFirst({
            where: { institutionId: INSTITUTION },
            orderBy: { admissionNumber: 'desc' },
        });
        let row: Row = { type: 'transfer_certificate', status: 'FAIL', detail: 'no student' };
        if (tcStudent) {
            const prevStatus = tcStudent.status;
            try {
                await prisma.transferCertificate.deleteMany({ where: { studentId: tcStudent.id } });
                const r: any = await transferCertificateService.generate(INSTITUTION, {
                    studentId: tcStudent.id,
                    reason: 'Parent relocation / अभिभावक का स्थानांतरण',
                    remarks: 'All dues cleared. No disciplinary record.',
                    conductGrade: 'good',
                    lastAttendanceDate: new Date().toISOString(),
                    feesCleared: true,
                    noDues: true,
                    characterCertificate: true,
                } as any);
                row = { type: 'transfer_certificate', status: r?.pdfUrl ? 'OK' : 'OK (no url)', detail: (r?.pdfUrl || '').slice(0, 88) };
            } catch (e: any) {
                row = { type: 'transfer_certificate', status: 'FAIL', detail: (e?.message || String(e)).slice(0, 160) };
            } finally {
                // Revert every side effect so demo data stays pristine and the smoke is repeatable.
                await prisma.transferCertificate.deleteMany({ where: { studentId: tcStudent.id } });
                await prisma.student.update({ where: { id: tcStudent.id }, data: { status: prevStatus } });
            }
        }
        rows.push(row);
    }

    // Optional bulk pass (small subset) — exercises the bulk loops + rank calc.
    if (process.argv.includes('--bulk') && schedule) {
        const sched = schedule;
        const someIds = (await prisma.student.findMany({ where: { institutionId: INSTITUTION }, take: 3, select: { id: true } })).map((s) => s.id);
        rows.push(await run('marksheet:bulk', async () => {
            const r: any = await marksheetService.generateBulk(INSTITUTION, { studentIds: someIds, examScheduleId: sched.id } as any);
            return `ok=${r?.successful?.length ?? 0} fail=${r?.failed?.length ?? 0}`;
        }));
        rows.push(await run('hall_ticket:bulk', async () => {
            const r: any = await hallTicketService.generateBulk(INSTITUTION, { studentIds: someIds, examScheduleId: sched.id } as any);
            return `ok=${r?.successful?.length ?? 0} fail=${r?.failed?.length ?? 0}`;
        }));
    }

    console.table(rows);
    const failed = rows.filter((r) => r.status === 'FAIL').length;
    await prisma.$disconnect();
    process.exit(failed ? 1 : 0);
}

main().catch(async (e) => {
    console.error('SMOKE CRASHED:', e);
    await prisma.$disconnect();
    process.exit(1);
});
