import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';

const unwrap = async <T>(p: Promise<{ data: { data: T } }>): Promise<T> => (await p).data.data;

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface Period {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  sequence: number;
  isBreak: boolean;
}

export interface TimetableSlot {
  id: string;
  sectionId: string;
  dayOfWeek: DayOfWeek;
  periodId: string;
  subjectName: string;
  teacherId?: string | null;
  room?: string | null;
  period?: Period;
}

export interface Substitution {
  id: string;
  slotId: string;
  date: string;
  originalTeacherId?: string | null;
  substituteTeacherId: string;
  reason?: string | null;
  status: string;
  slot?: { period?: Period };
}

export const usePeriods = () =>
  useQuery({ queryKey: ['tt-periods'], queryFn: () => unwrap<Period[]>(api.get('/timetable/periods')) });

export const useSectionTimetable = (sectionId: string) =>
  useQuery({ queryKey: ['tt-section', sectionId], queryFn: () => unwrap<TimetableSlot[]>(api.get(`/timetable/sections/${sectionId}`)), enabled: !!sectionId });

export const useSubstitutions = () =>
  useQuery({ queryKey: ['tt-subs'], queryFn: () => unwrap<Substitution[]>(api.get('/timetable/substitutions')) });

export const useCreatePeriod = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; startTime: string; endTime: string; sequence?: number }) => api.post('/timetable/periods', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tt-periods'] }),
  });
};

export const useSetSlot = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { sectionId: string; dayOfWeek: DayOfWeek; periodId: string; subjectName: string; teacherId?: string; room?: string }) => api.post('/timetable/slots', body),
    onSuccess: (_r, vars) => qc.invalidateQueries({ queryKey: ['tt-section', vars.sectionId] }),
  });
};

export const useCreateSubstitution = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { slotId: string; date: string; substituteTeacherId: string; reason?: string }) => api.post('/timetable/substitutions', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tt-subs'] }),
  });
};
