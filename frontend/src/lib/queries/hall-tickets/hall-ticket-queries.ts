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
    return useMutation({
        mutationFn: async ({ institutionId, data }: { institutionId: string; data: { studentId: string; examScheduleId: string; templateId?: string } }) => {
            const response = await api.post('/hall-tickets/generate', data, {
                headers: { 'x-institution-id': institutionId },
                responseType: 'blob', // Important for receiving binary data
            });
            
            // Create a blob URL and trigger download
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `HallTicket_${data.studentId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            return response.data;
        },
    });
};

export const useBulkGenerateHallTickets = () => {
    return useMutation({
        mutationFn: async ({ institutionId, data }: { institutionId: string; data: { studentIds: string[]; examScheduleId: string; templateId?: string } }) => {
            const response = await api.post('/hall-tickets/generate/bulk', data, {
                headers: { 'x-institution-id': institutionId },
                responseType: 'blob', // Expected a ZIP file
            });
            
            // Create a blob URL and trigger download
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/zip' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `HallTickets_Bulk.zip`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            return response.data;
        },
    });
};
