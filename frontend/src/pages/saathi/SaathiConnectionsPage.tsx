import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, UserPlus, UserCheck, UserX, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { EmptyState } from '@/components/shared/EmptyState';

export default function SaathiConnectionsPage() {
    const queryClient = useQueryClient();

    const { data: requestsData } = useQuery({
        queryKey: ['saathi-requests'],
        queryFn: async () => {
            const res = await api.get('/social/saathi-requests?direction=all');
            return res.data;
        },
    });

    const { data: saathisData, isLoading: loadingSaathis } = useQuery({
        queryKey: ['saathis'],
        queryFn: async () => {
            const res = await api.get('/social/saathis');
            return res.data;
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            return api.patch(`/social/saathi-requests/${id}`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['saathi-requests'] });
            queryClient.invalidateQueries({ queryKey: ['saathis'] });
        },
    });

    const requests = requestsData?.data || [];
    const saathis = saathisData?.data || [];
    const pendingRequests = requests.filter((r: any) => r.status === 'pending');

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="arch-section-header text-2xl flex items-center gap-2">
                    <Heart className="w-7 h-7 text-primary" />
                    My Saathis (मेरे साथी)
                </h1>
                <p className="text-sm text-muted-foreground mt-1">Manage your connections and requests</p>
            </div>

            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
                <div className="space-y-3">
                    <h2 className="text-sm text-muted-foreground uppercase tracking-wider">Pending Requests</h2>
                    {pendingRequests.map((req: any) => (
                        <motion.div
                            key={req.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-card rounded-xl border border-border p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4"
                        >
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                                {(req.requester?.name || req.target?.name || 'U')[0]}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-foreground">{req.requester?.name || req.target?.name}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</p>
                                {req.message && <p className="text-xs text-muted-foreground mt-1">"{req.message}"</p>}
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto flex-wrap">
                                <Button size="sm" variant="outline" className="tone-text-green hover:bg-[var(--tone-green-bg)]" onClick={() => updateMutation.mutate({ id: req.id, status: 'accepted' })}>
                                    <UserCheck className="w-3.5 h-3.5 mr-1" /> Accept
                                </Button>
                                <Button size="sm" variant="outline" className="tone-text-red hover:bg-[var(--tone-red-bg)]" onClick={() => updateMutation.mutate({ id: req.id, status: 'rejected' })}>
                                    <UserX className="w-3.5 h-3.5 mr-1" /> Decline
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Accepted Saathis */}
            <div className="space-y-3">
                <h2 className="text-sm text-muted-foreground uppercase tracking-wider">
                    Saathis ({saathis.length})
                </h2>
                {loadingSaathis ? (
                    <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}</div>
                ) : saathis.length === 0 ? (
                    <EmptyState
                        icon={UserPlus}
                        title="No Saathis yet"
                        description="Send a request to connect and start building your network!"
                    />
                ) : (
                    <div className="grid gap-3">
                        {saathis.map((s: any) => (
                            <div key={s.linkId} className="bg-card rounded-xl border border-border p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                                    {s.saathi.name[0]}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-foreground">{s.saathi.name}</p>
                                    <p className="text-xs text-muted-foreground">{s.context} • since {new Date(s.since).toLocaleDateString('en-IN')}</p>
                                </div>
                                <span className="text-xs px-2 py-0.5 rounded-full pill-green font-medium">Saathi ✓</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
