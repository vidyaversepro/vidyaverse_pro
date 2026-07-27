import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';

const unwrap = async <T>(p: Promise<{ data: { data: T } }>): Promise<T> => (await p).data.data;

export type EnquiryStatus = 'new' | 'contacted' | 'visited' | 'application' | 'admitted' | 'lost';
export type EnquirySource = 'walk_in' | 'website' | 'referral' | 'whatsapp' | 'phone' | 'social' | 'other';
export type EnquiryActivityType = 'created' | 'note' | 'call' | 'visit' | 'whatsapp' | 'status_change' | 'converted';

export interface EnquiryActivity {
  id: string;
  institutionId: string;
  enquiryId: string;
  type: EnquiryActivityType;
  description: string;
  createdByUserId: string | null;
  createdAt: string;
}

export interface Enquiry {
  id: string;
  enquiryNumber: string;
  studentName: string;
  guardianName?: string | null;
  phone: string;
  email?: string | null;
  classInterested?: string | null;
  classId?: string | null;
  source: EnquirySource;
  status: EnquiryStatus;
  assignedToUserId?: string | null;
  followUpAt?: string | null;
  notes?: string | null;
  convertedStudentId?: string | null;
  createdAt: string;
  activities?: EnquiryActivity[];
}

export interface PipelineStats {
  total: number;
  byStatus: Record<EnquiryStatus, number>;
}

export const useEnquiries = (params?: Record<string, string>) =>
  useQuery({ queryKey: ['admissions-enquiries', params], queryFn: () => unwrap<Enquiry[]>(api.get('/admissions/enquiries', { params })) });

export const usePipelineStats = () =>
  useQuery({ queryKey: ['admissions-stats'], queryFn: () => unwrap<PipelineStats>(api.get('/admissions/stats')) });

export const useEnquiry = (id: string | null) =>
  useQuery({
    queryKey: ['admissions-enquiry', id],
    queryFn: () => unwrap<Enquiry>(api.get(`/admissions/enquiries/${id}`)),
    enabled: !!id,
  });

export const useCreateEnquiry = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Enquiry>) => api.post('/admissions/enquiries', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admissions-enquiries'] });
      qc.invalidateQueries({ queryKey: ['admissions-stats'] });
    },
  });
};

export const useUpdateEnquiry = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Partial<Enquiry>) => api.patch(`/admissions/enquiries/${id}`, body),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['admissions-enquiries'] });
      qc.invalidateQueries({ queryKey: ['admissions-enquiry', vars.id] });
      qc.invalidateQueries({ queryKey: ['admissions-stats'] });
    },
  });
};

export const useAddActivity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, type, description }: { id: string; type?: EnquiryActivityType; description: string }) =>
      api.post(`/admissions/enquiries/${id}/activities`, { type, description }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['admissions-enquiry', vars.id] });
    },
  });
};

export const useConvertToStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, sectionId }: { id: string; sectionId: string }) =>
      api.post<{ data: { ok: boolean; reason?: string; studentId: string } }>(`/admissions/enquiries/${id}/convert`, { sectionId }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['admissions-enquiries'] });
      qc.invalidateQueries({ queryKey: ['admissions-enquiry', vars.id] });
      qc.invalidateQueries({ queryKey: ['admissions-stats'] });
    },
  });
};
