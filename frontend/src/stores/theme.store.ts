import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
    isDarkMode: boolean;
    setDarkMode: (isDark: boolean) => void;
    toggleDarkMode: () => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
            setDarkMode: (isDark) => set({ isDarkMode: isDark }),
            toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
        }),
        {
            name: 'vp-dashboard-theme', // localStorage key
        }
    )
);
