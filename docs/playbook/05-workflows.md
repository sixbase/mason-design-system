# 05 — Workflows

> Step-by-step processes for building components, adding tokens, running CI, and releasing packages.

---

## Rules for Workflows

1. **Follow the new component checklist exactly.** Steps are ordered for a reason. Skipping ahead (e.g., stories before tests) creates gaps that compound.
2. **Build order is tokens → primitives → components.** Always. Turborepo handles this with `pnpm build`, but if building manually, respect the order.
3. **Every component ships with all its files in the same session.** No "I'll add tests later."
4. **Workbench review before marking any component done.** Phone and Desktop, Light and Dark, Long text and RTL, keyboard, Check accessibility. Stories are the specimens — there is no separate docs page to keep in parity.
5. **CSS variables fail silently.** After renaming or removing any token, `grep -r "old-name" .` is mandatory. `check-css` catches undefined `var()` in component CSS only.
6. **`pnpm lint`, `pnpm typecheck` and `pnpm test` pass** before you call it done — the same three CI runs.

---

## Running the Dev Environment

Two servers run simultaneously:

```bash
pnpm dev    # Starts both in parallel from monorepo root
```

Or individually:

```bash
pnpm --filter @ds/workbench dev   # Workbench   → http://localhost:4321
pnpm --filter @ds/storybook dev   # Storybook   → http://localhost:6006
```

### Which server for which task

| Task | Server |
|------|--------|
| Building a new component (controls panel) | Storybook (`:6006`) or the workbench |
| Checking every state side by side | Workbench (`:4321`) |
| Quick a11y panel while building | Storybook (`:6006`) |
| Reviewing a component at phone/tablet/desktop, light/dark | Workbench (`:4321`) |
| Checking token colors, typography, spacing, motion | Workbench → Foundations (`:4321`) |
| Checking consistency across components | Workbench → Consistency line-ups (`:4321`) |
| Reviewing store pages (Home, Product, Cart…) | Workbench → Store pages (`:4321`) |
| Visual regression | Workbench review (Chromatic is not wired — see `02`) |

### Claude Code preview configuration

```json
// .claude/launch.json
{
  "version": "0.0.1",
  "configurations": [
    { "name": "workbench", "runtimeExecutable": "pnpm", "runtimeArgs": ["--filter", "@ds/workbench", "dev"], "port": 4321 },
    { "name": "storybook", "runtimeExecutable": "pnpm", "runtimeArgs": ["--filter", "@ds/storybook", "dev"], "port": 6006 }
  ]
}
```

---

## Build Order

```bash
# Turborepo handles order automatically:
pnpm build

# Manual order (if needed):
pnpm --filter @ds/tokens build       # 1. Tokens first
pnpm --filter @ds/primitives build   # 2. Primitives second
pnpm --filter @ds/components build   # 3. Components last
```

**Why order matters:** `@ds/components` imports from `@ds/tokens`. tsup looks in `packages/tokens/dist/`. If tokens hasn't been built, `dist/` doesn't exist → "module not found." (`@ds/motion` depends only on tokens.)

The workbench and Storybook compile component **source**, so you don't need to rebuild `@ds/components` to see a change — only `@ds/tokens` after editing `tokens.json`.

---

## New Component Checklist

Follow this sequence every time. Do not skip steps. Do not reorder.

### Step 1 — Create the folder

```bash
mkdir packages/components/src/{component-name}
```

### Step 2 — Write `{Component}.tsx`

Start with the interface, then the implementation:

```tsx
export interface ComponentProps extends HTMLAttributes<HTMLElement> {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
}

export const Component = forwardRef<HTMLElement, ComponentProps>(
  function Component({ variant = 'primary', size = 'md', className, ...props }, ref) {
    const classes = [
      'ds-component',
      `ds-component--${variant}`,
      `ds-component--${size}`,
      className,
    ].filter(Boolean).join(' ')

    return <div ref={ref} className={classes} {...props} />
  }
)
Component.displayName = 'Component'
```

**Checklist before moving to Step 3:**

- [ ] `forwardRef` with correct element type
- [ ] `displayName` set
- [ ] Extends native HTML element attributes
- [ ] Default values for `variant` and `size` in function signature
- [ ] `type="button"` if it's a button element
- [ ] Correct `aria-*` attributes for the component type
- [ ] `role="alert"` on error messages, linked with `aria-describedby` (only to rendered ids)
- [ ] Class assembly uses array + filter pattern (not template literals)
- [ ] Props type exported from `index.ts`; Radix parts wrapped (own `displayName`), never renamed
- [ ] Prices via `internal/format-money`, data-driven links via `internal/safe-url`, overlays via `internal/dialog-opener`, announcements via `internal/use-change-announcement`
- [ ] Misuse that renders but fails silently gets a `devWarning`

### Step 3 — Write `{Component}.css`

Structure: component tokens → base styles → variants → states → reduced motion / forced colors.

```css
/* 1. Component tokens — the "knobs" consumers can turn */
.ds-component {
  --component-radius: var(--radius-md);
  --component-font-weight: var(--font-weight-medium);
}

/* 2. Base styles — reference component tokens */
.ds-component {
  border-radius: var(--component-radius);
  font-weight: var(--component-font-weight);
  font-family: var(--font-family-body);
  transition: var(--transition-fast);
}

/* 3. Variants */
.ds-component--primary { ... }
.ds-component--secondary { ... }

/* 4. Size variants */
.ds-component--sm { height: var(--size-control-sm); }
.ds-component--md { height: var(--size-control-md); }
.ds-component--lg { height: var(--size-control-lg); }

/* 5. Interactive states */
@media (hover: hover) {                       /* hover only where a pointer hovers */
  .ds-component:hover:not(:disabled):not([aria-disabled='true']) { ... }
}
.ds-component:focus-visible {
  box-shadow: var(--focus-ring);
  outline: var(--border-width-lg) solid transparent;   /* shows in forced colors */
}
.ds-component:disabled,
.ds-component[aria-disabled='true'] {
  opacity: var(--opacity-medium);   /* ← 0.382, NOT 0.5; control only, never the hint */
  cursor: not-allowed;
}

/* 6. Only if needed: the global reset in tokens.css already stops transitions
   and animations for reduced motion. Add a block when a looping animation
   would park on a bad final frame, or to swap in a static state. */
@media (prefers-reduced-motion: reduce) { ... }

/* 7. Forced colors: states shown only by a background need a border/outline */
@media (forced-colors: active) { ... }
```

**Checklist before moving to Step 4:**

- [ ] Component tokens declared on root class
- [ ] All values from design tokens — no raw hex, px, or numbers
- [ ] Disabled uses `var(--opacity-medium)` on the control (+ inline label) only
- [ ] Focus uses `var(--focus-ring)` + transparent outline (inset variants where clipped)
- [ ] Every `:hover` inside `@media (hover: hover)`
- [ ] Hit area ≥24px, 44px on touch (pseudo-element, outward)
- [ ] Timing from tokens (`--transition-*`, `--motion-*`)
- [ ] Reduced motion and forced colors checked (see `13`, `14`)
- [ ] Fixed-height control: copy Button's optical-centering block as-is (open decision — see `04`)
- [ ] If component uses Radix Portal, explicit `font-family` on portalled elements
- [ ] `pnpm --filter @ds/components lint` passes (runs `check-css`)

### Step 4 — Write `{Component}.test.tsx`

Minimum 6 test cases. See `04-components.md` for the full template.

- [ ] Renders without crashing
- [ ] Correct HTML element rendered
- [ ] `asChild` renders child element (if applicable)
- [ ] Disabled state behavior
- [ ] User interaction (click/keyboard)
- [ ] `axe` no accessibility violations

```bash
pnpm --filter @ds/components test:watch   # Watch mode while writing tests
```

### Step 5 — Write `{Component}.stories.tsx`

One story per meaningful state. Always use `autodocs` tag.

```tsx
const meta: Meta<typeof Component> = {
  title: 'Components/ComponentName',
  component: Component,
  tags: ['autodocs'],
}
export default meta

export const Default: Story = { args: { variant: 'primary', children: 'Label' } }
export const Secondary: Story = { args: { variant: 'secondary', children: 'Label' } }
export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
      <Component size="sm">Small</Component>
      <Component size="md">Medium</Component>
      <Component size="lg">Large</Component>
    </div>
  ),
}
```

**Verify in Storybook:**

- [ ] All stories render
- [ ] Controls panel works
- [ ] A11y panel shows no violations
- [ ] Dark mode looks correct (toggle background in toolbar)

**Note:** Inline styles in stories are layout only and use token references (`gap: 'var(--spacing-3)'`, `maxWidth: 'var(--size-content-sm)'`), never raw pixels. Add `parameters.docs.description.component` — a one-line description the workbench shows under the title. Then run `pnpm --filter @ds/workbench typecheck` (it compiles every story).

### Step 6 — Create `index.ts`

```ts
export { Component } from './Component'
export type { ComponentProps } from './Component'
```

Import the CSS from the `.tsx` (`import './Component.css'`) — tsup extracts it into `dist/index.css` and `dist/{component}/index.css`; the built JS never imports CSS.

### Step 7 — Export from package index

Add to `packages/components/src/index.ts`:

```ts
export * from './component-name'
```

### Step 8 — Place it in the workbench

Nothing to write: the workbench renders the component's stories. Add its folder name to the right group in `apps/workbench/src/lib/catalog.ts` (otherwise it appears under "Other"). If a story opens an overlay on mount, add the id to `SOLO`.

### Step 9 — Build and verify

```bash
pnpm --filter @ds/components build
# dist/ gets index.mjs/.js/.css/.d.ts/.d.mts plus {component}/index.mjs/.js/.css
```

Only needed before publishing or testing the package from outside. The workbench renders component source, so the component appears there from its stories with no build.

### Step 10 — Workbench review (mandatory)

Open the component in the workbench (`:4321`). Check every state at Phone and Desktop, in Light and Dark, then with *Long text* and *RTL*. Run *Check accessibility*. Fix anything off before moving on, then mark it *Looks good*.

### Step 11 — Update the playbook

- [ ] Add the component to the list in `01-planning.md`
- [ ] Add a decisions log entry in `06-decisions-log.md` if any non-obvious design decisions were made
- [ ] If it introduces a new pattern or rule, add it to `04` (or `13`/`14`)

### Done means (mirrors the Section Launch Checklist in `CLAUDE.md`)

- [ ] Tokens only — `pnpm lint` clean (check-css: no raw values, no undefined `var()`, no stray `!important`, hover gated)
- [ ] No page-level component styling; variants live in the component
- [ ] Semantic HTML, correct heading level via `<Heading as>`; `<Heading>`/`<Text>` only
- [ ] Reading width via `--measure-reading`
- [ ] Contrast roles respected (`03` text/boundary tables); forced colors checked
- [ ] Keyboard, focus visible (not under a sticky header), hit areas, disabled rules (`14`)
- [ ] Announcements via `useChangeAnnouncement`; overlays return focus via `dialog-opener`
- [ ] Reduced motion and `data-motion="off"` honoured (`13`)
- [ ] Tests with axe pass; regression test for every bug fixed
- [ ] Stories: one per meaningful state, `autodocs` tag, type-check clean
- [ ] Workbench review done (Phone/Desktop, Light/Dark, Long text, RTL, Check accessibility) and marked *Looks good*
- [ ] Playbook updated

---

## Adding a New Token

1. Add the value to `packages/tokens/src/tokens.json` in the correct tier (primitive, semantic, or both — semantic colors need a light **and** a dark value — the build does not check this, and a missing dark value silently shows the light one)
2. If it's a composite token (like `--color-overlay`), add it to `compositeBlock()` in `packages/tokens/scripts/build-css.mjs` so it's emitted in every mode block
3. Rebuild tokens: `pnpm --filter @ds/tokens build`
4. The new CSS variable is now available everywhere that imports `@ds/tokens/css`
5. Update `03-tokens.md` reference tables and, if it's a new category, the workbench Foundations sheet

## Renaming a Token

⚠️ **CSS variables fail silently. This is the single most dangerous operation in the token system.**

1. `grep -r "var(--old-name)" .` — find every usage
2. Update the name in `tokens.json` (and `build-css.mjs` if applicable)
3. Update every reference found in step 1
4. `pnpm --filter @ds/tokens build`
5. `grep -r "var(--old-name)" .` — verify zero results (and in the storefront repo, which copies `tokens.css`)
6. `pnpm lint && pnpm build && pnpm test` — `check-css` flags any component CSS still reading the old name
7. Update `03-tokens.md` reference tables
8. Add decisions log entry in `06-decisions-log.md`

---

## CI/CD Pipeline

### On every PR and push to `main`

| Step | Command | What It Checks |
|------|---------|---------------|
| 1 | `pnpm install --frozen-lockfile` | Lockfile is current |
| 2 | `pnpm turbo build --filter='./packages/*'` | All packages build |
| 3 | `pnpm turbo lint` | ESLint (including jsx-a11y) |
| 4 | `pnpm turbo typecheck` | TypeScript `--noEmit` |
| 5 | `pnpm turbo test` | Vitest (unit + axe a11y) |
| 6 | Upload coverage artifact | — |

Step 3 includes `check-css`; step 4 includes the workbench's story typecheck. Step 6 uploads nothing today (no coverage is generated) — removing it is an open tooling item in `12`.

### Branch protection on `main`

Recorded in the decisions log: direct pushes blocked; PRs must pass CI and get 1 approving review; stale reviews dismissed. These are GitHub settings — not visible in the repo and not re-checked since.

### On push to `main`

`deploy-docs.yml` builds the packages and the workbench and deploys it to GitHub Pages.

There is **no release workflow** (it was removed as unconfigured — see `02` → Changesets), so nothing is versioned or published automatically.

---

## Release Process (Changesets)

### When making a change

```bash
pnpm changeset              # Interactive: which packages? major/minor/patch? describe.
git add .changeset/*.md     # Commit changeset alongside code
git commit -m "feat: add Badge component"
```

### What would happen on merge (once a release workflow exists)

1. GitHub Actions sees `.changeset/*.md`
2. Creates a "Version Packages" PR that bumps version numbers
3. Merging that PR publishes to npm

### Important

- `"access": "public"` is required for `@ds/*` scoped packages on npm
- Apps (`@ds/workbench`, `@ds/storybook`) are in the `ignore` list — never published

---

## Adding a Workbench Sheet (foundation, line-up, or store page)

1. Write the sheet as a React component in `apps/workbench/src/specimens/` (store pages in `specimens/pages/`, wrapped by `PageChrome`).
2. Register it in `apps/workbench/src/specimens/index.ts` under `foundation/<id>` or `page/<id>`.
3. Add an entry to `FOUNDATIONS` or `PAGES` in `apps/workbench/src/lib/catalog.ts` (and a one-line description in `STATIC_DESCRIPTIONS` in `shell/App.tsx`).

---

## Storybook Glob Path Reference

The stories path in `apps/storybook/.storybook/main.ts` is relative to `.storybook/`, NOT `apps/storybook/`:

```
apps/storybook/.storybook/   ← you are here
  ../                         → apps/storybook/
  ../../                      → apps/
  ../../../                   → monorepo root
  ../../../packages/components/src/  → component source
```

```ts
// ✅ Correct — three levels up from .storybook/
stories: ['../../../packages/components/src/**/*.stories.{ts,tsx}']

// ❌ Wrong — only two levels, finds nothing, no error
stories: ['../../packages/components/src/**/*.stories.{ts,tsx}']
```

**Use `{ts,tsx}` not `@(ts|tsx)`.** Extglob syntax is not supported.

---

## When Things Go Wrong

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| "Module not found" for `@ds/tokens` | Tokens not built, or built after components | `pnpm --filter @ds/tokens build` first |
| Empty Storybook, no stories | Glob path wrong (relative to `.storybook/`) | Fix path — needs `../../../` |
| Storybook shows no stories, using `@(ts\|tsx)` | Extglob not supported | Change to `{ts,tsx}` |
| TypeScript can't find declarations | `types` not first in package.json exports | Move `types` above `import` |
| Token change didn't take effect | `pnpm dev` only built `tokens.css` once | Run `pnpm --filter @ds/tokens build` |
| Renamed token, component now invisible/broken | CSS variable resolves to `initial` silently | `pnpm lint` (component CSS) + `grep -r "var(--old-name)" .` everywhere else |
| `check-css` fails on a value you need | Raw value, or a knob nothing reads | Use or add a token; genuine one-offs go in its `FILE_ALLOW` with a reason |
| Workbench typecheck fails in a story | Stories are type-checked through `apps/workbench/tsconfig.stories.json` | Fix the story's props — a wrong prop there is a wrong prop for consumers too |
| Menu/popover inside a Modal can't be clicked, Escape closes both | Two versions of a Radix internal | `pnpm update -r "@radix-ui/*"`, check the lockfile |
| Hover colour stuck after tapping on a phone | `:hover` not gated | Wrap in `@media (hover: hover)` |
| Focus lands on `<body>` after closing an overlay (Safari) | Opener read from `document.activeElement` | Use `internal/dialog-opener.ts` |
| Chromatic treats every run as first build (if re-enabled) | `fetch-depth: 1` in GitHub Actions checkout | Set `fetch-depth: 0` |
| Dark mode colors wrong | Using hardcoded hex or primitive directly | Use semantic token; add one if it doesn't exist |
| Font wrong in Select dropdown / Modal | Radix Portal renders outside DOM tree | Add explicit `font-family: var(--font-family-body)` |
