import { Prisma } from '@prisma/client';
import type { EmploymentType, StaffStatus, LeaveType } from '@prisma/client';
import { getTenantPrisma } from '../../lib/prisma-tenant.js';
import { logger } from '../../utils/logger.js';
import { NotFoundError, BadRequestError } from '../../utils/errors.js';

const n = (v: unknown): number => Number(v ?? 0);
const money = (v: number): string => v.toFixed(2);
const round2 = (x: number): number => Math.round(x * 100) / 100;

function sumJsonValues(v: unknown): number {
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    return Object.values(v as Record<string, unknown>).reduce<number>((acc, x) => acc + (Number(x) || 0), 0);
  }
  return 0;
}

const PF_RATE = 0.12;
const PF_WAGE_CEILING = 15000; // statutory PF cap on basic
const ESI_EMPLOYEE_RATE = 0.0075;

export interface CreateStaffInput {
  employeeCode?: string;
  firstName: string;
  lastName?: string;
  designation?: string;
  department?: string;
  employmentType?: EmploymentType;
  dateOfJoining?: string;
  email?: string;
  phone?: string;
  userId?: string;
}

export interface SalaryStructureInput {
  effectiveFrom?: string;
  basic: number | string;
  hra?: number | string;
  conveyance?: number | string;
  special?: number | string;
  otherAllowances?: Record<string, number>;
  pfEnabled?: boolean;
  esiEnabled?: boolean;
  professionalTax?: number | string;
  tds?: number | string;
  otherDeductions?: Record<string, number>;
}

export const hrService = {
  // ── Staff ──
  async createStaff(institutionId: string, data: CreateStaffInput) {
    const db = getTenantPrisma(institutionId);
    return db.staffMember.create({
      data: {
        institutionId,
        employeeCode: data.employeeCode ?? `EMP-${Date.now()}`,
        firstName: data.firstName,
        lastName: data.lastName ?? null,
        designation: data.designation ?? null,
        department: data.department ?? null,
        employmentType: data.employmentType ?? 'full_time',
        dateOfJoining: data.dateOfJoining ? new Date(data.dateOfJoining) : null,
        email: data.email ?? null,
        phone: data.phone ?? null,
        userId: data.userId ?? null,
      },
    });
  },

  async listStaff(institutionId: string, filters: { status?: StaffStatus; department?: string; search?: string } = {}) {
    const db = getTenantPrisma(institutionId);
    const where: Prisma.StaffMemberWhereInput = {};
    if (filters.status) where.status = filters.status;
    if (filters.department) where.department = filters.department;
    if (filters.search) {
      where.OR = [
        { firstName: { contains: filters.search } },
        { lastName: { contains: filters.search } },
        { employeeCode: { contains: filters.search } },
      ];
    }
    return db.staffMember.findMany({ where, orderBy: { firstName: 'asc' }, take: 500 });
  },

  async getStaff(institutionId: string, id: string) {
    const db = getTenantPrisma(institutionId);
    const staff = await db.staffMember.findFirst({
      where: { id },
      include: {
        salaryStructures: { where: { isActive: true }, orderBy: { effectiveFrom: 'desc' }, take: 1 },
        payslips: { orderBy: [{ year: 'desc' }, { month: 'desc' }], take: 12 },
        leaveRequests: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
    if (!staff) throw new NotFoundError('Staff member not found');
    return staff;
  },

  async updateStaff(institutionId: string, id: string, data: Partial<CreateStaffInput> & { status?: StaffStatus }) {
    const db = getTenantPrisma(institutionId);
    return db.staffMember.update({
      where: { id },
      data: {
        ...(data.firstName !== undefined ? { firstName: data.firstName } : {}),
        ...(data.lastName !== undefined ? { lastName: data.lastName } : {}),
        ...(data.designation !== undefined ? { designation: data.designation } : {}),
        ...(data.department !== undefined ? { department: data.department } : {}),
        ...(data.employmentType !== undefined ? { employmentType: data.employmentType } : {}),
        ...(data.dateOfJoining !== undefined ? { dateOfJoining: data.dateOfJoining ? new Date(data.dateOfJoining) : null } : {}),
        ...(data.email !== undefined ? { email: data.email } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
      },
    });
  },

  // ── Salary structure ──
  async setSalaryStructure(institutionId: string, staffId: string, data: SalaryStructureInput) {
    const db = getTenantPrisma(institutionId);
    await db.salaryStructure.updateMany({ where: { staffId, isActive: true }, data: { isActive: false } });
    return db.salaryStructure.create({
      data: {
        institutionId,
        staffId,
        effectiveFrom: data.effectiveFrom ? new Date(data.effectiveFrom) : new Date(),
        basic: money(n(data.basic)),
        hra: money(n(data.hra)),
        conveyance: money(n(data.conveyance)),
        special: money(n(data.special)),
        otherAllowances: data.otherAllowances ? (data.otherAllowances as Prisma.InputJsonValue) : Prisma.JsonNull,
        pfEnabled: data.pfEnabled ?? true,
        esiEnabled: data.esiEnabled ?? false,
        professionalTax: money(n(data.professionalTax)),
        tds: money(n(data.tds)),
        otherDeductions: data.otherDeductions ? (data.otherDeductions as Prisma.InputJsonValue) : Prisma.JsonNull,
      },
    });
  },

  // ── Payroll computation ──
  computeFromStructure(structure: {
    basic: Prisma.Decimal | number | string;
    hra: Prisma.Decimal | number | string;
    conveyance: Prisma.Decimal | number | string;
    special: Prisma.Decimal | number | string;
    otherAllowances: unknown;
    pfEnabled: boolean;
    esiEnabled: boolean;
    professionalTax: Prisma.Decimal | number | string;
    tds: Prisma.Decimal | number | string;
    otherDeductions: unknown;
  }) {
    const basic = n(structure.basic);
    const otherAllow = sumJsonValues(structure.otherAllowances);
    const gross = basic + n(structure.hra) + n(structure.conveyance) + n(structure.special) + otherAllow;

    const pf = structure.pfEnabled ? Math.min(basic, PF_WAGE_CEILING) * PF_RATE : 0;
    const esi = structure.esiEnabled ? gross * ESI_EMPLOYEE_RATE : 0;
    const otherDed = sumJsonValues(structure.otherDeductions);
    const deductions = pf + esi + n(structure.professionalTax) + n(structure.tds) + otherDed;
    const net = gross - deductions;

    return {
      gross: round2(gross),
      deductions: round2(deductions),
      net: round2(net),
      breakdown: {
        earnings: { basic, hra: n(structure.hra), conveyance: n(structure.conveyance), special: n(structure.special), otherAllowances: round2(otherAllow) },
        deductions: { pf: round2(pf), esi: round2(esi), professionalTax: n(structure.professionalTax), tds: n(structure.tds), other: round2(otherDed) },
      },
    };
  },

  async generatePayslip(institutionId: string, staffId: string, month: number, year: number) {
    const db = getTenantPrisma(institutionId);
    const structure = await db.salaryStructure.findFirst({ where: { staffId, isActive: true }, orderBy: { effectiveFrom: 'desc' } });
    if (!structure) throw new BadRequestError('No active salary structure for this staff member');

    const c = this.computeFromStructure(structure);
    return db.payslip.upsert({
      where: { staffId_month_year: { staffId, month, year } },
      update: {
        grossEarnings: money(c.gross),
        totalDeductions: money(c.deductions),
        netPay: money(c.net),
        breakdown: c.breakdown as unknown as Prisma.InputJsonValue,
        status: 'draft',
      },
      create: {
        institutionId,
        staffId,
        month,
        year,
        grossEarnings: money(c.gross),
        totalDeductions: money(c.deductions),
        netPay: money(c.net),
        breakdown: c.breakdown as unknown as Prisma.InputJsonValue,
        status: 'draft',
      },
    });
  },

  async runPayroll(institutionId: string, month: number, year: number) {
    const db = getTenantPrisma(institutionId);
    const staff = await db.staffMember.findMany({ where: { status: 'active' }, select: { id: true } });
    let generated = 0;
    let skipped = 0;
    for (const s of staff) {
      try {
        await this.generatePayslip(institutionId, s.id, month, year);
        generated += 1;
      } catch {
        skipped += 1; // no active salary structure
      }
    }
    logger.info('[hr] payroll run', { institutionId, month, year, generated, skipped });
    return { generated, skipped, totalStaff: staff.length };
  },

  async listPayslips(institutionId: string, filters: { staffId?: string; month?: number; year?: number } = {}) {
    const db = getTenantPrisma(institutionId);
    return db.payslip.findMany({
      where: {
        ...(filters.staffId ? { staffId: filters.staffId } : {}),
        ...(filters.month ? { month: filters.month } : {}),
        ...(filters.year ? { year: filters.year } : {}),
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      take: 500,
    });
  },

  async setPayslipStatus(institutionId: string, id: string, status: 'finalized' | 'paid') {
    const db = getTenantPrisma(institutionId);
    return db.payslip.update({
      where: { id },
      data: { status, ...(status === 'paid' ? { paidAt: new Date() } : {}) },
    });
  },

  // ── Leave ──
  async requestLeave(institutionId: string, staffId: string, data: { type?: LeaveType; fromDate: string; toDate: string; reason?: string }) {
    const db = getTenantPrisma(institutionId);
    const from = new Date(data.fromDate);
    const to = new Date(data.toDate);
    const days = Math.max(1, Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1);
    return db.leaveRequest.create({
      data: { institutionId, staffId, type: data.type ?? 'casual', fromDate: from, toDate: to, days, reason: data.reason ?? null, status: 'pending' },
    });
  },

  async listLeaves(institutionId: string, filters: { staffId?: string; status?: 'pending' | 'approved' | 'rejected' } = {}) {
    const db = getTenantPrisma(institutionId);
    return db.leaveRequest.findMany({
      where: {
        ...(filters.staffId ? { staffId: filters.staffId } : {}),
        ...(filters.status ? { status: filters.status } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 300,
    });
  },

  async reviewLeave(institutionId: string, id: string, decision: 'approved' | 'rejected', reviewerUserId?: string) {
    const db = getTenantPrisma(institutionId);
    return db.leaveRequest.update({
      where: { id },
      data: { status: decision, reviewedByUserId: reviewerUserId ?? null, reviewedAt: new Date() },
    });
  },
};
