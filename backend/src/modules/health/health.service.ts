import { getTenantPrisma } from '../../lib/prisma-tenant.js';
import { logger } from '../../utils/logger.js';
import { messagingService } from '../messaging/messaging.service.js';

export const healthService = {
  // ── Health records (one per student) ─────────────────────────────────────────
  async upsertRecord(institutionId: string, data: { studentId: string; bloodGroup?: string; allergies?: string; conditions?: string; heightCm?: number | string; weightKg?: number | string; lastCheckup?: string }) {
    const db = getTenantPrisma(institutionId);
    const payload = {
      bloodGroup: data.bloodGroup ?? null,
      allergies: data.allergies ?? null,
      conditions: data.conditions ?? null,
      heightCm: data.heightCm != null ? String(data.heightCm) : null,
      weightKg: data.weightKg != null ? String(data.weightKg) : null,
      lastCheckup: data.lastCheckup ? new Date(data.lastCheckup) : null,
    };
    return db.healthRecord.upsert({
      where: { institutionId_studentId: { institutionId, studentId: data.studentId } },
      update: payload,
      create: { institutionId, studentId: data.studentId, ...payload },
    });
  },

  async getRecord(institutionId: string, studentId: string) {
    const db = getTenantPrisma(institutionId);
    return db.healthRecord.findFirst({ where: { studentId } });
  },

  // ── Clinic visits ─────────────────────────────────────────────────────────────
  async recordVisit(institutionId: string, data: { studentId: string; symptoms?: string; diagnosis?: string; treatment?: string; attendedBy?: string; notifyGuardian?: boolean }) {
    const db = getTenantPrisma(institutionId);
    const visit = await db.clinicVisit.create({
      data: {
        institutionId,
        studentId: data.studentId,
        symptoms: data.symptoms ?? null,
        diagnosis: data.diagnosis ?? null,
        treatment: data.treatment ?? null,
        attendedBy: data.attendedBy ?? null,
        guardianNotified: false,
      },
    });

    let notified = 0;
    if (data.notifyGuardian && (await messagingService.isMessagingEnabled(institutionId))) {
      notified = await this.notifyGuardiansOfVisit(institutionId, data.studentId, visit.id);
      if (notified > 0) await db.clinicVisit.update({ where: { id: visit.id }, data: { guardianNotified: true } });
    }
    return { visit, notified };
  },

  async notifyGuardiansOfVisit(institutionId: string, studentId: string, visitId: string): Promise<number> {
    const db = getTenantPrisma(institutionId);
    const links = await db.guardianStudentLink.findMany({ where: { studentId }, select: { guardianId: true } });
    let notified = 0;
    const seen = new Set<string>();
    const stamp = Date.now();
    for (const link of links) {
      if (seen.has(link.guardianId)) continue;
      seen.add(link.guardianId);
      const g = await db.guardian.findFirst({ where: { id: link.guardianId }, select: { id: true, firstName: true } });
      if (!g) continue;
      await messagingService.enqueueMessage({
        institutionId,
        recipientType: 'guardian',
        recipientId: g.id,
        templateCode: 'health_alert',
        variables: { guardian_name: g.firstName },
        category: 'utility',
        priority: 'high',
        idempotencyKey: `health:${visitId}:${g.id}:${stamp}`,
      });
      notified += 1;
    }
    logger.info('[health] clinic visit guardians notified', { visitId, notified });
    return notified;
  },

  async listVisits(institutionId: string, studentId?: string) {
    const db = getTenantPrisma(institutionId);
    return db.clinicVisit.findMany({
      where: { ...(studentId ? { studentId } : {}) },
      orderBy: { visitDate: 'desc' },
      take: 200,
    });
  },

  // ── Vaccination records ───────────────────────────────────────────────────────
  async addVaccination(institutionId: string, data: { studentId: string; vaccineName: string; dateAdministered?: string; nextDue?: string; notes?: string }) {
    const db = getTenantPrisma(institutionId);
    return db.vaccinationRecord.create({
      data: {
        institutionId,
        studentId: data.studentId,
        vaccineName: data.vaccineName,
        dateAdministered: data.dateAdministered ? new Date(data.dateAdministered) : null,
        nextDue: data.nextDue ? new Date(data.nextDue) : null,
        notes: data.notes ?? null,
      },
    });
  },

  async listVaccinations(institutionId: string, studentId?: string) {
    const db = getTenantPrisma(institutionId);
    return db.vaccinationRecord.findMany({
      where: { ...(studentId ? { studentId } : {}) },
      orderBy: { dateAdministered: 'desc' },
    });
  },

  /** Vaccinations due within `days` — for follow-up reminders. */
  async getDueVaccinations(institutionId: string, days = 30) {
    const db = getTenantPrisma(institutionId);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);
    return db.vaccinationRecord.findMany({
      where: { nextDue: { lte: cutoff, gte: new Date() } },
      orderBy: { nextDue: 'asc' },
    });
  },
};
