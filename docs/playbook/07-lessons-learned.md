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

### Shopify CLI transient SSL errors {#shopify-cli-ssl}

**What happened:** Occasional `SSL alert number 20 (bad record mac)` errors when the CLI calls `admin/api/.../graphql.json`. Error is not reproducible — retrying the same command succeeded immediately. Suspect environmental (VPN interference, flaky connection, or TLS stack issue in Node's https module).

**Rule:** Treat `SSL alert number 20` and similar mid-request TLS errors from the Shopify CLI as transient. Retry once before debugging. If it persists across 3 retries, check VPN/proxy and consider upgrading the CLI (`npm install -g @shopify/cli@latest`). Not a code issue — no theme changes required.

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

**[RESOLVED]** Deployment: GitHub Pages via Actions. Astro `base: '/claude-design-system'`. Live at `https://sixbase.github.io/claude-design-system/`.
