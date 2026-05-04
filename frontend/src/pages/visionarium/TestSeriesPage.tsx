import { useQuery } from '@tanstack/react-query';
import { ClipboardList, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';

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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <ClipboardList className="w-7 h-7 text-emerald-500" />
                    Test Series (परीक्षा श्रृंखला)
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Digi Classroom style test series for self-assessment
                </p>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />)}
                </div>
            ) : series.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p className="text-lg font-medium">No test series available</p>
                    <p className="text-sm">Test series will appear here when created by your institution.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {series.map((ts: any, i: number) => (
                        <motion.div
                            key={ts.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer"
                        >
                            <h3 className="font-semibold text-gray-900 dark:text-white">{ts.title}</h3>
                            {ts.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{ts.description}</p>}
                            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-400">
                                {ts.class && <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">{ts.class.name}</span>}
                                {ts.subject && <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">{ts.subject.subjectName}</span>}
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
