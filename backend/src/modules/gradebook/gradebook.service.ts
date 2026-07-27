import type { CceTermType } from '@prisma/client';
import { getTenantPrisma } from '../../lib/prisma-tenant.js';
import { NotFoundError } from '../../utils/errors.js';

/** CBSE CCE grade bands for a percentage (0–100). */
export function cbseGrade(percent: number): string {
  if (percent >= 91) return 'A1';
  if (percent >= 81) return 'A2';
  if (percent >= 71) return 'B1';
  if (percent >= 61) return 'B2';
  if (percent >= 51) return 'C1';
  if (percent >= 41) return 'C2';
  if (percent >= 33) return 'D';
  return 'E';
}

export const gradebookService = {
  async createAssessment(institutionId: string, data: { sectionId: string; subjectName: string; name: string; termType: CceTermType; maxMarks?: number | string; weightage?: number; conductedOn?: string }) {
    const db = getTenantPrisma(institutionId);
    return db.cceAssessment.create({
      data: {
        institutionId,
        sectionId: data.sectionId,
        subjectName: data.subjectName,
        name: data.name,
        termType: data.termType,
        maxMarks: data.maxMarks != null ? String(data.maxMarks) : '100',
        weightage: data.weightage ?? 100,
        conductedOn: data.conductedOn ? new Date(data.conductedOn) : null,
      },
    });
  },

  async listAssessments(institutionId: string, filters: { sectionId?: string; termType?: CceTermType } = {}) {
    const db = getTenantPrisma(institutionId);
    return db.cceAssessment.findMany({
      where: { ...(filters.sectionId ? { sectionId: filters.sectionId } : {}), ...(filters.termType ? { termType: filters.termType } : {}) },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { marks: true } } },
    });
  },

  /** Enter (or update) a single student's mark; grade auto-computed against assessment maxMarks. */
  async enterMark(institutionId: string, data: { assessmentId: string; studentId: string; marksObtained: number | string; remarks?: string }) {
    const db = getTenantPrisma(institutionId);
    const assessment = await db.cceAssessment.findFirst({ where: { id: data.assessmentId }, select: { id: true, maxMarks: true, status: true } });
    if (!assessment) throw new NotFoundError('Assessment not found');

    const obtained = Number(data.marksObtained);
    const max = Number(assessment.maxMarks) || 100;
    const grade = cbseGrade((obtained / max) * 100);

    return db.cceMark.upsert({
      where: { assessmentId_studentId: { assessmentId: data.assessmentId, studentId: data.studentId } },
      update: { marksObtained: String(obtained), grade, remarks: data.remarks ?? null },
      create: {
        institutionId,
        assessmentId: data.assessmentId,
        studentId: data.studentId,
        marksObtained: String(obtained),
        grade,
        remarks: data.remarks ?? null,
      },
    });
  },

  /** Bulk mark entry for one assessment. Returns count saved. */
  async bulkEnterMarks(institutionId: string, assessmentId: string, marks: Array<{ studentId: string; marksObtained: number | string; remarks?: string }>) {
    let saved = 0;
    for (const m of marks) {
      await this.enterMark(institutionId, { assessmentId, ...m });
      saved += 1;
    }
    return { saved };
  },

  async listMarks(institutionId: string, assessmentId: string) {
    const db = getTenantPrisma(institutionId);
    return db.cceMark.findMany({ where: { assessmentId }, orderBy: { studentId: 'asc' } });
  },

  /**
   * Report card for one student in a section: weighted percentage per subject
   * across all assessments + an overall CBSE grade per subject.
   */
  async getReportCard(institutionId: string, sectionId: string, studentId: string) {
    const db = getTenantPrisma(institutionId);
    const assessments = await db.cceAssessment.findMany({ where: { sectionId }, select: { id: true, subjectName: true, maxMarks: true, weightage: true, termType: true, name: true } });
    if (assessments.length === 0) return { studentId, subjects: [] };

    const marks = await db.cceMark.findMany({ where: { studentId, assessmentId: { in: assessments.map((a) => a.id) } } });
    const markByAssessment = new Map(marks.map((m) => [m.assessmentId, m]));

    const bySubject = new Map<string, { obtained: number; weight: number; entries: Array<{ name: string; term: string; marks: number; max: number; grade: string | null }> }>();
    for (const a of assessments) {
      const mk = markByAssessment.get(a.id);
      if (!mk) continue;
      const obtained = Number(mk.marksObtained);
      const max = Number(a.maxMarks) || 100;
      const weight = a.weightage || 100;
      const cur = bySubject.get(a.subjectName) ?? { obtained: 0, weight: 0, entries: [] };
      cur.obtained += (obtained / max) * weight;
      cur.weight += weight;
      cur.entries.push({ name: a.name, term: a.termType, marks: obtained, max, grade: mk.grade });
      bySubject.set(a.subjectName, cur);
    }

    const subjects = [...bySubject.entries()].map(([subjectName, v]) => {
      const percent = v.weight > 0 ? (v.obtained / v.weight) * 100 : 0;
      return { subjectName, percent: Math.round(percent * 100) / 100, grade: cbseGrade(percent), entries: v.entries };
    });
    const overall = subjects.length > 0 ? subjects.reduce((s, x) => s + x.percent, 0) / subjects.length : 0;
    return { studentId, sectionId, overallPercent: Math.round(overall * 100) / 100, overallGrade: cbseGrade(overall), subjects };
  },
};
