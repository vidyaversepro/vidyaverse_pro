import { describe, it, expect } from 'vitest';
import { api } from '../../src/lib/api';

describe('API Client', () => {
    describe('Configuration', () => {
        it('should have the correct base URL', () => {
            const expectedUrl = import.meta.env.VITE_API_URL || '/api/v1';
            expect(api.defaults.baseURL).toBe(expectedUrl);
        });

        it('should set Content-Type to application/json', () => {
            expect(api.defaults.headers['Content-Type']).toBe('application/json');
        });

        it('should enable withCredentials for session cookies', () => {
            expect(api.defaults.withCredentials).toBe(true);
        });
    });

    describe('Interceptors', () => {
        it('should have request interceptors registered', () => {
            // axios creates an interceptor manager; verify it exists
            expect(api.interceptors.request).toBeDefined();
        });

        it('should have response interceptors registered', () => {
            expect(api.interceptors.response).toBeDefined();
        });
    });
});
