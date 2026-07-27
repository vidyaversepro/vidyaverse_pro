import { useState } from 'react';
import { Plus, Syringe, Stethoscope, BellRing } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { StudentPicker } from '@/components/shared/StudentPicker';
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
    <div className="p-6">
      <PageHeader
        breadcrumb={[{ label: 'Operations' }, { label: 'Infirmary / Health' }]}
        title="Infirmary / Health"
        description="Clinic visits, vaccinations and student health records"
        action={
          <div className="flex gap-2">
            <Dialog open={vaxOpen} onOpenChange={setVaxOpen}>
              <DialogTrigger asChild><Button variant="outline"><Syringe className="mr-2 h-4 w-4" /> Vaccination</Button></DialogTrigger>
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
              <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Clinic Visit</Button></DialogTrigger>
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

      {due && due.length > 0 && (
        <Card className="mb-6 border-amber-200 bg-amber-50/60">
          <CardContent className="flex items-center gap-3 p-4">
            <BellRing className="h-5 w-5 text-amber-600" />
            <p className="text-sm"><span className="font-semibold">{due.length}</span> vaccination(s) due within 30 days.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-3 flex items-center gap-2 font-semibold"><Stethoscope className="h-4 w-4" /> Recent Clinic Visits</h3>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : !visits?.length ? (
              <p className="text-sm text-muted-foreground">No clinic visits recorded.</p>
            ) : (
              <div className="space-y-2">
                {visits.slice(0, 12).map((v) => (
                  <div key={v.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{v.symptoms || 'Visit'}</p>
                      {v.guardianNotified && <Badge variant="secondary">notified</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{new Date(v.visitDate).toLocaleString('en-IN')} · {v.treatment || '—'} · {v.attendedBy || '—'}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="mb-3 flex items-center gap-2 font-semibold"><Syringe className="h-4 w-4" /> Vaccinations</h3>
            {!vaccinations?.length ? (
              <p className="text-sm text-muted-foreground">No vaccination records.</p>
            ) : (
              <div className="space-y-2">
                {vaccinations.slice(0, 12).map((vx) => (
                  <div key={vx.id} className="rounded-lg border p-3">
                    <p className="font-medium">{vx.vaccineName}</p>
                    <p className="text-xs text-muted-foreground">
                      {vx.dateAdministered ? `Given ${new Date(vx.dateAdministered).toLocaleDateString('en-IN')}` : 'Date —'}
                      {vx.nextDue ? ` · Next due ${new Date(vx.nextDue).toLocaleDateString('en-IN')}` : ''}
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
