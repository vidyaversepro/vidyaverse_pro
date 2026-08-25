import { useState } from 'react';
import { UserPlus, Wallet, IndianRupee, CheckCircle2, XCircle, Users, ReceiptText, CalendarOff } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { NeutralPill, StatusPill, TONE } from '@/components/shared/Pill';
import {
  useStaff,
  usePayslips,
  useLeaves,
  useCreateStaff,
  useSetSalaryStructure,
  useRunPayroll,
  useReviewLeave,
  type StaffMember,
} from '@/lib/queries/hr/hr-queries';

const inr = (v: string | number) => '₹' + Number(v).toLocaleString('en-IN', { maximumFractionDigits: 2 });
const now = new Date();

export default function HRPage() {
  const [staffForm, setStaffForm] = useState({ firstName: '', lastName: '', designation: '', department: '' });
  const [salaryFor, setSalaryFor] = useState<StaffMember | null>(null);
  const [salary, setSalary] = useState({ basic: '', hra: '', conveyance: '', special: '', professionalTax: '' });
  const [payrollMonth, setPayrollMonth] = useState(String(now.getMonth() + 1));
  const [payrollYear, setPayrollYear] = useState(String(now.getFullYear()));

  const { data: staff, isLoading } = useStaff();
  const { data: payslips } = usePayslips({ month: payrollMonth, year: payrollYear });
  const { data: leaves } = useLeaves({ status: 'pending' });
  const createStaff = useCreateStaff();
  const setStructure = useSetSalaryStructure();
  const runPayroll = useRunPayroll();
  const reviewLeave = useReviewLeave();

  const addStaff = () => {
    if (!staffForm.firstName) return toast.error('First name is required');
    createStaff.mutate(staffForm, {
      onSuccess: () => { toast.success('Staff added'); setStaffForm({ firstName: '', lastName: '', designation: '', department: '' }); },
      onError: () => toast.error('Failed to add staff'),
    });
  };

  const saveSalary = () => {
    if (!salaryFor || !salary.basic) return toast.error('Basic salary is required');
    setStructure.mutate(
      {
        staffId: salaryFor.id,
        basic: Number(salary.basic),
        hra: Number(salary.hra) || 0,
        conveyance: Number(salary.conveyance) || 0,
        special: Number(salary.special) || 0,
        professionalTax: Number(salary.professionalTax) || 0,
        pfEnabled: true,
      },
      {
        onSuccess: () => { toast.success('Salary structure saved'); setSalaryFor(null); setSalary({ basic: '', hra: '', conveyance: '', special: '', professionalTax: '' }); },
        onError: () => toast.error('Failed to save salary'),
      },
    );
  };

  const doRunPayroll = () => {
    runPayroll.mutate(
      { month: Number(payrollMonth), year: Number(payrollYear) },
      {
        onSuccess: (res) => toast.success('Payroll run — ' + (res?.data?.data?.generated ?? 0) + ' payslips generated'),
        onError: () => toast.error('Payroll run failed'),
      },
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <PageHeader
        breadcrumb={[{ label: 'Dashboard', href: '/app/dashboard' }, { label: 'HR & Payroll' }]}
        title="HR & Payroll"
        description="Staff, salary structures, monthly payroll & leave"
        action={
          <div className="flex flex-wrap gap-2">
            <Dialog>
              <DialogTrigger asChild><Button variant="outline" className="flex-1 sm:flex-none"><Wallet className="w-4 h-4 mr-2" /> Run Payroll</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Run Monthly Payroll</DialogTitle></DialogHeader>
                <div className="flex gap-3">
                  <Input type="number" placeholder="Month" value={payrollMonth} onChange={(e) => setPayrollMonth(e.target.value)} />
                  <Input type="number" placeholder="Year" value={payrollYear} onChange={(e) => setPayrollYear(e.target.value)} />
                </div>
                <DialogFooter><Button onClick={doRunPayroll} disabled={runPayroll.isPending}>Generate Payslips</Button></DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild><Button className="flex-1 sm:flex-none"><UserPlus className="w-4 h-4 mr-2" /> Add Staff</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Staff Member</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="First name *" value={staffForm.firstName} onChange={(e) => setStaffForm({ ...staffForm, firstName: e.target.value })} />
                  <Input placeholder="Last name" value={staffForm.lastName} onChange={(e) => setStaffForm({ ...staffForm, lastName: e.target.value })} />
                  <Input placeholder="Designation" value={staffForm.designation} onChange={(e) => setStaffForm({ ...staffForm, designation: e.target.value })} />
                  <Input placeholder="Department" value={staffForm.department} onChange={(e) => setStaffForm({ ...staffForm, department: e.target.value })} />
                  <Button className="w-full" onClick={addStaff} disabled={createStaff.isPending}>Add Staff</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard title="Staff" value={staff?.length ?? 0} icon={Users} tone="teal" />
        <StatCard title={'Payslips ' + payrollMonth + '/' + payrollYear} value={payslips?.length ?? 0} icon={ReceiptText} tone="gold" />
        <StatCard title="Pending Leave" value={leaves?.length ?? 0} icon={CalendarOff} tone="saffron" className="col-span-2 lg:col-span-1" />
      </div>

      {/* Staff — desktop table */}
      <div className="hidden lg:block rounded-2xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Salary</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
            ) : !staff || staff.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No staff yet.</TableCell></TableRow>
            ) : (
              staff.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.firstName} {s.lastName}</TableCell>
                  <TableCell className="text-sm">{s.employeeCode}</TableCell>
                  <TableCell className="text-sm">{s.designation || '—'}</TableCell>
                  <TableCell className="text-sm">{s.department || '—'}</TableCell>
                  <TableCell><StatusPill status={s.status} /></TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => setSalaryFor(s)}><IndianRupee className="w-4 h-4 mr-1" /> Set</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Staff — mobile / tablet card list */}
      <div className="lg:hidden flex flex-col gap-2.5">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : !staff || staff.length === 0 ? (
          <p className="text-sm text-muted-foreground">No staff yet.</p>
        ) : (
          staff.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-3.5">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[14.5px] truncate">{s.firstName} {s.lastName}</span>
                  <StatusPill status={s.status} />
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 truncate">
                  {s.employeeCode} · {s.designation || '—'} · {s.department || '—'}
                </div>
              </div>
              <Button size="sm" variant="outline" className="rounded-full shrink-0" onClick={() => setSalaryFor(s)}><IndianRupee className="w-4 h-4 mr-1" /> Set</Button>
            </div>
          ))
        )}
      </div>

      {/* Set salary dialog */}
      <Dialog open={!!salaryFor} onOpenChange={(o) => !o && setSalaryFor(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Salary Structure — {salaryFor?.firstName}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input type="number" placeholder="Basic *" value={salary.basic} onChange={(e) => setSalary({ ...salary, basic: e.target.value })} />
            <Input type="number" placeholder="HRA" value={salary.hra} onChange={(e) => setSalary({ ...salary, hra: e.target.value })} />
            <Input type="number" placeholder="Conveyance" value={salary.conveyance} onChange={(e) => setSalary({ ...salary, conveyance: e.target.value })} />
            <Input type="number" placeholder="Special" value={salary.special} onChange={(e) => setSalary({ ...salary, special: e.target.value })} />
            <Input type="number" placeholder="Professional Tax" value={salary.professionalTax} onChange={(e) => setSalary({ ...salary, professionalTax: e.target.value })} />
          </div>
          <p className="text-xs text-muted-foreground">PF (12% of basic, capped ₹15,000) is auto-deducted.</p>
          <DialogFooter><Button onClick={saveSalary} disabled={setStructure.isPending}>Save Structure</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payslips + leaves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="rounded-2xl">
          <CardContent className="p-4 sm:p-5">
            <h2 className="text-lg font-semibold mb-4">Payslips — {payrollMonth}/{payrollYear}</h2>
            {!payslips || payslips.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payslips. Run payroll for this month.</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {payslips.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-3 rounded-xl border bg-card p-3">
                    <span className="text-sm min-w-0 truncate">Net {inr(p.netPay)} <span className="text-muted-foreground">(gross {inr(p.grossEarnings)})</span></span>
                    <StatusPill status={p.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-4 sm:p-5">
            <h2 className="text-lg font-semibold mb-4">Pending Leave Requests</h2>
            {!leaves || leaves.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending leave requests.</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {leaves.map((l) => (
                  <div key={l.id} className="flex items-center justify-between gap-2 rounded-xl border bg-card p-3">
                    <div className="text-sm min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="capitalize truncate">{l.type}</span>
                        <NeutralPill label={l.days + 'd'} />
                      </div>
                      <span className="text-xs text-muted-foreground">{new Date(l.fromDate).toLocaleDateString('en-IN')}</span>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="sm" variant="ghost" aria-label="Approve leave" onClick={() => reviewLeave.mutate({ id: l.id, decision: 'approved' }, { onSuccess: () => toast.success('Approved') })}><CheckCircle2 className="w-4 h-4" style={{ color: TONE.green }} /></Button>
                      <Button size="sm" variant="ghost" aria-label="Reject leave" onClick={() => reviewLeave.mutate({ id: l.id, decision: 'rejected' }, { onSuccess: () => toast.success('Rejected') })}><XCircle className="w-4 h-4" style={{ color: TONE.red }} /></Button>
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
