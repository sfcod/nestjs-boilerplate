import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import swc from 'unplugin-swc';

const swcPlugin = swc.vite({
    jsc: {
        transform: {
            decoratorMetadata: true,
            legacyDecorator: true,
        },
    },
});

const commonProjectTest = {
    globals: true,
    environment: 'node' as const,
    include: ['test/**/*.e2e-spec.ts'],
    fileParallelism: false,
    sequence: { hooks: 'list' as const },
};

const configRoot = import.meta.dirname;

export default defineConfig({
    plugins: [tsconfigPaths({ root: configRoot }), swcPlugin],
    test: {
        projects: [
            {
                plugins: [tsconfigPaths({ root: configRoot }), swcPlugin],
                test: {
                    ...commonProjectTest,
                    name: 'admin',
                    root: 'apps/admin',
                    testTimeout: 160000,
                    setupFiles: ['test/setup.ts'],
                },
            },
            {
                plugins: [tsconfigPaths({ root: configRoot }), swcPlugin],
                test: {
                    ...commonProjectTest,
                    name: 'client',
                    root: 'apps/client',
                    testTimeout: 160000,
                    setupFiles: ['test/setup.ts'],
                },
            },
            {
                plugins: [tsconfigPaths({ root: configRoot }), swcPlugin],
                test: {
                    ...commonProjectTest,
                    name: 'database',
                    root: 'apps/database',
                },
            },
            {
                plugins: [tsconfigPaths({ root: configRoot }), swcPlugin],
                test: {
                    ...commonProjectTest,
                    name: 'health',
                    root: 'apps/health',
                    testTimeout: 160000,
                },
            },
        ],
    },
});
