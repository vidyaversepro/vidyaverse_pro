import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';
import { PaginatedResponse } from '../shared/types';

export interface IdCard {
    id: string;
    studentId: string;
    pdfUrl: string;
    thumbnailUrl: string;
    /** Rendered card-front image (PNG) returned by the API as a presigned URL. */
    cardFrontUrl?: string;
    academicYear: string;
    status: string;
    student: {
        id: string;
        admissionNo: string;
        name: string;
        photoUrl?: string;
        section?: {
            name: string;
            class: { name: string };
        };
    };
    createdAt: string;
}

export const useIdCards = (params?: Record<string, string>) => {
    return useQuery({
        queryKey: ['id-cards', params],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<IdCard>>('/id-cards', { params });
            return response.data;
        },
    });
};

export const useGenerateIdCard = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { studentId: string; templateId?: string }) => {
            const response = await api.post('/id-cards/generate', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['id-cards'] });
        },
    });
};

export const useGenerateBulkIdCards = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { classId?: string; streamId?: string; sectionId?: string; templateId: string; institutionId?: string }) => {
            const response = await api.post('/id-cards/generate-bulk', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['id-cards'] });
        },
    });
};

export const useUpdateIdCard = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const response = await api.patch(`/id-cards/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['id-cards'] });
        },
    });
};

export const useDeleteIdCard = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/id-cards/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['id-cards'] });
        },
    });
};
