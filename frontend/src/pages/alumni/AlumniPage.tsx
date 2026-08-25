import { useState } from 'react';
import { GraduationCap, Plus, Handshake, CalendarHeart, Users } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { Pill, NeutralPill, TONE } from '@/components/shared/Pill';
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
    <div className="p-4 sm:p-6 space-y-4">
      <PageHeader
        breadcrumb={[{ label: 'Insights' }, { label: 'Alumni Management' }]}
        title="Alumni Management"
        description="Alumni network, mentors and reunions"
        action={
          <div className="flex flex-wrap gap-2">
            <Dialog open={eventOpen} onOpenChange={setEventOpen}>
              <DialogTrigger asChild><Button variant="outline" className="flex-1 sm:flex-none"><CalendarHeart className="mr-2 h-4 w-4" /> Event</Button></DialogTrigger>
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
              <DialogTrigger asChild><Button className="flex-1 sm:flex-none"><Plus className="mr-2 h-4 w-4" /> Alumnus</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Alumnus</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Full name" value={alum.name} onChange={(e) => setAlum({ ...alum, name: e.target.value })} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard title="Total Alumni" value={stats?.total ?? 0} icon={Users} tone="teal" />
        <StatCard title="Mentors" value={stats?.mentors ?? 0} icon={Handshake} tone="gold" />
        <StatCard title="Events" value={events?.length ?? 0} icon={CalendarHeart} tone="saffron" className="col-span-2 lg:col-span-1" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl">
          <CardContent className="p-4 sm:p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 font-semibold"><GraduationCap className="h-4 w-4" /> Directory</h3>
              <Button size="sm" variant={mentorsOnly ? 'default' : 'outline'} className="rounded-full" onClick={() => setMentorsOnly(!mentorsOnly)}><Handshake className="mr-1.5 h-3.5 w-3.5" /> Mentors only</Button>
            </div>
            {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : !alumni?.length ? <p className="text-sm text-muted-foreground">No alumni{mentorsOnly ? ' mentors' : ''} yet.</p> : (
              <div className="flex flex-col gap-2.5">
                {alumni.map((a) => (
                  <div key={a.id} className="flex items-center justify-between gap-3 rounded-xl border bg-card p-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{a.name}</p>
                        {a.graduationYear ? <NeutralPill label={String(a.graduationYear)} /> : null}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{[a.designation, a.currentOrganization].filter(Boolean).join(' @ ') || '—'}</p>
                    </div>
                    {a.willingToMentor && <Pill label="mentor" tone={TONE.peacock} />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-4 sm:p-5">
            <h3 className="mb-3 flex items-center gap-2 font-semibold"><CalendarHeart className="h-4 w-4" /> Events</h3>
            {!events?.length ? <p className="text-sm text-muted-foreground">No alumni events.</p> : (
              <div className="flex flex-col gap-2.5">
                {events.map((e) => (
                  <div key={e.id} className="flex items-center justify-between gap-3 rounded-xl border bg-card p-3">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{e.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{new Date(e.eventDate).toLocaleDateString('en-IN')}{e.venue ? ' · ' + e.venue : ''}</p>
                    </div>
                    <Pill label={e.rsvpCount + ' RSVP'} tone={TONE.indigo} />
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
