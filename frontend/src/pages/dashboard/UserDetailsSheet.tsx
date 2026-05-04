import { format } from 'date-fns';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { User } from '@/lib/queries';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, Mail, Phone, Shield, Building2, UserCircle, Clock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface UserDetailsSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: User | null;
}

export function UserDetailsSheet({ open, onOpenChange, user }: UserDetailsSheetProps) {
    if (!user) return null;

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-md border-l border-indigo-100/20 bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-950 dark:to-slate-900/90 shadow-2xl p-0 overflow-y-auto">
                <div className="absolute top-0 left-0 w-1 p-0 h-full bg-gradient-to-b from-orange-400 via-indigo-500 to-blue-600 opacity-80" />

                <div className="p-6 pb-0">
                    <SheetHeader className="text-left">
                        <div className="flex flex-col items-center text-center space-y-4 pt-6 pb-2">
                            <Avatar className="h-24 w-24 ring-4 ring-indigo-50 dark:ring-indigo-900/20 shadow-xl">
                                <AvatarImage src={`https://avatar.vercel.sh/${user.email}`} />
                                <AvatarFallback className="text-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-semibold">
                                    {getInitials(user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <SheetTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-indigo-800 dark:from-white dark:to-slate-300">
                                    {user.name}
                                </SheetTitle>
                                <SheetDescription className="text-base font-medium text-slate-500 flex items-center justify-center gap-2 mt-1">
                                    {user.globalRole ? (
                                        <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-0 dark:bg-indigo-900/50 dark:text-indigo-300 capitalize">
                                            <Shield className="w-3 h-3 mr-1" />
                                            {user.globalRole.replace('_', ' ')}
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-slate-500 capitalize bg-white/50 dark:bg-slate-900/50">
                                            Standard User
                                        </Badge>
                                    )}
                                    <Badge
                                        variant={user.isActive ? 'default' : 'secondary'}
                                        className={user.isActive ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0 dark:bg-emerald-900/50 dark:text-emerald-300' : 'border-0'}
                                    >
                                        {user.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </SheetDescription>
                            </div>
                        </div>
                    </SheetHeader>
                </div>

                <div className="p-6 space-y-8">
                    {/* Contact Info Card */}
                    <div className="glass-panel p-5 rounded-xl border border-slate-200/60 bg-white/80 dark:bg-slate-900/50 dark:border-slate-800/80 shadow-sm space-y-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -mr-10 -mt-10" />
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                            <UserCircle className="w-4 h-4 text-indigo-500" /> Contact Information
                        </h4>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{user.email}</p>
                                    <p className="text-xs text-slate-500">Primary Email</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{user.phone || 'Not provided'}</p>
                                    <p className="text-xs text-slate-500">Phone Number</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Account Activity Card */}
                    <div className="glass-panel p-5 rounded-xl border border-slate-200/60 bg-white/80 dark:bg-slate-900/50 dark:border-slate-800/80 shadow-sm space-y-4">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                            <Clock className="w-4 h-4 text-orange-500" /> Account Activity
                        </h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-1">
                                <span className="text-sm text-slate-500 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" /> Joined
                                </span>
                                <span className="text-sm font-medium text-slate-900 dark:text-slate-200">
                                    {format(new Date(user.createdAt), 'MMMM d, yyyy')}
                                </span>
                            </div>
                            <Separator className="bg-slate-100 dark:bg-slate-800" />
                            <div className="flex justify-between items-center py-1">
                                <span className="text-sm text-slate-500 flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> Last Login
                                </span>
                                <span className="text-sm font-medium text-slate-900 dark:text-slate-200">
                                    {user.lastLoginAt ? format(new Date(user.lastLoginAt), 'MMM d, yyyy HH:mm') : 'Never'}
                                </span>
                            </div>
                            <Separator className="bg-slate-100 dark:bg-slate-800" />
                            <div className="flex justify-between items-center py-1">
                                <span className="text-sm text-slate-500 flex items-center gap-2">
                                    <Shield className="w-4 h-4" /> Verification
                                </span>
                                <Badge variant={user.isVerified ? 'default' : 'secondary'} className={user.isVerified ? 'bg-indigo-100 text-indigo-700 border-0 dark:bg-indigo-900/50' : 'border-0'}>
                                    {user.isVerified ? 'Verified' : 'Unverified'}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Institution Roles Card */}
                    <div className="glass-panel p-5 rounded-xl border border-slate-200/60 bg-white/80 dark:bg-slate-900/50 dark:border-slate-800/80 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-blue-500" /> Institution Access
                            </h4>
                            <Badge variant="secondary" className="rounded-full bg-slate-100 text-slate-600 border-0 dark:bg-slate-800">
                                {user.institutionRoles?.length || 0}
                            </Badge>
                        </div>

                        {user.institutionRoles && user.institutionRoles.length > 0 ? (
                            <div className="space-y-3 mt-2">
                                {user.institutionRoles.map((val, idx) => (
                                    <div key={idx} className="flex flex-col gap-1 p-3 rounded-lg bg-slate-50 border border-slate-100 dark:bg-slate-800/50 dark:border-slate-700/50">
                                        <p className="font-semibold text-sm text-slate-900 dark:text-slate-200">
                                            {val.institution.name}
                                        </p>
                                        <p className="text-xs text-indigo-600 dark:text-indigo-400 capitalize font-medium flex items-center gap-1">
                                            <Shield className="w-3 h-3" /> {val.role.replace('_', ' ')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-6 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                                <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2 dark:text-slate-600" />
                                <p className="text-sm text-slate-500 font-medium">No institution access</p>
                                <p className="text-xs text-slate-400 mt-1">This user is not tied to any institutions yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
