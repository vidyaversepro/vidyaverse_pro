import { create } from 'zustand';

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
  };
};

interface ChatState {
  messages: Record<string, ChatMessage[]>; // keyed by conversationId
  typingUsers: Record<string, Set<string>>; // conversationId -> set of userIds
  addMessage: (conversationId: string, msg: ChatMessage) => void;
  setMessages: (conversationId: string, msgs: ChatMessage[]) => void;
  setTyping: (conversationId: string, userId: string, isTyping: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: {},
  typingUsers: {},

  addMessage: (conversationId, msg) =>
    set((state) => {
      const existing = state.messages[conversationId] || [];
      // avoid duplicates
      if (existing.some((m) => m.id === msg.id)) return state;
      return {
        messages: {
          ...state.messages,
          [conversationId]: [...existing, msg].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          ),
        },
      };
    }),

  setMessages: (conversationId, msgs) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [...msgs].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        ),
      },
    })),

  setTyping: (conversationId, userId, isTyping) =>
    set((state) => {
      const typingSet = new Set(state.typingUsers[conversationId] || []);
      if (isTyping) typingSet.add(userId);
      else typingSet.delete(userId);
      return {
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: typingSet,
        },
      };
    }),
}));
