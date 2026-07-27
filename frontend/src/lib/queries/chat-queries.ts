import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';

export const chatKeys = {
  all: ['chat'] as const,
  conversations: () => [...chatKeys.all, 'conversations'] as const,
  messages: (conversationId: string) => [...chatKeys.all, 'messages', conversationId] as const,
};

export function useConversations() {
  return useQuery({
    queryKey: chatKeys.conversations(),
    queryFn: async () => {
      const res = await api.get('/chat/conversations');
      return res.data;
    },
  });
}

export function useCreateConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { type: 'direct' | 'group'; participantUserIds: string[]; name?: string }) => {
      const res = await api.post('/chat/conversations', data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });
}

export function useConversationMessages(conversationId: string) {
  return useQuery({
    queryKey: chatKeys.messages(conversationId),
    queryFn: async () => {
      const res = await api.get(`/chat/conversations/${conversationId}/messages`);
      return res.data; // Needs to be reversed and put in chatStore on the frontend if needed
    },
    enabled: !!conversationId,
  });
}

export function useLivekitToken() {
  return useMutation({
    mutationFn: async (data: { conversationId: string; callType: 'audio' | 'video' }) => {
      const res = await api.post('/calls/token', data);
      return res.data;
    },
  });
}
