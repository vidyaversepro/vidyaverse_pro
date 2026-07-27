import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';

const unwrap = async <T>(p: Promise<{ data: { data: T } }>): Promise<T> => (await p).data.data;

export interface LedgerAccount {
  id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'income' | 'expense' | 'equity';
  isSystem: boolean;
}

export interface JournalLine {
  id: string;
  accountId: string;
  debit: string;
  credit: string;
}

export interface JournalEntry {
  id: string;
  voucherNumber: string;
  entryDate: string;
  type: string;
  narration?: string | null;
  totalAmount: string;
  referenceType?: string | null;
  lines: JournalLine[];
}

export interface ProfitAndLoss {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  income: Array<{ code: string; name: string; amount: number }>;
  expense: Array<{ code: string; name: string; amount: number }>;
}

export interface TrialBalance {
  rows: Array<{ accountId: string; code: string; name: string; type: string; debit: number; credit: number }>;
  totalDebit: number;
  totalCredit: number;
  balanced: boolean;
}

export const useLedgerAccounts = (type?: string) =>
  useQuery({ queryKey: ['ledger-accounts', type], queryFn: () => unwrap<LedgerAccount[]>(api.get('/finance/accounts', { params: type ? { type } : {} })) });

export const useJournalEntries = () =>
  useQuery({ queryKey: ['journal-entries'], queryFn: () => unwrap<JournalEntry[]>(api.get('/finance/entries')) });

export const useProfitAndLoss = () =>
  useQuery({ queryKey: ['finance-pnl'], queryFn: () => unwrap<ProfitAndLoss>(api.get('/finance/pnl')) });

export const useTrialBalance = () =>
  useQuery({ queryKey: ['finance-trial-balance'], queryFn: () => unwrap<TrialBalance>(api.get('/finance/trial-balance')) });

function useFinanceMutation<T>(fn: (body: T) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['journal-entries'] });
      qc.invalidateQueries({ queryKey: ['finance-pnl'] });
      qc.invalidateQueries({ queryKey: ['finance-trial-balance'] });
      qc.invalidateQueries({ queryKey: ['ledger-accounts'] });
    },
  });
}

export const useEnsureSystemAccounts = () => useFinanceMutation(() => api.post('/finance/accounts/ensure-system', {}));
export const useRecordExpense = () => useFinanceMutation((body: { amount: number; narration?: string }) => api.post('/finance/expense', body));
export const useRecordIncome = () => useFinanceMutation((body: { amount: number; narration?: string }) => api.post('/finance/income', body));
