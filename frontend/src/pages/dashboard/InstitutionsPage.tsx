import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInstitutions, useDeleteInstitution } from '@/lib/queries';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    Search,
    GraduationCap,
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { TONE_VAR, TONE_TINT } from '@/components/shared/Pill';
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
import { InstitutionModal } from './InstitutionModal';

type SubscriptionTier = 'starter' | 'professional' | 'enterprise';
type SubscriptionStatus = 'trial' | 'active' | 'suspended' | 'cancelled';

// Same {text, tint} shape as before, but sourced from the theme-aware tokens —
// the old literal hexes failed WCAG AA on the dark theme (see styles/status-tones.css).
const TONE = {
    green: { t: TONE_VAR.green, bg: TONE_TINT.green },
    temple: { t: TONE_VAR.temple, bg: TONE_TINT.temple },
    red: { t: TONE_VAR.red, bg: TONE_TINT.red },
    peacock: { t: TONE_VAR.peacock, bg: TONE_TINT.peacock },
};

function statusTone(status: SubscriptionStatus) {
    if (status === 'active') return TONE.green;
    if (status === 'trial') return TONE.temple;
    return TONE.red;
}

function tierTone(tier: SubscriptionTier) {
    if (tier === 'enterprise') return TONE.temple;
    if (tier === 'professional') return TONE.peacock;
    return null;
}

function StatusPill({ status }: { status: SubscriptionStatus }) {
    const tone = statusTone(status);
    return (
        <span
            className="inline-flex items-center text-[11px] font-bold capitalize px-2.5 py-1 rounded-full"
            style={{ color: tone.t, background: tone.bg }}
        >
            {status}
        </span>
    );
}

function TierPill({ tier }: { tier: SubscriptionTier }) {
    const tone = tierTone(tier);
    return (
        <span
            className="inline-flex items-center text-[11px] font-bold capitalize px-2.5 py-1 rounded-full"
            style={tone ? { color: tone.t, background: tone.bg } : { color: 'hsl(var(--muted-foreground))', background: 'hsl(var(--muted))' }}
        >
            {tier}
        </span>
    );
}

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

    const statusChip = (value: string, label: string) => (
        <button
            key={`status-${value}`}
            onClick={() => { setStatusFilter(value); setPage(1); }}
            className="whitespace-nowrap text-xs font-bold px-3 py-1.5 rounded-[9px] border transition-colors"
            style={statusFilter === value
                ? { background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))', borderColor: 'transparent' }
                : { background: 'hsl(var(--card))', color: 'hsl(var(--muted-foreground))', borderColor: 'hsl(var(--border))' }}
        >
            {label}
        </button>
    );

    const tierChip = (value: string, label: string) => (
        <button
            key={`tier-${value}`}
            onClick={() => { setTierFilter(value); setPage(1); }}
            className="whitespace-nowrap text-xs font-bold px-3 py-1.5 rounded-[9px] border transition-colors"
            style={tierFilter === value
                ? { background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))', borderColor: 'transparent' }
                : { background: 'hsl(var(--card))', color: 'hsl(var(--muted-foreground))', borderColor: 'hsl(var(--border))' }}
        >
            {label}
        </button>
    );

    const rows = data?.data ?? [];

    return (
        <div className="p-4 sm:p-6">
            <PageHeader
                breadcrumb={[
                    { label: 'Dashboard', href: '/app/dashboard' },
                    { label: 'Institutions' },
                ]}
                title="Institutions"
                description="Manage all connected educational institutions"
                action={
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Add institution</span>
                        <span className="sm:hidden">Add</span>
                    </Button>
                }
            />

            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-4">
                <StatCard
                    title="Total"
                    value={data?.pagination?.total ?? 0}
                    icon={Building2}
                    tone="teal"
                />
                <StatCard
                    title="Active"
                    value="-"
                    icon={Users}
                    tone="gold"
                />
                <StatCard
                    title="Trial"
                    value="-"
                    icon={Clock}
                    tone="saffron"
                />
                <StatCard
                    title="Suspended"
                    value="-"
                    icon={XCircle}
                    tone="indigo"
                />
            </div>

            <div className="flex flex-col gap-2.5 mb-4">
                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search institutions…"
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="h-11 rounded-xl pl-10"
                    />
                </div>
                <div className="flex gap-1.5 flex-wrap items-center">
                    {statusChip('All', 'All status')}
                    {statusChip('active', 'Active')}
                    {statusChip('trial', 'Trial')}
                    {statusChip('suspended', 'Suspended')}
                    <span className="w-px self-stretch bg-border mx-1" />
                    {tierChip('All', 'All tiers')}
                    {tierChip('starter', 'Starter')}
                    {tierChip('professional', 'Pro')}
                    {tierChip('enterprise', 'Enterprise')}
                </div>
            </div>

            {/* Desktop table */}
            <div className="hidden lg:block rounded-2xl border bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/40 hover:bg-muted/40">
                            <TableHead>Name</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Subscription</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Students</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="w-[44px]" />
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
                                    <TableCell><div className="h-4 w-12 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                                    <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded" /></TableCell>
                                    <TableCell><div className="h-8 w-8 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : rows.length === 0 ? (
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
                            rows.map((inst) => (
                                <TableRow key={inst.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <button
                                                className="font-bold text-left text-foreground hover:text-primary transition-colors"
                                                onClick={() => navigate(`/app/institutions/${inst.id}`)}
                                            >
                                                {inst.name}
                                            </button>
                                            <span className="text-xs text-muted-foreground">{inst.code}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {inst.contactEmail || '-'}
                                    </TableCell>
                                    <TableCell>
                                        <TierPill tier={inst.subscriptionTier} />
                                    </TableCell>
                                    <TableCell>
                                        <StatusPill status={inst.subscriptionStatus} />
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">
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
                                                        className="font-medium tone-text-green bg-[var(--tone-green-bg)] mb-1"
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
                <div className="hidden lg:flex items-center justify-end gap-1.5 mt-3.5">
                    <Button
                        variant="outline"
                        className="h-[34px] rounded-[9px] px-3 text-xs font-semibold"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        Prev
                    </Button>
                    <span className="h-[34px] w-[34px] inline-flex items-center justify-center rounded-[9px] bg-primary text-primary-foreground text-sm font-bold">
                        {page}
                    </span>
                    <Button
                        variant="outline"
                        className="h-[34px] rounded-[9px] px-3 text-xs font-semibold"
                        onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                        disabled={page >= data.pagination.totalPages}
                    >
                        Next
                    </Button>
                </div>
            )}

            {/* Mobile / tablet card list */}
            <div className="lg:hidden flex flex-col gap-2.5">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-[100px] rounded-2xl bg-muted animate-pulse" />
                    ))
                ) : rows.length === 0 ? (
                    <EmptyState
                        icon={Building2}
                        title="No institutions found"
                        description="Try adjusting your filters or create a new institution."
                    />
                ) : (
                    rows.map((inst) => (
                        <button
                            key={inst.id}
                            onClick={() => navigate(`/app/institutions/${inst.id}`)}
                            className="text-left w-full bg-card border rounded-2xl p-4 flex flex-col gap-2.5 active:scale-[.99] transition-transform"
                        >
                            <div className="flex items-start gap-2.5">
                                <span
                                    className="w-[42px] h-[42px] rounded-xl text-white flex items-center justify-center flex-shrink-0 text-[17px]"
                                    style={{ fontFamily: 'var(--font-display)', background: 'linear-gradient(135deg, hsl(var(--primary)), var(--accent-strong))' }}
                                >
                                    {inst.name[0]}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-foreground text-[15px] truncate">{inst.name}</div>
                                    <div className="text-xs text-muted-foreground truncate">{inst.code} · {inst.contactEmail || '-'}</div>
                                </div>
                                <StatusPill status={inst.subscriptionStatus} />
                            </div>
                            <div className="flex gap-2 items-center flex-wrap text-xs font-semibold text-muted-foreground">
                                <TierPill tier={inst.subscriptionTier} />
                                <span className="inline-flex items-center gap-1.5">
                                    <GraduationCap className="h-3.5 w-3.5" />
                                    {inst._count?.students || 0} students
                                </span>
                                <span className="ml-auto text-muted-foreground/70">
                                    {format(new Date(inst.createdAt), 'MMM d, yyyy')}
                                </span>
                            </div>
                        </button>
                    ))
                )}
            </div>

            {data?.pagination && rows.length > 0 && (
                <div className="lg:hidden flex items-center justify-center gap-1.5 mt-4">
                    <Button
                        variant="outline"
                        className="h-9 rounded-[9px] px-4 text-xs font-semibold"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        Prev
                    </Button>
                    <span className="text-xs text-muted-foreground font-semibold px-2">
                        Page {page} of {data.pagination.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        className="h-9 rounded-[9px] px-4 text-xs font-semibold"
                        onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                        disabled={page >= data.pagination.totalPages}
                    >
                        Next
                    </Button>
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
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
