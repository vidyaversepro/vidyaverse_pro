import { useState, useEffect } from 'react';
import { useConversations, useConversationMessages } from '@/lib/queries/chat-queries';
import { useChatStore } from '@/stores/chatStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Phone, Video, Send, Loader2, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/lib/auth.client';

interface SaathiChatPanelProps {
  joinConversation: (id: string) => void;
  sendMessage: (id: string, content: string, type?: string) => void;
  setTypingStatus: (id: string, isTyping: boolean) => void;
}

export function SaathiChatPanel({ joinConversation, sendMessage, setTypingStatus }: SaathiChatPanelProps) {
  const navigate = useNavigate();
  const { data: sessionData } = useSession();
  const currentUserId = sessionData?.user?.id;

  const { data: conversationsResponse, isLoading: loadingConvos } = useConversations();
  const conversations = conversationsResponse?.data || [];

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [draftMessage, setDraftMessage] = useState('');

  const { data: historyResponse } = useConversationMessages(activeConversationId || '');
  const messagesFromStore = useChatStore((s: any) => activeConversationId ? s.messages[activeConversationId] : []);
  const setMessages = useChatStore((s: any) => s.setMessages);
  const typingUsers = useChatStore((s: any) => activeConversationId ? s.typingUsers[activeConversationId] : new Set<string>());

  // When clicking a conversation, set active and join the WS channel
  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    joinConversation(id);
  };

  // Sync historical messages into Zustand store
  useEffect(() => {
    if (activeConversationId && historyResponse?.data) {
      setMessages(activeConversationId, [...historyResponse.data].reverse());
    }
  }, [activeConversationId, historyResponse, setMessages]);

  const handleSend = () => {
    if (!draftMessage.trim() || !activeConversationId) return;
    sendMessage(activeConversationId, draftMessage);
    setDraftMessage('');
    setTypingStatus(activeConversationId, false);
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDraftMessage(e.target.value);
    if (activeConversationId) {
      setTypingStatus(activeConversationId, e.target.value.length > 0);
    }
  };

  const initiateCall = (type: 'audio' | 'video') => {
    if (!activeConversationId) return;
    // Launch full screen call
    navigate(`/student/call?conversationId=${activeConversationId}&type=${type}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden" style={{ minHeight: '600px' }}>
      
      {/* Sidebar: Conversations List */}
      <div className="border-r border-gray-200 dark:border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 font-semibold text-gray-900 dark:text-white">
          Messages
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingConvos ? (
            <div className="p-4 flex justify-center"><Loader2 className="w-5 h-5 animate-spin" /></div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">No conversations yet.</div>
          ) : (
            conversations.map((conv: any) => {
              // Find other participant for name
              const otherParticipant = conv.participants.find((p: any) => p.userId !== currentUserId);
              const name = conv.name || otherParticipant?.user?.name || 'Unknown';
              return (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`p-4 border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-3 ${
                    activeConversationId === conv.id ? 'bg-rose-50 dark:bg-gray-800 border-l-4 border-l-rose-500' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 font-bold">
                    {name[0]}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{name}</p>
                    <p className="text-xs text-gray-500 truncate">{conv.messages?.[0]?.content || 'Started a conversation'}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="md:col-span-2 flex flex-col bg-gray-50 dark:bg-gray-900/50">
        {activeConversationId ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserCircle className="w-8 h-8 text-gray-400" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Chat</h3>
                  {typingUsers && typingUsers.size > 0 && (
                    <p className="text-xs text-rose-500 animate-pulse">Someone is typing...</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => initiateCall('audio')}>
                  <Phone className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => initiateCall('video')}>
                  <Video className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesFromStore?.map((msg: any) => {
                const isMe = msg.senderId === currentUserId;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                      isMe 
                        ? 'bg-rose-500 text-white rounded-br-none' 
                        : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white rounded-bl-none'
                    }`}>
                      {msg.type === 'call_started' ? (
                        <div className="flex items-center gap-2 italic opacity-80">
                          <Phone className="w-3 h-3" /> {msg.content}
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}
                      <span className={`text-[10px] mt-1 block ${isMe ? 'text-rose-200' : 'text-gray-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-2"
              >
                <Input 
                  value={draftMessage}
                  onChange={handleTyping}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-50 dark:bg-gray-800 border-transparent focus-visible:ring-rose-500"
                />
                <Button type="submit" disabled={!draftMessage.trim()} className="bg-rose-500 hover:bg-rose-600 text-white shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <UserCircle className="w-16 h-16 opacity-20 mb-4" />
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
