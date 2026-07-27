import { useState } from 'react';
import { TrendingUp, TrendingDown, Wallet, Plus, Minus, Landmark } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/shared/PageHeader';
import {
  useLedgerAccounts,
  useJournalEntries,
  useProfitAndLoss,
  useTrialBalance,
  useEnsureSystemAccounts,
  useRecordExpense,
  useRecordIncome,
} from '@/lib/queries/finance/finance-queries';

const inr = (v: number | string) => `₹${Number(v).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export default function FinancePage() {
  const [expense, setExpense] = useState({ amount: '', narration: '' });
  const [income, setIncome] = useState({ amount: '', narration: '' });

  const { data: accounts } = useLedgerAccounts();
  const { data: pnl } = useProfitAndLoss();
  const { data: entries } = useJournalEntries();
  const { data: tb } = useTrialBalance();
  const ensureSystem = useEnsureSystemAccounts();
  const recordExpense = useRecordExpense();
  const recordIncome = useRecordIncome();

  const submitExpense = () => {
    if (!expense.amount) return toast.error('Amount is required');
    recordExpense.mutate(
      { amount: Number(expense.amount), narration: expense.narration || undefined },
      { onSuccess: () => { toast.success('Expense recorded'); setExpense({ amount: '', narration: '' }); }, onError: () => toast.error('Failed') },
    );
  };
  const submitIncome = () => {
    if (!income.amount) return toast.error('Amount is required');
    recordIncome.mutate(
      { amount: Number(income.amount), narration: income.narration || undefined },
      { onSuccess: () => { toast.success('Income recorded'); setIncome({ amount: '', narration: '' }); }, onError: () => toast.error('Failed') },
    );
  };

  const stats = [
    { label: 'Total Income', value: pnl ? inr(pnl.totalIncome) : '—', icon: TrendingUp, color: 'text-emerald-600' },
    { label: 'Total Expense', value: pnl ? inr(pnl.totalExpense) : '—', icon: TrendingDown, color: 'text-red-600' },
    { label: 'Net Profit', value: pnl ? inr(pnl.netProfit) : '—', icon: Wallet, color: (pnl?.netProfit ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-600' },
  ];

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        breadcrumb={[{ label: 'Dashboard', href: '/app/dashboard' }, { label: 'Finance' }]}
        title="Finance & Accounting"
        description="Double-entry ledger — fee collections post here automatically"
        action={
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild><Button variant="outline"><Minus className="w-4 h-4 mr-2 text-red-600" /> Expense</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Record Expense</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input type="number" placeholder="Amount (₹) *" value={expense.amount} onChange={(e) => setExpense({ ...expense, amount: e.target.value })} />
                  <Input placeholder="Narration" value={expense.narration} onChange={(e) => setExpense({ ...expense, narration: e.target.value })} />
                </div>
                <DialogFooter><Button onClick={submitExpense} disabled={recordExpense.isPending}>Record</Button></DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> Income</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Record Income</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input type="number" placeholder="Amount (₹) *" value={income.amount} onChange={(e) => setIncome({ ...income, amount: e.target.value })} />
                  <Input placeholder="Narration" value={income.narration} onChange={(e) => setIncome({ ...income, narration: e.target.value })} />
                </div>
                <DialogFooter><Button onClick={submitIncome} disabled={recordIncome.isPending}>Record</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {!accounts || accounts.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center">
            <Landmark className="w-10 h-10 text-amber-500 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-300 mb-3">No chart of accounts yet.</p>
            <Button onClick={() => ensureSystem.mutate(undefined, { onSuccess: () => toast.success('Chart of accounts created') })} disabled={ensureSystem.isPending}>
              Set up default accounts
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* P&L */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((s) => (
              <Card key={s.label} className="border-0 shadow-lg">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{s.value}</p>
                  </div>
                  <s.icon className={`w-8 h-8 ${s.color}`} />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent entries */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <h2 className="text-lg font-semibold mb-4">Recent Journal Entries</h2>
              {!entries || entries.length === 0 ? (
                <p className="text-sm text-gray-500">No entries yet.</p>
              ) : (
                <div className="space-y-2">
                  {entries.slice(0, 10).map((e) => (
                    <div key={e.id} className="flex items-center justify-between text-sm border-b border-gray-50 dark:border-gray-800 pb-1">
                      <span className="text-gray-700 dark:text-gray-300 truncate">
                        {e.narration || e.type} {e.referenceType === 'fee_invoice' && <Badge variant="outline" className="ml-1 text-[10px]">fee</Badge>}
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">{inr(e.totalAmount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trial balance */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Trial Balance</h2>
                {tb && <Badge variant="outline" className={tb.balanced ? 'text-emerald-600' : 'text-red-600'}>{tb.balanced ? 'Balanced' : 'Unbalanced'}</Badge>}
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tb?.rows.filter((r) => r.debit || r.credit).map((r) => (
                    <TableRow key={r.accountId}>
                      <TableCell>{r.name}</TableCell>
                      <TableCell><Badge variant="outline" className="capitalize text-xs">{r.type}</Badge></TableCell>
                      <TableCell className="text-right">{r.debit ? inr(r.debit) : '—'}</TableCell>
                      <TableCell className="text-right">{r.credit ? inr(r.credit) : '—'}</TableCell>
                    </TableRow>
                  ))}
                  {tb && (
                    <TableRow className="font-semibold">
                      <TableCell colSpan={2}>Total</TableCell>
                      <TableCell className="text-right">{inr(tb.totalDebit)}</TableCell>
                      <TableCell className="text-right">{inr(tb.totalCredit)}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
