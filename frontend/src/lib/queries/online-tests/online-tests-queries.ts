import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';

const unwrap = async <T>(p: Promise<{ data: { data: T } }>): Promise<T> => (await p).data.data;

export interface QuestionBankItem {
  id: string;
  subject: string;
  topic?: string | null;
  questionText: string;
  type: 'mcq' | 'true_false' | 'short_answer';
  options?: Array<{ key: string; text: string }> | null;
  correctOption?: string | null;
  marks: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface OnlineTest {
  id: string;
  title: string;
  subject?: string | null;
  questionIds: string[];
  totalMarks: number;
  durationMins: number;
  status: 'draft' | 'published' | 'closed';
  _count?: { attempts: number };
}

export interface OnlineTestAttempt {
  id: string;
  studentId: string;
  score?: number | null;
  maxScore: number;
  status: 'in_progress' | 'submitted' | 'graded';
  submittedAt?: string | null;
}

export const useQuestionBank = (subject?: string) =>
  useQuery({ queryKey: ['qbank', subject], queryFn: () => unwrap<QuestionBankItem[]>(api.get('/online-tests/questions', { params: subject ? { subject } : {} })) });

export const useOnlineTests = () =>
  useQuery({ queryKey: ['online-tests'], queryFn: () => unwrap<OnlineTest[]>(api.get('/online-tests/tests')) });

export const useTestAttempts = (testId?: string) =>
  useQuery({ queryKey: ['test-attempts', testId], enabled: !!testId, queryFn: () => unwrap<OnlineTestAttempt[]>(api.get(`/online-tests/tests/${testId}/attempts`)) });

export const useCreateQuestion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<QuestionBankItem> & { subject: string; questionText: string }) => api.post('/online-tests/questions', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['qbank'] }),
  });
};

export const useCreateTest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { title: string; subject?: string; questionIds: string[]; durationMins?: number }) => api.post('/online-tests/tests', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['online-tests'] }),
  });
};

export const useSetTestStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.post(`/online-tests/tests/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['online-tests'] }),
  });
};
