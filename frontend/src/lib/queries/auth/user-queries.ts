import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';

export interface User {
    id: string;
    email: string;
    name: string;
    phone?: string;
    globalRole: 'super_admin' | 'support' | null;
    isActive: boolean;
    isVerified: boolean;
    lastLoginAt?: string;
    createdAt: string;
    institutionRoles?: {
        institutionId: string;
        role: string;
        institution: { name: string };
    }[];
}

export interface UserFilters {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    institutionId?: string;
    status?: string;
}

export interface UserStats {
    totalUsers: number;
    superAdmins: number;
    activeToday: number;
}

export const useUserStats = () => {
    return useQuery({
        queryKey: ['user-stats'],
        queryFn: async () => {
            const response = await api.get<{ data: UserStats }>('/user/stats');
            return response.data;
        },
    });
};

export const useUsers = (filters: UserFilters) => {
    return useQuery({
        queryKey: ['users', filters],
        queryFn: async () => {
            const response = await api.get<{ data: User[]; pagination: any }>('/user', {
                params: filters,
            });
            return response.data;
        },
        placeholderData: (previousData) => previousData,
    });
};

export const useTeachers = (institutionId: string) => {
    return useQuery({
        queryKey: ['teachers', institutionId],
        queryFn: async () => {
            const response = await api.get<{ data: User[]; pagination: any }>('/user', {
                params: { role: 'teacher', institutionId, limit: 100 },
            });
            return response.data.data;
        },
        enabled: !!institutionId,
    });
};

export const useCreateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            return api.post('/user', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            return api.patch(`/user/${id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};

export const useAssignRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { userId: string; institutionId: string; role: string }) => {
            return api.post('/user/assign-role', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            return api.delete(`/user/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};
