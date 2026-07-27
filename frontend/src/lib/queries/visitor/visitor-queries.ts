import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';

const unwrap = async <T>(p: Promise<{ data: { data: T } }>): Promise<T> => (await p).data.data;

export interface VisitorLog {
  id: string;
  visitorName: string;
  phone?: string | null;
  purpose?: string | null;
  whomToMeet?: string | null;
  badgeNumber?: string | null;
  status: 'checked_in' | 'checked_out';
  checkInAt: string;
  checkOutAt?: string | null;
}

export interface GatePass {
  id: string;
  studentId: string;
  type: 'early_leave' | 'late_entry' | 'day_out';
  reason?: string | null;
  approvedBy?: string | null;
  issuedAt: string;
  validUntil?: string | null;
}

export const useVisitorLogs = (status?: string) =>
  useQuery({ queryKey: ['visitor-logs', status], queryFn: () => unwrap<VisitorLog[]>(api.get('/visitor/logs', { params: { status } })) });

export const useVisitorsInside = () =>
  useQuery({ queryKey: ['visitors-inside'], queryFn: () => unwrap<VisitorLog[]>(api.get('/visitor/inside')), refetchInterval: 60_000 });

export const useGatePasses = () =>
  useQuery({ queryKey: ['gate-passes'], queryFn: () => unwrap<GatePass[]>(api.get('/visitor/gate-passes')) });

export const useCheckInVisitor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { visitorName: string; phone?: string; purpose?: string; whomToMeet?: string }) => api.post('/visitor/check-in', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['visitor-logs'] });
      qc.invalidateQueries({ queryKey: ['visitors-inside'] });
    },
  });
};

export const useCheckOutVisitor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (logId: string) => api.post(`/visitor/logs/${logId}/check-out`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['visitor-logs'] });
      qc.invalidateQueries({ queryKey: ['visitors-inside'] });
    },
  });
};

export const useIssueGatePass = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { studentId: string; type?: string; reason?: string; validUntil?: string }) => api.post('/visitor/gate-passes', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gate-passes'] }),
  });
};
