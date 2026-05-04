import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';
import { PaginatedResponse } from '../shared/types';

export interface VisitingCard {
    id: string;
    studentId?: string;
    userId?: string;
    frontPdfUrl: string;
    thumbnailUrl: string;
    cardNumber: string;
    status: string;
    student?: {
        id: string;
        admissionNo: string;
        name: string;
        photoUrl?: string;
        section?: {
            name: string;
            class: { name: string };
        };
    };
    user?: {
        id: string;
        name: string;
        image?: string;
        email: string;
    };
    createdAt: string;
}

export const useVisitingCards = (params?: Record<string, string>) => {
    return useQuery({
        queryKey: ['visiting-cards', params],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<VisitingCard>>('/visiting-cards', { params });
            return response.data;
        },
    });
};

export const useCreateVisitingCard = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { studentId?: string; userId?: string; templateId?: string }) => {
            const response = await api.post('/visiting-cards', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['visiting-cards'] });
        },
    });
};

export const useGenerateBulkVisitingCards = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { studentIds?: string[]; userIds?: string[]; templateId?: string }) => {
            const response = await api.post('/visiting-cards/bulk', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['visiting-cards'] });
        },
    });
};

// If there's delete functionality in backend, otherwise might fail
export const useDeleteVisitingCard = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/visiting-cards/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['visiting-cards'] });
        },
    });
};
