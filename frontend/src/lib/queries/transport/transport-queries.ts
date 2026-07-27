import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';

const unwrap = async <T>(p: Promise<{ data: { data: T } }>): Promise<T> => (await p).data.data;

export interface TransportStop {
  id: string;
  name: string;
  sequence: number;
  pickupTime?: string | null;
  dropTime?: string | null;
}

export interface TransportRoute {
  id: string;
  name: string;
  code: string;
  vehicleNumber?: string | null;
  driverName?: string | null;
  driverPhone?: string | null;
  capacity?: number | null;
  feeAmount?: string | null;
  isActive: boolean;
  stops: TransportStop[];
  _count?: { assignments: number };
}

export interface TransportTrip {
  id: string;
  routeId: string;
  status: string;
  startedAt?: string | null;
  lastLatitude?: number | null;
  lastLongitude?: number | null;
  lastPingAt?: string | null;
  route?: { name: string; code: string; vehicleNumber?: string | null };
}

export const useTransportRoutes = () =>
  useQuery({ queryKey: ['transport-routes'], queryFn: () => unwrap<TransportRoute[]>(api.get('/transport/routes')) });

export const useActiveTrips = () =>
  useQuery({ queryKey: ['transport-active-trips'], queryFn: () => unwrap<TransportTrip[]>(api.get('/transport/trips/active')), refetchInterval: 30_000 });

export interface CreateRouteBody {
  name: string;
  vehicleNumber?: string;
  driverName?: string;
  driverPhone?: string;
  capacity?: number;
  feeAmount?: number | string;
}

export const useCreateRoute = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateRouteBody) => api.post('/transport/routes', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transport-routes'] }),
  });
};

export const useAddStop = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ routeId, ...body }: { routeId: string; name: string; sequence?: number; pickupTime?: string }) =>
      api.post(`/transport/routes/${routeId}/stops`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transport-routes'] }),
  });
};

export const useStartTrip = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ routeId, direction }: { routeId: string; direction?: string }) =>
      api.post(`/transport/routes/${routeId}/start-trip`, { direction }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transport-active-trips'] }),
  });
};

export const useCompleteTrip = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tripId: string) => api.post(`/transport/trips/${tripId}/complete`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transport-active-trips'] }),
  });
};
