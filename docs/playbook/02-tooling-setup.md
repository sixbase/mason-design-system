# 02 — Tooling Setup

> Every tool, why it was chosen over alternatives, and the configuration that makes it work.

---

## Rules for This File

- **When adding a new tool:** Document what it does, why it was chosen over alternatives, the exact configuration, and any gotchas. Add a decisions log entry in `06-decisions-log.md`.
- **When removing a tool:** Remove its section here and add a decisions log entry explaining why.
- **When hitting a config bug:** Add it to the tool's "Gotchas" subsection AND to `07-lessons-learned.md`.

---

## Known Gotchas — Read First

These are the configuration mistakes that have cost the most time. Check this before debugging any tooling issue.

| Tool | Gotcha | What Happens | Fix |
|------|--------|-------------|-----|
| tsup | Assumes `.cjs` output for CJS | "Module not found" — file doesn't exist | CJS is `.js`, ESM is `.mjs` |
| package.json | `import` before `types` in exports | TypeScript can't find declarations | Always put `types` first |
| Chromatic (if re-enabled) | `fetch-depth: 1` in GitHub Actions | Every run treated as first build | Must use `fetch-depth: 0` |
| Tokens | `dev` runs `build-css.mjs` once, then only `tsup --watch` | Later `tokens.json` edits don't reach `tokens.css` | Re-run `pnpm --filter @ds/tokens build` |
| tsup | `splitting` without `clean: true` | Old hashed chunks pile up in `dist` and get published | Keep `clean: true` |
| ESLint | `eslint-plugin-react-hooks` v4 on ESLint 9 | Crashes | v5 (workbench has no ESLint config yet — open item) |

---

## Package Management: pnpm Workspaces

**Why pnpm over npm/Yarn:**
- **Strict isolation** — packages can only import what they explicitly declare as dependencies. npm/Yarn hoist everything to `node_modules` root, creating "phantom dependencies" that work locally but break in CI or consumer projects.
- **Disk efficiency** — packages are stored once in a content-addressable store and hard-linked.
- **Workspace protocol** — `"@ds/tokens": "workspace:*"` means "use the local version." pnpm handles symlinking automatically.
- **Speed** — significantly faster installs than npm, comparable to Yarn Berry.

**Rejected alternatives:** npm workspaces (no strict isolation), Yarn Berry (PnP mode adds complexity without enough benefit at this scale).

**Configuration:**
```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
  - "tooling/*"
```

**Commands:**
```bash
pnpm install                    # Install all workspace deps
pnpm install --frozen-lockfile  # CI — fail if lockfile is stale
```

---

## Build Orchestration: Turborepo

**Why Turborepo over Nx / Lerna / custom scripts:**
- **`^build` syntax** — one line declares that `@ds/components` build depends on `@ds/tokens` build. Turborepo figures out order and parallelizes the rest.
- **Content-based caching** — unchanged packages restore from cache. CI gets dramatically faster after first run.
- **Zero configuration** — just declare tasks in `turbo.json`.

**Rejected alternatives:** Nx (over-engineered for this scale), Lerna (legacy, unmaintained for build orchestration).

**Configuration:**
```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint":      { "dependsOn": ["^build"] },
    "typecheck": { "dependsOn": ["^build"] },
    "test":      { "dependsOn": ["^build"], "outputs": [] }
  }
}
```

`outputs` must match where each tool really writes. Tests write nothing, so `[]`. A mismatch prints "no output files found" and silently disables caching for that task.

**Critical concept:** `"dependsOn": ["^build"]` means "run `build` in all my dependencies first." Without this, `@ds/components` tries to import from `@ds/tokens` before tokens has been built → "module not found."

---

## Package Bundler: tsup

**Why tsup over Rollup / esbuild directly / tsc:**
- **Dual ESM + CJS output** — one config, both formats, correct extensions
- **CSS bundling** — concatenates all CSS imports into a single `dist/index.css`
- **Source maps + declarations** — enabled by default
- **esbuild under the hood** — fast

**Rejected alternatives:** Rollup (more config), esbuild directly (no declaration generation), tsc (slow, no CSS bundling), Vite library mode (adds Vite plugin dependency).

### Per-component entries (2026-09-25)

`@ds/components` builds with `entry: ['src/index.ts', 'src/*/index.ts']` and `splitting: true`. `dist/index.mjs` is now a ~6KB re-export of per-component chunks instead of one ~200KB module. Why it matters: Rollup/Vite chunk by *module*, so a single-module library lands whole in every page that imports anything from it. Measured on the docs site: average JS per interactive page **123KB → 57KB gz**; a Button-only page no longer ships the Carousel and Table. `dts` stays single-entry (`src/index.ts`) because the package exports only `.`. CSS ships two ways: `@ds/components/styles` (everything, ≈22KB gz) or `@ds/components/styles/<component>.css`, each self-contained (a Button-only page: 1.1KB gz; a 7-component product page: 6.1KB gz). The dist JS never imports CSS, which keeps plain-Node server rendering safe. tsup needs `clean: true` with `splitting`, or old hashed chunks pile up in `dist` and get published (10MB → 5.6MB when fixed). `types` is nested per condition (`.d.mts` for import, `.d.ts` for require) so node16 ESM consumers get ESM types.

**Guards that run in `lint` / `typecheck`:**
- `packages/components/scripts/check-css.mjs` (in `@ds/components` lint, ~0.2s, no dependencies): undefined `var()`, component tokens nothing reads, raw values, `!important` outside the reduced-motion reset, non-token breakpoints, and `:hover` outside `@media (hover: hover)`. Its header lists every allowed exception and why.
- `apps/workbench/tsconfig.stories.json` (in the workbench `typecheck`): type-checks every `*.stories.tsx`. Stories import `@storybook/react`, which only the workbench installs, so the workbench — the stories' consumer — checks them.

### `@ds/motion` and GSAP (2026-09-25)

`gsap` is a dependency of `@ds/motion` only, and marked `external` in its tsup config so the *consumer's* bundler turns each `import('gsap/…')` into its own lazy chunk. Never bundle GSAP into a package dist — it would land on the critical path of every page. GSAP is free including all plugins since 3.13; its license excludes only competing visual site builders.

### ⚠️ Critical: tsup output extensions

**This is one of the most common setup mistakes.** tsup does NOT output `.cjs` for CommonJS.

| Format | Actual Extension | package.json exports |
|--------|-----------------|---------------------|
| ESM | `.mjs` | `"import": "./dist/index.mjs"` |
| CJS | `.js` | `"require": "./dist/index.js"` |

### ⚠️ Critical: package.json exports ordering

`types` MUST be the first condition. TypeScript resolves conditions in order.

```json
// ✅ Correct — types first
"exports": {
  ".": {
    "types":   "./dist/index.d.ts",
    "import":  "./dist/index.mjs",
    "require": "./dist/index.js"
  }
}

// ❌ Broken — TypeScript finds .mjs, can't read it as declarations
"exports": {
  ".": {
    "import":  "./dist/index.mjs",
    "require": "./dist/index.js",
    "types":   "./dist/index.d.ts"
  }
}
```

**Current form (2026-09-26): `types` nested per condition.** Every package now points `import` at `.d.mts` and `require` at `.d.ts`, so node16/ESM consumers get ESM types:

```json
"exports": {
  ".": {
    "import":  { "types": "./dist/index.d.mts", "default": "./dist/index.mjs" },
    "require": { "types": "./dist/index.d.ts",  "default": "./dist/index.js" }
  },
  "./package.json": "./package.json"
}
```

`types` is still first inside each condition. Extra subpaths: `@ds/tokens/css`, `@ds/tokens/json`; `@ds/components/styles` and `@ds/components/styles/*.css`; `@ds/motion/react`, `@ds/motion/css`. CSS subpaths are listed in `sideEffects` so bundlers don't drop them.

**This applies to every package.** Check all four (`@ds/tokens`, `@ds/primitives`, `@ds/components`, `@ds/motion`).

---

## TypeScript: Strict Shared Config

All packages extend from shared configs in `tooling/typescript/`:

```json
// tooling/typescript/base.json — non-React packages
{
  "compilerOptions": {
    "target": "ES2020",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "isolatedModules": true,
    "moduleResolution": "bundler"
  }
}

// tooling/typescript/react.json — React packages
{
  "extends": "./base.json",
  "compilerOptions": {
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx"
  }
}
```

**Key setting: `noUncheckedIndexedAccess: true`** — `array[0]` returns `T | undefined` instead of `T`. Catches a huge class of runtime errors at compile time. Do not disable this.

**Key setting: `isolatedModules: true`** — required for tsup/esbuild. Without it, certain TypeScript features (const enums, namespace merging) that esbuild can't handle would compile locally but break in the bundle.

**Key setting: `jsx: "react-jsx"`** — no need for `import React from 'react'` in every file.

---

## ESLint: Flat Config

Using ESLint 9 flat config format (not legacy `.eslintrc`):

```js
// tooling/eslint/index.js
export const react = [
  ...base,  // @typescript-eslint recommended-type-checked + consistent-type-imports
  {
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': a11yPlugin,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...a11yPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
    }
  }
]
```

**`eslint-plugin-jsx-a11y` is the first line of defense.** It catches missing `alt` attributes, incorrect ARIA roles, and label association errors at lint time — before runtime a11y testing. Do not remove or disable it.

Packages lint `src` only (tests and stories are ignored by ESLint; stories are type-checked instead — see "Guards" above). `apps/workbench` has no lint script yet.

---

## Primitive Components: Radix UI

**Why Radix over writing primitives from scratch:**
- Keyboard navigation implemented correctly and tested
- WAI-ARIA patterns correct by default (focus management, live regions, escape key)
- Completely unstyled — our token system drives all visual design
- Used by shadcn/ui — battle-tested at scale

**Rejected alternatives:** Headless UI (smaller component set), Reach UI (less maintained), Ariakit (smaller ecosystem), writing from scratch (keyboard navigation and ARIA are notoriously hard to get right).

**Key Radix packages used:**

| Package | Used In |
|---------|---------|
| `@radix-ui/react-slot` | `asChild` (Button) — via `@ds/primitives` |
| `@radix-ui/react-label`, `react-visually-hidden` | `@ds/primitives` |
| `@radix-ui/react-dialog` | Modal, Drawer (and CartDrawer, Header's mobile menu through Drawer) |
| `@radix-ui/react-select` | Select |
| `@radix-ui/react-checkbox`, `react-radio-group`, `react-switch`, `react-slider` | Checkbox, RadioGroup, Switch, Slider |
| `@radix-ui/react-accordion`, `react-tabs` | Accordion, Tabs |
| `@radix-ui/react-popover`, `react-tooltip`, `react-dropdown-menu` | Popover, Tooltip, DropdownMenu |

**Bump all `@radix-ui/*` packages together** (`pnpm update -r "@radix-ui/*"`). Two versions of an internal such as `react-dismissable-layer` make two separate overlay stacks: a menu inside a dialog can't be clicked and one Escape closes both. Check the lockfile, not `node_modules/.pnpm`.

**Wrap Radix parts, never rename them.** Export a thin `forwardRef` wrapper with its own `displayName`; setting `displayName` on the Radix object renames it for every other user on the page.

### ⚠️ Radix Portal gotcha

Select dropdown, Modal content, and any Radix `<Portal>` elements render at `document.body` level — **outside the component's DOM tree**. This means they don't inherit `font-family` from the component root.

**Fix:** Explicitly declare `font-family: var(--font-family-body)` on portalled content elements. See `04-components.md` CSS `font-family` inheritance section.

### The Slot / asChild pattern

```tsx
import { Slot } from '@radix-ui/react-slot'

const Comp = asChild ? Slot : 'button'
return <Comp className={classes} {...props}>{children}</Comp>
```

When `asChild` is true, `Slot` merges the component's props (className, ref, aria attributes) onto whatever child element is provided:

```tsx
// The <a> gets all Button styles and aria attributes
<Button asChild>
  <a href="/checkout">Proceed to checkout</a>
</Button>
```

**This is the correct way to build polymorphic components.** Do not use `as={Link}` prop patterns — they break type safety.

---

## Storybook — removed (2026-09-27)

`apps/storybook` was deleted with its config (`.storybook/main.ts`, `preview.ts`, `preview-head.html`) and dependencies (`@storybook/react-vite`, `addon-essentials`, `addon-interactions`, `addon-a11y`, `addon-docs`, `@storybook/test`, `@chromatic-com/storybook`). The workbench is the only app. Stories are still Component Story Format: `apps/workbench` keeps `@storybook/react` (for `composeStories` and the `Meta`/`StoryObj` types) and its peer `storybook` as library dependencies — no Storybook server or UI. To restore the app, start from git history (`git log -- apps/storybook`). See `06-decisions-log.md` → "Storybook Removed — Workbench Is the Only App".

---

## Workbench (Vite + React) — replaced the Astro docs site 2026-09-25

**Role:** Private visual test bench. Every component story at real device widths, light/dark, with stress modes and review notes.

**How it works:**
- Two documents (Vite multi-page): `index.html` is the shell (sidebar, toolbar, review bar); `frame.html` renders one component's stories inside each device iframe. Frames are real iframes at 375 / 768 / 1280px, so media and container queries fire as on the device; they are CSS-scaled when the screen is too narrow.
- Stories are loaded with `import.meta.glob('…/*.stories.tsx')` and rendered with Storybook's `composeStories` (`@storybook/react`) — no Storybook server involved. Story order comes from the source text (`?raw`), because module namespaces sort exports alphabetically.
- `@ds/components` and `@ds/motion` are aliased to **source** in `vite.config.ts`, so component edits hot-reload instantly (the old docs site read the built `dist/`).
- Shell ↔ frame talk over `postMessage` (`src/lib/messages.ts`): linked scrolling, error reports, axe results, keyboard shortcuts typed inside a frame, store-page link navigation.
- `base` is `/mason-design-system/` for `vite build` and `vite preview` (GitHub Pages path), `/` for `vite dev`.

**Rejected alternatives:** keeping the Astro docs (a documentation site nobody reads was costing parity work on every component); Storybook alone (dense developer UI, no side-by-side devices/themes, no review tracking).

### ⚠️ Gotchas
- **Install frame-level listeners outside React.** StrictMode mounts effects twice; listeners registered in an effect without cleanup doubled every message (axe ran twice and threw "Axe is already running").
- **A wrapping flex column sizes each line to its widest child.** The phone toolbar (`flex-direction: column; flex-wrap: wrap`) made the page 599px wide on a 390px screen until `flex-wrap: nowrap`.
- **Changing an iframe's `src` pushes browser history** — one entry per frame per change, so Back desynced the sidebar from the frames. After the first load, frames navigate with `contentWindow.location.replace()`.
- **An in-frame `#anchor` link rewrites the frame's route hash.** Skip links (`#main-content`) blanked the frame. The frame handles in-page anchors itself (scroll + focus) and ignores hashes that aren't routes.
- **`scrollIntoView` also moves the sequential-focus start point** in Chrome, so the next Tab skipped the skip link. Scroll the sidebar list by hand instead.
- **Stamp every frame→shell message with the frame's view.** Errors, axe results and scroll events from the previous component (or a removed iframe) otherwise land on the new one.

## Vitest

**Why Vitest over Jest:** Vite-native (same transform pipeline as dev server), same API as Jest, faster in watch mode.

**Config is inlined per package** (`packages/components/vitest.config.ts`, `packages/motion/vitest.config.ts`) — jsdom, globals, `src/**/*.test.{ts,tsx}`. A shared factory exists at `tooling/vitest/index.ts` but nothing imports it: under Node 20 it was loaded as raw TypeScript through the CommonJS path and broke CI, so the config was inlined (commit `325bcf2`). Delete it or make it loadable.

`packages/components/vitest.setup.ts` registers `jest-axe` (`toHaveNoViolations`, `region` rule off), replaces Node 22+'s broken global `localStorage` with an in-memory one, and stubs what Radix popper components call but jsdom lacks (`ResizeObserver`, `scrollIntoView`, pointer capture).

**Test command:**
```bash
pnpm --filter @ds/components test        # Run once
pnpm --filter @ds/components test:watch   # Watch mode during development
```

---

## Chromatic — not wired

**Status (2026-09-27):** there is no Chromatic workflow — `chromatic.yml` was removed as unconfigured (commit `325bcf2`) — and `@chromatic-com/storybook` was removed with the Storybook app. Visual review happens in the workbench. Chromatic screenshots Storybook, so enabling it would first require restoring Storybook (see "Storybook — removed" above), then: create a Chromatic project, add `CHROMATIC_PROJECT_TOKEN` as a repo secret, and restore the workflow from git history (`git show 325bcf2^:.github/workflows/chromatic.yml`).

**Role when enabled:** Visual regression testing. Screenshots every Storybook story on every PR, shows diffs.

### ⚠️ Critical: GitHub Actions checkout depth

```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 0  # ← MUST be 0 — Chromatic needs full git history
```

Without `fetch-depth: 0`, Chromatic can't find the baseline commit and treats every run as a first build. No diffs, no regression detection.

**How it works:**
1. PR opens → Chromatic builds Storybook and uploads screenshots
2. If any story looks different → PR gets "changes detected" status
3. Engineer reviews diff in Chromatic UI → accept or reject
4. `autoAcceptChanges: main` — merges to main auto-accept

---

## Changesets

**Role:** Versioning and changelog generation for published packages.

**Why Changesets over semantic-release / auto:**
- **Per-package versioning** — `@ds/tokens` at `1.2.0` while `@ds/components` at `0.8.3`
- **PR-based workflow** — changeset file added alongside code, not after
- **Human-readable changelogs** — the changeset description becomes the changelog entry

**Used by:** Radix UI, shadcn/ui, many other design systems.

**Status:** configured (`.changeset/config.json`), but there is no release workflow — `release.yml` was removed as unconfigured (commit `325bcf2`), and nothing is published to npm. To start publishing: add an `NPM_TOKEN` secret and restore the workflow from git history (`git show 325bcf2^:.github/workflows/release.yml`).

**Day-to-day workflow:**
```bash
pnpm changeset              # Interactive: which packages? major/minor/patch? describe it.
git add .changeset/*.md     # Commit the changeset file alongside your code
git commit -m "feat: add Badge component"
```

**What would happen on merge to main (once a release workflow exists):**
1. GitHub Actions sees `.changeset/*.md`
2. Creates a "Version Packages" PR that bumps versions
3. When that PR merges → publishes to npm with `pnpm release`

**Configuration:**
```json
// .changeset/config.json
{
  "access": "public",
  "baseBranch": "main",
  "ignore": ["@ds/workbench"],
  "updateInternalDependencies": "patch"
}
```

**`access: "public"` is required** for scoped packages (`@ds/*`) to be publicly installable on npm.

**`ignore` excludes the app** — `@ds/workbench` is never published.

---

## Prettier

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

Single quotes and trailing commas match the style of most large React codebases (React itself, Next.js). These are the opinionated choices — do not change without a decisions log entry.

---

## File Locations Quick Reference

| What | Where |
|------|-------|
| pnpm workspace config | `pnpm-workspace.yaml` |
| Turborepo config | `turbo.json` |
| TypeScript base config | `tooling/typescript/base.json` |
| TypeScript React config | `tooling/typescript/react.json` |
| ESLint config | `tooling/eslint/index.js` |
| Vitest config | `packages/{components,motion}/vitest.config.ts` (the `tooling/vitest` factory is unused) |
| Vitest setup (axe, jsdom shims) | `packages/components/vitest.setup.ts` |
| CSS lint guard | `packages/components/scripts/check-css.mjs` |
| Story typecheck | `apps/workbench/tsconfig.stories.json` |
| CI | `.github/workflows/ci.yml`, `.github/workflows/deploy-docs.yml` (workbench → Pages) |
| Prettier config | `.prettierrc` |
| Changesets config | `.changeset/config.json` |
| Workbench config | `apps/workbench/vite.config.ts` |
| Token source | `packages/tokens/src/tokens.json` |
| Token CSS build script | `packages/tokens/scripts/build-css.mjs` |
