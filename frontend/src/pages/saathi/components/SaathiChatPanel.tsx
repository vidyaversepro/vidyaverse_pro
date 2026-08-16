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
    <div className="grid grid-cols-1 md:grid-cols-3 bg-card rounded-xl border border-border overflow-hidden" style={{ minHeight: '600px' }}>
      
      {/* Sidebar: Conversations List */}
      <div className="border-r border-border flex flex-col">
        <div className="p-4 border-b border-border font-semibold text-foreground">
          Messages
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingConvos ? (
            <div className="p-4 flex justify-center"><Loader2 className="w-5 h-5 animate-spin" /></div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No conversations yet.</div>
          ) : (
            conversations.map((conv: any) => {
              // Find other participant for name
              const otherParticipant = conv.participants.find((p: any) => p.userId !== currentUserId);
              const name = conv.name || otherParticipant?.user?.name || 'Unknown';
              return (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`p-4 border-b border-border cursor-pointer hover:bg-muted transition-colors flex items-center gap-3 ${
                    activeConversationId === conv.id ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {name[0]}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-medium text-sm text-foreground truncate">{name}</p>
                    <p className="text-xs text-muted-foreground truncate">{conv.messages?.[0]?.content || 'Started a conversation'}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="md:col-span-2 flex flex-col bg-muted/30">
        {activeConversationId ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-card border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserCircle className="w-8 h-8 text-muted-foreground" />
                <div>
                  <h3 className="text-foreground">Chat</h3>
                  {typingUsers && typingUsers.size > 0 && (
                    <p className="text-xs text-primary animate-pulse">Someone is typing...</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => initiateCall('audio')}>
                  <Phone className="w-4 h-4 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => initiateCall('video')}>
                  <Video className="w-4 h-4 text-muted-foreground" />
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
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-card border border-border text-foreground rounded-bl-none'
                    }`}>
                      {msg.type === 'call_started' ? (
                        <div className="flex items-center gap-2 italic opacity-80">
                          <Phone className="w-3 h-3" /> {msg.content}
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}
                      <span className={`text-[10px] mt-1 block ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Message Input */}
            <div className="p-4 bg-card border-t border-border">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-2"
              >
                <Input 
                  value={draftMessage}
                  onChange={handleTyping}
                  placeholder="Type a message..."
                  className="flex-1 bg-muted border-transparent"
                />
                <Button type="submit" disabled={!draftMessage.trim()} className="shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <UserCircle className="w-16 h-16 opacity-20 mb-4" />
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
