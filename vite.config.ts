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
    },
    resolve: {
      alias: {
        '~': path.resolve(__dirname, '.'),
      },
    },
  };
});