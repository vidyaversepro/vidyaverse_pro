import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  AttendanceSessionCreateInput,
  MarkAttendanceInput,
  AttendanceRecordUpdateInput,
  AttendanceQueryInput,
  AttendanceReportInput,
} from "@vidyaverse/shared-validation";

// ---------------------------------------------------------------------------
// Response shapes
// ---------------------------------------------------------------------------

export interface AttendanceSession {
  id: string;
  institutionId: string;
  classId: string;
  sectionId: string;
  subjectId: string | null;
  createdById: string;
  date: string;
  type: string;
  startTime: string;
  endTime: string | null;
  location: string | null;
  notes: string | null;
  status: "open" | "closed";
  closedAt: string | null;
  createdAt: string;
  section?: { id: string; name: string; class: { id: string; name: string } };
  subject?: { id: string; name: string };
  _count?: { records: number };
  records?: AttendanceRecord[];
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  status: "present" | "late" | "absent" | "excused";
  remarks: string | null;
  arrivalTime: string | null;
  checkInMethod: string | null;
  markedById: string | null;
  markedAt: string | null;
  student?: {
    id: string;
    name: string;
    admissionNumber: string;
    photoUrl: string | null;
  };
}

export interface DailyStats {
  date: string;
  sessions: {
    sessionId: string;
    class: string;
    section: string;
    type: string;
    present: number;
    late: number;
    absent: number;
    total: number;
  }[];
  totals: {
    present: number;
    late: number;
    absent: number;
    total: number;
  };
}

export interface SectionReport {
  sectionId: string;
  dateRange: { startDate: string; endDate: string };
  totalSessions: number;
  students: {
    student: { id: string; name: string; admissionNumber: string };
    present: number;
    late: number;
    absent: number;
    excused: number;
    total: number;
    attendanceRate: string;
  }[];
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export const useAttendanceSessions = (
  institutionId: string,
  query: AttendanceQueryInput
) =>
  useQuery({
    queryKey: ["attendance-sessions", institutionId, query],
    queryFn: async () => {
      const { data } = await api.get<{
        data: AttendanceSession[];
        pagination: { page: number; totalPages: number };
      }>("/attendance/sessions", { params: query });
      return data;
    },
    enabled: !!institutionId,
  });

export const useCreateAttendanceSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AttendanceSessionCreateInput) => {
      const { data } = await api.post<{ data: AttendanceSession }>(
        "/attendance/sessions",
        payload
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-daily-stats"] });
    },
  });
};

export const useAttendanceSessionDetails = (
  institutionId: string,
  sessionId: string
) =>
  useQuery({
    queryKey: ["attendance-session", institutionId, sessionId],
    queryFn: async () => {
      const { data } = await api.get<{ data: AttendanceSession }>(
        `/attendance/sessions/${sessionId}`
      );
      return data.data;
    },
    enabled: !!institutionId && !!sessionId,
  });

export const useCloseAttendanceSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { data } = await api.post<{ data: AttendanceSession }>(
        `/attendance/sessions/${sessionId}/close`
      );
      return data.data;
    },
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ["attendance-sessions"] });
      queryClient.invalidateQueries({
        queryKey: ["attendance-session", sessionId],
      });
      queryClient.invalidateQueries({ queryKey: ["attendance-daily-stats"] });
    },
  });
};

export const useRefreshQR = () =>
  useMutation({
    mutationFn: async (sessionId: string) => {
      const { data } = await api.post<{ data: { qrCode: string } }>(
        `/attendance/sessions/${sessionId}/refresh-qr`
      );
      return data.data;
    },
  });

export const useMarkAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: MarkAttendanceInput) => {
      const { data } = await api.post<{ data: AttendanceRecord[] }>(
        "/attendance/mark",
        payload
      );
      return data.data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["attendance-session", vars.sessionId],
      });
      queryClient.invalidateQueries({ queryKey: ["attendance-daily-stats"] });
    },
  });
};

export const useUpdateAttendanceRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      recordId,
      payload,
    }: {
      recordId: string;
      payload: AttendanceRecordUpdateInput;
    }) => {
      const { data } = await api.patch<{ data: AttendanceRecord }>(
        `/attendance/records/${recordId}`,
        payload
      );
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["attendance-session", data.sessionId],
      });
      queryClient.invalidateQueries({ queryKey: ["attendance-daily-stats"] });
    },
  });
};

export const useDailyAttendanceStats = (institutionId: string, date: string) =>
  useQuery({
    queryKey: ["attendance-daily-stats", institutionId, date],
    queryFn: async () => {
      const { data } = await api.get<{ data: DailyStats }>(
        "/attendance/stats/daily",
        { params: { date } }
      );
      return data.data;
    },
    enabled: !!institutionId && !!date,
  });

export const useSectionAttendanceReport = () =>
  useMutation({
    mutationFn: async (payload: AttendanceReportInput) => {
      const { data } = await api.post<{ data: SectionReport }>(
        "/attendance/reports/section",
        payload
      );
      return data.data;
    },
  });
