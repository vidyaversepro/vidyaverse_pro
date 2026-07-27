import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';

const unwrap = async <T>(p: Promise<{ data: { data: T } }>): Promise<T> => (await p).data.data;

export type CceTermType = 'FA1' | 'FA2' | 'SA1' | 'FA3' | 'FA4' | 'SA2';

export interface CceAssessment {
  id: string;
  sectionId: string;
  subjectName: string;
  name: string;
  termType: CceTermType;
  maxMarks: string;
  weightage: number;
  conductedOn?: string | null;
  status: 'open' | 'locked';
  _count?: { marks: number };
}

export interface CceMark {
  id: string;
  assessmentId: string;
  studentId: string;
  marksObtained: string;
  grade?: string | null;
  remarks?: string | null;
}

export interface ReportCard {
  studentId: string;
  sectionId?: string;
  overallPercent?: number;
  overallGrade?: string;
  subjects: Array<{ subjectName: string; percent: number; grade: string; entries: Array<{ name: string; term: string; marks: number; max: number; grade: string | null }> }>;
}

export const useAssessments = (sectionId?: string) =>
  useQuery({ queryKey: ['cce-assessments', sectionId], queryFn: () => unwrap<CceAssessment[]>(api.get('/gradebook/assessments', { params: { sectionId } })) });

export const useAssessmentMarks = (assessmentId?: string) =>
  useQuery({ queryKey: ['cce-marks', assessmentId], enabled: !!assessmentId, queryFn: () => unwrap<CceMark[]>(api.get(`/gradebook/assessments/${assessmentId}/marks`)) });

export const useReportCard = (sectionId?: string, studentId?: string) =>
  useQuery({
    queryKey: ['cce-report-card', sectionId, studentId],
    enabled: !!sectionId && !!studentId,
    queryFn: () => unwrap<ReportCard>(api.get('/gradebook/report-card', { params: { sectionId, studentId } })),
  });

export const useCreateAssessment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { sectionId: string; subjectName: string; name: string; termType: CceTermType; maxMarks?: number; weightage?: number; conductedOn?: string }) =>
      api.post('/gradebook/assessments', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cce-assessments'] }),
  });
};

export const useEnterMark = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ assessmentId, ...body }: { assessmentId: string; studentId: string; marksObtained: number; remarks?: string }) =>
      api.post(`/gradebook/assessments/${assessmentId}/marks`, body),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['cce-marks', vars.assessmentId] });
      qc.invalidateQueries({ queryKey: ['cce-assessments'] });
    },
  });
};
