import { useQuery } from '@tanstack/react-query';
import { api } from '../../api';

const unwrap = async <T>(p: Promise<{ data: { data: T } }>): Promise<T> => (await p).data.data;

export interface ReportsOverview {
  activeStudents: number;
  staffCount: number;
  feeCollected: number;
  feeOutstanding: number;
  totalEnquiries: number;
}

export interface FeeCollection {
  invoiceCount: number;
  billed: number;
  collected: number;
  outstanding: number;
  collectionRate: number;
  byStatus: Array<{ status: string; count: number; billed: number }>;
}

export interface AdmissionsFunnel {
  total: number;
  byStatus: Record<string, number>;
  conversionRate: number;
}

export const useReportsOverview = () =>
  useQuery({ queryKey: ['reports-overview'], queryFn: () => unwrap<ReportsOverview>(api.get('/reports/overview')) });

export const useFeeCollection = () =>
  useQuery({ queryKey: ['reports-fee'], queryFn: () => unwrap<FeeCollection>(api.get('/reports/fee-collection')) });

export const useAdmissionsFunnel = () =>
  useQuery({ queryKey: ['reports-funnel'], queryFn: () => unwrap<AdmissionsFunnel>(api.get('/reports/admissions-funnel')) });

export const useStaffByDepartment = () =>
  useQuery({ queryKey: ['reports-staff'], queryFn: () => unwrap<Array<{ department: string; count: number }>>(api.get('/reports/staff-by-department')) });

export const useStudentsByStatus = () =>
  useQuery({ queryKey: ['reports-students'], queryFn: () => unwrap<Array<{ status: string; count: number }>>(api.get('/reports/students-by-status')) });
