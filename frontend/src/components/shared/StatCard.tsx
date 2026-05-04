import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    trend?: {
        value: string | number;
        label: string;
        direction: 'up' | 'down' | 'neutral';
    };
    className?: string;
    iconClassName?: string;
}

export function StatCard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    className,
    iconClassName
}: StatCardProps) {
    return (
        <Card className={cn("overflow-hidden", className)}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between space-x-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-muted-foreground tracking-wide">
                            {title}
                        </span>
                        <span className="text-2xl font-bold">{value}</span>
                    </div>
                    <div className={cn("p-2 rounded-full bg-primary/10", iconClassName)}>
                        <Icon className="h-5 w-5 text-primary" />
                    </div>
                </div>
                {(description || trend) && (
                    <div className="mt-4 flex items-center text-xs">
                        {trend && (
                            <span className={cn(
                                "font-medium mr-2",
                                trend.direction === 'up' && "text-green-600 dark:text-green-400",
                                trend.direction === 'down' && "text-red-600 dark:text-red-400",
                                trend.direction === 'neutral' && "text-muted-foreground"
                            )}>
                                {trend.value}
                            </span>
                        )}
                        <span className="text-muted-foreground truncate">
                            {trend?.label || description}
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
