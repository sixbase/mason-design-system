# 06 — Decisions Log

> Every significant decision made during this build, with context and rationale.

---

## Rules for This File

1. **Add a new entry every time** we choose between options, change a previous decision, or establish a convention. This is not optional.
2. **Add entries at the bottom.** Chronological order. Newest last.
3. **Use the exact format below.** Every entry needs all 6 fields. No shortcuts.
4. **When a decision is superseded:** Change the old entry's status to `Superseded by [New Decision Name]`. Add the new entry at the bottom. Do not delete the old entry — the history of why we changed is valuable.
5. **When a decision came from a bug:** Link to the relevant section in `07-lessons-learned.md`.
6. **"Active" means enforced.** If Claude sees an active decision being violated in code, flag it.

### Entry Format

```
### [Decision Title]

**Date/Phase:** [when — date or build phase]
**Context:** [what problem or question we were facing]
**Options considered:** [what we evaluated — list all, including rejected]
**Decision:** [what we chose]
**Rationale:** [why — be specific enough that someone can judge if the rationale still holds]
**Status:** [Active / Superseded by X / Revisited — see notes]
```

---

## Quick Reference Index

Use this to find decisions by topic without scrolling 1300+ lines.

### Architecture & Tooling

| Decision | Status |
|----------|--------|
| Framework: React over Vue/Svelte | Active |
| Package Manager: pnpm + Turborepo | Active |
| Token Architecture: 3-Tier | Active |
| Package Bundler: tsup | Active |
| Documentation: Two Apps (Storybook + Astro) | Active |
| Primitive Components: Radix UI | Active |
| CSS Strategy: Plain CSS + BEM + `ds-` prefix | Active |
| package.json exports: `types` first | Active |
| tsup output: `.mjs` ESM, `.js` CJS | Active |

### Design & Tokens

| Decision | Status |
|----------|--------|
| Color Palette: Named palettes (`stone`, `brick`, etc.) | Active |
| Font: Ancizar Serif (after Inter → EB Garamond → Source Serif 4) | Active |
| Font-Family Token Rename: `serif`/`mono` → `body`/`code` | Active |
| Golden Ratio: φ governs all proportions | Active |
| Semantic Color Pairs: `primary` + `primary-foreground` | Active |
| φ-Derived Opacity Scale | Active |
| φ-Derived Transition Timing | Active |
| Fibonacci Border Radius | Active |
| Fibonacci Shadow Blur | Active |
| φ-Derived Control Heights | Active |
| Composite `--color-overlay` token | Active |
| Disabled State: `var(--opacity-medium)` not `0.5` | Active |
| Section Spacing: `--spacing-16` (64px) canonical, not phi-34 | Active |
| Container Width: `--size-content-xl` (1280px) vs `.ds-page-container` (1200px) | Active |
| Phi vs Standard Spacing: standard default, phi for proportional math only | Active |
| Line Height φ Audit: snug→1.382, tight/normal kept | Active |
| Type Scale Context Mapping: Tight/Default/Display boundaries | Active |

### Components & Patterns

| Decision | Status |
|----------|--------|
| Accordion: inner-only dividers (no outer borders) | Active |
| Accordion: `bordered` variant with panel wrapper | Active |
| Accordion: checkbox trigger variant | Active |
| Badge: solid primitive colors (not `color-mix` with transparent) | Active |
| Button loading: `aria-busy` + disabled interaction | Active |
| CookieConsent: compound component with i18n labels | Active |
| No Overrides Rule: block components never target primitive internals | Active |
| Optical Text Centering: `text-box-trim` | Active |
| Optimal Reading Width: 65ch | Active |
| ProductCard: `renderPrice`, `badge`, `hoverImage` props | Active |
| ProductCard: `fluid` variant for grid contexts | Active |
| StarRating: SVG clipPath half-fill | Active |
| Deprecated `clip` → `clip-path` in sr-only | Active |
| Drawer: Flat API (not compound) | Active |
| Icon: Library-agnostic SVG wrapper | Active |
| Table: Compound API with scroll wrapper | Active |
| Toast: Custom portal over Radix Toast | Active |
| Info color tokens (`--color-info-subtle`, `--color-info-foreground`) | Active |
| CartLineItem: Internal `formatPrice` (cents in, formatted out) | Active |
| CartDrawer: Composition over inline rendering | Active |
| CartDrawer: Sticky footer via `position: sticky` | Active |
| Pagination: Dual-mode rendering (SPA vs SSR) | Active |
| CollectionFilters: Shared panel content for desktop & mobile | Active |
| CollectionFilters: Active filter pills as dismissible buttons | Active |
| Alert: Variant-to-ARIA role mapping (alert vs status) | Active |
| Alert: Solid primitive backgrounds (no color-mix) | Active |
| PredictiveSearch: Custom combobox (no library) | Active |
| PredictiveSearch: Data fetching architecture (`onSearch` + `results`) | Active |
| Tabs: Radix UI primitive | Active |
| Skeleton: Custom implementation (no library) | Active |
| AddToCartButton: Status-driven state machine | Active |
| VariantSelector: Compound option groups with ColorPicker | Active |

### Layout & Pages

| Decision | Status |
|----------|--------|
| Layout Grid: 12-col, 1200px, `--spacing-6` gutters, `--spacing-16` rhythm | Active |
| PDP Grid Split: Golden (7+5) over Wide+Narrow (8+4) | Active |
| Prose Content: Left-aligned, not centered | Active |
| Page-Level Spacing: phi for sections, standard for internals | **Superseded** by Layout Grid System |

### Code Quality & Docs

| Decision | Status |
|----------|--------|
| Gallery Inline Styles → `demo-utilities.css` shared classes | Active |
| ViewportIndicator: inline styles → CSS + semantic tokens | Active |
| Shared Results Header pattern | Active |
| Token Compliance Audit: docs site inline styles → CSS classes | Active |
| Docs parity: every Storybook story needs live preview in docs | Active |

### Shopify Integration

| Decision | Status |
|----------|--------|
| Theme location: `apps/theme/` in monorepo | Active |
| Base theme: aggressive strip of Dawn (delete all assets/sections/snippets) | Active |
| Tokens distribution: copy `tokens.css` into theme assets (automation pending) | Active |

---

## Entries

*Newest entries at the bottom. Do not reorder.*

---

### Framework: React over Vue / Svelte

**Date/Phase:** Project kickoff
**Context:** Choosing the UI framework for the component library.
**Options considered:** React, Vue 3, Svelte
**Decision:** React
**Rationale:** React has the deepest ecosystem for design systems specifically. Radix UI (our primitives layer) is React-only. Storybook's best integrations are React-first. The target users (large ecommerce teams) are overwhelmingly React-based.
**Status:** Active

---

### Package Manager + Monorepo: pnpm Workspaces + Turborepo

**Date/Phase:** Project kickoff
**Context:** Choosing how to structure the multi-package monorepo.
**Options considered:** npm workspaces, Yarn Berry, pnpm workspaces; Nx, Lerna, Turborepo
**Decision:** pnpm workspaces + Turborepo
**Rationale:** pnpm enforces strict dependency isolation (no phantom deps), which is critical for a published component library. Turborepo's `^build` dependency graph is simple and zero-config compared to Nx. Lerna is legacy. This combination is used by Vercel, Shopify, Radix, shadcn — battle-tested at scale.
**Status:** Active

---

### Token Architecture: 3-Tier Shadcn-Inspired

**Date/Phase:** Before first component
**Context:** Choosing how to structure design tokens for flexibility, dark mode, and consumer overrides.
**Options considered:** Flat CSS variables, 2-tier (primitive + semantic), 3-tier (primitive + semantic + component), Style Dictionary
**Decision:** 3-tier system with `tokens.json` as single source of truth
**Rationale:** Flat variables can't support dark mode cleanly. 2-tier works but doesn't give consumers a clean override story at the component level. 3-tier (inspired by shadcn) adds component-scoped tokens that let consumers customize specific components without global side effects. Style Dictionary was evaluated but adds complexity without enough benefit at this scale.
**Status:** Active

---

### Package Bundler: tsup

**Date/Phase:** Before first component
**Context:** Choosing how to bundle `@ds/tokens`, `@ds/primitives`, and `@ds/components` for distribution.
**Options considered:** Rollup, esbuild directly, Vite library mode, tsup
**Decision:** tsup
**Rationale:** Zero-config dual ESM + CJS output. CSS concatenation built in (important for components). Used by shadcn component packages. esbuild under the hood so it's fast.
**Status:** Active

---

### Documentation: Two Apps (Storybook + Astro)

**Date/Phase:** Project setup
**Context:** Deciding how to handle both component development and documentation.
**Options considered:** Storybook only, Astro only, Storybook with MDX docs, separate Storybook + Astro
**Decision:** Separate apps — Storybook for internal dev, Astro for public docs
**Rationale:** Storybook serves engineers who are building components. The Astro docs site serves consumers who are using components. They have fundamentally different needs. Storybook as the only documentation leads to a poor consumer experience (too technical, no prose explanation). A custom docs site can be more opinionated and brand-appropriate.
**Status:** Active

---

### Primitive Components: Radix UI

**Date/Phase:** Before first component
**Context:** Choosing whether to write accessible primitives from scratch or use a library.
**Options considered:** Write from scratch, Headless UI, Reach UI, Ariakit, Radix UI
**Decision:** Radix UI
**Rationale:** Keyboard navigation and WAI-ARIA patterns are notoriously hard to get right. Radix has been audited and is used in production at scale. Completely unstyled so our token system drives all visual design. Used by shadcn/ui which has extremely wide adoption — the patterns are proven.
**Status:** Active

---

### CSS Strategy: Plain CSS with BEM-like Naming (no CSS Modules)

**Date/Phase:** Before first component
**Context:** Choosing the CSS approach for component styles.
**Options considered:** CSS Modules, styled-components, vanilla-extract, plain CSS + naming convention
**Decision:** Plain CSS with `ds-` namespace prefix + BEM-like modifiers
**Rationale:** CSS Modules work fine but add build complexity and make the "component token" override pattern harder (consumers can't predict the generated class names). styled-components adds a runtime. vanilla-extract requires a Vite plugin. Plain CSS with a namespace prefix is the simplest option that still prevents collisions, and it works in any bundler.
**Status:** Active

---

### package.json Exports: `types` Must Come First

**Date/Phase:** First package build (hit as a bug)
**Context:** TypeScript couldn't find type declarations for `@ds/tokens`.
**Options considered:** N/A — this is a TypeScript constraint, not a choice
**Decision:** `types` condition must be the first key in every `exports` map
**Rationale:** TypeScript resolves package.json exports conditions in order. If `import` appears before `types`, TypeScript finds the `.mjs` file and can't read it as declarations. See [07-lessons-learned.md](./07-lessons-learned.md#types-export-order).
**Status:** Active (applies to all packages)

---

### tsup Output Extensions: `.mjs` for ESM, `.js` for CJS

**Date/Phase:** First package build (hit as a bug)
**Context:** Package imports were resolving to the wrong files.
**Options considered:** N/A — this is tsup's actual output format
**Decision:** ESM output is `.mjs`, CJS output is `.js` (not `.cjs`)
**Rationale:** tsup's default behavior does not produce `.cjs` files. It produces `.js` for CommonJS. The package.json exports map must reflect actual output files. See [07-lessons-learned.md](./07-lessons-learned.md#tsup-extensions).
**Status:** Active (applies to all packages)

---

### Color Palette: Named Palettes Instead of Generic `gray`

**Date/Phase:** Token design
**Context:** Naming the warm neutral grey scale.
**Options considered:** `gray`, `neutral`, `stone`, `sand`, `clay`
**Decision:** `stone`
**Rationale:** Generic names like `gray` collide with Tailwind CSS's color system and communicate nothing about the brand. A named palette like `stone` communicates warmth and earthiness — it fits the ecommerce aesthetic. `sand` was considered but felt less premium. `clay` was the runner-up but felt more orange than grey. `stone` is also Tailwind's warm grey — familiar to developers.
**Status:** Active

---

### Typography: Source Serif 4 (Not EB Garamond) → Superseded by Ancizar Serif

**Date/Phase:** Early build — font was changed twice
**Context:** Choosing the brand typeface for an ecommerce design system.
**Options considered:** Inter (system), EB Garamond, Source Serif 4
**Decision:** Source Serif 4 (Google Fonts, opsz axis)
**Rationale:**
- **Inter** was the default — too generic, no personality for a premium brand
- **EB Garamond** was tried first — too ornate and heavy at small UI sizes (12–14px labels, input text). Looks beautiful as display type but fights readability as UI text.
- **Source Serif 4** has an optical size (`opsz`) axis that makes it render cleanly at small sizes while remaining elegant at display sizes. Warm and literary without being heavy.
**Status:** Changed — replaced by Ancizar Serif (see below)

---

### Design Context: Ecommerce — Warm, Premium, Earth Tones

**Date/Phase:** Planning
**Context:** The client use case for the design system.
**Options considered:** N/A — defined by the project
**Decision:** Ecommerce design system with warm, premium, editorial aesthetic
**Rationale:** High-end ecommerce (luxury goods, considered lifestyle brands) informed every choice: warm stone palette instead of cold grey, serif typography instead of sans-serif, subdued color accents (brick, sage, amber) instead of saturated primaries.
**Status:** Active

---

### Global Focus Ring: In `tokens.css` as a Safety Net

**Date/Phase:** Primitive fixes session
**Context:** Deciding where to define the global focus visible style.
**Options considered:** Each component handles its own focus (already done), global rule in tokens.css, global rule in a separate reset file
**Decision:** Both — components have their own focus rings, PLUS a global fallback in `tokens.css`
**Rationale:** Components that aren't part of this system (third-party, consumer-written) would have no focus ring without the global fallback. The two-level approach means every interactive element is covered without components being forced to use a specific implementation.
**Status:** Active

---

### `prefers-reduced-motion`: Global Rule in `tokens.css`

**Date/Phase:** Primitive fixes session
**Context:** Accessibility requirement — respect user's OS motion preference.
**Options considered:** Per-component media queries, global rule in tokens.css
**Decision:** Global rule in `tokens.css` PLUS per-component overrides where needed
**Rationale:** The global rule (`animation-duration: 0.01ms`) covers the entire app at once. Components with animations (e.g. the button spinner) add a component-specific rule for finer control (spinner becomes static rather than invisible). Belt and suspenders approach.
**Status:** Active

---

### Design Principle: The Golden Ratio (φ) Governs All Scale Decisions

**Date/Phase:** Ongoing — applies to all future token and component work
**Context:** Establishing a mathematical foundation for visual proportions across the system.
**Options considered:** Tailwind-style integer multiples, arbitrary scale, modular scale (Major Third, Perfect Fourth), golden ratio φ
**Decision:** The golden ratio (φ ≈ 1.618) is the guiding ratio for all scale decisions — type, spacing, radius, shadow, layout proportions, timing. Not a rigid formula, but the spirit: ratios between related values should tend toward 1:φ or be derivable from it.
**Rationale:** φ appears throughout nature and classical design because it produces proportions that feel balanced without being rigid. For a premium, editorial ecommerce system, it provides a principled aesthetic backbone — proportions feel "right" rather than arbitrary. It also gives a decision rule when choosing between options: prefer the ratio closer to φ.
**Status:** Active — applies to all future token definitions and component sizing decisions

#### What φ means in practice

φ = 1.6180339887...
φ² = 2.618
√φ = 1.272 (useful for closer-spaced steps)
1/φ = 0.618 (the complement — also appears in the ratio)

**The golden rectangle:** width:height = φ:1 ≈ 1.618:1
This is the basis for image aspect ratios, card proportions, layout column splits.

---

#### Type scale — ideal vs. current *(updated post-φ implementation)*

The default type scale now uses √φ (≈ 1.272) as the step ratio:

| Step | φ-ideal (base 16px) | Current token | Delta |
|------|---------------------|---------------|-------|
| xs   | 10px (16 ÷ φ)       | 12px          | +2px  |
| sm   | 12.6px (16 ÷ √φ)    | 14px          | +1.4px|
| base | 16px                | 16px          | ✅    |
| lg   | 20.4px (16 × √φ)    | 20px          | ≈ ✅  |
| xl   | 25.9px (16 × φ)     | 26px          | ≈ ✅  |
| 2xl  | 32.9px (16 × φ√φ)   | 33px          | ≈ ✅  |
| 3xl  | 41.9px (16 × φ²)    | 42px          | ≈ ✅  |
| 4xl  | 53.3px (16 × φ²√φ)  | 54px          | ≈ ✅  |
| 5xl  | 67.8px (16 × φ³)    | 68px          | ≈ ✅  |

The scale from `lg` upward now matches φ-ideal values. Two additional scales were added: `tight-*` (φ^(1/3) step ≈ 1.175) for dense data UIs and `display-*` (full φ step) for editorial/marketing. See "Token Scales: Full φ Implementation" below for details.

**Already φ:** `lineHeight.relaxed` = 1.618 (exact φ). The optimal reading line height is the golden ratio.

---

#### Spacing scale — ideal vs. current

Base unit: 4px. φ-derived steps multiply by φ at each level:

| Step | φ-ideal        | Current token | Notes |
|------|----------------|---------------|-------|
| 1    | 4px            | 4px  (--spacing-1) | ✅ |
| 2    | 6.5px ≈ 6px    | 8px  (--spacing-2) | current is 2× base |
| 3    | 10.5px ≈ 10px  | 12px (--spacing-3) | close |
| 4    | 16.9px ≈ 16px  | 16px (--spacing-4) | ✅ approx |
| 5    | 27.4px ≈ 28px  | 20px (--spacing-5) | diverges |
| 6    | 44.3px ≈ 44px  | 24px (--spacing-6) | diverges significantly |
| 8    | 71.7px ≈ 72px  | 32px (--spacing-8) | diverges |

The φ scale grows faster than the current integer-multiple scale. The practical implication: use φ ratios when deciding **relationships between spacing values** (e.g. a component's outer padding should be φ× its inner gap). Absolute spacing values can remain as-is for compatibility.

**φ spacing rule of thumb:** If inner padding is 16px, outer margin should be ~26px (16 × φ). If gap between items is 8px, section gap should be ~13px (8 × φ).

---

#### Radius scale — ideal φ derivation *(updated post-φ implementation)*

Radius now uses the Fibonacci sequence directly:

| Step | Fibonacci value | Current token |
|------|-----------------|---------------|
| sm   | 2px             | 2px  ✅       |
| md   | 5px             | 5px  ✅       |
| lg   | 8px             | 8px  ✅       |
| xl   | 13px            | 13px ✅       |
| 2xl  | 21px            | 21px ✅       |

All radius values now follow the Fibonacci sequence (2, 5, 8, 13, 21). Each step ratio approaches φ.

---

#### Layout proportions

When dividing space into two sections, the φ split is **38.2% : 61.8%** (1/φ² : 1/φ).

- Sidebar vs. main content: sidebar ≈ 38%, content ≈ 62%
- Filter panel vs. product grid: similar split
- Card image vs. card body height
- Hero text block vs. hero image

The current docs sidebar is approximately 240px wide in a 640px+ layout — roughly a 37.5%:62.5% split, which approximates φ well.

---

#### Image / card aspect ratios

| Ratio | Value   | Use |
|-------|---------|-----|
| 1:φ   | 1:1.618 | Portrait product image (e.g. fashion, beauty) |
| φ:1   | 1.618:1 | Landscape hero image |
| φ:φ   | 1:1     | Square product thumbnail |
| 4:3   | 1.333:1 | Standard card (current CardImage default) |

**Recommendation:** Add `aspectRatio="1/1.618"` (portrait golden) as a named option in `CardImage`. Fashion and luxury ecommerce almost always shoots product in portrait φ ratio.

---

#### Animation timing *(updated post-φ implementation)*

Transition durations now follow φ progression exactly:

| Duration | φ derivation | Current token |
|----------|-------------|---------------|
| fast     | 100ms (base) | 100ms ✅     |
| normal   | fast × φ ≈ 162ms | 162ms ✅ |
| slow     | fast × φ² ≈ 262ms | 262ms ✅ |

All three duration values are now φ-derived. Shorthand tokens `--transition-fast/normal/slow` combine duration + default easing.

---

#### Summary: how to apply φ going forward

1. **When choosing between two candidate values**, prefer the one whose ratio to its neighbor is closer to φ
2. **Type scale**: heading h1:h2:h3:h4 ratios should tend toward φ (or √φ for tighter scales)
3. **Spacing**: component inner gap : outer padding ratio should approach φ
4. **Layout**: two-column splits should default to 38%:62%
5. **Aspect ratios**: default card/image ratio should be φ:1 or 1:φ
6. **Radius**: each step should be φ× the previous
7. **Shadows**: blur radius : spread radius ratio ≈ φ
8. **Line height**: body text line height = φ (1.618) — already correct

---

### Accessibility Testing: jest-axe in Every Component Test

**Date/Phase:** Select + Checkbox build
**Context:** Deciding how to enforce accessibility requirements in CI, not just as guidelines.
**Options considered:** Manual a11y audit only, Storybook a11y addon only, jest-axe in unit tests
**Decision:** jest-axe axe-core scan as a required test case in every component's test file
**Rationale:** Storybook a11y addon only runs when a developer opens Storybook and looks at the panel. Unit test axe scans run in CI on every PR. Catching a missing `aria-label` or broken label association in CI is the only reliable way to prevent a11y regressions from shipping.
**Status:** Active

---

### Icons in Docs: Inline SVG (No External Package)

**Date/Phase:** Button docs page — "With icons" section
**Context:** The Button component accepts `ReactNode` for `leadingIcon`/`trailingIcon`. The docs needed real icons to demonstrate the feature.
**Options considered:** Add Lucide React, add Radix Icons, use Hero Icons, inline SVG directly in the gallery component
**Decision:** Inline SVG in `ButtonGallery.tsx` — no external icon package
**Rationale:** Adding an icon package to `apps/docs` just for four demo icons adds a dep that has nothing to do with the design system itself. Inline SVG is self-contained, ships zero bytes to consumers, and documents the pattern (you bring your own icons). The component accepts `ReactNode` by design — the docs should demonstrate that without prescribing a specific library.
**Status:** Active — revisit if an `@ds/icons` package is added in the future

---

### Transparent Colors: `color-mix()` Instead of `rgba()`

**Date/Phase:** Input component focus ring
**Context:** Creating a semi-transparent focus ring color that works in dark mode.
**Options considered:** Hardcoded `rgba(hex, alpha)`, CSS `color-mix()`, `oklch` with alpha
**Decision:** `color-mix(in srgb, var(--color-focus-ring) 20%, transparent)`
**Rationale:** Hardcoded `rgba()` references a specific hex value and doesn't update when `.dark` swaps `--color-focus-ring` to a different value. `color-mix()` evaluates the CSS variable first (after dark mode applies) then mixes it. Supported in all modern browsers (Chrome 111+, Firefox 113+, Safari 16.2+).
**Status:** Active

---

### Token Scales: Full φ Implementation Across All Categories

**Date/Phase:** Post-v1 token revision
**Context:** After establishing that φ should govern all proportional decisions (see "Design Principle: The Golden Ratio" entry above), the token scales needed to be updated to actually encode φ-derived values rather than leaving them as aspirational targets.
**Options considered:**
1. Derive all token values strictly from φ — maximum mathematical purity, some values unusable at small sizes
2. Replace existing spacing tokens with Fibonacci scale — would break all component CSS referencing `--spacing-*`
3. Keep existing spacing tokens, add Fibonacci reference scale as new `--spacing-phi-*` tokens — additive, non-breaking
4. Update only the "safe" categories (font sizes, radius, shadow, timing) and add phi-spacing alongside

**Decision:** Option 3+4 combined:
- Updated `font.size` default scale to √φ step ratios (base 16px): lg→20px, xl→26px, 2xl→33px, 3xl→42px, 4xl→54px, 5xl→68px
- Added two new type scales: `tight-*` (φ^1/3 step) and `display-*` (φ step)
- Updated `font.lineHeight.relaxed` to exact φ = 1.618 (was 1.625)
- Updated `radius` to Fibonacci sequence: md→5px (was 6), xl→13px (was 12), 2xl→21px (was 16)
- Updated `shadow` blur/offset values to Fibonacci progression: 2, 5, 13, 21, 34px
- Updated `transition.duration` to φ progression: normal→162ms (was 200ms), slow→262ms (was 300ms)
- Added `opacity` section: successive powers of 1/φ → 1.0, 0.618, 0.382, 0.236, 0.146, 0.09
- Added `spacing.phi-*` tokens: Fibonacci × 2px reference scale (2, 4, 6, 10, 16, 26, 42, 68, 110, 178px)
- Updated `build-css.mjs` to emit opacity tokens as `--opacity-*`

**Rationale:** Updating values in-place for font sizes, radius, shadows, and transitions is safe — components reference these by name (`--font-size-sm`, `--radius-md`), and the visual change from the token update is subtle and intentional. Replacing existing spacing tokens would break component layout CSS throughout the library, so new `--spacing-phi-*` tokens are added as a reference scale for new work and section-level spacing.

**What breaks:** None — 73/73 component tests pass after the change. Border radius changes from 6px→5px (md) are a 1px visual refinement. Transition speed changes from 200ms→162ms are imperceptible in practice.

**Status:** Active

---

### Size Tokens: φ-Derived Control Heights Replace Magic Numbers

**Date/Phase:** Post-v1 elegance pass
**Context:** Component CSS had hardcoded pixel heights (`height: 32px`, `height: 40px`, `height: 48px`, `width: 14px`, etc.) that had no connection to the token system. Any change to component sizing required hunting down multiple hardcoded values across multiple CSS files.
**Decision:** Add `primitive.size` token category with φ/Fibonacci-derived control heights and checkbox dimensions. Update all component CSS to reference `--size-control-sm/md/lg` and `--size-checkbox-sm/md`.
**New values:**
- `control-sm`: 34px (Fibonacci, was 32px — 2px change)
- `control-md`: 42px (phi-21, was 40px — 2px change)
- `control-lg`: 55px (Fibonacci, was 48px — 7px change)
- `checkbox-sm`: 13px (Fibonacci, was 14px)
- `checkbox-md`: 21px (Fibonacci, was 18px — `checkbox-md / checkbox-sm = 21/13 ≈ φ`)
**Rationale:** The step ratio 34→42→55 ≈ √φ (average ratio ≈ 1.272), matching the default type scale. Component sizes and type sizes now share the same proportional system. Zero magic pixel values remain in component CSS.
**Status:** Active

---

### Z-Index: Now Emitted as CSS Variables

**Date/Phase:** Post-v1 elegance pass
**Context:** `primitive.zIndex` was defined in `tokens.json` but `build-css.mjs` never emitted it. Components that needed z-index values had no token to reference.
**Decision:** Add emission of `--z-index-*` tokens to `build-css.mjs`.
**Status:** Active

---

### Typography Page: Display Scale Demoted to Optional

**Date/Phase:** Post-v1 docs refinement
**Context:** The typography foundation page listed all three type scales (default, tight, display) as equally prominent in a single flat table. A user reviewing the page couldn't tell which scale to use for standard work, leading to confusion about whether the scales were for different screen sizes (mobile/desktop).
**Options considered:**
1. Remove the display scale entirely from the token system
2. Keep all three scales in one flat table with no hierarchy
3. Split into labelled sections with explicit priority badges and context descriptions
**Decision:** Option 3 — three sections with badges: "Use this" (default), "Dense UI only" (tight), "Editorial / optional" (display). Display table rendered at `opacity: var(--opacity-high)` to visually deprioritize it.
**Rationale:** The display scale is mathematically justified and genuinely useful for editorial/marketing contexts, but it creates cognitive overhead if presented as equally important. Most product work never touches it. The badge + opacity treatment communicates hierarchy without removing the tokens. Single-scale systems (Material, Carbon, Polaris) are the industry default — our three-scale system needs clear signposting to not feel like unnecessary complexity.
**Status:** Active

---

### Token Removal: `display-2xs` (0.375rem / 6px) Dropped

**Date/Phase:** Post-v1 docs refinement
**Context:** During the typography page rewrite, the `display-2xs` token (0.375rem / 6px) was flagged as genuinely unusable. At 6px, text is unreadable on any screen — it fails WCAG minimum text size guidelines and has no practical application in any UI context.
**Options considered:**
1. Keep it for mathematical completeness (the display scale starts from φ^0 = 1rem and steps down)
2. Remove it entirely from `tokens.json`
**Decision:** Option 2 — removed from `tokens.json`. The display scale now starts at `display-xs` (0.625rem / 10px).
**Rationale:** Mathematical elegance doesn't justify shipping a token that no one should ever use. A 6px token is a footgun — if someone references it, it's a bug. The display scale remains φ-stepped from `display-xs` upward.
**Status:** Active

---

### New Component: Modal (Radix Dialog)

**Date/Phase:** Post-v1, P1 ecommerce roadmap
**Context:** The component library needed a dialog/modal for confirmations, quick-edit forms, and order detail previews — all critical ecommerce patterns. No existing modal component existed.
**Options considered:** Custom dialog from scratch, Radix Dialog, HeadlessUI Dialog
**Decision:** Radix Dialog (`@radix-ui/react-dialog`) with compound component API: `Modal`, `ModalTrigger`, `ModalContent`, `ModalHeader`, `ModalTitle`, `ModalDescription`, `ModalBody`, `ModalFooter`, `ModalClose`.
**Rationale:** Radix Dialog provides focus trapping, focus return, Escape key handling, `aria-labelledby`/`aria-describedby` linking, and background scroll lock out of the box. The compound API matches our existing Select pattern and gives consumers full layout flexibility. Three size presets (sm/md/lg) cover confirmation dialogs, forms, and detail views.
**Status:** Active

---

### Warm Page Background + 3-Layer Background Token System

**Date/Phase:** Post-v1, visual refinement
**Context:** The page background was pure white (`stone.0`), which felt flat and clinical against the warm earth-tone palette. The user requested shifting the page background to the warmer `background-subtle` value and adjusting the rest of the color system for visual harmony.
**Options considered:** (1) Simply swap background ↔ background-subtle, (2) Shift all background tokens down one step and add a new surface token, (3) Keep background white and adjust other tokens for warmth.
**Decision:** Option 2 — shift background tokens down one step and introduce a 3-layer system:
- `--color-background`: stone.50 (#FAF9F7) — warm off-white page background
- `--color-background-subtle`: stone.100 (#F2F0EB) — sidebar, code blocks, section differentiation
- `--color-background-surface`: stone.0 (#FFFFFF) — **new** — cards, modals, inputs, dropdowns (elevated surfaces)
- `--color-secondary`: stone.200 (shifted from stone.100 to maintain contrast against new bg-subtle)
- `--color-secondary-hover`: stone.300 (shifted from stone.200)
**Rationale:** A 3-layer background system (page → section → surface) creates natural visual hierarchy without relying on heavy shadows. Elevated elements (inputs, cards, modals) use pure white to "lift" off the warm page, giving the UI a layered, premium feel that matches the ecommerce brand. The secondary button shift was necessary so secondary fills remain distinct from `background-subtle`. Dark mode only needed the new `background-surface` token added (mapped to stone.900); the existing dark bg/bg-subtle values remained correct.
**Status:** Active

---

### Font: Ancizar Serif over Source Serif 4

**Date/Phase:** Post-v1, visual refinement
**Context:** The design system used Source Serif 4 as its primary typeface. The user wanted to switch to UNAL Ancizar Serif for a different character.
**Options considered:** Keep Source Serif 4, switch to Ancizar Serif, switch to another serif
**Decision:** Ancizar Serif via Google Fonts (`'Ancizar Serif', ui-serif, Georgia, serif`). Added `light` (300) font weight alongside existing normal (400), medium (500), semibold (600), bold (700). Italic variants loaded for 300, 400, 500.
**Rationale:** Ancizar Serif (designed by Universidad Nacional de Colombia) is an open-source scholarly serif with 9 weights. It balances academic authority with everyday readability. Available on Google Fonts with SIL Open Font License. The light weight (300) adds a new option for decorative or large display text.
**Status:** Active

---

### Active State Tokens and Interaction Pattern

**Date/Phase:** Post-v1, interaction polish
**Context:** Interactive components (Button, Checkbox, Select, Modal close) had hover and focus states but no `:active` (pressed) states. Card was the only component with an active state. Missing press feedback makes the UI feel unresponsive.
**Options considered:**
1. CSS-only `color-mix()` darkening on `:active` — no new tokens, but dark mode gets the same darken which often looks wrong
2. Explicit semantic tokens (`primary-active`, `secondary-active`, `destructive-active`) — independent light/dark control
3. Transform-only (`scale(0.98)`) with no color change — fast to implement, but no visual color feedback

**Decision:** Option 2 + transform. Three new semantic tokens:
- `--color-primary-active`: stone.950 (light) / stone.50 (dark) — one step past hover
- `--color-secondary-active`: stone.300 (light) / stone.700 (dark)
- `--color-destructive-active`: brick.700 (light) / brick.400 (dark)

Combined with `transform: scale(0.98)` on buttons/selects, `scale(0.92)` on small controls (checkbox, modal close). Transform disabled via `@media (prefers-reduced-motion: reduce)`.

**Rationale:** Explicit tokens give dark mode independent control — a 10% darken in light mode would be wrong in dark mode. `scale()` over `translateY()` because it works uniformly for all shapes (pills, squares, icon-only). The 0.98/0.92 split: larger elements need less scale change to feel pressed; small elements (13–21px checkboxes) need a bigger ratio to register visually.

**Components affected:** Button (4 variants), Checkbox (unchecked + checked), Select trigger, Modal close button. Input skipped (focus already handles interaction). Badge/Typography skipped (non-interactive). Card already had active state.

**Status:** Active

---

### First Composed Component: ProductCard

**Date/Phase:** Post-v1, product UI phase
**Context:** With 8 primitive components built, we needed to validate the system by composing real product UI rather than continuing to build primitives speculatively. A minimal product card is the first "composed" component — it doesn't add new primitives but composes existing ones (Card, CardImage, Typography).

**Options considered:**
1. Keep building primitives (Radio, Toggle, Textarea) before composing — thorough but risks building things we don't need
2. Jump to composed product UI and backfill primitives as gaps emerge — faster feedback loop
3. Build a full product page first — too ambitious without validating the card pattern

**Decision:** Option 2. Build a minimal ProductCard component that composes Card + CardImage + CardBody + Text. Intentionally minimal: 4:5 image, product name, formatted price. No badge, no button, no footer.

**Key design decisions:**
- **Price as cents (number):** `price={3200}` → `$32.00`. Using `Intl.NumberFormat` for formatting with configurable `currency` prop. Cents avoids floating-point issues.
- **4:5 aspect ratio:** Added to CardImage's `aspectRatio` union type. Works via existing `--card-image-ratio` CSS custom property — no CSS changes needed.
- **`variant="outlined"` + `interactive`:** Outlined cards are cleaner in product grids (no competing shadows). Interactive gives hover lift + image zoom for free.
- **Minimal CSS:** Only overrides `--card-padding` and body gap. Everything else is inherited from Card primitives.

**What this validated:**
- Card's compound API (Card + CardImage + CardBody) composes well for real use cases
- The `noPadding` + `CardBody` pattern works cleanly for image-first layouts
- Typography's `truncate` prop handles long product names
- Token system provides all needed values without new tokens

**Status:** Active

---

### Breakpoint Tokens: CSS Custom Properties + Raw Values in Media Queries

**Date/Phase:** PDP build
**Context:** Adding responsive breakpoints to the design system. CSS custom properties cannot be used inside `@media` query conditions (`@media (min-width: var(--bp))` does not work). The project has no CSS preprocessor.
**Options considered:**
1. PostCSS with `@custom-media` — adds build dependency
2. SCSS variables — requires preprocessor migration
3. CSS custom properties for JS access + raw values with comments in media queries
**Decision:** Option 3 — emit `--breakpoint-*` custom properties in `:root` for JS access and documentation. Use raw pixel values in `@media` with a comment referencing the token name: `/* @breakpoint-lg = 1024px */`
**Rationale:** Zero new build dependencies. The raw-value-with-comment approach is searchable, easy to find/replace if values change, and keeps the zero-preprocessor philosophy. JS constants exported from `@ds/tokens` for programmatic access.
**Status:** Active

---

### PDP Layout: Page-Specific CSS Grid, Not a Generic Component

**Date/Phase:** PDP build
**Context:** Deciding whether to build a reusable `<Grid>` component or a PDP-specific layout.
**Options considered:**
1. Generic `<Grid columns={12}>` / `<GridItem span={6}>` component
2. PDP-specific CSS class with `grid-template-columns: 1.618fr 1fr`
**Decision:** PDP-specific layout. The golden ratio column split (`1.618fr 1fr`) is the defining feature — a generic Grid component would either be too restrictive or too flexible to capture this.
**Rationale:** The PDP layout is a single, well-defined layout. Building a generic Grid for one consumer is premature. If more page layouts emerge, we'll extract a pattern. The `1.618fr 1fr` split gives the image gallery ~62% width and details ~38% — matching φ exactly (verified: 726.8/449.2 = 1.618).
**Status:** Active

---

### New Components: Breadcrumb, QuantitySelector, ImageGallery

**Date/Phase:** PDP build
**Context:** Three new components built to compose the Product Detail Page.

**Breadcrumb:** `<nav aria-label="Breadcrumb">` → `<ol>` → `<li>` items. Last item gets `aria-current="page"`. Separators are `aria-hidden="true"`. Simple data-driven API: `items: BreadcrumbItem[]`.

**QuantitySelector:** Standalone component (not composing Input). `<div role="group">` → decrement button → `<output>` → increment button. Three sizes matching control height tokens. Controlled component with `value`/`onChange`.

**ImageGallery:** Main image with aspect-ratio CSS custom property + thumbnail strip as `role="tablist"`. Keyboard navigation (arrow keys, Home/End). Pointer event swipe support. `thumbnailPosition: 'bottom' | 'left'` with responsive override (always bottom on mobile).

**Status:** Active

---

### Tighten `--line-height-tight` from 1.25 to 1.15

**Date/Phase:** PDP refinement
**Context:** PDP title (42px at desktop) had visually excessive leading at `line-height: 1.25` (52.5px line-height, 10.5px total leading). Same issue observed earlier with ProductCard name/price gaps — line-height inflation creates perceived spacing that doesn't match explicit gap values.
**Options considered:**
1. Tighten `--line-height-tight` globally from 1.25 → 1.15
2. Add a new `--line-height-tighter` token at 1.15, keep tight at 1.25
3. Override only the PDP title with a fixed value
**Decision:** Option 1 — tighten globally
**Rationale:** `tight` is used exclusively for headings (Typography component, Modal title, PDP title). 1.15 is standard for heading line-heights across design systems (Apple HIG uses 1.1–1.2 for display text). The global change improves all heading contexts simultaneously.
**Impact:** 42px font → 48.3px line-height (was 52.5px). 6.3px total leading instead of 10.5px.
**Status:** Active

---

### CI/CD & Code Quality: Full Pipeline + Branch Protection

**Date/Phase:** Post-PDP, workflow maturity
**Context:** Moving from local-only development to a collaborative workflow with automated quality gates. Needed to ensure accessibility standards are enforced automatically and code changes are reviewed before merging.
**Options considered:**
1. Full CI pipeline (lint, typecheck, test, build) + branch protection with required reviews
2. Tests + a11y only in CI, no review gate
3. Manual checks only, formalize later

**Decision:** Full CI pipeline + branch protection with required PR reviews.

**What's in place:**
- **GitHub Actions CI** (`.github/workflows/ci.yml`): Runs on every PR and push to `main`. Steps: `pnpm install --frozen-lockfile` → `turbo build` (packages only) → `turbo lint` → `turbo typecheck` → `turbo test` (includes axe a11y scans). Turbo cache enabled for faster reruns.
- **Branch protection on `main`**: Direct pushes blocked. Requires the "Lint · Typecheck · Test" status check to pass. Requires 1 approving review. Stale reviews dismissed on new pushes.
- **Storybook addon-a11y** (`@storybook/addon-a11y`): Already installed and configured with color-contrast enforcement. Provides real-time a11y panel during development.
- **Repo made public**: Required for branch protection on GitHub Free tier.

**Accessibility enforcement layers (3 total):**
1. **Dev time** — Storybook a11y panel (visual, interactive)
2. **Test time** — `jest-axe` / axe-core in every component's `.test.tsx` (programmatic)
3. **CI time** — `pnpm turbo test` runs all axe tests as a required status check (automated gate)

**Rationale:** Three layers of a11y enforcement means a violation has to slip past development, testing, AND CI to ship. The branch protection + required review ensures no code reaches `main` without passing all checks and being reviewed by another human.
**Status:** Active

---

### New Component: CookieConsent (No Radix)

**Date/Phase:** Post-PDP, ecommerce compliance
**Context:** Ecommerce sites require cookie consent banners for GDPR/CCPA compliance. No existing component in the library and no Radix primitive maps to this pattern.
**Options considered:**
1. Build on Radix Dialog — provides focus trapping and portal, but cookie banners should NOT trap focus (background remains interactive, `aria-modal="false"`)
2. Plain React with forwardRef — full control over behavior, no unnecessary Radix overhead
3. Page-level composition only — not reusable across projects

**Decision:** Option 2 — standalone React component with forwardRef, no Radix dependency. Composes existing `Button` (primary/secondary) and `Checkbox` (sm, with label/hint) components.

**Key design decisions:**
- **Fixed bottom bar** with slide-in/out animation (`translateY(100%)`)
- **Two-phase UX**: Accept All + Preferences → clicking Preferences reveals category toggles with Save Preferences + Reject All
- **Controlled + uncontrolled**: `open`/`onOpenChange` for controlled, `defaultOpen` for uncontrolled (mirrors Modal pattern)
- **All labels customizable** for i18n: `heading`, `description`, `acceptLabel`, `preferencesLabel`, `saveLabel`
- **`categories` optional**: Without it, banner shows simple Accept All / Reject All
- **Essential category**: `required: true` → checkbox checked + disabled
- **`role="dialog"` + `aria-modal="false"`**: Banner doesn't block page interaction
- **`z-index: var(--z-index-toast)`**: Sits above modals (300) but below tooltips (400)
- **Two-phase close**: `closing` state triggers exit animation → `onAnimationEnd` removes from DOM
- **`transform: translateZ(0)` trick** for Storybook/docs: Contains `position: fixed` children within preview containers without polluting the component API

**Status:** Active — updated with accordion-based preferences (see below)

---

### CookieConsent: Accordion-Based Preferences Panel

**Date/Phase:** Component iteration
**Context:** The initial CookieConsent preferences panel used a flat checkbox list. The user wanted a more structured UI with expandable category descriptions, matching common GDPR cookie banner patterns.
**Options considered:**
1. Keep flat checkbox list (simpler, less visual hierarchy)
2. Accordion sections with inline checkboxes (structured, expandable descriptions)
**Decision:** Accordion sections — each of the 4 cookie categories (Strictly Necessary, Functional, Performance, Targeting) gets its own expandable section with a checkbox in the trigger row.
**Rationale:** Accordion provides better information hierarchy — users can scan category names + toggle checkboxes without reading descriptions, but can expand to learn more. Standard pattern for GDPR compliance UIs.
**Implementation details:**
- Uses existing `Accordion` component (`type="multiple"`, `size="sm"`) inside the preferences panel
- **Checkbox placed as sibling of AccordionTrigger**, not inside it — avoids nested interactive elements (button-in-button), which violates WCAG
- Checkbox uses `aria-label={category.label}` since it has no visible label (the label is the AccordionTrigger text)
- 4 action buttons in preferences view: Accept All (primary), Reject All (secondary), Save Preferences (secondary), Close (ghost)
- New props: `rejectLabel`, `closeLabel` for i18n
- Default categories updated to: Strictly Necessary Cookies, Functional Cookies, Performance Cookies, Targeting Cookies
**Gotcha:** Radix Checkbox renders as `<button role="checkbox">` and AccordionTrigger renders as `<button>`. Nesting one inside the other causes `validateDOMNesting` warnings and axe `nested-interactive` + `button-name` violations. Solution: place the Checkbox as a sibling in a flex row wrapper (`ds-cookie-consent__category-row`), not inside the trigger.
**Status:** Active

---

### CookieConsent: Global Heading Style Leak Fix
**Date/Phase:** Component Polish
**Context:** The CookieConsent preferences panel uses Accordion internally, which renders `AccordionPrimitive.Header` as an `<h3>`. On the docs site, global typography styles (`h3 { margin: 24px 0 12px; font-size: 20px; }`) leaked into the accordion header, inflating the category row from 25px to 61px and breaking checkbox vertical alignment.
**Options considered:** (1) Change Accordion to render a `<div>` instead of `<h3>`, (2) Add `!important` to Accordion's header reset, (3) Add scoped overrides in CookieConsent CSS
**Decision:** Initially added scoped override in CookieConsent CSS. Subsequently moved the fix into the Accordion primitive itself (`font-size: inherit` on `.ds-accordion__header`) as part of the No Overrides Rule (see below).
**Rationale:** Primitives must be self-sufficient. The fix belongs in the Accordion, not patched from the outside.
**Status:** Revised — superseded by No Overrides Rule

---

### No Overrides Rule — Block Components Must Never Override Primitive CSS
**Date/Phase:** Component Polish
**Context:** During CookieConsent development, the preferences panel accumulated 8 CSS overrides targeting Accordion and Checkbox internal classes (`.ds-accordion__header`, `.ds-accordion__item`, `.ds-accordion__trigger`, `.ds-checkbox-field`, `.ds-checkbox-box`). These overrides were fixing gaps in the primitives — missing `flush` variant, hover style, label-less checkbox alignment, heading style leak defense.
**Options considered:** (1) Keep overrides scoped to CookieConsent, (2) Move fixes into primitives and use them cleanly
**Decision:** Established a hard rule: block/composed components must NEVER override a primitive's internal CSS classes. If a primitive doesn't support what you need, fix the primitive first. Applied this by:
- **Accordion:** Added `flush` prop (removes outer borders), `font-size: inherit` on header, changed hover from muted color to underline
- **Checkbox:** Default `align-items: center` on field (was `flex-start`), cap-height `margin-top` only applies when `:has(.ds-checkbox-label)`
- **CookieConsent:** Removed all 8 primitive overrides, now uses `<Accordion flush>` and label-less `<Checkbox>` cleanly
**Rationale:** Overrides are invisible contracts that break when primitives refactor. They don't scale — the next composed component would duplicate the same patches. Primitives should handle all common composition cases natively.
**Status:** Active — permanent rule documented in `04-components.md`

---

### Accordion Checkbox Variant — Native Primitive Support
**Date/Phase:** Component Polish
**Context:** CookieConsent composed Accordion + Checkbox by wrapping them in a `.ds-cookie-consent__category-row` flex div. This external composition felt off — the checkbox and trigger were siblings in a block-component wrapper, not part of the accordion's own structure. The layout, spacing, and indentation all depended on the consuming component's CSS.
**Options considered:** (1) Keep external composition in CookieConsent, (2) Build a native checkbox variant into AccordionTrigger
**Decision:** Added optional checkbox props to `AccordionTrigger`: `checked`, `onCheckedChange`, `checkboxDisabled`, `checkboxLabel`. When `checked` is defined, the trigger renders a Checkbox primitive (label-less, `size="sm"`) as a sibling before the Radix trigger button inside a `.ds-accordion__trigger-row` wrapper. Also added:
- **`bordered` prop** on Accordion root — wraps in a bordered/rounded panel container (implies flush)
- **Content indentation** — when checkbox variant is active, content-inner gets `padding-left` matching checkbox width + gap, so expanded text aligns with the trigger text
- **1px underline on hover** — `text-decoration-thickness: 1px` ensures consistent underline weight across all sizes
**Rationale:** Primitives should be self-sufficient. The checkbox-in-accordion pattern is reusable (cookie preferences, notification settings, feature toggles). Moving it into the primitive eliminates external composition complexity and ensures consistent layout.
**Status:** Active

---

### Optical Text Centering: `text-box-trim` as Default Convention
**Date/Phase:** Component Polish
**Context:** Text in fixed-height control components (buttons, badges, inputs, selects) appears vertically off-center because browsers center the full em box, not the visible ink (cap height to baseline). This is especially noticeable with Ancizar Serif at small sizes.
**Options considered:**
1. Manual `padding-top`/`padding-bottom` adjustments per component — fragile, breaks on font change
2. `translateY` nudge on all controls — works but adds transform to elements that may need transforms for other states
3. `text-box-trim: both` + `text-box-edge: cap alphabetic` with `@supports not` fallback — spec-correct, progressive enhancement
**Decision:** Option 3. Apply `text-box-trim: both; text-box-edge: cap alphabetic;` to all fixed-height control components (Button, Badge, Input, Select, QuantitySelector). Add `@supports not (text-box-trim: both)` fallback with `transform: translateY(0.05em)` for unsupported browsers. Fallback combines with existing transforms where needed (Button `:active`, Select `:active`).
**Rationale:** `text-box-trim` is the correct CSS solution to the em-box centering problem. It trims the extra leading so flex centering operates on visible ink bounds. The `@supports not` fallback ensures acceptable rendering in Firefox (which doesn't support the property yet). The `0.05em` offset is font-specific to Ancizar Serif.
**Components affected:** Button (`.ds-button`), Badge (`.ds-badge`), Input (`.ds-input-field`), Select (`.ds-select-trigger`), QuantitySelector (`.ds-quantity-selector__value`)
**Status:** Active

---

### Accordion Bordered Variant
**Date/Phase:** Component Polish
**Context:** The CookieConsent preferences panel needed a bordered container around the accordion (background, border, rounded corners). Previously this was handled by `.ds-cookie-consent__preferences` CSS.
**Options considered:** (1) Keep container styles in CookieConsent, (2) Add a `bordered` prop to Accordion
**Decision:** Added `bordered` prop to Accordion. Applies `padding`, `background-color`, `border`, and `border-radius` directly on the accordion root. Also removes first/last item borders (implies flush behavior).
**Rationale:** Bordered/panel accordion is a reusable pattern for settings panels, preference groups, and embedded FAQ sections. Making it a primitive prop eliminates per-consumer container CSS.
**Status:** Active

---

### Dark Mode Toggle on PDP
**Date/Phase:** Post-component polish, docs site UX
**Context:** Dark mode CSS was fully generated in `tokens.css` (`.dark` and `[data-theme="dark"]` selectors flip all semantic tokens), but no UI existed to activate it. Needed a toggle on the PDP page next to the cart icon.
**Options considered:**
1. React state-driven toggle inside PDPDemo component — only affects PDP content, not header/footer
2. Vanilla JS toggle in FullWidthLayout.astro — affects entire page including Astro-rendered chrome
3. Astro island component for the toggle — more complex, requires hydration
**Decision:** Option 2 — vanilla JS in FullWidthLayout.astro. Inline `<script is:inline>` in `<head>` for flash prevention (reads localStorage before first paint). Click handler toggles `.dark` class on `<html>` and persists to localStorage. Respects `prefers-color-scheme: dark` as default when no stored preference exists.
**Implementation details:**
- Sun/moon SVG icons in a ghost-style button (same dimensions as cart icon)
- CSS `:global(.dark)` scoped selectors toggle icon visibility
- Logo SVG loaded as `<img>` can't use `currentColor`, so `filter: invert(1)` applied in dark mode
- All components use `var(--color-*)` tokens — zero component changes needed
**Status:** Active

---

### Heading: Decoupled `size` and `weight` Props

**Date/Phase:** PDP primitive audit
**Context:** The Heading component coupled semantic level (`as="h1"`) with visual size (h1 → 4xl, h2 → 3xl, etc.). The PDP needed an h1 rendered at 2xl with normal weight — a product title that's semantically the page heading but visually smaller than a marketing hero. PDPDemo.css was forced to override the Heading primitive's font-size and font-weight via `.ds-pdp__title`, violating the "never override primitives" rule.
**Options considered:**
1. Keep the CSS override — pragmatic, but sets a bad precedent
2. Add `size` prop to Heading — decouples visual size from semantic level
3. Add both `size` and `weight` props — full control without overrides
**Decision:** Option 3. Added `size` (xl | 2xl | 3xl | 4xl) and `weight` (normal | medium | semibold | bold) props. Both are optional — `size` defaults to the mapped size for the given `as` level, `weight` defaults to semibold (the base Heading weight). CSS classes changed from `ds-heading--h1` to `ds-heading--4xl` etc.
**Rationale:** Decoupling semantic level from visual size is a common need (product titles, card headings, sidebar headings). The Text component already had `size` and `weight` — Heading should match. The responsive font-size bump (2xl → 3xl at desktop) remains in layout CSS as legitimate layout composition.
**Status:** Active

---

### Optimal Reading Width Convention

**Date/Phase:** 2026-03-15, post-component polish
**Context:** Body text in wider layouts was rendering at uncomfortable line lengths (80+ characters per line), reducing readability.
**Options considered:**
1. Fixed px max-width — breaks when font size or family changes
2. Percentage-based width — depends on container, not content
3. `ch`-based max-width — adapts to font automatically
**Decision:** Constrain all body/paragraph text to `max-width: 65ch` using `ch` units. Applied at three levels: (1) `.ds-text` base class in Typography.css — covers all Text component body copy automatically, only affects block-level renderings since inline elements ignore max-width; (2) raw `<p>` elements in components that don't use Text (FeatureBlock description, CookieConsent description); (3) `.ds-readable-width` utility class for non-component usage.
**Rationale:** 65 characters is the typographic sweet spot for reading comfort (Bringhurst, 45–75ch range). Using `ch` units keeps the constraint relative to the font, so it adapts automatically if type sizes or fonts change. Headings are exempt to maintain visual hierarchy — they can run wider than body text.
**Status:** Active

---

### Content-Width Tokens for Container Max-Widths

**Date/Phase:** 2026-03-15, cookie consent polish
**Context:** The CookieConsent banner was using a hardcoded `max-width: 960px`. Needed a way to constrain content containers (dialogs, overlays, banners) without magic numbers. The primitives-first workflow requires: (1) add token to `tokens.json`, (2) document it on the docs foundation page, (3) then consume it in the component.
**Options considered:**
1. Hardcoded pixel values per component — inconsistent, not reusable
2. A single `--size-content` token — not flexible enough for different contexts
3. Three-tier content-width tokens (sm/md/lg) — covers constrained dialogs through wide page containers
**Decision:** Added `--size-content-sm` (640px), `--size-content-md` (768px), `--size-content-lg` (960px) to the `primitive.size` category in `tokens.json`. Documented on the Spacing foundation page under a "Content widths" section with usage annotations. CookieConsent banner uses `--size-content-sm`.
**Rationale:** Three breakpoints cover the common range: sm for constrained overlays (cookie consent, cookie banners), md for form containers and settings panels, lg for wide page-level containers. Values align with common responsive breakpoints (640/768/960). Adding them as primitives ensures any component can reference them without hardcoding.
**Status:** Active

---

### Cookie Consent — 3-Button Main Dialog + 2-Button Preferences

**Date/Phase:** 2026-03-15, final copy implementation
**Context:** Finalizing the cookie consent UX with approved copy. Needed to decide button layout for the main dialog and the preferences screen.
**Options considered:**
1. Main: Accept All + Decline All (2 buttons, no preferences inline)
2. Main: Manage Preferences + Accept All (2 buttons, decline hidden in preferences)
3. Main: Manage Preferences + Decline All + Accept All (3 buttons — all options visible upfront)
**Decision:** Main dialog shows 3 buttons: Manage Preferences (secondary), Decline All (secondary), Accept All (primary). Preferences screen shows 2 buttons: Back (secondary), Save Preferences (primary). "Back" returns to main dialog without saving or closing the banner.
**Rationale:** Three buttons on the main dialog gives users every option immediately without forcing them into a sub-screen. Keeping the preferences screen to just Back + Save reduces cognitive load when the user is already making granular choices. "Back" (not "Close") makes it clear the banner stays open.
**Status:** Active

---

### Codebase Audit: CSS `font-family` Consolidation Convention

**Date/Phase:** 2026-03-15, codebase audit
**Context:** During a full codebase audit, discovered that 6 component CSS files declared `font-family: var(--font-family-body)` on every child element (~20 redundant declarations total) instead of inheriting from the component root.
**Options considered:**
1. Keep per-element declarations for explicitness
2. Declare once on the component root, let children inherit
3. Declare on `:root` only, remove from components entirely
**Decision:** Option 2 — declare on the component root element, remove from children. Exception: elements rendered in a Radix Portal (Select dropdown items, Modal content) keep their own declaration because they render outside the component's DOM tree and don't inherit.
**Rationale:** CSS inheritance exists specifically for this. Per-element declarations are noise that obscure the styles that actually matter. The Portal exception is the only legitimate case where inheritance breaks.
**Status:** Active

---

### Codebase Audit: Shared Props-Table CSS in `base.css`

**Date/Phase:** 2026-03-15, codebase audit
**Context:** 21 component doc pages each contained an identical `<style>` block (~25 lines) styling the `.props-table` and `kbd` elements. Total: ~525 lines of duplicated CSS across the docs site.
**Options considered:**
1. Keep per-page scoped styles (Astro's default pattern)
2. Move to shared `base.css` imported by `BaseLayout.astro`
3. Create a `PropsTable` Astro component with scoped styles
**Decision:** Option 2 — moved to `base.css`. Removed all 21 `<style>` blocks from component pages.
**Rationale:** The styles were byte-for-byte identical across every page. Scoped styles only make sense when styles vary between pages. Moving to `base.css` eliminates 500+ lines of duplication and ensures any future styling change applies everywhere automatically. Option 3 would be cleaner architecturally but is higher effort for the same result — revisit if the props table markup also needs extraction.
**Status:** Active

---

### Codebase Audit: className Pattern Standardization

**Date/Phase:** 2026-03-15, codebase audit
**Context:** Two components (Input.tsx, Select.tsx) used template literal className construction (`className={`ds-foo${cond ? ' ds-foo--mod' : ''}`}`) while all other components used the array pattern (`[...classes].filter(Boolean).join(' ')`).
**Decision:** Standardized on the array pattern everywhere.
**Rationale:** One pattern across the codebase. The array pattern is more readable for multiple conditionals and consistent with the existing majority convention. Template literals are fine for single classes but diverge from what every other component does.
**Status:** Active

---

### Codebase Audit: Unified Focus Ring Pattern

**Date/Phase:** 2026-03-15, codebase audit
**Context:** Focus rings across the component library used 4 different patterns: `outline` + `outline-offset`, double-layer box-shadow (2px + 4px), 3px solid box-shadow, and 3px color-mix box-shadow. This made the focus experience inconsistent.
**Decision:** Unified all focus rings to `box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-focus-ring) 20%, transparent)`. Accordion uses `inset` variant for full-width triggers. Button primary layers the focus ring with its existing shadow: `box-shadow: var(--shadow-sm), 0 0 0 3px color-mix(...)`.
**Rationale:** Single pattern is easier to maintain and creates a consistent visual language. `color-mix` with 20% opacity creates a soft, accessible ring that works in both light and dark modes. `box-shadow` over `outline` because it respects `border-radius`.
**Components affected:** Button, Card, Header icon buttons, Color Picker, Modal close, Image Gallery thumbnails, Accordion triggers, Checkbox
**Status:** Active

---

### Codebase Audit: Unified Active Press Scale

**Date/Phase:** 2026-03-15, codebase audit
**Context:** Interactive components used two different press scales: `scale(0.98)` for large elements (buttons, select) and `scale(0.92)` for small controls (checkbox, modal close). The 0.92 scale was too aggressive.
**Decision:** Unified all press scales to `transform: scale(0.98)`.
**Rationale:** 0.98 provides subtle but perceptible press feedback for all element sizes. 0.92 was jarring on small controls — the 8% reduction was visually excessive.
**Components affected:** Checkbox, Modal close button (both changed from 0.92 → 0.98)
**Status:** Active

---

### Codebase Audit: Dead Token TS Exports Removed

**Date/Phase:** 2026-03-15, codebase audit
**Context:** `packages/tokens/src/` contained 8 TypeScript files (`colors.ts`, `spacing.ts`, `typography.ts`, `radius.ts`, `shadows.ts`, `transitions.ts`, `zIndex.ts`, `breakpoints.ts`) that exported JavaScript constant mirrors of `tokens.json`. Grep confirmed no actual code imported them — they were dead exports.
**Decision:** Deleted all 8 files. `packages/tokens/src/index.ts` now exports only `export {}` with a comment explaining tokens are consumed via CSS custom properties.
**Rationale:** The design system consumes tokens via `--color-*`, `--spacing-*` CSS variables, not JS imports. The TS exports added maintenance burden (keeping them in sync with `tokens.json`) for zero consumers. If JS access is ever needed, `tokens.json` can be imported directly.
**Status:** Active

---

### Docs: Shared `ComponentPage.astro` Layout Template

**Date/Phase:** 2026-03-15, codebase audit
**Context:** 21 component doc pages followed an identical structure but each duplicated ~40 lines of boilerplate: layout wrapper, prose div, h1, description, installation section, props table markup, and accessibility section. Some pages used "Props" h2 + h3 sub-headings, others used "Props — ComponentName" as separate h2s — inconsistent.
**Options considered:**
1. Keep per-page duplication (simple but ~800 lines of identical boilerplate)
2. Extract a `ComponentPage.astro` layout that wraps BaseLayout and handles structural boilerplate via props + `<slot />`
3. Create separate Astro components for PropsTable and AccessibilitySection only
**Decision:** Option 2. Created `apps/docs/src/layouts/ComponentPage.astro` with props: `title`, `description` (HTML), `installCode`, `props` (array of table definitions with headers + rows), `accessibility` (HTML string array). Feature sections go in the default `<slot />`.
**Rationale:** Each page goes from ~85 lines to ~55 lines. The structural boilerplate (layout, prose wrapper, h1, description, installation, props tables, accessibility) is identical across every page — only the feature sections (galleries, code examples) vary. Using `<slot />` keeps `client:load` directives working naturally. Props tables are now consistently rendered with `<h2>Props</h2>` + `<h3>` sub-headings for multi-table pages. Modal (no props) and Typography (no accessibility) work via optional props.
**Status:** Active

---

### Font-Family Token Rename: Classification → Role-Based

**Date/Phase:** 2026-03-15, codebase audit
**Context:** Font-family tokens used classification-based names (`--font-family-sans`, `--font-family-mono`, `--font-family-serif`) but the values didn't match their names — `--font-family-sans` pointed to Ancizar Serif (a serif font). This made the token naming counterintuitive and misleading. Additionally, `--font-family-serif` had zero usages anywhere in the codebase.
**Options considered:**
1. Keep classification-based names (`sans`/`mono`/`serif`) — familiar from Tailwind but misleading when values change
2. Rename to role-based names (`body`/`code`) — names describe intent, not the font's classification
3. Use generic names (`primary`/`secondary`) — too vague, no semantic meaning
**Decision:** Option 2. Renamed `--font-family-sans` → `--font-family-body`, `--font-family-mono` → `--font-family-code`, deleted unused `--font-family-serif`. Updated `tokens.json`, all 18 CSS files, 6 TSX files, 3 Astro doc pages, and playbook references.
**Rationale:** Role-based naming is industry best practice for design tokens. Token names should describe intent (what the token is *for*) not the current value (what the font *is*). This way, swapping Ancizar Serif for a sans-serif body font in the future won't require renaming every token reference. The `serif` token was dead code with zero consumers.
**Status:** Active

---

### Global Form Element Font Inheritance Reset

**Date/Phase:** 2026-03-15, typography polish
**Context:** `<input>` elements were rendering in the browser's default font (Arial) instead of the design system's Ancizar Serif, even when parent elements had `font-family: var(--font-family-body)`. Browser UA stylesheets override `font-family` on form controls (`<button>`, `<input>`, `<select>`, `<textarea>`).
**Options considered:**
1. Per-component `font-family: inherit` on each form-based component CSS — works but is whack-a-mole
2. Global reset in `tokens.css` — one rule fixes all form elements system-wide
3. Require consumers to add their own CSS reset — shifts the burden
**Decision:** Option 2. Added `button, input, select, textarea { font-family: inherit; }` to the globals section of `build-css.mjs`. Removed per-component `font-family: inherit` from Accordion.css and Input.css.
**Rationale:** A global reset ensures every consumer of `@ds/tokens/css` gets the fix automatically. No future form-based component will ever have this bug. This is a well-known CSS reset pattern (normalize.css includes it) that should have been added from day one.
**Status:** Active

---

### Body Text Line-Height: `relaxed` (1.618) → `snug` (1.375)

**Date/Phase:** 2026-03-15, typography tuning
**Context:** Body text (`Text` component, lg and base sizes) used `--line-height-relaxed` (1.618, the golden ratio). While mathematically elegant, it created excessive vertical spacing between lines in multi-sentence paragraphs — the text felt sparse and disconnected, especially with Ancizar Serif.
**Options considered:**
1. `--line-height-normal` (1.5) — standard web default
2. `--line-height-snug` (1.375) — tighter but still comfortable
3. Keep `--line-height-relaxed` — preserve the golden ratio connection
**Decision:** Option 2 — `snug` (1.375) for both `lg` and `base` sizes. `sm` text retains `--line-height-normal` (1.5) because small text benefits from more leading.
**Rationale:** Tested with realistic paragraph content (3+ sentences of product copy). `relaxed` was noticeably airy — each line felt isolated. `snug` creates cohesive paragraphs while remaining comfortable for extended reading. The golden ratio still lives in the token system for use cases where generous leading is desired (pull quotes, hero text), but it's not the right default for body copy.
**Status:** Active

---

### Heading Letter-Spacing: `tighter` (-0.05em) → `normal` (0em)

**Date/Phase:** 2026-03-15, typography tuning
**Context:** Large display headings (h1/4xl, 54px) used `--letter-spacing-tighter` (-0.05em), which caused visible letter collision on Ancizar Serif. The serif's stroke terminals and decorative elements need more breathing room than a sans-serif at the same size. After trying `tight` (-0.025em) as an intermediate step, it still felt too tight.
**Options considered:**
1. `--letter-spacing-tight` (-0.025em) — half the tightening, still perceptibly tracked in
2. `--letter-spacing-normal` (0) — no tightening at all, let the typeface's natural spacing breathe
3. Create a new font-specific token — over-engineering
**Decision:** Option 2. Removed all negative letter-spacing from headings in both `Typography.css` (component) and `base.css` (docs prose styles). Also scoped prose heading styles to direct children (`.prose > h1`) to prevent leaking into component preview boxes.
**Rationale:** Ancizar Serif's natural spacing works well at all heading sizes without any negative tracking. Serif typefaces have built-in optical spacing from their stroke terminals — forcing them tighter fights the type designer's intent. This is a key lesson: always start with `normal` letter-spacing for serif fonts and only tighten if needed.
**Status:** Active

---

### Foundation Typography Docs: Visual Previews + Semantic Mapping Table

**Date/Phase:** 2026-03-15, documentation completeness
**Context:** The Foundation Typography page showed font families and font sizes with visual previews but presented line heights and letter spacing as raw value tables only. No section documented how typography components combine individual tokens.
**Options considered:**
1. Keep raw tables only — minimal but leaves developers guessing
2. Add visual previews for all categories + a semantic mapping table — comprehensive reference
**Decision:** Option 2. Added: (1) Line height section with two-line paragraph previews at each value, (2) Letter spacing section with "Design System" text previews at each tracking value, (3) Semantic mapping table showing exactly which tokens each typography component variant uses (Heading h1–h4, Text lg/base/sm, Caption, Code).
**Rationale:** Token docs that only show names and values force developers to read component CSS to understand how tokens are combined. The semantic mapping table is the single most useful reference for anyone building layouts — it answers "what does `<Heading as='h2'>` actually apply?" without leaving the docs page.
**Status:** Active

---

### Focus Ring Consolidation: Composite Token over Inline Expressions

**Date/Phase:** 2026-03-15, codebase audit
**Context:** The `color-mix()` focus ring expression was duplicated 14 times across 10 component CSS files (standard, error, and inset variants). Any change to the focus ring style required editing all 14 locations.
**Options considered:**
1. CSS utility class (`.ds-focus-ring`) — requires adding class in TSX, doesn't compose with `box-shadow`
2. Composite CSS custom properties (`--focus-ring`, `--focus-ring-error`, `--focus-ring-inset`) — composes naturally with `box-shadow`, no TSX changes
3. Sass mixin — we don't use a preprocessor
**Decision:** Option 2. Added composite tokens to `build-css.mjs` `:root` block. Each component's `:focus-visible` now references `var(--focus-ring)` instead of the raw expression.
**Rationale:** CSS custom properties compose with `box-shadow` (e.g., `box-shadow: var(--shadow-sm), var(--focus-ring)`) which a utility class cannot do. The inset variant (`--focus-ring-inset`) handles Accordion's inset ring. Zero TSX changes required.
**Status:** Active

---

### StarRating: useId() for SVG clipPath Uniqueness

**Date/Phase:** 2026-03-15, codebase audit
**Context:** `StarRating` used a hardcoded `id="ds-star-half"` for the SVG clipPath. Multiple instances on the same page (e.g., PDP with product rating + review ratings) would share the same ID, breaking half-star rendering on all but the first instance.
**Decision:** Use React `useId()` in the parent `StarRating` component to generate a unique clipPath ID per instance.
**Rationale:** `useId()` is SSR-safe and generates deterministic IDs. Generated at the parent level (not inside `StarIcon`) because there's at most one half-star per rating.
**Status:** Active

---

### Remove !important from Reduced-Motion Overrides

**Date/Phase:** 2026-03-15, codebase audit
**Context:** `Button.css` and `Card.css` used `!important` in `@media (prefers-reduced-motion: reduce)` blocks to override active-state transforms. The `!important` was a specificity shortcut, not a necessity.
**Decision:** Remove `!important` by (1) matching the specificity of the rules being overridden (e.g., `.ds-button:active:not(:disabled)` instead of `.ds-button:active`), and (2) placing the `@media` block at the end of the file so cascade order wins for equal-specificity rules.
**Rationale:** `!important` is a code smell in a design system — it signals a specificity problem. Restructuring cascade order is the correct fix and prevents future rules from needing `!important` escalation.
**Status:** Active

---

### Demo Files: Shared Utility CSS + Token-Based Inline Styles

**Date/Phase:** 2026-03-15, codebase audit
**Context:** 60+ inline styles across story and gallery files used raw pixel values (`gap: '12px'`, `fontWeight: 600`) instead of design tokens. Common patterns (unstyled links, cover images) were duplicated as inline styles across multiple demo pages.
**Decision:** (1) Created `apps/docs/src/styles/demo-utilities.css` with shared utility classes (`.ds-unstyled-link`, `.ds-demo-cover-image`). (2) Converted all hardcoded pixel values in inline styles to token references.
**Rationale:** Demo files should demonstrate the token system, not bypass it. Developers copying story code should get token-based patterns by default. Container/decorator widths remain as inline styles since they're test harness constraints, not reusable patterns.
**Status:** Active

---

### Full Codebase Audit — Token Integrity and Code Quality Pass

**Date/Phase:** 2026-03-15, refactoring audit
**Context:** Comprehensive audit of all component CSS, TSX, docs site, stories, and token system to identify overrides, dead code, hardcoded values, and inconsistencies.
**Options considered:** (1) Incremental fixes as issues surface. (2) Full audit with systematic refactoring.
**Decision:** Full audit. Key fixes applied:
- **Critical bug:** Transition token naming mismatch — Accordion.css and CookieConsent.css referenced `--transition-timing-ease-out/in` but tokens generate `--transition-easing-out/in`. Silent failure.
- **Hardcoded easing:** Select.css used bare `ease-out` instead of `var(--transition-easing-out)`.
- **Gallery refactor:** Replaced raw `<p>` elements with `<Text>` components, extracted repeated inline styles to utility CSS classes (`.ds-demo-slide-image`, `.ds-demo-prose`, `.ds-demo-section-label`).
- **Story cleanup:** Replaced hardcoded `fontSize: '11px'` and `letterSpacing: '0.08em'` with token references in ColorSwatch and Checkbox stories.
- **Import consolidation:** Merged fragmented `@ds/components` imports in CollectionDemo and CartDemo.
- **Preview.css:** Replaced hardcoded `0.7rem` and `4px 10px` with token references.
**Rationale:** CSS custom properties fail silently. Periodic audits are the only way to catch drift between token names and their consumers. Establishing this as a practice prevents accumulation of technical debt.
**Status:** Active

---

### CookieConsent Preferences Panel: Remove Fixed max-height

**Date/Phase:** Polish pass
**Context:** The CookieConsent preferences panel had `max-height: 260px` (desktop) / `200px` (mobile) with `overflow-y: auto`, forcing a scrollbar when the bordered accordion inside it exceeded that height. The user wanted the banner to grow naturally to fit its content.
**Options considered:**
1. Increase the fixed max-height to a larger value
2. Remove max-height entirely, let the panel auto-size
3. Use a viewport-relative max-height as a safety cap
**Decision:** Option 2 on desktop (no max-height), option 3 on mobile (`max-height: 50vh` with `overflow-y: auto` as a safety cap to prevent the banner from covering the entire mobile screen).
**Rationale:** A fixed pixel max-height is arbitrary and doesn't adapt to content. The accordion is the natural height constraint — it only has as many items as the site defines. On mobile, viewport height is limited, so a 50vh cap prevents the banner from becoming unusable while still being generous.
**Status:** Active

---

### Modal Overlay: `--color-overlay` Composite Token

**Date/Phase:** Polish pass
**Context:** Modal.css used `color-mix(in srgb, var(--color-foreground) 40%, transparent)` for the overlay background. The `40%` was a hardcoded magic number. The token system already has `--opacity-medium: 0.382` (≈38.2%, derived from 1/φ).
**Options considered:**
1. Replace 40% with `calc(var(--opacity-medium) * 100%)` inline
2. Add a `--color-overlay` composite token in the build script
**Decision:** Option 2 — added `--color-overlay` as a composite token in `build-css.mjs`, using `38.2%` (the φ-derived opacity value). Modal.css now references `var(--color-overlay)`.
**Rationale:** A named composite token is self-documenting and reusable. Any future component needing an overlay (drawers, lightboxes) references the same token. The 38.2% value aligns with the system's golden-ratio-derived opacity scale rather than an arbitrary 40%.
**Status:** Active

---

### Token Doc Pages: Shared CSS Extraction

**Date/Phase:** Polish pass
**Context:** The three token documentation pages (colors.astro, spacing.astro, typography.astro) each had duplicated `<style>` blocks containing identical styles for `.scale-badge`, `.section-desc`, `.token-table` base, `.token-name code`, `.token-usage`, `.token-size-info`, and `.token-value`.
**Options considered:**
1. Leave duplication in place (it's just docs)
2. Extract shared styles to a CSS file imported in each page
**Decision:** Option 2 — created `apps/docs/src/styles/token-docs.css` with all shared styles. Each Astro page imports it via frontmatter (`import '../../styles/token-docs.css'`) and retains only page-specific styles in its `<style>` block.
**Rationale:** Even in documentation, DRY matters. Three copies of identical styles means three places to update when the design evolves. The import pattern is idiomatic Astro and keeps each page's `<style>` block focused on what's unique to that page.
**Status:** Active

---

### Page Templates: Documented as Design System Specs, Not Shopify Templates

**Date/Phase:** Page template design
**Context:** Needed to establish core e-commerce page templates (PLP, Search, Account/Login, Terms & Conditions, Sale). Had to decide whether to build these as Shopify-ready Liquid templates or as design-system-level composition specs.
**Options considered:**
1. Build directly as Shopify Liquid templates with embedded design tokens
2. Document as token-driven page compositions in the design system, then hand off to Shopify theming
**Decision:** Option 2 — documented in `docs/playbook/08-page-templates.md` as composition specs with Shopify integration notes per page.
**Rationale:** The design system should be platform-agnostic at the composition level. By specifying pages in terms of component composition, token references, and responsive behavior — then adding Shopify-specific notes as a separate concern — the specs remain useful even if the storefront platform changes. The Shopify notes flag friction points (e.g., rich text HTML styling vs. component rendering) without coupling the design to Liquid syntax.
**Status:** Active

---

### Sale Page: Reuse PLP Composition Rather Than Separate Template

**Date/Phase:** Page template design
**Context:** The Sale page shares 90%+ of PLP structure. Deciding whether to create a distinct page composition or document it as a PLP variant.
**Options considered:**
1. Full separate page spec
2. Document as PLP variant with a delta table showing what changes
**Decision:** Option 2 — documented as a PLP variant in `08-page-templates.md` with an explicit "What Changes vs. PLP" table.
**Rationale:** Composition over invention. Duplicating the entire PLP spec for the Sale page would create a maintenance burden — any grid/spacing change would need updating in two places. The delta approach makes it clear that Sale inherits PLP behavior and only modifies header treatment, badge display, and price rendering.
**Status:** Active

---

### Account Page: Three Views as States, Not Separate Pages

**Date/Phase:** Page template design
**Context:** Login, Register, and Forgot Password could be separate pages or states of a single page composition.
**Options considered:**
1. Three separate page templates
2. One page with three view states
**Decision:** Option 2 — single page composition with Login, Register, and Forgot Password as distinct states sharing the same centered card container.
**Rationale:** All three views share identical layout (centered card, same max-width, same padding). Treating them as states of one composition reduces duplication and matches the common SPA pattern where view switching is client-side. Shopify can still render them as separate templates if needed — the design spec is state-based, the routing is an implementation detail.
**Status:** Active

---

### Terms Page: Prose Styling Class Over Component-Per-Element

**Date/Phase:** Page template design
**Context:** Terms & Conditions content comes from a CMS rich text editor as raw HTML. Deciding how to style it.
**Options considered:**
1. Render each element as a design system component (`Heading`, `Text`, etc.)
2. Create a `.ds-prose` / `.ds-legal-content` wrapper class that styles native HTML elements using tokens
**Decision:** Option 2 — documented a `.ds-legal-content` class approach that maps `h1`–`h3`, `p`, `a`, `ul`, `ol`, `li` to token-driven styles.
**Rationale:** CMS rich text output is raw HTML — you can't wrap every `<p>` in a `<Text>` component at the Shopify template level. The prose class approach is the standard pattern (Tailwind Typography, GitHub Markdown) and works with any CMS output. It's also reusable across all content pages (About, FAQ, Privacy Policy).
**Status:** Active

---

### Pagination: Flagged as Component Gap, Not Yet Built

**Date/Phase:** Page template design
**Context:** PLP, Search Results, and Sale pages all need pagination. No pagination component exists.
**Options considered:**
1. Build a Pagination component immediately
2. Document the gap with a proposed API and defer building
**Decision:** Option 2 — documented in the token gap report with proposed `PaginationProps` interface.
**Rationale:** Page template documentation is a design exercise, not an implementation sprint. The proposed API (currentPage, totalPages, onPageChange, maxVisible) is specific enough to build from without further design decisions. Building it is a separate task that should follow the standard component workflow (4-file rule, tests, stories, docs).
**Status:** Resolved — Pagination component built (see "Pagination: Dual-Mode Rendering" entry)

---

### Product Grid System: Unified Gaps + Fluid Cards

**Date/Phase:** Grid system establishment
**Context:** The collection grid had three problems: (1) gap tokens escalated across every breakpoint (`spacing-4` → `spacing-5` → `spacing-6`), creating subtle visual inconsistency; (2) `spacing-5` (20px) at the tablet breakpoint is an awkward step on the 4px base grid; (3) ProductCard had a fixed `width: 220px` that prevented cards from filling CSS Grid cells, producing uneven whitespace that compounded the gap issue.
**Options considered:**
1. Single gap token across all breakpoints (fully uniform)
2. Two-tier gap: same token for mobile + tablet, step up at desktop
3. Keep three-tier escalation but fix to cleaner tokens
**Decision:** Option 2 — `spacing-4` (16px) for mobile and tablet, `spacing-6` (24px) at desktop (≥1024px). Added `fluid` prop to ProductCard so cards fill their grid cell (`width: 100%`).
**Rationale:** A single 16px gap felt too tight at desktop with 4 columns and wide content area. Two tiers (16px → 24px) gives breathing room at desktop without the jarring three-step escalation. Row-gap and column-gap always use the same token at each breakpoint to keep horizontal and vertical rhythm unified — differentiation would require a deliberate design reason. The `fluid` prop keeps ProductCard backward-compatible: standalone usage keeps the fixed 220px width, but grid contexts opt into fluid behavior.
**Status:** Active

---

### Container Max-Width Token: `size-content-xl`

**Date/Phase:** Grid system establishment
**Context:** Header, Footer, and FullWidthLayout main all hardcoded `max-width: 1280px`. This violated the "no raw values" token rule and made the container width untrackable.
**Options considered:**
1. Add a new `size-content-xl: 1280px` token
2. Reuse the `breakpoint-xl: 1280px` token for max-width
**Decision:** Option 1 — new `size-content-xl` token added to the `size` category.
**Rationale:** Breakpoint tokens describe media query thresholds; size tokens describe dimensional constraints. These are semantically different even when the values coincide. If we later change the container max-width to 1200px, we shouldn't have to touch breakpoint definitions. All three hardcoded `1280px` references (Header, Footer, FullWidthLayout) were replaced with `var(--size-content-xl)`.
**Status:** Active

---

### Layout Primitives: Grid + Container Components

**Date/Phase:** Grid system establishment
**Context:** The design system had no formal layout primitives. Container patterns (max-width + centering + responsive horizontal padding) were duplicated across Header, Footer, and FullWidthLayout. Grid layouts were built ad-hoc in each demo component's CSS. This made it hard for consumers to build new pages without copy-pasting layout boilerplate.
**Options considered:**
1. CSS utility classes (`.ds-grid--cols-2`, `.ds-grid--gap-4`) — composable but breaks BEM convention
2. React components with typed props — matches existing component patterns, provides autocomplete
3. A single `layout/` folder with both Grid and Container — simpler structure
4. Separate `grid/` and `container/` folders following the 4-file rule
**Decision:** React components (option 2) in separate folders (option 4). Grid uses CSS custom properties for column/gap overrides set via inline styles from props. Container uses BEM modifier classes for size variants.
**Rationale:** React components match the existing pattern (Card, Badge, etc.) and give consumers type safety + autocomplete. CSS custom property overrides for Grid avoid combinatorial explosion of modifier classes (6 cols × 4 breakpoints = 24 classes). Separate folders follow the 4-file rule strictly — deviating for "these are just utilities" would erode the convention. Container provides only horizontal padding (no vertical) because every existing consumer uses different vertical padding.

**Grid defaults:** 1 → 2 → 3 → 4 columns across sm/md/lg breakpoints. Gap: `spacing-4` (16px) at mobile/tablet, `spacing-6` (24px) at desktop. Overridable via `cols`, `colsSm`, `colsMd`, `colsLg`, and `gap` props.

**Container defaults:** `size-content-xl` (1280px) max-width. Horizontal padding: `spacing-4` → `spacing-8` → `spacing-16`. Size variants: sm (640px), md (768px), lg (960px), xl (1280px), fluid (no max-width).

**Migration:** CollectionDemo migrated to use `<Grid>`. Header, Footer, and FullWidthLayout migration deferred to follow-up PRs (non-breaking).
**Status:** Active

---

### Badge WCAG 2.1 AA Accessibility Remediation

**Date/Phase:** Component hardening — accessibility audit
**Context:** Badge component failed multiple WCAG 2.1 criteria. The `color-mix(in srgb, … 8%, transparent)` approach for status badge backgrounds and `color-mix(… 18%, transparent)` borders produced contrast ratios well below thresholds. Warning text (amber.600 on tinted background) measured 4.22:1 (needs 4.5:1). Outline text (stone.500 on white) measured 4.07:1. All status borders measured ~1.3:1 (needs 3:1). No focus ring, no semantic roles, and color was the only status differentiator.
**Options considered:**
1. Increase `color-mix` percentages to raise contrast — tested up to 50%, still failed 3:1 for borders
2. Switch to solid primitive backgrounds (50-shade) with 600/700-shade text and solid semantic borders
3. Switch to fully solid status badges (600-shade background, white text) — too visually heavy
**Decision:** Option 2 — solid primitive 50-shade backgrounds, darker text, solid semantic-color borders. Added new semantic tokens `*-subtle` for backgrounds. Added dark-mode CSS overrides where primitives don't adapt. Added `icon` prop, `role="status"`, `count` + `aria-label` support.
**Rationale:** The `color-mix` with `transparent` approach is fundamentally flawed for accessibility — it produces sub-1px alpha layers that cannot achieve sufficient contrast at any reasonable percentage. Solid colors from the existing scale (50 shades for backgrounds, 700 shades for text, 600 shades for borders) pass all thresholds with room to spare. This required 3 new semantic tokens (`success-subtle`, `warning-subtle`, `destructive-subtle`) and dark-mode overrides in the component CSS (first component to need them — the semantic token layer doesn't yet cover all status variant use cases).
**Status:** Active

---

### Token Integrity Audit — Eliminate Primitive Color References in Components

**Date/Phase:** Component hardening — token audit
**Context:** Several components were consuming primitive palette tokens (`--color-sage-700`, `--color-amber-700`, `--color-brick-400`, `--color-stone-600`) or hardcoded pixel values (`1280px`, `36px`) directly instead of semantic design tokens. This breaks the theming contract: if a consumer overrides semantic tokens, these primitive references won't respond.
**Options considered:**
1. Leave primitives in place with comments documenting why — avoids token proliferation
2. Add targeted semantic tokens for each gap and update components — ensures full theming support
**Decision:** Option 2 — added five new semantic tokens:
- `--color-success-foreground` (sage.700 light / sage.400 dark) — text on success-subtle backgrounds
- `--color-warning-foreground` (amber.700 light / amber.400 dark) — text on warning-subtle backgrounds
- `--color-foreground-secondary` (stone.600 light / stone.300 dark) — fills the gap between foreground-subtle and foreground
- `--size-touch-target` (36px) — minimum WCAG touch target for icon buttons
Also replaced Footer.css hardcoded `1280px` with `var(--size-content-xl)`.
**Rationale:** Components should never reference primitive palette tokens. Every color and size used in a component must flow through a semantic token so themes can override them. The destructive badge dark mode uses `--color-destructive-hover` (brick.400) which is semantically close enough to avoid a new token. The `foreground-secondary` token closes the documented token gap between foreground-subtle (stone.500) and foreground (stone.950).
**Status:** Active

---

### Layout Spec Documentation Page
**Date/Phase:** Component documentation
**Context:** Grid and Container components existed but had no documented usage spec. Example pages used inconsistent grid patterns — Collection used the Grid component, but Sale and Search had manual CSS grids with 3-tier gap escalation (spacing-4→5→6). The Homepage carousel had fixed-width 220px product cards creating massive gaps on desktop. With a Shopify theme build upcoming, a canonical layout reference was needed.
**Options considered:**
1. Document Grid and Container as separate component pages — follows existing pattern but fragments the layout story
2. Create a single Layout spec page under Foundation — treats layout as a system-level concept alongside Colors, Typography, Spacing
**Decision:** Option 2 — a single `/tokens/layout` page documenting breakpoints, Container, product Grid, two-column layouts, section spacing, carousel, and Shopify theme mapping. Also migrated Sale/Search pages to Grid component and fixed Homepage carousel cards to use `fluid` prop.
**Rationale:** Layout is foundational, not a component. A single reference page is more useful for page builders than scattered component docs. The Shopify mapping table makes this directly actionable for theme development.
**Status:** Active

---

### Refactor Audit — New Example Pages (Account, Sale, Search, Terms)

**Date/Phase:** Polish pass — post-addition audit
**Context:** Four new example pages were added (Account, Sale, Search, Terms) along with Grid, Container, Badge enhancements, and a Layout spec doc page. Ran a full audit on all new/modified files to check for token compliance and pattern consistency.
**Findings:** Code quality was 95%+ across the board. Only two issues:
1. TermsDemo.tsx used raw `<h3>` elements instead of `<Heading as="h3" size="lg">` — inconsistent with the rest of the component which used `<Heading>` for h1/h2
2. layout.astro had `letter-spacing: 0.05em` hardcoded in scoped styles instead of `var(--letter-spacing-wider)`
**Decision:** Fixed both. All other new files (AccountDemo, SaleDemo, SearchDemo, Grid, Container, Badge) passed audit with no issues.
**Status:** Active

---

### Disabled State Opacity — Standardize to Token

**Date/Phase:** Full codebase refactor
**Context:** Four components (Button, Checkbox, Input, Select) used hardcoded `opacity: 0.5` for disabled states. QuantitySelector already used `var(--opacity-medium)`. The hardcoded value was close to `--opacity-medium` (0.382) but not identical, and violated the "no magic numbers" convention.
**Options considered:**
1. Keep `0.5` — familiar default, but diverges from the φ-derived opacity scale
2. Use `var(--opacity-medium)` (0.382) — aligns with the system's golden ratio governance
**Decision:** Standardized all disabled states to `var(--opacity-medium)`. The visual change is subtle (50% → 38.2%) but the consistency gain is significant — every disabled element now uses the same token.
**Rationale:** Token compliance matters more than matching arbitrary browser defaults. The 0.382 value comes from 1/φ² and is consistent with how the system derives opacity values.
**Status:** Active

---

### Deprecated clip → clip-path in sr-only

**Date/Phase:** Full codebase refactor
**Context:** PriceDisplay.css used `clip: rect(0, 0, 0, 0)` in the `.ds-sr-only` class. The `clip` property is deprecated in CSS.
**Decision:** Replaced with `clip-path: inset(50%)` — the modern equivalent.
**Status:** Active

---

### Shared Results Header Pattern (demo-utilities.css)

**Date/Phase:** Full codebase refactor
**Context:** Collection, Search, and Sale demos all had identical header-row CSS (flex column → responsive row at md breakpoint). ~18 lines duplicated across 3 files.
**Options considered:**
1. Leave as-is — each demo owns its own styles
2. Extract to shared `.ds-results-header` pattern in demo-utilities.css
**Decision:** Extracted to `.ds-results-header`, `.ds-results-header__row`, and `.ds-results-header__sort` in `demo-utilities.css`. Removed duplicate CSS from all 3 demo files and updated TSX class references.
**Rationale:** The pattern was byte-for-byte identical. Three files importing a shared class is simpler than three files each defining the same rules.
**Status:** Active

---

### Gallery Inline Styles → CSS Classes

**Date/Phase:** Full codebase refactor
**Context:** CardGallery, InputGallery, SelectGallery, and AccordionGallery used extensive inline `style={{ }}` attributes for widths, margins, and typography. This violated the convention of CSS classes over inline styles.
**Decision:** Created gallery utility classes in demo-utilities.css (`.ds-gallery-card`, `.ds-gallery-input`, `.ds-gallery-select`, `.ds-gallery-full`, `.ds-gallery-label`, `.ds-gallery-product-meta`). Replaced all inline styles in gallery components with class references.
**Status:** Active

---

### ViewportIndicator — Inline Styles to CSS

**Date/Phase:** Full codebase refactor
**Context:** ViewportIndicator component had 20+ inline style properties and hardcoded hex colors (#E07060, #D4A040, #5E8F50) for the breakpoint status dot. The hex values happened to match brick, amber, and sage palette colors but weren't using tokens.
**Decision:** Moved all styles to `.ds-viewport-indicator` CSS class in demo-utilities.css. Replaced hex colors with `var(--color-destructive)`, `var(--color-warning)`, `var(--color-success)` semantic tokens.
**Rationale:** Even developer tools should use the design system. The semantic tokens also mean the indicator dot colors adapt to dark mode automatically.
**Status:** Active

---

### Page-Level Spacing Convention

**Date/Phase:** Full codebase refactor
**Context:** Example pages used inconsistent spacing systems. Homepage and PDP used phi-scale tokens for section gaps. Collection was mixed. Cart used only standard-scale tokens. This created different visual rhythms across pages that should feel like the same design system.
**Options considered:**
1. Standardize everything to standard scale — simpler but loses the editorial quality
2. Standardize everything to phi scale — more beautiful but harder to reason about
3. Convention: phi for section-level gaps, standard for component internals — clear rule, best of both
**Decision:** Option 3. Updated Cart to use phi tokens for major section gaps (`spacing-phi-13` mobile, `spacing-phi-21` desktop). Component-internal spacing stays on standard scale.
**Rationale:** Phi spacing creates the "designed, not default" feeling at page level. Standard 4px grid keeps component internals predictable. The rule "never mix scales within the same component" prevents confusion.
**Status:** Superseded by Layout Grid System (section rhythm now uses `--spacing-16` / 64px standard scale for consistency across all pages)

---

### Layout Grid System

**Date/Phase:** 2026-03-16
**Context:** Components looked good in isolation but page previews had inconsistent column widths, gutters, and section spacing because there was no standardized layout system. Each page rolled its own grid with different approaches: PDP used `1.618fr 1fr`, Cart used the same, Collection relied on the Grid component alone, and Homepage used flexbox. Section spacing varied between phi-34 (68px), phi-21 (42px), and phi-13 (26px) across pages.
**Options considered:**
1. CSS Grid with fixed columns — rigid but predictable
2. Flexbox-based layout — flexible but harder to enforce consistent column ratios
3. 12-column CSS Grid with golden ratio splits and consistent gutter/section tokens — best of both
**Decision:** Option 3. 12-column CSS Grid inside a 1200px max-width container, with column split utilities (halves, golden 7+5, reverse golden, thirds, quarters, wide+narrow 8+4, full). Gutters use `--spacing-6` (24px), section rhythm uses `--spacing-16` (64px). No full-bleed sections. All multi-column layouts collapse to single column below 768px.
**Rationale:** 12 columns divide cleanly into halves (6+6), thirds (4+4+4), quarters (3+3+3+3), and approximate the golden ratio (7/12 ≈ 0.583). Using existing spacing tokens for gutters and section rhythm ensures the layout system inherits the same proportional DNA as the rest of the design system. Single container width eliminates inconsistency. The grid is implemented as CSS utility classes in `packages/components/src/layout-grid/layout-grid.css`, separate from individual components, so any page can reference it.
**Status:** Active

---

### Prose Content Alignment: Left-Aligned, Not Centered

**Date/Phase:** 2026-03-16
**Context:** Long-form prose pages (Terms, Privacy, About, FAQ) used `.ds-legal-content` with `max-width: var(--size-content-md)` (~768px) and `margin: 0 auto`, centering the narrow prose column inside the 1200px page container. This caused body text to be visually indented from the header and footer edges — a misalignment visible when drawing vertical lines from the logo down through the content.
**Options considered:**
1. Left-align the prose column (`margin: 0`) — keeps readable line length, aligns with header
2. Keep centered — common pattern for legal pages, but breaks visual alignment with header/footer
3. Remove max-width entirely — aligns edges but creates uncomfortably long lines (~120+ chars)
**Decision:** Option 1. Changed `margin: 0 auto` to `margin: 0` on `.ds-legal-content`. Applied to all prose pages using this class.
**Rationale:** In a design system where header, body, and footer share a 1200px/48px container, centered narrow columns create a visual disconnect. Left-aligning the prose column preserves the readable ~768px measure while maintaining edge alignment with the rest of the page. The right side simply has open space — which is fine and actually gives the content room to breathe.
**Status:** Active

---

### ProductCard API Refinement: renderPrice, badge, and hoverImage Props

**Date/Phase:** 2026-03-16
**Context:** ProductCard had a rigid API that forced consumers to use brittle CSS overrides for common ecommerce patterns. The SaleDemo page hid the default price via `display: none` and positioned a badge overlay using a wrapping div — a pattern that breaks accessibility, couples to internal class names, and is invisible to maintainers. The component also lacked support for secondary hover images, a standard ecommerce product grid pattern.
**Options considered:**
1. `renderPrice` render prop vs `children` slot for price customization — render prop preserves the component's structured API while giving full control over price display; children slot would require callers to reimplement name + price layout
2. Built-in badge slot vs external wrapper — slot keeps the positioning logic inside the component; external wrapper duplicates positioning code across every consumer
3. Secondary `hoverImage` prop vs image array — single prop is simpler and covers the dominant use case (two images); an array would add complexity for a rare need
**Decision:** Added three new props: `renderPrice?: (price, currency) => ReactNode` for custom price rendering, `badge?: ReactNode` for positioned image overlays, `hoverImage?: string` for hover image swap. Also tightened CardBody padding (removed asymmetric right padding, reduced top spacing) and added `font-weight: medium` to price for better hierarchy.
**Rationale:** Render prop pattern is the standard React approach for slot customization — it passes the raw price/currency values so consumers can format however they want while the component retains layout ownership. Badge slot eliminates the wrapper-div-with-absolute-positioning pattern that was duplicated in SaleDemo. Hover image uses CSS opacity transitions with `prefers-reduced-motion` support. These changes removed the `display: none` CSS hack from SaleDemo entirely.
**Status:** Active

---

### PDP Grid Split: Golden (7+5) over Wide+Narrow (8+4)

**Date/Phase:** 2026-03-16
**Context:** The PDP page needed a two-column layout (gallery + details). Two grid splits were candidates: golden (7+5, ratio ≈ 0.583) and wide+narrow (8+4, ratio ≈ 0.667). A toggle was added temporarily so both could be compared side-by-side in the browser.
**Options considered:**
1. Golden 7+5 — gallery gets 58% of space, details get 42%
2. Wide+narrow 8+4 — gallery gets 67% of space, details get 33%
**Decision:** Golden (7+5). Toggle removed, `ds-layout--golden` hardcoded on the PDP.
**Rationale:** The 7+5 split gives the details column enough breathing room for options (size selector, color picker, quantity), the Add to Bag button, and the accordion — without feeling cramped. The 8+4 split pushed the details column too narrow at common viewport widths.
**Status:** Active

---

### Token Compliance Audit: Docs Site Inline Styles → Shared CSS Classes

**Date/Phase:** 2026-03-16
**Context:** Full audit of the monorepo revealed the component library (`packages/components/`) had 100% token compliance across all 25 component CSS files. However, the documentation site (`apps/docs/`) had ~10 categories of non-compliance: hardcoded `max-width` values in CSS, inline styles in gallery components, duplicate utility functions, and missing CSS classes for repeated layout patterns.
**Options considered:**
1. Leave docs site as-is (it's "just demos") — rejected because the docs site is the reference example of how to use the system
2. Fix inline styles by adding CSS classes to each gallery component's own file — rejected because the patterns repeat across many files
3. Create shared utility classes in `demo-utilities.css` and replace inline styles — chosen
**Decision:** Created 6 shared gallery utility classes (`.ds-gallery-stack`, `.ds-gallery-stack--lg`, `.ds-gallery-row`, `.ds-gallery-row--lg`, `.ds-gallery-constrained`, `.ds-gallery-constrained--md`) in `demo-utilities.css`. Replaced hardcoded `max-width: 480px` → `var(--size-modal-md)` in HomepageDemo.css, `max-width: 800px` → `var(--size-content-md)` in base.css. Replaced inline styles in 7 gallery components with shared classes. Deduplicated `makePlaceholder` in ImageGalleryGallery.tsx.
**Rationale:** The docs site should exemplify the same token discipline as the component library. Shared utility classes eliminate repeated inline flex/gap/maxWidth patterns. Acceptable exceptions: CookieConsentGallery's `BannerContainer` minHeight (containment hack for fixed-position component), ProductCardGallery's `renderPrice` inline styles (render prop demo showing consumer-facing API — all values use tokens), and placeholder hex colors (content data, not styling).

---

### Section Spacing Consolidation: `--spacing-16` (64px) as Canonical Section Rhythm

**Date/Phase:** 2026-03-16, token ambiguity resolution
**Context:** Two values competed for "space between major page sections": `--spacing-phi-34` (68px, Fibonacci × 2) from the phi scale and `--spacing-16` (64px) from the standard 4px grid. The layout grid system (`.ds-section`) already used `--spacing-16` and was applied to all 4 example pages, but `08-page-templates.md` still referenced `--spacing-phi-34` in several places (PLP empty state padding, Account page padding, Sale banner margin).
**Options considered:**
1. Standardize on `--spacing-phi-34` (68px) — preserves φ derivation but conflicts with the implemented grid system
2. Standardize on `--spacing-16` (64px) — matches the implemented `.ds-section` class and keeps section rhythm on one consistent scale
**Decision:** Option 2. `--spacing-16` (64px) via `.ds-section` is the canonical section rhythm. Updated all `--spacing-phi-34` section-level references in `08-page-templates.md` to `--spacing-16`. Updated `--spacing-phi-13` references used as element-to-element gaps to `--spacing-6` (24px, the nearest standard value).
**Rationale:** The layout grid system is already implemented and tested on all pages. Keeping section rhythm on the standard 4px grid means the entire page structure uses one scale. The 4px difference (68→64) is visually imperceptible but eliminates scale mixing at the page level.
**Status:** Active

---

### Container Width Clarification: `--size-content-xl` (1280px) vs `.ds-page-container` (1200px)

**Date/Phase:** 2026-03-16, token ambiguity resolution
**Context:** Two container widths existed: `--size-content-xl` (1280px) used by Header, Footer, and the Container component, and `.ds-page-container` (1200px) used by the layout grid for page content. A developer reaching for `--size-content-xl` for a page max-width would get the wrong value.
**Options considered:**
1. Change `--size-content-xl` to 1200px — creates a single value but Header/Footer lose their intentionally wider containment
2. Keep both values and document the distinction clearly
**Decision:** Option 2. `--size-content-xl` stays at 1280px for full-width shell elements (Header, Footer). `.ds-page-container` (1200px) is the only correct way to constrain page content. Added explicit warnings in `03-tokens.md` and `09-layout-grid.md`: "For page content max-width, always use `.ds-page-container` (1200px), never `--size-content-xl`."
**Rationale:** These serve different purposes. The page container at 1200px gives cleaner 12-column grid math. The shell elements at 1280px provide slightly wider containment to frame the narrower content area. Collapsing them to one value would either break the grid math or unnecessarily narrow the header/footer.
**Status:** Active

---

### Phi vs Standard Spacing: Clear Usage Boundaries

**Date/Phase:** 2026-03-16, token ambiguity resolution
**Context:** The previous rule "phi for section-level, standard for component-level" left gray areas. Developers didn't know which scale to use for: heading-to-paragraph gaps, form label-to-input spacing, breadcrumb-to-heading gaps, and accordion-to-content gaps. Additionally, section rhythm had already moved to standard scale (`--spacing-16`), making the old "phi for section-level" rule outdated.
**Options considered:**
1. Keep the split rule but add extensive examples
2. Make standard scale the default for everything; restrict phi to proportional layout math only
**Decision:** Option 2. Standard scale (`--spacing-*`) is the default for all spacing — component internals, element gaps, and section rhythm. Phi scale (`--spacing-phi-*`) is only for proportional layout relationships where the mathematical relationship to φ is the actual design intent (sidebar-to-content ratios, layout split proportions). Added a decision test to the docs: "Would any standard scale value work just as well here? If yes, use standard."
**Rationale:** The phi scale was being used as "the fancier spacing" when really it should only be used for its mathematical properties. Most spacing decisions are "I need N pixels of space" — the standard 4px grid handles this cleanly. Phi tokens remain available for genuine proportional relationships but are no longer the default for any spacing context.
**Status:** Active

---

### Line Height φ Audit: `snug` Adjusted, `tight` and `normal` Kept

**Date/Phase:** 2026-03-16, token ambiguity resolution
**Context:** Only `relaxed` (1.618 = φ) was explicitly φ-derived. Audited all other line heights for potential φ alignment: `tight` (1.15), `snug` (1.375), `normal` (1.5).
**Options considered for each:**
- `tight` (1.15): φ-derived would be 1 + (1/φ × 1/φ²) = 1.236. But `tight` was deliberately changed from 1.25 → 1.15 for heading use (see "Tighten --line-height-tight" decision). Reverting to 1.236 would undo a tested visual improvement.
- `snug` (1.375): φ-derived is 1 + 1/φ² = 1.382. Difference: 0.007 (0.5%). At 16px, that's 0.112px — visually imperceptible. No regression risk.
- `normal` (1.5): No clean φ derivation exists between snug (1.382) and relaxed (1.618). 1.5 is a well-established web default used by Typography base/lg body text.
**Decision:**
- `snug`: Changed from 1.375 → 1.382 (φ-derived: 1 + 1/φ²). Completes φ governance with zero visual impact.
- `tight`: Kept at 1.15. Documented deviation: optimized for Ancizar Serif heading rendering, overrides theoretical φ value (1.236) for practical reasons.
- `normal`: Kept at 1.5. Documented as conventional value — no natural φ derivation fills the gap between 1.382 and 1.618.
**Rationale:** φ governance should be completed wherever it causes no regressions. `snug` is a free win. `tight` and `normal` have stronger practical justifications for their current values than the φ alignment would provide.
**Status:** Active

---

### Type Scale Context Mapping: Explicit Boundaries for Tight, Default, and Display

**Date/Phase:** 2026-03-16, token ambiguity resolution
**Context:** Three type scales existed (tight φ^(1/3), default √φ, display φ) but their usage boundaries were described with soft terms ("dense UI," "product UI," "editorial"). A developer building a PDP section heading didn't know which scale to use.
**Options considered:**
1. Prescriptive list mapping each component to a scale
2. Context-based rule with decision tree and examples
**Decision:** Option 2. Created an explicit mapping table in `03-tokens.md` with three categories: Component UI text (Tight) → form labels, input text, table cells, badge text, breadcrumb text, select options; Page content (Default) → body paragraphs, headings, card titles, product names, prices, accordion triggers; Marketing/editorial (Display) → hero headings, campaign text, pull quotes, landing page headlines. Added a decision rule: inside a reusable component → Tight; page content a user reads → Default; text designed to make an impression → Display.
**Rationale:** Context-based rules are more useful than exhaustive lists because they handle novel situations. The three-category split maps cleanly to the type scales' step ratios: tight's smaller steps suit dense UI, default's moderate steps suit readable content, display's dramatic steps suit visual impact.
**Status:** Active

---

### Drawer: Flat API vs Compound API

**Date/Phase:** 2026-03-16, component build
**Context:** Building a generic slide-out panel (Drawer) that will be composed by Cart Drawer, mobile menu, and filter sidebar. Needed to decide between a flat prop API (like the spec) or a compound API (like Modal).
**Options considered:**
1. Compound API (`<Drawer>`, `<DrawerContent>`, `<DrawerHeader>`, `<DrawerFooter>`) — mirrors Modal
2. Flat API (`open`, `onOpenChange`, `side`, `width`, `title`, `children`) — simpler primitive
**Decision:** Option 2. Flat API. The Drawer is a primitive that composed components will wrap — Cart Drawer will add its own header, line items, footer. A compound API would be redundant since each consumer defines their own internal layout. The `title` prop is rendered as a visually hidden `Dialog.Title` for screen readers.
**Rationale:** Compound APIs make sense when consumers need flexible section arrangement (like Modal). Drawer consumers always build their own internal layout, so exposing `children` with scrollable padding is sufficient. Width is passed as a CSS custom property `--drawer-width` to keep the style layer clean.
**Status:** Active

---

### Icon: Library-Agnostic SVG Wrapper

**Date/Phase:** 2026-03-16, component build
**Context:** Components accepting `ReactNode` for icons (e.g., Button's `leadingIcon`) work but lack standardized sizing, color, and accessibility. Need a systematic Icon primitive before building Toast, Alert, Announcement Bar, and other icon-bearing components. Icon library not yet chosen (Lucide vs Radix Icons).
**Options considered:**
1. Pick an icon library now and build the component around it
2. Build a library-agnostic wrapper that accepts SVG children, add library integration later
3. Skip the component and keep passing raw SVGs everywhere
**Decision:** Option 2. Library-agnostic `<Icon>` that wraps an `<svg>` element with standardized props: `size` (sm/md/lg), `decorative` (boolean, default true), `label` (string for non-decorative). Children are SVG path elements. The `name` prop is reserved for a future icon registry.
**Rationale:** Choosing a library now would couple the entire system to that choice. The wrapper pattern means consumers pass SVG content today (works with any icon set) and can switch to a `name`-based registry later without breaking changes. Sizes (16/20/24px) sit on the 4px grid and align with existing control heights. New tokens `--size-icon-sm/md/lg` added to `tokens.json`.
**Status:** Active

---

### Table: Compound API with Scroll Wrapper

**Date/Phase:** 2026-03-16, component build
**Context:** Building a Table component for size charts, product specs, and comparison tables. Needed to decide on API shape and how to handle responsive overflow.
**Options considered:**
1. Flat API — single `<Table>` with `columns` and `data` props (data-driven)
2. Compound API — `Table`, `Table.Header`, `Table.Body`, `Table.Row`, `Table.Head`, `Table.Cell` (composable)
**Decision:** Option 2. Compound sub-components that map 1:1 to semantic HTML table elements. The wrapper `<div>` with `overflow-x: auto` is built into the root `Table` component (not left to consumers). CSS-only scroll shadow indicators via `background-attachment: local` on the wrapper.
**Rationale:** Compound API keeps the component simple, composable, and closely aligned with native HTML semantics. Data-driven APIs add complexity (custom cell renderers, column definitions) without clear benefit for the use cases (static spec tables, size charts). The scroll wrapper is built-in because every table needs it at small viewports — making consumers add their own wrapper would be error-prone. Sort indicators are visual-only (`sorted` prop on `Table.Head`) — sort logic is handled externally, keeping the component stateless.
**Status:** Active

---

### Toast: Custom Portal over Radix Toast

**Date/Phase:** 2026-03-16, component build
**Context:** Building Toast notification system for transient user feedback (add-to-cart, errors, wishlist). Needed to decide whether to use `@radix-ui/react-toast` or build from scratch.
**Options considered:**
1. Use `@radix-ui/react-toast` — provides swipe-to-dismiss, viewport management, keyboard navigation primitives
2. Build custom using `React.createPortal` — follow established CookieConsent pattern (fixed positioning, slide animation, closing state machine)
**Decision:** Option 2. Custom portal-based implementation following the CookieConsent pattern. Provider + `useToast()` hook API. Auto-dismiss with pause-on-hover/focus. Animation via CSS keyframes with `onAnimationEnd` + reduced-motion fallback.
**Rationale:** Radix Toast was not installed and would add a new dependency for a component whose core behavior (fixed positioning, slide animation, timer management) is straightforward and already patterned in CookieConsent. The custom approach reuses the exact closing-state/animation-end/reduced-motion fallback pattern, keeping the codebase consistent. Swipe-to-dismiss (the main Radix value-add) is not required for the current Shopify use cases.
**Status:** Active

---

### Info Color Tokens: --color-info-subtle and --color-info-foreground

**Date/Phase:** 2026-03-16, token gap
**Context:** Building Toast with a "default" (info) variant that mirrors Badge's success/warning/destructive color pattern. Only `--color-info` existed — no subtle background or foreground variants.
**Options considered:**
1. Add `--color-info-subtle` and `--color-info-foreground` tokens (slate palette, matching the other status colors)
2. Use neutral colors (`--color-background-surface` + `--color-foreground`) for the default variant, sidestepping the gap
**Decision:** Option 1. Added `--color-info-subtle: slate.50` (light) / `color-mix(12%)` (dark) and `--color-info-foreground: slate.700` (light) / `slate.300` (dark) to `build-css.mjs`.
**Rationale:** Consistency. Every other status color (success, warning, destructive) has a `-subtle` and `-foreground` variant. The gap would surface again with any future info-variant component. The 4-line change benefits the entire system.
**Status:** Active

### CartLineItem: Internal `formatPrice` vs Pre-Formatted Strings

**Date/Phase:** 2026-03-16, CartLineItem build
**Context:** PriceDisplay accepts pre-formatted strings (`price="$48.00"`), but CartLineItem's spec defines prices in cents (Shopify convention). Two approaches for bridging the gap.
**Options considered:**
1. Accept cents in CartLineItem, format internally with a private `formatPrice()` helper, pass formatted strings to PriceDisplay
2. Accept pre-formatted strings in CartLineItem to match PriceDisplay's API
**Decision:** Option 1. CartLineItem accepts cents (number), formats internally. The cents convention matches Shopify's `cart.items[n].final_price` and Stripe, avoiding formatting bugs at the consumer level. CartLineItem's `formatPrice` is private — not exported.
**Rationale:** Ecommerce components should speak the same language as the commerce platform (cents). Formatting is a presentation concern that belongs inside the component, not at the call site.
**Status:** Active

### CartLineItem: Composition over Inline Markup in CartDemo

**Date/Phase:** 2026-03-16, CartLineItem build
**Context:** CartDemo previously had inline cart line item markup (image, text, quantity selector, remove button) duplicated in the demo page. The spec called for extracting this into a reusable component.
**Options considered:**
1. Keep inline markup in CartDemo, add CartLineItem as a separate component
2. Refactor CartDemo to compose CartLineItem, removing ~50 lines of inline markup and ~60 lines of now-redundant CSS
**Decision:** Option 2. CartDemo now imports and composes `CartLineItem`, and CartDemo.css was cleaned of all line-item-level styles (now owned by the component).
**Rationale:** Components own their styles (CLAUDE.md rule). The inline markup was a composition gap — it would have caused CartDemo and CartLineItem to diverge over time.
**Status:** Active

### Cart Drawer — Composition Over Inline Rendering
**Date/Phase:** Phase 5 — Ecommerce Patterns
**Context:** Building the CartDrawer component (#8). CartLineItem already existed as a standalone component with responsive layouts, quantity controls, price display, and remove actions. The question was whether CartDrawer should compose CartLineItem or render its own inline line item markup.
**Options considered:**
1. Build inline line item rendering within CartDrawer (duplicate CartLineItem's work)
2. Compose CartLineItem directly — pass data through, map callbacks
**Decision:** Option 2. CartDrawer composes CartLineItem, Drawer, Button, Heading, and Text. It owns only the cart-level layout (header, scrollable items area, sticky footer with subtotal and checkout).
**Rationale:** Components own their styles (CLAUDE.md rule). CartLineItem already handles responsive grid, price formatting, quantity controls, and remove actions. Duplicating that in CartDrawer would create divergence. The CartDrawer's job is orchestration: open/close state, item list rendering, empty state, and footer (subtotal + checkout flow).
**Status:** Active

### Cart Drawer — Sticky Footer via position: sticky
**Date/Phase:** Phase 5 — Ecommerce Patterns
**Context:** The spec requires a sticky footer (subtotal + checkout) that stays visible when many items cause scrolling. The Drawer wraps all children in a `.ds-drawer__body` div with `overflow-y: auto`.
**Options considered:**
1. Modify Drawer to accept a `footer` slot rendered outside the scroll area
2. Use `position: sticky; bottom: 0` on the footer inside the scroll container
3. Accept that the footer scrolls with content
**Decision:** Option 2. The footer uses `position: sticky` with a negative `bottom` offset matching the drawer body's padding. Background matches the surface color to cover items scrolling beneath it.
**Rationale:** This achieves the sticky effect without modifying the Drawer primitive's API. The Drawer remains generic and reusable. If future patterns need a true fixed footer, we can revisit by adding a footer slot to Drawer.
**Status:** Active

---

### Pagination: Dual-Mode Rendering (SPA vs SSR)
**Date/Phase:** Phase 3 — Ecommerce Components
**Context:** Pagination needs to work in both SPA contexts (React state management) and SSR/Shopify contexts (crawlable `<a>` tags for SEO). The component also needs to handle responsive behavior — full page numbers on desktop are too wide for mobile.
**Options considered:**
1. Single mode with buttons only — consumers wrap in `<a>` tags themselves
2. Dual mode via `onPageChange` (buttons) vs `baseUrl` (anchor tags) — component handles the distinction
3. Always render `<a>` tags, use `onClick` + `preventDefault` for SPA
**Decision:** Option 2. `onPageChange` prop renders `<button>` elements for SPA mode. `baseUrl` prop renders `<a href="{baseUrl}?page={n}">` for SSR/Shopify. Page 1 links to the bare baseUrl (no `?page=1`). If baseUrl already has query params, appends with `&`.
**Rationale:** Clean semantic distinction — buttons for JS interaction, links for navigation. SSR mode produces crawlable HTML that search engines can follow. Composing with the existing Button component (ghost variant for page numbers, secondary for prev/next) maintains visual consistency without new styling. Mobile responsive via CSS: desktop shows full page numbers with ellipsis, mobile shows "Previous / Page X of Y / Next".
**Status:** Active

### CollectionFilters: Shared Panel Content for Desktop & Mobile
**Date/Phase:** Phase 3 — Ecommerce Components
**Context:** Collection Filters needs to work as a sidebar on desktop (≥768px) and a Drawer on mobile (<768px). The filter content (Accordion groups, checkboxes, price range inputs) is identical in both contexts — only the container differs.
**Options considered:**
1. Duplicate the filter panel content in both desktop and mobile containers
2. Extract a shared `FilterPanelContent` internal component rendered in both desktop `<div>` and mobile `<Drawer>`
3. Use CSS-only responsive hiding with a single DOM tree
**Decision:** Option 2. A `FilterPanelContent` component encapsulates all filter rendering logic. Desktop renders it in a visible `<div>` (hidden on mobile via CSS). Mobile renders it inside a `<Drawer>` (hidden on desktop via CSS). Both DOM trees exist but only one is visible at any breakpoint.
**Rationale:** Extracting `FilterPanelContent` avoids code duplication and ensures desktop/mobile parity. CSS visibility toggle is simpler than conditional rendering (which would lose Accordion open state during resize). The slight DOM duplication is acceptable since filter data is lightweight and the Drawer only mounts its portal when opened.
**Status:** Active

### CollectionFilters: Active Filter Pills as Dismissible Buttons
**Date/Phase:** Phase 3 — Ecommerce Components
**Context:** Active filters need to be displayed above results for visibility and quick removal. Need to decide the UI pattern and accessibility approach.
**Options considered:**
1. Badge components with close buttons — reuse existing Badge
2. Custom pill buttons with inline dismiss icon — standalone accessible buttons
3. A removable tag component (new primitive)
**Decision:** Option 2. Custom `<button>` elements with BEM class `.ds-collection-filters__pill`, each with `aria-label="Remove filter: [label]"`. The dismiss icon is a small ×, `aria-hidden`.
**Rationale:** Badges are display-only (no click handler in their API). Building a new removable tag primitive is premature — if this pattern repeats (e.g., selected tags in search), we can extract it then. Custom buttons give full control over sizing, theming, and accessibility without extending the Badge API for one use case.
**Status:** Active

---

### Alert: Variant-to-ARIA Role Mapping
**Date/Phase:** Phase 4
**Context:** Alert component needs correct ARIA semantics per variant urgency level.
**Options considered:** (a) `role="alert"` on all variants, (b) `role="status"` on all variants, (c) split by urgency — assertive for destructive/warning, polite for info/success.
**Decision:** Option (c) — `role="alert"` for destructive and warning, `role="status"` for info and success.
**Rationale:** `role="alert"` triggers assertive live region announcements that interrupt screen reader flow. Informational and success messages don't warrant interruption. Warning and destructive messages do — they require immediate attention. This matches WAI-ARIA authoring practices for alert vs status patterns.
**Status:** Active

---

### Alert: Solid Primitive Backgrounds (No color-mix)
**Date/Phase:** Phase 4
**Context:** Alert variant backgrounds need subtle tinted fills. Could use `color-mix(in srgb, var(--color-success) 10%, transparent)` or solid primitive tokens like `--color-sage-50`.
**Options considered:** (a) `color-mix()` with transparency, (b) solid primitive token references via semantic aliases (`--color-success-subtle`).
**Decision:** Option (b) — solid semantic tokens pointing to primitive -50 values.
**Rationale:** `color-mix()` with transparent percentages makes WCAG contrast mathematically impossible to guarantee (see 07-lessons-learned.md). Solid -50 primitives provide reliable, testable contrast against -600/-700 foreground text.
**Status:** Active

---

### PredictiveSearch: Custom Combobox (No Library)

**Date/Phase:** Phase 4
**Context:** PredictiveSearch needs an accessible autocomplete dropdown. Radix UI does not provide a Combobox primitive. Options: custom implementation, Downshift library, or Headless UI Combobox.
**Options considered:** (a) Custom WAI-ARIA combobox implementation, (b) Downshift library, (c) Headless UI Combobox.
**Decision:** Option (a) — custom implementation following the WAI-ARIA Combobox with Listbox Popup pattern (APG).
**Rationale:** Avoids a new dependency for a single component. The WAI-ARIA combobox pattern is well-defined and the component scope is narrow enough that a full library is overkill. Consistent with using Radix only where primitives exist. Sets the precedent for combobox accessibility in the system.
**Status:** Active

---

### PredictiveSearch: Data Fetching Architecture

**Date/Phase:** Phase 4
**Context:** Should PredictiveSearch handle Shopify API calls internally or accept results from the consumer?
**Options considered:** (a) Built-in Shopify fetch logic, (b) `onSearch` callback + `results`/`loading` props (controlled results), (c) render prop for full consumer control.
**Decision:** Option (b) — `onSearch` callback + `results`/`loading` props.
**Rationale:** Design system components must be store-agnostic. The component handles debouncing, UI state, and accessibility. Data fetching lives in the Shopify theme layer. Same separation as CartDrawer (takes items as props, not fetching them). Adding `loading` as a prop (rather than internal state) gives the consumer full control over the loading UX.
**Status:** Active

---

### EmptyState: Component vs Layout Pattern

**Date/Phase:** Phase 4
**Context:** The spec called EmptyState a "layout pattern, not a heavyweight component." Needed to decide whether to ship it as a documented CSS pattern (like the layout grid) or as a proper component with the 4-file rule.
**Options considered:**
1. CSS-only pattern documented in playbook — consumers compose Heading + Text + Button manually
2. Lightweight component that composes Heading, Text, and Button internally — standard 4-file rule
**Decision:** Option 2. A proper component with `EmptyState.tsx`, `.css`, `.test.tsx`, `.stories.tsx`, and `index.ts`.
**Rationale:** Even though EmptyState is structurally simple, a component enforces consistency (centered layout, spacing, heading size, description max-width, icon sizing) across all empty states in the system. Without it, every consumer would write their own centered flex column with slightly different spacing. The `compact` variant handles constrained contexts (Cart Drawer) via component tokens rather than ad-hoc overrides. The `action`/`secondaryAction` prop shape with `{ label, href }` ensures proper link semantics via `Button asChild`.
**Status:** Active

---

### Tabs: Radix UI Primitive

**Date/Phase:** Phase 3 — Ecommerce Components
**Context:** Product detail pages need tabs for description/reviews/specs. Building a tabbed interface component.
**Options considered:** (a) Custom tabs implementation, (b) Radix UI Tabs primitive.
**Decision:** Option (b) — `@radix-ui/react-tabs`. Compound API: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`. Thin wrapper adding BEM class names and `forwardRef`.
**Rationale:** Radix provides correct keyboard navigation (arrow keys, Home/End), `aria-selected` state management, and panel association out of the box. Consistent with using Radix for all compound interactive components (Accordion, Dialog, Select). The wrapper is minimal — BEM classes and CSS, no behavioral changes.
**Status:** Active

---

### Skeleton: Custom Implementation (No Library)

**Date/Phase:** Phase 3 — Ecommerce Components
**Context:** Loading states needed across PLP, Search, Cart, and PDP pages. No existing skeleton primitive.
**Options considered:** (a) React-loading-skeleton package, (b) Custom implementation.
**Decision:** Option (b) — custom `Skeleton` component. Three variants: `text` (with configurable `lines`), `circular`, `rectangular`. CSS `@keyframes` pulse animation with `prefers-reduced-motion` fallback. Renders `aria-hidden="true"`.
**Rationale:** The component is simple (a styled `<div>` with animation) — a library would add more weight than value. Width/height passed as props and set via inline styles using CSS custom properties. Pulse animation uses `--color-background-subtle` to `--color-border` range for subtle warmth matching the palette.
**Status:** Active

---

### AddToCartButton: Status-Driven State Machine

**Date/Phase:** Phase 3 — Ecommerce Components
**Context:** The "Add to Cart" action has 5 states (idle, loading, success, sold-out, pre-order) with different labels, icons, and interactivity. Need to decide if this is a Button variant or a separate composed component.
**Options considered:** (a) Add states to Button component directly, (b) Separate `AddToCartButton` that composes Button.
**Decision:** Option (b) — standalone component. Accepts `status` prop driving label, icon, and disabled state. Composes the existing `Button` (primary variant). Auto-resets from `success` → `idle` after a timeout. All labels customizable via `labels` prop for i18n.
**Rationale:** The state machine logic (auto-reset timer, status-to-label mapping, status-to-icon mapping) doesn't belong in the generic Button. This keeps Button focused on presentation while AddToCartButton handles ecommerce-specific behavior.
**Status:** Active

---

### VariantSelector: Compound Option Groups with ColorPicker

**Date/Phase:** Phase 3 — Ecommerce Components
**Context:** Product pages need selectors for size, color, material, and other variant options. Each option type has different UI: color options use swatches, others use pill-style buttons.
**Options considered:** (a) A single generic toggle group, (b) A `VariantSelector` that renders different UIs per option type.
**Decision:** Option (b) — `VariantSelector` accepts `options: VariantOption[]` where each option specifies `type: 'color' | 'button'`. Color options delegate to the existing `ColorPicker` component. Button options render `role="radiogroup"` with pill-style buttons supporting `available` (out-of-stock strikethrough) and `disabled` states.
**Rationale:** Color swatches and text pills are fundamentally different UI patterns — forcing them through a single component would require complex conditional rendering at the call site. Delegating to `ColorPicker` for color options reuses an existing tested component. The `selectedValues` map + `onValueChange` callback keeps the component controlled and composable with cart state management.
**Status:** Active

---

### Shopify Theme Location: `apps/theme/` in Monorepo

**Date/Phase:** 2026-04-23 — Phase 4 (Shopify Integration)
**Context:** Need a location for the Liquid theme that consumes the design system. Choices affect build tooling, Turborepo graph, and how tokens flow into the theme.
**Options considered:** (a) New `apps/theme/` inside this monorepo; (b) Separate repo that installs `@ds/tokens` via npm; (c) Nested under `packages/` as a non-published package.
**Decision:** Option (a) — `apps/theme/` alongside `apps/docs` and `apps/storybook`.
**Rationale:** Matches the existing app pattern. Turborepo can wire token builds as a dependency (`@ds/tokens` build → theme sync). Token changes propagate to the theme in the same PR that changes them — no npm publish step required to test. Shopify CLI expects the theme dir to be the working directory; we work around this by running `shopify theme dev` from inside `apps/theme/`.
**Status:** Active

---

### Shopify Theme: Strip Dawn Aggressively

**Date/Phase:** 2026-04-23 — Phase 4 (Shopify Integration)
**Context:** Starting a Shopify theme from scratch is slow; starting from Dawn gives a working baseline but ships 185 assets + 54 sections + 37 snippets of Dawn's CSS and opinions. The design system must be the single source of truth — Dawn's CSS system would conflict on every spacing, color, and typography decision.
**Options considered:** (a) Start from empty — build every section from zero; (b) Keep Dawn, swap CSS files file-by-file as sections are migrated; (c) Aggressive strip — delete all of Dawn's assets, sections, and snippets the day it's cloned, keep only the Liquid scaffolding.
**Decision:** Option (c). Deleted all 65 CSS files, 32 JS files, 88 other assets, 54 sections, 37 snippets. Replaced `layout/theme.liquid` with a minimal version. Replaced all template JSONs with pointers to a `main-placeholder` section. Kept `locales/` (51 translation files) unchanged.
**Rationale:** Dawn's CSS contamination risk is high. A clean slate means the design system is the only source of truth from day one. Slower initial ramp is worth zero contamination. The kept Liquid scaffolding (`theme.liquid`, `templates/`, `config/`, `locales/`) is boilerplate Shopify requires regardless of styling approach.
**Status:** Active

---

### Tokens Distribution: Copy `tokens.css` into Theme Assets

**Date/Phase:** 2026-04-23 — Phase 4 (Shopify Integration)
**Context:** Shopify themes can only load CSS files that live in `assets/`. The compiled tokens CSS lives at `packages/tokens/dist/tokens.css`. Some mechanism has to bridge them.
**Options considered:** (a) Manual copy each time tokens change; (b) Postbuild script in `apps/theme/package.json` that copies on rebuild; (c) Symlink (not supported by Shopify CLI); (d) Inline the tokens as a `{% style %}` block in `theme.liquid`.
**Decision:** Currently manual copy. Postbuild automation is the [PENDING DECISION] — decision deferred until we hit token churn.
**Rationale:** Tokens churn is low once the system stabilizes. Manual copy is acceptable for now; revisit if tokens change more than weekly during theme build phase. Symlinks are ruled out — Shopify CLI resolves them as zero-byte files. Inlining as a `{% style %}` block is rejected because it prevents browser caching of `tokens.css` across pageviews.
**Status:** Active — revisit after first 3 sections are ported.
