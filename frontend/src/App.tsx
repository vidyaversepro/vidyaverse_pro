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
const VerifyEmailPage = lazyPage(() => import('@/pages/auth/VerifyEmailPage'));

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
const MarksheetsPage = lazyPage(() => import('@/pages/marksheets/MarksheetsPage'));
const TransferCertificatesPage = lazyPage(() => import('@/pages/transfer-certificates/TransferCertificatesPage'));

// Communications (Urmi assimilation — WhatsApp parent comms)
const CommunicationsPage = lazyPage(() => import('@/pages/communications/CommunicationsPage'));
const AdmissionsPage = lazyPage(() => import('@/pages/admissions/AdmissionsPage'));
const TransportPage = lazyPage(() => import('@/pages/transport/TransportPage'));
const HRPage = lazyPage(() => import('@/pages/hr/HRPage'));
const FinancePage = lazyPage(() => import('@/pages/finance/FinancePage'));
const FeesPage = lazyPage(() => import('@/pages/fees/FeesPage'));
const TimetablePage = lazyPage(() => import('@/pages/timetable/TimetablePage'));
const LibraryIntegrationPage = lazyPage(() => import('@/pages/integrations/LibraryPage'));
const AITutorPage = lazyPage(() => import('@/pages/integrations/AITutorPage'));

// ERP Operations cluster
const HostelPage = lazyPage(() => import('@/pages/hostel/HostelPage'));
const InventoryPage = lazyPage(() => import('@/pages/inventory/InventoryPage'));
const HealthPage = lazyPage(() => import('@/pages/health/HealthPage'));
const VisitorPage = lazyPage(() => import('@/pages/visitor/VisitorPage'));

// ERP Academics cluster
const GradebookPage = lazyPage(() => import('@/pages/gradebook/GradebookPage'));
const AssignmentsPage = lazyPage(() => import('@/pages/assignments/AssignmentsPage'));
const OnlineTestsPage = lazyPage(() => import('@/pages/online-tests/OnlineTestsPage'));

// ERP Insights cluster
const NoticesPage = lazyPage(() => import('@/pages/notices/NoticesPage'));
const ReportsPage = lazyPage(() => import('@/pages/reports/ReportsPage'));
const AlumniPage = lazyPage(() => import('@/pages/alumni/AlumniPage'));
const PlacementPage = lazyPage(() => import('@/pages/placement/PlacementPage'));

// ERP Extensions cluster
const BiometricPage = lazyPage(() => import('@/pages/biometric/BiometricPage'));
const FeesAdvancedPage = lazyPage(() => import('@/pages/fees-advanced/FeesAdvancedPage'));
const LiveClassesPage = lazyPage(() => import('@/pages/live-classes/LiveClassesPage'));
const MobileAppPage = lazyPage(() => import('@/pages/mobile-app/MobileAppPage'));
const AttendancePage = lazyPage(() => import('@/pages/attendance/AttendancePage'));
const AttendanceSessionDetailsPage = lazyPage(() => import('@/pages/attendance/AttendanceSessionDetailsPage'));

// Ops
const JobDashboardPage = lazyPage(() => import('@/pages/ops/JobDashboardPage'));

// Visionarium
const VisionariumPage = lazyPage(() => import('@/pages/visionarium/VisionariumPage'));
const TestSeriesPage = lazyPage(() => import('@/pages/visionarium/TestSeriesPage'));
const SubmissionsPage = lazyPage(() => import('@/pages/visionarium/SubmissionsPage'));

// Saathi
const SaathiFeedPage = lazyPage(() => import('@/pages/saathi/SaathiFeedPage'));
const StudentDashboardPage = lazyPage(() => import('@/pages/student-dashboard/StudentDashboardPage'));
const SaathiConnectionsPage = lazyPage(() => import('@/pages/saathi/SaathiConnectionsPage'));
const SaathiCallPage = lazyPage(() => import('@/pages/saathi/SaathiCallPage'));

// Onboarding
const StudentOnboardingPage = lazyPage(() => import('@/pages/onboard/StudentOnboardingPage'));
const StudentPhotoUploadPage = lazyPage(() => import('@/pages/onboard/StudentPhotoUploadPage'));

// OIDC federation (Phase 2 — Vidyaverse as IdP for PDLMS / DCP)
const ConsentPage = lazyPage(() => import('@/pages/oauth/ConsentPage'));
const OAuthClientsPage = lazyPage(() => import('@/pages/admin/OAuthClientsPage'));

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
                    {/* Deliberately NOT behind PublicRoute: autoSignInAfterVerification
                        means a user who just clicked the link arrives here already
                        signed in, and PublicRoute would bounce them before they see
                        the confirmation. */}
                    <Route path="/verify-email" element={<VerifyEmailPage />} />
                    <Route path="/oauth/consent" element={<ConsentPage />} />

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
                        <Route path="communications" element={<CommunicationsPage />} />
                        <Route path="admissions" element={<AdmissionsPage />} />
                        <Route path="transport" element={<TransportPage />} />
                        <Route path="hr" element={<HRPage />} />
                        <Route path="finance" element={<FinancePage />} />
                        <Route path="fees" element={<FeesPage />} />
                        <Route path="attendance" element={<AttendancePage />} />
                        <Route path="attendance/sessions/:id" element={<AttendanceSessionDetailsPage />} />
                        <Route path="timetable" element={<TimetablePage />} />
                        <Route path="library" element={<LibraryIntegrationPage />} />
                        <Route path="ai-tutor" element={<AITutorPage />} />
                        <Route path="hostel" element={<HostelPage />} />
                        <Route path="inventory" element={<InventoryPage />} />
                        <Route path="health" element={<HealthPage />} />
                        <Route path="visitor" element={<VisitorPage />} />
                        <Route path="gradebook" element={<GradebookPage />} />
                        <Route path="assignments" element={<AssignmentsPage />} />
                        <Route path="online-tests" element={<OnlineTestsPage />} />
                        <Route path="notices" element={<NoticesPage />} />
                        <Route path="reports" element={<ReportsPage />} />
                        <Route path="alumni" element={<AlumniPage />} />
                        <Route path="placement" element={<PlacementPage />} />
                        <Route path="biometric" element={<BiometricPage />} />
                        <Route path="fees-advanced" element={<FeesAdvancedPage />} />
                        <Route path="live-classes" element={<LiveClassesPage />} />
                        <Route path="mobile-app" element={<MobileAppPage />} />
                        <Route path="templates" element={<TemplatesPage />} />
                        <Route path="group-photos" element={<GroupPhotosPage />} />
                        <Route path="hall-tickets" element={<ErrorBoundary><Suspense fallback={<PageLoader />}><HallTicketsPage /></Suspense></ErrorBoundary>} />
                        <Route path="hall-tickets/exam-schedules" element={<ErrorBoundary><Suspense fallback={<PageLoader />}><ExamSchedulesPage /></Suspense></ErrorBoundary>} />
                        <Route path="library-cards" element={<ErrorBoundary><Suspense fallback={<PageLoader />}><LibraryCardsPage /></Suspense></ErrorBoundary>} />
                        <Route path="marksheets" element={<ErrorBoundary><Suspense fallback={<PageLoader />}><MarksheetsPage /></Suspense></ErrorBoundary>} />
                        <Route path="marksheets/entry" element={<ErrorBoundary><Suspense fallback={<PageLoader />}><MarksEntryPage /></Suspense></ErrorBoundary>} />
                        <Route path="transfer-certificates" element={<ErrorBoundary><Suspense fallback={<PageLoader />}><TransferCertificatesPage /></Suspense></ErrorBoundary>} />
                        <Route path="jobs" element={<ErrorBoundary><Suspense fallback={<PageLoader />}><JobDashboardPage /></Suspense></ErrorBoundary>} />
                        <Route path="settings" element={<SettingsPage />} />
                        <Route path="oauth-clients" element={<OAuthClientsPage />} />
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

                    {/* Isolated Full-Screen Call Route */}
                    <Route
                        path="/student/call"
                        element={<ProtectedRoute><ErrorBoundary><SaathiCallPage /></ErrorBoundary></ProtectedRoute>}
                    />

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
                        <Route index element={<Navigate to="/student/dashboard" replace />} />
                        <Route path="feed" element={<SaathiFeedPage />} />
                        <Route path="dashboard" element={<StudentDashboardPage />} />
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
