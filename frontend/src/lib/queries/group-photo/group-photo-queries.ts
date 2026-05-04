import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';

export interface GroupPhoto {
    id: string;
    name: string;
    eventName?: string;
    thumbnailUrl?: string;
    photoUrl: string;
    status: string;
    totalStudentsDetected: number;
    createdAt: string;
    class?: { name: string };
    section?: { name: string };
    _count?: { extractions: number };
}

export interface GroupPhotoFilters {
    page?: number;
    limit?: number;
    search?: string;
    institutionId?: string;
    status?: string;
}

export interface Face {
    id: string;
    groupPhotoId: string;
    studentId?: string;
    student?: { name: string; admissionNo: string };
    x: number;
    y: number;
    width: number;
    height: number;
    confidence: number;
    imageUrl?: string;
    isMatched: boolean;
}

export const useGroupPhotos = (filters: GroupPhotoFilters) => {
    return useQuery({
        queryKey: ['group-photos', filters],
        queryFn: async () => {
            const response = await api.get<{ data: GroupPhoto[]; pagination: any }>('/group-photo', {
                params: filters,
            });
            return response.data;
        },
        placeholderData: (previousData) => previousData,
    });
};

export const useCreateGroupPhoto = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            return api.post('/group-photo', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['group-photos'] });
        },
    });
};

export const useUpdateGroupPhoto = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            return api.patch(`/group-photo/${id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['group-photos'] });
        },
    });
};

export const useDeleteGroupPhoto = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            return api.delete(`/group-photo/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['group-photos'] });
        },
    });
};

export const useGroupPhotoFaces = (photoId: string) => {
    return useQuery({
        queryKey: ['group-photo-faces', photoId],
        queryFn: async () => {
            const response = await api.get<{ data: Face[] }>(`/group-photo/${photoId}/faces`);
            return response.data.data;
        },
        enabled: !!photoId,
    });
};

export const useUpdateFaceMapping = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, studentId }: { id: string; studentId: string }) => {
            return api.patch(`/group-photo/faces/${id}`, { studentId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['group-photo-faces'] });
        },
    });
};

export const useExtractFaces = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            return api.post(`/group-photo/${id}/extract`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['group-photos'] });
        },
    });
};
