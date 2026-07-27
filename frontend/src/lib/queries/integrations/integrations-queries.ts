import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';

const unwrap = async <T>(p: Promise<{ data: { data: T } }>): Promise<T> => (await p).data.data;

export interface IntegrationData {
  key: string;
  config: { baseUrl?: string | null; healthUrl?: string | null; tenantRef?: string | null };
  health: { configured: boolean; reachable: boolean; status?: number };
}

export const useIntegration = (key: string) =>
  useQuery({ queryKey: ['integration', key], queryFn: () => unwrap<IntegrationData>(api.get(`/integrations/${key}`)), retry: false });

export const useSaveIntegration = (key: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { baseUrl?: string; healthUrl?: string; tenantRef?: string }) => api.put(`/integrations/${key}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['integration', key] }),
  });
};
