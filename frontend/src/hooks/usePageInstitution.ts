import { useSearchParams } from 'react-router-dom';
import { useActiveInstitution } from '@/stores/activeInstitution';

/**
 * The institution a page should operate on. Single source of truth so every
 * printable page behaves like the ID Cards page:
 *   1. the globally-selected institution (InstitutionSwitcher / x-institution-id), then
 *   2. a `?institutionId=` URL param fallback (legacy deep-links).
 *
 * Returns `undefined` when neither is set — for single-institution users that's
 * fine: the API resolves their tenant server-side from membership.
 */
export function usePageInstitution(): string | undefined {
    const active = useActiveInstitution((s) => s.institutionId);
    const [searchParams] = useSearchParams();
    return active || searchParams.get('institutionId') || undefined;
}
