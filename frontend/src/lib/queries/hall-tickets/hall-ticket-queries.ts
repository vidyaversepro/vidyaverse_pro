import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';
import type {
    ExamScheduleCreateInput,
    ExamScheduleUpdateInput,
    ExamSubjectCreateInput,
} from '@vidyaverse/shared-validation';

export interface ExamSubject {
    id: string;
    examScheduleId: string;
    subjectName: string;
    subjectCode?: string;
    examDate: string;
    startTime: string;
    durationMinutes: number;
    venue?: string;
    maxMarks: number;
}

export interface ExamSchedule {
    id: string;
    institutionId: string;
    examName: string;
    examType: string;
    academicYear?: string;
    startDate: string;
    endDate: string;
    instructions?: string;
    reportingTime?: string;
    status: 'draft' | 'published' | 'completed' | 'cancelled';
    subjects?: ExamSubject[];
    _count?: {
        subjects: number;
        hallTickets: number;
    };
    createdAt: string;
    updatedAt: string;
}

// ============================================================================
// EXAM SCHEDULES
// ============================================================================

export const useExamSchedules = (params?: Record<string, string>) => {
    return useQuery({
        queryKey: ['exam-schedules', params],
        queryFn: async () => {
            const response = await api.get<{ success: boolean; data: ExamSchedule[] }>('/hall-tickets/exam-schedules', { params });
            return response.data.data;
        },
    });
};

export const useExamSchedule = (id: string, enabled = true) => {
    return useQuery({
        queryKey: ['exam-schedule', id],
        queryFn: async () => {
            const response = await api.get<{ success: boolean; data: ExamSchedule }>(`/hall-tickets/exam-schedules/${id}`);
            return response.data.data;
        },
        enabled: enabled && !!id,
    });
};

export const useCreateExamSchedule = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: ExamScheduleCreateInput) => {
            const response = await api.post('/hall-tickets/exam-schedules', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['exam-schedules'] });
        },
    });
};

export const useUpdateExamSchedule = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: ExamScheduleUpdateInput }) => {
            const response = await api.patch(`/hall-tickets/exam-schedules/${id}`, data);
            return response.data;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['exam-schedules'] });
            queryClient.invalidateQueries({ queryKey: ['exam-schedule', id] });
        },
    });
};

export const usePublishExamSchedule = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const response = await api.post(`/hall-tickets/exam-schedules/${id}/publish`);
            return response.data;
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['exam-schedules'] });
            queryClient.invalidateQueries({ queryKey: ['exam-schedule', id] });
        },
    });
};

export const useAddExamSubject = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: ExamSubjectCreateInput) => {
            const response = await api.post('/hall-tickets/exam-schedules/subjects', data);
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['exam-schedules'] });
            queryClient.invalidateQueries({ queryKey: ['exam-schedule', variables.examScheduleId] });
        },
    });
};

export const useGenerateHallTicket = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ institutionId, data }: { institutionId: string; data: { studentId: string; examScheduleId: string; templateId?: string } }) => {
            const response = await api.post('/hall-tickets/generate', data, {
                headers: { 'x-institution-id': institutionId },
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hall-tickets'] });
        },
    });
};

export const useBulkGenerateHallTickets = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ institutionId, data }: { institutionId: string; data: { studentIds: string[]; examScheduleId: string; templateId?: string } }) => {
            const response = await api.post('/hall-tickets/generate/bulk', data, {
                headers: { 'x-institution-id': institutionId },
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hall-tickets'] });
        },
    });
};

export interface HallTicket {
    id: string;
    institutionId: string;
    studentId: string;
    examScheduleId: string;
    hallTicketNumber: string;
    status: 'generated' | 'sent';
    pdfUrl?: string;
    student?: {
        id: string;
        name: string;
        admissionNumber?: string;
        photoUrl?: string;
        section?: {
            name: string;
            class: { name: string };
        };
    };
    examSchedule?: {
        examName: string;
        examType: string;
        academicYear?: string;
    };
    createdAt: string;
    updatedAt: string;
}

export const useHallTickets = (params?: Record<string, any>) => {
    return useQuery({
        queryKey: ['hall-tickets', params],
        queryFn: async () => {
            const response = await api.get<{ success: boolean; data: HallTicket[]; pagination: any }>('/hall-tickets', { params });
            return {
                data: response.data.data,
                meta: response.data.pagination
            };
        },
    });
};

export const useIssueHallTicket = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, institutionId }: { id: string; institutionId: string }) => {
            const response = await api.post(`/hall-tickets/${id}/issue`, {}, {
                headers: { 'x-institution-id': institutionId },
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hall-tickets'] });
        },
    });
};
