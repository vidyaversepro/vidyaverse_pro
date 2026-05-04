import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { ReactNode } from 'react';

interface FilterBarProps {
    searchQuery?: string;
    onSearchChange?: (value: string) => void;
    searchPlaceholder?: string;
    filters?: ReactNode;
    actions?: ReactNode;
    onReset?: () => void;
    className?: string;
}

export function FilterBar({
    searchQuery,
    onSearchChange,
    searchPlaceholder = "Search...",
    filters,
    actions,
    onReset,
    className
}: FilterBarProps) {
    return (
        <div className={`flex flex-col sm:flex-row gap-4 mb-6 ${className}`}>
            {onSearchChange && (
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9 w-full sm:max-w-[300px]"
                    />
                </div>
            )}

            <div className="flex flex-1 items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
                {filters}

                {onReset && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onReset}
                        className="h-9 px-2 text-muted-foreground hover:text-foreground"
                    >
                        <X className="mr-2 h-4 w-4" />
                        Reset
                    </Button>
                )}
            </div>

            {actions && (
                <div className="flex items-center gap-2 flex-wrap">
                    {actions}
                </div>
            )}
        </div>
    );
}
