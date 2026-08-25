import { useState } from 'react';
import { Video, Plus, ExternalLink, Radio, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { SectionPicker } from '@/components/shared/SectionPicker';
import { NeutralPill, StatusPill } from '@/components/shared/Pill';
import {
  useLiveClasses,
  useScheduleLiveClass,
  useSetLiveClassStatus,
} from '@/lib/queries/live-classes/live-classes-queries';

export default function LiveClassesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ sectionId: '', subjectName: '', title: '', platform: 'meet', joinUrl: '', scheduledAt: '', durationMins: '45' });

  const { data: classes, isLoading } = useLiveClasses(false);
  const schedule = useScheduleLiveClass();
  const setStatus = useSetLiveClassStatus();

  const submit = () => {
    if (!form.sectionId || !form.subjectName || !form.title || !form.scheduledAt) return toast.error('Section, subject, title and time required');
    schedule.mutate(
      { ...form, durationMins: Number(form.durationMins) || 45 },
      { onSuccess: () => { toast.success('Class scheduled'); setDialogOpen(false); setForm({ sectionId: '', subjectName: '', title: '', platform: 'meet', joinUrl: '', scheduledAt: '', durationMins: '45' }); } },
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <PageHeader
        breadcrumb={[{ label: 'Learning' }, { label: 'Live Online Classes' }]}
        title="Live Online Classes"
        description="Schedule virtual classes, share join links and recordings"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button className="w-full sm:w-auto"><Plus className="mr-2 h-4 w-4" /> Schedule Class</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Schedule Live Class</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><label className="text-xs text-muted-foreground">Section</label><SectionPicker value={form.sectionId} onChange={(id) => setForm({ ...form, sectionId: id })} /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input placeholder="Subject" value={form.subjectName} onChange={(e) => setForm({ ...form, subjectName: e.target.value })} />
                  <select className="rounded-md border bg-background px-3 py-2 text-sm" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>
                    <option value="meet">Google Meet</option><option value="zoom">Zoom</option><option value="jitsi">Jitsi</option><option value="other">Other</option>
                  </select>
                </div>
                <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <Input placeholder="Join URL" value={form.joinUrl} onChange={(e) => setForm({ ...form, joinUrl: e.target.value })} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} />
                  <Input placeholder="Duration (min)" type="number" value={form.durationMins} onChange={(e) => setForm({ ...form, durationMins: e.target.value })} />
                </div>
                <Button className="w-full" onClick={submit}>Schedule</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <Card className="rounded-2xl">
        <CardContent className="p-4 sm:p-5">
          <h3 className="mb-3 flex items-center gap-2 font-semibold"><Video className="h-4 w-4" /> Classes</h3>
          {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : !classes?.length ? <p className="text-sm text-muted-foreground">No classes scheduled.</p> : (
            <div className="flex flex-col gap-2.5">
              {classes.map((c) => (
                <div key={c.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border bg-card p-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{c.title}</p>
                      <NeutralPill label={c.platform} />
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{c.subjectName} · {new Date(c.scheduledAt).toLocaleString('en-IN')} · {c.durationMins} min</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <StatusPill status={c.status} />
                    {c.joinUrl && c.status !== 'ended' && (
                      <Button size="sm" variant="outline" className="rounded-full" onClick={() => window.open(c.joinUrl!, '_blank')}><ExternalLink className="mr-1 h-3.5 w-3.5" /> Join</Button>
                    )}
                    {c.status === 'scheduled' && <Button size="sm" variant="ghost" aria-label="Go live" onClick={() => setStatus.mutate({ id: c.id, status: 'live' }, { onSuccess: () => toast.success('Now live') })}><Radio className="h-3.5 w-3.5" /></Button>}
                    {c.status === 'live' && <Button size="sm" variant="ghost" aria-label="End class" onClick={() => setStatus.mutate({ id: c.id, status: 'ended' }, { onSuccess: () => toast.success('Ended') })}><CheckCircle2 className="h-3.5 w-3.5" /></Button>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
