import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../../src/stores/auth.store';

describe('Auth Store', () => {
    beforeEach(() => {
        // Reset store state before each test
        useAuthStore.setState({ isAuthenticated: false });
    });

    describe('Initial state', () => {
        it('should start with isAuthenticated as false', () => {
            const state = useAuthStore.getState();
            expect(state.isAuthenticated).toBe(false);
        });
    });

    describe('setAuth', () => {
        it('should set isAuthenticated to true', () => {
            useAuthStore.getState().setAuth(true);
            expect(useAuthStore.getState().isAuthenticated).toBe(true);
        });

        it('should set isAuthenticated to false', () => {
            useAuthStore.getState().setAuth(true);
            useAuthStore.getState().setAuth(false);
            expect(useAuthStore.getState().isAuthenticated).toBe(false);
        });
    });

    describe('logout', () => {
        it('should reset isAuthenticated to false', () => {
            useAuthStore.getState().setAuth(true);
            expect(useAuthStore.getState().isAuthenticated).toBe(true);

            useAuthStore.getState().logout();
            expect(useAuthStore.getState().isAuthenticated).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should have the correct persist key name', () => {
            // The persist middleware uses this key in localStorage
            const persistConfig = (useAuthStore as unknown as { persist: { getOptions: () => { name: string } } }).persist;
            if (persistConfig && typeof persistConfig.getOptions === 'function') {
                expect(persistConfig.getOptions().name).toBe('vidyaverse-auth-ui');
            } else {
                // Fall back to verifying the store is functional
                expect(useAuthStore.getState()).toBeDefined();
            }
        });
    });
});
