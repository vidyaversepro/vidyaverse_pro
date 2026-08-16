import { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
    breadcrumb: { label: string; href?: string }[];
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}

export function PageHeader({ breadcrumb, title, description, action, className }: PageHeaderProps) {
    return (
        <div className={cn("flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6", className)}>
            <div className="space-y-1.5">
                <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                    {breadcrumb.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                            {index > 0 && <ChevronRight className="h-4 w-4" />}
                            {item.href ? (
                                <Link
                                    to={item.href}
                                    className="hover:text-foreground transition-colors"
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <span className={index === breadcrumb.length - 1 ? "text-foreground font-medium" : ""}>
                                    {item.label}
                                </span>
                            )}
                        </div>
                    ))}
                </nav>
                <h1 className="arch-section-header text-2xl tracking-tight inline-block">{title}</h1>
                {description && (
                    <p className="text-muted-foreground">{description}</p>
                )}
            </div>
            {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
    );
}
