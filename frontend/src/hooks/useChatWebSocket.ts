import { useEffect, useRef, useCallback } from 'react';
import { useChatStore } from '../stores/chatStore';
import { useActiveInstitution } from '../stores/activeInstitution';
import { useSession } from '../lib/auth.client';

export function useChatWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const institutionId = useActiveInstitution((s) => s.institutionId);
  const { data: sessionData } = useSession();
  const token = sessionData?.session?.token;

  const { addMessage, setTyping } = useChatStore();

  useEffect(() => {
    if (!token || !institutionId) return;

    const wsUrl = import.meta.env.VITE_CHAT_WS_URL || 'ws://localhost:3002/api/v1/chat/ws';
    const ws = new WebSocket(`${wsUrl}?token=${token}&institutionId=${institutionId}`);

    ws.onopen = () => {
      console.log('Chat WS Connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'message:new') {
          addMessage(data.payload.conversationId, data.payload);
        } else if (data.type === 'typing:start') {
          setTyping(data.payload.conversationId, data.payload.userId, true);
        } else if (data.type === 'typing:stop') {
          setTyping(data.payload.conversationId, data.payload.userId, false);
        }
      } catch (err) {
        console.error('Failed to parse WS msg', err);
      }
    };

    ws.onerror = (err) => {
      console.error('Chat WS error', err);
    };

    ws.onclose = () => {
      console.log('Chat WS closed');
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [token, institutionId, addMessage, setTyping]);

  const joinConversation = useCallback((conversationId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'join', payload: { conversationId } }));
    }
  }, []);

  const sendMessage = useCallback(
    (conversationId: string, content: string, type = 'text') => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'message:send',
            payload: { conversationId, content, messageType: type },
          })
        );
      }
    },
    []
  );

  const setTypingStatus = useCallback(
    (conversationId: string, isTyping: boolean) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: isTyping ? 'typing:start' : 'typing:stop',
            payload: { conversationId },
          })
        );
      }
    },
    []
  );

  return { joinConversation, sendMessage, setTypingStatus };
}
