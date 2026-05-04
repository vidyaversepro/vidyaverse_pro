import { Users, UserCheck, Activity, Building2 } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { useDashboardStats } from '@/lib/queries/analytics/analytics-queries';
import { useUserStats } from '@/lib/queries/auth/user-queries';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function StatsBar() {
    const navigate = useNavigate();

    const {
        data: platformData,
        isLoading: isPlatformLoading,
        isError: isPlatformError,
        refetch: refetchPlatform
    } = useDashboardStats();

    const {
        data: userStatsData,
        isLoading: isUserStatsLoading,
        isError: isUserStatsError,
        refetch: refetchUserStats
    } = useUserStats();

    const isLoading = isPlatformLoading || isUserStatsLoading;
    const isError = isPlatformError || isUserStatsError;

    const handleRetry = () => {
        if (isPlatformError) refetchPlatform();
        if (isUserStatsError) refetchUserStats();
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 overflow-hidden">
                        <div className="flex justify-between items-center mb-4">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-10 rounded-full" />
                        </div>
                        <Skeleton className="h-8 w-16 mb-2" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center p-8 border rounded-2xl bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-400">
                <AlertCircle className="h-8 w-8 mb-3 opacity-80" />
                <p className="font-medium text-sm mb-4">Failed to load dashboard statistics</p>
                <Button variant="outline" size="sm" onClick={handleRetry} className="bg-white dark:bg-gray-900">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                </Button>
            </div>
        );
    }

    const totalInstitutions = platformData?.overview.totalInstitutions || 0;
    const totalStudents = platformData?.overview.totalStudents || 0;
    const pendingApprovals = platformData?.overview.pendingApprovals || 0;
    const activeUsers = userStatsData?.data?.activeToday || 0;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="cursor-pointer transition-transform hover:-translate-y-1" onClick={() => navigate('/app/institutions')}>
                <StatCard
                    title="Total Institutions"
                    value={totalInstitutions.toLocaleString()}
                    icon={Building2}
                    iconClassName="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                    description="Registered on platform"
                />
            </div>

            <div className="cursor-pointer transition-transform hover:-translate-y-1" onClick={() => navigate('/app/students')}>
                <StatCard
                    title="Total Students"
                    value={totalStudents.toLocaleString()}
                    icon={Users}
                    iconClassName="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    description="Enrolled across sections"
                />
            </div>

            <div className="cursor-pointer transition-transform hover:-translate-y-1" onClick={() => navigate('/app/students/approval')}>
                <StatCard
                    title="Pending Approvals"
                    value={pendingApprovals.toLocaleString()}
                    icon={UserCheck}
                    iconClassName={pendingApprovals > 0 ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"}
                    description={pendingApprovals > 0 ? "Action required" : "All caught up"}
                    trend={pendingApprovals > 0 ? { value: String(pendingApprovals), label: "waiting", direction: 'neutral' } : undefined}
                />
            </div>

            <div className="cursor-pointer transition-transform hover:-translate-y-1" onClick={() => navigate('/app/users')}>
                <StatCard
                    title="Active Users"
                    value={activeUsers.toLocaleString()}
                    icon={Activity}
                    iconClassName="bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
                    description="Active sessions today"
                />
            </div>
        </div>
    );
}
