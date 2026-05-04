import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useStudentAnalytics } from '@/lib/queries/analytics/analytics-queries';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, RefreshCw, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function EnrollmentTrendChart() {
    const {
        data,
        isLoading,
        isError,
        refetch
    } = useStudentAnalytics();

    if (isLoading) {
        return (
            <Card className="h-[350px] border-0 shadow-lg rounded-2xl bg-white dark:bg-gray-900 flex flex-col">
                <CardHeader className="pb-2 flex-none">
                    <Skeleton className="h-5 w-40 mb-1" />
                    <Skeleton className="h-3 w-56" />
                </CardHeader>
                <CardContent className="flex-1 flex items-end">
                    <Skeleton className="w-full h-4/5 rounded-t-xl" />
                </CardContent>
            </Card>
        );
    }

    if (isError) {
        return (
            <Card className="h-[350px] border-0 shadow-lg rounded-2xl bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-8 text-center text-red-600 dark:text-red-400">
                <AlertCircle className="h-8 w-8 mb-3 opacity-80" />
                <p className="font-medium text-sm mb-4">Failed to load enrollment data</p>
                <Button variant="outline" size="sm" onClick={() => refetch()} className="bg-white dark:bg-gray-900">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                </Button>
            </Card>
        );
    }

    // Recharts requires the array in forward chronological order. 
    // The API might return it with the newest first or oldest first. 
    // Assuming the backend returns standard chronological order 12 months.
    const chartData = data?.monthlyEnrollments && data.monthlyEnrollments.length > 0
        ? [...data.monthlyEnrollments].reverse() // Reverse if the backend returned desc
        : [];

    return (
        <Card className="h-[350px] border-0 shadow-lg rounded-2xl bg-white dark:bg-gray-900 flex flex-col">
            <CardHeader className="pb-2 flex-none">
                <CardTitle className="text-base font-semibold">Enrollment Trends</CardTitle>
                <CardDescription className="text-xs">New student registrations over the last 12 months</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 pt-4">
                {chartData.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-60">
                        <TrendingUp className="h-10 w-10 text-gray-400 mb-3" />
                        <p className="text-sm font-medium">No enrollment data yet.</p>
                        <p className="text-xs text-muted-foreground mt-1">Trends will appear once students enroll.</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10 dark:opacity-20" />
                            <XAxis
                                dataKey="month"
                                className="text-xs select-none"
                                tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.6 }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(val) => val.substring(0, 3)}
                            />
                            <YAxis
                                className="text-xs select-none"
                                tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.6 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', cursor: 'default' }}
                                itemStyle={{ color: '#4F46E5', fontWeight: 600, fontSize: '13px' }}
                                labelStyle={{ color: '#6B7280', fontSize: '12px', marginBottom: '4px' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="count"
                                stroke="#4F46E5"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorCount)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}
