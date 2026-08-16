import { useQuery } from '@tanstack/react-query';
import { ClipboardList, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { EmptyState } from '@/components/shared/EmptyState';

export default function TestSeriesPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['visionarium-test-series'],
        queryFn: async () => {
            const res = await api.get('/visionarium/test-series');
            return res.data;
        },
    });

    const series = data?.data || [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="arch-section-header text-2xl flex items-center gap-2">
                    <ClipboardList className="w-7 h-7 text-primary" />
                    Test Series (परीक्षा श्रृंखला)
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Digi Classroom style test series for self-assessment
                </p>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />)}
                </div>
            ) : series.length === 0 ? (
                <EmptyState
                    icon={BookOpen}
                    title="No test series available"
                    description="Test series will appear here when created by your institution."
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {series.map((ts: any, i: number) => (
                        <motion.div
                            key={ts.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-card rounded-xl border border-border p-5 hover:shadow-lg hover:border-primary/40 transition-all cursor-pointer"
                        >
                            <h3 className="text-foreground">{ts.title}</h3>
                            {ts.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{ts.description}</p>}
                            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
                                {ts.class && <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary">{ts.class.name}</span>}
                                {ts.subject && <span className="px-2 py-0.5 rounded-full bg-muted text-foreground">{ts.subject.subjectName}</span>}
                                <span>Total: {ts.totalMarks} marks</span>
                                <span className="ml-auto">{ts._count?.attempts || 0} attempts</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
