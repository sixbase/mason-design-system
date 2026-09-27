import { defineConfig } from 'tsup';

export default defineConfig({
  // One entry per component folder, plus the barrel. With ESM code
  // splitting, dist/index.mjs becomes a thin re-export of per-component
  // modules instead of one 200KB module. A consumer's bundler can then put
  // each component in the chunk of the page that uses it — a Button-only
  // page no longer downloads the Carousel, the Table, and 50 others.
  entry: ['src/index.ts', 'src/*/index.ts'],
  format: ['esm', 'cjs'],
  splitting: true,
  dts: { entry: 'src/index.ts' },
  // Clean every build: chunk names are content hashes, so without this each
  // rebuild left the previous chunks behind (dist had grown to ~800 files,
  // 10MB, most of them unreferenced — and `files: ["dist"]` would publish
  // them all). Nothing reads this dist during dev: the workbench and
  // Storybook both compile component source.
  clean: true,
  sourcemap: true,
  external: ['react', 'react-dom'],
  // CSS is extracted, never imported from the JS: dist/index.css holds every
  // component (`@ds/components/styles`), and each entry also gets its own
  // dist/<component>/index.css with the CSS of everything it renders
  // (`@ds/components/styles/<component>.css`). Keeping CSS imports out of
  // the JS is what lets plain Node / SSR import the package without a
  // bundler — `import './X.css'` throws in Node.
  injectStyle: false,
});
