import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDailyAttendanceStats } from '@/lib/queries/attendance-queries';
import { useFeeSummary } from '@/lib/queries/payments-queries';
import { useEnquiries } from '@/lib/queries/admissions/admissions-queries';
import { Loader2, UserCheck, IndianRupee, CalendarCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  institutionId?: string;
}

export default function SchoolAdminDashboardView({ institutionId }: Props) {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'

  const { data: attendanceStats, isLoading: attLoading } =
    useDailyAttendanceStats(institutionId ?? '', today);
  const { data: feeSummary, isLoading: feeLoading } = useFeeSummary(institutionId ?? '');
  const { data: enquiriesData } = useEnquiries();

  const allEnquiries = enquiriesData ?? [];

  const pendingEnquiries = allEnquiries.filter(
    (e) => !['admitted', 'lost'].includes(e.status)
  );

  const outstanding = feeSummary?.outstanding ?? 0;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">School Operations</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Present Today</CardDescription>
            {attLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mt-1" />
            ) : (
              <CardTitle className="text-2xl flex items-center gap-1">
                <UserCheck className="h-5 w-5 text-green-500" />
                {attendanceStats?.totals?.present ?? '—'}
              </CardTitle>
            )}
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Outstanding Fees</CardDescription>
            {feeLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mt-1" />
            ) : (
              <CardTitle className="text-2xl flex items-center gap-1">
                <IndianRupee className="h-5 w-5 text-amber-500" />
                {outstanding.toLocaleString('en-IN')}
              </CardTitle>
            )}
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Enquiries</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-1">
              <CalendarCheck className="h-5 w-5 text-blue-500" />
              {pendingEnquiries.length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Detail cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Attendance Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {attLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : attendanceStats ? (
              <div className="space-y-3">
                {[
                  { label: 'Present', value: attendanceStats.totals.present, color: 'text-green-600' },
                  { label: 'Absent',  value: attendanceStats.totals.absent,  color: 'text-red-600'   },
                  { label: 'Late',    value: attendanceStats.totals.late,    color: 'text-amber-600' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className={`font-semibold ${color}`}>{value ?? 0}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No sessions marked today
              </p>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-4"
              onClick={() => navigate('/app/attendance')}
            >
              Manage attendance <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pending Admissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingEnquiries.length > 0
              ? pendingEnquiries.slice(0, 6).map((e) => (
                  <div key={e.id} className="flex items-center justify-between text-sm">
                    <span className="truncate max-w-[160px] font-medium">{e.studentName}</span>
                    <Badge variant="secondary" className="capitalize shrink-0 ml-2">
                      {e.status}
                    </Badge>
                  </div>
                ))
              : (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No pending enquiries
                </p>
              )
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
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {[
            { label: 'Mark Attendance', path: '/app/attendance' },
            { label: 'Fee Collection',  path: '/app/fees'       },
            { label: 'Student Records', path: '/app/students'   },
            { label: 'Post Notice',     path: '/app/notices'    },
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
