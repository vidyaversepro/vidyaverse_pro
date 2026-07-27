import type { GatePassType } from '@prisma/client';
import { getTenantPrisma } from '../../lib/prisma-tenant.js';
import { NotFoundError } from '../../utils/errors.js';

export const visitorService = {
  // ── Visitor logs ──────────────────────────────────────────────────────────────
  async checkIn(institutionId: string, data: { visitorName: string; phone?: string; purpose?: string; whomToMeet?: string; badgeNumber?: string }) {
    const db = getTenantPrisma(institutionId);
    return db.visitorLog.create({
      data: {
        institutionId,
        visitorName: data.visitorName,
        phone: data.phone ?? null,
        purpose: data.purpose ?? null,
        whomToMeet: data.whomToMeet ?? null,
        badgeNumber: data.badgeNumber ?? `V-${Date.now().toString().slice(-6)}`,
        status: 'checked_in',
      },
    });
  },

  async checkOut(institutionId: string, logId: string) {
    const db = getTenantPrisma(institutionId);
    const log = await db.visitorLog.findFirst({ where: { id: logId } });
    if (!log) throw new NotFoundError('Visitor log not found');
    if (log.status === 'checked_out') return log;
    return db.visitorLog.update({ where: { id: logId }, data: { status: 'checked_out', checkOutAt: new Date() } });
  },

  async listVisitors(institutionId: string, filters: { status?: 'checked_in' | 'checked_out'; date?: string } = {}) {
    const db = getTenantPrisma(institutionId);
    let dateFilter = {};
    if (filters.date) {
      const start = new Date(filters.date);
      const end = new Date(filters.date);
      end.setDate(end.getDate() + 1);
      dateFilter = { checkInAt: { gte: start, lt: end } };
    }
    return db.visitorLog.findMany({
      where: { ...(filters.status ? { status: filters.status } : {}), ...dateFilter },
      orderBy: { checkInAt: 'desc' },
      take: 200,
    });
  },

  async getCurrentlyInside(institutionId: string) {
    const db = getTenantPrisma(institutionId);
    return db.visitorLog.findMany({ where: { status: 'checked_in' }, orderBy: { checkInAt: 'asc' } });
  },

  // ── Gate passes ─────────────────────────────────────────────────────────────
  async issueGatePass(institutionId: string, data: { studentId: string; type?: GatePassType; reason?: string; approvedBy?: string; validUntil?: string }) {
    const db = getTenantPrisma(institutionId);
    return db.gatePass.create({
      data: {
        institutionId,
        studentId: data.studentId,
        type: data.type ?? 'early_leave',
        reason: data.reason ?? null,
        approvedBy: data.approvedBy ?? null,
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
      },
    });
  },

  async listGatePasses(institutionId: string, studentId?: string) {
    const db = getTenantPrisma(institutionId);
    return db.gatePass.findMany({
      where: { ...(studentId ? { studentId } : {}) },
      orderBy: { issuedAt: 'desc' },
      take: 200,
    });
  },
};
