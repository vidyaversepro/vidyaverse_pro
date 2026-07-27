import { useState } from 'react';
import { UserPlus, Wallet, IndianRupee, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/shared/PageHeader';
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

const inr = (v: string | number) => `₹${Number(v).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
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
        onSuccess: (res) => toast.success(`Payroll run — ${res?.data?.data?.generated ?? 0} payslips generated`),
        onError: () => toast.error('Payroll run failed'),
      },
    );
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        breadcrumb={[{ label: 'Dashboard', href: '/app/dashboard' }, { label: 'HR & Payroll' }]}
        title="HR & Payroll"
        description="Staff, salary structures, monthly payroll & leave"
        action={
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild><Button variant="outline"><Wallet className="w-4 h-4 mr-2" /> Run Payroll</Button></DialogTrigger>
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
              <DialogTrigger asChild><Button><UserPlus className="w-4 h-4 mr-2" /> Add Staff</Button></DialogTrigger>
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

      {/* Staff table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
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
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-400">Loading…</TableCell></TableRow>
              ) : !staff || staff.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">No staff yet.</TableCell></TableRow>
              ) : (
                staff.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.firstName} {s.lastName}</TableCell>
                    <TableCell className="text-sm">{s.employeeCode}</TableCell>
                    <TableCell className="text-sm">{s.designation || '—'}</TableCell>
                    <TableCell className="text-sm">{s.department || '—'}</TableCell>
                    <TableCell><Badge variant="outline" className="capitalize text-xs">{s.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => setSalaryFor(s)}><IndianRupee className="w-4 h-4 mr-1" /> Set</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Set salary dialog */}
      <Dialog open={!!salaryFor} onOpenChange={(o) => !o && setSalaryFor(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Salary Structure — {salaryFor?.firstName}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <Input type="number" placeholder="Basic *" value={salary.basic} onChange={(e) => setSalary({ ...salary, basic: e.target.value })} />
            <Input type="number" placeholder="HRA" value={salary.hra} onChange={(e) => setSalary({ ...salary, hra: e.target.value })} />
            <Input type="number" placeholder="Conveyance" value={salary.conveyance} onChange={(e) => setSalary({ ...salary, conveyance: e.target.value })} />
            <Input type="number" placeholder="Special" value={salary.special} onChange={(e) => setSalary({ ...salary, special: e.target.value })} />
            <Input type="number" placeholder="Professional Tax" value={salary.professionalTax} onChange={(e) => setSalary({ ...salary, professionalTax: e.target.value })} />
          </div>
          <p className="text-xs text-gray-400">PF (12% of basic, capped ₹15,000) is auto-deducted.</p>
          <DialogFooter><Button onClick={saveSalary} disabled={setStructure.isPending}>Save Structure</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payslips + leaves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <h2 className="text-lg font-semibold mb-4">Payslips — {payrollMonth}/{payrollYear}</h2>
            {!payslips || payslips.length === 0 ? (
              <p className="text-sm text-gray-500">No payslips. Run payroll for this month.</p>
            ) : (
              <div className="space-y-2">
                {payslips.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">Net {inr(p.netPay)} <span className="text-gray-400">(gross {inr(p.grossEarnings)})</span></span>
                    <Badge variant="outline" className="text-xs capitalize">{p.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <h2 className="text-lg font-semibold mb-4">Pending Leave Requests</h2>
            {!leaves || leaves.length === 0 ? (
              <p className="text-sm text-gray-500">No pending leave requests.</p>
            ) : (
              <div className="space-y-2">
                {leaves.map((l) => (
                  <div key={l.id} className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 dark:border-gray-800 p-2">
                    <div className="text-sm min-w-0">
                      <span className="capitalize">{l.type}</span> · {l.days}d
                      <span className="text-gray-400"> · {new Date(l.fromDate).toLocaleDateString('en-IN')}</span>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="sm" variant="ghost" onClick={() => reviewLeave.mutate({ id: l.id, decision: 'approved' }, { onSuccess: () => toast.success('Approved') })}><CheckCircle2 className="w-4 h-4 text-emerald-600" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => reviewLeave.mutate({ id: l.id, decision: 'rejected' }, { onSuccess: () => toast.success('Rejected') })}><XCircle className="w-4 h-4 text-red-600" /></Button>
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
