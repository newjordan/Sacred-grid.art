import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { transformWithOxc, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

// CRA compiled JSX inside `.js` files. Vite 8's Oxc parser only enables JSX
// for `.jsx`/`.tsx`, so these files are transformed before the rest of the
// pipeline sees them.
function jsxInJs(): Plugin {
  return {
    name: 'jsx-in-js',
    enforce: 'pre',
    async transform(code, id) {
      const file = id.split('?')[0];
      if (!file.includes(`${path.sep}src${path.sep}`) || !file.endsWith('.js')) return null;
      if (!code.includes('</') && !code.includes('/>') && !code.includes('<>')) return null;
      const result = await transformWithOxc(code, file, {
        lang: 'jsx',
        jsx: {
          runtime: 'automatic',
          development: process.env.NODE_ENV !== 'production',
        },
      });
      return { code: result.code, map: result.map };
    },
  };
}

// The live site is https://sacred-grid.art at the domain root. Create React App
// derived that same public path from package.json "homepage". Vite uses `base`.
// New client env vars use the `VITE_` prefix and are read from `import.meta.env`.
// `import.meta.env.MODE` replaces `process.env.NODE_ENV` for dev/prod checks.
export default defineConfig({
  base: '/',
  plugins: [jsxInJs(), react()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, 'src'),
      '@components': path.resolve(rootDir, 'src/components'),
      '@utils': path.resolve(rootDir, 'src/utils'),
      '@hooks': path.resolve(rootDir, 'src/hooks'),
      '@types': path.resolve(rootDir, 'src/types'),
    },
    tsconfigPaths: true,
  },
  server: {
    port: 3000,
  },
  // Only the app entry is a dependency-scan root. Loose HTML fixtures in the
  // repo and public/donate are not part of the dev server graph. `.js` files
  // still contain JSX, so the scanner has to parse them as JSX.
  optimizeDeps: {
    entries: ['index.html'],
    rolldownOptions: {
      moduleTypes: {
        '.js': 'jsx',
      },
    },
  },
  preview: {
    port: 4173,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    css: true,
  },
});
