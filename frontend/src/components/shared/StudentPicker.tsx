import { useMemo, useState } from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useStudents } from '@/lib/queries/student/student-queries';
import { useMyEntitlements } from '@/lib/queries/admin/entitlements-queries';
import { cn } from '@/lib/utils';

interface StudentRow {
  id: string;
  name: string;
  rollNo?: number;
  admissionNumber?: string;
  section?: { name: string; class: { name: string } };
}

/**
 * Searchable student picker. Optionally scoped to a section. Emits studentId.
 * Loads an institution- (and optionally section-) scoped page and filters by
 * name/admission number client-side.
 */
export function StudentPicker({
  value,
  onChange,
  sectionId,
  className,
}: {
  value?: string;
  onChange: (studentId: string, student?: StudentRow) => void;
  sectionId?: string;
  className?: string;
}) {
  const { data: ent } = useMyEntitlements();
  const institutionId = ent?.institutionId;
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const params: Record<string, string> = { limit: '200' };
  if (institutionId) params.institutionId = institutionId;
  if (sectionId) params.sectionId = sectionId;
  const { data, isLoading } = useStudents(params);

  const students = (data?.data as StudentRow[] | undefined) ?? [];
  const selected = students.find((s) => s.id === value);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students.slice(0, 50);
    return students
      .filter((s) => s.name.toLowerCase().includes(q) || (s.admissionNumber ?? '').toLowerCase().includes(q))
      .slice(0, 50);
  }, [students, search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className={cn('w-full justify-between font-normal', className)}>
          <span className="truncate">{selected ? `${selected.name}${selected.admissionNumber ? ` (${selected.admissionNumber})` : ''}` : value ? value : 'Select student…'}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name / admission no…"
            className="h-9 border-0 px-0 focus-visible:ring-0"
          />
        </div>
        <div className="max-h-64 overflow-auto p-1">
          {isLoading ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">{sectionId ? 'No students in this section.' : 'No students found.'}</p>
          ) : (
            filtered.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => { onChange(s.id, s); setOpen(false); setSearch(''); }}
                className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
              >
                <span>
                  <span className="font-medium">{s.name}</span>
                  <span className="ml-1 text-xs text-muted-foreground">{s.section ? `${s.section.class.name}-${s.section.name}` : ''}{s.admissionNumber ? ` · ${s.admissionNumber}` : ''}</span>
                </span>
                {value === s.id && <Check className="h-4 w-4" />}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
