import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useDashboardStats } from '@/lib/queries/analytics/analytics-queries';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, RefreshCw, Activity, CreditCard, Award, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

export function RecentActivityFeed() {
    const {
        data: dashboardData,
        isLoading,
        isError,
        refetch
    } = useDashboardStats();

    if (isLoading) {
        return (
            <Card className="h-full border-0 shadow-lg rounded-2xl bg-white dark:bg-gray-900">
                <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800/60">
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-3 w-48" />
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-3 p-2">
                            <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-2/3" />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (isError) {
        return (
            <Card className="h-full border-0 shadow-lg rounded-2xl bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
                <AlertCircle className="h-8 w-8 mb-3 text-red-500 opacity-80" />
                <p className="font-medium text-sm text-red-600 dark:text-red-400 mb-4">
                    Failed to load recent activity
                </p>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                </Button>
            </Card>
        );
    }

    const activities = dashboardData?.recentActivity || [];

    const getIconForType = (type: string) => {
        switch (type) {
            case 'id_card': return <CreditCard className="w-4 h-4 text-blue-500" />;
            case 'certificate': return <Award className="w-4 h-4 text-amber-500" />;
            case 'approval': return <UserCheck className="w-4 h-4 text-emerald-500" />;
            default: return <Activity className="w-4 h-4 text-gray-500" />;
        }
    };

    return (
        <Card className="h-full border-0 shadow-lg rounded-2xl bg-white dark:bg-gray-900">
            <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800/60">
                <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
                <CardDescription className="text-xs">Latest actions across your institution</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
                {activities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-10 opacity-60">
                        <Activity className="h-10 w-10 text-gray-400 mb-3" />
                        <p className="text-sm font-medium">No recent activity yet.</p>
                        <p className="text-xs text-muted-foreground mt-1">Actions performed will appear here.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {activities.map((activity, index) => (
                            <div
                                key={`${activity.timestamp}-${index}`}
                                className="flex items-start gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
                            >
                                <div className="mt-0.5 p-2 rounded-full bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                                    {getIconForType(activity.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-[13px] text-gray-700 dark:text-gray-200 line-clamp-2 leading-snug">
                                        {activity.description}
                                    </p>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
