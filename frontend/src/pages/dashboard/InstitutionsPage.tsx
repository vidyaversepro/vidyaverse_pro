import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInstitutions, useDeleteInstitution } from '@/lib/queries';
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
    Building2,
    Users,
    Clock,
    XCircle,
    MoreHorizontal,
    Pencil,
    Trash2,
    Eye,
    Plus,
    Rocket,
    CheckCircle2,
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
import { InstitutionModal } from './InstitutionModal';

export default function InstitutionsPage() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [tierFilter, setTierFilter] = useState('All');
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const { data, isLoading } = useInstitutions({
        page,
        limit: 10,
        search,
        status: statusFilter,
        tier: tierFilter,
    });

    const deleteMutation = useDeleteInstitution();

    const handleSearch = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteMutation.mutateAsync(deleteId);
            toast({
                title: "Institution deleted",
                description: "The institution has been successfully deleted.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete institution.",
                variant: "destructive",
            });
        } finally {
            setDeleteId(null);
        }
    };


    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingInstitution, setEditingInstitution] = useState<any>(null);

    const handleEdit = (inst: any) => {
        setEditingInstitution(inst);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingInstitution(null);
        setIsModalOpen(true);
    };

    // Calculate stats from data if available, or use placeholder/separate query
    // For now using simple counts from the current page/metadata if we had a separate stats endpoint
    // Ideally we would fetch stats separately.

    return (
        <div className="p-6">
            <PageHeader
                breadcrumb={[
                    { label: 'Dashboard', href: '/app/dashboard' },
                    { label: 'Institutions' },
                ]}
                title="Institutions Management"
                description="Manage all connected educational institutions"
                action={
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Institution
                    </Button>
                }
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <StatCard
                    title="Total Institutions"
                    value={data?.pagination?.total || 0}
                    icon={Building2}
                    iconClassName="bg-blue-100 text-blue-600"
                />
                <StatCard
                    title="Active"
                    value="-" // TODO: Add stats endpoint
                    icon={Users}
                    iconClassName="bg-green-100 text-green-600"
                />
                <StatCard
                    title="Trial"
                    value="-" // TODO: Add stats endpoint
                    icon={Clock}
                    iconClassName="bg-yellow-100 text-yellow-600"
                />
                <StatCard
                    title="Suspended"
                    value="-" // TODO: Add stats endpoint
                    icon={XCircle}
                    iconClassName="bg-red-100 text-red-600"
                />
            </div>

            <FilterBar
                searchQuery={search}
                onSearchChange={handleSearch}
                searchPlaceholder="Search institutions..."
                filters={
                    <>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="trial">Trial</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={tierFilter} onValueChange={setTierFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Tier" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Tiers</SelectItem>
                                <SelectItem value="starter">Starter</SelectItem>
                                <SelectItem value="professional">Professional</SelectItem>
                                <SelectItem value="enterprise">Enterprise</SelectItem>
                            </SelectContent>
                        </Select>
                    </>
                }
                onReset={() => {
                    setSearch('');
                    setStatusFilter('All');
                    setTierFilter('All');
                    setPage(1);
                }}
            />

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Subscription</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Students</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><div className="h-4 w-32 bg-muted animate-pulse rounded" /></TableCell>
                                    <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded" /></TableCell>
                                    <TableCell><div className="h-4 w-20 bg-muted animate-pulse rounded" /></TableCell>
                                    <TableCell><div className="h-4 w-16 bg-muted animate-pulse rounded" /></TableCell>
                                    <TableCell><div className="h-4 w-12 bg-muted animate-pulse rounded" /></TableCell>
                                    <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded" /></TableCell>
                                    <TableCell><div className="h-8 w-8 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : data?.data?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7}>
                                    <EmptyState
                                        icon={Building2}
                                        title="No institutions found"
                                        description="Try adjusting your filters or create a new institution."
                                        className="border-none shadow-none"
                                    />
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.data?.map((inst) => (
                                <TableRow key={inst.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <button
                                                className="font-medium text-left hover:text-[#E63946] hover:underline transition-colors"
                                                onClick={() => navigate(`/app/institutions/${inst.id}`)}
                                            >
                                                {inst.name}
                                            </button>
                                            <span className="text-xs text-muted-foreground">{inst.code}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-sm">
                                            <span>{inst.contactEmail || '-'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize">
                                            {inst.subscriptionTier}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={inst.subscriptionStatus === 'active' ? 'default' : 'secondary'}
                                            className="capitalize"
                                        >
                                            {inst.subscriptionStatus}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {inst._count?.students || 0}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {format(new Date(inst.createdAt), 'MMM d, yyyy')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                {!inst.onboardingCompleted ? (
                                                    <DropdownMenuItem
                                                        className="font-medium text-emerald-600 focus:text-emerald-700 bg-emerald-50/50 mb-1"
                                                        onClick={() => navigate(`/app/institutions/${inst.id}/onboarding`)}
                                                    >
                                                        <Rocket className="mr-2 h-4 w-4" />
                                                        Complete Onboarding
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem disabled className="font-medium text-emerald-600 opacity-100">
                                                        <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" />
                                                        Onboarding Done
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem onClick={() => navigate(`/app/institutions/${inst.id}`)}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleEdit(inst)}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-red-600 focus:text-red-600"
                                                    onClick={() => setDeleteId(inst.id)}
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

                            {/* Simple pagination logic for now */}
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

            <InstitutionModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                institution={editingInstitution}
            />

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the
                            institution and all associated data including students, classes, and records.
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
        </div>
    );
}
