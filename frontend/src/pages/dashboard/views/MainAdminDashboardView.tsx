import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { useFeeSummary } from '@/lib/queries/payments-queries';
import { usePipelineStats, useEnquiries } from '@/lib/queries/admissions/admissions-queries';
import {
  Loader2,
  TrendingUp,
  IndianRupee,
  Users,
  ClipboardList,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  institutionId?: string;
}

const PIPELINE_STAGES: Array<{ key: string; label: string }> = [
  { key: 'new', label: 'New' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'visited', label: 'Visited' },
  { key: 'application', label: 'Application' },
  { key: 'admitted', label: 'Admitted' },
  { key: 'lost', label: 'Lost' },
];

export default function MainAdminDashboardView({ institutionId }: Props) {
  const navigate = useNavigate();

  const { data: feeSummary, isLoading: feeLoading } = useFeeSummary(institutionId ?? '');
  const { data: pipelineStats, isLoading: pipelineLoading } = usePipelineStats();
  const { data: enquiriesData } = useEnquiries();

  // Defensive unpacking — handles { data: [...] }, { enquiries: [...] }, or bare array
  const recentEnquiries = (enquiriesData ?? []).slice(0, 5);

  const collected = feeSummary?.totalCollected ?? 0;
  const outstanding = feeSummary?.outstanding ?? 0;
  const collectionRate = feeSummary?.collectionRate ?? 0;

  if (feeLoading || pipelineLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-8">
      <PageHeader
        breadcrumb={[{ label: 'Dashboard' }]}
        title="Institution Dashboard"
        description={new Date().toLocaleDateString('en-IN', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      />

      {/* Fee summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Collected" value={`₹${collected.toLocaleString('en-IN')}`} icon={IndianRupee} tone="teal" />
        <StatCard title="Outstanding" value={`₹${outstanding.toLocaleString('en-IN')}`} icon={IndianRupee} tone="gold" />
        <StatCard title="Collection Rate" value={`${collectionRate.toFixed(1)}%`} icon={TrendingUp} tone="indigo" />
      </div>

      {/* Pipeline + recent enquiries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Admissions Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pipelineStats
              ? PIPELINE_STAGES.map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <Badge variant="secondary">{(pipelineStats as any)[key] ?? 0}</Badge>
                  </div>
                ))
              : <p className="text-sm text-muted-foreground">No pipeline data</p>
            }
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2"
              onClick={() => navigate('/app/admissions')}
            >
              View pipeline <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Recent Enquiries
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentEnquiries.length > 0
              ? recentEnquiries.map((e) => (
                  <div key={e.id} className="flex items-center justify-between text-sm">
                    <span className="font-medium truncate max-w-[160px]">{e.studentName}</span>
                    <Badge
                      variant={e.status === 'admitted' ? 'default' : 'secondary'}
                      className="capitalize shrink-0 ml-2"
                    >
                      {e.status}
                    </Badge>
                  </div>
                ))
              : <p className="text-sm text-muted-foreground">No enquiries yet</p>
            }
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2"
              onClick={() => navigate('/app/admissions')}
            >
              View all <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {[
            { label: 'Add Student',    path: '/app/students'   },
            { label: 'Create Invoice', path: '/app/fees'       },
            { label: 'New Enquiry',    path: '/app/admissions' },
            { label: 'Post Notice',    path: '/app/notices'    },
            { label: 'View Reports',   path: '/app/reports'    },
          ].map(({ label, path }) => (
            <Button key={label} variant="outline" size="sm" onClick={() => navigate(path)}>
              {label}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
