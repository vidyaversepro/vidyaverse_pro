import type { QuestionType, QuestionDifficulty, OnlineTestStatus } from '@prisma/client';
import { getTenantPrisma } from '../../lib/prisma-tenant.js';
import { NotFoundError, ValidationError } from '../../utils/errors.js';

interface QuestionInput {
  subject: string;
  topic?: string;
  classLevel?: string;
  questionText: string;
  type?: QuestionType;
  options?: Array<{ key: string; text: string }>;
  correctOption?: string;
  marks?: number;
  difficulty?: QuestionDifficulty;
  explanation?: string;
}

export const onlineTestsService = {
  // ── Question bank ──────────────────────────────────────────────────────────────
  async createQuestion(institutionId: string, data: QuestionInput) {
    const db = getTenantPrisma(institutionId);
    if ((data.type ?? 'mcq') !== 'short_answer' && !data.correctOption) {
      throw new ValidationError('correctOption is required for objective questions');
    }
    return db.questionBankItem.create({
      data: {
        institutionId,
        subject: data.subject,
        topic: data.topic ?? null,
        classLevel: data.classLevel ?? null,
        questionText: data.questionText,
        type: data.type ?? 'mcq',
        options: data.options ? (data.options as unknown as object) : undefined,
        correctOption: data.correctOption ?? null,
        marks: data.marks ?? 1,
        difficulty: data.difficulty ?? 'medium',
        explanation: data.explanation ?? null,
      },
    });
  },

  async listQuestions(institutionId: string, filters: { subject?: string; type?: QuestionType } = {}) {
    const db = getTenantPrisma(institutionId);
    return db.questionBankItem.findMany({
      where: { ...(filters.subject ? { subject: filters.subject } : {}), ...(filters.type ? { type: filters.type } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 300,
    });
  },

  // ── Tests ───────────────────────────────────────────────────────────────────────
  async createTest(institutionId: string, data: { title: string; sectionId?: string; subject?: string; questionIds: string[]; durationMins?: number; scheduledAt?: string }) {
    const db = getTenantPrisma(institutionId);
    if (!Array.isArray(data.questionIds) || data.questionIds.length === 0) {
      throw new ValidationError('questionIds must be a non-empty array');
    }
    const questions = await db.questionBankItem.findMany({ where: { id: { in: data.questionIds } }, select: { id: true, marks: true } });
    if (questions.length !== data.questionIds.length) {
      throw new ValidationError('One or more questionIds are invalid for this institution');
    }
    const totalMarks = questions.reduce((s, q) => s + q.marks, 0);
    return db.onlineTest.create({
      data: {
        institutionId,
        title: data.title,
        sectionId: data.sectionId ?? null,
        subject: data.subject ?? null,
        questionIds: data.questionIds as unknown as object,
        totalMarks,
        durationMins: data.durationMins ?? 30,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      },
    });
  },

  async listTests(institutionId: string, filters: { sectionId?: string; status?: OnlineTestStatus } = {}) {
    const db = getTenantPrisma(institutionId);
    return db.onlineTest.findMany({
      where: { ...(filters.sectionId ? { sectionId: filters.sectionId } : {}), ...(filters.status ? { status: filters.status } : {}) },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { attempts: true } } },
    });
  },

  async setTestStatus(institutionId: string, id: string, status: OnlineTestStatus) {
    const db = getTenantPrisma(institutionId);
    const test = await db.onlineTest.findFirst({ where: { id }, select: { id: true } });
    if (!test) throw new NotFoundError('Test not found');
    return db.onlineTest.update({ where: { id }, data: { status } });
  },

  // ── Attempts (auto-graded) ────────────────────────────────────────────────────
  async startAttempt(institutionId: string, testId: string, studentId: string) {
    const db = getTenantPrisma(institutionId);
    const test = await db.onlineTest.findFirst({ where: { id: testId }, select: { id: true, status: true, totalMarks: true } });
    if (!test) throw new NotFoundError('Test not found');
    if (test.status !== 'published') throw new ValidationError('Test is not open for attempts');
    return db.onlineTestAttempt.upsert({
      where: { testId_studentId: { testId, studentId } },
      update: {},
      create: { institutionId, testId, studentId, maxScore: test.totalMarks, status: 'in_progress' },
    });
  },

  /**
   * Submits answers and auto-grades objective questions (mcq/true_false).
   * If the test contains short_answer questions, status stays `submitted`
   * (awaiting manual grade); otherwise it is fully `graded`.
   */
  async submitAttempt(institutionId: string, attemptId: string, answers: Record<string, string>) {
    const db = getTenantPrisma(institutionId);
    const attempt = await db.onlineTestAttempt.findFirst({ where: { id: attemptId }, include: { test: { select: { questionIds: true } } } });
    if (!attempt) throw new NotFoundError('Attempt not found');
    if (attempt.status !== 'in_progress') throw new ValidationError('Attempt already submitted');

    const questionIds = (attempt.test.questionIds as unknown as string[]) ?? [];
    const questions = await db.questionBankItem.findMany({ where: { id: { in: questionIds } }, select: { id: true, type: true, correctOption: true, marks: true } });

    let score = 0;
    let hasManual = false;
    for (const q of questions) {
      if (q.type === 'short_answer') { hasManual = true; continue; }
      const given = answers?.[q.id];
      if (given != null && given === q.correctOption) score += q.marks;
    }

    return db.onlineTestAttempt.update({
      where: { id: attemptId },
      data: {
        answers: (answers ?? {}) as unknown as object,
        score,
        status: hasManual ? 'submitted' : 'graded',
        submittedAt: new Date(),
      },
    });
  },

  async listAttempts(institutionId: string, testId: string) {
    const db = getTenantPrisma(institutionId);
    return db.onlineTestAttempt.findMany({ where: { testId }, orderBy: { submittedAt: 'desc' } });
  },
};
