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
    href: string;
}

// Icon colour is intentionally uniform (one accent plinth via `indic-icon-plinth`,
// see QuickActionsPanel.tsx) — a different gradient per action reads as decoration
// noise, not signal, when every tile links to an equally important task.
export const QUICK_ACTIONS: QuickAction[] = [
    {
        label: 'Add Institution',
        icon: Users,
        href: '/app/institutions',
    },
    {
        label: 'Review Approvals',
        icon: UserCheck,
        href: '/app/students/approval',
    },
    {
        label: 'Bulk Onboard Students',
        icon: Users,
        href: '/app/students/bulk',
    },
    {
        label: 'Generate ID Cards',
        icon: CreditCard,
        href: '/app/id-cards',
    },
    {
        label: 'View Templates',
        icon: FileText,
        href: '/app/templates',
    },
    {
        label: 'Process Group Photo',
        icon: Camera,
        href: '/app/group-photos',
    },
    {
        label: 'Generate Marksheets',
        icon: BarChart3,
        href: '/app/templates', // Navigates to templates for marksheets
    },
];
