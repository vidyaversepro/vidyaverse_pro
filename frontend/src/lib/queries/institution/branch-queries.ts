import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';
import { PaginatedResponse } from '../shared/types';

export interface Branch {
    id: string;
    institutionId: string;
    name: string;
    code: string;
    address?: string;
    contactEmail?: string;
    contactPhone?: string;
    isActive: boolean;
    _count?: { classes: number; students: number };
    createdAt: string;
    updatedAt: string;
}

export const useBranches = (params?: Record<string, string>) => {
    return useQuery({
        queryKey: ['branches', params],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Branch>>('/branch', { params });
            return response.data;
        },
    });
};

export const useCreateBranch = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: Partial<Branch>) => {
            const response = await api.post('/branch', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['branches'] });
        },
    });
};

export const useUpdateBranch = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Branch> }) => {
            const response = await api.patch(`/branch/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['branches'] });
        },
    });
};

export const useDeleteBranch = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/branch/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['branches'] });
        },
    });
};
