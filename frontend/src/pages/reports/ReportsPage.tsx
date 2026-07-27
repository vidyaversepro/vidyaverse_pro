import { Users, IndianRupee, TrendingUp, Briefcase, BarChart3 } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/PageHeader';
import {
  useReportsOverview,
  useFeeCollection,
  useAdmissionsFunnel,
  useStaffByDepartment,
} from '@/lib/queries/reports/reports-queries';

function Kpi({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="rounded-lg bg-primary/10 p-2"><Icon className="h-5 w-5 text-primary" /></div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ReportsPage() {
  const { data: overview } = useReportsOverview();
  const { data: fee } = useFeeCollection();
  const { data: funnel } = useAdmissionsFunnel();
  const { data: depts } = useStaffByDepartment();

  return (
    <div className="p-6">
      <PageHeader
        breadcrumb={[{ label: 'Insights' }, { label: 'Custom Reports / BI' }]}
        title="Reports & Business Intelligence"
        description="Cross-module KPIs and management dashboards"
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Kpi icon={Users} label="Active Students" value={overview?.activeStudents ?? 0} />
        <Kpi icon={Briefcase} label="Staff" value={overview?.staffCount ?? 0} />
        <Kpi icon={IndianRupee} label="Fees Collected" value={`₹${(overview?.feeCollected ?? 0).toLocaleString('en-IN')}`} />
        <Kpi icon={IndianRupee} label="Outstanding" value={`₹${(overview?.feeOutstanding ?? 0).toLocaleString('en-IN')}`} />
        <Kpi icon={TrendingUp} label="Enquiries" value={overview?.totalEnquiries ?? 0} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-3 flex items-center gap-2 font-semibold"><IndianRupee className="h-4 w-4" /> Fee Collection</h3>
            {!fee ? <p className="text-sm text-muted-foreground">Loading…</p> : (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Billed</span><span className="font-medium">₹{fee.billed.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Collected</span><span className="font-medium text-green-600">₹{fee.collected.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Outstanding</span><span className="font-medium text-amber-600">₹{fee.outstanding.toLocaleString('en-IN')}</span></div>
                <div className="mt-2 rounded-lg bg-primary/5 p-2 text-center"><span className="text-lg font-bold">{fee.collectionRate}%</span><span className="ml-1 text-xs text-muted-foreground">collection rate</span></div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="mb-3 flex items-center gap-2 font-semibold"><TrendingUp className="h-4 w-4" /> Admissions Funnel</h3>
            {!funnel ? <p className="text-sm text-muted-foreground">Loading…</p> : !funnel.total ? <p className="text-sm text-muted-foreground">No enquiries.</p> : (
              <div className="space-y-2 text-sm">
                {Object.entries(funnel.byStatus).map(([status, count]) => (
                  <div key={status} className="flex justify-between"><span className="capitalize text-muted-foreground">{status}</span><span className="font-medium">{count}</span></div>
                ))}
                <div className="mt-2 rounded-lg bg-primary/5 p-2 text-center"><span className="text-lg font-bold">{funnel.conversionRate}%</span><span className="ml-1 text-xs text-muted-foreground">conversion</span></div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="mb-3 flex items-center gap-2 font-semibold"><BarChart3 className="h-4 w-4" /> Staff by Department</h3>
            {!depts?.length ? <p className="text-sm text-muted-foreground">No staff data.</p> : (
              <div className="space-y-2">
                {depts.map((d) => (
                  <div key={d.department} className="flex items-center justify-between rounded-lg border p-2">
                    <span className="text-sm">{d.department}</span>
                    <Badge variant="secondary">{d.count}</Badge>
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
