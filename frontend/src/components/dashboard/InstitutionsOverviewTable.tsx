import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useInstitutions } from '@/lib/queries/institution/institution-queries';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, RefreshCw, Building2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export function InstitutionsOverviewTable() {
    const navigate = useNavigate();
    const {
        data,
        isLoading,
        isError,
        refetch
    } = useInstitutions({ limit: 5 });

    if (isLoading) {
        return (
            <Card className="h-full border-0 shadow-lg rounded-2xl bg-white dark:bg-gray-900">
                <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800/60">
                    <Skeleton className="h-5 w-40 mb-1" />
                    <Skeleton className="h-3 w-56" />
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="space-y-4 mt-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center justify-between p-2">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                                <Skeleton className="h-6 w-16 rounded-full" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (isError) {
        return (
            <Card className="h-full border-0 shadow-lg rounded-2xl bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
                <AlertCircle className="h-8 w-8 mb-3 text-red-500 opacity-80" />
                <p className="font-medium text-sm text-red-600 dark:text-red-400 mb-4">
                    Failed to load institutions
                </p>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                </Button>
            </Card>
        );
    }

    const institutions = data?.data || [];

    const getStatusColor = (status: string, isActive: boolean) => {
        if (!isActive) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        switch (status) {
            case 'active': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'trial': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            case 'suspended': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    return (
        <Card className="h-full border-0 shadow-lg rounded-2xl bg-white dark:bg-gray-900 flex flex-col">
            <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800/60 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-base font-semibold">Institutions Overview</CardTitle>
                    <CardDescription className="text-xs">Recently registered or active institutions</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('/app/institutions')}>
                    View All
                </Button>
            </CardHeader>
            <CardContent className="pt-0 flex-1 overflow-auto">
                {institutions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-12 opacity-60 h-full">
                        <Building2 className="h-10 w-10 text-gray-400 mb-3" />
                        <p className="text-sm font-medium">No institutions found.</p>
                        <p className="text-xs text-muted-foreground mt-1">Add an institution to get started.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800/60">
                        {institutions.map((institution) => (
                            <div
                                key={institution.id}
                                className="py-3 flex items-center justify-between group cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/30 rounded-lg px-2 -mx-2 transition-colors"
                                onClick={() => navigate(`/app/institutions/${institution.id}`)}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-medium text-xs">
                                        {institution.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                            {institution.name}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground truncate">
                                            <span>{institution.code}</span>
                                            <span>•</span>
                                            <span>{institution._count?.students || 0} students</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="hidden sm:block text-right">
                                        <Badge variant="outline" className={`border-0 uppercase tracking-wider text-[10px] space-x-0 ${getStatusColor(institution.subscriptionStatus, institution.isActive)}`}>
                                            {!institution.isActive ? 'INACTIVE' : institution.subscriptionStatus}
                                        </Badge>
                                        <p className="text-[10px] text-muted-foreground mt-1">
                                            Joined {format(new Date(institution.createdAt), 'MMM yyyy')}
                                        </p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
