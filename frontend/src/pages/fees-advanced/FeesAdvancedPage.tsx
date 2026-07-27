import { useState } from 'react';
import { Plus, Percent, CalendarClock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { StudentPicker } from '@/components/shared/StudentPicker';
import {
  useConcessions,
  useInstallmentPlans,
  useDefaulters,
  useCreateConcession,
  useCreatePlan,
  usePayInstallment,
} from '@/lib/queries/fees-advanced/fees-advanced-queries';

export default function FeesAdvancedPage() {
  const [concOpen, setConcOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [conc, setConc] = useState({ studentId: '', name: '', type: 'scholarship', percent: '', amount: '', academicYear: '2026-2027' });
  const [plan, setPlan] = useState({ studentId: '', totalAmount: '', numInstallments: '3', academicYear: '2026-2027', firstDueDate: '' });

  const { data: concessions } = useConcessions();
  const { data: plans } = useInstallmentPlans();
  const { data: defaulters } = useDefaulters();
  const createConc = useCreateConcession();
  const createPlan = useCreatePlan();
  const payInst = usePayInstallment();

  const submitConc = () => {
    if (!conc.studentId || !conc.name) return toast.error('Student ID and name required');
    createConc.mutate(
      { studentId: conc.studentId, name: conc.name, type: conc.type, percent: conc.percent ? Number(conc.percent) : undefined, amount: conc.amount ? Number(conc.amount) : undefined, academicYear: conc.academicYear },
      { onSuccess: () => { toast.success('Concession added'); setConcOpen(false); setConc({ studentId: '', name: '', type: 'scholarship', percent: '', amount: '', academicYear: '2026-2027' }); } },
    );
  };
  const submitPlan = () => {
    if (!plan.studentId || !plan.totalAmount) return toast.error('Student ID and total required');
    createPlan.mutate(
      { studentId: plan.studentId, totalAmount: Number(plan.totalAmount), numInstallments: Number(plan.numInstallments), academicYear: plan.academicYear, firstDueDate: plan.firstDueDate || undefined },
      { onSuccess: () => { toast.success('Plan created'); setPlanOpen(false); setPlan({ studentId: '', totalAmount: '', numInstallments: '3', academicYear: '2026-2027', firstDueDate: '' }); } },
    );
  };

  return (
    <div className="p-6">
      <PageHeader
        breadcrumb={[{ label: 'Finance' }, { label: 'Concessions & Installments' }]}
        title="Concessions & Installments"
        description="Scholarships, installment plans and defaulter tracking"
        action={
          <div className="flex gap-2">
            <Dialog open={concOpen} onOpenChange={setConcOpen}>
              <DialogTrigger asChild><Button variant="outline"><Percent className="mr-2 h-4 w-4" /> Concession</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>New Concession</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><label className="text-xs text-muted-foreground">Student</label><StudentPicker value={conc.studentId} onChange={(id) => setConc({ ...conc, studentId: id })} /></div>
                  <Input placeholder="Name (e.g. Merit Scholarship)" value={conc.name} onChange={(e) => setConc({ ...conc, name: e.target.value })} />
                  <select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={conc.type} onChange={(e) => setConc({ ...conc, type: e.target.value })}>
                    <option value="scholarship">Scholarship</option><option value="sibling">Sibling</option><option value="staff_ward">Staff Ward</option><option value="merit">Merit</option><option value="need_based">Need-based</option>
                  </select>
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Percent %" type="number" value={conc.percent} onChange={(e) => setConc({ ...conc, percent: e.target.value })} />
                    <Input placeholder="OR Amount ₹" type="number" value={conc.amount} onChange={(e) => setConc({ ...conc, amount: e.target.value })} />
                  </div>
                  <Button className="w-full" onClick={submitConc}>Add</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={planOpen} onOpenChange={setPlanOpen}>
              <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Installment Plan</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>New Installment Plan</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><label className="text-xs text-muted-foreground">Student</label><StudentPicker value={plan.studentId} onChange={(id) => setPlan({ ...plan, studentId: id })} /></div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Total ₹" type="number" value={plan.totalAmount} onChange={(e) => setPlan({ ...plan, totalAmount: e.target.value })} />
                    <Input placeholder="# installments" type="number" value={plan.numInstallments} onChange={(e) => setPlan({ ...plan, numInstallments: e.target.value })} />
                  </div>
                  <label className="text-xs text-muted-foreground">First due date</label>
                  <Input type="date" value={plan.firstDueDate} onChange={(e) => setPlan({ ...plan, firstDueDate: e.target.value })} />
                  <Button className="w-full" onClick={submitPlan}>Create (auto-splits)</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {defaulters && defaulters.count > 0 && (
        <Card className="mb-6 border-red-200 bg-red-50/60">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <p className="text-sm"><span className="font-semibold">{defaulters.count}</span> defaulter record(s) · ₹{defaulters.overdueInstallmentAmount.toLocaleString('en-IN')} overdue in installments.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-3 flex items-center gap-2 font-semibold"><Percent className="h-4 w-4" /> Concessions</h3>
            {!concessions?.length ? <p className="text-sm text-muted-foreground">No concessions yet.</p> : (
              <div className="space-y-2">
                {concessions.map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.type} · {c.percent ? `${c.percent}%` : `₹${c.amount}`} · {c.academicYear}</p>
                    </div>
                    <Badge variant={c.status === 'active' ? 'default' : 'secondary'}>{c.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="mb-3 flex items-center gap-2 font-semibold"><CalendarClock className="h-4 w-4" /> Installment Plans</h3>
            {!plans?.length ? <p className="text-sm text-muted-foreground">No plans yet.</p> : (
              <div className="space-y-3">
                {plans.slice(0, 6).map((p) => (
                  <div key={p.id} className="rounded-lg border p-3">
                    <p className="font-medium text-sm">₹{p.totalAmount} · {p.numInstallments} installments · {p.academicYear}</p>
                    <div className="mt-2 space-y-1">
                      {p.installments.map((i) => (
                        <div key={i.id} className="flex items-center justify-between text-xs">
                          <span>#{i.installmentNo} · ₹{i.amount} · due {new Date(i.dueDate).toLocaleDateString('en-IN')}</span>
                          <div className="flex items-center gap-1.5">
                            <Badge variant={i.status === 'paid' ? 'default' : i.status === 'overdue' ? 'destructive' : 'secondary'} className="text-[10px]">{i.status}</Badge>
                            {i.status !== 'paid' && <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px]" onClick={() => payInst.mutate(i.id, { onSuccess: () => toast.success('Paid') })}>Pay</Button>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
