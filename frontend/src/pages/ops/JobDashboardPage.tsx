import { useState } from 'react';
import { useJobs, JobExecution } from '../../lib/queries/jobs/job-queries.js';
import { Activity, Clock, AlertTriangle, CheckCircle, RefreshCw, Layers } from 'lucide-react';
import { cn } from '../../lib/utils.js';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { TONE } from '@/components/shared/Pill';

const STATUS_TONE: Record<string, string> = {
    completed: TONE.green,
    failed: TONE.red,
    processing: TONE.peacock,
    queued: TONE.temple,
};

function statusTone(status: string) {
    return STATUS_TONE[status] ?? TONE.indigo;
}

function StatusChip({ status }: { status: string }) {
    const tone = statusTone(status);
    const icon =
        status === 'completed' ? <CheckCircle className="w-3.5 h-3.5" /> :
        status === 'failed' ? <AlertTriangle className="w-3.5 h-3.5" /> :
        status === 'processing' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> :
        status === 'queued' ? <Clock className="w-3.5 h-3.5" /> :
        <Activity className="w-3.5 h-3.5" />;
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border capitalize whitespace-nowrap',
                status === 'processing' && 'animate-pulse',
            )}
            style={{ color: tone, background: `${tone}1f`, borderColor: `${tone}33` }}
        >
            {icon}
            {status}
        </span>
    );
}

function ProgressBar({ progress, failed }: { progress: number; failed: boolean }) {
    return (
        <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden min-w-[80px]">
                <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress}%`, background: failed ? TONE.red : 'hsl(var(--primary))' }}
                />
            </div>
            <span className="text-xs font-medium min-w-[36px]">{progress}%</span>
        </div>
    );
}

function ResultCounts({ job }: { job: JobExecution }) {
    return (
        <div className="text-sm">
            <span className="font-medium" style={{ color: TONE.green }}>{job.successfulItems}</span>
            <span className="text-muted-foreground mx-1">/</span>
            <span className="font-medium" style={{ color: TONE.red }}>{job.failedItems}</span>
            <span className="text-muted-foreground mx-1">of</span>
            <span>{job.totalItems}</span>
        </div>
    );
}

const FILTERS = ['all', 'processing', 'queued', 'completed', 'failed'];

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

    const when = (iso: string) => new Date(iso).toLocaleString(undefined, {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });

    return (
        <div className="p-4 sm:p-6 space-y-4">
            <PageHeader
                breadcrumb={[{ label: 'System' }, { label: 'Background Jobs' }]}
                title="Background Jobs"
                description="Monitor bulk generation tasks and data imports in real-time"
                action={
                    <Button
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={() => refetch()}
                        disabled={isRefetching}
                    >
                        <RefreshCw className={cn('w-4 h-4 mr-2', isRefetching && 'animate-spin')} />
                        Refresh
                    </Button>
                }
            />

            <Card className="rounded-2xl overflow-hidden">
                <CardContent className="p-0">
                    {/* Filter chips — horizontally scrollable on phone */}
                    <div className="p-3 sm:p-4 border-b">
                        <div className="flex items-center gap-1.5 overflow-x-auto indic-scroll">
                            {FILTERS.map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={cn(
                                        'shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors capitalize whitespace-nowrap border',
                                        statusFilter === status
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-card text-muted-foreground hover:text-foreground hover:bg-accent',
                                    )}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Desktop table */}
                    <div className="hidden lg:block overflow-x-auto indic-scroll">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Job ID / Type</th>
                                    <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                                    <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Progress</th>
                                    <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Result</th>
                                    <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Timing</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="p-4"><div className="h-10 bg-muted rounded-lg w-3/4"></div></td>
                                            <td className="p-4"><div className="h-6 bg-muted rounded-lg w-20"></div></td>
                                            <td className="p-4"><div className="h-6 bg-muted rounded-full w-full"></div></td>
                                            <td className="p-4"><div className="h-6 bg-muted rounded-lg w-16"></div></td>
                                            <td className="p-4"><div className="h-6 bg-muted rounded-lg w-24"></div></td>
                                        </tr>
                                    ))
                                ) : jobs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-muted-foreground">
                                            <Layers className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                                            <p className="text-base font-medium text-foreground mb-1">No Jobs Found</p>
                                            <p className="text-sm">No background tasks match the selected criteria.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    jobs.map((job) => (
                                        <tr key={job.id} className="hover:bg-accent/40 transition-colors">
                                            <td className="p-4">
                                                <div className="font-medium capitalize">{job.jobType.replace(/_/g, ' ')}</div>
                                                <div className="text-xs text-muted-foreground font-mono">{job.jobId}</div>
                                            </td>
                                            <td className="p-4"><StatusChip status={job.status} /></td>
                                            <td className="p-4"><ProgressBar progress={job.progress} failed={job.status === 'failed'} /></td>
                                            <td className="p-4">
                                                <ResultCounts job={job} />
                                                {job.errorMessage && (
                                                    <p className="text-xs mt-1 line-clamp-1" style={{ color: TONE.red }} title={job.errorMessage}>
                                                        {job.errorMessage}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm">{when(job.createdAt)}</div>
                                                {job.durationSeconds && (
                                                    <div className="text-xs text-muted-foreground mt-0.5">Took {job.durationSeconds}s</div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile / tablet card list */}
                    <div className="lg:hidden p-3 sm:p-4 flex flex-col gap-2.5">
                        {isLoading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="animate-pulse rounded-2xl border bg-card p-3.5">
                                    <div className="h-5 bg-muted rounded w-2/3 mb-2"></div>
                                    <div className="h-3 bg-muted rounded w-1/3 mb-3"></div>
                                    <div className="h-2 bg-muted rounded-full w-full"></div>
                                </div>
                            ))
                        ) : jobs.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground">
                                <Layers className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                                <p className="text-base font-medium text-foreground mb-1">No Jobs Found</p>
                                <p className="text-sm">No background tasks match the selected criteria.</p>
                            </div>
                        ) : (
                            jobs.map((job) => (
                                <div key={job.id} className="rounded-2xl border bg-card p-3.5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="font-bold text-[14.5px] capitalize truncate">{job.jobType.replace(/_/g, ' ')}</div>
                                            <div className="text-[11px] text-muted-foreground font-mono truncate">{job.jobId}</div>
                                        </div>
                                        <StatusChip status={job.status} />
                                    </div>

                                    <div className="mt-3">
                                        <ProgressBar progress={job.progress} failed={job.status === 'failed'} />
                                    </div>

                                    <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                                        <ResultCounts job={job} />
                                        <div className="text-xs text-muted-foreground text-right">
                                            {when(job.createdAt)}
                                            {job.durationSeconds ? ' · ' + job.durationSeconds + 's' : ''}
                                        </div>
                                    </div>

                                    {job.errorMessage && (
                                        <p className="text-xs mt-1.5 line-clamp-2" style={{ color: TONE.red }} title={job.errorMessage}>
                                            {job.errorMessage}
                                        </p>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
