import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useSession } from '@/lib/auth.client';
import { useThemeStore } from '@/stores/theme.store';
import { lazyPage, PageLoader } from '@/lib/lazy-page';
import { Suspense } from 'react';

// Layout (kept eager — always needed)
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

// =============================================================================
// LAZY-LOADED PAGES — each gets its own chunk + error boundary
// =============================================================================

// Auth
const LandingPage = lazyPage(() => import('@/pages/landing/LandingPage'));
const LoginPage = lazyPage(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazyPage(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazyPage(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazyPage(() => import('@/pages/auth/ResetPasswordPage'));
const AdminSignupPage = lazyPage(() => import('@/pages/auth/AdminSignupPage'));

// Dashboard
const DashboardPage = lazyPage(() => import('@/pages/dashboard/DashboardPage'));
const InstitutionsPage = lazyPage(() => import('@/pages/dashboard/InstitutionsPage'));
const InstitutionDetailPage = lazyPage(() => import('@/pages/dashboard/InstitutionDetailPage'));
const InstitutionOnboardingPage = lazyPage(() => import('@/pages/dashboard/InstitutionOnboardingPage'));
const UsersPage = lazyPage(() => import('@/pages/dashboard/UsersPage'));

// Students
const StudentsPage = lazyPage(() => import('@/pages/students/StudentsPage'));
const ApprovalQueuePage = lazyPage(() => import('@/pages/students/ApprovalQueuePage'));

// Services
const IdCardsPage = lazyPage(() => import('@/pages/id-cards/IdCardsPage'));
const VisitingCardsPage = lazyPage(() => import('@/pages/visiting-cards/VisitingCardsPage'));
const PrintBatchPage = lazyPage(() => import('@/pages/id-cards/PrintBatchPage'));
const CertificatesPage = lazyPage(() => import('@/pages/certificates/CertificatesPage'));
const TemplatesPage = lazyPage(() => import('@/pages/templates/TemplatesPage'));
const TemplateNewPage = lazyPage(() => import('@/pages/templates/TemplateNewPage'));
const TemplateEditorPage = lazyPage(() => import('@/pages/templates/TemplateEditorPage'));
const GroupPhotosPage = lazyPage(() => import('@/pages/group-photos/GroupPhotosPage'));
const SettingsPage = lazyPage(() => import('@/pages/settings/SettingsPage'));
const ExamSchedulesPage = lazyPage(() => import('@/pages/hall-tickets/ExamSchedulesPage'));
const HallTicketsPage = lazyPage(() => import('@/pages/hall-tickets/HallTicketsPage'));
const LibraryCardsPage = lazyPage(() => import('@/pages/library-cards/LibraryCardsPage'));
const MarksEntryPage = lazyPage(() => import('@/pages/marksheets/MarksEntryPage'));
const TransferCertificatesPage = lazyPage(() => import('@/pages/transfer-certificates/TransferCertificatesPage'));

// Ops
const JobDashboardPage = lazyPage(() => import('@/pages/ops/JobDashboardPage'));

// Visionarium
const VisionariumPage = lazyPage(() => import('@/pages/visionarium/VisionariumPage'));
const TestSeriesPage = lazyPage(() => import('@/pages/visionarium/TestSeriesPage'));
const SubmissionsPage = lazyPage(() => import('@/pages/visionarium/SubmissionsPage'));

// Saathi
const SaathiFeedPage = lazyPage(() => import('@/pages/saathi/SaathiFeedPage'));
const SaathiConnectionsPage = lazyPage(() => import('@/pages/saathi/SaathiConnectionsPage'));

// Onboarding
const StudentOnboardingPage = lazyPage(() => import('@/pages/onboard/StudentOnboardingPage'));
const StudentPhotoUploadPage = lazyPage(() => import('@/pages/onboard/StudentPhotoUploadPage'));

// =============================================================================
// ROUTE GUARDS
// =============================================================================

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { data: session, isPending } = useSession();

    if (isPending) {
        return <PageLoader />;
    }

    if (!session) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
    const { data: session, isPending } = useSession();

    if (isPending) {
        return <PageLoader />;
    }

    if (!session) {
        return <Navigate to="/login" replace />;
    }

    const role = (session.user as { globalRole?: string })?.globalRole;
    if (role !== 'super_admin' && role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
    const { data: session, isPending } = useSession();

    if (isPending) {
        return <PageLoader />;
    }

    if (session) {
        const role = (session.user as { globalRole?: string })?.globalRole;
        if (role === 'super_admin' || role === 'admin') {
            return <Navigate to="/app/dashboard" replace />;
        }
        return <Navigate to="/student/feed" replace />;
    }

    return <>{children}</>;
}

// =============================================================================
// THEME SYNC
// =============================================================================

function ThemeSync() {
    const { isDarkMode } = useThemeStore();
    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode);
    }, [isDarkMode]);
    return null;
}

// =============================================================================
// APP
// =============================================================================

export default function App() {
    return (
        <>
            <ThemeSync />
            <TooltipProvider delayDuration={300}>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Routes>
                    {/* Landing Page at ROOT */}
                    <Route
                        path="/"
                        element={
                            <PublicRoute>
                                <LandingPage />
                            </PublicRoute>
                        }
                    />

                    {/* Auth Routes */}
                    <Route
                        path="/login"
                        element={
                            <PublicRoute>
                                <LoginPage />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            <PublicRoute>
                                <RegisterPage />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="/forgot-password"
                        element={
                            <PublicRoute>
                                <ForgotPasswordPage />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="/reset-password"
                        element={
                            <PublicRoute>
                                <ResetPasswordPage />
                            </PublicRoute>
                        }
                    />

                    {/* Admin Setup Route */}
                    <Route
                        path="/admin/setup"
                        element={<AdminSignupPage />}
                    />

                    {/* Protected Dashboard Routes */}
                    <Route
                        path="/app"
                        element={
                            <AdminRoute>
                                <ErrorBoundary>
                                    <DashboardLayout />
                                </ErrorBoundary>
                            </AdminRoute>
                        }
                    >
                        <Route index element={<Navigate to="/app/dashboard" replace />} />
                        <Route path="dashboard" element={<DashboardPage />} />
                        <Route path="institutions" element={<InstitutionsPage />} />
                        <Route path="institutions/:id" element={<InstitutionDetailPage />} />
                        <Route path="institutions/:id/onboarding" element={<InstitutionOnboardingPage />} />
                        <Route path="users" element={<UsersPage />} />
                        <Route path="students" element={<StudentsPage />} />
                        <Route path="students/approval" element={<ApprovalQueuePage />} />
                        <Route path="visiting-cards" element={<VisitingCardsPage />} />
                        <Route path="id-cards" element={<IdCardsPage />} />
                        <Route path="id-cards/print" element={<PrintBatchPage />} />
                        <Route path="certificates" element={<CertificatesPage />} />
                        <Route path="templates" element={<TemplatesPage />} />
                        <Route path="group-photos" element={<GroupPhotosPage />} />
                        <Route path="hall-tickets" element={<ErrorBoundary><Suspense fallback={<PageLoader />}><HallTicketsPage /></Suspense></ErrorBoundary>} />
                        <Route path="hall-tickets/exam-schedules" element={<ErrorBoundary><Suspense fallback={<PageLoader />}><ExamSchedulesPage /></Suspense></ErrorBoundary>} />
                        <Route path="library-cards" element={<ErrorBoundary><Suspense fallback={<PageLoader />}><LibraryCardsPage /></Suspense></ErrorBoundary>} />
                        <Route path="marksheets" element={<ErrorBoundary><Suspense fallback={<PageLoader />}><MarksEntryPage /></Suspense></ErrorBoundary>} />
                        <Route path="transfer-certificates" element={<ErrorBoundary><Suspense fallback={<PageLoader />}><TransferCertificatesPage /></Suspense></ErrorBoundary>} />
                        <Route path="jobs" element={<ErrorBoundary><Suspense fallback={<PageLoader />}><JobDashboardPage /></Suspense></ErrorBoundary>} />
                        <Route path="settings" element={<SettingsPage />} />
                        <Route path="visionarium" element={<VisionariumPage />} />
                        <Route path="visionarium/test-series" element={<TestSeriesPage />} />
                        <Route path="visionarium/submissions" element={<SubmissionsPage />} />
                        <Route path="saathi" element={<SaathiFeedPage />} />
                        <Route path="saathi/connections" element={<SaathiConnectionsPage />} />
                    </Route>

                    {/* Isolated Full-Screen Studio Routes (Bypasses DashboardLayout) */}
                    <Route 
                        path="/app/templates"
                        element={<AdminRoute><ErrorBoundary><Outlet /></ErrorBoundary></AdminRoute>}
                    >
                        <Route path="new" element={<TemplateNewPage />} />
                        <Route path=":id/edit" element={<TemplateEditorPage />} />
                    </Route>

                    {/* Student / User Dashboard Routes */}
                    <Route
                        path="/student"
                        element={
                            <ProtectedRoute>
                                <ErrorBoundary>
                                    <DashboardLayout />
                                </ErrorBoundary>
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Navigate to="/student/feed" replace />} />
                        <Route path="feed" element={<SaathiFeedPage />} />
                        <Route path="connections" element={<SaathiConnectionsPage />} />
                        <Route path="visionarium" element={<VisionariumPage />} />
                        <Route path="visionarium/test-series" element={<TestSeriesPage />} />
                        <Route path="visionarium/submissions" element={<SubmissionsPage />} />
                        <Route path="settings" element={<SettingsPage />} />
                    </Route>

                    {/* Public Onboarding Route */}
                    <Route
                        path="/onboard/:token"
                        element={<StudentOnboardingPage />}
                    />
                    <Route
                        path="/upload-photo/:token"
                        element={<StudentPhotoUploadPage />}
                    />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                <Toaster />
            </BrowserRouter>
            </TooltipProvider>
        </>
    );
}
