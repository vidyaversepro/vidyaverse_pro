import { getTenantPrisma } from '../../lib/prisma-tenant.js';

/**
 * Read-only cross-module BI aggregations + saved-report persistence.
 * All queries are tenant-scoped via getTenantPrisma.
 */
export const reportsService = {
  async studentsByStatus(institutionId: string) {
    const db = getTenantPrisma(institutionId);
    const rows = await db.student.groupBy({ by: ['status'], _count: { _all: true } });
    return rows.map((r) => ({ status: r.status, count: r._count._all }));
  },

  async feeCollectionSummary(institutionId: string) {
    const db = getTenantPrisma(institutionId);
    const totals = await db.feeInvoice.aggregate({ _sum: { netAmount: true, paidAmount: true }, _count: { _all: true } });
    const byStatus = await db.feeInvoice.groupBy({ by: ['status'], _count: { _all: true }, _sum: { netAmount: true } });
    const billed = Number(totals._sum.netAmount ?? 0);
    const collected = Number(totals._sum.paidAmount ?? 0);
    return {
      invoiceCount: totals._count._all,
      billed,
      collected,
      outstanding: billed - collected,
      collectionRate: billed > 0 ? Math.round((collected / billed) * 10000) / 100 : 0,
      byStatus: byStatus.map((r) => ({ status: r.status, count: r._count._all, billed: Number(r._sum.netAmount ?? 0) })),
    };
  },

  async admissionsFunnel(institutionId: string) {
    const db = getTenantPrisma(institutionId);
    const rows = await db.enquiry.groupBy({ by: ['status'], _count: { _all: true } });
    const map = Object.fromEntries(rows.map((r) => [r.status, r._count._all]));
    const total = rows.reduce((s, r) => s + r._count._all, 0);
    const admitted = map['admitted'] ?? 0;
    return { total, byStatus: map, conversionRate: total > 0 ? Math.round((admitted / total) * 10000) / 100 : 0 };
  },

  async staffByDepartment(institutionId: string) {
    const db = getTenantPrisma(institutionId);
    const rows = await db.staffMember.groupBy({ by: ['department'], _count: { _all: true } });
    return rows.map((r) => ({ department: r.department ?? 'Unassigned', count: r._count._all }));
  },

  /** Headline KPI tiles for the BI dashboard. */
  async overview(institutionId: string) {
    const db = getTenantPrisma(institutionId);
    const [students, staff, fees, enquiries] = await Promise.all([
      db.student.count({ where: { status: 'active' } }),
      db.staffMember.count(),
      this.feeCollectionSummary(institutionId),
      db.enquiry.count(),
    ]);
    return { activeStudents: students, staffCount: staff, feeCollected: fees.collected, feeOutstanding: fees.outstanding, totalEnquiries: enquiries };
  },

  // ── Saved reports ──────────────────────────────────────────────────────────
  async saveReport(institutionId: string, data: { name: string; reportType: string; config?: Record<string, unknown>; createdBy?: string }) {
    const db = getTenantPrisma(institutionId);
    return db.savedReport.create({
      data: {
        institutionId,
        name: data.name,
        reportType: data.reportType,
        config: data.config ? (data.config as object) : undefined,
        createdBy: data.createdBy ?? null,
      },
    });
  },

  async listSavedReports(institutionId: string) {
    const db = getTenantPrisma(institutionId);
    return db.savedReport.findMany({ orderBy: { createdAt: 'desc' } });
  },

  async deleteSavedReport(institutionId: string, id: string) {
    const db = getTenantPrisma(institutionId);
    await db.savedReport.delete({ where: { id } });
    return { deleted: true };
  },
};
