import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Sentry from '@sentry/react';
import App from './App';
import './index.css';

// Error tracking — DSN inlined at build via VITE_SENTRY_DSN (Coolify build arg);
// a no-op when it is absent (e.g. local dev).
if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
        dsn: import.meta.env.VITE_SENTRY_DSN,
        environment: import.meta.env.MODE,
        // Errors only — no tracing, no session replay.
        tracesSampleRate: 0,
        replaysSessionSampleRate: 0,
        replaysOnErrorSampleRate: 0,
    });
}

// Deliberate test error for end-to-end verification: load any page with
// ?sentry-test to report one error. Safe to remove once GlitchTip is confirmed.
if (new URLSearchParams(window.location.search).has('sentry-test')) {
    Sentry.captureException(
        new Error('GlitchTip test error — vidyaverse-frontend (safe to ignore)'),
    );
}

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <App />
        </QueryClientProvider>
    </React.StrictMode>
);
