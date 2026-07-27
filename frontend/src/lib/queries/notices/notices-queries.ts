import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';

const unwrap = async <T>(p: Promise<{ data: { data: T } }>): Promise<T> => (await p).data.data;

export interface Notice {
  id: string;
  title: string;
  body: string;
  audience: 'all' | 'staff' | 'students' | 'parents';
  category: 'circular' | 'event' | 'holiday' | 'exam';
  isPinned: boolean;
  status: 'draft' | 'published' | 'archived';
  publishedAt: string;
  expiresAt?: string | null;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string | null;
  eventType: 'holiday' | 'exam' | 'event' | 'meeting';
  eventDate: string;
  endDate?: string | null;
  allDay: boolean;
}

export const useNotices = () =>
  useQuery({ queryKey: ['notices'], queryFn: () => unwrap<Notice[]>(api.get('/notices/notices')) });

export const useUpcomingEvents = (days = 30) =>
  useQuery({ queryKey: ['calendar-upcoming', days], queryFn: () => unwrap<CalendarEvent[]>(api.get('/notices/events/upcoming', { params: { days } })) });

export const useCreateNotice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { title: string; body: string; audience?: string; category?: string; isPinned?: boolean; expiresAt?: string }) => api.post('/notices/notices', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notices'] }),
  });
};

export const useArchiveNotice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/notices/notices/${id}/archive`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notices'] }),
  });
};

export const useCreateEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { title: string; eventType?: string; eventDate: string; description?: string }) => api.post('/notices/events', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['calendar-upcoming'] }),
  });
};
