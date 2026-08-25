import { useState } from 'react';
import { Plus, Syringe, Stethoscope, BellRing } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { StudentPicker } from '@/components/shared/StudentPicker';
import { StatCard } from '@/components/shared/StatCard';
import { Pill, TONE } from '@/components/shared/Pill';
import {
  useClinicVisits,
  useVaccinations,
  useDueVaccinations,
  useRecordVisit,
  useAddVaccination,
} from '@/lib/queries/health/health-queries';

export default function HealthPage() {
  const [visitOpen, setVisitOpen] = useState(false);
  const [vaxOpen, setVaxOpen] = useState(false);
  const [visit, setVisit] = useState({ studentId: '', symptoms: '', treatment: '', attendedBy: '', notifyGuardian: false });
  const [vax, setVax] = useState({ studentId: '', vaccineName: '', dateAdministered: '', nextDue: '' });

  const { data: visits, isLoading } = useClinicVisits();
  const { data: vaccinations } = useVaccinations();
  const { data: due } = useDueVaccinations(30);
  const recordVisit = useRecordVisit();
  const addVax = useAddVaccination();

  const submitVisit = () => {
    if (!visit.studentId) return toast.error('Student ID required');
    recordVisit.mutate(visit, {
      onSuccess: () => { toast.success('Visit recorded'); setVisitOpen(false); setVisit({ studentId: '', symptoms: '', treatment: '', attendedBy: '', notifyGuardian: false }); },
      onError: () => toast.error('Failed to record visit'),
    });
  };
  const submitVax = () => {
    if (!vax.studentId || !vax.vaccineName) return toast.error('Student ID and vaccine name required');
    addVax.mutate(vax, { onSuccess: () => { toast.success('Vaccination added'); setVaxOpen(false); setVax({ studentId: '', vaccineName: '', dateAdministered: '', nextDue: '' }); } });
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <PageHeader
        breadcrumb={[{ label: 'Operations' }, { label: 'Infirmary / Health' }]}
        title="Infirmary / Health"
        description="Clinic visits, vaccinations and student health records"
        action={
          <div className="flex flex-wrap gap-2">
            <Dialog open={vaxOpen} onOpenChange={setVaxOpen}>
              <DialogTrigger asChild><Button variant="outline" className="flex-1 sm:flex-none"><Syringe className="mr-2 h-4 w-4" /> Vaccination</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Record Vaccination</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><label className="text-xs text-muted-foreground">Student</label><StudentPicker value={vax.studentId} onChange={(id) => setVax({ ...vax, studentId: id })} /></div>
                  <Input placeholder="Vaccine name" value={vax.vaccineName} onChange={(e) => setVax({ ...vax, vaccineName: e.target.value })} />
                  <label className="text-xs text-muted-foreground">Date administered</label>
                  <Input type="date" value={vax.dateAdministered} onChange={(e) => setVax({ ...vax, dateAdministered: e.target.value })} />
                  <label className="text-xs text-muted-foreground">Next due</label>
                  <Input type="date" value={vax.nextDue} onChange={(e) => setVax({ ...vax, nextDue: e.target.value })} />
                  <Button className="w-full" onClick={submitVax}>Save</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={visitOpen} onOpenChange={setVisitOpen}>
              <DialogTrigger asChild><Button className="flex-1 sm:flex-none"><Plus className="mr-2 h-4 w-4" /> Clinic Visit</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>New Clinic Visit</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><label className="text-xs text-muted-foreground">Student</label><StudentPicker value={visit.studentId} onChange={(id) => setVisit({ ...visit, studentId: id })} /></div>
                  <Input placeholder="Symptoms" value={visit.symptoms} onChange={(e) => setVisit({ ...visit, symptoms: e.target.value })} />
                  <Input placeholder="Treatment given" value={visit.treatment} onChange={(e) => setVisit({ ...visit, treatment: e.target.value })} />
                  <Input placeholder="Attended by" value={visit.attendedBy} onChange={(e) => setVisit({ ...visit, attendedBy: e.target.value })} />
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={visit.notifyGuardian} onChange={(e) => setVisit({ ...visit, notifyGuardian: e.target.checked })} />
                    Notify guardian on WhatsApp
                  </label>
                  <Button className="w-full" onClick={submitVisit}>Record Visit</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard title="Clinic Visits" value={visits?.length ?? 0} icon={Stethoscope} tone="teal" />
        <StatCard title="Vaccinations" value={vaccinations?.length ?? 0} icon={Syringe} tone="gold" />
        <StatCard title="Due in 30 days" value={due?.length ?? 0} icon={BellRing} tone="saffron" className="col-span-2 lg:col-span-1" />
      </div>

      {due && due.length > 0 && (
        <Card className="rounded-2xl" style={{ borderColor: `${TONE.temple}55`, background: `${TONE.temple}14` }}>
          <CardContent className="flex items-center gap-3 p-4">
            <BellRing className="h-5 w-5 shrink-0" style={{ color: TONE.temple }} />
            <p className="text-sm"><span className="font-semibold">{due.length}</span> vaccination(s) due within 30 days.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl">
          <CardContent className="p-4 sm:p-5">
            <h3 className="mb-3 flex items-center gap-2 font-semibold"><Stethoscope className="h-4 w-4" /> Recent Clinic Visits</h3>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : !visits?.length ? (
              <p className="text-sm text-muted-foreground">No clinic visits recorded.</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {visits.slice(0, 12).map((v) => (
                  <div key={v.id} className="rounded-xl border bg-card p-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-medium min-w-0 truncate">{v.symptoms || 'Visit'}</p>
                      {v.guardianNotified && <Pill label="notified" tone={TONE.green} />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{new Date(v.visitDate).toLocaleString('en-IN')} · {v.treatment || '—'} · {v.attendedBy || '—'}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-4 sm:p-5">
            <h3 className="mb-3 flex items-center gap-2 font-semibold"><Syringe className="h-4 w-4" /> Vaccinations</h3>
            {!vaccinations?.length ? (
              <p className="text-sm text-muted-foreground">No vaccination records.</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {vaccinations.slice(0, 12).map((vx) => (
                  <div key={vx.id} className="rounded-xl border bg-card p-3">
                    <p className="font-medium truncate">{vx.vaccineName}</p>
                    <p className="text-xs text-muted-foreground">
                      {vx.dateAdministered ? 'Given ' + new Date(vx.dateAdministered).toLocaleDateString('en-IN') : 'Date —'}
                      {vx.nextDue ? ' · Next due ' + new Date(vx.nextDue).toLocaleDateString('en-IN') : ''}
                    </p>
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
