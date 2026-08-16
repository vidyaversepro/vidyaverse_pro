import { useState } from 'react';
import { UserPlus, Search, PhoneCall, StickyNote, MapPin, MessageCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { PageHeader } from '@/components/shared/PageHeader';
import { usePageInstitution } from '@/hooks/usePageInstitution';
import { useClasses, useSections } from '@/lib/queries';
import {
  useEnquiries,
  usePipelineStats,
  useCreateEnquiry,
  useUpdateEnquiry,
  useEnquiry,
  useAddActivity,
  useConvertToStudent,
  type EnquiryStatus,
  type EnquirySource,
  type EnquiryActivityType,
  type Enquiry,
} from '@/lib/queries/admissions/admissions-queries';

const STATUSES: EnquiryStatus[] = ['new', 'contacted', 'visited', 'application', 'admitted', 'lost'];
const SOURCES: EnquirySource[] = ['walk_in', 'website', 'referral', 'whatsapp', 'phone', 'social', 'other'];

const TONE = {
  green: '#15803d',
  temple: '#B8860B',
  red: '#C0392B',
  peacock: '#006A6E',
  indigo: '#1A237E',
  lotus: '#AD1457',
};

const STATUS_TONE: Record<EnquiryStatus, string> = {
  new: TONE.indigo,
  contacted: TONE.peacock,
  visited: TONE.lotus,
  application: TONE.temple,
  admitted: TONE.green,
  lost: TONE.red,
};

function Pill({ label, tone }: { label: string; tone: string }) {
  return (
    <span
      className="inline-flex items-center text-[11px] font-bold capitalize px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{ color: tone, background: `${tone}1f` }}
    >
      {label}
    </span>
  );
}

function NeutralPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center text-[11px] font-bold capitalize px-2.5 py-1 rounded-full bg-muted text-muted-foreground border whitespace-nowrap">
      {label}
    </span>
  );
}

const ACTIVITY_ICONS: Partial<Record<EnquiryActivityType, React.ReactNode>> = {
  call: <PhoneCall className="w-4 h-4" style={{ color: TONE.peacock }} />,
  note: <StickyNote className="w-4 h-4 text-muted-foreground" />,
  visit: <MapPin className="w-4 h-4" style={{ color: TONE.lotus }} />,
  whatsapp: <MessageCircle className="w-4 h-4" style={{ color: TONE.green }} />,
};

function isOverdue(dateStr: string | null | undefined) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

export default function AdmissionsPage() {
  const [statusFilter, setStatusFilter] = useState<EnquiryStatus | null>(null);
  const [sourceFilter, setSourceFilter] = useState<EnquirySource | 'all'>('all');
  const [search, setSearch] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [form, setForm] = useState({ studentName: '', guardianName: '', phone: '', email: '', classInterested: '', source: 'walk_in' as EnquirySource });

  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string | null>(null);

  const params: Record<string, string> = {};
  if (statusFilter) params.status = statusFilter;
  if (sourceFilter && sourceFilter !== 'all') params.source = sourceFilter;
  if (search) params.search = search;

  const { data: stats } = usePipelineStats();
  const { data: enquiries, isLoading } = useEnquiries(params);
  const createEnquiry = useCreateEnquiry();
  const updateEnquiry = useUpdateEnquiry();

  const submit = () => {
    if (!form.studentName || !form.phone) {
      toast.error('Student name and phone are required');
      return;
    }
    createEnquiry.mutate(form, {
      onSuccess: () => {
        toast.success('Enquiry added');
        setCreateDialogOpen(false);
        setForm({ studentName: '', guardianName: '', phone: '', email: '', classInterested: '', source: 'walk_in' });
      },
      onError: () => toast.error('Failed to add enquiry'),
    });
  };

  const changeStatus = (id: string, status: EnquiryStatus) => {
    updateEnquiry.mutate({ id, status }, { onSuccess: () => toast.success('Status updated'), onError: () => toast.error('Update failed') });
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-h-screen flex flex-col">
      <PageHeader
        breadcrumb={[{ label: 'Dashboard', href: '/app/dashboard' }, { label: 'Admissions' }]}
        title="Admissions"
        description="Lead pipeline — capture, follow up, and convert enquiries"
        action={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button><UserPlus className="w-4 h-4 mr-2" /> New Enquiry</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Enquiry</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Student name *" value={form.studentName} onChange={(e) => setForm({ ...form, studentName: e.target.value })} />
                <Input placeholder="Guardian name" value={form.guardianName} onChange={(e) => setForm({ ...form, guardianName: e.target.value })} />
                <Input placeholder="Phone (WhatsApp) *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <Input placeholder="Class / course interested" value={form.classInterested} onChange={(e) => setForm({ ...form, classInterested: e.target.value })} />
                <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v as EnquirySource })}>
                  <SelectTrigger><SelectValue placeholder="Source" /></SelectTrigger>
                  <SelectContent>
                    {SOURCES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button className="w-full" onClick={submit} disabled={createEnquiry.isPending}>Add Enquiry</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <Tabs defaultValue="pipeline" className="flex-1 flex flex-col min-h-0">
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="all">All Enquiries</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="flex-1 min-h-0 mt-4 overflow-hidden">
          <div className="flex h-full gap-3 overflow-x-auto pb-4 items-start">
            {STATUSES.map(status => (
              <div key={status} className="flex-shrink-0 w-[260px] bg-muted/40 rounded-2xl p-3 flex flex-col gap-2.5 h-full overflow-hidden border">
                <div className="flex items-center justify-between px-0.5">
                  <h3 className="font-bold capitalize text-[13.5px] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: STATUS_TONE[status] }} />
                    {status}
                  </h3>
                  <span className="text-[11px] font-bold text-muted-foreground bg-card border rounded-full px-2.5 py-0.5">
                    {stats?.byStatus?.[status] ?? 0}
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                  {enquiries?.filter(e => e.status === status).map(enq => (
                    <Card
                      key={enq.id}
                      className="cursor-pointer transition-colors rounded-xl"
                      style={{ borderColor: 'hsl(var(--border))' }}
                      onClick={() => setSelectedEnquiryId(enq.id)}
                    >
                      <CardContent className="p-3 space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <div className="font-bold text-[13.5px]">{enq.studentName}</div>
                          <NeutralPill label={enq.source.replace('_', ' ')} />
                        </div>
                        <div className="text-xs text-muted-foreground flex justify-between items-center">
                          <span>{enq.phone}</span>
                          <span>{enq.classInterested}</span>
                        </div>
                        {enq.followUpAt && (
                          <div
                            className="text-[10.5px] font-bold"
                            style={{ color: isOverdue(enq.followUpAt) ? TONE.red : 'hsl(var(--muted-foreground))' }}
                          >
                            Follow-up · {new Date(enq.followUpAt).toLocaleDateString()}
                          </div>
                        )}
                        <div onClick={e => e.stopPropagation()}>
                          <Select value={enq.status} onValueChange={(v) => changeStatus(enq.id, v as EnquiryStatus)}>
                            <SelectTrigger className="h-7 text-xs mt-1 w-full"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize text-xs">{s}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="all" className="flex-1 min-h-0 mt-4 flex flex-col space-y-4 overflow-hidden">
          {/* Search & Filters */}
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by name or phone…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? null : v as EnquiryStatus)}>
              <SelectTrigger className="w-40"><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={(v) => setSourceFilter(v as EnquirySource | 'all')}>
              <SelectTrigger className="w-40"><SelectValue placeholder="All Sources" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {SOURCES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Desktop table */}
          <Card className="hidden lg:block flex-1 overflow-auto border rounded-2xl">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead>Student</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8">Loading…</TableCell></TableRow>
                  ) : !enquiries || enquiries.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No enquiries found.</TableCell></TableRow>
                  ) : (
                    enquiries.map((e) => (
                      <TableRow key={e.id} className="cursor-pointer" onClick={() => setSelectedEnquiryId(e.id)}>
                        <TableCell>
                          <div className="font-bold">{e.studentName}</div>
                          {e.guardianName && <div className="text-xs text-muted-foreground">{e.guardianName}</div>}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{e.phone}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{e.classInterested || '—'}</TableCell>
                        <TableCell><NeutralPill label={e.source.replace('_', ' ')} /></TableCell>
                        <TableCell onClick={ev => ev.stopPropagation()}>
                          <Select value={e.status} onValueChange={(v) => changeStatus(e.id, v as EnquiryStatus)}>
                            <SelectTrigger className="w-36 h-8">
                              <Pill label={e.status} tone={STATUS_TONE[e.status]} />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Mobile / tablet cards */}
          <div className="lg:hidden flex-1 overflow-auto flex flex-col gap-2.5">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground text-sm">Loading…</div>
            ) : !enquiries || enquiries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">No enquiries found.</div>
            ) : (
              enquiries.map((e) => (
                <button
                  key={e.id}
                  onClick={() => setSelectedEnquiryId(e.id)}
                  className="text-left bg-card border rounded-2xl p-3.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-[14.5px] truncate">{e.studentName}</span>
                    <Pill label={e.status} tone={STATUS_TONE[e.status]} />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{e.phone} · {e.classInterested || '—'}</div>
                  <div className="mt-1.5"><NeutralPill label={e.source.replace('_', ' ')} /></div>
                </button>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Enquiry Detail Sheet */}
      <Sheet open={!!selectedEnquiryId} onOpenChange={(open) => !open && setSelectedEnquiryId(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-background">
          <EnquiryDetailSheetContent
            enquiryId={selectedEnquiryId}
            onClose={() => setSelectedEnquiryId(null)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}

function EnquiryDetailSheetContent({ enquiryId, onClose }: { enquiryId: string | null; onClose: () => void }) {
  const institutionId = usePageInstitution() ?? '';

  const { data: enquiry, isLoading } = useEnquiry(enquiryId);
  const updateEnquiry = useUpdateEnquiry();
  const addActivity = useAddActivity();
  const convertMutation = useConvertToStudent();

  const [activityType, setActivityType] = useState<EnquiryActivityType>('note');
  const [activityDesc, setActivityDesc] = useState('');
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [convertClassId, setConvertClassId] = useState<string>('');
  const [convertSectionId, setConvertSectionId] = useState<string>('');

  const { data: classesRes } = useClasses(institutionId);
  const { data: sectionsRes } = useSections(institutionId, convertClassId || undefined);

  if (isLoading || !enquiry) return <div className="p-6 text-center">Loading...</div>;

  const handleUpdate = (field: keyof Enquiry, value: any) => {
    updateEnquiry.mutate({ id: enquiry.id, [field]: value });
  };

  const handleAddActivity = () => {
    if (!activityDesc.trim()) return;
    addActivity.mutate({ id: enquiry.id, type: activityType, description: activityDesc }, {
      onSuccess: () => {
        setActivityDesc('');
        toast.success('Activity added');
      }
    });
  };

  const handleConvert = async () => {
    if (!convertSectionId) return;
    try {
      const res: any = await convertMutation.mutateAsync({ id: enquiry.id, sectionId: convertSectionId });
      const ok = res?.data?.ok ?? res?.ok;
      const reason = res?.data?.reason ?? res?.reason;
      if (ok) {
        toast.success('Converted to student successfully!');
        setConvertDialogOpen(false);
        onClose();
      } else {
        toast.error('Conversion failed: ' + reason);
      }
    } catch {
      toast.error('Failed to convert to student');
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <SheetHeader>
        <div className="flex justify-between items-start gap-2">
          <SheetTitle className="text-xl">{enquiry.studentName}</SheetTitle>
          <Pill label={enquiry.status} tone={STATUS_TONE[enquiry.status]} />
        </div>
        <p className="text-sm text-muted-foreground">{enquiry.enquiryNumber}</p>
      </SheetHeader>

      <Card className="rounded-2xl">
        <CardContent className="p-4 space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-semibold">Status</label>
            <Select value={enquiry.status} onValueChange={(v) => handleUpdate('status', v)}>
              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold">Phone</label>
              <Input value={enquiry.phone} onChange={e => handleUpdate('phone', e.target.value)} className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold">Class Interested</label>
              <Input value={enquiry.classInterested || ''} onChange={e => handleUpdate('classInterested', e.target.value)} className="h-8 text-sm" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-semibold">Follow-up Date</label>
            <Input
              type="datetime-local"
              value={enquiry.followUpAt ? new Date(new Date(enquiry.followUpAt).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0,16) : ''}
              onChange={e => handleUpdate('followUpAt', e.target.value ? new Date(e.target.value).toISOString() : null)}
              className="h-8 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="font-bold text-sm">Activity Log</h3>

        {/* Add Activity Form */}
        <Card className="rounded-2xl">
          <CardContent className="p-3 space-y-2">
            <div className="flex gap-2">
              <Select value={activityType} onValueChange={(v: EnquiryActivityType) => setActivityType(v)}>
                <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="note">Note</SelectItem>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="visit">Visit</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder="Activity description..."
              value={activityDesc}
              onChange={e => setActivityDesc(e.target.value)}
              className="h-8 text-sm"
              onKeyDown={e => e.key === 'Enter' && handleAddActivity()}
            />
            <div className="flex justify-end">
              <Button size="sm" onClick={handleAddActivity} disabled={addActivity.isPending} className="h-7 text-xs">Add</Button>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
          {enquiry.activities?.map((act) => (
            <div key={act.id} className="relative flex items-start justify-between gap-4">
              <div className="absolute left-0 mt-1 flex items-center justify-center w-6 h-6 rounded-full bg-card border ring-4 ring-background">
                {ACTIVITY_ICONS[act.type] || <StickyNote className="w-3 h-3 text-muted-foreground" />}
              </div>
              <div className="ml-10 w-full bg-card rounded-md p-3 border">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold capitalize">{act.type.replace('_', ' ')}</span>
                  <span className="text-[10px] text-muted-foreground">{new Date(act.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm text-muted-foreground">{act.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {enquiry.status !== 'admitted' && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t sm:absolute">
          <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full text-white" style={{ background: TONE.green }}>Convert to Student</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Convert to Student</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="p-3 rounded-md text-sm flex gap-2" style={{ background: `${TONE.temple}1f`, color: TONE.temple }}>
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>This will create a permanent Student record and mark the enquiry as Admitted. This action cannot be reversed.</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Assign to Class</label>
                  <Select value={convertClassId} onValueChange={setConvertClassId}>
                    <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
                    <SelectContent>
                      {classesRes?.data?.map((c: { id: string; name: string }) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Assign to Section</label>
                  <Select value={convertSectionId} onValueChange={setConvertSectionId} disabled={!convertClassId}>
                    <SelectTrigger><SelectValue placeholder="Select Section" /></SelectTrigger>
                    <SelectContent>
                      {sectionsRes?.data?.map((s: { id: string; name: string }) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConvertDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleConvert} disabled={!convertSectionId || convertMutation.isPending} className="text-white" style={{ background: TONE.green }}>
                  Confirm Conversion
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
