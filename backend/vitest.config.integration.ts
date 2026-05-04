import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        include: ['tests/integration/**/*.test.ts'],
        environment: 'node',
        globals: true,
        setupFiles: ['tests/setup.ts'],
        testTimeout: 30000,
        // Integration tests run sequentially to avoid DB conflicts
        sequence: {
            concurrent: false,
        },
    },
});
