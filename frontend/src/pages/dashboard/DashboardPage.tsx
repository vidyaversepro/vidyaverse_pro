import { useSession } from '@/lib/auth.client';
import { usePageInstitution } from '@/hooks/usePageInstitution';
import { useMyInstitutionRole } from '@/lib/queries/auth-queries';
import { PageLoader } from '@/lib/lazy-page';
import { lazy, Suspense } from 'react';

const SuperAdminDashboardView = lazy(
  () => import('./views/SuperAdminDashboardView'),
);
const MainAdminDashboardView = lazy(
  () => import('./views/MainAdminDashboardView'),
);
const SchoolAdminDashboardView = lazy(
  () => import('./views/SchoolAdminDashboardView'),
);
const TeacherDashboardView = lazy(
  () => import('./views/TeacherDashboardView'),
);

export default function DashboardPage() {
  const { data: session } = useSession();
  const globalRole = (session?.user as { globalRole?: string })?.globalRole;
  const institutionId = usePageInstitution();

  // Only fetch institutionRole when the user is an institution-scoped admin.
  // super_admin never needs it — skip the request entirely for them.
  const { data: institutionRole, isLoading } = useMyInstitutionRole(
    globalRole !== 'super_admin' ? institutionId : undefined,
  );

  // super_admin: platform-wide view, no institution role needed
  if (globalRole === 'super_admin') {
    return (
      <Suspense fallback={<PageLoader />}>
        <SuperAdminDashboardView />
      </Suspense>
    );
  }

  // institution-scoped admin: wait for role resolution
  if (isLoading) return <PageLoader />;

  return (
    <Suspense fallback={<PageLoader />}>
      {institutionRole === 'teacher' ? (
        <TeacherDashboardView />
      ) : institutionRole === 'school_admin' ? (
        <SchoolAdminDashboardView />
      ) : (
        <MainAdminDashboardView />
      )}
    </Suspense>
  );
}
