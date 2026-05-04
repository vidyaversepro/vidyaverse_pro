import { useSession } from '@/lib/auth.client';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsBar } from '@/components/dashboard/StatsBar';
import { EnrollmentTrendChart } from '@/components/dashboard/EnrollmentTrendChart';
import { RecentActivityFeed } from '@/components/dashboard/RecentActivityFeed';
import { InstitutionsOverviewTable } from '@/components/dashboard/InstitutionsOverviewTable';
import { QuickActionsPanel } from '@/components/dashboard/QuickActionsPanel';

export default function DashboardPage() {
    const { data: session } = useSession();
    const userName = session?.user?.name || 'Admin';

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-8">
            <PageHeader
                breadcrumb={[{ label: 'Dashboard' }]}
                title="Overview"
                description={`Welcome back, ${userName}! Here's what's happening today.`}
            />

            {/* Stats Row */}
            <StatsBar />

            {/* Main Content Grid: Chart + Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <EnrollmentTrendChart />
                </div>
                <div className="lg:col-span-1">
                    <RecentActivityFeed />
                </div>
            </div>

            {/* Secondary Content Grid: Institutions + Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <InstitutionsOverviewTable />
                </div>
                <div className="lg:col-span-1">
                    <QuickActionsPanel />
                </div>
            </div>
        </div>
    );
}
