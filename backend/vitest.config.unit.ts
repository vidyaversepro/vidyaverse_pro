import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        include: ['tests/unit/**/*.test.ts'],
        environment: 'node',
        globals: true,
        setupFiles: ['tests/setup.ts'],
        testTimeout: 10000,
        coverage: {
            provider: 'v8',
            include: ['src/**/*.ts'],
            exclude: ['src/index.ts', 'src/**/*.d.ts'],
            reporter: ['text', 'lcov', 'json-summary'],
        },
    },
});
