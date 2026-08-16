import { useState, type ComponentType } from "react";
import { useNavigate } from "react-router-dom";
import { usePageInstitution } from "@/hooks/usePageInstitution";
import {
  useAttendanceSessions,
  useCreateAttendanceSession,
  useDailyAttendanceStats,
  useSectionAttendanceReport,
  type SectionReport,
} from "@/lib/queries/attendance-queries";
import { useClasses, useSections } from "@/lib/queries";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Users, UserCheck, UserX, UserMinus, PlusCircle, Calendar } from "lucide-react";

const TONE = {
  green: '#15803d',
  temple: '#B8860B',
  red: '#C0392B',
  peacock: '#006A6E',
  indigo: '#1A237E',
  lotus: '#AD1457',
};

const SESSION_TYPE_TONE: Record<string, string> = {
  class: TONE.peacock,
  exam: TONE.lotus,
  activity: TONE.temple,
  event: TONE.indigo,
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

function StatTile({ label, value, icon: Icon, tone, valueColor }: { label: string; value: string | number; icon: ComponentType<{ className?: string }>; tone: string; valueColor?: string }) {
  return (
    <div className="bg-card border rounded-2xl p-[15px] flex items-center gap-[13px]">
      <span className="w-[42px] h-[42px] rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${tone}1f`, color: tone }}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <div className="text-[21px] leading-none" style={{ fontFamily: 'var(--font-display)', color: valueColor }}>{value}</div>
        <div className="text-xs text-muted-foreground font-semibold mt-1">{label}</div>
      </div>
    </div>
  );
}

export default function AttendancePage() {
  const institutionId = usePageInstitution() ?? '';
  const navigate = useNavigate();

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [sessionPage] = useState(1);
  const [createSessionOpen, setCreateSessionOpen] = useState(false);

  const statsQuery = useDailyAttendanceStats(institutionId, date);
  const sessionsQuery = useAttendanceSessions(institutionId, {
    date,
    page: sessionPage,
    limit: 20,
  });

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <PageHeader
        breadcrumb={[
          { label: 'Dashboard', href: '/app/dashboard' },
          { label: 'Attendance' },
        ]}
        title="Attendance"
        description="Manage student attendance sessions"
        action={
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-auto"
            />
            <Button onClick={() => setCreateSessionOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Session
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          {statsQuery.isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading stats...</div>
          ) : statsQuery.data ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatTile label="Total marked" value={statsQuery.data.totals.total} icon={Users} tone={TONE.peacock} />
                <StatTile label="Present" value={statsQuery.data.totals.present} icon={UserCheck} tone={TONE.green} valueColor={TONE.green} />
                <StatTile label="Late" value={statsQuery.data.totals.late} icon={UserMinus} tone={TONE.temple} valueColor={TONE.temple} />
                <StatTile label="Absent" value={statsQuery.data.totals.absent} icon={UserX} tone={TONE.red} valueColor={TONE.red} />
              </div>

              {/* Desktop table */}
              <div className="hidden lg:block rounded-2xl border bg-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead>Class & Section</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right" style={{ color: TONE.green }}>Present</TableHead>
                      <TableHead className="text-right" style={{ color: TONE.temple }}>Late</TableHead>
                      <TableHead className="text-right" style={{ color: TONE.red }}>Absent</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statsQuery.data.sessions.map((s) => (
                      <TableRow key={s.sessionId} className="cursor-pointer" onClick={() => navigate(`/app/attendance/sessions/${s.sessionId}`)}>
                        <TableCell className="font-bold">{s.class} – {s.section}</TableCell>
                        <TableCell><Pill label={s.type} tone={SESSION_TYPE_TONE[s.type] || TONE.peacock} /></TableCell>
                        <TableCell className="text-right font-semibold" style={{ color: TONE.green }}>{s.present}</TableCell>
                        <TableCell className="text-right font-semibold" style={{ color: TONE.temple }}>{s.late}</TableCell>
                        <TableCell className="text-right font-semibold" style={{ color: TONE.red }}>{s.absent}</TableCell>
                        <TableCell className="text-right font-bold">{s.total}</TableCell>
                      </TableRow>
                    ))}
                    {statsQuery.data.sessions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No sessions found for this date.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile / tablet cards */}
              <div className="lg:hidden flex flex-col gap-2.5">
                {statsQuery.data.sessions.map((s) => (
                  <button
                    key={s.sessionId}
                    onClick={() => navigate(`/app/attendance/sessions/${s.sessionId}`)}
                    className="text-left bg-card border rounded-2xl p-3.5"
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="font-bold text-[14.5px]">{s.class} – {s.section}</span>
                      <Pill label={s.type} tone={SESSION_TYPE_TONE[s.type] || TONE.peacock} />
                    </div>
                    <div className="flex gap-3.5 text-[13px]">
                      <span className="font-bold" style={{ color: TONE.green }}>{s.present} <span className="text-muted-foreground font-medium">present</span></span>
                      <span className="font-bold" style={{ color: TONE.temple }}>{s.late} <span className="text-muted-foreground font-medium">late</span></span>
                      <span className="font-bold" style={{ color: TONE.red }}>{s.absent} <span className="text-muted-foreground font-medium">absent</span></span>
                    </div>
                  </button>
                ))}
                {statsQuery.data.sessions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">No sessions found for this date.</div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">Failed to load stats.</div>
          )}
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4 mt-4">
          {/* Desktop table */}
          <div className="hidden lg:block rounded-2xl border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Class</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Marked</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessionsQuery.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                  </TableRow>
                ) : sessionsQuery.data?.data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">No sessions found.</TableCell>
                  </TableRow>
                ) : (
                  sessionsQuery.data?.data?.map((s) => (
                    <TableRow key={s.id} className="cursor-pointer" onClick={() => navigate(`/app/attendance/sessions/${s.id}`)}>
                      <TableCell>{s.section?.class?.name}</TableCell>
                      <TableCell>{s.section?.name}</TableCell>
                      <TableCell className="text-muted-foreground">{s.startTime} – {s.endTime || 'Ongoing'}</TableCell>
                      <TableCell><Pill label={s.type} tone={SESSION_TYPE_TONE[s.type] || TONE.peacock} /></TableCell>
                      <TableCell>
                        {s.status === 'open' ? <Pill label="Open" tone={TONE.green} /> : <NeutralPill label={s.status} />}
                      </TableCell>
                      <TableCell className="text-right font-semibold">{s._count?.records || 0}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile / tablet cards */}
          <div className="lg:hidden flex flex-col gap-2.5">
            {sessionsQuery.isLoading ? (
              <div className="text-center py-8 text-muted-foreground text-sm">Loading...</div>
            ) : sessionsQuery.data?.data?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">No sessions found.</div>
            ) : (
              sessionsQuery.data?.data?.map((s) => (
                <button
                  key={s.id}
                  onClick={() => navigate(`/app/attendance/sessions/${s.id}`)}
                  className="text-left bg-card border rounded-2xl p-3.5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-[14.5px]">{s.section?.class?.name} – {s.section?.name}</span>
                    {s.status === 'open' ? <Pill label="Open" tone={TONE.green} /> : <NeutralPill label={s.status} />}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{s.startTime} – {s.endTime || 'Ongoing'}</span>
                    <Pill label={s.type} tone={SESSION_TYPE_TONE[s.type] || TONE.peacock} />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1.5">{s._count?.records || 0} marked</div>
                </button>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4 mt-4">
          <ReportsTab institutionId={institutionId} />
        </TabsContent>
      </Tabs>

      <CreateSessionDialog
        open={createSessionOpen}
        onClose={() => setCreateSessionOpen(false)}
        institutionId={institutionId}
      />
    </div>
  );
}

function CreateSessionDialog({ open, onClose, institutionId }: { open: boolean, onClose: () => void, institutionId: string }) {
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [type, setType] = useState<"class" | "activity" | "exam" | "event">("class");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("15:00");

  const { data: classesData } = useClasses(institutionId);
  const { data: sectionsData } = useSections(institutionId, classId || undefined);
  const mutation = useCreateAttendanceSession();
  const navigate = useNavigate();

  const canSubmit = !!classId && !!sectionId && !!date && !!startTime;

  const handleSubmit = async () => {
    try {
      const session = await mutation.mutateAsync({
        classId,
        sectionId,
        type,
        date,
        startTime,
        endTime: endTime || undefined,
      });
      toast.success("Session created");
      onClose();
      navigate(`/app/attendance/sessions/${session.id}`);
    } catch {
      toast.error("Failed to create session");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Attendance Session</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Class *</Label>
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
                <SelectContent>
                  {classesData?.data?.map((c: { id: string; name: string }) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Section *</Label>
              <Select value={sectionId} onValueChange={setSectionId} disabled={!classId}>
                <SelectTrigger><SelectValue placeholder="Select Section" /></SelectTrigger>
                <SelectContent>
                  {sectionsData?.data?.map((s: { id: string; name: string }) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label>Session Type *</Label>
            <Select value={type} onValueChange={(v: any) => setType(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="class">Class (Daily)</SelectItem>
                <SelectItem value="activity">Activity</SelectItem>
                <SelectItem value="exam">Exam</SelectItem>
                <SelectItem value="event">Event</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Date *</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Start Time *</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>End Time</Label>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || mutation.isPending}>
            {mutation.isPending ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReportsTab({ institutionId }: { institutionId: string }) {
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState<SectionReport | null>(null);

  const { data: reportClassesData } = useClasses(institutionId);
  const { data: reportSectionsData } = useSections(institutionId, classId || undefined);
  const mutation = useSectionAttendanceReport();

  const handleGenerate = async () => {
    try {
      const data = await mutation.mutateAsync({ sectionId, startDate, endDate, format: 'json' as const });
      setReportData(data);
      toast.success("Report generated");
    } catch {
      toast.error("Failed to generate report");
    }
  };

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1 flex-1 min-w-[200px]">
              <Label>Class</Label>
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger><SelectValue placeholder="Class" /></SelectTrigger>
                <SelectContent>
                  {reportClassesData?.data?.map((c: { id: string; name: string }) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 flex-1 min-w-[200px]">
              <Label>Section</Label>
              <Select value={sectionId} onValueChange={setSectionId} disabled={!classId}>
                <SelectTrigger><SelectValue placeholder="Section" /></SelectTrigger>
                <SelectContent>
                  {reportSectionsData?.data?.map((s: { id: string; name: string }) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 flex-1 min-w-[150px]">
              <Label>Start Date</Label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-1 flex-1 min-w-[150px]">
              <Label>End Date</Label>
              <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
            <Button onClick={handleGenerate} disabled={!sectionId || !startDate || !endDate || mutation.isPending}>
              <Calendar className="mr-2 h-4 w-4" /> Generate
            </Button>
          </div>
        </CardContent>
      </Card>

      {reportData && (
        <div className="rounded-2xl border bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Student</TableHead>
                <TableHead className="text-right" style={{ color: TONE.green }}>Present</TableHead>
                <TableHead className="text-right" style={{ color: TONE.temple }}>Late</TableHead>
                <TableHead className="text-right" style={{ color: TONE.red }}>Absent</TableHead>
                <TableHead className="text-right">Excused</TableHead>
                <TableHead className="text-right">Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.students.map(s => (
                <TableRow key={s.student.id}>
                  <TableCell>
                    <div className="font-bold">{s.student.name}</div>
                    <div className="text-xs text-muted-foreground">{s.student.admissionNumber}</div>
                  </TableCell>
                  <TableCell className="text-right font-semibold" style={{ color: TONE.green }}>{s.present}</TableCell>
                  <TableCell className="text-right font-semibold" style={{ color: TONE.temple }}>{s.late}</TableCell>
                  <TableCell className="text-right font-semibold" style={{ color: TONE.red }}>{s.absent}</TableCell>
                  <TableCell className="text-right">{s.excused}</TableCell>
                  <TableCell className="text-right font-bold">{s.attendanceRate}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
