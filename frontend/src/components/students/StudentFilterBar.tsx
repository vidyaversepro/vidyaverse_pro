import { useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useInstitutions, useClasses, useStreams, useSections } from '@/lib/queries';

export interface StudentFilterValues {
    institutionId?: string;
    classId?: string;
    streamId?: string;
    sectionId?: string;
    dataStatus?: string;
    search?: string;
}

interface StudentFilterBarProps {
    filters: StudentFilterValues;
    onChange: (filters: StudentFilterValues) => void;
}

export function StudentFilterBar({ filters, onChange }: StudentFilterBarProps) {
    // ── Data hooks ──
    const { data: instData } = useInstitutions({});
    const institutions = instData?.data || [];

    const { data: classes } = useClasses(filters.institutionId);
    const selectedClassObj = classes?.find((c: any) => c.id === filters.classId);
    const requiresStream = selectedClassObj?.streamsEnabled;

    const { data: streams } = useStreams(filters.classId, filters.institutionId);
    const { data: sections } = useSections(filters.classId, filters.institutionId, filters.streamId);

    // ── Cascade resets ──
    useEffect(() => {
        if (filters.institutionId && filters.classId) {
            const validClass = classes?.some((c: any) => c.id === filters.classId);
            if (!validClass && classes && classes.length > 0) {
                onChange({ ...filters, classId: undefined, streamId: undefined, sectionId: undefined });
            }
        }
    }, [classes]);

    const hasActiveFilters = useMemo(
        () => !!(filters.institutionId || filters.classId || filters.streamId || filters.sectionId || filters.dataStatus || filters.search),
        [filters]
    );

    const clearAll = () => onChange({});

    const set = (key: keyof StudentFilterValues, value: string | undefined) => {
        const next = { ...filters, [key]: value };
        // cascade resets
        if (key === 'institutionId') { next.classId = undefined; next.streamId = undefined; next.sectionId = undefined; }
        if (key === 'classId') { next.streamId = undefined; next.sectionId = undefined; }
        if (key === 'streamId') { next.sectionId = undefined; }
        onChange(next);
    };

    return (
        <div className="flex flex-wrap items-center gap-3 p-4 bg-card rounded-xl border">
            {/* Search */}
            <Input
                placeholder="Search name, admission no..."
                value={filters.search || ''}
                onChange={(e) => set('search', e.target.value || undefined)}
                className="w-[220px]"
            />

            {/* Institution */}
            <Select value={filters.institutionId || '_all'} onValueChange={(v) => set('institutionId', v === '_all' ? undefined : v)}>
                <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All Institutions" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="_all">All Institutions</SelectItem>
                    {institutions.map((inst: any) => (
                        <SelectItem key={inst.id} value={inst.id}>{inst.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Class — only when institution is selected */}
            {filters.institutionId && (
                <Select value={filters.classId || '_all'} onValueChange={(v) => set('classId', v === '_all' ? undefined : v)}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="All Classes" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="_all">All Classes</SelectItem>
                        {classes?.map((cls: any) => (
                            <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            {/* Stream — only if the selected class has streams */}
            {filters.classId && requiresStream && (
                <Select value={filters.streamId || '_all'} onValueChange={(v) => set('streamId', v === '_all' ? undefined : v)}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="All Streams" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="_all">All Streams</SelectItem>
                        {streams?.map((s: any) => (
                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            {/* Section */}
            {filters.classId && (
                <Select value={filters.sectionId || '_all'} onValueChange={(v) => set('sectionId', v === '_all' ? undefined : v)}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="All Sections" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="_all">All Sections</SelectItem>
                        {sections?.map((sec: any) => (
                            <SelectItem key={sec.id} value={sec.id}>{sec.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            {/* Data Status */}
            <Select value={filters.dataStatus || '_all'} onValueChange={(v) => set('dataStatus', v === '_all' ? undefined : v)}>
                <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="_all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="filled">Filled</SelectItem>
                    <SelectItem value="enhanced">Enhanced</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
            </Select>

            {/* Clear Filters */}
            {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearAll} className="text-muted-foreground gap-1">
                    <X className="w-3.5 h-3.5" /> Clear
                </Button>
            )}
        </div>
    );
}
