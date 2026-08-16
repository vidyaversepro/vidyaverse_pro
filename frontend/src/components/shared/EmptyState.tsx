import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { MandalaMark } from '@/design/indic/motifs/mandala-mark';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
    return (
        <div className={`flex flex-col items-center justify-center py-12 text-center rounded-lg border border-dashed p-8 ${className}`}>
            {/* Mandala crest behind the icon — the empty-state identity (Phase 5). */}
            <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
                <MandalaMark size={80} spin className="absolute inset-0 opacity-[0.14]" />
                <div className="indic-icon-plinth relative flex h-14 w-14 items-center justify-center">
                    <Icon className="h-7 w-7 text-white" />
                </div>
            </div>
            <h3 className="text-xl tracking-tight mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6 text-balance">
                {description}
            </p>
            {action && (
                <Button onClick={action.onClick}>
                    {action.label}
                </Button>
            )}
        </div>
    );
}
