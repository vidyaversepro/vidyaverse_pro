import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { InstitutionRole } from '@vidyaverse/shared-validation';

interface InstitutionRoleResponse {
  success: true;
  data: { role: InstitutionRole | null };
}

export function useMyInstitutionRole(institutionId?: string) {
  return useQuery({
    queryKey: ['my-institution-role', institutionId],
    queryFn: () =>
      api
        .get<InstitutionRoleResponse>('/me/institution-role')
        .then((r) => r.data.data.role),
    enabled: !!institutionId,
    staleTime: 5 * 60 * 1000, // roles change rarely; 5 min is fine
  });
}
