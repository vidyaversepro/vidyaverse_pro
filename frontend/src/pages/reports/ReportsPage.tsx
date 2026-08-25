import { Users, IndianRupee, TrendingUp, Briefcase, BarChart3 } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { NeutralPill, TONE } from '@/components/shared/Pill';
import {
  useReportsOverview,
  useFeeCollection,
  useAdmissionsFunnel,
  useStaffByDepartment,
} from '@/lib/queries/reports/reports-queries';

export default function ReportsPage() {
  const { data: overview } = useReportsOverview();
  const { data: fee } = useFeeCollection();
  const { data: funnel } = useAdmissionsFunnel();
  const { data: depts } = useStaffByDepartment();

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <PageHeader
        breadcrumb={[{ label: 'Insights' }, { label: 'Custom Reports / BI' }]}
        title="Reports & Business Intelligence"
        description="Cross-module KPIs and management dashboards"
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard title="Active Students" value={overview?.activeStudents ?? 0} icon={Users} tone="teal" />
        <StatCard title="Staff" value={overview?.staffCount ?? 0} icon={Briefcase} tone="indigo" />
        <StatCard title="Fees Collected" value={'₹' + (overview?.feeCollected ?? 0).toLocaleString('en-IN')} icon={IndianRupee} tone="gold" />
        <StatCard title="Outstanding" value={'₹' + (overview?.feeOutstanding ?? 0).toLocaleString('en-IN')} icon={IndianRupee} tone="saffron" />
        <StatCard title="Enquiries" value={overview?.totalEnquiries ?? 0} icon={TrendingUp} tone="lotus" className="col-span-2 lg:col-span-1" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl">
          <CardContent className="p-4 sm:p-5">
            <h3 className="mb-3 flex items-center gap-2 font-semibold"><IndianRupee className="h-4 w-4" /> Fee Collection</h3>
            {!fee ? <p className="text-sm text-muted-foreground">Loading…</p> : (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-2"><span className="text-muted-foreground">Billed</span><span className="font-medium">₹{fee.billed.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between gap-2"><span className="text-muted-foreground">Collected</span><span className="font-medium" style={{ color: TONE.green }}>₹{fee.collected.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between gap-2"><span className="text-muted-foreground">Outstanding</span><span className="font-medium" style={{ color: TONE.temple }}>₹{fee.outstanding.toLocaleString('en-IN')}</span></div>
                <div className="mt-2 rounded-xl bg-primary/5 p-2 text-center"><span className="text-lg font-bold">{fee.collectionRate}%</span><span className="ml-1 text-xs text-muted-foreground">collection rate</span></div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-4 sm:p-5">
            <h3 className="mb-3 flex items-center gap-2 font-semibold"><TrendingUp className="h-4 w-4" /> Admissions Funnel</h3>
            {!funnel ? <p className="text-sm text-muted-foreground">Loading…</p> : !funnel.total ? <p className="text-sm text-muted-foreground">No enquiries.</p> : (
              <div className="space-y-2 text-sm">
                {Object.entries(funnel.byStatus).map(([status, count]) => (
                  <div key={status} className="flex justify-between gap-2"><span className="capitalize text-muted-foreground">{status}</span><span className="font-medium">{count}</span></div>
                ))}
                <div className="mt-2 rounded-xl bg-primary/5 p-2 text-center"><span className="text-lg font-bold">{funnel.conversionRate}%</span><span className="ml-1 text-xs text-muted-foreground">conversion</span></div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-4 sm:p-5">
            <h3 className="mb-3 flex items-center gap-2 font-semibold"><BarChart3 className="h-4 w-4" /> Staff by Department</h3>
            {!depts?.length ? <p className="text-sm text-muted-foreground">No staff data.</p> : (
              <div className="flex flex-col gap-2.5">
                {depts.map((d) => (
                  <div key={d.department} className="flex items-center justify-between gap-2 rounded-xl border bg-card p-2.5">
                    <span className="text-sm min-w-0 truncate">{d.department}</span>
                    <NeutralPill label={String(d.count)} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
