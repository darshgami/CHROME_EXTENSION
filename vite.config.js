import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  root: path.resolve(__dirname, 'popup-src'),
  build: {
    outDir: path.resolve(__dirname, 'extension'),
    emptyOutDir: false, // Prevent deleting other extension files
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, 'popup-src/popup.html'),
      },
      output: {
        entryFileNames: 'popup.js',
        chunkFileNames: '[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'popup.css';
          }
          return '[name].[ext]';
        },
      },
    },
  },
});
