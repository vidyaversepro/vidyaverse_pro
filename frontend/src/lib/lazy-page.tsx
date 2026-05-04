import { Suspense, lazy, ComponentType } from 'react';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

/**
 * PageLoader – shared Suspense fallback for lazy-loaded pages.
 */
export function PageLoader() {
    return (
        <div className= "min-h-screen flex items-center justify-center" >
        <div className="flex flex-col items-center gap-3" >
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <span className="text-sm text-muted-foreground" > Loading…</span>
                    </div>
                    </div>
    );
}

/**
 * lazyPage – wraps React.lazy with per-page ErrorBoundary + Suspense.
 *
 * Usage:
 *   const DashboardPage = lazyPage(() => import('@/pages/dashboard/DashboardPage'));
 *   <Route path="dashboard" element={<DashboardPage />} />
 */
export function lazyPage(importFn: () => Promise<{ default: ComponentType<any> }>) {
    const LazyComponent = lazy(importFn);

    function WrappedPage() {
        return (
            <ErrorBoundary>
            <Suspense fallback= {< PageLoader />}>
                <LazyComponent />
                </Suspense>
                </ErrorBoundary>
        );
}

// Preserve display name for DevTools
const name = importFn.toString().match(/\/(\w+)['"`]/)?.[1] ?? 'LazyPage';
WrappedPage.displayName = `LazyPage(${name})`;

return WrappedPage;
}
