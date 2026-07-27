import { useState } from 'react';
import { GraduationCap, Plus, Handshake, CalendarHeart, Users } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import {
  useAlumni,
  useAlumniStats,
  useAlumniEvents,
  useCreateAlumnus,
  useCreateAlumniEvent,
} from '@/lib/queries/alumni/alumni-queries';

export default function AlumniPage() {
  const [alumOpen, setAlumOpen] = useState(false);
  const [eventOpen, setEventOpen] = useState(false);
  const [mentorsOnly, setMentorsOnly] = useState(false);
  const [alum, setAlum] = useState({ name: '', graduationYear: '', currentOrganization: '', designation: '', email: '', willingToMentor: false });
  const [event, setEvent] = useState({ title: '', eventDate: '', venue: '' });

  const { data: alumni, isLoading } = useAlumni(mentorsOnly);
  const { data: stats } = useAlumniStats();
  const { data: events } = useAlumniEvents();
  const createAlum = useCreateAlumnus();
  const createEvent = useCreateAlumniEvent();

  const submitAlum = () => {
    if (!alum.name) return toast.error('Name required');
    createAlum.mutate(
      { ...alum, graduationYear: alum.graduationYear ? Number(alum.graduationYear) : undefined },
      { onSuccess: () => { toast.success('Alumnus added'); setAlumOpen(false); setAlum({ name: '', graduationYear: '', currentOrganization: '', designation: '', email: '', willingToMentor: false }); } },
    );
  };
  const submitEvent = () => {
    if (!event.title || !event.eventDate) return toast.error('Title and date required');
    createEvent.mutate(event, { onSuccess: () => { toast.success('Event created'); setEventOpen(false); setEvent({ title: '', eventDate: '', venue: '' }); } });
  };

  return (
    <div className="p-6">
      <PageHeader
        breadcrumb={[{ label: 'Insights' }, { label: 'Alumni Management' }]}
        title="Alumni Management"
        description="Alumni network, mentors and reunions"
        action={
          <div className="flex gap-2">
            <Dialog open={eventOpen} onOpenChange={setEventOpen}>
              <DialogTrigger asChild><Button variant="outline"><CalendarHeart className="mr-2 h-4 w-4" /> Event</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>New Alumni Event</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Event title" value={event.title} onChange={(e) => setEvent({ ...event, title: e.target.value })} />
                  <Input type="date" value={event.eventDate} onChange={(e) => setEvent({ ...event, eventDate: e.target.value })} />
                  <Input placeholder="Venue" value={event.venue} onChange={(e) => setEvent({ ...event, venue: e.target.value })} />
                  <Button className="w-full" onClick={submitEvent}>Create</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={alumOpen} onOpenChange={setAlumOpen}>
              <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Alumnus</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Alumnus</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Full name" value={alum.name} onChange={(e) => setAlum({ ...alum, name: e.target.value })} />
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Grad year" type="number" value={alum.graduationYear} onChange={(e) => setAlum({ ...alum, graduationYear: e.target.value })} />
                    <Input placeholder="Email" value={alum.email} onChange={(e) => setAlum({ ...alum, email: e.target.value })} />
                  </div>
                  <Input placeholder="Current organization" value={alum.currentOrganization} onChange={(e) => setAlum({ ...alum, currentOrganization: e.target.value })} />
                  <Input placeholder="Designation" value={alum.designation} onChange={(e) => setAlum({ ...alum, designation: e.target.value })} />
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={alum.willingToMentor} onChange={(e) => setAlum({ ...alum, willingToMentor: e.target.checked })} /> Willing to mentor</label>
                  <Button className="w-full" onClick={submitAlum}>Add</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Card><CardContent className="flex items-center gap-3 p-4"><div className="rounded-lg bg-primary/10 p-2"><Users className="h-5 w-5 text-primary" /></div><div><p className="text-2xl font-bold">{stats?.total ?? 0}</p><p className="text-xs text-muted-foreground">Total Alumni</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4"><div className="rounded-lg bg-primary/10 p-2"><Handshake className="h-5 w-5 text-primary" /></div><div><p className="text-2xl font-bold">{stats?.mentors ?? 0}</p><p className="text-xs text-muted-foreground">Mentors</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4"><div className="rounded-lg bg-primary/10 p-2"><CalendarHeart className="h-5 w-5 text-primary" /></div><div><p className="text-2xl font-bold">{events?.length ?? 0}</p><p className="text-xs text-muted-foreground">Events</p></div></CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-semibold"><GraduationCap className="h-4 w-4" /> Directory</h3>
              <Button size="sm" variant={mentorsOnly ? 'default' : 'outline'} onClick={() => setMentorsOnly(!mentorsOnly)}><Handshake className="mr-1.5 h-3.5 w-3.5" /> Mentors only</Button>
            </div>
            {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : !alumni?.length ? <p className="text-sm text-muted-foreground">No alumni{mentorsOnly ? ' mentors' : ''} yet.</p> : (
              <div className="space-y-2">
                {alumni.map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{a.name} {a.graduationYear && <Badge variant="outline" className="ml-1">'{String(a.graduationYear).slice(2)}</Badge>}</p>
                      <p className="text-xs text-muted-foreground">{[a.designation, a.currentOrganization].filter(Boolean).join(' @ ') || '—'}</p>
                    </div>
                    {a.willingToMentor && <Badge variant="secondary">mentor</Badge>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="mb-3 flex items-center gap-2 font-semibold"><CalendarHeart className="h-4 w-4" /> Events</h3>
            {!events?.length ? <p className="text-sm text-muted-foreground">No alumni events.</p> : (
              <div className="space-y-2">
                {events.map((e) => (
                  <div key={e.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{e.title}</p>
                      <p className="text-xs text-muted-foreground">{new Date(e.eventDate).toLocaleDateString('en-IN')}{e.venue ? ` · ${e.venue}` : ''}</p>
                    </div>
                    <Badge variant="secondary">{e.rsvpCount} RSVP</Badge>
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
