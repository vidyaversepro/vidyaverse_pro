import {
    Users,
    CreditCard,
    FileText,
    Camera,
    UserCheck,
    BarChart3,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface QuickAction {
    label: string;
    icon: LucideIcon;
    color: string;
    href: string;
}

export const QUICK_ACTIONS: QuickAction[] = [
    {
        label: 'Add Institution',
        icon: Users,
        color: 'from-purple-500 to-indigo-500',
        href: '/app/institutions',
    },
    {
        label: 'Review Approvals',
        icon: UserCheck,
        color: 'from-emerald-500 to-green-500',
        href: '/app/students/approval',
    },
    {
        label: 'Bulk Onboard Students',
        icon: Users,
        color: 'from-amber-500 to-orange-500',
        href: '/app/students/bulk',
    },
    {
        label: 'Generate ID Cards',
        icon: CreditCard,
        color: 'from-[#E63946] to-[#C41E3A]',
        href: '/app/id-cards',
    },
    {
        label: 'View Templates',
        icon: FileText,
        color: 'from-blue-500 to-[var(--peacock-teal)]',
        href: '/app/templates',
    },
    {
        label: 'Process Group Photo',
        icon: Camera,
        color: 'from-pink-500 to-rose-500',
        href: '/app/group-photos',
    },
    {
        label: 'Generate Marksheets',
        icon: BarChart3,
        color: 'from-teal-500 to-sky-500',
        href: '/app/templates', // Navigates to templates for marksheets
    },
];
