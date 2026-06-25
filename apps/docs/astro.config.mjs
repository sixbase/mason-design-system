import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://sixbase.github.io',
  base: '/mason-design-system',
  integrations: [react(), mdx()],
  output: 'static',
  server: { host: true },
  vite: {
    // Watch workspace package dist files for proper HMR in monorepo setup
    server: {
      watch: {
        // Ensure Vite watches dist directories in workspace packages
        ignored: ['!**/node_modules/@ds/**'],
      },
    },
    // Prevent Vite from pre-bundling workspace CSS — allows direct resolution
    optimizeDeps: {
      exclude: ['@ds/tokens', '@ds/components', '@ds/primitives'],
    },
  },
});
