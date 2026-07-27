import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';

const unwrap = async <T>(p: Promise<{ data: { data: T } }>): Promise<T> => (await p).data.data;

export interface StaffMember {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName?: string | null;
  designation?: string | null;
  department?: string | null;
  employmentType: string;
  status: string;
}

export interface Payslip {
  id: string;
  staffId: string;
  month: number;
  year: number;
  grossEarnings: string;
  totalDeductions: string;
  netPay: string;
  status: string;
}

export interface LeaveRequest {
  id: string;
  staffId: string;
  type: string;
  fromDate: string;
  toDate: string;
  days: number;
  reason?: string | null;
  status: 'pending' | 'approved' | 'rejected';
}

export const useStaff = (params?: Record<string, string>) =>
  useQuery({ queryKey: ['hr-staff', params], queryFn: () => unwrap<StaffMember[]>(api.get('/hr/staff', { params })) });

export const usePayslips = (params?: Record<string, string>) =>
  useQuery({ queryKey: ['hr-payslips', params], queryFn: () => unwrap<Payslip[]>(api.get('/hr/payslips', { params })) });

export const useLeaves = (params?: Record<string, string>) =>
  useQuery({ queryKey: ['hr-leaves', params], queryFn: () => unwrap<LeaveRequest[]>(api.get('/hr/leaves', { params })) });

export const useCreateStaff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<StaffMember>) => api.post('/hr/staff', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr-staff'] }),
  });
};

export const useSetSalaryStructure = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ staffId, ...body }: { staffId: string } & Record<string, unknown>) => api.post(`/hr/staff/${staffId}/salary-structure`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr-staff'] }),
  });
};

export const useRunPayroll = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { month: number; year: number }) => api.post('/hr/payroll/run', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr-payslips'] }),
  });
};

export const useReviewLeave = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: 'approved' | 'rejected' }) => api.post(`/hr/leaves/${id}/review`, { decision }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr-leaves'] }),
  });
};
