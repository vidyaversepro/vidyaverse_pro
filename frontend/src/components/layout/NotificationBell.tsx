import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Loader2, AlertTriangle, Info, Zap, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    useNotifications,
    useMarkNotificationRead,
    useMarkAllNotificationsRead,
    type AppNotification,
} from '@/lib/queries';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Map notification types to icons and colors
const typeConfig: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
    system: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    alert: { icon: Zap, color: 'text-red-500', bg: 'bg-red-500/10' },
    activity: { icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    update: { icon: CheckCheck, color: 'text-[var(--lotus-pink)]', bg: 'bg-[var(--lotus-pink)]/10' },
};

function timeAgo(dateStr: string): string {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
}

export default function NotificationBell() {
    const [open, setOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const { data, isLoading, isError } = useNotifications({ limit: 10 });
    const markRead = useMarkNotificationRead();
    const markAllRead = useMarkAllNotificationsRead();

    const notifications = data?.data || [];
    const unreadCount = data?.unreadCount ?? 0;

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (
                panelRef.current &&
                !panelRef.current.contains(e.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };
        if (open) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        if (open) document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open]);

    const handleMarkRead = (id: string) => {
        markRead.mutate(id);
    };

    const handleMarkAllRead = () => {
        markAllRead.mutate();
    };

    return (
        <div className="relative">
            {/* Bell Button */}
            <Button
                ref={buttonRef}
                variant="ghost"
                size="icon"
                onClick={() => setOpen(!open)}
                className="rounded-xl w-9 h-9 relative hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                aria-haspopup="true"
                aria-expanded={open}
            >
                <Bell className="w-[18px] h-[18px]" />
                <AnimatePresence>
                    {unreadCount > 0 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-[#E63946] text-white text-[10px] font-bold shadow-lg"
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </motion.span>
                    )}
                </AnimatePresence>
            </Button>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        ref={panelRef}
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-[380px] max-h-[480px] flex flex-col rounded-2xl border border-gray-200/80 dark:border-gray-700/80 bg-white dark:bg-gray-900 shadow-2xl shadow-black/10 dark:shadow-black/40 z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                    Notifications
                                </h3>
                                {unreadCount > 0 && (
                                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#E63946]/10 text-[#E63946] rounded-full">
                                        {unreadCount} new
                                    </span>
                                )}
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    disabled={markAllRead.isPending}
                                    className="text-xs font-medium text-[#E63946] hover:text-[#C41E3A] transition-colors disabled:opacity-50"
                                >
                                    {markAllRead.isPending ? 'Marking...' : 'Mark all read'}
                                </button>
                            )}
                        </div>

                        {/* Notification List */}
                        <div className="flex-1 overflow-y-auto">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                                </div>
                            ) : isError ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                                    <AlertTriangle className="w-8 h-8 text-amber-400 mb-2" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Failed to load notifications
                                    </p>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                                        <Bell className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        No notifications yet
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                        You&apos;re all caught up!
                                    </p>
                                </div>
                            ) : (
                                notifications.map((n: AppNotification) => {
                                    const config = typeConfig[n.type] || typeConfig.info;
                                    const Icon = config.icon;
                                    return (
                                        <button
                                            key={n.id}
                                            onClick={() => !n.isRead && handleMarkRead(n.id)}
                                            className={cn(
                                                'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60 border-b border-gray-50 dark:border-gray-800/50 last:border-0',
                                                !n.isRead && 'bg-blue-50/30 dark:bg-blue-950/10'
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    'shrink-0 w-8 h-8 rounded-xl flex items-center justify-center mt-0.5',
                                                    config.bg
                                                )}
                                            >
                                                <Icon className={cn('w-4 h-4', config.color)} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p
                                                        className={cn(
                                                            'text-[13px] leading-tight',
                                                            n.isRead
                                                                ? 'text-gray-600 dark:text-gray-400'
                                                                : 'text-gray-900 dark:text-white font-medium'
                                                        )}
                                                    >
                                                        {n.title}
                                                    </p>
                                                    {!n.isRead && (
                                                        <span className="shrink-0 mt-1 w-2 h-2 rounded-full bg-[#E63946]" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5 line-clamp-2">
                                                    {n.message}
                                                </p>
                                                <p className="text-[11px] text-gray-400 dark:text-gray-600 mt-1">
                                                    {timeAgo(n.createdAt)}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-2.5">
                                <button className="w-full text-center text-xs font-medium text-[#E63946] hover:text-[#C41E3A] transition-colors">
                                    View all notifications
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
