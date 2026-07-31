import * as Sentry from '@sentry/node';

// Initialise error tracking as early as possible. This module is imported at the
// very top of index.ts — before anything else — so Sentry can instrument the
// runtime. The DSN is injected via the SENTRY_DSN env var (Coolify); when it is
// absent (e.g. local dev) init() is skipped and the SDK stays a no-op.
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'production',
    // Errors are tracked in GlitchTip; performance tracing is left off.
    tracesSampleRate: 0,
    // Don't report expected client errors (401/403/404/validation, etc.) — only
    // genuine 5xx server faults. Fastify/http-errors carry a numeric statusCode.
    beforeSend(event, hint) {
      const err = hint?.originalException as
        | { statusCode?: number; status?: number }
        | undefined;
      const status = err?.statusCode ?? err?.status;
      if (typeof status === 'number' && status >= 400 && status < 500) {
        return null;
      }
      return event;
    },
  });
}
