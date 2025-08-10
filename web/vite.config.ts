import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './vitest.setup.ts',
    },
    build: {
      rollupOptions: {
        input: 'index.html',
        output: {
          entryFileNames: 'index.mjs',
          chunkFileNames: '[name].mjs',
          assetFileNames: '[name].[ext]',
        },
      },
      // Ensure public directory assets are copied
      copyPublicDir: true,
    },
    resolve: {
      alias: {
        '~': path.resolve(__dirname, '.'),
        '~/shared': path.resolve(__dirname, '../shared'),
        '~/shared/*': path.resolve(__dirname, '../shared/*'),
        '@jeevan-saathi/shared': path.resolve(__dirname, '../shared'),
        '@jeevan-saathi/shared/*': path.resolve(__dirname, '../shared/*'),
      },
    },
  };
});