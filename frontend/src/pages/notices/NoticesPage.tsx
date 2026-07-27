import { useState } from 'react';
import { Megaphone, Plus, Pin, CalendarDays, Archive } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import {
  useNotices,
  useUpcomingEvents,
  useCreateNotice,
  useArchiveNotice,
  useCreateEvent,
} from '@/lib/queries/notices/notices-queries';

export default function NoticesPage() {
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [eventOpen, setEventOpen] = useState(false);
  const [notice, setNotice] = useState({ title: '', body: '', audience: 'all', category: 'circular', isPinned: false });
  const [event, setEvent] = useState({ title: '', eventType: 'event', eventDate: '' });

  const { data: notices, isLoading } = useNotices();
  const { data: events } = useUpcomingEvents(60);
  const createNotice = useCreateNotice();
  const archive = useArchiveNotice();
  const createEvent = useCreateEvent();

  const submitNotice = () => {
    if (!notice.title || !notice.body) return toast.error('Title and body required');
    createNotice.mutate(notice, { onSuccess: () => { toast.success('Notice published'); setNoticeOpen(false); setNotice({ title: '', body: '', audience: 'all', category: 'circular', isPinned: false }); } });
  };
  const submitEvent = () => {
    if (!event.title || !event.eventDate) return toast.error('Title and date required');
    createEvent.mutate(event, { onSuccess: () => { toast.success('Event added'); setEventOpen(false); setEvent({ title: '', eventType: 'event', eventDate: '' }); } });
  };

  return (
    <div className="p-6">
      <PageHeader
        breadcrumb={[{ label: 'Communication' }, { label: 'Notices & Calendar' }]}
        title="Notices & Calendar"
        description="Circulars, announcements and the academic calendar"
        action={
          <div className="flex gap-2">
            <Dialog open={eventOpen} onOpenChange={setEventOpen}>
              <DialogTrigger asChild><Button variant="outline"><CalendarDays className="mr-2 h-4 w-4" /> Event</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>New Calendar Event</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Event title" value={event.title} onChange={(e) => setEvent({ ...event, title: e.target.value })} />
                  <select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={event.eventType} onChange={(e) => setEvent({ ...event, eventType: e.target.value })}>
                    <option value="event">Event</option><option value="holiday">Holiday</option><option value="exam">Exam</option><option value="meeting">Meeting</option>
                  </select>
                  <Input type="date" value={event.eventDate} onChange={(e) => setEvent({ ...event, eventDate: e.target.value })} />
                  <Button className="w-full" onClick={submitEvent}>Add Event</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={noticeOpen} onOpenChange={setNoticeOpen}>
              <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Notice</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>New Notice</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Title" value={notice.title} onChange={(e) => setNotice({ ...notice, title: e.target.value })} />
                  <textarea className="flex w-full rounded-md border bg-background px-3 py-2 text-sm min-h-[100px]" placeholder="Notice body" value={notice.body} onChange={(e) => setNotice({ ...notice, body: e.target.value })} />
                  <div className="grid grid-cols-2 gap-2">
                    <select className="rounded-md border bg-background px-3 py-2 text-sm" value={notice.audience} onChange={(e) => setNotice({ ...notice, audience: e.target.value })}>
                      <option value="all">Everyone</option><option value="staff">Staff</option><option value="students">Students</option><option value="parents">Parents</option>
                    </select>
                    <select className="rounded-md border bg-background px-3 py-2 text-sm" value={notice.category} onChange={(e) => setNotice({ ...notice, category: e.target.value })}>
                      <option value="circular">Circular</option><option value="event">Event</option><option value="holiday">Holiday</option><option value="exam">Exam</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={notice.isPinned} onChange={(e) => setNotice({ ...notice, isPinned: e.target.checked })} /> Pin to top</label>
                  <Button className="w-full" onClick={submitNotice}>Publish</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-4">
            <h3 className="mb-3 flex items-center gap-2 font-semibold"><Megaphone className="h-4 w-4" /> Notices</h3>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : !notices?.length ? (
              <p className="text-sm text-muted-foreground">No notices yet.</p>
            ) : (
              <div className="space-y-2">
                {notices.map((n) => (
                  <div key={n.id} className="rounded-lg border p-3">
                    <div className="flex items-start justify-between">
                      <p className="font-medium">{n.isPinned && <Pin className="mr-1 inline h-3.5 w-3.5 text-amber-500" />}{n.title}</p>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="secondary">{n.audience}</Badge>
                        <Badge variant="outline">{n.category}</Badge>
                        {n.status !== 'archived' && <Button size="sm" variant="ghost" onClick={() => archive.mutate(n.id, { onSuccess: () => toast.success('Archived') })}><Archive className="h-3.5 w-3.5" /></Button>}
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="mb-3 flex items-center gap-2 font-semibold"><CalendarDays className="h-4 w-4" /> Upcoming</h3>
            {!events?.length ? (
              <p className="text-sm text-muted-foreground">No upcoming events.</p>
            ) : (
              <div className="space-y-2">
                {events.map((e) => (
                  <div key={e.id} className="rounded-lg border p-3">
                    <p className="font-medium text-sm">{e.title}</p>
                    <p className="text-xs text-muted-foreground">{new Date(e.eventDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} · <Badge variant="outline" className="text-[10px]">{e.eventType}</Badge></p>
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
