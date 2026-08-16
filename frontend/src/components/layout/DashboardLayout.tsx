import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
    LogOut,
    Sun,
    Moon,
    Home,
    LayoutGrid,
    GraduationCap,
    FileText,
    MessageCircle,
    Users,
    BookOpen,
    LayoutDashboard,
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
import { MandalaMark } from '@/design/indic/motifs/mandala-mark';
import {
    adminNavGroups,
    adminSidebarItems,
    studentSidebarItems,
    type NavGroup,
    type SidebarItem,
} from '@/components/layout/nav-config';

type BottomTab = { key: string; label: string; icon: typeof Home; href?: string };

const adminBottomTabs: BottomTab[] = [
    { key: 'home', label: 'Home', icon: Home, href: '/app/dashboard' },
    { key: 'students', label: 'Students', icon: GraduationCap, href: '/app/students' },
    { key: 'docs', label: 'Docs', icon: FileText, href: '/app/id-cards' },
    { key: 'chat', label: 'Chat', icon: MessageCircle, href: '/app/communications' },
    { key: 'more', label: 'More', icon: LayoutGrid },
];

const studentBottomTabs: BottomTab[] = [
    { key: 'home', label: 'Home', icon: Home, href: '/student/feed' },
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/student/dashboard' },
    { key: 'connections', label: 'Connections', icon: Users, href: '/student/connections' },
    { key: 'visionarium', label: 'Visionarium', icon: BookOpen, href: '/student/visionarium' },
    { key: 'more', label: 'More', icon: LayoutGrid },
];

function greeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
}

export default function DashboardLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { sidebarOpen, mobileSidebar, setMobileSidebar } = useLayoutStore();
    const { isDarkMode, toggleDarkMode } = useThemeStore();
    const { data: myEnt } = useMyEntitlements();

    // Pick sidebar items based on whether we are in admin or student routes
    const isStudentRoute = location.pathname.startsWith('/student');
    const flatSidebarItems = isStudentRoute ? studentSidebarItems : adminSidebarItems;
    const homeLink = isStudentRoute ? '/student/feed' : '/app/dashboard';
    const bottomTabs = isStudentRoute ? studentBottomTabs : adminBottomTabs;

    // Gate nav by the institution's enabled modules. Fail-open: items without a
    // module key, or when entitlements aren't available (e.g. super-admin without
    // an active institution), are always shown. Student routes are never gated.
    const enabledSet =
        !isStudentRoute && myEnt
            ? new Set<string>([...(myEnt.enabledModules ?? []), ...(myEnt.coreModules ?? [])])
            : null;
    const isVisible = (i: SidebarItem) => !i.module || !enabledSet || enabledSet.has(i.module);

    // Grouped nav for the desktop sidebar and the mobile "More" sheet — same
    // filtered set feeds both so they never diverge.
    const navGroups: NavGroup[] = isStudentRoute
        ? [{ title: '', items: studentSidebarItems }]
        : adminNavGroups
              .map((g) => ({ title: g.title, items: g.items.filter(isVisible) }))
              .filter((g) => g.items.length > 0);

    const handleLogout = async () => {
        await signOut({
            fetchOptions: {
                onSuccess: () => {
                    navigate('/login');
                }
            }
        });
    };

    const currentPage = flatSidebarItems.find((i) => location.pathname.startsWith(i.href))?.label || (isStudentRoute ? 'Saathi Feed' : 'Dashboard');

    const renderNavLink = (item: SidebarItem, collapsedTooltip: boolean, onClick?: () => void) => {
        const isActive = location.pathname.startsWith(item.href);
        const linkContent = (
            <Link
                to={item.href}
                onClick={onClick}
                className={cn(
                    'flex items-center px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group outline-none',
                    collapsedTooltip ? 'justify-center lg:px-0' : 'justify-start gap-3',
                    isActive ? 'sidebar-indic-active' : 'sidebar-indic-inactive'
                )}
            >
                <item.icon className="w-5 h-5 shrink-0 transition-colors" />
                <span
                    className={cn(
                        'transition-all duration-300 whitespace-nowrap overflow-hidden',
                        collapsedTooltip ? 'opacity-0 max-w-0 lg:hidden' : 'opacity-100 max-w-[200px]'
                    )}
                >
                    {item.label}
                </span>
            </Link>
        );

        if (!collapsedTooltip) return linkContent;

        return (
            <Tooltip>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right" className="ml-2 bg-gray-900 text-white border-gray-800 text-xs">
                    {item.label}
                </TooltipContent>
            </Tooltip>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors flex">
            {/* ─── Desktop sidebar — hidden below lg, replaced by the bottom tab bar + sheet ─── */}
            <aside
                className={cn(
                    'sidebar-indic sidebar-toran-top hidden lg:flex fixed left-0 top-0 z-40 h-screen flex-col transition-all duration-300 ease-in-out',
                    sidebarOpen ? 'w-64' : 'w-[72px]'
                )}
            >
                {/* Logo */}
                <div className="flex h-16 items-center px-4 border-b border-black/5 dark:border-white/10 shrink-0 overflow-hidden">
                    <Link to={homeLink} className={cn('flex items-center gap-2.5 transition-all outline-none', sidebarOpen ? 'w-auto opacity-100' : 'w-0 opacity-0 overflow-hidden')}>
                        <img src="/vidyaverse-logo.png" alt="Vidyaverse" className="h-7 min-w-max" />
                    </Link>

                    {/* Collapsed Logo view */}
                    {!sidebarOpen && (
                        <div className="flex w-full items-center justify-center">
                            <MandalaMark size={32} />
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <TooltipProvider delayDuration={0}>
                    <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1 custom-scrollbar">
                        {navGroups.map((group) => (
                            <div key={group.title || 'ungrouped'}>
                                {group.title && sidebarOpen && (
                                    <div className="px-3 pt-4 pb-1.5 text-[10.5px] font-bold tracking-wider uppercase text-gray-400 dark:text-gray-500">
                                        {group.title}
                                    </div>
                                )}
                                <div className="space-y-1">
                                    {group.items.map((item) => (
                                        <div key={item.href}>{renderNavLink(item, !sidebarOpen)}</div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </nav>
                </TooltipProvider>

                {/* User & Logout */}
                <div className="border-t border-black/5 dark:border-white/10 p-3 shrink-0">
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

            {/* ─── Main Content ─── */}
            <div className={cn('flex-1 transition-all duration-300 ease-in-out flex flex-col min-w-0', sidebarOpen ? 'lg:pl-64' : 'lg:pl-[72px]')}>
                {/* Desktop top bar — glass effect */}
                <header className="hidden lg:flex sticky top-0 z-20 h-16 items-center justify-between px-6 border-b border-gray-200/60 dark:border-gray-800/60 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl">
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

                {/* Mobile app bar — status-bar-safe top inset, no sidebar toggle (bottom tab bar replaces it) */}
                <header
                    className="flex lg:hidden sticky top-0 z-20 items-center gap-3 px-4 border-b border-gray-200/60 dark:border-gray-800/60 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl"
                    style={{ paddingTop: 'max(12px, env(safe-area-inset-top))', paddingBottom: '12px' }}
                >
                    <UserProfileDropdown />
                    <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 leading-none">{greeting()}</div>
                        <h1 className="text-base font-semibold text-gray-900 dark:text-white leading-tight truncate">{currentPage}</h1>
                    </div>
                    <NotificationBell />
                </header>

                {/* Page content */}
                <main className="flex-1 p-4 pb-24 lg:p-6 lg:pb-6">
                    <Outlet />
                </main>

                {/* Mobile bottom tab bar */}
                <nav
                    className="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex items-stretch gap-1 px-2 border-t border-gray-200/60 dark:border-gray-800/60 bg-white/85 dark:bg-gray-900/85 backdrop-blur-xl"
                    style={{ paddingTop: '8px', paddingBottom: 'max(10px, env(safe-area-inset-bottom))' }}
                >
                    {bottomTabs.map((tab) => {
                        const isActive = tab.key === 'more' ? mobileSidebar : !!tab.href && location.pathname.startsWith(tab.href);
                        return (
                            <button
                                key={tab.key}
                                onClick={() => (tab.key === 'more' ? setMobileSidebar(true) : tab.href && navigate(tab.href))}
                                className={cn(
                                    'flex-1 flex flex-col items-center gap-1 py-1.5 rounded-xl text-[10.5px] font-bold transition-colors',
                                    isActive ? 'text-primary bg-primary/10' : 'text-gray-400 dark:text-gray-500'
                                )}
                            >
                                <tab.icon className="w-[22px] h-[22px]" />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* "More" bottom sheet — replaces the full sidebar nav below lg */}
            <AnimatePresence>
                {mobileSidebar && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.4 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileSidebar(false)}
                            className="fixed inset-0 bg-black z-40 lg:hidden"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                            className="fixed inset-x-0 bottom-0 z-50 lg:hidden max-h-[82%] overflow-y-auto rounded-t-[22px] bg-white dark:bg-gray-900 shadow-2xl"
                        >
                            <div className="sticky top-0 bg-white dark:bg-gray-900 pt-2.5 pb-1">
                                <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-700 mx-auto" />
                            </div>
                            <div className="px-4 pb-6">
                                <div className="font-semibold text-lg text-gray-900 dark:text-white mb-2 mt-1">All modules</div>
                                {navGroups.map((group) => (
                                    <div key={group.title || 'ungrouped'}>
                                        {group.title && (
                                            <div className="pt-3.5 pb-2 text-[10.5px] font-bold tracking-wider uppercase text-gray-400 dark:text-gray-500">
                                                {group.title}
                                            </div>
                                        )}
                                        <div className="grid grid-cols-2 gap-2">
                                            {group.items.map((item) => (
                                                <div key={item.href}>{renderNavLink(item, false, () => setMobileSidebar(false))}</div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
