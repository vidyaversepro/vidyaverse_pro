import type { HostelType, AllotmentStatus, MessBillStatus } from '@prisma/client';
import { getTenantPrisma } from '../../lib/prisma-tenant.js';
import { NotFoundError, ValidationError } from '../../utils/errors.js';

export const hostelService = {
  // ── Blocks ────────────────────────────────────────────────────────────────
  async createBlock(institutionId: string, data: { name: string; code?: string; type?: HostelType; wardenName?: string; wardenPhone?: string }) {
    const db = getTenantPrisma(institutionId);
    return db.hostelBlock.create({
      data: {
        institutionId,
        name: data.name,
        code: data.code ?? `BLK-${Date.now()}`,
        type: data.type ?? 'boys',
        wardenName: data.wardenName ?? null,
        wardenPhone: data.wardenPhone ?? null,
      },
    });
  },

  async listBlocks(institutionId: string) {
    const db = getTenantPrisma(institutionId);
    return db.hostelBlock.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      include: { _count: { select: { rooms: true } } },
    });
  },

  // ── Rooms ─────────────────────────────────────────────────────────────────
  async addRoom(institutionId: string, blockId: string, data: { roomNumber: string; floor?: number; capacity?: number; roomType?: string; monthlyRent?: number | string }) {
    const db = getTenantPrisma(institutionId);
    const block = await db.hostelBlock.findFirst({ where: { id: blockId }, select: { id: true } });
    if (!block) throw new NotFoundError('Hostel block not found');
    const room = await db.hostelRoom.create({
      data: {
        institutionId,
        blockId,
        roomNumber: data.roomNumber,
        floor: data.floor ?? 0,
        capacity: data.capacity ?? 1,
        roomType: data.roomType ?? null,
        monthlyRent: data.monthlyRent != null ? String(data.monthlyRent) : null,
      },
    });
    await db.hostelBlock.update({ where: { id: blockId }, data: { totalRooms: { increment: 1 } } });
    return room;
  },

  async listRooms(institutionId: string, blockId?: string) {
    const db = getTenantPrisma(institutionId);
    return db.hostelRoom.findMany({
      where: { isActive: true, ...(blockId ? { blockId } : {}) },
      orderBy: [{ floor: 'asc' }, { roomNumber: 'asc' }],
      include: { block: { select: { name: true, code: true } } },
    });
  },

  // ── Allotments ──────────────────────────────────────────────────────────────
  async allotRoom(institutionId: string, data: { roomId: string; studentId: string; bedNumber?: string }) {
    const db = getTenantPrisma(institutionId);
    const room = await db.hostelRoom.findFirst({ where: { id: data.roomId }, select: { id: true, capacity: true, occupied: true } });
    if (!room) throw new NotFoundError('Room not found');
    if (room.occupied >= room.capacity) throw new ValidationError('Room is at full capacity');

    const allotment = await db.hostelAllotment.create({
      data: {
        institutionId,
        roomId: data.roomId,
        studentId: data.studentId,
        bedNumber: data.bedNumber ?? null,
        status: 'active',
      },
    });
    await db.hostelRoom.update({ where: { id: data.roomId }, data: { occupied: { increment: 1 } } });
    return allotment;
  },

  async vacateRoom(institutionId: string, allotmentId: string) {
    const db = getTenantPrisma(institutionId);
    const allotment = await db.hostelAllotment.findFirst({ where: { id: allotmentId }, select: { id: true, roomId: true, status: true } });
    if (!allotment) throw new NotFoundError('Allotment not found');
    if (allotment.status === 'vacated') return allotment;

    const updated = await db.hostelAllotment.update({
      where: { id: allotmentId },
      data: { status: 'vacated', vacatedAt: new Date() },
    });
    await db.hostelRoom.update({ where: { id: allotment.roomId }, data: { occupied: { decrement: 1 } } });
    return updated;
  },

  async listAllotments(institutionId: string, filters: { roomId?: string; studentId?: string; status?: AllotmentStatus } = {}) {
    const db = getTenantPrisma(institutionId);
    return db.hostelAllotment.findMany({
      where: {
        ...(filters.roomId ? { roomId: filters.roomId } : {}),
        ...(filters.studentId ? { studentId: filters.studentId } : {}),
        ...(filters.status ? { status: filters.status } : { status: 'active' }),
      },
      orderBy: { allottedAt: 'desc' },
      include: { room: { select: { roomNumber: true, blockId: true } } },
    });
  },

  // ── Mess bills ──────────────────────────────────────────────────────────────
  async createMessBill(institutionId: string, data: { studentId: string; billMonth: string; amount: number | string; dueDate?: string }) {
    const db = getTenantPrisma(institutionId);
    return db.messBill.upsert({
      where: { studentId_billMonth: { studentId: data.studentId, billMonth: data.billMonth } },
      update: { amount: String(data.amount), dueDate: data.dueDate ? new Date(data.dueDate) : null },
      create: {
        institutionId,
        studentId: data.studentId,
        billMonth: data.billMonth,
        amount: String(data.amount),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
    });
  },

  async markMessBillPaid(institutionId: string, billId: string) {
    const db = getTenantPrisma(institutionId);
    return db.messBill.update({ where: { id: billId }, data: { status: 'paid', paidAt: new Date() } });
  },

  async listMessBills(institutionId: string, filters: { studentId?: string; status?: MessBillStatus } = {}) {
    const db = getTenantPrisma(institutionId);
    return db.messBill.findMany({
      where: {
        ...(filters.studentId ? { studentId: filters.studentId } : {}),
        ...(filters.status ? { status: filters.status } : {}),
      },
      orderBy: { billMonth: 'desc' },
    });
  },

  async getOccupancySummary(institutionId: string) {
    const db = getTenantPrisma(institutionId);
    const rooms = await db.hostelRoom.findMany({ where: { isActive: true }, select: { capacity: true, occupied: true } });
    const totalBeds = rooms.reduce((s, r) => s + r.capacity, 0);
    const occupiedBeds = rooms.reduce((s, r) => s + r.occupied, 0);
    return { totalRooms: rooms.length, totalBeds, occupiedBeds, vacantBeds: totalBeds - occupiedBeds };
  },
};
