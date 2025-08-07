import { build } from 'esbuild';
import { rm, mkdir, copyFile } from 'fs/promises';
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
        '.ts': 'ts',
      },
      define: {
        'process.env.NODE_ENV': '"production"',
        'import.meta.env.VITE_FIREBASE_API_KEY': '"AIzaSyAtc3vYe6tV14w37NEJkaDfTR096fb7q1Y"',
        'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': '"jeevan-saathi-39bf5.firebaseapp.com"',
        'import.meta.env.VITE_FIREBASE_PROJECT_ID': '"jeevan-saathi-39bf5"',
        'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': '"jeevan-saathi-39bf5.firebasestorage.app"',
        'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID': '"65030332753"',
        'import.meta.env.VITE_FIREBASE_APP_ID': '"1:65030332753:web:e4eb572e4a4c3ca772b370"',
        'import.meta.env.VITE_FIREBASE_MEASUREMENT_ID': '"G-274K2278C1"',
        'import.meta.env.VITE_GEMINI_API_KEY': '"AIzaSyBAVXKA-ko41iIzXkv_59jR615RqYz8Zv0"',
      },
      plugins: [
        {
          name: 'path-resolver',
          setup(build) {
            build.onResolve({ filter: /(?:\.\.\/)*(modules|services)\/.*\.ts$/ }, (args) => {
              return { path: join(args.resolveDir, args.path) };
            });
          },
        },
      ],
    });

    // Copy and modify index.html
    const { readFile, writeFile } = await import('fs/promises');
    let htmlContent = await readFile('index.html', 'utf-8');
    htmlContent = htmlContent.replace(
      '<script type="module" src="/index.tsx"></script>',
      '<script type="module" src="/index.mjs"></script>'
    );
    await writeFile(join(BUILD_DIR, 'index.html'), htmlContent);

    // Copy public directory assets
    const { cp } = await import('fs/promises');
    if (existsSync('public')) {
      await cp('public', join(BUILD_DIR, 'public'), { recursive: true });
      console.log('📁 Public directory copied successfully');
    }

    console.log('✅ Build completed successfully!');
    console.log(`📁 Output directory: ${BUILD_DIR}`);
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildProject();
