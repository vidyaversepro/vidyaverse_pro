import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Building2 } from 'lucide-react';

import { useSession } from '@/lib/auth.client';
import { useInstitutions } from '@/lib/queries';
import { useActiveInstitution } from '@/stores/activeInstitution';

/**
 * Lets a super-admin choose which institution to operate on. The choice is
 * stored in the active-institution store and attached to every API call as
 * `x-institution-id` (see lib/api.ts), so all scoped pages (ID cards, students,
 * entitlements, …) resolve the selected tenant.
 *
 * Hidden for non-super-admins — their institution is resolved server-side from
 * their membership.
 */
export default function InstitutionSwitcher() {
    const { data: session } = useSession();
    const isSuperAdmin =
        (session?.user as { globalRole?: string } | undefined)?.globalRole === 'super_admin';

    const queryClient = useQueryClient();
    const { institutionId, setInstitutionId } = useActiveInstitution();
    const { data } = useInstitutions({ page: 1, limit: 100 });
    const institutions: Array<{ id: string; name: string }> = (data as any)?.data ?? [];

    // Default to (or reconcile against) the first institution once the list loads.
    useEffect(() => {
        if (!isSuperAdmin || institutions.length === 0) return;
        const stillValid = institutionId && institutions.some((i) => i.id === institutionId);
        if (!stillValid) {
            setInstitutionId(institutions[0].id);
            // Anything fetched before the header was set (e.g. entitlements on
            // mount) should refetch against the now-selected institution.
            queryClient.invalidateQueries();
        }
    }, [isSuperAdmin, institutions, institutionId, setInstitutionId, queryClient]);

    if (!isSuperAdmin || institutions.length === 0) return null;

    const handleChange = (id: string) => {
        setInstitutionId(id);
        queryClient.invalidateQueries();
    };

    return (
        <div className="hidden sm:flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 px-2.5 h-9">
            <Building2 className="w-4 h-4 text-[#E63946] shrink-0" />
            <select
                value={institutionId ?? ''}
                onChange={(e) => handleChange(e.target.value)}
                className="bg-transparent text-sm font-medium text-gray-700 dark:text-gray-200 outline-none max-w-[180px] truncate cursor-pointer"
                title="Active institution"
            >
                {institutions.map((i) => (
                    <option key={i.id} value={i.id}>
                        {i.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
