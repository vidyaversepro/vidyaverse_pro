import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';

const unwrap = async <T>(p: Promise<{ data: { data: T } }>): Promise<T> => (await p).data.data;

export interface LiveClass {
  id: string;
  sectionId: string;
  subjectName: string;
  title: string;
  platform: 'zoom' | 'meet' | 'jitsi' | 'other';
  joinUrl?: string | null;
  recordingUrl?: string | null;
  scheduledAt: string;
  durationMins: number;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
}

export const useLiveClasses = (upcoming = false) =>
  useQuery({ queryKey: ['live-classes', upcoming], queryFn: () => unwrap<LiveClass[]>(api.get('/live-classes', { params: { upcoming } })) });

export const useScheduleLiveClass = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { sectionId: string; subjectName: string; title: string; platform?: string; joinUrl?: string; scheduledAt: string; durationMins?: number }) => api.post('/live-classes', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['live-classes'] }),
  });
};

export const useSetLiveClassStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.post(`/live-classes/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['live-classes'] }),
  });
};
