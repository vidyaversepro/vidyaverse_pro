/**
 * Phase 0 backfill: derive Guardian + GuardianStudentLink rows from the
 * denormalized Student.{fatherName,motherName,guardianName,guardianRelation,
 * guardianPhone,contact} fields.
 *
 * The original Student fields are left untouched (strangler-fig: nothing breaks).
 *
 * Source data carries a single phone per student, so we create ONE contactable
 * guardian per student. Guardians sharing a phone (e.g. a father across siblings)
 * collapse into a single Guardian row linked to multiple students — the payoff of
 * the many-to-many model. Additional guardians/numbers are added later via UI/import.
 *
 * Safe by default: DRY-RUN unless you pass --commit.
 *   Preview:  tsx prisma/backfill-guardians.ts
 *   Apply:    tsx prisma/backfill-guardians.ts --commit
 */
import { PrismaClient, GuardianRole } from '@prisma/client';

const prisma = new PrismaClient();
const COMMIT = process.argv.includes('--commit');
const PAGE = 500;

/** Strip to digits and best-effort normalize to an India WhatsApp number (no +). */
function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return '91' + digits;
  if (digits.length === 11 && digits.startsWith('0')) return '91' + digits.slice(1);
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  return digits.length >= 10 ? digits : null;
}

/** Map a free-text relation (English/Hindi/Hinglish) to the GuardianRole enum. */
function mapRole(relation: string | null | undefined): GuardianRole {
  const r = (relation ?? '').toLowerCase();
  if (/(father|pita|papa|abba|baba)/.test(r)) return GuardianRole.father;
  if (/(mother|mata|maa|mummy|ammi)/.test(r)) return GuardianRole.mother;
  if (/nana|nani/.test(r)) return GuardianRole.grandparent_maternal;
  if (/dada|dadi|grandfather|grandmother|grand/.test(r)) return GuardianRole.grandparent_paternal;
  if (/(uncle|chacha|mama|tau|fufa|mausa)/.test(r)) return GuardianRole.uncle;
  if (/(aunt|chachi|mami|bua|mausi|tai)/.test(r)) return GuardianRole.aunt;
  if (/(brother|bhai|sister|behan|didi)/.test(r)) return GuardianRole.sibling_adult;
  if (/(warden|hostel)/.test(r)) return GuardianRole.hostel_warden;
  if (/(step)/.test(r)) return GuardianRole.step_parent;
  return GuardianRole.legal_guardian;
}

function splitName(full: string): { firstName: string; lastName: string | null } {
  const parts = full.trim().split(/\s+/);
  if (parts.length <= 1) return { firstName: parts[0] || 'Guardian', lastName: null };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

/** Pick the single best contactable guardian for a student from denormalized fields. */
function pickGuardian(s: {
  fatherName: string | null;
  motherName: string | null;
  guardianName: string | null;
  guardianRelation: string | null;
  guardianPhone: string | null;
  contact: string | null;
}): { name: string; role: GuardianRole; phone: string } | null {
  const phone = normalizePhone(s.guardianPhone) ?? normalizePhone(s.contact);
  if (!phone) return null;

  if (s.guardianName?.trim()) {
    return { name: s.guardianName.trim(), role: mapRole(s.guardianRelation), phone };
  }
  if (s.fatherName?.trim()) {
    return { name: s.fatherName.trim(), role: GuardianRole.father, phone };
  }
  if (s.motherName?.trim()) {
    return { name: s.motherName.trim(), role: GuardianRole.mother, phone };
  }
  return null;
}

async function main() {
  console.log(`\n=== Guardian backfill (${COMMIT ? 'COMMIT' : 'DRY-RUN'}) ===\n`);

  const stats = {
    studentsScanned: 0,
    skippedNoPhone: 0,
    guardiansCreated: 0,
    guardiansReused: 0,
    linksCreated: 0,
  };
  // Cache guardian id per (institutionId|phone) so siblings share one Guardian row.
  const guardianCache = new Map<string, string>();

  let cursor: string | undefined;
  for (;;) {
    const students = await prisma.student.findMany({
      take: PAGE,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: 'asc' },
      select: {
        id: true,
        institutionId: true,
        fatherName: true,
        motherName: true,
        guardianName: true,
        guardianRelation: true,
        guardianPhone: true,
        contact: true,
      },
    });
    if (students.length === 0) break;
    cursor = students[students.length - 1].id;

    for (const s of students) {
      stats.studentsScanned++;
      const pick = pickGuardian(s);
      if (!pick) {
        stats.skippedNoPhone++;
        continue;
      }

      const cacheKey = `${s.institutionId}|${pick.phone}`;
      let guardianId = guardianCache.get(cacheKey);

      if (!guardianId) {
        const { firstName, lastName } = splitName(pick.name);
        if (COMMIT) {
          const g = await prisma.guardian.upsert({
            where: {
              institutionId_whatsappNumber: {
                institutionId: s.institutionId,
                whatsappNumber: pick.phone,
              },
            },
            update: {},
            create: {
              institutionId: s.institutionId,
              firstName,
              lastName,
              whatsappNumber: pick.phone,
              role: pick.role,
              preferredLanguage: 'hi',
              source: 'backfill',
            },
            select: { id: true },
          });
          guardianId = g.id;
        } else {
          guardianId = `dry-${cacheKey}`;
        }
        guardianCache.set(cacheKey, guardianId);
        stats.guardiansCreated++;
      } else {
        stats.guardiansReused++;
      }

      if (COMMIT) {
        await prisma.guardianStudentLink.upsert({
          where: { guardianId_studentId: { guardianId, studentId: s.id } },
          update: {},
          create: {
            institutionId: s.institutionId,
            guardianId,
            studentId: s.id,
            isPrimary: true,
          },
        });
      }
      stats.linksCreated++;
    }
    console.log(`  …processed ${stats.studentsScanned} students`);
  }

  console.log('\n--- Summary ---');
  console.table(stats);
  if (!COMMIT) {
    console.log('\nDRY-RUN only — no rows written. Re-run with --commit to apply.\n');
  } else {
    console.log('\nBackfill complete.\n');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
