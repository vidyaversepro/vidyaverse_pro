import { Menu } from 'lucide-react';
import { useLayoutStore } from '@/stores/layout.store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface HamburgerButtonProps {
    className?: string;
}

export default function HamburgerButton({ className }: HamburgerButtonProps) {
    const { toggleSidebar, toggleMobileSidebar } = useLayoutStore();

    const handleClick = (e: React.MouseEvent) => {
        // Stop propagation to prevent accidental triggers from wrapper elements
        e.stopPropagation();
        e.preventDefault();

        if (window.innerWidth < 1024) {
            toggleMobileSidebar();
        } else {
            toggleSidebar();
        }
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleClick}
            className={cn(
                'rounded-xl w-9 h-9 hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0 transition-colors',
                className
            )}
            aria-label="Toggle Navigation Sidebar"
        >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </Button>
    );
}
