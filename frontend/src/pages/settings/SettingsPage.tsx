import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
    User,
    Shield,
    Palette,
    Save,
    Loader2,
    Sun,
} from 'lucide-react';
import { toast } from 'sonner';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSession } from '@/lib/auth.client';
import { useThemeStore } from '@/stores/theme.store';
import { useUpdateProfile, useChangePassword } from '@/lib/queries';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

const profileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().optional(),
});

const passwordSchema = z.object({
    oldPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'profile';

    return (
        <div className="p-4 lg:p-8 max-w-5xl mx-auto w-full">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Manage your account settings and preferences.
                </p>
            </div>

            <Tabs
                value={activeTab}
                onValueChange={(val) => setSearchParams({ tab: val })}
                className="flex flex-col md:flex-row gap-8"
            >
                {/* Sidebar */}
                <TabsList className="flex flex-row md:flex-col h-auto w-full md:w-64 bg-transparent p-0 gap-2 shrink-0 overflow-x-auto no-scrollbar justify-start">
                    <TabsTrigger
                        value="profile"
                        className="w-auto md:w-full justify-start gap-3 px-4 py-3 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 border border-transparent data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-800 data-[state=active]:shadow-sm text-gray-600 dark:text-gray-400 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white whitespace-nowrap"
                    >
                        <User className="w-4 h-4 shrink-0" />
                        My Profile
                    </TabsTrigger>
                    <TabsTrigger
                        value="security"
                        className="w-auto md:w-full justify-start gap-3 px-4 py-3 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 border border-transparent data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-800 data-[state=active]:shadow-sm text-gray-600 dark:text-gray-400 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white whitespace-nowrap"
                    >
                        <Shield className="w-4 h-4 shrink-0" />
                        Account Security
                    </TabsTrigger>
                    <TabsTrigger
                        value="appearance"
                        className="w-auto md:w-full justify-start gap-3 px-4 py-3 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 border border-transparent data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-800 data-[state=active]:shadow-sm text-gray-600 dark:text-gray-400 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white whitespace-nowrap"
                    >
                        <Palette className="w-4 h-4 shrink-0" />
                        Appearance
                    </TabsTrigger>
                </TabsList>

                {/* Content Area */}
                <div className="flex-1 min-w-0">
                    <TabsContent value="profile" className="m-0 focus-visible:outline-none">
                        <ProfileSettings />
                    </TabsContent>

                    <TabsContent value="security" className="m-0 focus-visible:outline-none">
                        <SecuritySettings />
                    </TabsContent>

                    <TabsContent value="appearance" className="m-0 focus-visible:outline-none">
                        <AppearanceSettings />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}

// ----------------------------------------------------------------------
// Profile Settings Component
// ----------------------------------------------------------------------
function ProfileSettings() {
    const { data: session } = useSession();
    const user = session?.user;
    const updateProfile = useUpdateProfile();
    const [isLoading, setIsLoading] = useState(true);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name || '',
            phone: '',
        },
    });

    // Fetch full profile data to get phone number
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/auth/me');
                if (res.data?.data) {
                    form.reset({
                        name: res.data.data.name || '',
                        phone: res.data.data.phone || '',
                    });
                }
            } catch (error) {
                console.error('Failed to fetch profile', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [form]);

    const onSubmit = (data: ProfileFormValues) => {
        updateProfile.mutate(data, {
            onSuccess: () => {
                toast.success('Profile updated successfully');
            },
            onError: (err: any) => {
                toast.error(err?.response?.data?.message || 'Failed to update profile');
            },
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-6 lg:p-8 shadow-sm"
        >
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Information</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Update your personal details here.
                </p>
            </div>

            <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#E63946] to-[#C41E3A] flex items-center justify-center text-white text-2xl font-bold shadow-md">
                    {user?.name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || 'U'}
                </div>
                <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{user?.name}</h3>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                        {(user as {globalRole?: string})?.globalRole === 'super_admin' ? 'Super Admin' : (user as {globalRole?: string})?.globalRole || 'User'}
                    </div>
                </div>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Full Name
                        </label>
                        <Input
                            {...form.register('name')}
                            placeholder="John Doe"
                            className="bg-gray-50 dark:bg-gray-800/50"
                        />
                        {form.formState.errors.name && (
                            <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Phone Number
                        </label>
                        <Input
                            {...form.register('phone')}
                            placeholder="+1 234 567 890"
                            className="bg-gray-50 dark:bg-gray-800/50"
                        />
                        {form.formState.errors.phone && (
                            <p className="text-xs text-red-500">{form.formState.errors.phone.message}</p>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email Address
                    </label>
                    <Input
                        value={user?.email || ''}
                        disabled
                        className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    />
                    <p className="text-[11px] text-gray-500">
                        Email addresses cannot be changed directly. Contact support if you need to update your email.
                    </p>
                </div>

                <div className="pt-4 flex justify-end">
                    <Button
                        type="submit"
                        disabled={updateProfile.isPending || !form.formState.isDirty}
                        className="bg-[#E63946] hover:bg-[#C41E3A] text-white rounded-xl shadow-sm px-6"
                    >
                        {updateProfile.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Changes
                    </Button>
                </div>
            </form>
        </motion.div>
    );
}

// ----------------------------------------------------------------------
// Security Settings Component
// ----------------------------------------------------------------------
function SecuritySettings() {
    const changePassword = useChangePassword();

    const form = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    const onSubmit = (data: PasswordFormValues) => {
        changePassword.mutate(
            { oldPassword: data.oldPassword, newPassword: data.newPassword },
            {
                onSuccess: () => {
                    toast.success('Password changed successfully');
                    form.reset();
                },
                onError: (err: any) => {
                    toast.error(err?.response?.data?.message || 'Failed to change password');
                },
            }
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-6 lg:p-8 shadow-sm"
        >
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Change Password</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Ensure your account is using a long, random password to stay secure.
                </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 max-w-xl">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Current Password
                    </label>
                    <Input
                        type="password"
                        {...form.register('oldPassword')}
                        className="bg-gray-50 dark:bg-gray-800/50"
                    />
                    {form.formState.errors.oldPassword && (
                        <p className="text-xs text-red-500">{form.formState.errors.oldPassword.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        New Password
                    </label>
                    <Input
                        type="password"
                        {...form.register('newPassword')}
                        className="bg-gray-50 dark:bg-gray-800/50"
                    />
                    {form.formState.errors.newPassword && (
                        <p className="text-xs text-red-500">{form.formState.errors.newPassword.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Confirm New Password
                    </label>
                    <Input
                        type="password"
                        {...form.register('confirmPassword')}
                        className="bg-gray-50 dark:bg-gray-800/50"
                    />
                    {form.formState.errors.confirmPassword && (
                        <p className="text-xs text-red-500">{form.formState.errors.confirmPassword.message}</p>
                    )}
                </div>

                <div className="pt-4 flex justify-end">
                    <Button
                        type="submit"
                        disabled={changePassword.isPending || !form.formState.isValid}
                        className="bg-[#E63946] hover:bg-[#C41E3A] text-white rounded-xl shadow-sm px-6"
                    >
                        {changePassword.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <Shield className="w-4 h-4 mr-2" />
                        )}
                        Update Password
                    </Button>
                </div>
            </form>
        </motion.div>
    );
}

// ----------------------------------------------------------------------
// Appearance Settings Component
// ----------------------------------------------------------------------
function AppearanceSettings() {
    const { isDarkMode, setDarkMode } = useThemeStore();

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-6 lg:p-8 shadow-sm flex flex-col gap-8"
        >
            <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Customize how Vidyaverse looks on your device.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                {/* Light Mode */}
                <button
                    onClick={() => setDarkMode(false)}
                    className={cn(
                        'flex flex-col items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left bg-gray-50 dark:bg-gray-800/30',
                        !isDarkMode
                            ? 'border-[#E63946] bg-[#E63946]/5 dark:bg-[#E63946]/10'
                            : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                    )}
                >
                    <div className="w-full aspect-[4/3] rounded-xl bg-white border border-gray-200 shadow-sm p-4 flex flex-col gap-2 overflow-hidden">
                        <div className="flex gap-2 items-center">
                            <div className="w-6 h-6 rounded-full bg-gray-200 shrink-0" />
                            <div className="h-2.5 w-24 bg-gray-200 rounded-full" />
                        </div>
                        <div className="flex-1 mt-2 bg-gray-50 rounded-lg flex gap-3 p-2">
                            <div className="w-8 h-full bg-gray-200 rounded-md shrink-0" />
                            <div className="flex-1 bg-white border border-gray-100 rounded-md" />
                        </div>
                    </div>
                    <div className="flex items-center justify-between w-full mt-1">
                        <div className="flex flex-col">
                            <span className="font-medium text-gray-900 dark:text-white">Light Mode</span>
                            <span className="text-xs text-gray-500">Bright and clean</span>
                        </div>
                        <div
                            className={cn(
                                'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                                !isDarkMode ? 'border-[#E63946]' : 'border-gray-300 dark:border-gray-600'
                            )}
                        >
                            {!isDarkMode && <div className="w-2.5 h-2.5 rounded-full bg-[#E63946]" />}
                        </div>
                    </div>
                </button>

                {/* Dark Mode */}
                <button
                    onClick={() => setDarkMode(true)}
                    className={cn(
                        'flex flex-col items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left bg-gray-50 dark:bg-gray-800/30',
                        isDarkMode
                            ? 'border-[#E63946] bg-[#E63946]/5 dark:bg-[#E63946]/10'
                            : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                    )}
                >
                    <div className="w-full aspect-[4/3] rounded-xl bg-gray-900 border border-gray-800 shadow-sm p-4 flex flex-col gap-2 overflow-hidden">
                        <div className="flex gap-2 items-center">
                            <div className="w-6 h-6 rounded-full bg-gray-800 shrink-0" />
                            <div className="h-2.5 w-24 bg-gray-800 rounded-full" />
                        </div>
                        <div className="flex-1 mt-2 bg-gray-950 rounded-lg flex gap-3 p-2 border border-gray-800/50">
                            <div className="w-8 h-full bg-gray-800 rounded-md shrink-0" />
                            <div className="flex-1 bg-gray-900 border border-gray-800 rounded-md" />
                        </div>
                    </div>
                    <div className="flex items-center justify-between w-full mt-1">
                        <div className="flex flex-col">
                            <span className="font-medium text-gray-900 dark:text-white">Dark Mode</span>
                            <span className="text-xs text-gray-500">Easy on the eyes</span>
                        </div>
                        <div
                            className={cn(
                                'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                                isDarkMode ? 'border-[#E63946]' : 'border-gray-300 dark:border-gray-600'
                            )}
                        >
                            {isDarkMode && <div className="w-2.5 h-2.5 rounded-full bg-[#E63946]" />}
                        </div>
                    </div>
                </button>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300 rounded-xl p-4 text-sm flex gap-3 items-start border border-blue-100 dark:border-blue-900/40">
                <Sun className="w-5 h-5 shrink-0 mt-0.5" />
                <p>
                    Your theme preference is saved automatically to your device and will be applied everywhere across the application.
                </p>
            </div>
        </motion.div>
    );
}
