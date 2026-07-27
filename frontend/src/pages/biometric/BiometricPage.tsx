import { useState } from 'react';
import { Fingerprint, Plus, Cpu, CalendarCheck } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import {
  useBiometricDevices,
  useStaffAttendance,
  useRegisterDevice,
  useMarkStaffAttendance,
} from '@/lib/queries/biometric/biometric-queries';
import { StaffPicker } from '@/components/shared/StaffPicker';

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
    <div className="p-6">
      <PageHeader
        breadcrumb={[{ label: 'Academics' }, { label: 'Biometric / RFID Attendance' }]}
        title="Biometric / RFID Attendance"
        description="Device registry, punch logs and staff attendance"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Register Device</Button></DialogTrigger>
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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-3 flex items-center gap-2 font-semibold"><Cpu className="h-4 w-4" /> Devices</h3>
            {!devices?.length ? <p className="text-sm text-muted-foreground">No devices registered.</p> : (
              <div className="space-y-2">
                {devices.map((d) => (
                  <div key={d.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{d.name}</p>
                      <p className="text-xs text-muted-foreground">{d.location || '—'} · {d._count?.punches ?? 0} punches · {d.lastSeenAt ? `seen ${new Date(d.lastSeenAt).toLocaleString('en-IN')}` : 'never seen'}</p>
                    </div>
                    <Badge variant="secondary">{d.deviceType}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-semibold"><CalendarCheck className="h-4 w-4" /> Staff Attendance</h3>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-auto" />
            </div>
            {attendance && (
              <div className="mb-3 grid grid-cols-4 gap-2 text-center text-sm">
                <div className="rounded-lg bg-green-50 p-2"><p className="font-bold text-green-700">{attendance.summary.present}</p><p className="text-[10px] text-muted-foreground">Present</p></div>
                <div className="rounded-lg bg-red-50 p-2"><p className="font-bold text-red-700">{attendance.summary.absent}</p><p className="text-[10px] text-muted-foreground">Absent</p></div>
                <div className="rounded-lg bg-amber-50 p-2"><p className="font-bold text-amber-700">{attendance.summary.half_day}</p><p className="text-[10px] text-muted-foreground">Half-day</p></div>
                <div className="rounded-lg bg-blue-50 p-2"><p className="font-bold text-blue-700">{attendance.summary.leave}</p><p className="text-[10px] text-muted-foreground">Leave</p></div>
              </div>
            )}
            <div className="flex gap-2">
              <div className="flex-1"><StaffPicker value={markStaffId} onChange={setMarkStaffId} /></div>
              <select value={markStatus} onChange={(e) => setMarkStatus(e.target.value)} className="rounded-md border bg-background px-2 py-1 text-sm">
                <option value="present">Present</option><option value="absent">Absent</option><option value="half_day">Half-day</option><option value="leave">Leave</option>
              </select>
              <Button size="sm" onClick={() => {
                if (!markStaffId) return toast.error('Select a staff member');
                markAtt.mutate({ staffId: markStaffId, attendanceDate: date, status: markStatus }, { onSuccess: () => { toast.success('Marked'); setMarkStaffId(''); } });
              }}><Fingerprint className="mr-1 h-3.5 w-3.5" /> Mark</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
