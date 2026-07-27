import type { LedgerAccountType, VoucherType } from '@prisma/client';
import { getTenantPrisma } from '../../lib/prisma-tenant.js';
import { logger } from '../../utils/logger.js';
import { BadRequestError } from '../../utils/errors.js';

const n = (v: unknown): number => Number(v ?? 0);
const money = (v: number): string => v.toFixed(2);
const round2 = (x: number): number => Math.round(x * 100) / 100;

const SYSTEM_ACCOUNTS: Array<{ code: string; name: string; type: LedgerAccountType }> = [
  { code: 'CASH', name: 'Cash', type: 'asset' },
  { code: 'BANK', name: 'Bank', type: 'asset' },
  { code: 'FEE_INCOME', name: 'Fee Income', type: 'income' },
  { code: 'MISC_INCOME', name: 'Miscellaneous Income', type: 'income' },
  { code: 'SALARY_EXP', name: 'Salary Expense', type: 'expense' },
  { code: 'GENERAL_EXP', name: 'General Expense', type: 'expense' },
];

interface LineInput {
  accountId: string;
  debit?: number;
  credit?: number;
}

export interface PostEntryInput {
  entryDate?: string;
  type?: VoucherType;
  narration?: string;
  lines: LineInput[];
  referenceType?: string;
  referenceId?: string;
  createdByUserId?: string;
}

export const financeService = {
  async ensureSystemAccounts(institutionId: string) {
    const db = getTenantPrisma(institutionId);
    const existing = await db.ledgerAccount.findMany({ where: { isSystem: true }, select: { code: true } });
    const have = new Set(existing.map((a) => a.code));
    for (const acc of SYSTEM_ACCOUNTS) {
      if (!have.has(acc.code)) {
        await db.ledgerAccount.create({ data: { institutionId, code: acc.code, name: acc.name, type: acc.type, isSystem: true } });
      }
    }
    return db.ledgerAccount.findMany({ orderBy: { code: 'asc' } });
  },

  async getAccountByCode(institutionId: string, code: string) {
    const db = getTenantPrisma(institutionId);
    return db.ledgerAccount.findFirst({ where: { code } });
  },

  async createAccount(institutionId: string, data: { code?: string; name: string; type: LedgerAccountType }) {
    const db = getTenantPrisma(institutionId);
    return db.ledgerAccount.create({
      data: { institutionId, code: data.code ?? `ACC-${Date.now()}`, name: data.name, type: data.type, isSystem: false },
    });
  },

  async listAccounts(institutionId: string, type?: LedgerAccountType) {
    const db = getTenantPrisma(institutionId);
    return db.ledgerAccount.findMany({ where: { isActive: true, ...(type ? { type } : {}) }, orderBy: { code: 'asc' } });
  },

  /** Post a balanced double-entry journal voucher. Rejects unbalanced/zero entries. */
  async postEntry(institutionId: string, data: PostEntryInput) {
    if (!data.lines || data.lines.length < 2) throw new BadRequestError('A journal entry needs at least two lines');
    const totalDebit = round2(data.lines.reduce((s, l) => s + n(l.debit), 0));
    const totalCredit = round2(data.lines.reduce((s, l) => s + n(l.credit), 0));
    if (totalDebit !== totalCredit) throw new BadRequestError(`Entry not balanced: debit ${totalDebit} ≠ credit ${totalCredit}`);
    if (totalDebit <= 0) throw new BadRequestError('Entry total must be greater than zero');

    const db = getTenantPrisma(institutionId);
    return db.journalEntry.create({
      data: {
        institutionId,
        voucherNumber: `V-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        entryDate: data.entryDate ? new Date(data.entryDate) : new Date(),
        type: data.type ?? 'journal',
        narration: data.narration ?? null,
        totalAmount: money(totalDebit),
        referenceType: data.referenceType ?? null,
        referenceId: data.referenceId ?? null,
        status: 'posted',
        createdByUserId: data.createdByUserId ?? null,
        lines: {
          create: data.lines.map((l) => ({ institutionId, accountId: l.accountId, debit: money(n(l.debit)), credit: money(n(l.credit)) })),
        },
      },
      include: { lines: true },
    });
  },

  async recordExpense(institutionId: string, data: { amount: number; expenseAccountId?: string; paidFrom?: 'CASH' | 'BANK'; narration?: string; date?: string; createdByUserId?: string }) {
    await this.ensureSystemAccounts(institutionId);
    const expenseAccId = data.expenseAccountId ?? (await this.getAccountByCode(institutionId, 'GENERAL_EXP'))!.id;
    const payAcc = (await this.getAccountByCode(institutionId, data.paidFrom ?? 'CASH'))!;
    return this.postEntry(institutionId, {
      type: 'payment',
      entryDate: data.date,
      narration: data.narration ?? 'Expense',
      createdByUserId: data.createdByUserId,
      lines: [{ accountId: expenseAccId, debit: data.amount }, { accountId: payAcc.id, credit: data.amount }],
    });
  },

  async recordIncome(institutionId: string, data: { amount: number; incomeAccountId?: string; receivedIn?: 'CASH' | 'BANK'; narration?: string; date?: string; createdByUserId?: string }) {
    await this.ensureSystemAccounts(institutionId);
    const incomeAccId = data.incomeAccountId ?? (await this.getAccountByCode(institutionId, 'MISC_INCOME'))!.id;
    const recvAcc = (await this.getAccountByCode(institutionId, data.receivedIn ?? 'CASH'))!;
    return this.postEntry(institutionId, {
      type: 'receipt',
      entryDate: data.date,
      narration: data.narration ?? 'Income',
      createdByUserId: data.createdByUserId,
      lines: [{ accountId: recvAcc.id, debit: data.amount }, { accountId: incomeAccId, credit: data.amount }],
    });
  },

  /** Post a fee collection into the books (Dr Cash, Cr Fee Income). Called from payments. */
  async recordFeeCollection(institutionId: string, data: { amount: number; invoiceId: string; date?: string }) {
    await this.ensureSystemAccounts(institutionId);
    const cash = (await this.getAccountByCode(institutionId, 'CASH'))!;
    const feeIncome = (await this.getAccountByCode(institutionId, 'FEE_INCOME'))!;
    const entry = await this.postEntry(institutionId, {
      type: 'receipt',
      entryDate: data.date,
      narration: `Fee collection (invoice ${data.invoiceId})`,
      referenceType: 'fee_invoice',
      referenceId: data.invoiceId,
      lines: [{ accountId: cash.id, debit: data.amount }, { accountId: feeIncome.id, credit: data.amount }],
    });
    logger.info('[finance] fee collection posted', { institutionId, invoiceId: data.invoiceId, amount: data.amount });
    return entry;
  },

  async listEntries(institutionId: string, limit = 100) {
    const db = getTenantPrisma(institutionId);
    return db.journalEntry.findMany({ orderBy: { entryDate: 'desc' }, take: Math.min(limit, 500), include: { lines: true } });
  },

  async trialBalance(institutionId: string) {
    const db = getTenantPrisma(institutionId);
    const accounts = await db.ledgerAccount.findMany({ orderBy: { code: 'asc' } });
    const grouped = await db.journalLine.groupBy({ by: ['accountId'], _sum: { debit: true, credit: true } });
    const sums = new Map(grouped.map((g) => [g.accountId, { debit: n(g._sum.debit), credit: n(g._sum.credit) }]));
    let totalDebit = 0;
    let totalCredit = 0;
    const rows = accounts.map((a) => {
      const s = sums.get(a.id) ?? { debit: 0, credit: 0 };
      const net = round2(s.debit - s.credit);
      const debit = net > 0 ? net : 0;
      const credit = net < 0 ? -net : 0;
      totalDebit += debit;
      totalCredit += credit;
      return { accountId: a.id, code: a.code, name: a.name, type: a.type, debit, credit };
    });
    return { rows, totalDebit: round2(totalDebit), totalCredit: round2(totalCredit), balanced: round2(totalDebit) === round2(totalCredit) };
  },

  async profitAndLoss(institutionId: string) {
    const db = getTenantPrisma(institutionId);
    const accounts = await db.ledgerAccount.findMany({ where: { type: { in: ['income', 'expense'] } } });
    const grouped = await db.journalLine.groupBy({ by: ['accountId'], _sum: { debit: true, credit: true } });
    const sums = new Map(grouped.map((g) => [g.accountId, { debit: n(g._sum.debit), credit: n(g._sum.credit) }]));
    let totalIncome = 0;
    let totalExpense = 0;
    const income: Array<{ code: string; name: string; amount: number }> = [];
    const expense: Array<{ code: string; name: string; amount: number }> = [];
    for (const a of accounts) {
      const s = sums.get(a.id) ?? { debit: 0, credit: 0 };
      if (a.type === 'income') {
        const v = round2(s.credit - s.debit);
        totalIncome += v;
        income.push({ code: a.code, name: a.name, amount: v });
      } else {
        const v = round2(s.debit - s.credit);
        totalExpense += v;
        expense.push({ code: a.code, name: a.name, amount: v });
      }
    }
    return { totalIncome: round2(totalIncome), totalExpense: round2(totalExpense), netProfit: round2(totalIncome - totalExpense), income, expense };
  },
};
