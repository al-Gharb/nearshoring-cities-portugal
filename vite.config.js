import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src',
  base: '/nearshoring-cities-portugal/',

  // The public directory is outside src/ — contains data/ that gets copied to dist/
  publicDir: resolve(__dirname, 'public'),

  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
      },
    },
    chunkSizeWarningLimit: 150,
  },

  server: {
    port: 3000,
    open: true,
    fs: {
      // Allow serving files from directories outside src/
      allow: [
        resolve(__dirname, 'src'),
        resolve(__dirname, 'data'),
        resolve(__dirname, 'public'),
        resolve(__dirname, 'node_modules'),
      ],
    },
  },

  resolve: {
    alias: {
      '@data': resolve(__dirname, 'data'),
      '@modules': resolve(__dirname, 'src/scripts/modules'),
      '@utils': resolve(__dirname, 'src/scripts/utils'),
    },
  },
});
