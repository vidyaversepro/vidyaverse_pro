import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthorityProfile {
    id: string; // temp client-side id for mapping
    name: string;
    designation: string;
    roleType: 'PRINCIPAL' | 'VICE_CHANCELLOR' | 'HOD' | 'REGISTRAR' | 'DEAN' | 'DIRECTOR' | 'COORDINATOR' | 'TEACHER' | 'CUSTOM';
    email?: string;
    phone?: string;
    signatureFile?: File; // File doesn't persist well in localStorage, but we can store it in RAM
    signatureUrl?: string; // For rendering existing or just-uploaded signatures
}

export interface OnboardingState {
    institutionType: string;
    logoFile: File | null;
    darkLogoFile: File | null;
    authorities: AuthorityProfile[];

    setInstitutionType: (type: string) => void;
    setLogoFile: (file: File | null) => void;
    setDarkLogoFile: (file: File | null) => void;
    addAuthority: (authority: AuthorityProfile) => void;
    updateAuthority: (id: string, authority: Partial<AuthorityProfile>) => void;
    removeAuthority: (id: string) => void;
    reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
    persist(
        (set) => ({
            institutionType: 'SCHOOL',
            logoFile: null,
            darkLogoFile: null,
            authorities: [],

            setInstitutionType: (type) => set({ institutionType: type }),
            setLogoFile: (file) => set({ logoFile: file }),
            setDarkLogoFile: (file) => set({ darkLogoFile: file }),
            addAuthority: (authority) => set((state) => ({ authorities: [...state.authorities, authority] })),
            updateAuthority: (id, authority) =>
                set((state) => ({
                    authorities: state.authorities.map((a) => (a.id === id ? { ...a, ...authority } : a)),
                })),
            removeAuthority: (id) =>
                set((state) => ({ authorities: state.authorities.filter((a) => a.id !== id) })),
            reset: () => set({ institutionType: 'SCHOOL', logoFile: null, darkLogoFile: null, authorities: [] }),
        }),
        {
            name: 'vidyaverse-onboarding-storage',
            // Files cannot be serialized to JSON, so omit them from persistence
            partialize: (state) => ({
                institutionType: state.institutionType,
                // Do not persist File objects
                authorities: state.authorities.map(a => ({ ...a, signatureFile: undefined })),
            }),
        }
    )
);
