import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';
import { authClient } from '../../auth.client';
import { PaginatedResponse } from '../shared/types';

export interface Template {
    id: string;
    name: string;
    serviceType: string;
    templateType: string;
    widthMm: number;
    heightMm: number;
    orientation: string;
    description?: string;
    targetAudience?: string;
    content?: any;
    isDefault: boolean;
    isActive: boolean;
    version: number;
    createdAt: string;
}

export const useTemplates = (params?: Record<string, string | undefined>) => {
    return useQuery({
        queryKey: ['templates', params],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Template>>('/templates', { params });
            return response.data;
        },
    });
};

export const useSetDefaultTemplate = () => {
    return useMutation({
        mutationFn: async (id: string) => {
            const response = await api.patch<{ success: boolean; data: Template }>(`/templates/${id}/default`);
            return response.data;
        },
    });
};

export const useTemplate = (id: string, options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: ['template', id],
        queryFn: async () => {
            const response = await api.get<{ success: boolean; data: Template }>(`/templates/${id}`);
            return response.data.data;
        },
        enabled: options?.enabled !== false && !!id,
    });
};

export const useUpdateTemplate = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Template> & { content?: any } }) => {
            const response = await api.patch<{ success: boolean; data: Template }>(`/templates/${id}`, data);
            return response.data.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['templates'] });
            if (data?.id) {
                queryClient.invalidateQueries({ queryKey: ['template', data.id] });
            }
        },
    });
};

export const useCreateTemplate = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: Partial<Template> & { institutionId?: string }) => {
            const sessionResult = await authClient.getSession();
            const sessionData = sessionResult?.data;
            const fallbackInstitutionId = (sessionData?.session as any)?.activeInstitutionId 
                ?? (sessionData?.session as any)?.institutionId 
                ?? (sessionData?.user as any)?.institutionId;
                
            const payload = {
                ...data,
                institutionId: data.institutionId ?? fallbackInstitutionId
            };
            
            const response = await api.post<{ success: boolean; data: Template }>('/templates', payload);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['templates'] }); // Assuming templateKeys.lists() is not defined, keeping original for now.
        },
        onError: (error: unknown) => {
            throw error; // Re-throw so component can show a toast
        }
    });
};

export const useUploadTemplateAsset = () => {
    return useMutation({
        mutationFn: async ({ id, file }: { id: string; file: File }) => {
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await api.post<{ success: boolean; data: { url: string } }>(
                `/templates/${id}/assets`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            return response.data.data.url;
        },
    });
};

export const useDeleteTemplate = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const response = await api.delete<{ success: boolean; message: string }>(`/templates/${id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['templates'] });
        },
    });
};

export const useDuplicateTemplate = () => {
    const queryClient = useQueryClient();
    const createTemplate = useCreateTemplate();
    const { mutateAsync } = createTemplate;
    
    return useMutation({
        mutationFn: async (id: string) => {
            const response = await api.get<{ success: boolean; data: Template }>(`/templates/${id}`);
            const originalTemplate = response.data.data;
            
            const newTemplateData = {
                name: `${originalTemplate.name} (Copy)`,
                serviceType: originalTemplate.serviceType,
                templateType: originalTemplate.templateType,
                widthMm: originalTemplate.widthMm,
                heightMm: originalTemplate.heightMm,
                orientation: originalTemplate.orientation,
                description: originalTemplate.description,
                targetAudience: originalTemplate.targetAudience,
                content: originalTemplate.content,
                institutionId: (originalTemplate as any).institutionId
            };
            
            return await mutateAsync(newTemplateData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['templates'] });
        },
    });
};
