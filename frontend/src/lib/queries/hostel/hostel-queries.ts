import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';

const unwrap = async <T>(p: Promise<{ data: { data: T } }>): Promise<T> => (await p).data.data;

export interface HostelBlock {
  id: string;
  name: string;
  code: string;
  type: 'boys' | 'girls' | 'mixed';
  wardenName?: string | null;
  totalRooms: number;
  _count?: { rooms: number };
}

export interface HostelRoom {
  id: string;
  blockId: string;
  roomNumber: string;
  floor: number;
  capacity: number;
  occupied: number;
  roomType?: string | null;
  monthlyRent?: string | null;
  block?: { name: string; code: string };
}

export interface HostelAllotment {
  id: string;
  roomId: string;
  studentId: string;
  bedNumber?: string | null;
  status: 'active' | 'vacated';
  allottedAt: string;
  room?: { roomNumber: string; blockId: string };
}

export interface MessBill {
  id: string;
  studentId: string;
  billMonth: string;
  amount: string;
  status: 'pending' | 'paid' | 'overdue';
  dueDate?: string | null;
}

export interface Occupancy {
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  vacantBeds: number;
}

export const useHostelBlocks = () =>
  useQuery({ queryKey: ['hostel-blocks'], queryFn: () => unwrap<HostelBlock[]>(api.get('/hostel/blocks')) });

export const useHostelRooms = (blockId?: string) =>
  useQuery({ queryKey: ['hostel-rooms', blockId], queryFn: () => unwrap<HostelRoom[]>(api.get('/hostel/rooms', { params: { blockId } })) });

export const useHostelAllotments = () =>
  useQuery({ queryKey: ['hostel-allotments'], queryFn: () => unwrap<HostelAllotment[]>(api.get('/hostel/allotments')) });

export const useMessBills = () =>
  useQuery({ queryKey: ['mess-bills'], queryFn: () => unwrap<MessBill[]>(api.get('/hostel/mess-bills')) });

export const useOccupancy = () =>
  useQuery({ queryKey: ['hostel-occupancy'], queryFn: () => unwrap<Occupancy>(api.get('/hostel/occupancy')) });

export const useCreateBlock = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; type?: string; wardenName?: string; wardenPhone?: string }) => api.post('/hostel/blocks', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hostel-blocks'] }),
  });
};

export const useAddRoom = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ blockId, ...body }: { blockId: string; roomNumber: string; floor?: number; capacity?: number; monthlyRent?: number }) =>
      api.post(`/hostel/blocks/${blockId}/rooms`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hostel-rooms'] });
      qc.invalidateQueries({ queryKey: ['hostel-occupancy'] });
    },
  });
};

export const useAllotRoom = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { roomId: string; studentId: string; bedNumber?: string }) => api.post('/hostel/allotments', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hostel-allotments'] });
      qc.invalidateQueries({ queryKey: ['hostel-occupancy'] });
      qc.invalidateQueries({ queryKey: ['hostel-rooms'] });
    },
  });
};

export const useVacateRoom = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (allotmentId: string) => api.post(`/hostel/allotments/${allotmentId}/vacate`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hostel-allotments'] });
      qc.invalidateQueries({ queryKey: ['hostel-occupancy'] });
    },
  });
};

export const usePayMessBill = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (billId: string) => api.post(`/hostel/mess-bills/${billId}/pay`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mess-bills'] }),
  });
};
