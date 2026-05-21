import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './', // Use relative paths
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, 'popup.html'),
        background: path.resolve(__dirname, 'src/background/background.js'),
        'content-main': path.resolve(__dirname, 'src/content/content-main.js'),
        content: path.resolve(__dirname, 'src/content/content.js'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'popup.css';
          }
          return 'assets/[name].[ext]';
        },
        // Inline dynamic imports and disable manualChunks to emit self-contained
        // entry bundles (useful for content scripts that are injected as a single file)
        inlineDynamicImports: true,
        manualChunks: undefined,
      },
    },
  },
});
