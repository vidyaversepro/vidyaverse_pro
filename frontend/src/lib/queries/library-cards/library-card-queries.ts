import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';

export interface LibraryCard {
    id: string;
    institutionId: string;
    studentId: string;
    cardNumber: string;
    barcode?: string;
    issueDate: string;
    validUntil?: string;
    bloodGroup?: string;
    status: 'active' | 'suspended' | 'expired' | 'lost';
    pdfUrl?: string;
    student?: {
        id: string;
        name: string;
        admissionNumber?: string;
        rollNo: number;
        photoUrl?: string;
        contact?: string;
        section?: {
            name: string;
            class: { name: string };
        };
    };
    createdAt: string;
    updatedAt: string;
}

export const useLibraryCards = (params?: Record<string, any>) => {
    return useQuery({
        queryKey: ['library-cards', params],
        queryFn: async () => {
            const response = await api.get<{ success: boolean; data: LibraryCard[]; pagination: any }>('/library-cards', { params });
            // Our backend returns { success: true, data: [...], pagination: {...} }
            // Let's normalize it to PaginatedResponse format if needed, or just return as is
            return {
                data: response.data.data,
                meta: response.data.pagination
            };
        },
    });
};

export const useLibraryCard = (id: string, enabled = true) => {
    return useQuery({
        queryKey: ['library-card', id],
        queryFn: async () => {
            const response = await api.get<{ success: boolean; data: LibraryCard }>(`/library-cards/${id}`);
            return response.data.data;
        },
        enabled: enabled && !!id,
    });
};

export const useGenerateLibraryCard = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ institutionId, data }: { institutionId: string; data: { studentId: string; templateId?: string } }) => {
            const response = await api.post('/library-cards/generate', data, {
                headers: { 'x-institution-id': institutionId },
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['library-cards'] });
        },
    });
};

export const useBulkGenerateLibraryCards = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ institutionId, data }: { institutionId: string; data: { studentIds: string[]; templateId?: string } }) => {
            const response = await api.post('/library-cards/generate/bulk', data, {
                headers: { 'x-institution-id': institutionId },
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['library-cards'] });
        },
    });
};

export const useSuspendLibraryCard = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, institutionId }: { id: string; institutionId: string }) => {
            const response = await api.post(`/library-cards/${id}/suspend`, {}, {
                headers: { 'x-institution-id': institutionId },
            });
            return response.data;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['library-cards'] });
            queryClient.invalidateQueries({ queryKey: ['library-card', id] });
        },
    });
};

export const useReactivateLibraryCard = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, institutionId }: { id: string; institutionId: string }) => {
            const response = await api.post(`/library-cards/${id}/reactivate`, {}, {
                headers: { 'x-institution-id': institutionId },
            });
            return response.data;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['library-cards'] });
            queryClient.invalidateQueries({ queryKey: ['library-card', id] });
        },
    });
};
