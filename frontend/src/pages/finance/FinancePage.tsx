import { useState } from 'react';
import { TrendingUp, TrendingDown, Wallet, Plus, Minus, Landmark } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/shared/PageHeader';
import { NeutralPill, Pill, TONE } from '@/components/shared/Pill';
import {
  useLedgerAccounts,
  useJournalEntries,
  useProfitAndLoss,
  useTrialBalance,
  useEnsureSystemAccounts,
  useRecordExpense,
  useRecordIncome,
} from '@/lib/queries/finance/finance-queries';

const inr = (v: number | string) => '₹' + Number(v).toLocaleString('en-IN', { maximumFractionDigits: 2 });

/**
 * Local stat tile rather than the shared StatCard: these values carry their own
 * semantic colour (income green / expense red / profit either way), and StatCard
 * has no coloured-value slot. Same reason AttendancePage and FeesPage keep one.
 */
function StatTile({ label, value, icon: Icon, tone }: { label: string; value: string; icon: typeof Wallet; tone: string }) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="p-4 sm:p-5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-xl sm:text-2xl font-bold mt-1 truncate" style={{ color: tone }}>{value}</p>
        </div>
        <Icon className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" style={{ color: tone }} />
      </CardContent>
    </Card>
  );
}

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

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <PageHeader
        breadcrumb={[{ label: 'Dashboard', href: '/app/dashboard' }, { label: 'Finance' }]}
        title="Finance & Accounting"
        description="Double-entry ledger — fee collections post here automatically"
        action={
          <div className="flex flex-wrap gap-2">
            <Dialog>
              <DialogTrigger asChild><Button variant="outline" className="flex-1 sm:flex-none"><Minus className="w-4 h-4 mr-2" style={{ color: TONE.red }} /> Expense</Button></DialogTrigger>
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
              <DialogTrigger asChild><Button className="flex-1 sm:flex-none"><Plus className="w-4 h-4 mr-2" /> Income</Button></DialogTrigger>
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
        <Card className="rounded-2xl">
          <CardContent className="p-8 text-center">
            <Landmark className="w-10 h-10 mx-auto mb-3" style={{ color: TONE.saffron }} />
            <p className="text-muted-foreground mb-3">No chart of accounts yet.</p>
            <Button onClick={() => ensureSystem.mutate(undefined, { onSuccess: () => toast.success('Chart of accounts created') })} disabled={ensureSystem.isPending}>
              Set up default accounts
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* P&L */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatTile label="Total Income" value={pnl ? inr(pnl.totalIncome) : '—'} icon={TrendingUp} tone={TONE.green} />
            <StatTile label="Total Expense" value={pnl ? inr(pnl.totalExpense) : '—'} icon={TrendingDown} tone={TONE.red} />
            <StatTile label="Net Profit" value={pnl ? inr(pnl.netProfit) : '—'} icon={Wallet} tone={(pnl?.netProfit ?? 0) >= 0 ? TONE.green : TONE.red} />
          </div>

          {/* Recent entries */}
          <Card className="rounded-2xl">
            <CardContent className="p-4 sm:p-5">
              <h2 className="text-lg font-semibold mb-4">Recent Journal Entries</h2>
              {!entries || entries.length === 0 ? (
                <p className="text-sm text-muted-foreground">No entries yet.</p>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {entries.slice(0, 10).map((e) => (
                    <div key={e.id} className="flex items-center justify-between gap-3 rounded-xl border bg-card p-3 text-sm">
                      <span className="min-w-0 flex items-center gap-2">
                        <span className="truncate">{e.narration || e.type}</span>
                        {e.referenceType === 'fee_invoice' && <NeutralPill label="fee" />}
                      </span>
                      <span className="font-medium shrink-0">{inr(e.totalAmount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trial balance */}
          <Card className="rounded-2xl">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <h2 className="text-lg font-semibold">Trial Balance</h2>
                {tb && <Pill label={tb.balanced ? 'Balanced' : 'Unbalanced'} tone={tb.balanced ? TONE.green : TONE.red} />}
              </div>

              {/* Desktop table */}
              <div className="hidden lg:block rounded-2xl border overflow-hidden">
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
                        <TableCell><NeutralPill label={r.type} /></TableCell>
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
              </div>

              {/* Mobile / tablet card list */}
              <div className="lg:hidden flex flex-col gap-2.5">
                {tb?.rows.filter((r) => r.debit || r.credit).map((r) => (
                  <div key={r.accountId} className="rounded-xl border bg-card p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium min-w-0 truncate">{r.name}</p>
                      <NeutralPill label={r.type} />
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Debit <span className="font-medium text-foreground">{r.debit ? inr(r.debit) : '—'}</span></span>
                      <span className="text-muted-foreground">Credit <span className="font-medium text-foreground">{r.credit ? inr(r.credit) : '—'}</span></span>
                    </div>
                  </div>
                ))}
                {tb && (
                  <div className="rounded-xl border bg-muted p-3 font-semibold">
                    <p className="text-sm">Total</p>
                    <div className="mt-1.5 flex items-center justify-between text-xs">
                      <span>Debit {inr(tb.totalDebit)}</span>
                      <span>Credit {inr(tb.totalCredit)}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
