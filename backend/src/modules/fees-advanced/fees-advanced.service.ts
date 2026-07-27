import type { ConcessionType } from '@prisma/client';
import { getTenantPrisma } from '../../lib/prisma-tenant.js';
import { NotFoundError, ValidationError } from '../../utils/errors.js';

export const feesAdvancedService = {
  // ── Concessions ──────────────────────────────────────────────────────────────
  async createConcession(institutionId: string, data: { studentId: string; name: string; type?: ConcessionType; amount?: number | string; percent?: number | string; academicYear: string }) {
    const db = getTenantPrisma(institutionId);
    if (data.amount == null && data.percent == null) throw new ValidationError('Provide either amount or percent');
    return db.feeConcession.create({
      data: {
        institutionId,
        studentId: data.studentId,
        name: data.name,
        type: data.type ?? 'scholarship',
        amount: data.amount != null ? String(data.amount) : null,
        percent: data.percent != null ? String(data.percent) : null,
        academicYear: data.academicYear,
      },
    });
  },

  async listConcessions(institutionId: string, studentId?: string) {
    const db = getTenantPrisma(institutionId);
    return db.feeConcession.findMany({ where: { ...(studentId ? { studentId } : {}) }, orderBy: { createdAt: 'desc' } });
  },

  async expireConcession(institutionId: string, id: string) {
    const db = getTenantPrisma(institutionId);
    return db.feeConcession.update({ where: { id }, data: { status: 'expired' } });
  },

  // ── Installment plans ──────────────────────────────────────────────────────────
  /** Creates a plan + evenly-split installments with monthly due dates from `firstDueDate`. */
  async createInstallmentPlan(institutionId: string, data: { studentId: string; totalAmount: number | string; numInstallments: number; academicYear: string; firstDueDate?: string }) {
    const db = getTenantPrisma(institutionId);
    const total = Number(data.totalAmount);
    const n = data.numInstallments;
    if (n < 1) throw new ValidationError('numInstallments must be >= 1');

    const plan = await db.feeInstallmentPlan.create({
      data: { institutionId, studentId: data.studentId, totalAmount: String(total), numInstallments: n, academicYear: data.academicYear },
    });

    const base = Math.floor((total / n) * 100) / 100;
    const start = data.firstDueDate ? new Date(data.firstDueDate) : new Date();
    let allocated = 0;
    for (let i = 0; i < n; i += 1) {
      // last installment absorbs rounding remainder
      const amount = i === n - 1 ? Math.round((total - allocated) * 100) / 100 : base;
      allocated += base;
      const due = new Date(start);
      due.setMonth(due.getMonth() + i);
      await db.feeInstallment.create({
        data: { institutionId, planId: plan.id, installmentNo: i + 1, amount: String(amount), dueDate: due },
      });
    }
    return db.feeInstallmentPlan.findUniqueOrThrow({ where: { id: plan.id }, include: { installments: { orderBy: { installmentNo: 'asc' } } } });
  },

  async listPlans(institutionId: string, studentId?: string) {
    const db = getTenantPrisma(institutionId);
    return db.feeInstallmentPlan.findMany({
      where: { ...(studentId ? { studentId } : {}) },
      orderBy: { createdAt: 'desc' },
      include: { installments: { orderBy: { installmentNo: 'asc' } } },
    });
  },

  async markInstallmentPaid(institutionId: string, installmentId: string) {
    const db = getTenantPrisma(institutionId);
    const inst = await db.feeInstallment.findFirst({ where: { id: installmentId }, select: { id: true } });
    if (!inst) throw new NotFoundError('Installment not found');
    return db.feeInstallment.update({ where: { id: installmentId }, data: { status: 'paid', paidAt: new Date() } });
  },

  /** Marks past-due unpaid installments as overdue and returns them (defaulter tracking). */
  async getDefaulters(institutionId: string) {
    const db = getTenantPrisma(institutionId);
    const now = new Date();
    await db.feeInstallment.updateMany({ where: { status: 'pending', dueDate: { lt: now } }, data: { status: 'overdue' } });
    const overdueInstallments = await db.feeInstallment.findMany({ where: { status: 'overdue' }, orderBy: { dueDate: 'asc' }, include: { plan: { select: { studentId: true } } } });
    // FeeInvoice has no 'overdue' status — past-due is unpaid/partial with dueDate < now.
    const unpaidInvoices = await db.feeInvoice.findMany({ where: { status: { in: ['unpaid', 'partial'] }, dueDate: { lt: now } }, select: { id: true, studentId: true, netAmount: true, paidAmount: true, dueDate: true } });
    const overdueAmount = overdueInstallments.reduce((s, i) => s + Number(i.amount), 0);
    return { overdueInstallments, unpaidInvoices, overdueInstallmentAmount: overdueAmount, count: overdueInstallments.length + unpaidInvoices.length };
  },
};
