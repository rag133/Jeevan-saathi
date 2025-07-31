import path from 'path';
import path from 'path';
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    build: {
      rollupOptions: {
        input: 'index.html',
      },
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        'modules': path.resolve(__dirname, 'modules'),
        'services': path.resolve(__dirname, 'services'),
      }
    }
  };
});
