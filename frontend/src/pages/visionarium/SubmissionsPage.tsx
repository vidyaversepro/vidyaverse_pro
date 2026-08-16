import { useQuery } from '@tanstack/react-query';
import { FileEdit, BookOpen, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { EmptyState } from '@/components/shared/EmptyState';

export default function SubmissionsPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['visionarium-submissions'],
        queryFn: async () => {
            const res = await api.get('/visionarium/submissions');
            return res.data;
        },
    });

    const submissions = data?.data || [];

    const statusColors: Record<string, string> = {
        submitted: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
        accepted: 'bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400',
        rejected: 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400',
        published: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400',
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="arch-section-header text-2xl flex items-center gap-2">
                        <FileEdit className="w-7 h-7 text-primary" />
                        My Submissions (मेरी रचनाएँ)
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Submit articles, poems, stories & artwork to Visionarium
                    </p>
                </div>
                <Button>
                    <Send className="w-4 h-4 mr-2" /> New Submission
                </Button>
            </div>

            {isLoading ? (
                <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div>
            ) : submissions.length === 0 ? (
                <EmptyState
                    icon={BookOpen}
                    title="No submissions yet"
                    description="Submit your first piece of writing or artwork!"
                />
            ) : (
                <div className="space-y-3">
                    {submissions.map((sub: any, i: number) => (
                        <motion.div
                            key={sub.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="bg-card rounded-xl border border-border p-4 flex items-start gap-4"
                        >
                            <div className="mt-0.5">
                                <FileEdit className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-foreground truncate">{sub.title}</h3>
                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[sub.status] || ''}`}>
                                        {sub.status}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {sub.submissionType} • by {sub.submittedBy?.name || 'Unknown'} • {new Date(sub.createdAt).toLocaleDateString('en-IN')}
                                </p>
                            </div>
                            {sub.linkedArticle && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400 whitespace-nowrap">
                                    → Published
                                </span>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
