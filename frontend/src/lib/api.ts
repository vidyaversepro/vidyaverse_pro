import axios from 'axios';

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
