import { useState } from 'react';
import { CalendarClock, Plus, Clock } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { SectionPicker } from '@/components/shared/SectionPicker';
import { NeutralPill, StatusPill } from '@/components/shared/Pill';
import {
  usePeriods,
  useSectionTimetable,
  useSubstitutions,
  useCreatePeriod,
  useSetSlot,
  type DayOfWeek,
} from '@/lib/queries/timetable/timetable-queries';

const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export default function TimetablePage() {
  const [sectionId, setSectionId] = useState('');
  const [activeSection, setActiveSection] = useState('');
  const [period, setPeriod] = useState({ name: '', startTime: '', endTime: '', sequence: '' });
  const [slot, setSlot] = useState({ dayOfWeek: 'monday' as DayOfWeek, periodId: '', subjectName: '', teacherId: '', room: '' });
  // Phone-only: the 6×N grid can't be read at 375px, so one day is shown at a time.
  const [phoneDay, setPhoneDay] = useState<DayOfWeek>('monday');

  const { data: periods } = usePeriods();
  const { data: slots } = useSectionTimetable(activeSection);
  const { data: subs } = useSubstitutions();
  const createPeriod = useCreatePeriod();
  const setSlotMut = useSetSlot();

  const grid = new Map<string, { subjectName: string; teacherId?: string | null; room?: string | null }>();
  (slots ?? []).forEach((s) => grid.set(s.dayOfWeek + ':' + s.periodId, s));

  const addPeriod = () => {
    if (!period.name || !period.startTime || !period.endTime) return toast.error('Name, start and end time are required');
    createPeriod.mutate(
      { name: period.name, startTime: period.startTime, endTime: period.endTime, sequence: period.sequence ? Number(period.sequence) : undefined },
      { onSuccess: () => { toast.success('Period added'); setPeriod({ name: '', startTime: '', endTime: '', sequence: '' }); }, onError: () => toast.error('Failed to add period') },
    );
  };

  const addSlot = () => {
    if (!activeSection) return toast.error('Load a section first');
    if (!slot.periodId || !slot.subjectName) return toast.error('Period and subject are required');
    setSlotMut.mutate(
      { sectionId: activeSection, dayOfWeek: slot.dayOfWeek, periodId: slot.periodId, subjectName: slot.subjectName, teacherId: slot.teacherId || undefined, room: slot.room || undefined },
      {
        onSuccess: () => { toast.success('Slot assigned'); setSlot({ ...slot, subjectName: '', teacherId: '', room: '' }); },
        onError: (e: unknown) => {
          const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
          toast.error(msg || 'Failed to assign slot');
        },
      },
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <PageHeader
        breadcrumb={[{ label: 'Dashboard', href: '/app/dashboard' }, { label: 'Timetable' }]}
        title="Timetable & Substitution"
        description="Period setup, section grids (no teacher double-booking) & daily substitutions"
        action={
          <Dialog>
            <DialogTrigger asChild><Button variant="outline" className="w-full sm:w-auto"><Clock className="w-4 h-4 mr-2" /> Add Period</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Period</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Name (e.g. Period 1) *" value={period.name} onChange={(e) => setPeriod({ ...period, name: e.target.value })} />
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input placeholder="Start (08:00) *" value={period.startTime} onChange={(e) => setPeriod({ ...period, startTime: e.target.value })} />
                  <Input placeholder="End (08:45) *" value={period.endTime} onChange={(e) => setPeriod({ ...period, endTime: e.target.value })} />
                  <Input placeholder="Seq" value={period.sequence} onChange={(e) => setPeriod({ ...period, sequence: e.target.value })} className="sm:w-20" />
                </div>
              </div>
              <DialogFooter><Button onClick={addPeriod} disabled={createPeriod.isPending}>Add</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Periods */}
      <Card className="rounded-2xl">
        <CardContent className="p-4 sm:p-5">
          <h2 className="text-lg font-semibold mb-3">Periods</h2>
          {!periods || periods.length === 0 ? (
            <p className="text-sm text-muted-foreground">No periods yet — add the daily time slots first.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {periods.map((p) => (
                <NeutralPill key={p.id} label={p.name + ' · ' + p.startTime + '–' + p.endTime} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section grid */}
      <Card className="rounded-2xl">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
            <SectionPicker value={sectionId} onChange={setSectionId} className="w-full sm:max-w-md sm:flex-1" />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => setActiveSection(sectionId.trim())}>Load Grid</Button>
              {activeSection && periods && periods.length > 0 && (
                <Dialog>
                  <DialogTrigger asChild><Button className="flex-1 sm:flex-none sm:ml-auto"><Plus className="w-4 h-4 mr-2" /> Assign Class</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Assign Class to Slot</DialogTitle></DialogHeader>
                    <div className="space-y-3">
                      <Select value={slot.dayOfWeek} onValueChange={(v) => setSlot({ ...slot, dayOfWeek: v as DayOfWeek })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{DAYS.map((d) => <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>)}</SelectContent>
                      </Select>
                      <Select value={slot.periodId} onValueChange={(v) => setSlot({ ...slot, periodId: v })}>
                        <SelectTrigger><SelectValue placeholder="Period" /></SelectTrigger>
                        <SelectContent>{periods.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                      </Select>
                      <Input placeholder="Subject *" value={slot.subjectName} onChange={(e) => setSlot({ ...slot, subjectName: e.target.value })} />
                      <Input placeholder="Teacher ID (optional)" value={slot.teacherId} onChange={(e) => setSlot({ ...slot, teacherId: e.target.value })} />
                      <Input placeholder="Room (optional)" value={slot.room} onChange={(e) => setSlot({ ...slot, room: e.target.value })} />
                      <p className="text-xs text-muted-foreground">A teacher already booked in this period (another section) will be rejected.</p>
                    </div>
                    <DialogFooter><Button onClick={addSlot} disabled={setSlotMut.isPending}>Assign</Button></DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          {!activeSection ? (
            <p className="text-sm text-muted-foreground">Choose a section and load its grid.</p>
          ) : !periods || periods.length === 0 ? (
            <p className="text-sm text-muted-foreground">Add periods first.</p>
          ) : (
            <>
              {/* Tablet & desktop — the full week grid, horizontally scrollable */}
              <div className="hidden sm:block overflow-x-auto indic-scroll">
                <table className="w-full text-sm border-collapse min-w-[640px]">
                  <thead>
                    <tr>
                      <th className="text-left p-2 text-muted-foreground font-medium">Period</th>
                      {DAYS.map((d) => <th key={d} className="text-left p-2 text-muted-foreground font-medium capitalize">{d.slice(0, 3)}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {periods.map((p) => (
                      <tr key={p.id} className="border-t">
                        <td className="p-2 text-muted-foreground whitespace-nowrap">{p.name}</td>
                        {DAYS.map((d) => {
                          const cell = grid.get(d + ':' + p.id);
                          return (
                            <td key={d} className="p-2">
                              {cell ? (
                                <div className="rounded-lg bg-primary/10 px-2 py-1">
                                  <div className="font-medium">{cell.subjectName}</div>
                                  {cell.room && <div className="text-[11px] text-muted-foreground">{cell.room}</div>}
                                </div>
                              ) : (
                                <span className="text-muted-foreground/50">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Phone — one day at a time, as a stacked list */}
              <div className="sm:hidden">
                <div className="flex gap-1.5 overflow-x-auto indic-scroll pb-2 -mx-1 px-1">
                  {DAYS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setPhoneDay(d)}
                      className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${phoneDay === d ? 'bg-primary text-primary-foreground border-primary' : 'bg-card'}`}
                    >
                      {d.slice(0, 3)}
                    </button>
                  ))}
                </div>
                <div className="mt-2 flex flex-col gap-2.5">
                  {periods.map((p) => {
                    const cell = grid.get(phoneDay + ':' + p.id);
                    return (
                      <div key={p.id} className="flex items-center justify-between gap-3 rounded-xl border bg-card p-3">
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">{p.name} · {p.startTime}–{p.endTime}</p>
                          <p className="font-medium truncate">{cell ? cell.subjectName : <span className="text-muted-foreground/60">Free</span>}</p>
                        </div>
                        {cell?.room && <NeutralPill label={cell.room} />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Substitutions */}
      <Card className="rounded-2xl">
        <CardContent className="p-4 sm:p-5">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><CalendarClock className="w-5 h-5" /> Recent Substitutions</h2>
          {!subs || subs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No substitutions planned.</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {subs.slice(0, 10).map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-3 rounded-xl border bg-card p-3 text-sm">
                  <span className="min-w-0 truncate">
                    {new Date(s.date).toLocaleDateString('en-IN')} · {s.slot?.period?.name ?? 'slot'}{s.reason ? ' · ' + s.reason : ''}
                  </span>
                  <StatusPill status={s.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
