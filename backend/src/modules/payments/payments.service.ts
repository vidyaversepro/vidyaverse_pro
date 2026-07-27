import type { FeeCategory, FeeFrequency, GatewayProvider, InvoiceStatus, PaymentMethod } from '@prisma/client';
import { getTenantPrisma } from '../../lib/prisma-tenant.js';
import { logger } from '../../utils/logger.js';
import { NotFoundError } from '../../utils/errors.js';
import { messagingService } from '../messaging/messaging.service.js';
import { createRazorpayPaymentLink } from '../../lib/payments/razorpay.js';
import { entitlementsService } from '../entitlements/entitlements.service.js';
import { financeService } from '../finance/finance.service.js';

const n = (v: unknown): number => Number(v ?? 0);
const money = (v: number): string => v.toFixed(2);

export interface CreateFeeStructureInput {
  academicYear?: string;
  classId?: string | null;
  name: string;
  category: FeeCategory;
  amount: number | string;
  frequency: FeeFrequency;
  dueDayOfMonth?: number;
  lateFeeAmount?: number | string;
  lateFeeAfterDays?: number;
}

export interface CreateInvoiceInput {
  studentId: string;
  feeStructureId?: string;
  amount: number | string;
  discount?: number | string;
  lateFee?: number | string;
  dueDate: string;
  notes?: string;
}

export const paymentsService = {
  async createFeeStructure(institutionId: string, data: CreateFeeStructureInput) {
    const db = getTenantPrisma(institutionId);
    return db.feeStructure.create({
      data: {
        institutionId,
        academicYear: data.academicYear ?? '2025-2026',
        classId: data.classId ?? null,
        name: data.name,
        category: data.category,
        amount: String(data.amount),
        frequency: data.frequency,
        dueDayOfMonth: data.dueDayOfMonth ?? null,
        lateFeeAmount: data.lateFeeAmount != null ? String(data.lateFeeAmount) : null,
        lateFeeAfterDays: data.lateFeeAfterDays ?? null,
      },
    });
  },

  async listFeeStructures(institutionId: string) {
    const db = getTenantPrisma(institutionId);
    return db.feeStructure.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' } });
  },

  async createInvoice(institutionId: string, data: CreateInvoiceInput) {
    const db = getTenantPrisma(institutionId);
    const net = n(data.amount) - n(data.discount) + n(data.lateFee);
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    return db.feeInvoice.create({
      data: {
        institutionId,
        studentId: data.studentId,
        feeStructureId: data.feeStructureId ?? null,
        invoiceNumber,
        amount: String(data.amount),
        discount: money(n(data.discount)),
        lateFee: money(n(data.lateFee)),
        netAmount: money(net),
        dueDate: new Date(data.dueDate),
        notes: data.notes ?? null,
      },
    });
  },

  async listInvoices(institutionId: string, opts: { studentId?: string; status?: InvoiceStatus; limit?: number } = {}) {
    const db = getTenantPrisma(institutionId);
    return db.feeInvoice.findMany({
      where: {
        ...(opts.studentId ? { studentId: opts.studentId } : {}),
        ...(opts.status ? { status: opts.status } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(opts.limit ?? 100, 500),
    });
  },

  async feeSummary(institutionId: string) {
    const db = getTenantPrisma(institutionId);
    const [agg, pending] = await Promise.all([
      db.feeInvoice.aggregate({ _sum: { netAmount: true, paidAmount: true } }),
      db.feeInvoice.count({ where: { status: { in: ['unpaid', 'partial'] } } }),
    ]);
    const billed = n(agg._sum.netAmount);
    const collected = n(agg._sum.paidAmount);
    return {
      totalBilled: billed,
      totalCollected: collected,
      totalOutstanding: billed - collected,
      pendingInvoices: pending,
      collectionRate: billed > 0 ? (collected / billed) * 100 : 0,
    };
  },

  /** Create (or reuse) a Razorpay payment link for an invoice and store it. */
  async createPaymentLink(institutionId: string, invoiceId: string) {
    const db = getTenantPrisma(institutionId);
    const invoice = await db.feeInvoice.findFirst({ where: { id: invoiceId }, include: { student: true } });
    if (!invoice) throw new NotFoundError('Invoice not found');

    const link = await db.guardianStudentLink.findFirst({
      where: { studentId: invoice.studentId },
      orderBy: { isPrimary: 'desc' },
    });
    let contact = '';
    let guardianId: string | undefined;
    if (link) {
      const g = await db.guardian.findFirst({ where: { id: link.guardianId }, select: { id: true, whatsappNumber: true } });
      contact = g?.whatsappNumber ?? '';
      guardianId = g?.id;
    }

    const result = await createRazorpayPaymentLink({
      invoiceId: invoice.id,
      amountPaise: Math.round(n(invoice.netAmount) * 100),
      description: `Fee ${invoice.invoiceNumber} — ${invoice.student.name}`,
      customerName: invoice.student.name,
      customerContact: contact,
      guardianId,
    });
    if (!result.ok) throw new Error(result.error ?? 'Failed to create payment link');

    await db.feeInvoice.update({
      where: { id: invoice.id },
      data: { paymentLinkUrl: result.shortUrl, gatewayOrderId: result.linkId },
    });
    return { shortUrl: result.shortUrl, linkId: result.linkId, skipped: result.skipped ?? false };
  },

  /** Send a fee reminder (with UPI payment link) to every guardian with notifyFees on the edge. */
  async sendFeeReminder(institutionId: string, invoiceId: string) {
    if (!(await messagingService.isMessagingEnabled(institutionId))) {
      return { sent: 0, reason: 'messaging disabled' };
    }
    const db = getTenantPrisma(institutionId);
    const invoice = await db.feeInvoice.findFirst({ where: { id: invoiceId }, include: { student: true } });
    if (!invoice) throw new NotFoundError('Invoice not found');

    let paymentLink = invoice.paymentLinkUrl;
    if (!paymentLink) {
      const created = await this.createPaymentLink(institutionId, invoiceId);
      paymentLink = created.shortUrl ?? '';
    }

    const links = await db.guardianStudentLink.findMany({
      where: { studentId: invoice.studentId, notifyFees: true },
    });

    let sent = 0;
    for (const gl of links) {
      const g = await db.guardian.findFirst({ where: { id: gl.guardianId }, select: { id: true, firstName: true } });
      if (!g) continue;
      await messagingService.enqueueMessage({
        institutionId,
        recipientType: 'guardian',
        recipientId: g.id,
        templateCode: 'fee_reminder',
        variables: {
          guardian_name: g.firstName,
          child_name: invoice.student.name,
          amount: String(invoice.netAmount),
          payment_link: paymentLink ?? '',
        },
        priority: 'normal',
        idempotencyKey: `fee-reminder:${invoiceId}:${g.id}`,
      });
      sent += 1;
    }
    return { sent };
  },

  /** Record a successful payment and fire the confirmation message. Used by the webhook. */
  async markInvoicePaid(params: {
    institutionId: string;
    invoiceId: string;
    amount: number;
    gatewayProvider?: GatewayProvider;
    gatewayPaymentId: string;
    gatewayOrderId?: string;
    method?: PaymentMethod;
    guardianId?: string;
  }) {
    const db = getTenantPrisma(params.institutionId);
    const invoice = await db.feeInvoice.findFirst({ where: { id: params.invoiceId }, include: { student: true } });
    if (!invoice) return { ok: false, reason: 'unknown invoice' };

    const newPaid = n(invoice.paidAmount) + params.amount;
    const status: InvoiceStatus = newPaid >= n(invoice.netAmount) ? 'paid' : 'partial';

    await db.feePayment.create({
      data: {
        institutionId: params.institutionId,
        invoiceId: params.invoiceId,
        amount: money(params.amount),
        paidByGuardianId: params.guardianId ?? null,
        method: params.method ?? 'upi',
        gatewayProvider: params.gatewayProvider ?? null,
        gatewayPaymentId: params.gatewayPaymentId,
        gatewayOrderId: params.gatewayOrderId ?? null,
        status: 'success',
        paidAt: new Date(),
      },
    });

    await db.feeInvoice.update({
      where: { id: params.invoiceId },
      data: { status, paidAmount: money(newPaid), paidAt: status === 'paid' ? new Date() : null },
    });

    // Payment confirmation fires immediately (critical) — never batched.
    if (await messagingService.isMessagingEnabled(params.institutionId)) {
      const gl = params.guardianId
        ? null
        : await db.guardianStudentLink.findFirst({ where: { studentId: invoice.studentId }, orderBy: { isPrimary: 'desc' } });
      const gId = params.guardianId ?? gl?.guardianId;
      if (gId) {
        const g = await db.guardian.findFirst({ where: { id: gId }, select: { id: true, firstName: true } });
        if (g) {
          await messagingService.enqueueMessage({
            institutionId: params.institutionId,
            recipientType: 'guardian',
            recipientId: g.id,
            templateCode: 'payment_confirmation',
            variables: {
              guardian_name: g.firstName,
              child_name: invoice.student.name,
              amount: money(params.amount),
              invoice_number: invoice.invoiceNumber,
            },
            category: 'utility',
            priority: 'critical',
            idempotencyKey: `payment-confirm:${params.gatewayPaymentId}`,
          });
        }
      }
    }

    // Post the collection into the books when Finance & Accounting is enabled (fees → ledger).
    if (await entitlementsService.isModuleEnabled(params.institutionId, 'finance_accounting')) {
      try {
        await financeService.recordFeeCollection(params.institutionId, { invoiceId: params.invoiceId, amount: params.amount });
      } catch (err) {
        logger.warn({ err }, '[payments] finance posting failed (non-blocking)');
      }
    }

    logger.info('[payments] invoice marked paid', { invoiceId: params.invoiceId, status });
    return { ok: true, status };
  },
};
