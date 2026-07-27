import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';

const unwrap = async <T>(p: Promise<{ data: { data: T } }>): Promise<T> => (await p).data.data;

export interface OAuthClient {
  id: string;
  name: string;
  icon: string | null;
  clientId: string;
  redirectUrls: string[];
  type: string;
  disabled: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface OAuthClientWithSecret extends OAuthClient {
  clientSecret: string;
}

export interface CreateOAuthClientBody {
  name: string;
  redirectUrls: string[];
  type?: 'web' | 'native' | 'user-agent-based' | 'public';
  icon?: string;
  metadata?: Record<string, unknown>;
}

export const useOAuthClients = () =>
  useQuery({
    queryKey: ['oauth-clients'],
    queryFn: () => unwrap<OAuthClient[]>(api.get('/admin/oauth-clients')),
  });

export const useCreateOAuthClient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateOAuthClientBody) => {
      const res = await api.post('/admin/oauth-clients', body);
      return res.data.data as OAuthClientWithSecret;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['oauth-clients'] }),
  });
};

export const useRotateOAuthClient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (clientId: string) => {
      const res = await api.post(`/admin/oauth-clients/${clientId}/rotate`);
      return res.data.data as OAuthClientWithSecret;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['oauth-clients'] }),
  });
};

export const useDisableOAuthClient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (clientId: string) => api.post(`/admin/oauth-clients/${clientId}/disable`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['oauth-clients'] }),
  });
};

export const useEnableOAuthClient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (clientId: string) => api.post(`/admin/oauth-clients/${clientId}/enable`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['oauth-clients'] }),
  });
};

export const useDeleteOAuthClient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (clientId: string) => api.delete(`/admin/oauth-clients/${clientId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['oauth-clients'] }),
  });
};
