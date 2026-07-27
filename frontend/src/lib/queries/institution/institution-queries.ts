import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';

export interface Institution {
    id: string;
    name: string;
    code: string;
    institutionType: string;
    academicYear: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    address: string | null;
    subscriptionTier: 'starter' | 'professional' | 'enterprise';
    subscriptionStatus: 'trial' | 'active' | 'suspended' | 'cancelled';
    isActive: boolean;
    onboardingCompleted: boolean;
    // Branding (used on generated documents like ID cards / certificates)
    logoUrl?: string | null;
    darkLogoUrl?: string | null;
    signatureUrl?: string | null;
    sealUrl?: string | null;
    signatureTitle?: string | null;
    createdAt: string;
    updatedAt: string;
    _count?: {
        students: number;
    };
}

export interface InstitutionFilters {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    tier?: string;
}

export const useInstitution = (id?: string) => {
    return useQuery({
        queryKey: ['institution', id],
        queryFn: async () => {
            const response = await api.get(`/institution/${id}`);
            return response.data.data as Institution;
        },
        enabled: !!id,
    });
};

export const useInstitutions = (filters: InstitutionFilters) => {
    return useQuery({
        queryKey: ['institutions', filters],
        queryFn: async () => {
            const response = await api.get<{ data: Institution[]; pagination: any }>('/institution', {
                params: filters,
            });
            return response.data;
        },
        placeholderData: (previousData) => previousData,
    });
};

export const checkInstitutionUniqueness = async (
    code?: string,
    adminEmail?: string,
    contactEmail?: string,
    excludeInstitutionId?: string
) => {
    const response = await api.get('/institution/check-uniqueness', {
        params: { code, adminEmail, contactEmail, excludeInstitutionId },
    });
    return response.data as { isValid: boolean; errors: Record<string, string> };
};

export const useCreateInstitution = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            return api.post('/institution', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['institutions'] });
        },
    });
};

export const useUpdateInstitution = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            return api.patch(`/institution/${id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['institutions'] });
        },
    });
};

export const useDeleteInstitution = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            return api.delete(`/institution/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['institutions'] });
        },
    });
};

/**
 * Upload institution branding (logo / dark logo / principal signature / seal)
 * and/or set the signature title. Send a FormData with any of:
 *   logo, darkLogo, signature, seal (files) and signatureTitle (text).
 */
export const useUpdateBranding = (id: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (formData: FormData) => {
            const res = await api.post(`/institution/${id}/branding`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return res.data.data as Institution;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['institution', id] });
            queryClient.invalidateQueries({ queryKey: ['institutions'] });
        },
    });
};

// ── Signing authorities (Principal/Dean/etc.) — the canonical source of
//    signatures used on ID cards & certificates ───────────────────────────────
export interface Authority {
    id: string;
    name: string;
    designation: string;
    roleType: string;
    email?: string | null;
    phone?: string | null;
    signatureUrl?: string | null;
    displayOrder: number;
}

export const useAuthorities = (institutionId?: string) =>
    useQuery({
        queryKey: ['authorities', institutionId],
        queryFn: async () => {
            const res = await api.get(`/institution/${institutionId}/authorities`);
            return res.data.data as Authority[];
        },
        enabled: !!institutionId,
    });

export const useCreateAuthority = (institutionId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (formData: FormData) => {
            const res = await api.post(`/institution/${institutionId}/authorities`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return res.data.data as Authority;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['authorities', institutionId] }),
    });
};

export const useUpdateAuthority = (institutionId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ authorityId, formData }: { authorityId: string; formData: FormData }) => {
            const res = await api.patch(`/institution/${institutionId}/authorities/${authorityId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return res.data.data as Authority;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['authorities', institutionId] }),
    });
};

export const useDeleteAuthority = (institutionId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (authorityId: string) => {
            await api.delete(`/institution/${institutionId}/authorities/${authorityId}`);
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['authorities', institutionId] }),
    });
};

// Classes API
export const useClasses = (institutionId?: string) => {
    return useQuery({
        queryKey: ['classes', institutionId],
        queryFn: async () => {
            const response = await api.get('/class', { params: { institutionId } });
            return response.data.data;
        },
        enabled: !!institutionId,
    });
};

export const useCreateClass = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { institutionId: string; name: string; displayOrder?: number; streamsEnabled?: boolean }) => {
            const response = await api.post('/class', data);
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['classes', variables.institutionId] });
        },
    });
};

export const useUpdateClass = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { id: string; institutionId: string; streamsEnabled?: boolean; name?: string }) => {
            const { id, institutionId, ...body } = data;
            const response = await api.patch(`/class/${id}`, body, { headers: { 'x-institution-id': institutionId } });
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['classes', variables.institutionId] });
        },
    });
};

export const useDeleteClass = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { id: string; institutionId: string }) => {
            const response = await api.delete(`/class/${data.id}`, { headers: { 'x-institution-id': data.institutionId } });
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['classes', variables.institutionId] });
        },
    });
};

// Streams API
export const useStreams = (classId?: string, institutionId?: string) => {
    return useQuery({
        queryKey: ['streams', classId, institutionId],
        queryFn: async () => {
            const response = await api.get('/stream', { params: { classId, institutionId } });
            return response.data.data;
        },
        enabled: !!classId,
    });
};

export const useCreateStream = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { institutionId: string; classId: string; name: string; description?: string }) => {
            const response = await api.post('/stream', data);
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['streams', variables.classId, variables.institutionId] });
        },
    });
};

export const useUpdateStream = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { id: string; institutionId: string; classId: string; name?: string; description?: string }) => {
            const { id, institutionId, classId, ...body } = data;
            const response = await api.patch(`/stream/${id}`, body, { headers: { 'x-institution-id': institutionId } });
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['streams', variables.classId, variables.institutionId] });
        },
    });
};

export const useDeleteStream = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { id: string; classId: string; institutionId: string }) => {
            const response = await api.delete(`/stream/${data.id}`, { headers: { 'x-institution-id': data.institutionId } });
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['streams', variables.classId, variables.institutionId] });
        },
    });
};

// Sections API
export const useSections = (classId?: string, institutionId?: string, streamId?: string) => {
    return useQuery({
        queryKey: ['sections', classId, streamId, institutionId],
        queryFn: async () => {
            const response = await api.get('/section', { params: { classId, streamId, institutionId } });
            return response.data.data;
        },
        enabled: !!classId,
    });
};

export const useCreateSection = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { institutionId: string; classId: string; streamId?: string; name: string; expectedStudentCount?: number }) => {
            const response = await api.post('/section', data);
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['sections', variables.classId, variables.streamId, variables.institutionId] });
        },
    });
};

export const useCreateBulkSections = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { institutionId: string; classId: string; streamId?: string; name: string; expectedStudentCount?: number; classTeacherId?: string }[]) => {
            const response = await api.post('/section/bulk', data);
            return response.data;
        },
        onSuccess: (_, variables) => {
            if (variables.length > 0) {
                const first = variables[0];
                queryClient.invalidateQueries({ queryKey: ['sections', first.classId, first.streamId, first.institutionId] });
            }
        },
    });
};

export const useUpdateSection = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { id: string; institutionId: string; classId: string; streamId?: string; name?: string; expectedStudentCount?: number }) => {
            const { id, institutionId, classId, streamId, ...body } = data;
            const response = await api.patch(`/section/${id}`, body, { headers: { 'x-institution-id': institutionId } });
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['sections', variables.classId, variables.streamId, variables.institutionId] });
        },
    });
};

export const useDeleteSection = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { id: string; classId: string; streamId?: string; institutionId: string }) => {
            const response = await api.delete(`/section/${data.id}`, { headers: { 'x-institution-id': data.institutionId } });
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['sections', variables.classId, variables.streamId, variables.institutionId] });
        },
    });
};
