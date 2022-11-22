/** @type {import('vite').UserConfig} */
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      '@/': `${resolve(__dirname, 'src')}/`,
      '@pollyjs/core': '@pollyjs/core/dist/umd/pollyjs-core.js',
      '@pollyjs/adapter-xhr': '@pollyjs/adapter-xhr/dist/umd/pollyjs-adapter-xhr.js',
      '@pollyjs/adapter-fetch': '@pollyjs/adapter-fetch/dist/umd/pollyjs-adapter-fetch.js',
      '@pollyjs/persister-local-storage':
        '@pollyjs/persister-local-storage/dist/umd/pollyjs-persister-local-storage.js',
    },
  },
  build: {
    target: ['es2020'],
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'vist',
      // the proper extensions will be added
      fileName: 'index',
    },
    outDir: 'es',
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    watch: {},
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020',
    },
  },
});
