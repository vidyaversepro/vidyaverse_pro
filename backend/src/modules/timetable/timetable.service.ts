import type { DayOfWeek, SubstitutionStatus } from '@prisma/client';
import { getTenantPrisma } from '../../lib/prisma-tenant.js';
import { NotFoundError, BadRequestError } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';

export interface SetSlotInput {
  sectionId: string;
  dayOfWeek: DayOfWeek;
  periodId: string;
  subjectName: string;
  subjectId?: string;
  teacherId?: string;
  room?: string;
}

export const timetableService = {
  async createPeriod(institutionId: string, data: { name: string; startTime: string; endTime: string; sequence?: number; isBreak?: boolean }) {
    const db = getTenantPrisma(institutionId);
    return db.timetablePeriod.create({
      data: { institutionId, name: data.name, startTime: data.startTime, endTime: data.endTime, sequence: data.sequence ?? 0, isBreak: data.isBreak ?? false },
    });
  },

  async listPeriods(institutionId: string) {
    const db = getTenantPrisma(institutionId);
    return db.timetablePeriod.findMany({ orderBy: { sequence: 'asc' } });
  },

  /** Assign a subject/teacher to a section's day+period. Rejects teacher double-booking. */
  async setSlot(institutionId: string, data: SetSlotInput) {
    const db = getTenantPrisma(institutionId);

    if (data.teacherId) {
      const clash = await db.timetableSlot.findFirst({
        where: { dayOfWeek: data.dayOfWeek, periodId: data.periodId, teacherId: data.teacherId, NOT: { sectionId: data.sectionId } },
      });
      if (clash) {
        throw new BadRequestError(`Teacher is already assigned to another section in this period (${data.dayOfWeek}).`);
      }
    }

    return db.timetableSlot.upsert({
      where: { sectionId_dayOfWeek_periodId: { sectionId: data.sectionId, dayOfWeek: data.dayOfWeek, periodId: data.periodId } },
      update: { subjectName: data.subjectName, subjectId: data.subjectId ?? null, teacherId: data.teacherId ?? null, room: data.room ?? null },
      create: {
        institutionId,
        sectionId: data.sectionId,
        dayOfWeek: data.dayOfWeek,
        periodId: data.periodId,
        subjectName: data.subjectName,
        subjectId: data.subjectId ?? null,
        teacherId: data.teacherId ?? null,
        room: data.room ?? null,
      },
    });
  },

  async clearSlot(institutionId: string, sectionId: string, dayOfWeek: DayOfWeek, periodId: string) {
    const db = getTenantPrisma(institutionId);
    await db.timetableSlot.deleteMany({ where: { sectionId, dayOfWeek, periodId } });
    return { ok: true };
  },

  async getSectionTimetable(institutionId: string, sectionId: string) {
    const db = getTenantPrisma(institutionId);
    return db.timetableSlot.findMany({
      where: { sectionId },
      include: { period: true },
      orderBy: [{ period: { sequence: 'asc' } }, { dayOfWeek: 'asc' }],
    });
  },

  async getTeacherTimetable(institutionId: string, teacherId: string) {
    const db = getTenantPrisma(institutionId);
    return db.timetableSlot.findMany({
      where: { teacherId },
      include: { period: true },
      orderBy: [{ dayOfWeek: 'asc' }, { period: { sequence: 'asc' } }],
    });
  },

  /** Plan a substitution for a date; rejects if the substitute already teaches that period. */
  async createSubstitution(institutionId: string, data: { slotId: string; date: string; substituteTeacherId: string; reason?: string }) {
    const db = getTenantPrisma(institutionId);
    const slot = await db.timetableSlot.findFirst({ where: { id: data.slotId } });
    if (!slot) throw new NotFoundError('Timetable slot not found');

    const busy = await db.timetableSlot.findFirst({
      where: { dayOfWeek: slot.dayOfWeek, periodId: slot.periodId, teacherId: data.substituteTeacherId },
    });
    if (busy) throw new BadRequestError('Substitute teacher already has a class in this period.');

    const sub = await db.substitution.create({
      data: {
        institutionId,
        slotId: data.slotId,
        date: new Date(data.date),
        originalTeacherId: slot.teacherId ?? null,
        substituteTeacherId: data.substituteTeacherId,
        reason: data.reason ?? null,
        status: 'planned',
      },
    });
    logger.info('[timetable] substitution planned', { slotId: data.slotId, date: data.date });
    return sub;
  },

  async listSubstitutions(institutionId: string, filters: { date?: string; status?: SubstitutionStatus } = {}) {
    const db = getTenantPrisma(institutionId);
    return db.substitution.findMany({
      where: {
        ...(filters.date ? { date: new Date(filters.date) } : {}),
        ...(filters.status ? { status: filters.status } : {}),
      },
      include: { slot: { include: { period: true } } },
      orderBy: { date: 'desc' },
      take: 200,
    });
  },
};
