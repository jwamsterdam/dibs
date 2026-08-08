import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, type PluginOption } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    visualizer({ filename: 'stats.html', gzipSize: true, brotliSize: true }) as PluginOption,
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // Vendor split keeps the framework separate from app/feature code
    // (route-based feature chunks come from lazy route imports). Embedded
    // Linux budget: initial JS < 300 KB gzipped.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }
          // Keep TanStack in its own chunk; React + its deps stay together
          // in `vendor` to avoid cross-chunk cycles.
          if (id.includes('@tanstack')) {
            return 'tanstack';
          }
          return 'vendor';
        },
      },
    },
  },
});
