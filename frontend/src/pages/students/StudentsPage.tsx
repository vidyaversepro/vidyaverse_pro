import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useStudents, useDeleteStudent, useBulkRequestPhotos, type Student, type DataStatus } from '@/lib/queries';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
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
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Users,
    Plus,
    MoreHorizontal,
    Pencil,
    Trash2,
    Eye,
    UserCheck,
    Clock,
    Upload,
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
} from 'lucide-react';
import { toast } from 'sonner';
import StudentModal from './StudentModal';
import { BulkStudentUploadModal } from '@/components/students/bulk-upload/BulkStudentUploadModal';
import { BulkPhotoUploadModal } from '@/components/students/bulk-upload/BulkPhotoUploadModal';
import { StudentDraftGrid } from '@/components/students/StudentDraftGrid';
import { StudentFilterBar, type StudentFilterValues } from '@/components/students/StudentFilterBar';

// Data status badge styling
const dataStatusConfig: Record<DataStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    pending: { label: 'Pending', variant: 'outline' },
    filled: { label: 'Filled', variant: 'secondary' },
    enhanced: { label: 'Enhanced', variant: 'secondary' },
    submitted: { label: 'Submitted', variant: 'default' },
    approved: { label: 'Approved', variant: 'default' },
    rejected: { label: 'Rejected', variant: 'destructive' },
};

export default function StudentsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // Derive filter state from URL
    const filters: StudentFilterValues = useMemo(() => ({
        institutionId: searchParams.get('institutionId') || undefined,
        classId: searchParams.get('classId') || undefined,
        streamId: searchParams.get('streamId') || undefined,
        sectionId: searchParams.get('sectionId') || undefined,
        dataStatus: searchParams.get('dataStatus') || undefined,
        search: searchParams.get('search') || undefined,
    }), [searchParams]);

    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || 10;

    const setFilters = (f: StudentFilterValues) => {
        const params = new URLSearchParams();
        if (f.institutionId) params.set('institutionId', f.institutionId);
        if (f.classId) params.set('classId', f.classId);
        if (f.streamId) params.set('streamId', f.streamId);
        if (f.sectionId) params.set('sectionId', f.sectionId);
        if (f.dataStatus) params.set('dataStatus', f.dataStatus);
        if (f.search) params.set('search', f.search);
        params.set('pageSize', String(pageSize));
        // Reset to page 1 on filter change
        setSearchParams(params);
    };

    const setPage = (p: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', String(p));
        setSearchParams(params);
    };

    const setPageSize = (size: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('pageSize', String(size));
        params.delete('page'); // reset to page 1
        setSearchParams(params);
    };

    const sortBy = searchParams.get('sortBy') || undefined;
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' | undefined;

    const handleSort = (column: string) => {
        const params = new URLSearchParams(searchParams);
        if (sortBy === column) {
            if (sortOrder === 'asc') {
                params.set('sortOrder', 'desc');
            } else {
                params.delete('sortBy');
                params.delete('sortOrder');
            }
        } else {
            params.set('sortBy', column);
            params.set('sortOrder', 'asc');
        }
        params.delete('page'); // Reset to page 1 on sort change
        setSearchParams(params);
    };

    // Build query params
    const queryParams: Record<string, string> = {
        page: String(page),
        limit: String(pageSize),
    };
    if (filters.institutionId) queryParams.institutionId = filters.institutionId;
    if (filters.classId) queryParams.classId = filters.classId;
    if (filters.streamId) queryParams.streamId = filters.streamId;
    if (filters.sectionId) queryParams.sectionId = filters.sectionId;
    if (filters.dataStatus) queryParams.dataStatus = filters.dataStatus;
    if (filters.search) queryParams.search = filters.search;
    if (sortBy) queryParams.sortBy = sortBy;
    if (sortOrder) queryParams.sortOrder = sortOrder;

    const { data: studentsData, isLoading, isFetching } = useStudents(queryParams);
    const deleteStudent = useDeleteStudent();

    const students = studentsData?.data || [];
    const pagination = studentsData?.pagination;

    // UI state
    const [modalOpen, setModalOpen] = useState(false);
    const [bulkImportOpen, setBulkImportOpen] = useState(false);
    const [bulkPhotoImportOpen, setBulkPhotoImportOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
    const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
    const [isVolunteerMode, setIsVolunteerMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const bulkRequestPhotos = useBulkRequestPhotos();

    // Check if any student has a stream for conditional column
    const hasStreamColumn = useMemo(
        () => students.some((s: Student) => s.section?.stream?.name),
        [students]
    );

    const handleEdit = (student: Student) => {
        setSelectedStudent(student);
        setModalMode('edit');
        setModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedStudent(null);
        setModalMode('create');
        setModalOpen(true);
    };

    const handleView = (student: Student) => {
        setSelectedStudent(student);
        setModalMode('view');
        setModalOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteStudent.mutateAsync(deleteTarget.id);
            toast.success('Student deleted successfully');
        } catch {
            toast.error('Failed to delete student');
        }
        setDeleteTarget(null);
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(new Set(students.map((s: Student) => s.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleSelectRow = (id: string, checked: boolean) => {
        const newSelected = new Set(selectedIds);
        if (checked) {
            newSelected.add(id);
        } else {
            newSelected.delete(id);
        }
        setSelectedIds(newSelected);
    };

    const handleBulkRequestPhotos = async () => {
        if (selectedIds.size === 0) return;
        try {
            const response = await bulkRequestPhotos.mutateAsync(Array.from(selectedIds));
            toast.success(`Requested photos for ${response.count || selectedIds.size} students`);
            setSelectedIds(new Set());
        } catch (error) {
            toast.error('Failed to send photo requests');
        }
    };

    // Count stats
    const totalStudents = pagination?.total || 0;
    const approvedCount = students.filter((s: Student) => s.dataStatus === 'approved').length;
    const pendingCount = students.filter((s: Student) => s.dataStatus === 'pending').length;

    // Helper for rendering sortable headers
    const SortableHeader = ({ column, label, className = '' }: { column: string, label: string, className?: string }) => {
        const isActive = sortBy === column;
        return (
            <TableHead className={className}>
                <div
                    className="flex items-center gap-1 cursor-pointer select-none hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                    onClick={() => handleSort(column)}
                >
                    {label}
                    {isActive ? (
                        sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                    ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-30" />
                    )}
                </div>
            </TableHead>
        );
    };

    return (
        <div className="p-6 space-y-6">
            <PageHeader
                breadcrumb={[
                    { label: 'Dashboard', href: '/app/dashboard' },
                    { label: 'Students' },
                ]}
                title="Students Management"
                description="Manage students across all classes and sections"
                action={
                    <div className="flex items-center gap-2 flex-wrap">
                        <Button variant="outline" onClick={() => navigate('/app/students/approval')}>
                            <UserCheck className="h-4 w-4 mr-2" />
                            Approval Queue
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    <Upload className="h-4 w-4 mr-2" />
                                    Bulk Import
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setBulkImportOpen(true)}>
                                    Import Students (CSV)
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setBulkPhotoImportOpen(true)}>
                                    Import Photos (ZIP)
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        {selectedIds.size > 0 && (
                            <Button variant="secondary" onClick={handleBulkRequestPhotos} disabled={bulkRequestPhotos.isPending}>
                                <Upload className="h-4 w-4 mr-2" />
                                {bulkRequestPhotos.isPending ? 'Sending...' : `Request Photos (${selectedIds.size})`}
                            </Button>
                        )}
                        <Button onClick={handleCreate}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Student
                        </Button>
                    </div>
                }
            />

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Total Students" value={totalStudents} icon={Users} />
                <StatCard title="Approved" value={approvedCount} icon={UserCheck} />
                <StatCard title="Pending Review" value={pendingCount} icon={Clock} />
                <StatCard title="On This Page" value={students.length} icon={Eye} />
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1 w-full sm:w-auto">
                    <StudentFilterBar filters={filters} onChange={setFilters} />
                </div>
                <div className="flex items-center space-x-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md px-3 py-2 shadow-sm shrink-0">
                    <Switch id="volunteer-mode" checked={isVolunteerMode} onCheckedChange={setIsVolunteerMode} />
                    <Label htmlFor="volunteer-mode" className="text-sm cursor-pointer whitespace-nowrap">Volunteer Mode</Label>
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12"></TableHead>
                                <TableHead className="w-14">Sr.</TableHead>
                                <TableHead>Institution</TableHead>
                                <TableHead className="w-16">Roll</TableHead>
                                <TableHead>Enroll. No.</TableHead>
                                <TableHead>Class</TableHead>
                                <TableHead>Section</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-12" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                                    {Array.from({ length: 9 }).map((_, j) => (
                                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : isVolunteerMode ? (
                <StudentDraftGrid students={students} onStudentClick={handleEdit} />
            ) : students.length === 0 ? (
                <EmptyState
                    icon={Users}
                    title={Object.values(filters).some(Boolean) ? 'No students match the selected filters' : 'No students found'}
                    description={Object.values(filters).some(Boolean)
                        ? 'Try adjusting your filters or clearing them to see all students.'
                        : 'Get started by adding students or adjusting your filters.'}
                    action={Object.values(filters).some(Boolean)
                        ? { label: 'Clear Filters', onClick: () => setFilters({}) }
                        : { label: 'Add Student', onClick: handleCreate }}
                />
            ) : (
                <>
                    <div className={`rounded-md border ${isFetching ? 'opacity-50' : ''} transition-opacity duration-300`}>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">
                                        <Checkbox 
                                            checked={students.length > 0 && selectedIds.size === students.length}
                                            onCheckedChange={handleSelectAll}
                                            aria-label="Select all"
                                        />
                                    </TableHead>
                                    <TableHead className="w-14">Sr.</TableHead>
                                    <TableHead>Institution</TableHead>
                                    <SortableHeader column="rollNo" label="Roll" className="w-20" />
                                    <SortableHeader column="admissionNumber" label="Enroll. No." />
                                    <SortableHeader column="class" label="Class" />
                                    {hasStreamColumn && <TableHead>Stream</TableHead>}
                                    <TableHead>Section</TableHead>
                                    <SortableHeader column="name" label="Name" />
                                    <SortableHeader column="dataStatus" label="Status" />
                                    <TableHead className="w-12" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map((student: Student, index: number) => {
                                    const statusConfig = dataStatusConfig[student.dataStatus] || dataStatusConfig.pending;
                                    const srNo = (page - 1) * pageSize + index + 1;
                                    const rollNo = student.admissionSlot?.rollNo ?? student.rollNo;
                                    const instName = student.institution?.name;
                                    const truncatedInst = instName && instName.length > 20
                                        ? instName.substring(0, 20) + '…'
                                        : instName;

                                    return (
                                        <TableRow key={student.id} data-state={selectedIds.has(student.id) ? "selected" : undefined}>
                                            <TableCell>
                                                <Checkbox 
                                                    checked={selectedIds.has(student.id)}
                                                    onCheckedChange={(checked) => handleSelectRow(student.id, !!checked)}
                                                    aria-label={`Select ${student.name}`}
                                                />
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground">{srNo}</TableCell>
                                            <TableCell title={instName}>
                                                {truncatedInst || <span className="text-muted-foreground">—</span>}
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {rollNo ?? <span className="text-muted-foreground">—</span>}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {student.admissionNumber || <span className="text-muted-foreground">—</span>}
                                            </TableCell>
                                            <TableCell>
                                                {student.section?.class?.name || <span className="text-muted-foreground">—</span>}
                                            </TableCell>
                                            {hasStreamColumn && (
                                                <TableCell>
                                                    {student.section?.stream?.name || <span className="text-muted-foreground">—</span>}
                                                </TableCell>
                                            )}
                                            <TableCell>
                                                {student.section?.name || <span className="text-muted-foreground">—</span>}
                                            </TableCell>
                                            <TableCell>
                                                <p className="font-semibold">{student.name}</p>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleView(student)}>
                                                            <Eye className="h-4 w-4 mr-2" /> View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleEdit(student)}>
                                                            <Pencil className="h-4 w-4 mr-2" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            onClick={() => setDeleteTarget(student)}
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {pagination && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-sm text-muted-foreground">
                                Showing {(page - 1) * pageSize + 1} to{' '}
                                {Math.min(page * pageSize, pagination.total)} of{' '}
                                {pagination.total} students
                            </p>
                            <div className="flex items-center gap-3 flex-wrap justify-center">
                                <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                                    <SelectTrigger className="w-[100px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10">10 / page</SelectItem>
                                        <SelectItem value="25">25 / page</SelectItem>
                                        <SelectItem value="50">50 / page</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                                        Previous
                                    </Button>
                                    <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}>
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Student Modal */}
            <StudentModal 
                open={modalOpen} 
                onOpenChange={setModalOpen} 
                student={selectedStudent} 
                mode={modalMode} 
                defaultInstitutionId={filters.institutionId}
            />

            <BulkStudentUploadModal open={bulkImportOpen} onOpenChange={setBulkImportOpen} />
            <BulkPhotoUploadModal open={bulkPhotoImportOpen} onOpenChange={setBulkPhotoImportOpen} prefilledInstitutionId={filters.institutionId} />

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Student</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?
                            This action cannot be undone and will permanently remove the student
                            record and all associated data (ID cards, certificates, hall tickets, etc.).
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
