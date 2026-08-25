import { useState } from 'react';
import { Building, Plus, Trophy, Users2, FileCheck } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { StatusPill } from '@/components/shared/Pill';
import {
  usePlacementDrives,
  usePlacementStats,
  useDriveApplications,
  useCreateDrive,
  useSetApplicationStatus,
} from '@/lib/queries/placement/placement-queries';

const APP_STATUSES = ['applied', 'shortlisted', 'selected', 'rejected'];

export default function PlacementPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewing, setViewing] = useState<string | null>(null);
  const [form, setForm] = useState({ companyName: '', role: '', packageLpa: '', driveDate: '', eligibilityCriteria: '' });

  const { data: drives, isLoading } = usePlacementDrives();
  const { data: stats } = usePlacementStats();
  const { data: applications } = useDriveApplications(viewing || undefined);
  const createDrive = useCreateDrive();
  const setStatus = useSetApplicationStatus();

  const submit = () => {
    if (!form.companyName || !form.role) return toast.error('Company and role required');
    createDrive.mutate(
      { companyName: form.companyName, role: form.role, packageLpa: form.packageLpa ? Number(form.packageLpa) : undefined, driveDate: form.driveDate || undefined, eligibilityCriteria: form.eligibilityCriteria },
      { onSuccess: () => { toast.success('Drive created'); setDialogOpen(false); setForm({ companyName: '', role: '', packageLpa: '', driveDate: '', eligibilityCriteria: '' }); } },
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <PageHeader
        breadcrumb={[{ label: 'Insights' }, { label: 'Placement / Career' }]}
        title="Placement & Career"
        description="Campus drives, applications and placement statistics"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button className="w-full sm:w-auto"><Plus className="mr-2 h-4 w-4" /> New Drive</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Placement Drive</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Company name" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
                <Input placeholder="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input placeholder="Package (LPA)" type="number" value={form.packageLpa} onChange={(e) => setForm({ ...form, packageLpa: e.target.value })} />
                  <Input type="date" value={form.driveDate} onChange={(e) => setForm({ ...form, driveDate: e.target.value })} />
                </div>
                <Input placeholder="Eligibility criteria" value={form.eligibilityCriteria} onChange={(e) => setForm({ ...form, eligibilityCriteria: e.target.value })} />
                <Button className="w-full" onClick={submit}>Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Drives" value={stats?.drives ?? 0} icon={Building} tone="teal" />
        <StatCard title="Applications" value={stats?.applications ?? 0} icon={Users2} tone="indigo" />
        <StatCard title="Selected" value={stats?.selected ?? 0} icon={FileCheck} tone="gold" />
        <StatCard title="Highest (LPA)" value={stats?.highestPackageLpa ?? 0} icon={Trophy} tone="saffron" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl">
          <CardContent className="p-4 sm:p-5">
            <h3 className="mb-3 flex items-center gap-2 font-semibold"><Building className="h-4 w-4" /> Drives</h3>
            {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : !drives?.length ? <p className="text-sm text-muted-foreground">No drives yet.</p> : (
              <div className="flex flex-col gap-2.5">
                {drives.map((d) => (
                  <div key={d.id} className="rounded-xl border bg-card p-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-medium min-w-0 truncate">{d.companyName} — {d.role}</p>
                      <StatusPill status={d.status} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{d.packageLpa ? d.packageLpa + ' LPA · ' : ''}{d._count?.applications ?? 0} applications</p>
                    <Button size="sm" variant="outline" className="mt-2 rounded-full" onClick={() => setViewing(d.id)}>View applications</Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-4 sm:p-5">
            <h3 className="mb-3 flex items-center gap-2 font-semibold"><Users2 className="h-4 w-4" /> Applications {viewing ? '' : '(select a drive)'}</h3>
            {!viewing ? <p className="text-sm text-muted-foreground">Tap “View applications” on a drive.</p> : !applications?.length ? <p className="text-sm text-muted-foreground">No applications yet.</p> : (
              <div className="flex flex-col gap-2.5">
                {applications.map((a) => (
                  <div key={a.id} className="flex items-center justify-between gap-3 rounded-xl border bg-card p-3">
                    <p className="font-medium text-sm min-w-0 truncate">{a.studentId.slice(0, 8)}…</p>
                    <select
                      className="shrink-0 rounded-md border bg-background px-2 py-1 text-xs"
                      value={a.status}
                      onChange={(e) => setStatus.mutate({ applicationId: a.id, status: e.target.value }, { onSuccess: () => toast.success('Updated') })}
                    >
                      {APP_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
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
