import { build } from 'esbuild';
import { rm, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

const BUILD_DIR = 'dist';

async function buildProject() {
  try {
    // Clean build directory
    if (existsSync(BUILD_DIR)) {
      await rm(BUILD_DIR, { recursive: true });
    }
    await mkdir(BUILD_DIR);

    // Build the main application
    await build({
      entryPoints: ['index.tsx'],
      bundle: true,
      outfile: join(BUILD_DIR, 'index.mjs'),
      format: 'esm',
      target: 'es2020',
      jsx: 'automatic',
      minify: true,
      sourcemap: true,
      loader: {
        '.tsx': 'tsx',
        '.ts': 'ts'
      },
      define: {
        'process.env.NODE_ENV': '"production"'
      }
    });

    // Copy static files
    const { copyFile } = await import('fs/promises');
    await copyFile('index.html', join(BUILD_DIR, 'index.html'));

    console.log('✅ Build completed successfully!');
    console.log(`📁 Output directory: ${BUILD_DIR}`);
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildProject();
