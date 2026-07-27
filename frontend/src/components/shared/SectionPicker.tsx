import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClasses, useSections } from '@/lib/queries/institution/institution-queries';
import { useMyEntitlements } from '@/lib/queries/admin/entitlements-queries';

interface ClassRow { id: string; name: string }
interface SectionRow { id: string; name: string; stream?: { name: string } | null }

/**
 * Cascading Class → Section picker. Emits the chosen sectionId.
 * Institution is resolved from the signed-in user's entitlements.
 */
export function SectionPicker({
  value,
  onChange,
  className,
}: {
  value?: string;
  onChange: (sectionId: string) => void;
  className?: string;
}) {
  const { data: ent } = useMyEntitlements();
  const institutionId = ent?.institutionId;
  const [classId, setClassId] = useState<string>('');

  const { data: classes } = useClasses(institutionId);
  const { data: sections } = useSections(classId || undefined, institutionId);

  // If the selected section no longer belongs to the chosen class, clear it.
  useEffect(() => {
    if (!classId && value) onChange('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  return (
    <div className={className}>
      <div className="grid grid-cols-2 gap-2">
        <Select value={classId} onValueChange={setClassId}>
          <SelectTrigger><SelectValue placeholder="Class" /></SelectTrigger>
          <SelectContent>
            {((classes as ClassRow[] | undefined) ?? []).map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={value ?? ''} onValueChange={onChange} disabled={!classId}>
          <SelectTrigger><SelectValue placeholder="Section" /></SelectTrigger>
          <SelectContent>
            {((sections as SectionRow[] | undefined) ?? []).map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}{s.stream ? ` · ${s.stream.name}` : ''}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
