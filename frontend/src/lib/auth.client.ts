import { createAuthClient } from "better-auth/react";

// Backend runs on port 3002 — Better Auth is mounted at /api/auth/*
// @ts-ignore
const isDev = import.meta.env.DEV;
const apiUrl = import.meta.env.VITE_API_URL || "";
const baseURL = apiUrl.endsWith('/api/v1') ? apiUrl.replace('/api/v1', '') : apiUrl;

export const authClient = createAuthClient({
    baseURL
});

// Origin of the Better Auth handler (the API host). The SPA and the backend are
// separate Coolify apps on different domains and nginx here proxies no /api, so
// any hand-built auth URL (OIDC authorize/consent) MUST be absolute — a relative
// one resolves to the SPA and falls through to index.html.
export const AUTH_BASE = baseURL;

export const { signIn, signUp, signOut, useSession } = authClient;
