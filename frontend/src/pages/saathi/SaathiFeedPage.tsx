import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, MessageCircle, Send, Sparkles, Users, Building2, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SaathiChatPanel } from './components/SaathiChatPanel';
import { useChatWebSocket } from '@/hooks/useChatWebSocket';
import { EmptyState } from '@/components/shared/EmptyState';

type FeedTab = 'institution' | 'class' | 'my';

export default function SaathiFeedPage() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<FeedTab>('institution');
    const [newPostBody, setNewPostBody] = useState('');
    const [postScope, setPostScope] = useState('institution_only');

    const { joinConversation, sendMessage, setTypingStatus } = useChatWebSocket();

    const feedQueryKey = ['social-feed', activeTab];

    const { data: feedData, isLoading } = useQuery({
        queryKey: feedQueryKey,
        queryFn: async () => {
            let url = '/social/posts/institution';
            if (activeTab === 'class') {
                url = '/social/posts/class';
            } else if (activeTab === 'my') {
                url = '/social/posts/me';
            }
            const res = await api.get(url);
            return res.data;
        },
    });

    const createPostMutation = useMutation({
        mutationFn: async () => {
            return api.post('/social/posts', {
                body: newPostBody,
                scope: postScope,
            });
        },
        onSuccess: () => {
            setNewPostBody('');
            queryClient.invalidateQueries({ queryKey: feedQueryKey });
        },
    });

    const reactMutation = useMutation({
        mutationFn: async (postId: string) => {
            return api.post(`/social/posts/${postId}/reactions`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: feedQueryKey });
        },
    });

    const posts = feedData?.data || [];

    const tabs = [
        { key: 'institution' as FeedTab, label: 'Institution', icon: Building2 },
        { key: 'class' as FeedTab, label: 'Class', icon: GraduationCap },
        { key: 'my' as FeedTab, label: 'My Activity', icon: Users },
    ];

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="arch-section-header text-2xl flex items-center gap-2">
                    <Heart className="w-7 h-7 text-primary" />
                    Saathi Network (साथी नेटवर्क)
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Connect, share, and inspire — your education community
                </p>
            </div>

            <Tabs defaultValue="feed" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="feed">Feed</TabsTrigger>
                    <TabsTrigger value="chat">Chat</TabsTrigger>
                </TabsList>

                <TabsContent value="feed" className="space-y-6">
                    {/* Feed Tabs */}
                    <div className="flex gap-1 bg-muted rounded-xl p-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key
                            ? 'bg-card text-primary shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Compose Post */}
            <div className="bg-card rounded-xl border border-border p-4">
                <textarea
                    value={newPostBody}
                    onChange={(e) => setNewPostBody(e.target.value)}
                    placeholder="Share an update, achievement, or thoughts... (साझा करें)"
                    rows={3}
                    maxLength={5000}
                    className="w-full resize-none border-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <div className="flex items-center justify-between gap-3 flex-wrap pt-3 border-t border-border">
                    <select
                        value={postScope}
                        onChange={(e) => setPostScope(e.target.value)}
                        className="px-2 py-1 rounded-lg border border-border bg-transparent text-xs text-foreground"
                    >
                        <option value="institution_only">🏫 Institution Only</option>
                        <option value="class_only">📚 Class Only</option>
                        <option value="my_saathi">💛 My Saathis</option>
                        <option value="public_vidyaverse">🌍 Public</option>
                    </select>
                    <Button
                        size="sm"
                        disabled={!newPostBody.trim() || createPostMutation.isPending}
                        onClick={() => createPostMutation.mutate()}
                    >
                        <Send className="w-3.5 h-3.5 mr-1" /> Post
                    </Button>
                </div>
            </div>

            {/* Feed */}
            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
                    ))}
                </div>
            ) : posts.length === 0 ? (
                <EmptyState
                    icon={Users}
                    title="No posts yet"
                    description="Be the first to share something with your community!"
                />
            ) : (
                <div className="space-y-4">
                    {posts.map((post: any, i: number) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="bg-card rounded-xl border border-border p-5"
                        >
                            {/* Author */}
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                                    {(post.authorUser?.name || 'U')[0]}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">{post.authorUser?.name}</p>
                                    <p className="text-[11px] text-muted-foreground">{new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                </div>
                                <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                    {post.scope === 'institution_only' ? '🏫' : post.scope === 'class_only' ? '📚' : post.scope === 'my_saathi' ? '💛' : '🌍'}
                                </span>
                            </div>

                            {/* Body */}
                            {post.title && <h3 className="text-foreground mb-1">{post.title}</h3>}
                            <p className="text-sm text-foreground/90 whitespace-pre-wrap">{post.body}</p>

                            {post.mediaUrl && (
                                <img src={post.mediaUrl} alt="" className="mt-3 rounded-lg max-h-64 object-cover w-full" />
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-4 flex-wrap mt-4 pt-3 border-t border-border">
                                <button
                                    onClick={() => reactMutation.mutate(post.id)}
                                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    <span>Prerna (प्रेरणा)</span>
                                    {post._count?.reactions > 0 && <span className="text-xs font-medium">{post._count.reactions}</span>}
                                </button>
                                <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                                    <MessageCircle className="w-4 h-4" />
                                    <span>Comment</span>
                                    {post._count?.comments > 0 && <span className="text-xs font-medium">{post._count.comments}</span>}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
                </TabsContent>

                <TabsContent value="chat">
                    <SaathiChatPanel 
                        joinConversation={joinConversation} 
                        sendMessage={sendMessage} 
                        setTypingStatus={setTypingStatus} 
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
