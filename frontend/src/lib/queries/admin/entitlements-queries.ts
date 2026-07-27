import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';

const unwrap = async <T>(p: Promise<{ data: { data: T } }>): Promise<T> => (await p).data.data;

export interface ModuleDef {
  key: string;
  name: string;
  category: string;
  description: string;
  appliesTo: string[];
  defaultTier: 'starter' | 'professional' | 'enterprise' | 'addon';
  metered?: string | null;
  addOn?: boolean;
  core?: boolean;
}

export interface Entitlements {
  institutionId: string;
  name: string;
  code: string;
  institutionType: string;
  tier: 'starter' | 'professional' | 'enterprise';
  subscriptionStatus: string;
  coreModules: string[];
  enabledModules: string[];
  overrides: { grants: string[]; revokes: string[] };
  moduleConfig: Record<string, unknown>;
  usage: { ai: number; pdf: number; email: number; whatsapp: number; storageMb: number };
  limits: Record<string, number | boolean | string[]>;
}

export interface UpdateEntitlementsInput {
  tier?: 'starter' | 'professional' | 'enterprise';
  grants?: string[];
  revokes?: string[];
  moduleConfig?: Record<string, unknown>;
}

export const useModuleCatalog = () =>
  useQuery({ queryKey: ['module-catalog'], queryFn: () => unwrap<ModuleDef[]>(api.get('/admin/modules/catalog')) });

/** The requesting institution's own entitlements — drives sidebar/UI gating. */
export const useMyEntitlements = () =>
  useQuery({
    queryKey: ['my-entitlements'],
    queryFn: () => unwrap<Entitlements>(api.get('/entitlements/me')),
    retry: false,
    staleTime: 60_000,
  });

export const useInstitutionEntitlements = (institutionId?: string) =>
  useQuery({
    queryKey: ['entitlements', institutionId],
    queryFn: () => unwrap<Entitlements>(api.get(`/admin/institutions/${institutionId}/entitlements`)),
    enabled: !!institutionId,
  });

export const useUpdateEntitlements = (institutionId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateEntitlementsInput) => api.put(`/admin/institutions/${institutionId}/entitlements`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['entitlements', institutionId] }),
  });
};
