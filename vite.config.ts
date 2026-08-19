import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { libInjectCss } from 'vite-plugin-lib-inject-css';

export default defineConfig({
  plugins: [react(), libInjectCss()],
  build: {
    emptyOutDir: false,
    lib: {
      entry: {
        index: resolve(import.meta.dirname, 'src/index.ts'),
        'team-create': resolve(import.meta.dirname, 'src/team-create.ts'),
        'team-edit': resolve(import.meta.dirname, 'src/team-edit.ts'),
        'team-list': resolve(import.meta.dirname, 'src/team-list.ts'),
        'team-detail': resolve(import.meta.dirname, 'src/team-detail.ts'),
        'recent-battles': resolve(import.meta.dirname, 'src/recent-battles.ts')
      },
      formats: ['es'],
      cssFileName: 'agentduel-capturetheflag'
    },
    rollupOptions: {
      external: [
        '@agentduel/component',
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
