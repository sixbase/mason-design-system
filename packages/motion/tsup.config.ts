import { copyFileSync } from 'node:fs';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/react.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  // Clean each build: hashed chunk names change, and stale chunks piled up
  // in dist/ (7 copies). motion.css is copied after the JS is written.
  clean: true,
  onSuccess: async () => copyFileSync('src/motion.css', 'dist/motion.css'),
  sourcemap: true,
  // gsap stays external so the consumer's bundler turns every
  // `import('gsap/…')` into its own lazily-fetched chunk. Bundling it
  // here would put ~45KB of GSAP on the critical path of every page.
  external: ['react', 'react-dom', 'gsap', /^gsap\//],
});
