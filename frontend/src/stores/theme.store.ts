import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Brand accent for the landing page. 'kumkum' is the canonical Vidyaverse
 * accent (see design/indic/indic-app.css); 'peacock' is the alternate the
 * reference design's Super Admin panel can switch to live.
 *
 * TODO(super-admin): this is landing-local state for now — when the super-admin
 * module ships tenant appearance settings, source the accent from the tenant
 * record and treat this store as the optimistic client cache.
 */
export type Accent = 'kumkum' | 'peacock';

interface ThemeState {
    isDarkMode: boolean;
    accent: Accent;
    setDarkMode: (isDark: boolean) => void;
    toggleDarkMode: () => void;
    setAccent: (accent: Accent) => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
            accent: 'kumkum',
            setDarkMode: (isDark) => set({ isDarkMode: isDark }),
            toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
            setAccent: (accent) => set({ accent }),
        }),
        {
            name: 'vp-dashboard-theme', // localStorage key
        }
    )
);
