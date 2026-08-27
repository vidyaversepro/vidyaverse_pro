import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        // Co-located suites under src/**/__tests__ count as unit tests too. Without
        // this second glob, src/utils/__tests__/pii-masking.test.ts — the suite that
        // actually matches the shipped implementation — was never executed.
        include: ['tests/unit/**/*.test.ts', 'src/**/__tests__/**/*.test.ts'],
        environment: 'node',
        // src/config/env.ts validates on import and calls process.exit(1) when a
        // required variable is missing, which kills the whole vitest process rather
        // than failing one test. It reads those from a local .env that CI does not
        // have, so pin deterministic values here and the suite runs on a fresh
        // clone. dotenv does not override already-set vars, so this also keeps unit
        // tests off the real R2 bucket the dev .env points at.
        env: {
            DATABASE_URL: 'postgresql://test:test@localhost:5432/vidyaverse_test',
            JWT_SECRET: 'test-jwt-secret-minimum-32-characters-long',
            BETTER_AUTH_SECRET: 'test-better-auth-secret-minimum-32-chars',
            R2_ENDPOINT: 'https://r2.test.invalid',
            R2_ACCESS_KEY_ID: 'test-access-key-id',
            R2_SECRET_ACCESS_KEY: 'test-secret-access-key',
            R2_PUBLIC_URL: 'https://storage.test.invalid',
        },
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
