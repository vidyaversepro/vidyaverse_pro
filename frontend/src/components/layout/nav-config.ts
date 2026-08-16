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

export type SidebarItem = { label: string; icon: typeof LayoutDashboard; href: string; module?: string };
export type NavGroup = { title: string; items: SidebarItem[] };

// Grouping is presentation-only: every item, href, icon and module key below
// is unchanged from the previous flat `adminSidebarItems` array — this file
// only adds a `title` grouping layer for the sidebar/bottom-sheet, it doesn't
// add, remove or re-route anything.
export const adminNavGroups: NavGroup[] = [
    {
        title: 'Overview',
        items: [
            { label: 'Dashboard', icon: LayoutDashboard, href: '/app/dashboard' },
            { label: 'Institutions', icon: GraduationCap, href: '/app/institutions' },
            { label: 'Users', icon: Users, href: '/app/users' },
            { label: 'Students', icon: Users, href: '/app/students' },
        ],
    },
    {
        title: 'Document Studio',
        items: [
            { label: 'Visiting Cards', icon: Contact, href: '/app/visiting-cards', module: 'visiting_card' },
            { label: 'ID Cards', icon: CreditCard, href: '/app/id-cards', module: 'id_card' },
            { label: 'Group Photos', icon: Camera, href: '/app/group-photos', module: 'group_photo' },
            { label: 'Certificates', icon: Award, href: '/app/certificates', module: 'certificate' },
            { label: 'Portfolios', icon: Briefcase, href: '/app/portfolios', module: 'portfolio' },
            { label: 'Exam Schedules', icon: ClipboardList, href: '/app/hall-tickets/exam-schedules', module: 'examination' },
            { label: 'Hall Tickets', icon: ClipboardList, href: '/app/hall-tickets', module: 'hall_ticket' },
            { label: 'Marksheets', icon: BarChart3, href: '/app/marksheets', module: 'marksheet' },
            { label: 'Library Cards', icon: Library, href: '/app/library-cards', module: 'library_card' },
            { label: 'Transfer Certs', icon: FileCheck, href: '/app/transfer-certificates', module: 'transfer_certificate' },
            { label: 'Templates', icon: FileText, href: '/app/templates' },
        ],
    },
    {
        title: 'Engage',
        items: [
            { label: 'Communications', icon: MessageCircle, href: '/app/communications', module: 'whatsapp_messaging' },
            { label: 'Admissions', icon: UserPlus, href: '/app/admissions', module: 'admissions_crm' },
            { label: 'Notices & Calendar', icon: Megaphone, href: '/app/notices', module: 'notices_events' },
            { label: 'Live Classes', icon: Video, href: '/app/live-classes', module: 'live_classes' },
            { label: 'Saathi Network', icon: Heart, href: '/app/saathi', module: 'social' },
        ],
    },
    {
        title: 'Academics',
        items: [
            { label: 'Timetable', icon: CalendarClock, href: '/app/timetable', module: 'timetable' },
            { label: 'Library', icon: BookMarked, href: '/app/library', module: 'library' },
            { label: 'AI Tutor', icon: Sparkles, href: '/app/ai-tutor', module: 'ai_tutor' },
            { label: 'Gradebook (CCE)', icon: GradCap, href: '/app/gradebook', module: 'gradebook_cce' },
            { label: 'Assignments', icon: ClipboardListIcon, href: '/app/assignments', module: 'assignments' },
            { label: 'Online Tests', icon: FileQuestion, href: '/app/online-tests', module: 'assessments_online' },
            { label: 'Visionarium', icon: BookOpen, href: '/app/visionarium', module: 'visionarium' },
        ],
    },
    {
        title: 'Operate',
        items: [
            { label: 'Transport', icon: Bus, href: '/app/transport', module: 'transport' },
            { label: 'HR & Payroll', icon: Wallet, href: '/app/hr', module: 'hr_payroll' },
            { label: 'Finance', icon: Landmark, href: '/app/finance', module: 'finance_accounting' },
            { label: 'Hostel & Mess', icon: Building2, href: '/app/hostel', module: 'hostel' },
            { label: 'Inventory', icon: Package, href: '/app/inventory', module: 'inventory' },
            { label: 'Health', icon: HeartPulse, href: '/app/health', module: 'health' },
            { label: 'Visitor', icon: UserCheck, href: '/app/visitor', module: 'visitor' },
            { label: 'Biometric', icon: Fingerprint, href: '/app/biometric', module: 'attendance_biometric' },
            { label: 'Concessions & EMI', icon: Percent, href: '/app/fees-advanced', module: 'fees_advanced' },
        ],
    },
    {
        title: 'Insights',
        items: [
            { label: 'Reports & BI', icon: BarChart, href: '/app/reports', module: 'reports_bi' },
            { label: 'Alumni', icon: GradCap, href: '/app/alumni', module: 'alumni' },
            { label: 'Placement', icon: Building, href: '/app/placement', module: 'placement' },
            { label: 'Jobs', icon: Activity, href: '/app/jobs' },
        ],
    },
    {
        title: 'System',
        items: [
            { label: 'Mobile App', icon: Smartphone, href: '/app/mobile-app', module: 'mobile_app' },
            { label: 'OAuth Clients', icon: KeyRound, href: '/app/oauth-clients' },
            { label: 'Settings', icon: Settings, href: '/app/settings' },
        ],
    },
];

export const adminSidebarItems: SidebarItem[] = adminNavGroups.flatMap((g) => g.items);

export const studentSidebarItems: SidebarItem[] = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/student/dashboard' },
    { label: 'Saathi Feed', icon: Heart, href: '/student/feed' },
    { label: 'Connections', icon: Users, href: '/student/connections' },
    { label: 'Visionarium', icon: BookOpen, href: '/student/visionarium' },
    { label: 'Settings', icon: Settings, href: '/student/settings' },
];
