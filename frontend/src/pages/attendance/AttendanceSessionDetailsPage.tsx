import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePageInstitution } from "@/hooks/usePageInstitution";
import { useStudents } from "@/lib/queries";
import {
  useAttendanceSessionDetails,
  useMarkAttendance,
  useCloseAttendanceSession,
  useRefreshQR,
} from "@/lib/queries/attendance-queries";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ChevronLeft, QrCode, Lock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AttendanceSessionDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const institutionId = usePageInstitution() ?? '';

  const { data: session, isLoading } = useAttendanceSessionDetails(institutionId, id!);
  const { data: studentsRes } = useStudents({ sectionId: session?.sectionId ?? '', limit: '1000' });
  
  const markMutation = useMarkAttendance();
  const closeMutation = useCloseAttendanceSession();
  const qrMutation = useRefreshQR();

  const [localRecords, setLocalRecords] = useState<Record<string, { status: string, remarks: string }>>({});
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);

  const students = studentsRes?.data || [];
  const isClosed = session?.status === "closed";

  // Initialize local records with server data or default 'present'
  useEffect(() => {
    if (session && students.length > 0) {
      const records: Record<string, { status: string, remarks: string }> = {};
      students.forEach(student => {
        const existing = session.records?.find(r => r.studentId === student.id);
        records[student.id] = {
          status: existing ? existing.status : "present",
          remarks: existing?.remarks || "",
        };
      });
      setLocalRecords(records);
    }
  }, [session, students]);

  const handleStatusChange = (studentId: string, status: string) => {
    if (isClosed) return;
    setLocalRecords(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status }
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    if (isClosed) return;
    setLocalRecords(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], remarks }
    }));
  };

  const handleSave = async () => {
    const payload = {
      sessionId: session!.id,
      records: Object.entries(localRecords).map(([studentId, data]) => ({
        studentId,
        status: data.status as "present" | "absent" | "late" | "excused",
        remarks: data.remarks || undefined,
        arrivalTime: new Date().toTimeString().slice(0, 5),
      })),
    };

    try {
      await markMutation.mutateAsync(payload);
      toast.success("Attendance saved successfully");
    } catch {
      toast.error("Failed to save attendance");
    }
  };

  const handleCloseSession = async () => {
    try {
      await closeMutation.mutateAsync(session!.id);
      toast.success("Session closed");
    } catch {
      toast.error("Failed to close session");
    }
  };

  const handleShowQr = async () => {
    try {
      const res = await qrMutation.mutateAsync(session!.id);
      setQrCode(res.qrCode);
      setIsQrOpen(true);
    } catch {
      toast.error("Failed to generate QR");
    }
  };

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (!session) return <div className="p-6">Session not found</div>;

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/app/attendance")}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mark Attendance</h1>
          <p className="text-sm text-muted-foreground">
            {session.section?.class?.name} - {session.section?.name} | {new Date(session.date).toLocaleDateString()}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant={isClosed ? "secondary" : "default"}>{session.status}</Badge>
          {!isClosed && (
            <>
              <Button variant="outline" onClick={handleShowQr}>
                <QrCode className="mr-2 h-4 w-4" /> Show QR
              </Button>
              <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleCloseSession}>
                <Lock className="mr-2 h-4 w-4" /> Close Session
              </Button>
              <Button onClick={handleSave} disabled={markMutation.isPending}>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Save Attendance
              </Button>
            </>
          )}
        </div>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead className="w-[300px]">Status</TableHead>
              <TableHead className="w-[300px]">Remarks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => {
              const rec = localRecords[student.id] || { status: 'present', remarks: '' };
              return (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="font-medium">{student.name}</div>
                    <div className="text-xs text-muted-foreground">{student.admissionNumber}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {["present", "late", "absent", "excused"].map((status) => (
                        <button
                          key={status}
                          disabled={isClosed}
                          onClick={() => handleStatusChange(student.id, status)}
                          className={cn(
                            "px-3 py-1 text-xs font-medium rounded-full border transition-colors",
                            rec.status === status
                              ? status === "present" ? "bg-green-100 text-green-700 border-green-200"
                              : status === "late" ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                              : status === "absent" ? "bg-red-100 text-red-700 border-red-200"
                              : "bg-gray-100 text-gray-700 border-gray-200"
                              : "bg-white text-gray-500 hover:bg-gray-50",
                            isClosed && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="Optional remarks"
                      value={rec.remarks}
                      onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                      disabled={isClosed}
                      className="h-8 text-sm"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isQrOpen} onOpenChange={setIsQrOpen}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <DialogTitle>Session QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-6">
            {qrCode ? (
              <img src={`data:image/png;base64,${qrCode}`} alt="Attendance QR" className="w-64 h-64 object-contain" />
            ) : (
              <div className="w-64 h-64 bg-muted flex items-center justify-center">Loading...</div>
            )}
          </div>
          <div className="flex justify-center">
            <Button variant="outline" onClick={handleShowQr} disabled={qrMutation.isPending}>
              Refresh QR Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
