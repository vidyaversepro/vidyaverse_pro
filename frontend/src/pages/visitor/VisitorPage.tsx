import { useState } from 'react';
import { UserCheck, Plus, LogOut, Ticket, DoorClosed } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { StudentPicker } from '@/components/shared/StudentPicker';
import {
  useVisitorLogs,
  useVisitorsInside,
  useGatePasses,
  useCheckInVisitor,
  useCheckOutVisitor,
  useIssueGatePass,
} from '@/lib/queries/visitor/visitor-queries';

export default function VisitorPage() {
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [passOpen, setPassOpen] = useState(false);
  const [form, setForm] = useState({ visitorName: '', phone: '', purpose: '', whomToMeet: '' });
  const [pass, setPass] = useState({ studentId: '', type: 'early_leave', reason: '' });

  const { data: logs, isLoading } = useVisitorLogs();
  const { data: inside } = useVisitorsInside();
  const { data: passes } = useGatePasses();
  const checkIn = useCheckInVisitor();
  const checkOut = useCheckOutVisitor();
  const issuePass = useIssueGatePass();

  const submitCheckIn = () => {
    if (!form.visitorName) return toast.error('Visitor name required');
    checkIn.mutate(form, {
      onSuccess: () => { toast.success('Visitor checked in'); setCheckInOpen(false); setForm({ visitorName: '', phone: '', purpose: '', whomToMeet: '' }); },
      onError: () => toast.error('Failed to check in'),
    });
  };
  const submitPass = () => {
    if (!pass.studentId) return toast.error('Student ID required');
    issuePass.mutate(pass, { onSuccess: () => { toast.success('Gate pass issued'); setPassOpen(false); setPass({ studentId: '', type: 'early_leave', reason: '' }); } });
  };

  return (
    <div className="p-6">
      <PageHeader
        breadcrumb={[{ label: 'Operations' }, { label: 'Visitor / Gate Pass' }]}
        title="Visitor / Gate Pass"
        description="Visitor logs, gate passes and currently-inside register"
        action={
          <div className="flex gap-2">
            <Dialog open={passOpen} onOpenChange={setPassOpen}>
              <DialogTrigger asChild><Button variant="outline"><Ticket className="mr-2 h-4 w-4" /> Gate Pass</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Issue Gate Pass</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><label className="text-xs text-muted-foreground">Student</label><StudentPicker value={pass.studentId} onChange={(id) => setPass({ ...pass, studentId: id })} /></div>
                  <select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={pass.type} onChange={(e) => setPass({ ...pass, type: e.target.value })}>
                    <option value="early_leave">Early Leave</option>
                    <option value="late_entry">Late Entry</option>
                    <option value="day_out">Day Out</option>
                  </select>
                  <Input placeholder="Reason" value={pass.reason} onChange={(e) => setPass({ ...pass, reason: e.target.value })} />
                  <Button className="w-full" onClick={submitPass}>Issue Pass</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={checkInOpen} onOpenChange={setCheckInOpen}>
              <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Check In</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Visitor Check-In</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Visitor name" value={form.visitorName} onChange={(e) => setForm({ ...form, visitorName: e.target.value })} />
                  <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  <Input placeholder="Purpose" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} />
                  <Input placeholder="Whom to meet" value={form.whomToMeet} onChange={(e) => setForm({ ...form, whomToMeet: e.target.value })} />
                  <Button className="w-full" onClick={submitCheckIn}>Check In</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-3 flex items-center gap-2 font-semibold"><UserCheck className="h-4 w-4" /> Currently Inside ({inside?.length ?? 0})</h3>
            {!inside?.length ? (
              <p className="text-sm text-muted-foreground">No visitors currently inside.</p>
            ) : (
              <div className="space-y-2">
                {inside.map((v) => (
                  <div key={v.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{v.visitorName} <Badge variant="outline" className="ml-1">{v.badgeNumber}</Badge></p>
                      <p className="text-xs text-muted-foreground">{v.purpose || '—'} · meeting {v.whomToMeet || '—'} · in at {new Date(v.checkInAt).toLocaleTimeString('en-IN')}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => checkOut.mutate(v.id, { onSuccess: () => toast.success('Checked out') })}>
                      <LogOut className="mr-1 h-3.5 w-3.5" /> Out
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="mb-3 flex items-center gap-2 font-semibold"><DoorClosed className="h-4 w-4" /> Recent Gate Passes</h3>
            {!passes?.length ? (
              <p className="text-sm text-muted-foreground">No gate passes issued.</p>
            ) : (
              <div className="space-y-2">
                {passes.slice(0, 10).map((p) => (
                  <div key={p.id} className="rounded-lg border p-3">
                    <p className="font-medium">{p.type.replace('_', ' ')}</p>
                    <p className="text-xs text-muted-foreground">{p.reason || '—'} · {new Date(p.issuedAt).toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardContent className="p-4">
          <h3 className="mb-3 font-semibold">Visitor Log</h3>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : !logs?.length ? (
            <p className="text-sm text-muted-foreground">No visitor records.</p>
          ) : (
            <div className="space-y-2">
              {logs.slice(0, 15).map((v) => (
                <div key={v.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{v.visitorName}</p>
                    <p className="text-xs text-muted-foreground">{new Date(v.checkInAt).toLocaleString('en-IN')}{v.checkOutAt ? ` → ${new Date(v.checkOutAt).toLocaleTimeString('en-IN')}` : ''}</p>
                  </div>
                  <Badge variant={v.status === 'checked_in' ? 'default' : 'secondary'}>{v.status.replace('_', ' ')}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
