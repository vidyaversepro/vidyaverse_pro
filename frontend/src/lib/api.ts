import axios from 'axios';
import { useActiveInstitution } from '@/stores/activeInstitution';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

/**
 * Default timeout: 30 seconds.
 * Individual requests can override via { timeout: N } in their config.
 */
const DEFAULT_TIMEOUT_MS = 30_000;

export const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: DEFAULT_TIMEOUT_MS,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Crucial for Better Auth session cookies
});

// ---------------------------------------------------------------------------
// Request interceptor — attach the active institution as x-institution-id so
// scoped endpoints resolve the right tenant. Never overrides an explicit header.
// ---------------------------------------------------------------------------
api.interceptors.request.use((config) => {
    const institutionId = useActiveInstitution.getState().institutionId;
    if (institutionId) {
        config.headers = config.headers ?? {};
        if (!config.headers['x-institution-id']) {
            config.headers['x-institution-id'] = institutionId;
        }
    }
    return config;
});

// ---------------------------------------------------------------------------
// Response interceptor — normalise error shape for consumers
// ---------------------------------------------------------------------------
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Timeout
        if (error.code === 'ECONNABORTED') {
            return Promise.reject(
                new Error('The request timed out. Please check your connection and try again.')
            );
        }

        // Network error (offline, CORS, etc.)
        if (!error.response) {
            return Promise.reject(
                new Error('Network error. Please check your internet connection.')
            );
        }

        return Promise.reject(error);
    }
);
