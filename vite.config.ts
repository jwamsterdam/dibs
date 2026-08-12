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
    // Machine-readable entry→chunk graph, so the bundle-budget script can tell
    // initial-load chunks apart from lazy (dynamic-import-only) ones.
    manifest: true,
    // Vendor split keeps the framework separate from app/feature code
    // (route-based feature chunks come from lazy route imports). Embedded
    // Linux budget: initial JS < 320 KB gzipped (see docs/performance/budgets.md).
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }
          if (id.includes('recharts') || id.includes('d3-')) {
            return 'charts';
          }
          // Keep TanStack in its own chunk; React + its deps stay together
          // in `vendor` to avoid cross-chunk cycles.
          if (id.includes('@tanstack')) {
            return 'tanstack';
          }
          // Everything else only reachable through SettingsPanel's dynamic import (see
          // PortfolioPage.tsx) — react-aria-components and its own `react-aria`/`react-stately`
          // dependency packages, react-hook-form, and @internationalized/date — is left
          // unbucketed so Rollup's default chunking follows the real import graph and lands
          // it in its own lazy chunk instead of the initial `vendor` bundle.
          if (
            id.includes('react-aria-components') ||
            id.includes('/react-aria/') ||
            id.includes('/react-stately/') ||
            id.includes('react-hook-form') ||
            id.includes('@hookform') ||
            id.includes('@internationalized')
          ) {
            return undefined;
          }
          return 'vendor';
        },
      },
    },
  },
});
