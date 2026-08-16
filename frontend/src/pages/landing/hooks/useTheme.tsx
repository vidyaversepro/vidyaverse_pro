import { useThemeStore, type Accent } from '@/stores/theme.store';

type Theme = 'light' | 'dark';

/**
 * Landing-page theme adapter.
 *
 * This used to be an independent React Context that kept its own `vp-theme`
 * localStorage key and toggled `.dark` on the `.landing-root` ELEMENT, while
 * the dashboard's Zustand store kept `vp-dashboard-theme` and toggled `.dark`
 * on `<html>`. Two elements independently carrying `.dark` meant a token could
 * resolve differently inside vs outside `.landing-root` — and a user who
 * switched to dark in the app still landed on a light marketing page.
 *
 * There is now ONE source of truth: the Zustand store, applied to <html> by
 * App.tsx. This module keeps the old `useTheme()` shape so the landing Navbar
 * needs no change, but it is a thin adapter — it owns no state and writes no
 * class of its own. `.landing-root.dark` selectors in landing.css moved to
 * `.dark .landing-root` to match. The brand accent lives in the same store
 * and is applied by LandingPage as an `acc-*` class on `.landing-root`.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

interface UseTheme {
    theme: Theme;
    toggleTheme: () => void;
    accent: Accent;
    setAccent: (accent: Accent) => void;
}

export const useTheme = (): UseTheme => {
    const isDarkMode = useThemeStore((s) => s.isDarkMode);
    const toggleDarkMode = useThemeStore((s) => s.toggleDarkMode);
    const accent = useThemeStore((s) => s.accent);
    const setAccent = useThemeStore((s) => s.setAccent);
    return { theme: isDarkMode ? 'dark' : 'light', toggleTheme: toggleDarkMode, accent, setAccent };
};
