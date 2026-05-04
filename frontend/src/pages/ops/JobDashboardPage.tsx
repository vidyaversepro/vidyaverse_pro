import { useState } from 'react';
import { useJobs, JobExecution } from '../../lib/queries/jobs/job-queries.js';
import { Activity, Clock, AlertTriangle, CheckCircle, RefreshCw, Layers } from 'lucide-react';
import { cn } from '../../lib/utils.js';

export default function JobDashboardPage() {
    const [statusFilter, setStatusFilter] = useState<string>('all');
    
    // Status can be: 'all', 'queued', 'processing', 'completed', 'failed'
    const queryStatus = statusFilter === 'all' ? undefined : statusFilter as 'queued' | 'processing' | 'completed' | 'failed';

    const { data, isLoading, refetch, isRefetching } = useJobs({
        status: queryStatus,
        page: 1,
        limit: 50,
    });

    const jobs: JobExecution[] = data?.data || [];

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'failed': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            case 'processing': return 'bg-blue-500/10 text-blue-500 border-blue-500/20 animate-pulse';
            case 'queued': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle className="w-4 h-4" />;
            case 'failed': return <AlertTriangle className="w-4 h-4" />;
            case 'processing': return <RefreshCw className="w-4 h-4 animate-spin" />;
            case 'queued': return <Clock className="w-4 h-4" />;
            default: return <Activity className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                        <Activity className="w-6 h-6 text-brand-primary" />
                        Background Jobs
                    </h1>
                    <p className="text-sm text-brand-muted">
                        Monitor bulk generation tasks and data imports in real-time.
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => refetch()}
                        disabled={isRefetching}
                        className="px-4 py-2 bg-brand-surface-light text-white rounded-lg border border-white/5 hover:bg-white/5 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        <RefreshCw className={cn("w-4 h-4", isRefetching && "animate-spin")} />
                        Refresh
                    </button>
                </div>
            </div>

            <div className="bg-brand-surface border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl flex flex-col">
                <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 bg-black/20 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
                        {['all', 'processing', 'queued', 'completed', 'failed'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={cn(
                                    "px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize whitespace-nowrap",
                                    statusFilter === status 
                                        ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" 
                                        : "text-brand-muted hover:text-white hover:bg-white/5"
                                )}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-0 overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="border-b border-white/5 bg-black/20">
                                <th className="p-4 text-xs font-medium text-brand-muted uppercase tracking-wider">Job ID / Type</th>
                                <th className="p-4 text-xs font-medium text-brand-muted uppercase tracking-wider">Status</th>
                                <th className="p-4 text-xs font-medium text-brand-muted uppercase tracking-wider">Progress</th>
                                <th className="p-4 text-xs font-medium text-brand-muted uppercase tracking-wider">Result</th>
                                <th className="p-4 text-xs font-medium text-brand-muted uppercase tracking-wider">Timing</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="p-4"><div className="h-10 bg-white/5 rounded-lg w-3/4"></div></td>
                                        <td className="p-4"><div className="h-6 bg-white/5 rounded-lg w-20"></div></td>
                                        <td className="p-4"><div className="h-6 bg-white/5 rounded-full w-full"></div></td>
                                        <td className="p-4"><div className="h-6 bg-white/5 rounded-lg w-16"></div></td>
                                        <td className="p-4"><div className="h-6 bg-white/5 rounded-lg w-24"></div></td>
                                    </tr>
                                ))
                            ) : jobs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-brand-muted">
                                        <Layers className="w-12 h-12 text-brand-muted/50 mx-auto mb-4" />
                                        <p className="text-base font-medium text-white mb-1">No Jobs Found</p>
                                        <p className="text-sm">No background tasks match the selected criteria.</p>
                                    </td>
                                </tr>
                            ) : (
                                jobs.map((job) => (
                                    <tr key={job.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="p-4">
                                            <div className="font-medium text-white capitalize">{job.jobType.replace(/_/g, ' ')}</div>
                                            <div className="text-xs text-brand-muted font-mono">{job.jobId}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={cn(
                                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border capitalize",
                                                getStatusStyle(job.status)
                                            )}>
                                                {getStatusIcon(job.status)}
                                                {job.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden min-w-[100px]">
                                                    <div 
                                                        className={cn(
                                                            "h-full rounded-full transition-all duration-500",
                                                            job.status === 'failed' ? "bg-rose-500" : "bg-brand-primary"
                                                        )}
                                                        style={{ width: `${job.progress}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-medium text-white min-w-[36px]">{job.progress}%</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm text-white">
                                                <span className="text-emerald-400 font-medium">{job.successfulItems}</span>
                                                <span className="text-brand-muted mx-1">/</span>
                                                <span className="text-rose-400 font-medium">{job.failedItems}</span>
                                                <span className="text-brand-muted mx-1">of</span>
                                                <span>{job.totalItems}</span>
                                            </div>
                                            {job.errorMessage && (
                                                <p className="text-xs text-rose-400 mt-1 line-clamp-1" title={job.errorMessage}>
                                                    {job.errorMessage}
                                                </p>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm text-white">
                                                {new Date(job.createdAt).toLocaleString(undefined, {
                                                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </div>
                                            {job.durationSeconds && (
                                                <div className="text-xs text-brand-muted mt-0.5">
                                                    Took {job.durationSeconds}s
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
