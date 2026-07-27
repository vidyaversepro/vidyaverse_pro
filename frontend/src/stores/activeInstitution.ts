import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Client-side "active institution" — the institution context that scoped API
 * calls operate against. An axios request interceptor (see lib/api.ts) attaches
 * it as the `x-institution-id` header so every institution-scoped endpoint
 * resolves the same tenant, without each call having to thread institutionId.
 *
 * Primarily used by super-admins (who can operate any institution and pick one
 * via the InstitutionSwitcher). Single-institution users are resolved
 * server-side from their membership, so they don't need this set.
 */
interface ActiveInstitutionState {
    institutionId: string | null;
    setInstitutionId: (id: string | null) => void;
}

export const useActiveInstitution = create<ActiveInstitutionState>()(
    persist(
        (set) => ({
            institutionId: null,
            setInstitutionId: (id) => set({ institutionId: id }),
        }),
        { name: 'vidyaverse-active-institution' }
    )
);
