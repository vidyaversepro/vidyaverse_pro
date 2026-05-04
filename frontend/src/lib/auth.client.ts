import { createAuthClient } from "better-auth/react";

// Backend runs on port 3002 — Better Auth is mounted at /api/auth/*
// @ts-ignore
const isDev = import.meta.env.DEV;
const apiUrl = import.meta.env.VITE_API_URL || "";
const baseURL = apiUrl.endsWith('/api/v1') ? apiUrl.replace('/api/v1', '') : apiUrl;

export const authClient = createAuthClient({
    baseURL
});

export const { signIn, signUp, signOut, useSession } = authClient;
