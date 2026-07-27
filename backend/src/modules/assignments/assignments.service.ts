import type { AssignmentStatus } from '@prisma/client';
import { getTenantPrisma } from '../../lib/prisma-tenant.js';
import { NotFoundError, ValidationError } from '../../utils/errors.js';

export const assignmentsService = {
  async create(institutionId: string, data: { sectionId: string; subjectName: string; title: string; description?: string; assignedBy?: string; dueDate?: string; maxMarks?: number | string; attachmentUrl?: string; publish?: boolean }) {
    const db = getTenantPrisma(institutionId);
    return db.assignment.create({
      data: {
        institutionId,
        sectionId: data.sectionId,
        subjectName: data.subjectName,
        title: data.title,
        description: data.description ?? null,
        assignedBy: data.assignedBy ?? null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        maxMarks: data.maxMarks != null ? String(data.maxMarks) : null,
        attachmentUrl: data.attachmentUrl ?? null,
        status: data.publish ? 'published' : 'draft',
      },
    });
  },

  async list(institutionId: string, filters: { sectionId?: string; status?: AssignmentStatus } = {}) {
    const db = getTenantPrisma(institutionId);
    return db.assignment.findMany({
      where: { ...(filters.sectionId ? { sectionId: filters.sectionId } : {}), ...(filters.status ? { status: filters.status } : {}) },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { submissions: true } } },
    });
  },

  async setStatus(institutionId: string, id: string, status: AssignmentStatus) {
    const db = getTenantPrisma(institutionId);
    return db.assignment.update({ where: { id }, data: { status } });
  },

  /** Student submission. Auto-flags 'late' when past the assignment due date. */
  async submit(institutionId: string, assignmentId: string, data: { studentId: string; content?: string; attachmentUrl?: string }) {
    const db = getTenantPrisma(institutionId);
    const assignment = await db.assignment.findFirst({ where: { id: assignmentId }, select: { id: true, dueDate: true, status: true } });
    if (!assignment) throw new NotFoundError('Assignment not found');
    if (assignment.status === 'draft') throw new ValidationError('Assignment is not yet published');

    const isLate = assignment.dueDate ? new Date() > assignment.dueDate : false;
    return db.assignmentSubmission.upsert({
      where: { assignmentId_studentId: { assignmentId, studentId: data.studentId } },
      update: { content: data.content ?? null, attachmentUrl: data.attachmentUrl ?? null, status: isLate ? 'late' : 'submitted', submittedAt: new Date() },
      create: {
        institutionId,
        assignmentId,
        studentId: data.studentId,
        content: data.content ?? null,
        attachmentUrl: data.attachmentUrl ?? null,
        status: isLate ? 'late' : 'submitted',
      },
    });
  },

  async grade(institutionId: string, submissionId: string, data: { marksObtained: number | string; feedback?: string }) {
    const db = getTenantPrisma(institutionId);
    return db.assignmentSubmission.update({
      where: { id: submissionId },
      data: { marksObtained: String(data.marksObtained), feedback: data.feedback ?? null, status: 'graded', gradedAt: new Date() },
    });
  },

  async listSubmissions(institutionId: string, assignmentId: string) {
    const db = getTenantPrisma(institutionId);
    return db.assignmentSubmission.findMany({ where: { assignmentId }, orderBy: { submittedAt: 'asc' } });
  },

  async getStudentSubmissions(institutionId: string, studentId: string) {
    const db = getTenantPrisma(institutionId);
    return db.assignmentSubmission.findMany({
      where: { studentId },
      orderBy: { submittedAt: 'desc' },
      include: { assignment: { select: { title: true, subjectName: true, dueDate: true, maxMarks: true } } },
    });
  },
};
