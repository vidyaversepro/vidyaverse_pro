import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronDown,
    User,
    Settings,
    HelpCircle,
    LogOut,
    Palette,
    Shield,
} from 'lucide-react';
import { useSession, signOut } from '@/lib/auth.client';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const roleLabels: Record<string, string> = {
    super_admin: 'Super Admin',
    support: 'Support Staff',
};

interface MenuItemProps {
    icon: typeof User;
    label: string;
    description?: string;
    onClick: () => void;
    danger?: boolean;
}

function MenuItem({ icon: Icon, label, description, onClick, danger }: MenuItemProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150',
                danger
                    ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60'
            )}
        >
            <div
                className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                    danger
                        ? 'bg-red-50 dark:bg-red-950/40'
                        : 'bg-gray-100 dark:bg-gray-800'
                )}
            >
                <Icon className={cn('w-4 h-4', danger ? 'text-red-500' : 'text-gray-500 dark:text-gray-400')} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium">{label}</p>
                {description && (
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                        {description}
                    </p>
                )}
            </div>
        </button>
    );
}

export default function UserProfileDropdown() {
    const { data: session } = useSession();
    const user = session?.user;
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const navigate = useNavigate();

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        if (isOpen) document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen]);

    const handleLogout = async () => {
        setIsOpen(false);
        await signOut({
            fetchOptions: {
                onSuccess: () => {
                    navigate('/login');
                }
            }
        });
    };

    const initials = user?.name?.[0]?.toUpperCase() || 'U';

    const globalRole = (user as {globalRole?: string})?.globalRole; const roleLabel = globalRole ? roleLabels[globalRole as keyof typeof roleLabels] || globalRole : 'User';

    return (
        <div className="relative">
            {/* Trigger */}
            <button
                ref={triggerRef}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'flex items-center gap-2 ml-1 px-2 py-1.5 rounded-xl border transition-all duration-150',
                    isOpen
                        ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200/60 dark:border-gray-700/60 hover:bg-gray-100 dark:hover:bg-gray-750'
                )}
                aria-label="User menu"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#E63946] to-[#C41E3A] flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {initials}
                </div>
                <span className="hidden sm:block text-[13px] font-medium text-gray-700 dark:text-gray-200 max-w-[100px] truncate">
                    {user?.name || 'User'}
                </span>
                <ChevronDown
                    className={cn(
                        'w-3.5 h-3.5 text-gray-400 transition-transform',
                        isOpen && 'rotate-180'
                    )}
                />
            </button>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={dropdownRef}
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-[280px] rounded-2xl border border-gray-200/80 dark:border-gray-700/80 bg-white dark:bg-gray-900 shadow-2xl shadow-black/10 dark:shadow-black/40 z-50 overflow-hidden"
                    >
                        {/* User Info Header */}
                        <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#E63946] to-[#C41E3A] flex items-center justify-center text-white text-base font-bold shadow-md">
                                    {user?.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                        {user?.name || 'User'}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {user?.email}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <Shield className="w-3 h-3 text-[#E63946]" />
                                        <span className="text-[11px] font-medium text-[#E63946]">
                                            {roleLabel}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Menu Items */}
                        <div className="p-2 space-y-0.5">
                            <MenuItem
                                icon={User}
                                label="My Profile"
                                description="View and edit your profile"
                                onClick={() => {
                                    setIsOpen(false);
                                    navigate('/app/settings?tab=profile');
                                }}
                            />
                            <MenuItem
                                icon={Settings}
                                label="Account Settings"
                                description="Preferences & security"
                                onClick={() => {
                                    setIsOpen(false);
                                    navigate('/app/settings?tab=security');
                                }}
                            />
                            <MenuItem
                                icon={Palette}
                                label="Appearance"
                                description="Theme & display options"
                                onClick={() => {
                                    setIsOpen(false);
                                    navigate('/app/settings?tab=appearance');
                                }}
                            />
                        </div>

                        <div className="mx-3 border-t border-gray-100 dark:border-gray-800" />

                        <div className="p-2 space-y-0.5">
                            <MenuItem
                                icon={HelpCircle}
                                label="Help & Support"
                                description="Get help with Vidyaverse"
                                onClick={() => {
                                    setIsOpen(false);
                                    window.open('https://vidyaverse.pro/support', '_blank');
                                }}
                            />
                        </div>

                        <div className="mx-3 border-t border-gray-100 dark:border-gray-800" />

                        <div className="p-2">
                            <MenuItem
                                icon={LogOut}
                                label="Sign Out"
                                onClick={handleLogout}
                                danger
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
