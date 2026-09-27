import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const src = (p: string) => fileURLToPath(new URL(p, import.meta.url));

// The workbench renders component SOURCE, not the built packages, so an
// edit to a component's .tsx or .css shows up instantly in every frame.
export default defineConfig(({ command, isPreview }) => ({
  // GitHub Pages serves the repo under /mason-design-system/ (and so does
  // `vite preview`, so a local preview matches the deployed site)
  base: command === 'build' || isPreview ? '/mason-design-system/' : '/',
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^@ds\/components$/, replacement: src('../../packages/components/src/index.ts') },
      { find: /^@ds\/motion\/react$/, replacement: src('../../packages/motion/src/react.ts') },
      { find: /^@ds\/motion\/css$/, replacement: src('../../packages/motion/src/motion.css') },
      { find: /^@ds\/motion$/, replacement: src('../../packages/motion/src/index.ts') },
    ],
  },
  server: { port: 4321, host: true },
  build: {
    rollupOptions: {
      // Two documents: the review shell, and the frame each device preview loads.
      input: { index: src('./index.html'), frame: src('./frame.html') },
    },
  },
}));
