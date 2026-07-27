import { Prisma } from '@prisma/client';
import type { EnquirySource, EnquiryStatus, EnquiryActivityType } from '@prisma/client';
import { getTenantPrisma } from '../../lib/prisma-tenant.js';
import { logger } from '../../utils/logger.js';
import { NotFoundError } from '../../utils/errors.js';

function makeEnquiryNumber(): string {
  return `ENQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export interface CreateEnquiryInput {
  studentName: string;
  guardianName?: string;
  phone: string;
  email?: string;
  classInterested?: string;
  classId?: string;
  source?: EnquirySource;
  assignedToUserId?: string;
  followUpAt?: string;
  notes?: string;
}

export interface UpdateEnquiryInput {
  status?: EnquiryStatus;
  assignedToUserId?: string | null;
  followUpAt?: string | null;
  notes?: string;
  studentName?: string;
  guardianName?: string;
  phone?: string;
  email?: string;
  classInterested?: string;
  source?: EnquirySource;
}

const EMPTY_STATS: Record<EnquiryStatus, number> = {
  new: 0, contacted: 0, visited: 0, application: 0, admitted: 0, lost: 0,
};

export const admissionsService = {
  async _activity(institutionId: string, enquiryId: string, type: EnquiryActivityType, description: string, actorUserId?: string) {
    const db = getTenantPrisma(institutionId);
    await db.enquiryActivity.create({
      data: { institutionId, enquiryId, type, description, createdByUserId: actorUserId ?? null },
    });
  },

  async createEnquiry(institutionId: string, data: CreateEnquiryInput, actorUserId?: string) {
    const db = getTenantPrisma(institutionId);
    const enquiry = await db.enquiry.create({
      data: {
        institutionId,
        enquiryNumber: makeEnquiryNumber(),
        studentName: data.studentName,
        guardianName: data.guardianName ?? null,
        phone: data.phone,
        email: data.email ?? null,
        classInterested: data.classInterested ?? null,
        classId: data.classId ?? null,
        source: data.source ?? 'other',
        status: 'new',
        assignedToUserId: data.assignedToUserId ?? null,
        followUpAt: data.followUpAt ? new Date(data.followUpAt) : null,
        notes: data.notes ?? null,
      },
    });
    await this._activity(institutionId, enquiry.id, 'created', `Enquiry created (source: ${enquiry.source})`, actorUserId);
    return enquiry;
  },

  async addActivity(institutionId: string, enquiryId: string, input: { type?: EnquiryActivityType; description: string }, actorUserId?: string) {
    await this._activity(institutionId, enquiryId, input.type ?? 'note', input.description, actorUserId);
    return { ok: true };
  },

  async listEnquiries(
    institutionId: string,
    filters: { status?: EnquiryStatus; source?: EnquirySource; assignedToUserId?: string; search?: string; limit?: number } = {},
  ) {
    const db = getTenantPrisma(institutionId);
    const where: Prisma.EnquiryWhereInput = {};
    if (filters.status) where.status = filters.status;
    if (filters.source) where.source = filters.source;
    if (filters.assignedToUserId) where.assignedToUserId = filters.assignedToUserId;
    if (filters.search) {
      where.OR = [
        { studentName: { contains: filters.search } },
        { phone: { contains: filters.search } },
        { guardianName: { contains: filters.search } },
      ];
    }
    return db.enquiry.findMany({ where, orderBy: { createdAt: 'desc' }, take: Math.min(filters.limit ?? 100, 500) });
  },

  async getEnquiry(institutionId: string, id: string) {
    const db = getTenantPrisma(institutionId);
    const enquiry = await db.enquiry.findFirst({
      where: { id },
      include: { activities: { orderBy: { createdAt: 'desc' } } },
    });
    if (!enquiry) throw new NotFoundError('Enquiry not found');
    return enquiry;
  },

  async updateEnquiry(institutionId: string, id: string, data: UpdateEnquiryInput, actorUserId?: string) {
    const db = getTenantPrisma(institutionId);
    const existing = await db.enquiry.findFirst({ where: { id }, select: { status: true } });
    if (!existing) throw new NotFoundError('Enquiry not found');

    const updated = await db.enquiry.update({
      where: { id },
      data: {
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.assignedToUserId !== undefined ? { assignedToUserId: data.assignedToUserId } : {}),
        ...(data.followUpAt !== undefined ? { followUpAt: data.followUpAt ? new Date(data.followUpAt) : null } : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
        ...(data.studentName !== undefined ? { studentName: data.studentName } : {}),
        ...(data.guardianName !== undefined ? { guardianName: data.guardianName } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
        ...(data.email !== undefined ? { email: data.email } : {}),
        ...(data.classInterested !== undefined ? { classInterested: data.classInterested } : {}),
        ...(data.source !== undefined ? { source: data.source } : {}),
      },
    });

    if (data.status && data.status !== existing.status) {
      await this._activity(institutionId, id, 'status_change', `Status: ${existing.status} → ${data.status}`, actorUserId);
    }
    return updated;
  },

  async pipelineStats(institutionId: string) {
    const db = getTenantPrisma(institutionId);
    const grouped = await db.enquiry.groupBy({ by: ['status'], _count: { _all: true } });
    const byStatus = { ...EMPTY_STATS };
    for (const g of grouped) byStatus[g.status] = g._count._all;
    const total = Object.values(byStatus).reduce((a, b) => a + b, 0);
    return { total, byStatus };
  },

  async convertToStudent(institutionId: string, enquiryId: string, input: { sectionId: string }, actorUserId?: string) {
    const db = getTenantPrisma(institutionId);
    const enquiry = await db.enquiry.findFirst({ where: { id: enquiryId } });
    if (!enquiry) throw new NotFoundError('Enquiry not found');
    if (enquiry.convertedStudentId) {
      return { ok: false as const, reason: 'already_converted', studentId: enquiry.convertedStudentId };
    }

    const student = await db.student.create({
      data: {
        institutionId,
        sectionId: input.sectionId,
        name: enquiry.studentName,
        guardianName: enquiry.guardianName ?? undefined,
        guardianPhone: enquiry.phone,
        parentEmail: enquiry.email ?? undefined,
        customData: {},
      },
      select: { id: true },
    });

    await db.enquiry.update({ where: { id: enquiryId }, data: { status: 'admitted', convertedStudentId: student.id } });
    await this._activity(institutionId, enquiryId, 'converted', `Converted to student ${student.id}`, actorUserId);
    logger.info('[admissions] enquiry converted to student', { enquiryId, studentId: student.id });
    return { ok: true as const, studentId: student.id };
  },

  /** Capture (or append to) a lead from an unregistered WhatsApp number. */
  async captureFromWhatsApp(institutionId: string, phone: string, name: string | undefined, text: string) {
    const db = getTenantPrisma(institutionId);
    const digits = phone.replace(/\D/g, '');
    const existing = await db.enquiry.findFirst({
      where: { phone: digits, status: { notIn: ['admitted', 'lost'] } },
      orderBy: { createdAt: 'desc' },
    });
    if (existing) {
      await this._activity(institutionId, existing.id, 'whatsapp', `WhatsApp: ${text.slice(0, 400)}`);
      return existing;
    }
    const enquiry = await db.enquiry.create({
      data: {
        institutionId,
        enquiryNumber: makeEnquiryNumber(),
        studentName: name ?? 'WhatsApp Enquiry',
        phone: digits,
        source: 'whatsapp',
        status: 'new',
        notes: text.slice(0, 1000),
      },
    });
    await this._activity(institutionId, enquiry.id, 'created', `Lead captured via WhatsApp: ${text.slice(0, 300)}`);
    logger.info('[admissions] lead captured from WhatsApp', { institutionId, enquiryId: enquiry.id });
    return enquiry;
  },
};
