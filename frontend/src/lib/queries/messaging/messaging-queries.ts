import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';

// Backend wraps payloads as { success, data }; these hooks unwrap to the payload.
const unwrap = async <T>(p: Promise<{ data: { data: T } }>): Promise<T> => (await p).data.data;

export interface FeeSummary {
  totalBilled: number;
  totalCollected: number;
  totalOutstanding: number;
  pendingInvoices: number;
  collectionRate: number;
}

export interface PaymentClaim {
  id: string;
  invoiceId: string;
  submittedByGuardianId: string;
  objectPath: string;
  mediaType: string;
  claimAmount: string | null;
  status: 'pending_review' | 'approved' | 'rejected';
  createdAt: string;
}

export interface MessageLogItem {
  id: string;
  guardianId: string | null;
  templateCode: string | null;
  direction: 'inbound' | 'outbound';
  status: string;
  createdAt: string;
}

export interface ConversationItem {
  id: string;
  guardianId: string;
  lastIntent: string | null;
  lastMessageAt: string | null;
  messageCount: number;
}

export const useFeeSummary = () =>
  useQuery({ queryKey: ['fee-summary'], queryFn: () => unwrap<FeeSummary>(api.get('/payments/summary')) });

export const usePaymentClaims = (status?: string) =>
  useQuery({
    queryKey: ['payment-claims', status],
    queryFn: () => unwrap<PaymentClaim[]>(api.get('/inbound/claims', { params: status ? { status } : {} })),
  });

export const useMessageLog = () =>
  useQuery({ queryKey: ['message-log'], queryFn: () => unwrap<MessageLogItem[]>(api.get('/messaging/messages')) });

export const useConversations = () =>
  useQuery({ queryKey: ['conversations'], queryFn: () => unwrap<ConversationItem[]>(api.get('/inbound/conversations')) });

export const useReviewClaim = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; decision: 'approved' | 'rejected'; amount?: number; rejectionReason?: string }) =>
      api.post(`/inbound/claims/${vars.id}/review`, vars),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payment-claims'] });
      qc.invalidateQueries({ queryKey: ['fee-summary'] });
    },
  });
};

export const useProvisionTemplates = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post('/messaging/templates/provision'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['message-log'] }),
  });
};
