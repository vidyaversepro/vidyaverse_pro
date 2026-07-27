import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';

const unwrap = async <T>(p: Promise<{ data: { data: T } }>): Promise<T> => (await p).data.data;

export interface BiometricDevice {
  id: string;
  name: string;
  deviceCode: string;
  location?: string | null;
  deviceType: 'fingerprint' | 'rfid' | 'face';
  isActive: boolean;
  lastSeenAt?: string | null;
  _count?: { punches: number };
}

export interface StaffAttendanceResult {
  date: string;
  records: Array<{ id: string; staffId: string; status: string; checkIn?: string | null; checkOut?: string | null }>;
  summary: { present: number; absent: number; half_day: number; leave: number };
}

export const useBiometricDevices = () =>
  useQuery({ queryKey: ['biometric-devices'], queryFn: () => unwrap<BiometricDevice[]>(api.get('/biometric/devices')) });

export const useStaffAttendance = (date: string) =>
  useQuery({ queryKey: ['staff-attendance', date], enabled: !!date, queryFn: () => unwrap<StaffAttendanceResult>(api.get('/biometric/staff-attendance', { params: { date } })) });

export const useRegisterDevice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; deviceType?: string; location?: string }) => api.post('/biometric/devices', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['biometric-devices'] }),
  });
};

export const useMarkStaffAttendance = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { staffId: string; attendanceDate: string; status: string }) => api.post('/biometric/staff-attendance', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['staff-attendance'] }),
  });
};
