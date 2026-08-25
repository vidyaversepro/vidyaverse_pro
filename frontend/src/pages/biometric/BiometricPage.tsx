import { useState } from 'react';
import { Fingerprint, Plus, Cpu, CalendarCheck } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { NeutralPill, TONE } from '@/components/shared/Pill';
import {
  useBiometricDevices,
  useStaffAttendance,
  useRegisterDevice,
  useMarkStaffAttendance,
} from '@/lib/queries/biometric/biometric-queries';
import { StaffPicker } from '@/components/shared/StaffPicker';

/** Attendance summary cell — literal semantic tone, dark-mode safe (tinted from the tone itself). */
function SummaryCell({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-xl p-2 text-center" style={{ background: `${tone}1f` }}>
      <p className="font-bold text-lg leading-tight" style={{ color: tone }}>{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

export default function BiometricPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', deviceType: 'fingerprint', location: '' });
  const [markStaffId, setMarkStaffId] = useState('');
  const [markStatus, setMarkStatus] = useState('present');

  const { data: devices } = useBiometricDevices();
  const { data: attendance } = useStaffAttendance(date);
  const registerDevice = useRegisterDevice();
  const markAtt = useMarkStaffAttendance();

  const submit = () => {
    if (!form.name) return toast.error('Device name required');
    registerDevice.mutate(form, { onSuccess: () => { toast.success('Device registered'); setDialogOpen(false); setForm({ name: '', deviceType: 'fingerprint', location: '' }); } });
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <PageHeader
        breadcrumb={[{ label: 'Academics' }, { label: 'Biometric / RFID Attendance' }]}
        title="Biometric / RFID Attendance"
        description="Device registry, punch logs and staff attendance"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button className="w-full sm:w-auto"><Plus className="mr-2 h-4 w-4" /> Register Device</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Register Biometric Device</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Device name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={form.deviceType} onChange={(e) => setForm({ ...form, deviceType: e.target.value })}>
                  <option value="fingerprint">Fingerprint</option><option value="rfid">RFID</option><option value="face">Face</option>
                </select>
                <Input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                <Button className="w-full" onClick={submit}>Register</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl">
          <CardContent className="p-4 sm:p-5">
            <h3 className="mb-3 flex items-center gap-2 font-semibold"><Cpu className="h-4 w-4" /> Devices</h3>
            {!devices?.length ? <p className="text-sm text-muted-foreground">No devices registered.</p> : (
              <div className="flex flex-col gap-2.5">
                {devices.map((d) => (
                  <div key={d.id} className="flex items-center justify-between gap-3 rounded-xl border bg-card p-3">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{d.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{d.location || '—'} · {d._count?.punches ?? 0} punches · {d.lastSeenAt ? 'seen ' + new Date(d.lastSeenAt).toLocaleString('en-IN') : 'never seen'}</p>
                    </div>
                    <NeutralPill label={d.deviceType} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-4 sm:p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 font-semibold"><CalendarCheck className="h-4 w-4" /> Staff Attendance</h3>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full sm:w-auto" />
            </div>
            {attendance && (
              <div className="mb-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <SummaryCell label="Present" value={attendance.summary.present} tone={TONE.green} />
                <SummaryCell label="Absent" value={attendance.summary.absent} tone={TONE.red} />
                <SummaryCell label="Half-day" value={attendance.summary.half_day} tone={TONE.temple} />
                <SummaryCell label="Leave" value={attendance.summary.leave} tone={TONE.indigo} />
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 min-w-0"><StaffPicker value={markStaffId} onChange={setMarkStaffId} /></div>
              <div className="flex gap-2">
                <select value={markStatus} onChange={(e) => setMarkStatus(e.target.value)} className="flex-1 sm:flex-none rounded-md border bg-background px-2 py-1 text-sm">
                  <option value="present">Present</option><option value="absent">Absent</option><option value="half_day">Half-day</option><option value="leave">Leave</option>
                </select>
                <Button size="sm" className="shrink-0" onClick={() => {
                  if (!markStaffId) return toast.error('Select a staff member');
                  markAtt.mutate({ staffId: markStaffId, attendanceDate: date, status: markStatus }, { onSuccess: () => { toast.success('Marked'); setMarkStaffId(''); } });
                }}><Fingerprint className="mr-1 h-3.5 w-3.5" /> Mark</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
