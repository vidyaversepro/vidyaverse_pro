import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';
import { PaginatedResponse } from '../shared/types';

export interface Certificate {
    id: string;
    studentId: string;
    certificateNo: string;
    certificateType: string;
    title: string;
    description?: string;
    eventName?: string;
    position?: string;
    pdfUrl: string;
    thumbnailUrl: string;
    status: string;
    student: {
        id: string;
        admissionNo: string;
        firstName: string;
        lastName: string;
        photoUrl?: string;
        section?: {
            name: string;
            class: { name: string };
        };
    };
    createdAt: string;
}

export const useCertificates = (params?: Record<string, string>) => {
    return useQuery({
        queryKey: ['certificates', params],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Certificate>>('/certificates', { params });
            return response.data;
        },
    });
};

export const useCreateCertificate = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: {
            studentId: string;
            templateId?: string;
            certificateType: string;
            title: string;
            description?: string;
            eventName?: string;
            eventDate?: string;
            position?: string;
        }) => {
            const response = await api.post('/certificates', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['certificates'] });
        },
    });
};

export const useGenerateBulkCertificates = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: {
            studentIds: string[];
            templateId?: string;
            certificateType: string;
            title: string;
            description?: string;
            eventName?: string;
            eventDate?: string;
        }) => {
            const response = await api.post('/certificates/bulk', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['certificates'] });
        },
    });
};
