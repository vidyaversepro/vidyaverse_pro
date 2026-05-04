import { useState } from 'react';
import { useUsers, useDeleteUser, useUserStats, User } from '@/lib/queries';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { FilterBar } from '@/components/shared/FilterBar';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
    Users,
    Shield,
    UserCircle,
    MoreHorizontal,
    Pencil,
    Trash2,
    Eye,
    Plus,
    Lock,
} from 'lucide-react';
import { format } from 'date-fns';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { useToast } from '@/components/ui/use-toast';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { UserModal } from './UserModal';
import { AssignRoleModal } from './AssignRoleModal';
import { UserDetailsSheet } from './UserDetailsSheet';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authClient } from '@/lib/auth.client';

export default function UsersPage() {
    const { toast } = useToast();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('All Roles');
    const [statusFilter, setStatusFilter] = useState('All');
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [isAssignRoleOpen, setIsAssignRoleOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
    const [isResetting, setIsResetting] = useState(false);

    const { data: statsData, isLoading: isLoadingStats } = useUserStats();

    const { data, isLoading } = useUsers({
        page,
        limit: 10,
        search,
        role: roleFilter,
        status: statusFilter,
    });

    const deleteMutation = useDeleteUser();

    const handleSearch = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const handleCreate = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const handleEdit = (user: any) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteMutation.mutateAsync(deleteId);
            toast({
                title: "User deleted",
                description: "The user has been successfully deleted.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete user.",
                variant: "destructive",
            });
        } finally {
            setDeleteId(null);
        }
    };

    const handleResetPassword = async () => {
        if (!resetPasswordUser) return;
        setIsResetting(true);
        try {
            // @ts-ignore
            await authClient.forgetPassword({
                email: resetPasswordUser.email,
                redirectTo: '/reset-password',
            });
            toast({
                title: "Password Reset Sent",
                description: `A password reset email has been sent to ${resetPasswordUser.email}.`,
            });
            setResetPasswordUser(null);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to send reset email. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsResetting(false);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <div className="p-6">
            <PageHeader
                breadcrumb={[
                    { label: 'Dashboard', href: '/app/dashboard' },
                    { label: 'Users' },
                ]}
                title="Users Management"
                description="Manage all users and their roles across institutions"
                action={
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add User
                    </Button>
                }
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <StatCard
                    title="Total Users"
                    value={isLoadingStats ? '...' : statsData?.data?.totalUsers || 0}
                    icon={Users}
                    iconClassName="bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
                    className="glass-panel border-blue-100/50 dark:border-blue-900/50 relative overflow-hidden group hover:shadow-lg transition-all duration-300"
                />
                <StatCard
                    title="Super Admins"
                    value={isLoadingStats ? '...' : statsData?.data?.superAdmins || 0}
                    icon={Shield}
                    iconClassName="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400"
                    className="glass-panel border-indigo-100/50 dark:border-indigo-900/50 relative overflow-hidden group hover:shadow-lg transition-all duration-300"
                />
                <StatCard
                    title="Active Today"
                    value={isLoadingStats ? '...' : statsData?.data?.activeToday || 0}
                    icon={UserCircle}
                    iconClassName="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400"
                    className="glass-panel border-emerald-100/50 dark:border-emerald-900/50 relative overflow-hidden group hover:shadow-lg transition-all duration-300"
                />
            </div>

            <FilterBar
                searchQuery={search}
                onSearchChange={handleSearch}
                searchPlaceholder="Search users..."
                filters={
                    <>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All Roles">All Roles</SelectItem>
                                <SelectItem value="super_admin">Super Admin</SelectItem>
                                <SelectItem value="school_admin">School Admin</SelectItem>
                                <SelectItem value="teacher">Teacher</SelectItem>
                                <SelectItem value="student">Student</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Status</SelectItem>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </>
                }
                onReset={() => {
                    setSearch('');
                    setRoleFilter('All Roles');
                    setStatusFilter('All');
                    setPage(1);
                }}
            />

            <div className="rounded-xl border border-slate-200/60 bg-white/50 dark:bg-slate-900/50 dark:border-slate-800/80 backdrop-blur-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Global Role</TableHead>
                                <TableHead>Institutions</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><div className="h-10 w-40 bg-muted animate-pulse rounded" /></TableCell>
                                        <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded" /></TableCell>
                                        <TableCell><div className="h-4 w-32 bg-muted animate-pulse rounded" /></TableCell>
                                        <TableCell><div className="h-4 w-16 bg-muted animate-pulse rounded" /></TableCell>
                                        <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded" /></TableCell>
                                        <TableCell><div className="h-8 w-8 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : data?.data?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6}>
                                        <EmptyState
                                            icon={Users}
                                            title="No users found"
                                            description="Try adjusting your filters or create a new user."
                                            className="border-none shadow-none"
                                        />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data?.data?.map((user) => (
                                    <TableRow key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={`https://avatar.vercel.sh/${user.email}`} />
                                                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{user.name}</span>
                                                    <span className="text-xs text-muted-foreground">{user.email}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {user.globalRole ? (
                                                <Badge variant="secondary" className="capitalize">
                                                    {user.globalRole.replace('_', ' ')}
                                                </Badge>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                {user.institutionRoles && user.institutionRoles.length > 0 ? (
                                                    user.institutionRoles.slice(0, 2).map((role, i) => (
                                                        <Badge key={i} variant="outline" className="w-fit text-xs">
                                                            {role.institution.name} ({role.role})
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">None</span>
                                                )}
                                                {user.institutionRoles && user.institutionRoles.length > 2 && (
                                                    <span className="text-xs text-muted-foreground">+{user.institutionRoles.length - 2} more</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={user.isActive ? 'default' : 'secondary'}
                                                className={user.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200' : ''}
                                            >
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {format(new Date(user.createdAt), 'MMM d, yyyy')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="glass-panel w-48 border-slate-200/60 shadow-xl dark:border-slate-700">
                                                    <DropdownMenuLabel className="font-semibold text-slate-700 dark:text-slate-300">Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => { setSelectedUser(user as never); setIsDetailsOpen(true); }} className="cursor-pointer">
                                                        <Eye className="mr-2 h-4 w-4 text-slate-500" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleEdit(user)} className="cursor-pointer">
                                                        <Pencil className="mr-2 h-4 w-4 text-blue-500" />
                                                        Edit User
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => { setSelectedUser(user as never); setIsAssignRoleOpen(true); }} className="cursor-pointer">
                                                        <Shield className="mr-2 h-4 w-4 text-indigo-500" />
                                                        Assign Role
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setResetPasswordUser(user as never)} className="cursor-pointer text-amber-600 focus:text-amber-600">
                                                        <Lock className="mr-2 h-4 w-4" />
                                                        Reset Password
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-600 focus:text-red-600 cursor-pointer"
                                                        onClick={() => setDeleteId(user.id)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {data?.pagination && (
                <div className="mt-4">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                />
                            </PaginationItem>

                            <PaginationItem>
                                <PaginationLink isActive>{page}</PaginationLink>
                            </PaginationItem>

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                                    className={page >= data.pagination.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            <UserModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                user={editingUser}
            />

            <AssignRoleModal
                open={isAssignRoleOpen}
                onOpenChange={setIsAssignRoleOpen}
                user={selectedUser}
            />

            <UserDetailsSheet
                open={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
                user={selectedUser}
            />

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this user? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={!!resetPasswordUser} onOpenChange={(open) => !open && setResetPasswordUser(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reset User Password</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to send a password reset email to <strong>{resetPasswordUser?.email}</strong>? They will be able to set a new password securely.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isResetting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleResetPassword}
                            disabled={isResetting}
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                        >
                            {isResetting ? 'Sending...' : 'Send Reset Link'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
