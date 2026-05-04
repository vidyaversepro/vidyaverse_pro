import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

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
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50 mb-6">
                <Icon className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold tracking-tight mb-2">{title}</h3>
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
