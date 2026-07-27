import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Users, UserCheck, UserX, UserMinus, PlusCircle, Calendar } from "lucide-react";

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
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Attendance</h1>
          <p className="text-sm text-muted-foreground">Manage student attendance sessions</p>
        </div>
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
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {statsQuery.isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading stats...</div>
          ) : statsQuery.data ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Total Marked
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{statsQuery.data.totals.total}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-green-500" />
                      Present
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-600">{statsQuery.data.totals.present}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <UserMinus className="h-4 w-4 text-yellow-500" />
                      Late
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-yellow-600">{statsQuery.data.totals.late}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <UserX className="h-4 w-4 text-red-500" />
                      Absent
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-red-600">{statsQuery.data.totals.absent}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="rounded-lg border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class & Section</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Present</TableHead>
                      <TableHead>Late</TableHead>
                      <TableHead>Absent</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statsQuery.data.sessions.map((s) => (
                      <TableRow key={s.sessionId} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/app/attendance/sessions/${s.sessionId}`)}>
                        <TableCell className="font-medium">{s.class} - {s.section}</TableCell>
                        <TableCell className="capitalize">{s.type}</TableCell>
                        <TableCell className="text-green-600">{s.present}</TableCell>
                        <TableCell className="text-yellow-600">{s.late}</TableCell>
                        <TableCell className="text-red-600">{s.absent}</TableCell>
                        <TableCell>{s.total}</TableCell>
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
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">Failed to load stats.</div>
          )}
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Marked</TableHead>
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
                    <TableRow key={s.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/app/attendance/sessions/${s.id}`)}>
                      <TableCell>{s.section?.class?.name}</TableCell>
                      <TableCell>{s.section?.name}</TableCell>
                      <TableCell>{s.startTime} - {s.endTime || 'Ongoing'}</TableCell>
                      <TableCell className="capitalize">{s.type}</TableCell>
                      <TableCell>
                        <Badge variant={s.status === 'open' ? 'default' : 'secondary'}>{s.status}</Badge>
                      </TableCell>
                      <TableCell>{s._count?.records || 0}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
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
      <Card>
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
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Present</TableHead>
                <TableHead>Late</TableHead>
                <TableHead>Absent</TableHead>
                <TableHead>Excused</TableHead>
                <TableHead>Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.students.map(s => (
                <TableRow key={s.student.id}>
                  <TableCell>
                    <div className="font-medium">{s.student.name}</div>
                    <div className="text-xs text-muted-foreground">{s.student.admissionNumber}</div>
                  </TableCell>
                  <TableCell className="text-green-600">{s.present}</TableCell>
                  <TableCell className="text-yellow-600">{s.late}</TableCell>
                  <TableCell className="text-red-600">{s.absent}</TableCell>
                  <TableCell>{s.excused}</TableCell>
                  <TableCell className="font-bold">{s.attendanceRate}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
