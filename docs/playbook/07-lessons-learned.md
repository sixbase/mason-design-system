# 07 — Lessons Learned

> What worked, what didn't, bugs we hit, and rules derived from each. This is the project's institutional memory.

---

## Rules for This File

1. **Add entries in real time** when gotchas are discovered or better approaches found. Don't batch.
2. **Every entry must end with a `Rule:` statement** — a concrete, enforceable instruction that prevents the problem from recurring. If there's no rule, the lesson isn't actionable.
3. **Link to the relevant decisions log entry** in `06-decisions-log.md` when a lesson triggered a decision.
4. **Cross-reference from other docs.** When a rule from this file is referenced in `03-tokens.md`, `04-components.md`, or `05-workflows.md`, note it here so we know the rule is being enforced elsewhere.

---

## Extracted Rules — Quick Reference

Every lesson produced a rule. This table collects them all so Claude can scan for the relevant rule without reading 700 lines.

### Build & Tooling Rules

| Rule | Source Lesson |
|------|--------------|
| `types` must be first key in package.json exports | [types-export-order](#types-export-order) |
| tsup outputs `.js` for CJS, `.mjs` for ESM — not `.cjs` | [tsup-extensions](#tsup-extensions) |
| Storybook glob is relative to `.storybook/`, uses `{ts,tsx}` not `@(ts\|tsx)` | [storybook-glob](#storybook-glob) |
| Astro imports relative to `.astro` file location, not project root | Harder than expected |
| Token CSS needs full rebuild, `tsup --watch` only covers TS | Harder than expected |
| Component CSS changes require library rebuild (`pnpm turbo build --filter=@ds/components --force`) | [css-hot-reload](#css-hot-reload) |
| Chromatic needs `fetch-depth: 0` in GitHub Actions | [chromatic-fetch-depth](#chromatic-fetch-depth) |
| Clear Storybook cache after adding any Radix package | [storybook-cache](#storybook-cache) |
| Always `cd apps/theme` before `shopify theme dev`; never from monorepo root | [shopify-theme-dev-cwd](#shopify-theme-dev-cwd) |
| `settings_schema.json` `theme_info`: `theme_documentation_url` required; exactly one of `theme_support_email` or `theme_support_url` | [shopify-settings-schema-validation](#shopify-settings-schema-validation) |
| Transient Shopify CLI SSL errors — retry before debugging | [shopify-cli-ssl](#shopify-cli-ssl) |

### Token & CSS Rules

| Rule | Source Lesson |
|------|--------------|
| Never use CSS variable fallbacks with hardcoded values | [color-rename-bug](#color-rename-bug) |
| After renaming tokens, `grep -r "old-name" .` — CSS vars fail silently | [color-rename-bug](#color-rename-bug) |
| Never use `color-mix(… %, transparent)` for WCAG-required contrast | [color-mix-contrast](#color-mix-contrast) |
| Disabled state: `var(--opacity-medium)`, never `0.5` | Refactor audit |
| Transitions: use `var(--transition-fast)` shorthands, never raw duration | Token convention |
| `@media` queries cannot use CSS custom properties | [css-media-vars](#css-media-vars) |
| Form elements don't inherit `font-family` — need global reset | [form-font-inheritance](#form-font-inheritance) |

### Component Pattern Rules

| Rule | Source Lesson |
|------|--------------|
| Radix Portal content needs explicit `font-family` | [radix-portal](#radix-portal) |
| Radix Slot with `asChild` must receive exactly one child | [radix-slot-aschild](#radix-slot-aschild) |
| Radix Select: use `aria-labelledby`, not `htmlFor` | [radix-select-aria](#radix-select-aria) |
| `display: none` on child class = missing component API | [display-none-override](#display-none-override) |
| Block components never override primitive internals | No overrides rule |
| Redundant declarations are overrides in disguise — delete them | [redundant-declarations](#redundant-declarations) |
| Fixed-width components in fluid grids need a `fluid` variant | [fixed-width-card-grid](#fixed-width-card-grid) |
| Grid gaps: two tiers max (mobile + desktop), same token for row/column | [gap-escalation](#gap-escalation) |
| `text-overflow: ellipsis` not working? Trace `min-width: 0` up the chain | [flex-overflow](#flex-overflow) |
| Prefer CSS responsive behavior over JS — render full content, CSS controls visibility | [css-vs-js-responsive](#css-vs-js-responsive) |
| Icon buttons in `justify-content: space-between` flex rows need `flex-shrink: 0` — otherwise they collapse to content width | [icon-button-flex-shrink](#icon-button-flex-shrink) |
| Inline SVGs in Liquid/Astro need `.ds-icon ds-icon--{size}` classes OR explicit `width`/`height` attrs — no default dimensions = invisible or 300×150 | [inline-svg-sizing](#inline-svg-sizing) |
| Icon audits must verify render, not just path correctness — agents that only check `d=""` miss sizing/layout bugs | [icon-audit-render-check](#icon-audit-render-check) |
| `<figure>` has default `margin: 1em 40px` — reset to 0 when used as a positioned wrapper, otherwise content shifts and parent bg shows through | [figure-default-margin](#figure-default-margin) |
| Pipe Shopify `image.presentation.focal_point` to `object-position` so cover-cropped images keep the merchant-set focal area visible | [shopify-focal-point](#shopify-focal-point) |
| Liquid theme ports must mirror DS markup AND text styling — same element (`<p>` not `<span>`), same Text size + muted state, no invented hover affordances | [theme-port-text-drift](#theme-port-text-drift) |
| `.ds-price-display--sm` renders price at `--font-size-base` (16px) — not `--font-size-sm`. Don't confuse it with `<Text size="sm">` (14px) | [price-display-size-naming](#price-display-size-naming) — superseded by [price-display-collapse](#price-display-collapse) |
| PriceDisplay sale state (when `comparePrice` is present) renders the current price in `--color-destructive` via `:has()` so it visually echoes the Sale badge | [price-display-collapse](#price-display-collapse) |
| When the React DS source changes a primitive (PriceDisplay, Card, etc.), `git log -- packages/components/src/{component}/` is the audit trail — diff the theme's CSS/Liquid against the latest commit and port | [theme-port-audit-trail](#theme-port-audit-trail) |
| Page-level patterns belong in a docs example demo (e.g. CollectionDemo.tsx) BEFORE they're ported to the theme. Components in isolation aren't enough — the page-level composition is the DS contract | [page-level-demo-pattern](#page-level-demo-pattern) |
| `<Heading level={N}>` is NOT a valid prop — the API is `<Heading as="hN">`. Pass `level={1}` and you silently get `<h2>` (the default). Grep all demos when seen | [heading-level-prop-bug](#heading-level-prop-bug) |
| `<CollectionFilters>` is self-contained — render it ONCE per page, not separately for desktop and mobile. CSS visibility inside the component handles the responsive split | [collection-filters-single-render](#collection-filters-single-render) |

### Docs & Demo Rules

| Rule | Source Lesson |
|------|--------------|
| Gallery/demo code uses `<Text>` and `<Heading>`, never raw tags | [raw-html-in-demos](#raw-html-in-demos) |
| Demo files deserve production discipline — 3+ repeats → shared class | [gallery-inline-styles](#gallery-inline-styles) |
| Parity measured at story level, not component level | [docs-audit-gap](#docs-audit-gap) |
| Docs must compose existing components, not reimplement inline | [docs-example-parity](#docs-example-parity) |
| Audit docs/demo code with same rigor as components | [docs-token-drift](#docs-token-drift) |
| Dead CSS classes are silent bugs — verify every className has a definition | [dead-css-classes](#dead-css-classes) |
| Shared helpers: 2+ occurrences in docs → extract to `apps/docs/src/lib/` | [shared-doc-utilities](#shared-doc-utilities) |

### Accessibility Rules

| Rule | Source Lesson |
|------|--------------|
| After initial semantic tokens, run a11y audit before calling architecture complete | [semantic-token-gap](#semantic-token-gap) |
| jest-axe needs `expect.extend(toHaveNoViolations)` in setup + region rule disabled | [jest-axe-setup](#jest-axe-setup) |
| When switching fonts, immediately test small dense components (badges, tags, chips) | [font-vertical-centering](#font-vertical-centering) |
| `text-box-trim: both; text-box-edge: cap alphabetic` for pill components | [font-vertical-centering](#font-vertical-centering) |
| Combobox: keep focus on input, use `aria-activedescendant` — never move DOM focus to options | [combobox-focus-pattern](#combobox-focus-pattern) |

---

## What Went Well

### 3-tier token system made dark mode nearly free
Once primitive and semantic tokens were in place, dark mode was just writing `.dark {}` in `build-css.mjs` with different primitive references. No component needed dark-mode-specific code.

### Turborepo `^build` eliminated build-order errors
tokens → primitives → components automatically. No more "forgot to build tokens first."

### Radix Slot / asChild is a superpower
`<Button asChild><a href="...">` merges all button behavior onto the `<a>`. The correct way to build polymorphic components — not `as={Link}` patterns.

### Starting with Button was the right call
Button exercises every pattern: variants, sizes, states, forwardRef, asChild, ARIA, transitions, loading, disabled. Get Button right → every subsequent component is easier.

### Documenting as you go actually worked
Every component got a docs page the same session. The discipline meant docs were always current.

---

## What Was Harder Than Expected

### tsup output extensions {#tsup-extensions}
**Expected:** `.cjs` for CJS. **Reality:** `.js` for CJS, `.mjs` for ESM. Cost time tracing "module not found" errors.
**Rule:** package.json exports must match actual tsup output: `"import": "./dist/index.mjs"`, `"require": "./dist/index.js"`.

### Storybook stories glob path
**Expected:** Relative to package root. **Reality:** Relative to `.storybook/` dir. Need `../../../` not `../../`. Silent failure — empty Storybook, no error.

### Astro JSON import paths
**Expected:** Relative to project root. **Reality:** Relative to `.astro` file. Five `../` to reach packages from a nested page. Silent 404.

### Two separate build steps for tokens
`tsup` builds TS exports. `build-css.mjs` builds CSS. `tsup --watch` doesn't regenerate CSS. Must run full build or manual CSS script.

---

## Bugs We Hit

### `types` export order in package.json {#types-export-order}
**Bug:** TypeScript can't find declarations. **Cause:** `import` before `types` in exports. **Fix:** `types` must be first key.
**Rule:** Always `types` first in every exports condition.

### Storybook glob `@(ts|tsx)` not supported {#storybook-glob}
**Bug:** Zero stories found. **Fix:** Use `{ts,tsx}` not `@(ts|tsx)`.

### Hardcoded color references broke on palette rename {#color-rename-bug}
**Bug:** Code blocks lost styling after `gray` → `stone` rename. Fallback values masked the failure.
**Rule:** No CSS variable fallbacks with hardcoded values. Missing tokens should fail visibly. Always grep after renames.

### Referencing `@ds/primitives` before building it
**Bug:** "Cannot find module." **Fix:** Build in order, or use `pnpm build` for Turborepo.

### Radix Slot v1.2.4 stricter about `asChild` children {#radix-slot-aschild}
**Bug:** "React.Children.only" error with multiple children in Slot.
**Fix:** When `asChild=true`, pass only `{children}`. Guard extra elements behind `!asChild`.
**Rule:** Radix Slot must receive exactly one child when `asChild` is true.

### jest-axe requires both install AND `expect.extend()` {#jest-axe-setup}
**Bug:** "Invalid Chai property: toHaveNoViolations."
**Fix:** `expect.extend(toHaveNoViolations)` in `vitest.setup.ts` + `configureAxe({ rules: { region: { enabled: false } } })`.

### Storybook Vite cache duplicates React after Radix packages {#storybook-cache}
**Bug:** "Cannot read properties of null (reading 'useState')" — dual React.
**Fix:** `rm -rf node_modules/.cache/storybook` then restart.
**Rule:** Clear Storybook cache after adding any package that depends on React.

### Radix Select needs `aria-labelledby`, not `htmlFor` {#radix-select-aria}
**Bug:** axe "Buttons must have discernible text" despite label present.
**Cause:** Radix Select renders `<button role="combobox">` — `htmlFor` only links to form controls.
**Fix:** `useId()` → `aria-labelledby` on trigger.
**Rule:** Radix components rendering `<button>` use `aria-labelledby`, not `htmlFor`.

### Chromatic fails without full git history {#chromatic-fetch-depth}
**Fix:** `fetch-depth: 0` in GitHub Actions checkout.

### Font vertical centering in small components {#font-vertical-centering}
**Bug:** Badge/button text appeared shifted up after switching to Ancizar Serif.
**Fix:** `text-box-trim: both; text-box-edge: cap alphabetic;` on pill-shaped components.
**Rule:** When switching fonts, immediately test badges, tags, chips. Use `text-box-trim` proactively.

---

## Gotchas: CSS & Layout

### CSS custom properties cannot be used in `@media` queries {#css-media-vars}
Use raw pixel values with token-name comments: `/* @breakpoint-lg = 1024px */`.

### Flex overflow: every ancestor needs `min-width: 0` {#flex-overflow}
Trace from overflowing element up through every parent. First ancestor without `min-width: 0` is the bug.

### CSS changes don't hot-reload in docs site {#css-hot-reload}
Docs imports pre-built CSS from `@ds/components/dist/`. Must rebuild library after CSS changes.
**Rule:** Component CSS → library rebuild. Token changes → token rebuild. Only page-level CSS hot-reloads.

### Prefer CSS-based responsive over JS-based {#css-vs-js-responsive}
Render full content, use CSS `display` to control visibility at breakpoints. JS filtering locks you to one breakpoint at render time.

### Global heading styles leak into compound components
Radix Accordion's `<h3>` picks up site-level `h3` styles. Add defensive resets when embedding.

### SVG logos as `<img>` can't use `currentColor`
**Fix:** `filter: invert(1)` for monochrome logos in dark mode. Multi-color logos → inline SVG.

### Radix Portal content doesn't inherit from component roots {#radix-portal}
Select dropdown, Modal content render at `document.body` via Portal.
**Rule:** Portalled elements need explicit `font-family: var(--font-family-body)`.

### Dead CSS classes are silent bugs {#dead-css-classes}
ClassName with no CSS definition → either dead code or missing style. Never leave unresolved.

### Redundant declarations are overrides in disguise {#redundant-declarations}
If block component sets same value as primitive, delete it. It's a hidden coupling that breaks when primitive changes.

### Form elements don't inherit `font-family` {#form-font-inheritance}
Browser UA stylesheets override inheritance on `input`, `select`, `textarea`, `button`. Need global reset.

---

## Gotchas: Components

### `color-mix(… %, transparent)` broken for WCAG contrast {#color-mix-contrast}
Mathematically impossible to reach 3:1 or 4.5:1 at low percentages. Use solid primitive references.
**Rule:** `color-mix` with `transparent` ONLY for decorative elements. Use 50-shade primitives for backgrounds, 600+ for borders/text.

### Semantic token gaps surface during a11y audits {#semantic-token-gap}
Gap between `foreground-subtle` (fails AA) and `foreground`. Warning badge text needs primitive.
**Rule:** Run a11y audit on every component before calling token architecture complete.

### `display: none` on child = missing API {#display-none-override}
SaleDemo hiding ProductCard's price with `display: none` on internal class.
**Rule:** Signal to add a prop/slot. Fix the component, don't override from outside.

### Fixed-width components in fluid grids {#fixed-width-card-grid}
220px card in `1fr` grid → phantom gaps.
**Fix:** `fluid` variant with `width: 100%`. Grid opts in; standalone keeps fixed.
**Rule:** Ask "will this ever live in a fluid context?" If yes, provide fluid variant.

### Escalating gap tokens per breakpoint {#gap-escalation}
Three gap tiers (16→20→24) created visual noise. Collapsed to two (16 mobile, 24 desktop).
**Rule:** Grid gaps: fewest distinct values possible. Same token for row-gap and column-gap.

### Composite tokens turn magic numbers into named concepts {#composite-tokens}
Modal overlay used `40%` — unnamed magic number. System had `--opacity-medium: 0.382` unused.
**Fix:** `--color-overlay` composite token.
**Rule:** When a value has semantic meaning, give it a token name.

### Fixed heights on content containers are usually wrong {#fixed-height-antipattern}
CookieConsent `max-height: 260px` forced scrollbar.
**Fix:** Content-driven sizing. Mobile: `max-height: 50vh`. Desktop: no cap.
**Rule:** If adding `overflow-y: auto`, ask: would the user prefer scrolling or a taller container?

---

## Gotchas: Docs & Demos

### Inline styles in gallery components accumulate fast {#gallery-inline-styles}
25+ inline style attributes across 4 gallery files. Invisible to search, impossible to update globally.
**Fix:** Shared classes in `demo-utilities.css`.
**Rule:** 3+ repeats → shared class. "It's just a demo" is how tech debt starts.

### Raw HTML in demo code {#raw-html-in-demos}
Gallery files used `<p>` and `<h2>` instead of `<Text>` and `<Heading>`.
**Rule:** Demo code uses design system primitives. Developers copy demos — make them exemplary.

### Docs/Storybook parity audit missed intra-page gaps {#docs-audit-gap}
Audit checked "does a page exist?" — too coarse. Button page had "With icons" heading but no live preview.
**Rule:** Parity is story-level, not component-level. Every story needs a `<Gallery client:load />`.

### Docs must compose components, not reimplement {#docs-example-parity}
ProductCard docs showed hand-rolled price instead of `PriceDisplay`.
**Rule:** If example pages compose two components, docs must show that composition.

### Docs token compliance drifts silently {#docs-token-drift}
Component library: 100% compliance. Docs site: accumulated inline styles over time.
**Rule:** Audit docs with same rigor as components. The docs site is the most-copied code.

### Shared doc utilities pay off immediately {#shared-doc-utilities}
`makePlaceholder()` duplicated in 4 files — 60+ lines. Extracted to shared lib.
**Rule:** 2+ occurrences in docs → extract to `apps/docs/src/lib/`.

---

### Combobox: aria-activedescendant Focus Pattern {#combobox-focus-pattern}

**What happened:** Built the first combobox in the system (PredictiveSearch). WAI-ARIA combobox pattern requires that DOM focus stays on the input at all times — visual highlighting on options is communicated via `aria-activedescendant` pointing to the active option's `id`. Moving DOM focus to individual `<li>` options breaks the combobox pattern and prevents typing while navigating.

**Also learned:** Safari adds a native clear button to `type="search"` inputs via `::-webkit-search-cancel-button`. When you have a custom clear button, hide the native one with `-webkit-appearance: none`.

**Also learned:** Debounce for a single use case (search input) is trivially implemented with `useEffect` + `setTimeout` — no library needed. The cleanup function clears the timer on query change or unmount.

**Rule:** In combobox/autocomplete components, never move DOM focus to options. Use `aria-activedescendant` on the input to reference the visually highlighted option. Focus only returns to the input on Escape or selection. See WAI-ARIA Combobox APG for the canonical pattern.

---

### `shopify theme dev` must run from the theme root {#shopify-theme-dev-cwd}

**What happened:** Ran `shopify theme dev --store=...` from the monorepo root. The CLI syncs the current working directory to the remote dev theme by comparing local vs remote files — files present remotely but absent locally get deleted. The monorepo root has no `layout/theme.liquid` or `config/settings_schema.json`, so the CLI tried to delete the remote originals. Shopify rejects deletion of required files, leaving the dev theme in a half-synced broken state. The browser preview showed Shopify's system 404 instead of our content.

**Also learned:** The `--path=apps/theme` flag is documented but flaky in CLI 3.90.0 — the cleanest path is `cd apps/theme` then run `shopify theme dev` with no `--path`.

**Also learned:** Broken dev themes persist across sessions. The CLI reuses the same `preview_theme_id` on subsequent runs. Once corrupted, the only fix is `shopify theme delete --theme=<id>` and let the CLI create a fresh one.

**Rule:** Always `cd apps/theme` before running `shopify theme dev`. Never run the Shopify CLI from the monorepo root. If a dev session shows `Failed to delete file "layout/theme.liquid"` or similar, stop immediately — the working directory is wrong. When a dev theme is corrupted, `shopify theme list` → identify the `[development] [yours]` theme → `shopify theme delete --theme=<id>` → restart from the correct directory.

---

### Shopify `settings_schema.json` validation quirks {#shopify-settings-schema-validation}

**What happened:** Simplified `config/settings_schema.json` to strip Dawn's exhaustive design settings. Upload failed with escalating validation errors as I fixed each one:
1. `theme_support_url must be a URL` — empty string `""` fails URL validation; the field must either be a valid URL or omitted.
2. `theme_info must contain either 'theme_support_email' or 'theme_support_url', but not both` — omitting both also fails; Shopify requires exactly one.
3. `theme_documentation_url is required` — documentation URL is mandatory, cannot be omitted.

**Rule:** The `theme_info` section of `config/settings_schema.json` has non-obvious requirements: (a) `theme_documentation_url` is **required** and must be a valid URL (not empty string); (b) **exactly one** of `theme_support_email` or `theme_support_url` is required (not both, not neither). Never leave URL fields as empty strings — omit them entirely or provide a real URL.

---

### Token & primitive gaps surfaced by the theme port {#theme-port-token-gaps}

**What happened:** Porting React components to Shopify Liquid forced us to surface classes and tokens that exist in the React world but needed adaptation for Liquid/Shopify constraints. Four gaps surfaced across the Phase 1 streams:

1. **`--radius-xs` is referenced but not defined.** `packages/components/src/cart-line-item/CartLineItem.css` uses `var(--radius-xs)` but `tokens.json` only ships `--radius-sm` (2px) through `--radius-xl` (13px). Stream E substituted `--radius-sm` in the ported theme CSS. The design system's own CartLineItem silently falls back to `initial` in production.

2. **No narrow-container width token.** Customer forms want a ~480–520px centered column. The closest tokens are `--size-modal-sm` (400px), `--size-modal-md` (520px), and `--size-content-sm` (640px). Stream F used `--size-modal-md` as the least-bad choice. Consider adding `--size-form-narrow` or similar.

3. **No primitive for native `<select>`.** The Radix-based `.ds-select-trigger` can't be wired to Shopify's `Shopify.CountryProvinceSelector` because it requires a real `<select>` element. Stream F added a minimal `.ds-native-select` in `customer.css`. If another context needs a native select (mobile sort dropdown, checkout country), promote it to a primitive.

4. **No `.ds-table` primitive.** Order history and order detail pages need a table. Stream F inlined table styles into `customer.css` with permission. If a second consumer appears, promote to a `Table` component (or reuse the existing `packages/components/src/table/`, which exists — Stream F didn't port it because one-off customer tables felt small).

**Rule:** When adding tokens, scan the full codebase (including `packages/components/src/**/*.css`) for references that don't resolve. CSS variables fail silently — `var(--radius-xs)` produces `initial` when undefined, not a runtime error. When porting a component to Liquid and the component's CSS references tokens that don't exist, document the gap in the port's section report and raise a follow-up to fix it at the source (component CSS or tokens.json), not the port.

**Related rule (already enforced):** "After renaming tokens, `grep -r 'old-name' .` — CSS vars fail silently." This extends that: when *adding* token names to component CSS, verify they exist in `tokens.json` first.

---

### Shopify CLI transient SSL errors {#shopify-cli-ssl}

**What happened:** Occasional `SSL alert number 20 (bad record mac)` errors when the CLI calls `admin/api/.../graphql.json`. Error is not reproducible — retrying the same command succeeded immediately. Suspect environmental (VPN interference, flaky connection, or TLS stack issue in Node's https module).

**Rule:** Treat `SSL alert number 20` and similar mid-request TLS errors from the Shopify CLI as transient. Retry once before debugging. If it persists across 3 retries, check VPN/proxy and consider upgrading the CLI (`npm install -g @shopify/cli@latest`). Not a code issue — no theme changes required.

---

### Icon button squeezed to 16px by flex layout {#icon-button-flex-shrink}
**Bug:** Theme toggle in docs sidebar header set `width: 36px` but rendered 16px wide. A 160px logo sharing the same `justify-content: space-between` row pushed the button below its declared width — flex's default `flex-shrink: 1` let it collapse to the SVG child's intrinsic 16px.
**Fix:** `flex-shrink: 0` on the toggle.
**Rule:** Any icon button in a flex row with a sibling that can grow needs `flex-shrink: 0`. Declared width is not honored without it.

### Inline SVGs missing `.ds-icon` class = invisible {#inline-svg-sizing}
**Bug:** Shopify theme's sun/moon toggle icons in `header.liquid` were hand-inlined without `class="ds-icon ds-icon--md"`. Sibling icons (cart, search) rendered through `{% render 'icon' %}` which adds those classes automatically. Without them, the inline SVGs had no width/height — browsers fall back to 300×150 or collapse, making them invisible inside a 36×36 button.
**Fix:** Added `ds-icon ds-icon--md` to the inline SVG classes. Better long-term: all icons go through `icon.liquid`.
**Rule:** Every inline `<svg>` in Liquid/Astro must either (a) use `{% render 'icon' %}` / `<Icon>` wrapper, or (b) carry `ds-icon ds-icon--{size}` classes. Never rely on viewBox alone for dimensions.

### Icon audit only checked paths, missed render bugs {#icon-audit-render-check}
**Bug:** Three subagents audited icon usage across components, docs, and theme. All three declared the theme toggle sun/moon ✅ correct because the SVG `d=""` paths drew valid sun and moon shapes. None caught that the moon was invisible in the Shopify theme (missing `.ds-icon` class) or that the docs toggle was squeezed to 16px (flex-shrink bug).
**Rule:** Any icon/visual audit must include a render-verification step — open the dev server, inspect computed styles (`width`, `height`, `display`, `color`), and screenshot. Semantic path correctness ≠ visual correctness. When delegating to subagents, include "verify the icon actually renders visibly at the expected size" in the prompt.

### Liquid `== empty` doesn't catch `nil` — use `== blank` {#liquid-empty-vs-blank}
**Bug (2026-04-26):** Built `sections/product-lifestyle.liquid` to fall back to `product.images` when `product.metafields.custom.lifestyle_images.value` is unset. Wrote `if images_to_show == empty or images_to_show.size == 0` to detect "no metafield." Never fell through. The metafield was nil (not present on the product), and in Shopify Liquid `nil == empty` is `false` — `empty` only matches the `EmptyDrop` sentinel that arrays/strings collapse to when actually populated and then drained, not the `nil` value of an unset variable. Calling `.size` on `nil` returns `nil` (not `0`), so the size comparison also failed. The fallback never executed; the section silently rendered nothing.

**Rule:** When a Liquid variable could be `nil`, an empty array, an empty string, or `false`, use `== blank` — not `== empty` and not `.size == 0`. `blank` matches all four; `empty` only matches the `EmptyDrop` sentinel. This applies double for metafield reads (`product.metafields.…value`) since unset metafields return `nil`. Inverse: prefer `!= blank` over `present?` for "has value" checks.

### Wrapping a Liquid `render` snippet in a sized `<span>` silently downgrades typography {#span-wrap-liquid-render}
**Bug (2026-04-24):** Cart line-item's line total in the theme was rendered as `<span class="ds-text ds-text--sm ds-text--semibold">{% render 'price' %}</span>`. The price snippet outputs `<div class="ds-price-display">…</div>`, and `<span>` can't contain `<div>` — the HTML parser auto-closes the span, the div emerges as a sibling, and the visible text is rendered by the snippet's inner `<span class="ds-text--base ds-text--medium">` (16px / weight 500) instead of the intended sm / semibold (14px / 600). The outer span becomes an empty element with no effect. User perceived this as a font-size mismatch vs the DS drawer.

The React DS side doesn't hit this because `<Text size="sm" weight="semibold">` in JSX renders a single `<p>` with the text inline — there's no nested component that introduces extra elements.

**Rule:** When porting a React pattern that uses `<Text>` (or any sized typography primitive) to wrap a *plain scalar value*, emit a single `<p class="ds-text ds-text--{size} ds-text--{weight}">{value}</p>` in Liquid. Do NOT route through `{% render 'price' %}` (or any other component snippet) just to get the value formatted — call the formatter directly (`| money`, etc.). Reserve component snippets for cases where the component's own structure is wanted. A corollary: never put a Liquid component render inside a `<span>` — if the component's root is block-level (which most DS components are), the HTML is invalid and the cascading typography classes on the outer span get silently dropped.
**Bug (2026-04-24):** Ported `QuantitySelector` from React to Liquid for the cart drawer. React uses `<output>` for the value display; the Liquid port uses `<input type="number">` so the value POSTs with the cart form for no-JS progressive enhancement. DS CSS sets `min-width: var(--size-control-sm)` on the value — sufficient for `<output>` (no intrinsic width). In the theme, `<input type="number">` has a default `size="20"` attribute that becomes its flex-basis, so the input rendered at ~120px wide inside the drawer's 384px panel, blowing out the cart-line-item grid. Mobile touch-target override (also theme-only, not in DS) compounded the drift at narrow widths.
**Rule:** When a DS component uses `<output>` (or any element with no intrinsic width) and the Liquid port substitutes `<input>`, pin both `width` AND `min-width` in every size variant. Never preserve only `min-width` for an element whose intrinsic width is a character count. Also — do not add mobile touch-target overrides that exist only in the theme copy. If WCAG 2.5.5 needs a touch floor, either flag it as a DS-side gap and fix it in the DS (so it ports automatically), or solve it through component size props, never through a theme-only media query.

---

### `<figure>` default margin shifted PDP image, exposing wrapper bg {#figure-default-margin}
**Bug:** PDP product image showed the wrapper's `--color-background-subtle` along the top and left edges. Looked like an aspect-ratio mismatch but `object-fit: cover` was already in place. Root cause: `.ds-image-gallery__slide` is rendered as `<figure>` in `main-product.liquid`, and browsers apply default `margin: 1em 40px` to figure. The non-active slides use `position: absolute` (margin ignored), but the `--active` variant flips to `position: relative`, where the margin re-applies, pushing the image down and right.
**Fix:** Added `margin: 0` to `.ds-image-gallery__slide` in [apps/theme/assets/image-gallery.css](apps/theme/assets/image-gallery.css). Design system React component renders `<img>` directly (no figure), so it wasn't affected — but theme port introduced the figure wrapper without resetting margin.
**Rule:** Whenever a `<figure>` is used as a positioned/sized container (slides, cards, media wrappers), always reset `margin: 0`. Browser default is `1em 40px` and silently breaks any layout that assumes the figure fills its parent.

### Shopify focal point → CSS `object-position` for cover-cropped images {#shopify-focal-point}
**Bug:** Same PDP image audit. Once `object-fit: cover` is in place, images crop to fill — but the crop defaults to centered, which can chop the subject (face, product) off-screen for portrait/landscape mismatches.
**Fix:** Extended [responsive-image.liquid](apps/theme/snippets/responsive-image.liquid) with a `focal_point` param. When passed `image.presentation.focal_point` (Shopify's per-image focal point set in the media admin), it emits inline `style="object-position: {x}% {y}%"`. PDP now renders merchant-set focal points correctly. Cost: one inline style per image; benefit: merchants control crop without us building a focal picker.
**Rule:** Any `<img>` rendered with `object-fit: cover` over a Shopify image should accept and apply `image.presentation.focal_point`. The data is free from Shopify's media admin — just pipe it through.

---

### ProductCard text drift between React and Liquid {#theme-port-text-drift}
**Bug:** Audit of [product-card.liquid](apps/theme/snippets/product-card.liquid) vs [ProductCard.tsx](packages/components/src/product-card/ProductCard.tsx) found 5 divergences:
1. Name rendered as `<span>` instead of `<p>` (DS Text default).
2. Vendor row added in theme — does not exist in DS.
3. Hover-underline on name added in theme — DS only escalates via image zoom.
4. Price always rendered through `{% render 'price' %}` (PriceDisplay → 16px, default color), but DS default is `<Text size="sm" muted>` (14px, muted).
5. Badge wrapper had dead `flex; flex-direction: column; gap; align-items` for stacked badges, but the if/elseif logic only ever emits one badge.
**Fix:** Aligned theme to DS — switched name to `<p>`, removed vendor + schema setting + CSS rule, dropped hover underline, made the muted-Text price the default and only rendered PriceDisplay when `compare_at_price` exists, simplified badge to absolutely-positioned single child.
**Rule:** Every Liquid theme snippet that ports a React component must match the React markup *and* the Text/Heading wrapper choices (size, muted, weight). When auditing, diff three things: tag name, class list, and which Typography primitive wraps the content. Visual sameness is not parity if the underlying tokens diverge.

### `.ds-price-display--sm` renders at base, not sm {#price-display-size-naming}
**Trap:** [price-display.css](packages/components/src/price-display/PriceDisplay.css) maps the size variants asymmetrically — `--sm` → `--font-size-base` (16px), `--md` → `--font-size-lg` (18px), `--lg` → `--font-size-2xl`. This is intentional (price needs visual prominence; PriceDisplay has its own size curve, not the global Text scale). But it's confusing because `<Text size="sm">` is 14px — different scale entirely.
**Rule:** `.ds-price-display--{size}` and `<Text size="{size}">` use *different* type scales. Never assume they match. When porting, check the actual rendered font-size in [PriceDisplay.css](packages/components/src/price-display/PriceDisplay.css), not the size label.

---

### PriceDisplay collapse: matched sizes + sale-red {#price-display-collapse}
**Change:** Commit `6c2812d` rewrote [PriceDisplay.css](packages/components/src/price-display/PriceDisplay.css). Two shifts:
1. **Size scale collapsed** — both price and compare now share one size per variant (`sm` = 14px, `md` = 16px, `lg` = 18px). Previously the strikeout was always one tier smaller than the price, which read as visually disconnected. Selector switched from `.ds-price-display__price` / `.ds-price-display__compare` to `.ds-text` so any Text child inside the wrapper inherits the size.
2. **Sale state colors the price red** — `.ds-price-display:has(.ds-price-display__compare) .ds-price-display__price { color: var(--color-destructive); }`. The `:has()` parent selector means the rule only fires when a compare element is present, so non-sale prices keep the default foreground. Visually echoes the destructive Sale badge.
**Theme port:** [apps/theme/assets/price-display.css](apps/theme/assets/price-display.css) replicated exactly. [apps/theme/snippets/price.liquid](apps/theme/snippets/price.liquid) had hardcoded `.ds-text--base` on both spans — removed, since the new variant rules target `.ds-text` and the markup must mirror the React `<Text as="span">` (no size class) for the cascade to win.
**Rule:** When PriceDisplay (or any DS component using `.ds-text` size targeting) changes, theme markup must NOT pre-set a `.ds-text--{size}` class on Text children — let the parent variant rule own size. Pre-setting forces a specificity tie that the variant rule may lose.

### Theme-port audit trail = `git log -- packages/components/src/{component}/` {#theme-port-audit-trail}
**Pattern:** When the user says "I've made edits to the design system, port them," the audit is mechanical:
1. `git status packages/` — uncommitted DS edits
2. `git log --oneline -10 -- packages/components/src/{component-of-interest}/` — recent commits
3. `git show {sha} -- {file}` — diff for each
4. `diff apps/theme/assets/{component}.css packages/components/src/{component}/{Component}.css` — current divergence
5. Apply the diff to theme; remove any markup that pre-sets classes that should now be inherited.
**Rule:** Don't re-audit the whole component from scratch when a targeted DS edit is the source. Use git as the diff trail and port surgically.

---

### Page-level demos define the page contract, not isolated components {#page-level-demo-pattern}
**Bug:** Tried to port the Shopify collection page's filter integration "to match the design system." Discovered that while `<CollectionFilters>` exists as a DS component, the [docs collection example](apps/docs/src/pages/examples/collection.astro) didn't actually compose it — it rendered an unfiltered grid + sort. There was no DS source-of-truth for **what a collection page with filters looks like**, only for the filter component in isolation. Theme had improvised the integration (toolbar, sidebar layout, mobile filter trigger placement) without a DS reference, so audits couldn't tell which side was correct.
**Fix:** Extended [CollectionDemo.tsx](apps/docs/src/components/CollectionDemo.tsx) to compose `<CollectionFilters>` in a sidebar with stateful filter logic (categories, price range, on-sale boolean). Added [.ds-collection-layout](apps/docs/src/components/CollectionDemo.css) as the page-level grid pattern. Then ported that pattern verbatim to [main-collection.liquid](apps/theme/sections/main-collection.liquid) + [collection.css](apps/theme/assets/collection.css).
**Rule:** When a theme port asks "what does the DS say?", the answer must be a runnable demo at `apps/docs/src/pages/examples/{page}.astro` that composes the relevant components in their real-world context. Component-only stories aren't enough — the page-level pattern (header structure, layout grid, mobile/desktop split, state shape) is itself part of the DS contract. If the demo doesn't exist, build it BEFORE porting. Reverses the dependency from theme-improvised → DS-defined.

### `<Heading level={N}>` silently renders `<h2>` {#heading-level-prop-bug}
**Bug:** `<Heading level={1} size="2xl">` rendered as `<h2>`, not `<h1>`. Discovered while inspecting the docs collection page — `document.querySelector('h1')` returned null. Root cause: the [Heading component API](packages/components/src/typography/Typography.tsx) uses `as="h1"`, not `level={1}`. The unknown `level` prop falls through to `...props` (spread onto the heading element as an attribute) and `as` defaults to `'h2'`.
**Affected files:** Grep found 11 occurrences across CollectionDemo, CollectionFiltersGallery, HomepageDemo, CartDemo, DrawerGallery — every demo using `level={...}` has the wrong heading tag, breaking the SEO "one h1 per page" rule and the h1→h2→h3 hierarchy.
**Fix scoped to this task:** Only CollectionDemo. Other 10 are flagged for separate cleanup.
**Rule:** Heading prop is `as`, not `level`. Add a TypeScript exact-prop check or a lint rule (no-extraneous-jsx-props on Heading) so this fails at build time, not at runtime.

### `<CollectionFilters>` renders both views — render once {#collection-filters-single-render}
**Bug:** Theme had `{% render 'collection-filters', context: 'mobile' %}` in the toolbar AND `{% render 'collection-filters', context: 'desktop' %}` in the sidebar. Caused duplicate SR-only live regions, duplicate active pills DOM, and duplicate filter state inputs. Diverged from the React component which renders both views inside a single instance, with `.ds-collection-filters__desktop` / `__mobile` controlling visibility via CSS at the 768px breakpoint.
**Fix:** Single `{% render 'collection-filters' %}` (default context), placed inside the sidebar slot of `.ds-collection-layout`. On mobile the sidebar slot collapses to full width and the component shows its mobile trigger button.
**Rule:** Self-contained components that handle responsive splits internally (CollectionFilters, Drawer, etc.) must be rendered ONCE per page. If the Liquid port supports a `context` parameter, default it to render-everything and only specialize when there's a documented reason.

### Node 22+ ships a broken global `localStorage` that shadows jsdom's in vitest {#node-localstorage-stub}
**Bug:** Every Header test failed with `localStorage.setItem is not a function` (Node 25, vitest + jsdom). Node 22+ exposes a global `localStorage` whose storage backend is only wired up when `--localstorage-file` is passed — without it the global is a dead `{}`. Because the key already exists on `globalThis`, vitest's jsdom environment doesn't install jsdom's working Storage over it, and `window === globalThis` in vitest means `window.localStorage` hits the same stub.
**Fix:** [vitest.setup.ts](../../packages/components/vitest.setup.ts) replaces the global with an in-memory Map-backed `Storage` implementation. All suites now get a functional `localStorage`.
**Rule:** Components may use bare `localStorage` (browser-correct); the test shim lives in vitest.setup.ts, not in individual test files. If a future component needs `sessionStorage`, add the same shim.

### 4-file-rule backfill caught raw `<h3>`/`<p>` in Footer {#footer-raw-tags}
**Bug:** Footer and Header predated the 4-file rule (no tests, no stories). Writing the missing tests surfaced that Footer still rendered raw `<h3>` column headings and raw `<p>` tagline/copyright — violating the "always `<Heading>`/`<Text>`" convention.
**Fix:** Footer now renders `<Heading as="h3">` and `<Text>` with the existing BEM classes. Footer.css tagline/copyright selectors were bumped to `.ds-footer .ds-footer__x` (matching the pre-existing heading selector) so they win the specificity tie against `.ds-text--base`.
**Rule:** When backfilling tests for older components, also diff them against current conventions — missing tests and stale patterns travel together.

---

## Recommendations for Next Build

1. **Define token palette LAST.** Build a rough prototype first to understand brand direction. Lock token names before writing components — renaming causes ripple effects.
2. **Test package.json exports before writing components.** Full build → export → import chain. Finding issues after 10 components is much more painful.
3. **Set up Chromatic from day one.** Baselines grow incrementally. Setting up after 10 components triggers "changes detected" on all of them.
4. **Write docs the same session as the component.** Not "this week." The same session.
5. **Keep primitive token names stable.** The semantic layer exists so primitives are never in component CSS. Enforce this.
6. **Two-server setup is worth it.** Storybook for building, docs for consuming. Different audiences, don't merge.
7. **`pnpm --filter @ds/tokens build` is the most-run command.** Set up watchers for heavy token iteration.
8. **When changing fonts, test small dense components immediately.** Badges, tags, chips, small buttons, inline code. Use `text-box-trim` proactively.

---

## Open Questions

**[PENDING DECISION]** Should `tokens.json` be the source of truth for Figma variables? Options: Tokens Studio, native Figma Variables API, custom sync script.

**[RESOLVED]** Icon component built as library-agnostic `<Icon>` wrapper in `@ds/components`. Accepts SVG children directly — no icon library dependency yet. When a library is chosen (Lucide or Radix Icons), the `name` prop and registry pattern can be added without breaking the existing children API. Added `--size-icon-sm/md/lg` tokens (16/20/24px).

**[RESOLVED — 2026-04-24]** Added internal icon registry at `packages/components/src/icon/icons.tsx` (19 named exports — `X`, `Check`, `ChevronDown/Up/Left/Right`, `Plus`, `Minus`, `Search`, `Sun`, `Moon`, `Info`, `CircleCheck`, `TriangleAlert`, `CircleX`, `Image`, `ShoppingBag`, `ShoppingCart`, `Heart`). Paths are Lucide-equivalent. 11 components, BaseLayout.astro, and header.liquid migrated off raw `<svg>`. `<Icon>` wrapper kept for custom composition. See [decisions log](06-decisions-log.md) for rationale.

**[RESOLVED]** Deployment: GitHub Pages via Actions. Astro `base: '/claude-design-system'`. Live at `https://sixbase.github.io/claude-design-system/`.
