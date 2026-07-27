import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';

const unwrap = async <T>(p: Promise<{ data: { data: T } }>): Promise<T> => (await p).data.data;

export interface Alumnus {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  graduationYear?: number | null;
  currentOrganization?: string | null;
  designation?: string | null;
  location?: string | null;
  willingToMentor: boolean;
}

export interface AlumniEvent {
  id: string;
  title: string;
  eventDate: string;
  venue?: string | null;
  rsvpCount: number;
}

export interface AlumniStats {
  total: number;
  mentors: number;
  byYear: Array<{ year: number | null; count: number }>;
}

export const useAlumni = (mentorsOnly = false) =>
  useQuery({ queryKey: ['alumni', mentorsOnly], queryFn: () => unwrap<Alumnus[]>(api.get('/alumni', { params: { mentorsOnly } })) });

export const useAlumniStats = () =>
  useQuery({ queryKey: ['alumni-stats'], queryFn: () => unwrap<AlumniStats>(api.get('/alumni/stats')) });

export const useAlumniEvents = () =>
  useQuery({ queryKey: ['alumni-events'], queryFn: () => unwrap<AlumniEvent[]>(api.get('/alumni/events')) });

export const useCreateAlumnus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; graduationYear?: number; currentOrganization?: string; designation?: string; email?: string; phone?: string; willingToMentor?: boolean }) => api.post('/alumni', body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['alumni'] }); qc.invalidateQueries({ queryKey: ['alumni-stats'] }); },
  });
};

export const useCreateAlumniEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { title: string; eventDate: string; venue?: string }) => api.post('/alumni/events', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alumni-events'] }),
  });
};
