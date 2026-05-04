import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';

export interface TransferCertificate {
    id: string;
    institutionId: string;
    studentId: string;
    tcNumber: string;
    issueDate?: string;
    leavingReason?: string;
    conduct?: string;
    attendance?: string;
    status: 'draft' | 'issued' | 'cancelled';
    pdfUrl?: string;
    cancellationReason?: string;
    student?: {
        id: string;
        name: string;
        admissionNumber?: string;
        rollNo: number;
        photoUrl?: string;
        section?: {
            name: string;
            class: { name: string };
        };
    };
    createdAt: string;
    updatedAt: string;
}

export const useTransferCertificates = (params?: Record<string, any>) => {
    return useQuery({
        queryKey: ['transfer-certificates', params],
        queryFn: async () => {
            const response = await api.get<{ success: boolean; data: TransferCertificate[]; pagination: any }>('/transfer-certificates', { params });
            return {
                data: response.data.data,
                meta: response.data.pagination
            };
        },
    });
};

export const useTransferCertificate = (id: string, enabled = true) => {
    return useQuery({
        queryKey: ['transfer-certificate', id],
        queryFn: async () => {
            const response = await api.get<{ success: boolean; data: TransferCertificate }>(`/transfer-certificates/${id}`);
            return response.data.data;
        },
        enabled: enabled && !!id,
    });
};

export const useGenerateTransferCertificate = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ institutionId, data }: { institutionId: string; data: { studentId: string; leavingReason?: string; conduct?: string; attendance?: string; templateId?: string } }) => {
            const response = await api.post('/transfer-certificates/generate', data, {
                headers: { 'x-institution-id': institutionId },
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transfer-certificates'] });
        },
    });
};

export const useBulkGenerateTransferCertificates = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ institutionId, data }: { institutionId: string; data: { studentIds: string[]; templateId?: string } }) => {
            const response = await api.post('/transfer-certificates/generate/bulk', data, {
                headers: { 'x-institution-id': institutionId },
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transfer-certificates'] });
        },
    });
};

export const useIssueTransferCertificate = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, institutionId }: { id: string; institutionId: string }) => {
            const response = await api.post(`/transfer-certificates/${id}/issue`, {}, {
                headers: { 'x-institution-id': institutionId },
            });
            return response.data;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['transfer-certificates'] });
            queryClient.invalidateQueries({ queryKey: ['transfer-certificate', id] });
        },
    });
};

export const useCancelTransferCertificate = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, institutionId, reason }: { id: string; institutionId: string; reason: string }) => {
            const response = await api.post(`/transfer-certificates/${id}/cancel`, { reason }, {
                headers: { 'x-institution-id': institutionId },
            });
            return response.data;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['transfer-certificates'] });
            queryClient.invalidateQueries({ queryKey: ['transfer-certificate', id] });
        },
    });
};
