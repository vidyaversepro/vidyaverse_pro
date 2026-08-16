import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { CheckCircle2, Clock, Loader2, ArrowRight, CalendarClock, UserCheck, UserX } from 'lucide-react';
import { useAttendanceSessions, useDailyAttendanceStats } from '@/lib/queries/attendance-queries';
import { useNavigate } from 'react-router-dom';

interface Props {
  institutionId?: string;
}

export default function TeacherDashboardView({ institutionId }: Props) {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'

  const { data: sessionsData, isLoading: sessionsLoading } =
    useAttendanceSessions(institutionId ?? '', { date: today, page: 1, limit: 100 } as any);
  const { data: stats, isLoading: statsLoading } =
    useDailyAttendanceStats(institutionId ?? '', today);

  // Defensive unpacking — handles { data: [...] } or bare array
  const allSessions = sessionsData?.data ?? [];

  // Filter to sessions whose date field starts with today's ISO date string
  const todaySessions = allSessions.filter(
    (s) => typeof s.date === 'string' && s.date.startsWith(today)
  );

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-8">
      <PageHeader
        breadcrumb={[{ label: 'Dashboard' }]}
        title="My Classroom"
        description={new Date().toLocaleDateString('en-IN', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Sessions Today" value={sessionsLoading ? '—' : todaySessions.length} icon={CalendarClock} tone="indigo" />
        <StatCard title="Students Present" value={statsLoading ? '—' : (stats?.totals?.present ?? '—')} icon={UserCheck} tone="teal" />
        <StatCard title="Students Absent" value={statsLoading ? '—' : (stats?.totals?.absent ?? '—')} icon={UserX} tone="lotus" />
      </div>

      {/* Session list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Today's Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {sessionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : todaySessions.length > 0 ? (
            <div className="space-y-2">
              {todaySessions.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 cursor-pointer hover:bg-muted/60 transition-colors"
                  onClick={() => navigate(`/app/attendance/sessions/${s.id}`)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {s.status === 'open'
                      ? <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                      : <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    }
                    <div>
                      <p className="text-sm font-medium">
                        {s.section?.name ?? 'Section'}
                        {s.subject ? ` — ${s.subject}` : ''}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={s.status === 'open' ? 'default' : 'secondary'}
                    className="capitalize shrink-0 ml-2"
                  >
                    {s.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No sessions created for today yet
            </p>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-4"
            onClick={() => navigate('/app/attendance')}
          >
            All sessions <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {[
            { label: 'Take Attendance', path: '/app/attendance'  },
            { label: 'Assignments',     path: '/app/assignments' },
            { label: 'Gradebook',       path: '/app/gradebook'   },
            { label: 'My Students',     path: '/app/students'    },
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
