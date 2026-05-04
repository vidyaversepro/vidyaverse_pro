import { prisma } from '../../config/database.js';

export interface DuplicateMatch {
    studentId: string;
    matchType: 'aadhar' | 'name_dob';
    name: string;
    sectionId: string;
    admissionNumber: string | null;
}

export interface DuplicateResult {
    isDuplicate: boolean;
    matches: DuplicateMatch[];
}

/**
 * Checks for duplicate students within an institution.
 * Two strategies:
 *   1. Exact match on aadharNumber (if provided)
 *   2. Case-insensitive name + exact DOB match
 */
export async function checkDuplicates(
    institutionId: string,
    data: { aadharNumber?: string | null; name: string; dob?: Date | string | null },
    excludeStudentId?: string
): Promise<DuplicateResult> {
    const matches: DuplicateMatch[] = [];

    const excludeFilter = excludeStudentId ? { id: { not: excludeStudentId } } : {};

    // 1. Aadhar exact match
    if (data.aadharNumber && /^\d{12}$/.test(data.aadharNumber)) {
        const aadharMatches = await prisma.student.findMany({
            where: {
                institutionId,
                aadharNumber: data.aadharNumber,
                ...excludeFilter,
            },
            select: { id: true, name: true, sectionId: true, admissionNumber: true },
            take: 5,
        });

        for (const s of aadharMatches) {
            matches.push({
                studentId: s.id,
                matchType: 'aadhar',
                name: s.name,
                sectionId: s.sectionId,
                admissionNumber: s.admissionNumber,
            });
        }
    }

    // 2. Name + DOB fuzzy match (case-insensitive name, exact DOB)
    if (data.name && data.dob) {
        const dob = data.dob instanceof Date ? data.dob : new Date(data.dob);
        if (!isNaN(dob.getTime())) {
            const nameDobMatches = await prisma.student.findMany({
                where: {
                    institutionId,
                    name: { equals: data.name.trim() },
                    dob: dob,
                    ...excludeFilter,
                },
                select: { id: true, name: true, sectionId: true, admissionNumber: true },
                take: 5,
            });

            for (const s of nameDobMatches) {
                // Avoid adding the same student twice if already matched by aadhar
                if (!matches.some(m => m.studentId === s.id)) {
                    matches.push({
                        studentId: s.id,
                        matchType: 'name_dob',
                        name: s.name,
                        sectionId: s.sectionId,
                        admissionNumber: s.admissionNumber,
                    });
                }
            }
        }
    }

    return {
        isDuplicate: matches.length > 0,
        matches,
    };
}
