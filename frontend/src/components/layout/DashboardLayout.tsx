import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    CreditCard,
    FileText,
    Camera,
    Award,
    Briefcase,
    ClipboardList,
    BarChart3,
    Library,
    FileCheck,
    Settings,
    LogOut,
    Sun,
    Moon,
    X,
    BookOpen,
    Heart,
    Activity,
    Contact,
    MessageCircle,
    UserPlus,
    Bus,
    Wallet,
    Landmark,
    CalendarClock,
    BookMarked,
    Sparkles,
    KeyRound,
    Building2,
    Package,
    HeartPulse,
    UserCheck,
    GraduationCap as GradCap,
    ClipboardList as ClipboardListIcon,
    Megaphone,
    BarChart3 as BarChart,
    Building,
    Fingerprint,
    Percent,
    Video,
    Smartphone,
    FileQuestion,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/auth.client';
import { useThemeStore } from '@/stores/theme.store';
import { useLayoutStore } from '@/stores/layout.store';
import { useMyEntitlements } from '@/lib/queries/admin/entitlements-queries';
import { cn } from '@/lib/utils';
import NotificationBell from '@/components/layout/NotificationBell';
import UserProfileDropdown from '@/components/layout/UserProfileDropdown';
import HamburgerButton from '@/components/layout/HamburgerButton';
import InstitutionSwitcher from '@/components/layout/InstitutionSwitcher';

type SidebarItem = { label: string; icon: typeof LayoutDashboard; href: string; module?: string };

const adminSidebarItems: SidebarItem[] = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/app/dashboard' },
    { label: 'Institutions', icon: GraduationCap, href: '/app/institutions' },
    { label: 'Users', icon: Users, href: '/app/users' },
    { label: 'Students', icon: Users, href: '/app/students' },
    { label: 'Visiting Cards', icon: Contact, href: '/app/visiting-cards', module: 'visiting_card' },
    { label: 'ID Cards', icon: CreditCard, href: '/app/id-cards', module: 'id_card' },
    { label: 'Group Photos', icon: Camera, href: '/app/group-photos', module: 'group_photo' },
    { label: 'Certificates', icon: Award, href: '/app/certificates', module: 'certificate' },
    { label: 'Communications', icon: MessageCircle, href: '/app/communications', module: 'whatsapp_messaging' },
    { label: 'Admissions', icon: UserPlus, href: '/app/admissions', module: 'admissions_crm' },
    { label: 'Transport', icon: Bus, href: '/app/transport', module: 'transport' },
    { label: 'HR & Payroll', icon: Wallet, href: '/app/hr', module: 'hr_payroll' },
    { label: 'Finance', icon: Landmark, href: '/app/finance', module: 'finance_accounting' },
    { label: 'Timetable', icon: CalendarClock, href: '/app/timetable', module: 'timetable' },
    { label: 'Library', icon: BookMarked, href: '/app/library', module: 'library' },
    { label: 'AI Tutor', icon: Sparkles, href: '/app/ai-tutor', module: 'ai_tutor' },
    { label: 'Gradebook (CCE)', icon: GradCap, href: '/app/gradebook', module: 'gradebook_cce' },
    { label: 'Assignments', icon: ClipboardListIcon, href: '/app/assignments', module: 'assignments' },
    { label: 'Online Tests', icon: FileQuestion, href: '/app/online-tests', module: 'assessments_online' },
    { label: 'Hostel & Mess', icon: Building2, href: '/app/hostel', module: 'hostel' },
    { label: 'Inventory', icon: Package, href: '/app/inventory', module: 'inventory' },
    { label: 'Health', icon: HeartPulse, href: '/app/health', module: 'health' },
    { label: 'Visitor', icon: UserCheck, href: '/app/visitor', module: 'visitor' },
    { label: 'Notices & Calendar', icon: Megaphone, href: '/app/notices', module: 'notices_events' },
    { label: 'Reports & BI', icon: BarChart, href: '/app/reports', module: 'reports_bi' },
    { label: 'Alumni', icon: GradCap, href: '/app/alumni', module: 'alumni' },
    { label: 'Placement', icon: Building, href: '/app/placement', module: 'placement' },
    { label: 'Biometric', icon: Fingerprint, href: '/app/biometric', module: 'attendance_biometric' },
    { label: 'Concessions & EMI', icon: Percent, href: '/app/fees-advanced', module: 'fees_advanced' },
    { label: 'Live Classes', icon: Video, href: '/app/live-classes', module: 'live_classes' },
    { label: 'Mobile App', icon: Smartphone, href: '/app/mobile-app', module: 'mobile_app' },
    { label: 'Portfolios', icon: Briefcase, href: '/app/portfolios', module: 'portfolio' },
    { label: 'Exam Schedules', icon: ClipboardList, href: '/app/hall-tickets/exam-schedules', module: 'examination' },
    { label: 'Hall Tickets', icon: ClipboardList, href: '/app/hall-tickets', module: 'hall_ticket' },
    { label: 'Marksheets', icon: BarChart3, href: '/app/marksheets', module: 'marksheet' },
    { label: 'Library Cards', icon: Library, href: '/app/library-cards', module: 'library_card' },
    { label: 'Transfer Certs', icon: FileCheck, href: '/app/transfer-certificates', module: 'transfer_certificate' },
    { label: 'Jobs', icon: Activity, href: '/app/jobs' },
    { label: 'Templates', icon: FileText, href: '/app/templates' },
    { label: 'Visionarium', icon: BookOpen, href: '/app/visionarium', module: 'visionarium' },
    { label: 'Saathi Network', icon: Heart, href: '/app/saathi', module: 'social' },
    { label: 'OAuth Clients', icon: KeyRound, href: '/app/oauth-clients' },
    { label: 'Settings', icon: Settings, href: '/app/settings' },
];

const studentSidebarItems: SidebarItem[] = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/student/dashboard' },
    { label: 'Saathi Feed', icon: Heart, href: '/student/feed' },
    { label: 'Connections', icon: Users, href: '/student/connections' },
    { label: 'Visionarium', icon: BookOpen, href: '/student/visionarium' },
    { label: 'Settings', icon: Settings, href: '/student/settings' },
];

export default function DashboardLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { sidebarOpen, mobileSidebar, setMobileSidebar } = useLayoutStore();
    const { isDarkMode, toggleDarkMode } = useThemeStore();
    const { data: myEnt } = useMyEntitlements();

    // Pick sidebar items based on whether we are in admin or student routes
    const isStudentRoute = location.pathname.startsWith('/student');
    const sidebarItems = isStudentRoute ? studentSidebarItems : adminSidebarItems;
    const homeLink = isStudentRoute ? '/student/feed' : '/app/dashboard';

    // Gate nav by the institution's enabled modules. Fail-open: items without a
    // module key, or when entitlements aren't available (e.g. super-admin without
    // an active institution), are always shown.
    const enabledSet =
        !isStudentRoute && myEnt
            ? new Set<string>([...(myEnt.enabledModules ?? []), ...(myEnt.coreModules ?? [])])
            : null;
    const visibleItems = sidebarItems.filter((i) => !i.module || !enabledSet || enabledSet.has(i.module));

    const handleLogout = async () => {
        await signOut({
            fetchOptions: {
                onSuccess: () => {
                    navigate('/login');
                }
            }
        });
    };

    const currentPage = sidebarItems.find((i) => location.pathname.startsWith(i.href))?.label || (isStudentRoute ? 'Saathi Feed' : 'Dashboard');

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors flex">
            {/* ─── Sidebar ─── */}
            <aside
                className={cn(
                    'fixed left-0 top-0 z-40 h-screen flex flex-col transition-all duration-300 ease-in-out',
                    'bg-white dark:bg-gray-900 border-r border-gray-200/80 dark:border-gray-800',
                    /* Desktop Width */
                    'max-lg:w-64',
                    sidebarOpen ? 'lg:w-64' : 'lg:w-[72px]',
                    /* Mobile Visibility */
                    mobileSidebar ? 'translate-x-0' : 'max-lg:-translate-x-full lg:translate-x-0'
                )}
            >
                {/* Logo */}
                <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200/80 dark:border-gray-800 shrink-0 overflow-hidden">
                    <Link to={homeLink} className={cn('flex items-center gap-2.5 transition-all outline-none', sidebarOpen ? 'w-auto opacity-100' : 'w-0 opacity-0 overflow-hidden')}>
                        <img src="/vidyaverse-logo.png" alt="Vidyaverse" className="h-7 min-w-max" />
                    </Link>

                    {/* Collapsed Logo view */}
                    {!sidebarOpen && (
                        <div className="hidden lg:flex w-full items-center justify-center">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E63946] to-[#C41E3A] flex items-center justify-center font-bold text-white shadow-sm">
                                V
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => setMobileSidebar(false)}
                        className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>

                {/* Navigation */}
                <TooltipProvider delayDuration={0}>
                    <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1 custom-scrollbar">
                        {visibleItems.map((item) => {
                            const isActive = location.pathname.startsWith(item.href);

                            const linkContent = (
                                <Link
                                    to={item.href}
                                    onClick={() => setMobileSidebar(false)}
                                    className={cn(
                                        'flex items-center px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group outline-none',
                                        sidebarOpen ? 'justify-start gap-3' : 'justify-center lg:px-0',
                                        isActive
                                            ? 'bg-red-50 text-[#E63946] dark:bg-red-950/40 dark:text-red-400 shadow-sm'
                                            : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/60 dark:hover:text-gray-200'
                                    )}
                                >
                                    <item.icon className={cn('w-5 h-5 shrink-0 transition-colors', isActive ? 'text-[#E63946] dark:text-red-400' : 'group-hover:text-gray-900 dark:group-hover:text-white')} />
                                    <span
                                        className={cn(
                                            'transition-all duration-300 whitespace-nowrap overflow-hidden',
                                            sidebarOpen ? 'opacity-100 max-w-[200px]' : 'opacity-0 max-w-0 lg:hidden'
                                        )}
                                    >
                                        {item.label}
                                    </span>
                                </Link>
                            );

                            return (
                                <div key={item.href}>
                                    {!sidebarOpen ? (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                {linkContent}
                                            </TooltipTrigger>
                                            <TooltipContent side="right" className="ml-2 bg-gray-900 text-white border-gray-800 text-xs">
                                                {item.label}
                                            </TooltipContent>
                                        </Tooltip>
                                    ) : (
                                        linkContent
                                    )}
                                </div>
                            );
                        })}
                    </nav>
                </TooltipProvider>

                {/* User & Logout */}
                <div className="border-t border-gray-200/80 dark:border-gray-800 p-3 shrink-0">
                    <button
                        onClick={handleLogout}
                        className={cn(
                            "flex items-center px-3 py-2 rounded-xl text-[13px] font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors w-full group outline-none",
                            sidebarOpen ? 'justify-start gap-3' : 'justify-center lg:px-0 lg:bg-transparent lg:hover:bg-red-50 dark:lg:hover:bg-red-950/30'
                        )}
                        aria-label="Logout"
                    >
                        <LogOut className="w-5 h-5 shrink-0 text-red-500 group-hover:text-red-600" />
                        <span className={cn('transition-all duration-300 whitespace-nowrap overflow-hidden', sidebarOpen ? 'opacity-100 max-w-[200px]' : 'opacity-0 max-w-0 lg:hidden')}>
                            Logout
                        </span>
                    </button>
                </div>
            </aside>

            {/* Mobile overlay */}
            <AnimatePresence>
                {mobileSidebar && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.4 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMobileSidebar(false)}
                        className="fixed inset-0 bg-black z-30 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* ─── Main Content ─── */}
            <div className={cn('flex-1 transition-all duration-300 ease-in-out flex flex-col min-w-0', sidebarOpen ? 'lg:pl-64' : 'lg:pl-[72px]')}>
                {/* Top bar — glass effect */}
                <header className="sticky top-0 z-20 h-16 flex items-center justify-between px-4 lg:px-6 border-b border-gray-200/60 dark:border-gray-800/60 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl">
                    <div className="flex items-center gap-2">
                        <HamburgerButton />
                        <h1 className="text-base font-semibold text-gray-900 dark:text-white ml-2">
                            {currentPage}
                        </h1>
                    </div>

                    <div className="flex items-center gap-1.5">
                        {/* Active institution — hidden for student-role routes */}
                        {!isStudentRoute && <InstitutionSwitcher />}

                        {/* Theme toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleDarkMode}
                            className="rounded-xl w-9 h-9 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            {isDarkMode ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
                        </Button>

                        {/* Notifications */}
                        <NotificationBell />

                        {/* User Profile Dropdown */}
                        <UserProfileDropdown />
                    </div>
                </header>

                {/* Page content */}
                <main className="p-4 lg:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
