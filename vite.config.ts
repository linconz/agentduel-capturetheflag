import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  build: {
    emptyOutDir: false,
    lib: {
      entry: {
        index: resolve(import.meta.dirname, 'src/index.ts'),
        'team-create': resolve(import.meta.dirname, 'src/team-create.ts'),
        'team-edit': resolve(import.meta.dirname, 'src/team-edit.ts'),
        'recent-battles': resolve(import.meta.dirname, 'src/recent-battles.ts')
      },
      formats: ['es'],
      cssFileName: 'agentduel-capturetheflag'
    },
    rollupOptions: {
      external: [
        'i18next',
        'react',
        'react-dom',
        'react-i18next',
        'react/jsx-runtime'
      ],
      output: {
        assetFileNames: 'assets/[name][extname]',
        entryFileNames: '[name].js'
      }
    },
    sourcemap: true
  }
});
