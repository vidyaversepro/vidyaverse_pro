import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';

const unwrap = async <T>(p: Promise<{ data: { data: T } }>): Promise<T> => (await p).data.data;

export interface FeeConcession {
  id: string;
  studentId: string;
  name: string;
  type: string;
  amount?: string | null;
  percent?: string | null;
  academicYear: string;
  status: 'active' | 'expired';
}

export interface FeeInstallment {
  id: string;
  installmentNo: number;
  amount: string;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  paidAt?: string | null;
}

export interface InstallmentPlan {
  id: string;
  studentId: string;
  totalAmount: string;
  numInstallments: number;
  academicYear: string;
  installments: FeeInstallment[];
}

export interface Defaulters {
  overdueInstallments: Array<FeeInstallment & { plan?: { studentId: string } }>;
  unpaidInvoices: Array<{ id: string; studentId: string; netAmount: string; paidAmount: string; dueDate: string }>;
  overdueInstallmentAmount: number;
  count: number;
}

export const useConcessions = () =>
  useQuery({ queryKey: ['concessions'], queryFn: () => unwrap<FeeConcession[]>(api.get('/fees-advanced/concessions')) });

export const useInstallmentPlans = () =>
  useQuery({ queryKey: ['installment-plans'], queryFn: () => unwrap<InstallmentPlan[]>(api.get('/fees-advanced/plans')) });

export const useDefaulters = () =>
  useQuery({ queryKey: ['fee-defaulters'], queryFn: () => unwrap<Defaulters>(api.get('/fees-advanced/defaulters')) });

export const useCreateConcession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { studentId: string; name: string; type?: string; amount?: number; percent?: number; academicYear: string }) => api.post('/fees-advanced/concessions', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['concessions'] }),
  });
};

export const useCreatePlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { studentId: string; totalAmount: number; numInstallments: number; academicYear: string; firstDueDate?: string }) => api.post('/fees-advanced/plans', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['installment-plans'] }),
  });
};

export const usePayInstallment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (installmentId: string) => api.post(`/fees-advanced/installments/${installmentId}/pay`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['installment-plans'] }); qc.invalidateQueries({ queryKey: ['fee-defaulters'] }); },
  });
};
