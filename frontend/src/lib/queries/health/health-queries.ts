import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';

const unwrap = async <T>(p: Promise<{ data: { data: T } }>): Promise<T> => (await p).data.data;

export interface ClinicVisit {
  id: string;
  studentId: string;
  visitDate: string;
  symptoms?: string | null;
  diagnosis?: string | null;
  treatment?: string | null;
  attendedBy?: string | null;
  guardianNotified: boolean;
}

export interface VaccinationRecord {
  id: string;
  studentId: string;
  vaccineName: string;
  dateAdministered?: string | null;
  nextDue?: string | null;
  notes?: string | null;
}

export const useClinicVisits = (studentId?: string) =>
  useQuery({ queryKey: ['clinic-visits', studentId], queryFn: () => unwrap<ClinicVisit[]>(api.get('/health-module/visits', { params: { studentId } })) });

export const useVaccinations = (studentId?: string) =>
  useQuery({ queryKey: ['vaccinations', studentId], queryFn: () => unwrap<VaccinationRecord[]>(api.get('/health-module/vaccinations', { params: { studentId } })) });

export const useDueVaccinations = (days = 30) =>
  useQuery({ queryKey: ['vaccinations-due', days], queryFn: () => unwrap<VaccinationRecord[]>(api.get('/health-module/vaccinations/due', { params: { days } })) });

export const useRecordVisit = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { studentId: string; symptoms?: string; diagnosis?: string; treatment?: string; attendedBy?: string; notifyGuardian?: boolean }) =>
      api.post('/health-module/visits', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clinic-visits'] }),
  });
};

export const useAddVaccination = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { studentId: string; vaccineName: string; dateAdministered?: string; nextDue?: string; notes?: string }) =>
      api.post('/health-module/vaccinations', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vaccinations'] });
      qc.invalidateQueries({ queryKey: ['vaccinations-due'] });
    },
  });
};
