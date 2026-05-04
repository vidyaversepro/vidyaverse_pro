import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    test: {
        include: ['tests/**/*.test.{ts,tsx}'],
        environment: 'jsdom',
        globals: true,
        setupFiles: ['tests/setup.ts'],
        testTimeout: 10000,
        coverage: {
            provider: 'v8',
            include: ['src/**/*.{ts,tsx}'],
            exclude: ['src/**/*.d.ts', 'src/routeTree.gen.ts'],
            reporter: ['text', 'lcov', 'json-summary'],
        },
    },
});
