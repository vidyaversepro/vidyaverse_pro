import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LayoutState {
    sidebarOpen: boolean;
    mobileSidebar: boolean;
    setSidebarOpen: (open: boolean) => void;
    toggleSidebar: () => void;
    setMobileSidebar: (open: boolean) => void;
    toggleMobileSidebar: () => void;
}

export const useLayoutStore = create<LayoutState>()(
    persist(
        (set) => ({
            sidebarOpen: true,
            mobileSidebar: false,
            setSidebarOpen: (open) => set({ sidebarOpen: open }),
            toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
            setMobileSidebar: (open) => set({ mobileSidebar: open }),
            toggleMobileSidebar: () => set((state) => ({ mobileSidebar: !state.mobileSidebar })),
        }),
        {
            name: 'vp-layout-store',
            partialize: (state) => ({ sidebarOpen: state.sidebarOpen }), // Only persist desktop state
        }
    )
);
