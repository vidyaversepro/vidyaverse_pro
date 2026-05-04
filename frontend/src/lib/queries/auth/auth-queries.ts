import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';

// Profile & Password
export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { name?: string; phone?: string }) => {
            return api.patch('/auth/me', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
    });
};

export const useChangePassword = () => {
    return useMutation({
        mutationFn: async (data: any) => {
            return api.put('/auth/password', data);
        },
    });
};

// Notifications
export interface AppNotification {
    id: string;
    userId: string;
    institutionId: string;
    title: string;
    message: string;
    type: string;
    actionUrl?: string;
    isRead: boolean;
    readAt?: string;
    metadata?: Record<string, any>;
    createdAt: string;
}

export const useNotifications = (params?: { unreadOnly?: boolean; page?: number; limit?: number }) => {
    return useQuery({
        queryKey: ['notifications', params],
        queryFn: async () => {
            // Notification module is not yet registered on the backend.
            // Return empty data to prevent constant 404 errors.
            return {
                success: true,
                data: [] as AppNotification[],
                pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
                unreadCount: 0,
            };
        },
        refetchInterval: 30000,
    });
};

export const useMarkNotificationRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.post(`/notifications/my/${id}/read`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
};

export const useMarkAllNotificationsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            await api.post('/notifications/my/read-all');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
};

// Invitations
export const useValidateInvitation = (token: string) => {
    return useQuery({
        queryKey: ['invitation', 'validate', token],
        queryFn: async () => {
            const response = await api.post('/auth/invitation/validate', { token });
            return response.data.data as { email: string; institutionName: string; institutionId: string };
        },
        enabled: !!token,
        retry: false,
    });
};

export const useAcceptInvitation = () => {
    return useMutation({
        mutationFn: async (data: { token: string; name: string; password: string; phone?: string }) => {
            const response = await api.post('/auth/invitation/accept', data);
            return response.data.data as { userId: string; email: string; name: string };
        },
    });
};
