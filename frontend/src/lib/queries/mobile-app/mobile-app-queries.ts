import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';

const unwrap = async <T>(p: Promise<{ data: { data: T } }>): Promise<T> => (await p).data.data;

export interface MobileAppConfig {
  androidUrl?: string | null;
  iosUrl?: string | null;
  minSupportedVersion?: string | null;
  forceUpdate?: boolean;
  primaryColor?: string | null;
  enabledFeatures?: string[];
}

export const useMobileAppConfig = () =>
  useQuery({ queryKey: ['mobile-app-config'], queryFn: () => unwrap<MobileAppConfig>(api.get('/mobile-app/config')) });

export const useSaveMobileAppConfig = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: MobileAppConfig) => api.put('/mobile-app/config', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mobile-app-config'] }),
  });
};
