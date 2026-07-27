import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';

const unwrap = async <T>(p: Promise<{ data: { data: T } }>): Promise<T> => (await p).data.data;

export interface Assignment {
  id: string;
  sectionId: string;
  subjectName: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  maxMarks?: string | null;
  status: 'draft' | 'published' | 'closed';
  _count?: { submissions: number };
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  content?: string | null;
  marksObtained?: string | null;
  feedback?: string | null;
  status: 'submitted' | 'graded' | 'late';
  submittedAt: string;
}

export const useAssignments = (sectionId?: string) =>
  useQuery({ queryKey: ['assignments', sectionId], queryFn: () => unwrap<Assignment[]>(api.get('/assignments', { params: { sectionId } })) });

export const useSubmissions = (assignmentId?: string) =>
  useQuery({ queryKey: ['assignment-submissions', assignmentId], enabled: !!assignmentId, queryFn: () => unwrap<Submission[]>(api.get(`/assignments/${assignmentId}/submissions`)) });

export const useCreateAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { sectionId: string; subjectName: string; title: string; description?: string; dueDate?: string; maxMarks?: number; publish?: boolean }) =>
      api.post('/assignments', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['assignments'] }),
  });
};

export const usePublishAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/assignments/${id}/publish`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['assignments'] }),
  });
};

export const useCloseAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/assignments/${id}/close`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['assignments'] }),
  });
};

export const useGradeSubmission = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ submissionId, ...body }: { submissionId: string; marksObtained: number; feedback?: string }) =>
      api.post(`/assignments/submissions/${submissionId}/grade`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['assignment-submissions'] }),
  });
};
