import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
    isAuthenticated: boolean;
    // Actions (mostly stubbed out as Better Auth handles true state, keeping for legacy compatibility if needed)
    setAuth: (isAuthenticated: boolean) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            isAuthenticated: false,

            setAuth: (isAuthenticated) =>
                set({
                    isAuthenticated,
                }),

            logout: () =>
                set({
                    isAuthenticated: false,
                }),
        }),
        {
            name: 'vidyaverse-auth-ui',
        }
    )
);
