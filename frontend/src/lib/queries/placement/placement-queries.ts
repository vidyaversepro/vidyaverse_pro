import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';

const unwrap = async <T>(p: Promise<{ data: { data: T } }>): Promise<T> => (await p).data.data;

export interface PlacementDrive {
  id: string;
  companyName: string;
  role: string;
  packageLpa?: string | null;
  driveDate?: string | null;
  eligibilityCriteria?: string | null;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  _count?: { applications: number };
}

export interface PlacementApplication {
  id: string;
  driveId: string;
  studentId: string;
  status: 'applied' | 'shortlisted' | 'selected' | 'rejected';
  appliedAt: string;
}

export interface PlacementStats {
  drives: number;
  applications: number;
  selected: number;
  highestPackageLpa: number;
}

export const usePlacementDrives = () =>
  useQuery({ queryKey: ['placement-drives'], queryFn: () => unwrap<PlacementDrive[]>(api.get('/placement/drives')) });

export const usePlacementStats = () =>
  useQuery({ queryKey: ['placement-stats'], queryFn: () => unwrap<PlacementStats>(api.get('/placement/stats')) });

export const useDriveApplications = (driveId?: string) =>
  useQuery({ queryKey: ['placement-apps', driveId], enabled: !!driveId, queryFn: () => unwrap<PlacementApplication[]>(api.get(`/placement/drives/${driveId}/applications`)) });

export const useCreateDrive = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { companyName: string; role: string; packageLpa?: number; driveDate?: string; eligibilityCriteria?: string }) => api.post('/placement/drives', body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['placement-drives'] }); qc.invalidateQueries({ queryKey: ['placement-stats'] }); },
  });
};

export const useSetApplicationStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ applicationId, status }: { applicationId: string; status: string }) => api.post(`/placement/applications/${applicationId}/status`, { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['placement-apps'] }); qc.invalidateQueries({ queryKey: ['placement-stats'] }); },
  });
};
