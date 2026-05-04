/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
        allowedHosts: ['vgraphics.in', 'localhost'],
        // HMR: when accessed via tunnel, use wss:// on the tunnel domain.
        // When accessed locally, Vite's default ws://localhost works fine.
        ...(process.env.VITE_TUNNEL_HOST ? {
            hmr: {
                protocol: 'wss',
                host: process.env.VITE_TUNNEL_HOST, // e.g. 'vgraphics.in'
            },
        } : {}),
        proxy: {
            '/api': {
                target: 'http://localhost:3002',
                changeOrigin: true,
            },
            '/uploads': {
                target: 'http://localhost:3002',
                changeOrigin: true,
            },
        },
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: './src/test/setup.ts',
    },
});
