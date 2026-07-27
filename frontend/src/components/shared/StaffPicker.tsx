import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStaff } from '@/lib/queries/hr/hr-queries';

/**
 * Staff dropdown. Emits the chosen staff member's id. Staff lists are small,
 * so a plain Select (no search) is sufficient.
 */
export function StaffPicker({
  value,
  onChange,
  className,
}: {
  value?: string;
  onChange: (staffId: string) => void;
  className?: string;
}) {
  const { data: staff } = useStaff();

  return (
    <Select value={value ?? ''} onValueChange={onChange}>
      <SelectTrigger className={className}><SelectValue placeholder="Select staff…" /></SelectTrigger>
      <SelectContent>
        {(staff ?? []).map((s) => (
          <SelectItem key={s.id} value={s.id}>
            {s.firstName}{s.lastName ? ` ${s.lastName}` : ''}{s.department ? ` · ${s.department}` : ''} ({s.employeeCode})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
