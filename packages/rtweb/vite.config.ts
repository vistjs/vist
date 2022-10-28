/** @type {import('vite').UserConfig} */
import { resolve } from 'path';
import { defineConfig } from 'vite';
export default defineConfig({
  resolve: {
    alias: {
      '@/': `${resolve(__dirname, 'src')}/`,
    },
  },
  build: {
    target: ['es2020'],
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'rtweb',
      // the proper extensions will be added
      fileName: 'index',
    },
    outDir: 'es',
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020',
    },
  },
});
