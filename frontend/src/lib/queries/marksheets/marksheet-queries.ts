import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';
import type { BulkMarkEntryInput } from '@vidyaverse/shared-validation';

export interface MarkEntryRow {
    studentId: string;
    enrollmentNumber: string;
    rollNumber: string;
    studentName: string;
    marksObtained: number | null;
    practicalMarks: number | null;
    theoryMarks: number | null;
    markId: string | null;
}

export const marksheetKeys = {
    all: ['marksheets'] as const,
    marksGrid: (examScheduleId: string, sectionId: string, subjectId: string) =>
        [...marksheetKeys.all, 'marksGrid', examScheduleId, sectionId, subjectId] as const,
};

export const useMarksEntryGrid = (
    institutionId: string,
    examScheduleId: string,
    sectionId: string,
    subjectId: string
) => {
    return useQuery({
        queryKey: marksheetKeys.marksGrid(examScheduleId, sectionId, subjectId),
        queryFn: async () => {
            const { data } = await api.get<{ success: boolean; data: MarkEntryRow[] }>(
                '/marksheets/marks',
                {
                    params: { examScheduleId, sectionId, subjectId },
                    headers: { 'x-institution-id': institutionId },
                }
            );
            return data.data;
        },
        enabled: !!institutionId && !!examScheduleId && !!sectionId && !!subjectId,
    });
};

export const useSubjects = (classId?: string, institutionId?: string) => {
    return useQuery({
        queryKey: ['subjects', classId, institutionId],
        queryFn: async () => {
            const { data } = await api.get<{ success: boolean; data: any[] }>('/marksheets/subjects', {
                params: { classId },
                headers: { 'x-institution-id': institutionId },
            });
            return data.data;
        },
        enabled: !!classId && !!institutionId,
    });
};

export const useBulkMarkEntryMutation = (institutionId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: BulkMarkEntryInput) => {
            const { data } = await api.post('/marksheets/marks/bulk', payload, {
                headers: { 'x-institution-id': institutionId },
            });
            return data;
        },
        onSuccess: () => {
            // Invalidate marksGrid
            queryClient.invalidateQueries({ queryKey: marksheetKeys.all });
        },
    });
};
