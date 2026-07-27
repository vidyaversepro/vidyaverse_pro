import type { BiometricType, PunchPersonType, PunchDirection, StaffAttendanceStatus } from '@prisma/client';
import { getTenantPrisma } from '../../lib/prisma-tenant.js';
import { NotFoundError } from '../../utils/errors.js';

/** UTC midnight of a date — matches how `new Date('YYYY-MM-DD')` parses, so a
 * @db.Date column keys consistently regardless of server timezone. */
function utcDateOnly(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export const biometricService = {
  // ── Devices ──────────────────────────────────────────────────────────────────
  async registerDevice(institutionId: string, data: { name: string; deviceCode?: string; location?: string; deviceType?: BiometricType }) {
    const db = getTenantPrisma(institutionId);
    return db.biometricDevice.create({
      data: {
        institutionId,
        name: data.name,
        deviceCode: data.deviceCode ?? `DEV-${Date.now()}`,
        location: data.location ?? null,
        deviceType: data.deviceType ?? 'fingerprint',
      },
    });
  },

  async listDevices(institutionId: string) {
    const db = getTenantPrisma(institutionId);
    return db.biometricDevice.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { punches: true } } } });
  },

  // ── Punches (device push) ──────────────────────────────────────────────────────
  async recordPunch(institutionId: string, data: { deviceId: string; personType: PunchPersonType; personId: string; direction?: PunchDirection; punchTime?: string }) {
    const db = getTenantPrisma(institutionId);
    const device = await db.biometricDevice.findFirst({ where: { id: data.deviceId }, select: { id: true } });
    if (!device) throw new NotFoundError('Device not found');
    await db.biometricDevice.update({ where: { id: data.deviceId }, data: { lastSeenAt: new Date() } });
    const punch = await db.biometricPunch.create({
      data: {
        institutionId,
        deviceId: data.deviceId,
        personType: data.personType,
        personId: data.personId,
        direction: data.direction ?? 'in',
        punchTime: data.punchTime ? new Date(data.punchTime) : new Date(),
      },
    });

    // Staff punch → upsert today's StaffAttendance with check-in/out.
    if (data.personType === 'staff') {
      const day = utcDateOnly(punch.punchTime);
      const existing = await db.staffAttendance.findFirst({ where: { staffId: data.personId, attendanceDate: day } });
      if (!existing) {
        await db.staffAttendance.create({ data: { institutionId, staffId: data.personId, attendanceDate: day, status: 'present', checkIn: punch.punchTime } });
      } else if (punch.direction === 'out') {
        await db.staffAttendance.update({ where: { id: existing.id }, data: { checkOut: punch.punchTime } });
      }
    }
    return punch;
  },

  async listPunches(institutionId: string, filters: { personId?: string; deviceId?: string; date?: string } = {}) {
    const db = getTenantPrisma(institutionId);
    let dateFilter = {};
    if (filters.date) {
      const start = new Date(filters.date); start.setHours(0, 0, 0, 0);
      const end = new Date(start); end.setDate(end.getDate() + 1);
      dateFilter = { punchTime: { gte: start, lt: end } };
    }
    return db.biometricPunch.findMany({
      where: { ...(filters.personId ? { personId: filters.personId } : {}), ...(filters.deviceId ? { deviceId: filters.deviceId } : {}), ...dateFilter },
      orderBy: { punchTime: 'desc' },
      take: 300,
    });
  },

  // ── Staff attendance ──────────────────────────────────────────────────────────
  async markStaffAttendance(institutionId: string, data: { staffId: string; attendanceDate: string; status: StaffAttendanceStatus }) {
    const db = getTenantPrisma(institutionId);
    const day = utcDateOnly(new Date(data.attendanceDate));
    return db.staffAttendance.upsert({
      where: { staffId_attendanceDate: { staffId: data.staffId, attendanceDate: day } },
      update: { status: data.status },
      create: { institutionId, staffId: data.staffId, attendanceDate: day, status: data.status },
    });
  },

  async staffAttendanceForDate(institutionId: string, date: string) {
    const db = getTenantPrisma(institutionId);
    const day = utcDateOnly(new Date(date));
    const rows = await db.staffAttendance.findMany({ where: { attendanceDate: day } });
    const summary = { present: 0, absent: 0, half_day: 0, leave: 0 };
    for (const r of rows) summary[r.status] += 1;
    return { date, records: rows, summary };
  },
};
