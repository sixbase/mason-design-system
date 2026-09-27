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

Use this to find decisions by topic without scrolling 2,300+ lines. Statuses here mirror each entry's **Status** line (last synced 2026-09-27).

### Architecture & Tooling

| Decision | Status |
|----------|--------|
| Framework: React over Vue/Svelte | Active |
| Package Manager: pnpm + Turborepo | Active |
| Token Architecture: 3-Tier | Active |
| Package Bundler: tsup | Active |
| Documentation: Two Apps (Storybook + Astro) | **Changed** → workbench only (2026-09-27) |
| Primitive Components: Radix UI | Active |
| CSS Strategy: Plain CSS + BEM + `ds-` prefix | Active |
| package.json exports: `types` first | Active |
| tsup output: `.mjs` ESM, `.js` CJS | Active |

### Design & Tokens

| Decision | Status |
|----------|--------|
| Color Palette: Named palettes (`stone`, `brick`, etc.) | Active |
| Font: IBM Plex Sans (Inter → EB Garamond → Source Serif 4 → Ancizar → Source Serif 4 → **IBM Plex Sans**) | Active |
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
| Container Width: `--size-content-xl` (1280px) vs `.ds-page-container` (1200px) | **Changed** — Header/Footer use `--size-container` too |
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
| Button loading: `aria-busy` + blocked activation — `aria-disabled`, never native `disabled` (round 1) | Active |
| CookieConsent: compound component with i18n labels | Active |
| No Overrides Rule: block components never target primitive internals | Active |
| Optical Text Centering: `text-box-trim` | **Revisited** — invalid syntax, open decision |
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
| CartLineItem: cents in, formatted out — now via shared `format-money` | Active |
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
| Gallery Inline Styles → `demo-utilities.css` shared classes | Retired (docs site) |
| ViewportIndicator: inline styles → CSS + semantic tokens | Retired (docs site) |
| Shared Results Header pattern | Retired (docs site) |
| Token Compliance Audit: docs site inline styles → CSS classes | Retired (docs site) |
| Docs parity: every Storybook story needs live preview in docs | Retired — stories are the only specimens |

### Shopify Integration

| Decision | Status |
|----------|--------|
| Theme location: `apps/theme/` in monorepo | **Changed** → own repo `sixbase/mason-storefront` (2026-06-25) |
| Base theme: aggressive strip of Dawn (delete all assets/sections/snippets) | Active |
| Tokens distribution: copy `tokens.css` into theme assets (automation open — see `12`) | Active |

### Later decisions (2026-06 → 2026-09) — highlights

| Decision | Status |
|----------|--------|
| Semantic tokens live in `tokens.json`; build throws on bad references | Active |
| Text tone roles: `foreground-secondary` is the readable-text floor | Active |
| `--size-container` (1200px) tokenized; storefront runs `--size-container-wide` (1300px visible) | Active |
| Accent ramps extended to 12 steps on the stone spine | Active |
| Responsive foundation tokens (fluid spacing, aspect, elevation, safe area, interaction) | Active |
| Touch hit-area pattern (pseudo-element, coarse-pointer guard when adjacent) | Active |
| Motion layer `@ds/motion`; φ easings; native view transitions | Active |
| Focus ring: solid 2px with background gap; composites per mode; `--color-border-control` | Active |
| Docs site retired → visual workbench on stories | Active |
| One Radix internals version; wrap Radix parts, never rename | Active |
| Dev-only misuse warnings; one money formatter (cents for every currency) | Active |
| Print and high-contrast token modes; iOS page globals | Active |
| Disabled fades the control, not its hint | Active |
| Round 4: `check-css`, hover gating, `.ds-motion-safe`, live regions on change, hit areas, per-component CSS, stories type-checked | Active |
| Shopify theme extracted to its own repo | Active |
| Playbook: how-to chapters state today's rules; logs are history; one open list | Active |
| Storybook removed; workbench is the only app (stories stay Component Story Format) | Active |
| Divider hairline: `--color-border-subtle` (translucent, φ⁻⁶); Divider `subtle` variant deprecated | Active |

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
**Status:** Changed (2026-09-25) — the Astro docs site was retired; Storybook stays for engineering and `apps/workbench` renders the same stories for review. See "Docs Site Retired → Visual Workbench Built on Stories". Changed again (2026-09-27) — Storybook was removed; the workbench is the only app. See "Storybook Removed — Workbench Is the Only App".

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
**Status:** Superseded — components use the internal icon registry ("Internal Icon Registry over Lucide/External Library"), and the docs gallery it applied to was retired 2026-09-25.

---

### Transparent Colors: `color-mix()` Instead of `rgba()`

**Date/Phase:** Input component focus ring
**Context:** Creating a semi-transparent focus ring color that works in dark mode.
**Options considered:** Hardcoded `rgba(hex, alpha)`, CSS `color-mix()`, `oklch` with alpha
**Decision:** `color-mix(in srgb, var(--color-focus-ring) 20%, transparent)`
**Rationale:** Hardcoded `rgba()` references a specific hex value and doesn't update when `.dark` swaps `--color-focus-ring` to a different value. `color-mix()` evaluates the CSS variable first (after dark mode applies) then mixes it. Supported in all modern browsers (Chrome 111+, Firefox 113+, Safari 16.2+).
**Status:** Changed (2026-09-25) — the focus ring is now solid ("Focus Ring: Solid 2px Ring with Background Gap"). `color-mix()` over `rgba()` still holds for decorative composites such as `--color-overlay`.

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
**Status:** Changed — reverted to Source Serif 4 on 2026-06-30 (commit `84bd7cb`); see "Font: Back to Source Serif 4" below

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
**Status:** Active — layer 1 changed (2026-09-27): the Storybook a11y panel went with Storybook; dev-time checks are now the workbench's on-demand *Check accessibility* (axe) button. `jest-axe` in tests remains the CI gate.

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
**Status:** Revisited (2026-09-25) — `text-box-trim: both` is invalid CSS, so the trim never applied and the translateY fallback runs everywhere. Open owner decision: `12-audit-2026-09-25.md` item 1; analysis in `07-lessons-learned.md#text-box-trim-invalid`.

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
**Status:** Changed — FullWidthLayout.astro was retired with the docs site; the toggle now lives in the Header component (`showThemeToggle`, stores `ds-theme` in localStorage).

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
**Status:** Retired with the Astro docs site (2026-09-25) — see "Docs Site Retired → Visual Workbench Built on Stories". History only.

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
**Status:** Superseded — the single-pattern rule stands, but the value moved into composite tokens ("Focus Ring Consolidation") and then to a solid 2px ring ("Focus Ring: Solid 2px Ring with Background Gap").

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
**Status:** Retired with the Astro docs site (2026-09-25) — see "Docs Site Retired → Visual Workbench Built on Stories". History only.

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
**Status:** Active — `snug` itself was later set to 1.382 (1 + 1/φ²); see "Line Height φ Audit".

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
**Status:** Retired with the Astro docs site (2026-09-25) — see "Docs Site Retired → Visual Workbench Built on Stories". History only. The workbench Foundations sheets carry the visual previews.

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
**Status:** Active — the composite tokens remain; their value changed to a solid 2px ring on 2026-09-25 ("Focus Ring: Solid 2px Ring with Background Gap").

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
**Status:** Retired with the Astro docs site (2026-09-25) — see "Docs Site Retired → Visual Workbench Built on Stories". History only.

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
**Status:** Retired with the Astro docs site (2026-09-25) — see "Docs Site Retired → Visual Workbench Built on Stories". History only.

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
**Status:** Retired with the Astro docs site (2026-09-25) — see "Docs Site Retired → Visual Workbench Built on Stories". History only.

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
**Status:** Retired with the Astro docs site (2026-09-25) — see "Docs Site Retired → Visual Workbench Built on Stories". History only.

---

### Gallery Inline Styles → CSS Classes

**Date/Phase:** Full codebase refactor
**Context:** CardGallery, InputGallery, SelectGallery, and AccordionGallery used extensive inline `style={{ }}` attributes for widths, margins, and typography. This violated the convention of CSS classes over inline styles.
**Decision:** Created gallery utility classes in demo-utilities.css (`.ds-gallery-card`, `.ds-gallery-input`, `.ds-gallery-select`, `.ds-gallery-full`, `.ds-gallery-label`, `.ds-gallery-product-meta`). Replaced all inline styles in gallery components with class references.
**Status:** Retired with the Astro docs site (2026-09-25) — see "Docs Site Retired → Visual Workbench Built on Stories". History only.

---

### ViewportIndicator — Inline Styles to CSS

**Date/Phase:** Full codebase refactor
**Context:** ViewportIndicator component had 20+ inline style properties and hardcoded hex colors (#E07060, #D4A040, #5E8F50) for the breakpoint status dot. The hex values happened to match brick, amber, and sage palette colors but weren't using tokens.
**Decision:** Moved all styles to `.ds-viewport-indicator` CSS class in demo-utilities.css. Replaced hex colors with `var(--color-destructive)`, `var(--color-warning)`, `var(--color-success)` semantic tokens.
**Rationale:** Even developer tools should use the design system. The semantic tokens also mean the indicator dot colors adapt to dark mode automatically.
**Status:** Retired with the Astro docs site (2026-09-25) — see "Docs Site Retired → Visual Workbench Built on Stories". History only.

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

**Status:** Retired with the Astro docs site (2026-09-25) — see "Docs Site Retired → Visual Workbench Built on Stories". History only.

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
**Status:** Changed (2026-07-01) — Header/Footer now align with the page container at `--size-container` (1200px); `--size-content-xl` (1280px) remains only as the Container component's `xl` size. The wide-screen page frame question is settled separately: the storefront runs 1300px visible via `--size-container-wide` (see "Storefront Page Frame: 1300px Visible on Wide Screens")

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
**Status:** Active — cents in, formatted inside; the private helper was replaced by the shared `internal/format-money.ts` ("One Money Formatter, Explicit Locale, Cents for Every Currency"). Note that Stripe differs from Shopify for zero-decimal currencies.

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
**Status:** Changed (2026-06-25) — the theme moved to its own repo; see "Shopify Theme Extracted to Its Own Repo".

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
**Decision:** Currently manual copy. Postbuild automation is still open — tracked in `12-audit-2026-09-25.md` → "Open after five rounds" (the theme is now a separate repo, so a Turborepo task no longer fits).
**Rationale:** Tokens churn is low once the system stabilizes. Manual copy is acceptable for now; revisit if tokens change more than weekly during theme build phase. Symlinks are ruled out — Shopify CLI resolves them as zero-byte files. Inlining as a `{% style %}` block is rejected because it prevents browser caching of `tokens.css` across pageviews.
**Status:** Active — revisit after first 3 sections are ported.

---

### Cart Drawer: Vanilla JS + Section Rendering API, No Radix

**Date/Phase:** 2026-04-24 — Phase 4 (Shopify Integration) — Phase 2 features
**Context:** Port the React `CartDrawer` (Radix Dialog + `useState`) into a Liquid section. The React version uses Radix's `Dialog` for portal, focus trap, `Escape`, overlay click dismiss. The theme has no client-side JS framework and no bundler — inline scripts only.
**Options considered:** (a) Bundle Radix + React into the theme just for the drawer; (b) Use the native `<dialog>` element with `showModal()` — browser handles focus trap/escape but discards the `.ds-drawer__panel` + `.ds-drawer__overlay` BEM structure; (c) Vanilla JS (~150 LOC inline): toggle `hidden` + `[data-state='open'|'closed']`, port `Drawer.css`/`CartDrawer.css` verbatim, re-implement a minimal focus trap + scroll lock + Escape handler.
**Decision:** Option (c). Drawer state is driven by `[data-state]` attributes on `.ds-drawer__overlay` and `.ds-drawer__panel` (parity with Radix's own contract). Opening/closing lives in a single IIFE inside `sections/cart-drawer.liquid`, guarded against double-init. Quantity updates and line removals inside the drawer use Shopify's `/cart/change.js` + `/cart/update.js` endpoints. Drawer contents re-render via the Section Rendering API (`/?sections=cart-drawer`) — the server stays canonical, no client templating.
**Rationale:** Bundling React for one component violates "Port, don't reinvent" (10-shopify-theme.md) and adds >40kb of JS to every page. The `<dialog>` element's UA styling and `::backdrop` fight the DS tokens and require `all: unset` gymnastics. Vanilla JS keeps the CSS a 1:1 port of the React component, keeps the theme zero-dep, and the Section Rendering API means the Liquid templates are the single source of truth for cart HTML — no JS-side rendering logic to drift from the React component. Progressive enhancement is preserved: without JS, the header cart link still navigates to `/cart`, the add-to-cart form still POSTs to `/cart/add`, and the cart-line-item qty/remove controls still work via the standard `/cart` POST form.
**Status:** Active

---

### Internal Icon Registry over Lucide/External Library

**Date/Phase:** 2026-04-24 — Phase 4 (Shopify Integration)
**Context:** Audit surfaced 25+ sites across components, docs, and Liquid theme where icons were inlined as raw `<svg>` with ad-hoc viewBoxes (10×10, 12×12, 16×16, 20×20, 24×24) and no shared wrapper. One render bug (theme toggle invisible in Shopify theme — missing `.ds-icon` class) and one layout bug (docs toggle squeezed by flex-shrink) escaped three subagent audits because they only verified path correctness, not visual render. Needed to consolidate onto a single source of truth.
**Options considered:** (a) Install `lucide-react` — tree-shakeable, well-tested paths, zero-cost to components using named imports; (b) Install `@radix-ui/react-icons` — smaller set, matches existing Radix deps; (c) Build an internal icon registry at `packages/components/src/icon/icons.tsx` — each icon a standalone 24×24 `<svg>` component with `.ds-icon` class, `size` prop (sm/md/lg), and `decorative`/`label` a11y props.
**Decision:** Option (c). Registry added at `packages/components/src/icon/icons.tsx` with 19 named exports (`X`, `Check`, `ChevronDown/Up/Left/Right`, `Plus`, `Minus`, `Search`, `Sun`, `Moon`, `Info`, `CircleCheck`, `TriangleAlert`, `CircleX`, `Image`, `ShoppingBag`, `ShoppingCart`, `Heart`). Paths are Lucide-equivalent (same aesthetic, battle-tested art). 11 components migrated off raw `<svg>` onto the registry. Liquid `icon.liquid` snippet extended with `sun`, `moon`, and an `extra_class` param; `header.liquid` now uses `{% render 'icon' %}` for the theme toggle. `BaseLayout.astro` uses the React components inline (SSR — no hydration).
**Rationale:** Decisions log 347 (now superseded) left the `<Icon>` wrapper deliberately library-agnostic, pending a library choice. Bringing in Lucide reverses that agnosticism to solve a problem that's fundamentally about inconsistency (bypassing the wrapper, not the wrapper itself). A registry gives us tree-shaking, a single source of truth, brand control, and zero external deps. The 19 icons we actually use weigh less than Lucide's overhead even with tree-shaking. Lucide-equivalent paths mean zero visual regression. See [07-lessons-learned.md#icon-audit-render-check](07-lessons-learned.md#icon-audit-render-check) for the audit gaps that prompted this. The `<Icon>` wrapper stays for custom one-off SVG composition (demo purposes, custom illustrations).
**Status:** Active

---

### PDP Below-the-Fold Content: 4 Sections in `templates/product.json`

**Date/Phase:** 2026-04-26 — Phase 4 (Shopify Integration)
**Context:** PDP only had the gallery + details column rendered. The DS PDP demo (`apps/docs/src/components/PDPDemo.tsx`) ships four additional content blocks (Accordion in details, lifestyle Carousel below, three FeatureBlocks alternating). Theme PDP needed parity for "below the fold doesn't feel empty" and to set up SEO content for crawlers / AI search.
**Options considered:** (a) Inline everything inside `main-product.liquid` — single file, no merchant flexibility; (b) Split into separate sections registered in `templates/product.json` — Shopify-canonical, each section gets its own theme-editor entry; (c) Use Shopify section blocks (one parent section with addable child blocks) — most flexible but adds schema complexity for marginal gain.
**Decision:** Option (b). Accordion stays inside `main-product.liquid` (it's structurally part of the details column). The other three lift to their own sections: `product-lifestyle.liquid` (new), `feature-block.liquid` (reused — already shipped for home page) added 3× with distinct settings IDs (`feature-materials`, `feature-durability`, `feature-zero-waste`). Sale `Badge` stays inline in `main-product.liquid` next to the price snippet (computed `sale_percent` via the `compare_at_price`/`price` diff). For per-category variation later, use Shopify's alternate-template mechanism (e.g. `product.outdoor.json`) — every category-specific block set lives in its own template JSON, swapping `feature-*` settings while reusing the same section types.
**Rationale:** Shopify's section model is the canonical answer when content blocks are independent and merchants need to reorder or disable them. Inlining everything in `main-product.liquid` would force theme-editor edits to require code changes. Section blocks (option c) shine when there's a heterogeneous list (e.g. announcement banners with varied types); for three known feature slots + a lifestyle carousel + an inline accordion, registered sections are cleaner. The accordion exception is correct because it sits inside the gallery+details golden-ratio grid — splitting it out would double-render the layout container and break sticky behavior. Carousel uses pure CSS scroll-snap (no JS) matching the DS exactly. Accordion CSS swaps Radix's `--radix-accordion-content-height` for a JS-set `--accordion-content-height` and uses inline vanilla JS that measures `scrollHeight` on toggle — same pattern as the cart drawer.
**Status:** Active

---

### AnnouncementBar: Backfill React Component, Theme Consumes DS

**Date/Phase:** 2026-04-29 — Phase 4 (Design System Integrity)
**Context:** The announcement bar was the only storefront section built directly in the Shopify theme without a corresponding React component in the design system. Header and Footer were ported from existing React components, but `announcement-bar.liquid` was created net-new during the Phase 1 theme port (commit `9531621`) because no DS component existed yet. This violated the architecture hierarchy: the design system is the single source of truth, and the theme consumes it.
**Options considered:** (a) Leave as-is — theme-only, accept the gap; (b) Backfill the React component and align the theme CSS to match.
**Decision:** Option (b). Created `packages/components/src/announcement-bar/` with the full 4-file rule (tsx, css, test, stories, index). Updated `apps/theme/assets/announcement-bar.css` to use component tokens (`--announcement-bar-bg`, `--announcement-bar-fg`) on the root class instead of hardcoding `var(--color-primary-foreground)` in three places. The Liquid section retains one Liquid-specific addition: `.ds-announcement-bar[hidden] { display: none }` because the vanilla JS dismiss uses the HTML `hidden` attribute, while the React component unmounts via state.
**Rationale:** Every component in the storefront must source from the design system. Without a React counterpart, the announcement bar's styles and behavior lived only in the theme — invisible to the docs site, untested by the component test suite, and excluded from token evolution. Backfilling restores the architecture: DS defines, theme ports.
**Status:** Active

---

### Dedicated `numeric` Font Family (JetBrains Mono) for Numerals

**Date/Phase:** 2026-07-01 — Phase 4 (Design System Integrity)
**Context:** Numerals (prices, quantities, page numbers, ratings, percentages) rendered in the body serif (Source Serif 4), where digits are proportionally spaced and don't align in columns. QuantitySelector had already reached for `--font-family-code` (JetBrains Mono) as a one-off to get tabular digits, signalling a missing semantic token. Request: use a distinct font for anything number-related, system-wide, and mirror it in the storefront.
**Options considered:** (a) Reuse `--font-family-code` everywhere numerals appear — no new token, but conflates "code/monospace UI" with "numerals" and can't diverge later; (b) Add a `numeric` semantic font-family token pointing at JetBrains Mono, apply it to numeric surfaces, migrate the QuantitySelector one-off onto it; (c) Add `font-variant-numeric: tabular-nums` only, keeping the serif — improves alignment but doesn't change the typeface (the actual request).
**Decision:** Option (b). Added `primitive.font.family.numeric` → `--font-family-numeric` (same stack as `code` today, but semantically independent). Applied to: PriceDisplay, QuantitySelector (migrated off `--font-family-code`), ProductCard price, CartLineItem line total, CartDrawer subtotal, Pagination page numbers + mobile "Page X of Y", StarRating review count, and ProgressBar's auto percentage. Paired with `font-variant-numeric: tabular-nums` for column alignment.
**Rationale:** A role-named semantic token (numeric ≠ code) keeps the two intents free to diverge — e.g. a future switch to a proportional-numeral display face for code samples wouldn't drag prices along. Two-class specificity (`.ds-component .ds-text`) is used to win over the base `.ds-text` font-family without `!important`. For Pagination, page numbers render inside `<Button>`, which sets its own `font-family`; rather than override the property (a violation), Button gained a `--button-font-family` component token (default `--font-family-body`) that Pagination overrides to `--font-family-numeric` on page cells only — Prev/Next keep the body font. Deliberately **excluded**: StockIndicator (renders status sentences, not counts), generic Badge (labels like "Sale"/"New"), Table cells (arbitrary content), and ProgressBar's custom `valueText` (may be a sentence like "$12 away from free shipping" — only the auto `NN%` gets the numeric font, via a `--numeric` modifier).
**Status:** Active

---

### Headings Balance Their Own Wrapping (`text-wrap: balance`)

**Date/Phase:** 2026-06-30 — Phase 4 (Mobile / responsive polish)
**Context:** The example homepage hero heading wrapped poorly at multiple widths. On mobile (~343px hero box) the heading clipped past the rounded edges; on wide screens (640px content box) it left "Made" orphaned on its own line. Root cause: a non-breaking space had been hand-placed in the demo content (`Everyday Essentials,{' '}Thoughtfully Made`) to "control" the wrap — it glued the wrong words together and forced an unbreakable chunk wider than the mobile container.
**Options considered:** (a) Hand-tune the `&nbsp;` placement per heading — brittle, has to be re-done for every copy change and every breakpoint; (b) Add a mobile-only `font-size` reduction for `4xl` — addresses overflow but not the orphan, and is a separate concern; (c) Remove the manual hint and let `text-wrap: balance` on `.ds-heading` handle line distribution for all headings.
**Decision:** Option (c). Removed the non-breaking space from `HomepageDemo.tsx`, and added `text-wrap: balance` to `.ds-heading` in `packages/components/src/typography/Typography.css`. Line distribution is now a styling concern owned by the component, applied uniformly to every heading.
**Rationale:** Wrapping is presentation, not content — encoding it with `&nbsp;`/`<br>` in copy is an override that doesn't scale and breaks on the next edit. `text-wrap: balance` evens line lengths natively, eliminating orphans without per-heading tuning, and degrades gracefully on older browsers (falls back to normal wrapping). `.ds-heading--truncate` is unaffected because its `white-space: nowrap` wins the `text-wrap-mode` cascade. A non-breaking space remains legitimate only for genuinely atomic tokens (units, names), never for aesthetic line shaping.
**Verification gotcha:** The docs site consumes the built `@ds/components` CSS (`dist/index.css`), so the change required `pnpm --filter @ds/components build` before it appeared in the preview. Confirmed live via `getComputedStyle(el).getPropertyValue('text-wrap-style') === 'balance'` and zero `scrollWidth` overflow at 375px and 1280px.
**Status:** Active

---

### Font: Back to Source Serif 4 (documentation reconciliation)

**Date/Phase:** 2026-07-01 — System audit
**Context:** Commit `84bd7cb` (2026-06-30) switched the body/heading serif from Ancizar Serif back to Source Serif 4 in the token and the docs font loads, but the playbook, `CLAUDE.md`, and `README.md` still claimed Ancizar Serif — the docs contradicted the code.
**Decision:** Source Serif 4 is the active typeface. Updated every stale reference (`CLAUDE.md`, `README.md`, `03-tokens.md`, the summary table above, and the original Ancizar entry's status). Recorded this entry retroactively so the log matches the commit history.
**Rationale:** The code is the source of truth for what shipped; the log's job is to reflect it. Note: the `0.05em` `@supports not (text-box-trim)` fallback nudge was tuned for Ancizar — worth re-checking optically against Source Serif 4 in Firefox.
**Status:** Superseded — replaced by IBM Plex Sans on 2026-07-02; see "Font: IBM Plex Sans (serif → sans pivot)" below.

---

### Font: IBM Plex Sans (serif → sans pivot)

**Date/Phase:** 2026-07-02
**Context:** The system had used a serif body/heading typeface since the earliest planning (EB Garamond → Source Serif 4 → Ancizar → Source Serif 4). The user decided to move the primary font to IBM Plex Sans — the first switch away from serif entirely.
**Options considered:** Keep Source Serif 4, switch to IBM Plex Sans, another sans (Inter, system stack).
**Decision:** IBM Plex Sans via Google Fonts. Token value: `'IBM Plex Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif`. We load weights 300/400/500/600/700 + italics (IBM Plex Sans is a static family on Google Fonts — no `opsz` variable axis, so the `opsz` range was dropped from the font URL). Storybook previously loaded no webfont at all (fell back to system); added `.storybook/preview-head.html` so components render in the real face there too.
**Rationale:** IBM Plex Sans is a humanist sans — clearer at small UI sizes than a serif, modern and precise, open-source (SIL OFL). The change is isolated to one token (`--font-family-body`); every component consumes `var(--font-family-body)`, so no component CSS changed. This is a brand-direction shift: the original brief positioned serif as a luxury/editorial signal (see "Design Language: High-End Ecommerce" above), so downstream copy/positioning that leans on "literary serif" should be revisited.
**Follow-ups (not yet done):** (1) The `0.05em` `@supports not (text-box-trim)` fallback nudge was tuned for a serif — re-check optically in Firefox. (2) Heading `letter-spacing` is `normal` (a deliberate serif accommodation); a sans at display sizes may take slight negative tracking — evaluate. (3) Mirror the font swap in the storefront theme repo. (4) Full component visual-regression pass (Chromatic).
**Status:** Active

---

### Semantic Tokens: tokens.json Is the Single Source, Build Fails on Bad References

**Date/Phase:** 2026-07-01 — System audit
**Context:** `build-css.mjs` ignored the `semantic` section of `tokens.json` entirely and hardcoded its own semantic mappings in template strings. The two sources had drifted: `info-subtle`/`info-foreground` existed only in the script, and the dark-mode `--color-info-foreground` referenced `slate.300` — a primitive that doesn't exist — so the emitted CSS contained the literal value `undefined` (a silent runtime failure, since CSS variables don't error).
**Options considered:** (a) Patch the script's bad reference; (b) move the full semantic tier — light AND dark — into `tokens.json` and make the script resolve `{primitive.*}` references, throwing on any unresolved reference.
**Decision:** Option (b). `tokens.json` now has `semantic.color.light` and `semantic.color.dark` (32 tokens each, enforced parity), including the previously script-only `info-subtle`/`info-foreground`. Dark `color-mix()` values live in the JSON as literal `$value` strings. The build throws on unresolved references. Also fixed the dark `info` pair to match its status siblings: `info` = slate.500, `info-foreground` = slate.400 (success/warning/destructive all follow base=`.500`, foreground=`.400` in dark mode; info had been shifted one step).
**Rationale:** A token file that the build ignores is worse than no token file — it documents a lie. Failing the build on a dangling reference converts the silent `undefined` class of bug into a loud one.
**Status:** Active

---

### Text Tone Roles: Contrast Floor for Readable Text Is `foreground-secondary`

**Date/Phase:** 2026-07-01 — System audit
**Context:** Computed WCAG ratios on the light background (stone.50): `foreground-muted` (stone.400) = 2.52:1, `foreground-subtle` (stone.500) = 3.87:1, `foreground-secondary` (stone.600) = 5.96:1. Muted and subtle were widely used for hints, placeholders, captions, and meta text — all normal-size readable text, all failing WCAG AA (4.5:1). Muted even fails the 3:1 non-text bar.
**Options considered:** (a) Darken the stone primitives (changes the brand ramp everywhere); (b) remap the semantic values (collapses three tones into one); (c) keep the tones but define strict roles and move failing usages up.
**Decision:** Option (c). Roles are now: `foreground` = primary text; `foreground-secondary` = the FLOOR for any normal-size readable text (5.96:1 ✓); `foreground-subtle` = large text (≥24px / ≥18.7px bold) and non-text UI glyphs only (3.87:1 passes 3:1); `foreground-muted` = disabled and decorative elements only (WCAG-exempt). Swept all component CSS usages to comply.
**Rationale:** The palette isn't broken — the roles were. Keeping three tones preserves the visual range for legitimate uses while making "readable text passes AA" structurally true. Badge's documented subtle border (4.07:1 non-text) unchanged.
**Status:** Active

---

### Deleted: `mega-menu/` (empty) and `sidebar-nav/` (dead, broken import)

**Date/Phase:** 2026-07-01 — System audit
**Context:** `mega-menu/` was an empty directory (created 2026-03, never built). `sidebar-nav/` contained a single `SidebarNav.tsx` that imported `./SidebarNav.css` — a file that doesn't exist — and was never exported from the package index nor referenced by docs or theme. It would fail the build the moment anyone exported it.
**Options considered:** Complete them to the 4-file rule now, or delete and rebuild when actually needed.
**Decision:** Deleted both. Git history preserves the SidebarNav draft if a future navigation epic wants it.
**Rationale:** A component that ships broken imports is a landmine, not an asset. The 4-file rule exists precisely so the library never contains half-components.
**Status:** Active

---

### Tokenized the Page Container Width (`--size-container`, 1200px)

**Date/Phase:** 2026-07-01 — System audit
**Context:** `1200px` was hardcoded in three places (`layout-grid.css`, `Header.css`, `Footer.css`) with no token, while `--size-container-wide` (1396px, the docs-shell width) and `--size-content-xl` (1280px) already existed — three container widths, only two of them named.
**Decision:** Added primitive `size.container: 1200px` → `--size-container`; all three files now reference it. Width taxonomy: `--size-container` (1200) = page content container / 12-col grid; `--size-content-xl` (1280) = shell elements; `--size-container-wide` (1396) = full shell incl. padding (announcement bar, docs shell).
**Rationale:** After renaming/adding tokens the playbook rule applies: grep for stragglers — done, zero remaining hardcoded `1200px` in component CSS.
**Status:** Active

---

### Extended φ Duration Chain; Retired the Last Raw Durations and Opacities in Components

**Date/Phase:** 2026-07-01 — System audit
**Context:** Button's spinner hardcoded `0.65s`; reduced-motion fallbacks and the stock pulse hardcoded `opacity: 0.5`/`0.4`. The duration scale stopped at `slow` (262ms), leaving no token for longer animation loops.
**Decision:** Extended the φ chain with `slower` (424ms ≈ 262×φ) and `slowest` (686ms ≈ 424×φ). Button spinner now uses `--transition-duration-slowest` (686ms ≈ the old 650ms). Raw opacities replaced with `--opacity-high`/`--opacity-medium`/`--opacity-full`. StockIndicator's 2s ambient pulse stays as a documented component token (`--stock-indicator-pulse-duration`) — ambient status rhythm is deliberately outside the interaction-duration scale.
**Rationale:** Same ratio at every scale level; exceptions are named and explained where they live.
**Status:** Active

---

### Rename: `--size-container-max` → `--size-container-wide`

**Date/Phase:** 2026-07-01 — Owner asked "is this documentation best practice? seems complicated"
**Context:** The width documentation read as complicated because the naming was: `container` (1200) vs `container-max` (1396) implies a min/max of one concept, when they are actually two page frames owned by different surfaces (design system vs storefront). Every doc page needed a paragraph of disambiguation to fight the name.
**Decision:** Renamed the token to `--size-container-wide` — same concept (a page frame), explicitly the wide variant. Applied across tokens.json, component CSS (AnnouncementBar), docs pages, playbook current-fact docs, CLAUDE.md, and all four storefront CSS files + its re-synced tokens.css. No compatibility alias: both repos are fully in-hand and were grepped to zero stragglers (per the token-rename rule in Build & Dev Reference). Historical decisions-log entries keep the old name for accuracy; this entry is the bridge.
**Rationale:** When documentation needs a paragraph to explain a name, fix the name, not the paragraph. `container` / `container-wide` reads as what it is: the standard frame and the wide frame.
**Status:** Active

---

### Storefront Page Frame: 1300px Visible on Wide Screens — Documented Divergence, Not Ported Back

**Date/Phase:** 2026-07-01 — Owner direction (Alvin)
**Context:** The storefront repo (`sixbase/mason-storefront`) runs its entire page frame — `.ds-page-container` (layout.css), header inner, footer inner, announcement bar — at `max-width: var(--size-container-wide)` (1396px), which with 48px desktop padding gives **1300px visible content** on wide screens. The design system's own container is `--size-container` (1200px). The storefront's file comments still claimed 1200px, contradicting its own code, and neither playbook documented the split.
**Options considered:** (a) Port 1300 back into the DS so both match; (b) keep the DS at 1200 and record the storefront's 1300 as a deliberate divergence.
**Decision:** Option (b), per owner direction: the storefront's wide-screen frame is storefront-side and stays there. Documented in `09-layout-grid.md` ("Storefront divergence" section) and the `03-tokens.md` width taxonomy; corrected the storefront's stale comments (`layout.css` header block, `customer.css`) to match its code; noted in `CLAUDE.md` so future sessions don't "fix" the storefront back to 1200.
**Rationale:** An ecommerce page earns a wider frame — product grids and lifestyle imagery use the room; documentation prose doesn't. Both values are tokens (`--size-container`, `--size-container-wide`) defined once in tokens.json, so this is two named widths with owners, not drift. The grid inside the frame (12 columns, 24px gutters, 64px rhythm) is identical on both sides.
**Status:** Active

---

### Global Scrollbar Treatment: Thin, Token-Colored, Standard Properties Only

**Date/Phase:** 2026-07-01 — Responsive/polish pass
**Context:** Scrollbars were browser-default everywhere — visually loud against the stone palette, and inconsistent between the docs, Storybook, and the storefront.
**Options considered:** (a) `::-webkit-scrollbar` pseudo-elements (full control, but Chrome ignores them once standard properties are set, and they're legacy-Safari-only at that point); (b) standard `scrollbar-width: thin` + `scrollbar-color` (Chrome 121+, Firefox, Safari 18.2+); (c) both.
**Decision:** Option (b), applied globally in the tokens.css global layer: `* { scrollbar-width: thin; scrollbar-color: var(--color-border-strong) transparent; }`. No hover states, no tracks — the scrollbar recedes. Dark mode swaps automatically via the semantic token. Older engines get native scrollbars (macOS overlay scrollbars are already minimal).
**Rationale:** Same progressive-enhancement bar as `text-box-trim` (Safari 18.2+). One rule, token-driven, zero per-component work; the existing `.ds-scroll-hidden` utility still wins on specificity. Synced to the storefront's tokens.css.
**Status:** Active — but the "Safari 18.2+" claim was wrong. Safari ignores these props and keeps its native auto-hiding scrollbar (uncolored). We tried a WebKit fallback to color it and then reverted; see "Scrollbar Treatment: Safari Keeps Native Auto-Hiding Bars (WebKit fallback reverted)" below.

---

### Scrollbar Treatment: Safari Keeps Native Auto-Hiding Bars (WebKit fallback reverted)

**Date/Phase:** 2026-07-02
**Context:** The custom stone-colored scrollbar rendered in Chrome but not Safari — Safari showed native macOS scrollbars. Attempts to fix it in Safari with `::-webkit-scrollbar` produced an **always-visible** bar, and the user's actual requirement surfaced: the scrollbar should **auto-hide (only visible while scrolling)**, matching Chrome's overlay behavior.
**The hard platform constraint:** In Safari there is no way to get a scrollbar that is *both* custom-colored *and* auto-hiding. The native overlay scrollbar auto-hides but cannot be recolored (Safari doesn't support the standard `scrollbar-width`/`scrollbar-color` props — the "Safari 18.2+" claim in the entry above was wrong). The only way to color a scrollbar in Safari is `::-webkit-scrollbar`, but styling it opts the element into a **classic, always-visible** bar. So it's strictly one or the other. Chrome escapes the dilemma only because it supports `scrollbar-color` on its *overlay* (auto-hiding) scrollbar — Safari has no equivalent.
**Dead ends tried (both reverted):** (1) `::-webkit-scrollbar` with `var()` colors — Safari doesn't resolve custom properties inside these pseudo-elements, so it fell back to the default thick light bar. (2) Same block with concrete token values injected at build time (light default + `.dark`/`[data-theme]` overrides) — colored correctly but was **always visible**, which is exactly what the user did not want. Confirmed via a real-Safari screenshot from the user.
**Decision:** Do **not** style scrollbars for Safari at all. Keep only the standard `* { scrollbar-width: thin; scrollbar-color: … }` for Chromium/Firefox (custom color *and* auto-hide there). Safari falls through to its native auto-hiding overlay scrollbar — uncolored, but it hides when idle. Auto-hide beats color when forced to choose. The `.ds-scroll-hidden::-webkit-scrollbar { display: none }` hide-utility stays (it hides, doesn't paint).
**Rationale:** The original goal ("make Safari match Chrome") is literally unachievable — no CSS delivers colored + auto-hiding in Safari. Given the choice, an unobtrusive native bar that respects the OS "show scrollbars while scrolling" setting is a better UX than a permanent stone bar taking up gutter space. Note: if a user's macOS is set to *Show scroll bars: Always* (System Settings → Appearance), even native bars stay visible — that's an OS setting, not our CSS.
**Verification note:** Chrome path re-confirmed unchanged in the local preview. Safari path can't be driven from the Chromium preview — validated by user screenshot that the always-visible bar was unwanted; needs a final real-Safari eyeball after the revert to confirm it now auto-hides.
**Status:** Active

---

### Alert Redesign: Neutral Card + Colored Icon Chip

**Date/Phase:** 2026-07-02
**Context:** The Alert used a tinted background + a colored `border-left` accent with `border-radius: md`. Two problems: the rounded corners fought the single-sided left border (the bar cut across the rounded corner — violates our own "no rounded corners on single-sided borders" rule), and the full-bleed semantic tint went muddy in dark mode (`*-subtle` is a 12% color-mix over the dark surface).
**Options considered:** Mocked six directions for the user (left-bar+tint, soft tint no-bar, solid fill, white card + round tint chip, white card + solid icon badge, top accent line). User picked the **round tint chip** on a neutral card.
**Decision:** Neutral card (`background-surface`, 1px `border`, `radius-lg`) with a top-aligned round icon chip (`spacing-8`, `radius-full`) that carries the only semantic color: chip background = `*-subtle`, icon = the solid accent. Title = `foreground`, description = `foreground-secondary` — both neutral. Variants now set only `--alert-chip-bg` + `--alert-icon`; the card is identical across all four.
**Rationale:** Moving color into a small chip keeps the surface calm and legible in both themes (no more muddy tint), and drops the rounded-corner-vs-left-border conflict entirely. Icon is `align-items: flex-start` so the chip pins to the top line, not vertically centered. All token-driven; 18 tests incl. axe still pass; API unchanged.
**Status:** Active

---

### Docs Shell: Off-Canvas Mobile Navigation Below 1024px

**Date/Phase:** 2026-07-01 — Responsive pass
**Context:** The docs shell was a fixed `240px + 1fr` grid at every viewport — at 375px the sticky sidebar consumed 64% of the screen, leaving ~135px of content and horizontal page scroll. No mobile navigation pattern existed at all.
**Options considered:** (a) Hide the sidebar below a breakpoint with no replacement (dead-ends navigation); (b) collapse to a top nav bar with inline links (46 component links don't fit); (c) off-canvas drawer: mobile topbar (hamburger + logo) + the existing sidebar sliding in from the left over a backdrop.
**Decision:** Option (c). Below 1024px the layout is single-column with a sticky topbar; the sidebar becomes a fixed off-canvas panel (`min(280px, 85vw)`) toggled by a hamburger (`aria-expanded`/`aria-controls`, Escape closes and returns focus, backdrop click closes, link click closes, page scroll frozen while open). A `Menu` icon was added to the icon registry (and its explicit barrel export — see gotcha below). Also: `100vh` → `100dvh` fallbacks on the shell and Modal (iOS dynamic toolbar), content padding steps down below 768px, multi-column docs tables become their own scroll containers below 640px (`display: block; overflow-x: auto` — no wrapper markup needed), and the three gallery demos with fixed inline widths got `maxWidth: '100%'`.
**Gotchas captured:** (1) The backdrop div initially participated in the desktop grid as a child of `.layout`, silently shifting the columns — structural elements that exist for one breakpoint must be `display: none` outside it. (2) The icon registry's barrel (`icon/index.ts`) is an explicit export list — a new icon in `icons.tsx` is invisible to consumers until added there. (3) After rebuilding `@ds/components`, the docs dev server serves stale Vite-optimized deps — restart it, don't debug phantom hydration errors.
**Verification:** 0px horizontal overflow at 375/768/1280 on the colors, layout, homepage-example, and add-to-cart pages; drawer interaction verified in-browser; 638 tests green.
**Status:** Retired with the Astro docs site (2026-09-25) — see "Docs Site Retired → Visual Workbench Built on Stories". History only.

---

### Accent Ramps Extended to 12 Steps, Harmonized on the Stone Spine

**Date/Phase:** 2026-07-01 — System audit (follow-up color pass)
**Context:** Stone had 12 steps but the four accent ramps (brick, sage, amber, slate) had only 6 (50, 100, 400, 500, 600, 700). No tinted washes lighter than 50, nothing between the pastel 100 and the vivid 400, and no dark steps at all — so dark-mode surface tints leaned on `color-mix()` and any future dark accent use would have invented values.
**Options considered:** (a) Hand-pick the missing steps per ramp; (b) adopt an off-the-shelf palette (Radix/Tailwind) — discards the brand anchors; (c) derive the missing steps programmatically in OKLCH using stone's lightness curve as the shared tonal spine, preserving all 24 existing anchor hexes byte-identical.
**Decision:** Option (c). Every ramp now carries the identical step set `0–950` (12 steps). New steps per accent: `0` (faintest wash, ~45% of the 50-tint's chroma), `200`/`300` (OKLCH interpolation between the 100 and 400 anchors, lightness riding the stone spine plus the ramp's interpolated offset), `800`/`900`/`950` (descent from 700 with lightness offset and chroma tapering by powers of 1/φ, converging on the stone dark ground). Hue held constant below 700; sRGB gamut enforced by chroma reduction.
**Rationale:** Harmony with the stone backgrounds in both themes falls out of the construction: accent steps match stone's perceived depth step-for-step, and both ends of every ramp converge toward the backgrounds they'll sit on. φ-power tapering keeps the derivation on the system's proportional foundation. Verified: monotonic lightness in all ramps; all pre-existing contrast pairs unchanged (anchors untouched); new dark-text options clear WCAG with room (`300` on `stone.950` ≥ 9:1 in all four ramps). Generation script: OKLCH conversion + interpolation, archived in the session scratchpad and reproducible from this entry's parameters.
**Synced downstream:** `assets/tokens.css` in `sixbase/mason-storefront` re-generated from this build. The theme's two local value patches were retired: dark `--color-info-foreground` (hand-patched `#A9B8D4` over the old `undefined` bug) is now the canonical slate.400, and light `--color-foreground-subtle` (`#6E675E` AA workaround) returned to canonical `#847D73` with the theme's *usages* swept to `foreground-secondary` instead — same role contract as the DS. The theme's per-component reduced-motion strategy (its documented replacement for the global block) was preserved in the synced file.
**Status:** Active

---

### Layout Grid: `!important` Removed via `:where()` Specificity Flattening

**Date/Phase:** 2026-07-01 — System audit
**Context:** The mobile stack rule (`.ds-layout > * { grid-column: 1 / -1 }`) needed `!important` to beat positional variant selectors like `.ds-layout--golden > :first-child` (0,2,0).
**Decision:** Wrapped the positional pseudo-classes in `:where()` so every variant rule sits at (0,1,0); the mobile rule, last in the file, now wins by cascade order alone. `!important` deleted — the codebase is back to zero.
**Rationale:** `:where()` is the purpose-built tool for keeping utility-tier CSS flat. Cascade order is the design; `!important` was the workaround.
**Status:** Active

---

### Responsive Foundation Tokens (Fluid Spacing, Aspect Ratio, Elevation, Safe Area, Interaction)

**Date/Phase:** 2026-07-06 — Token foundation upgrade
**Context:** Several responsive/interaction values lived outside the token system: section rhythm was fixed-per-breakpoint while type had gone fluid; aspect ratios, the 0.98 press scale, and the 65ch reading width were raw values repeated across components (`scale(0.98)` in 5 components, `65ch` in 4); shadows had no semantic layer; safe-area insets and touch-hit minimums had no tokens at all.
**Options considered:** (a) Leave as component-level conventions (keeps repeating magic numbers); (b) per-component tokens (fragments a shared physical constant into N names); (c) foundation tokens in `tokens.json`, emitted by `build-css.mjs` — one name per concept, φ-derived where a scale is involved.
**Decision:** Option (c). Added: **fluid spacing** `--spacing-fluid-sm/md/lg/xl` — `clamp()` between adjacent phi-scale steps (16→26, 26→42, 42→68, 68→110px) interpolated across 375→1200px viewports, same technique as the fluid type scale, so each token grows by exactly ×φ from phone to desktop; **aspect ratios** `--aspect-square/portrait/landscape/video/golden/golden-portrait`; **semantic elevation** `--elevation-card/dropdown/sticky/modal/toast` emitted as `var(--shadow-*)` references (never copied values); **safe area** `--safe-area-top/right/bottom/left` = `env(safe-area-inset-*, 0px)`; **interaction** `--scale-press` (0.98), `--size-hit-area` (44px invisible minimum hit zone — distinct from `--size-touch-target`, the 36px visual icon-button size), `--size-swipe-threshold` (50px, JS-consumable via the tokens JSON export); **reading measure** `--measure-reading` (65ch). Also upgraded the **display type scale to fluid**: `display-md/lg/xl/2xl` now `clamp()` from 72% of the desktop value at 375px up to the φ-scale max at 1200px (`display-xs/sm` stay fixed for legibility, mirroring `xs`/`sm` on the default scale).
**Rationale:** Fluid spacing completes the no-breakpoint responsive story the type scale started, with φ preserved at both clamp endpoints. Elevation-as-reference keeps a single source of truth for shadow values. Naming the press scale, hit area, and reading measure converts today's repeated magic numbers into greppable, documented decisions. No existing token names or values changed except the display fluid upgrade — verified no component consumes `--font-size-display-*` yet (docs pages only).
**Status:** Active — component consumption sweep landed 2026-07-06: all `scale(0.98)`, `65ch`, and raw `aspect-ratio` values in `packages/components/src` replaced with `--scale-press`, `--measure-reading`, and `--aspect-*`; Drawer panel → `--elevation-toast`, Select/PredictiveSearch dropdowns → `--elevation-dropdown` (Modal/Header were converted when the tokens landed). Value-preserving only — Card (rests at `shadow-sm`, not the `shadow-md` that `--elevation-card` maps to), Toast (`shadow-lg` vs `--elevation-toast`'s `2xl`), and CookieConsent (`shadow-xl`, no matching semantic tier) were deliberately left on shadow primitives; aligning them to the elevation table is a visual change needing its own decision.

---

### ProductCard Goes Container-Query — First Container-Query Component in the System

**Date/Phase:** 2026-07-06 — Ecommerce component robustness sweep
**Context:** ProductCard's internals (insets, type steps, corner radius) only adapted at viewport breakpoints, but the card lives in grids of arbitrary column counts — a 4-up desktop grid cell can be narrower than a 2-up mobile cell, so viewport queries target the wrong thing.
**Options considered:** (1) More viewport breakpoints per grid context (fragile, page-level knowledge leaking into the component); (2) size-prop proliferation (`sm`/`xs` variants chosen manually per grid); (3) CSS container queries — the card adapts to its own cell width.
**Decision:** Option 3. `.ds-product-card` declares `container: product-card / inline-size`; `@container product-card (max-width: 200px)` tightens insets (`--spacing-phi-3/-5`), corner (`--radius-2xl`), and type; `(min-width: 320px)` relaxes type up to `--font-size-base`, mirroring the `lg` variant. The 220px standalone card sits between both thresholds so the storefront-aligned reference appearance (34px editorial corner, 4:5 `--aspect-portrait` ratio, phi insets, mobile steps at `max-width: 767px`) is untouched. The viewport mobile rule stays last in the file so it wins ties by cascade order.
**Rationale:** Container queries make the card correct in ANY grid without page-level overrides — the component owns its responsiveness the same way it owns its styles. `inline-size` containment is safe because card width always comes from the width token or the parent grid, never from content. Browsers without support simply keep the reference appearance. Pattern to reuse: name the container after the component (`container: <component> / inline-size`), pick query thresholds that leave the component's default fixed width inside the "reference" band, and keep viewport rules after container rules when both may match.
**Status:** Active

---

### Touch Hit-Area Pattern: Centered Pseudo-Element, Coarse-Pointer Guard When Adjacent

**Date/Phase:** 2026-07-06 — Ecommerce component robustness sweep
**Context:** VariantSelector options (34px sm height), StarRating stars, and ProductCard action-slot buttons are below the 44px touch minimum. `--size-hit-area` (44px) existed but nothing consumed it with a shared pattern.
**Decision:** Invisible hit extension via pseudo-element on a `position: relative` control: `::after` (or `::before` when `::after` is taken), absolutely centered, `width/height: max(100%, var(--size-hit-area))`. Guarded by `@media (pointer: coarse)` wherever controls sit adjacent (variant options, star radios) so desktop hover targeting stays precise; unguarded for isolated controls (ProductCard `actionSlot`). Slotted content gets the pattern through `:where(button, a)` so specificity stays flat.
**Rationale:** Zero visual change, zero layout change, token-driven, and the coarse-pointer guard prevents overlapping invisible targets from stealing mouse hovers between neighbors.
**Status:** Active

---

### Unavailable Color Swatches: Diagonal Slash via aria-label Attribute Selector (ColorPicker API Gap)

**Date/Phase:** 2026-07-06 — Ecommerce component robustness sweep
**Context:** Unavailable color swatches in VariantSelector had no visual marker at all (only the "(out of stock)" aria-label suffix); button options used opacity + text strikethrough. Accessibility rule: unavailability must not be communicated by opacity alone. ColorPicker has no `unavailable` option flag, and ColorPicker was out of scope for this sweep.
**Decision:** VariantSelector.css draws a rotated 2px `::after` slash (`--color-border-strong`) on `.ds-color-picker__btn[aria-label$="(out of stock)"]`. Both halves of the contract live in VariantSelector (it writes the suffix in `ColorOptionGroup` and matches it in its own CSS), so the coupling is component-local.
**Rationale:** Works today without touching ColorPicker; a test pins the selector contract. **Flagged gap:** ColorPicker should grow a proper `unavailable?: boolean` on `ColorOption` so the slash can move into ColorPicker itself and the attribute-selector hack can be deleted. Second flagged gap from the same sweep: dark-mode `--color-destructive` (#C45040 on #131010) measures ~4.1:1 — below AA for normal-size sale prices; needs a lighter dark-mode destructive text step in tokens.
**Status:** Active — pending ColorPicker API + dark destructive token follow-ups

---

### Component Library Expansion — 16 New Components (Wave 2)

**Date/Phase:** 2026-07-06 — System-wide responsive overhaul
**Context:** The library covered core ecommerce surfaces but lacked standard form controls (switch, radios, textarea), overlay primitives (tooltip, popover, dropdown menu), and several commerce staples (price-range slider, checkout stepper, sale countdown, dismissible filter tags).
**Decision:** Added: Switch, RadioGroup, Textarea, Tooltip, Popover, DropdownMenu, Slider (single + dual-thumb range), Stepper, Spinner, Tag, Avatar, SkipLink, Countdown, SegmentedControl, plus the previously-missing LayoutGrid React wrapper (fixing the system's own 4-file-rule violation) and Grid/Container doc pages. All follow the 4-file rule, label/hint/error form conventions, 44px hit areas, reduced-motion guards, and story-parity docs pages. New Radix deps: react-switch, react-radio-group, react-slider, react-tooltip, react-popover, react-dropdown-menu.
**Notable API decisions within the wave:** QuantitySelector standardized on the APG **spinbutton** pattern (editable input, +/- buttons `tabIndex=-1`); SegmentedControl is a **radiogroup**, not tabs (it selects a value, doesn't switch panels); `Heading display` maps sizes **rank-preserving** (xl→display-md … 4xl→display-2xl) because literal suffix mapping can't cover 3xl/4xl; indeterminate ProgressBar renders a **div track** (attribute-less native `<progress>` can't be animation-styled cross-browser); Drawer `size` has **no default** so legacy 640px width is preserved; Tag vs Badge: Badge displays status, Tag is interactive/removable.
**Status:** Active

---

### Mobile Navigation: Header Composes Drawer; Skip Link Ships in Header

**Date/Phase:** 2026-07-06 — System-wide responsive overhaul
**Context:** Below 768px the Header simply hid its nav — there was no mobile navigation at all.
**Options considered:** (a) Bespoke hamburger menu markup in Header; (b) compose the existing Drawer component; (c) a new dedicated MobileNav component.
**Decision:** Option (b). Hamburger (44px hit area) below 768px opens Drawer side="left" containing the same nav links as 44px-tall rows. `aria-expanded` on the trigger; `aria-controls` applied only while the portal content is mounted. Controlled/uncontrolled via `menuOpen`/`onMenuOpenChange`. A skip-to-content link (sr-only until focus) is Header's first focusable element (`skipHref` prop, default `#main-content`); a standalone SkipLink component also exists for non-Header pages. Header also gained `sticky` (uses `--z-index-sticky` + `--elevation-sticky`) and a visual cart-count pill.
**Rationale:** Drawer already owns focus trap, dismissal, animation, and reduced-motion; duplicating that in Header would drift. Radix modal behavior hides the inert desktop nav, so duplicate `aria-label="Main"` landmarks stay axe-clean.
**Status:** Active

---

### Mobile Overlay Ergonomics: Bottom Sheet Is a Drawer Variant; Modal Gets fullScreenOnMobile

**Date/Phase:** 2026-07-06 — System-wide responsive overhaul
**Context:** Phones need sheet-style overlays (thumb-reachable, notch-safe); the system had only centered modals and side drawers.
**Decision:** Bottom sheet = `Drawer side="bottom"` (slides up, `--radius-2xl` top corners, `max-height: 85dvh`, visual-only drag handle, `--safe-area-bottom` padding) — not a new component. Modal gained `fullScreenOnMobile` (below 640px: inset 0, 100dvh, no radius, safe-area padding; scale animation swapped for fade). All overlay content areas use `max(spacing-token, var(--safe-area-*))` on their anchored edges.
**Rationale:** A sheet is positionally a drawer; a separate component would duplicate the Radix Dialog wiring. Safe-area handling belongs to the overlay components, not to pages.
**Status:** Active

---

### Table Mobile Strategy: responsive="stack" Card Layout with Conditional ARIA Roles

**Date/Phase:** 2026-07-06 — System-wide responsive overhaul
**Context:** Table's only small-screen behavior was forced horizontal scroll — unusable for order history and spec tables on phones.
**Options considered:** (a) Scroll only (status quo); (b) hide low-priority columns; (c) stack rows into label/value cards below 640px.
**Decision:** New `responsive="stack"` opt-in (default remains `"scroll"`). Below 640px each row becomes a bordered card; each cell renders its column header as a label on a **1fr / 1.618fr golden split**, injected via `data-label` (header text flows Table→context→Row→cloned Cells). Markup stays a semantic `<table>`; explicit ARIA table roles are applied **only in stack mode** to survive the CSS `display` overrides; `<thead>` is sr-hidden, not `display:none`. Scroll mode's region is now keyboard-focusable (`tabIndex=0`), and sortable headers are real buttons with `aria-sort` + `onSort`.
**Rationale:** CSS-only responsive (per playbook law) — full DOM renders, display changes at the breakpoint. Golden split keeps the stacked cards on the system's proportional foundation.
**Status:** Active

---

### Motion Layer: `@ds/motion` — CSS for Micro-Interactions, Lazy GSAP for Choreography

**Date/Phase:** 2026-09-25 — Motion + break-it audit
**Context:** The brief: "visually elegant and amazing", leaning on GSAP, while staying fast on phones over cellular. The system had only CSS transitions on Material-standard curves and no way to sequence motion across elements.
**Options considered:** (a) GSAP everywhere, including hover/press and overlay open/close; (b) CSS only (scroll-driven animations, `@starting-style`); (c) split by job — CSS for micro-interactions, GSAP for choreography, loaded lazily.
**Decision:** (c). New package `@ds/motion` (vanilla core + `@ds/motion/react` hooks + `@ds/motion/css`). Declarative `data-motion="reveal|stagger|split|media|parallax"` works identically in React, Astro and Liquid. Imperative `enter()` for content that arrives after load; `createFlip()`/`useFlip()` for layout changes; `flyToCart()` + `bump()` for the add-to-cart moment. Hero entrance (`data-motion="hero"`) and page transitions are CSS-only.
**The performance contract** (each point covered by `packages/motion/src/motion.test.ts`):
1. Nothing is hidden before GSAP has loaded — no CSS pre-hides content. A failed or slow script leaves a static page.
2. Only elements fully below the fold (measured *after* GSAP arrives) are prepared for reveal; what's visible never blinks out. Above-the-fold motion is CSS, so LCP isn't delayed.
3. Hidden = opacity only, never visibility/display: content stays in the a11y tree; focusing into it or printing reveals it instantly.
4. Every inline style GSAP writes is cleared on settle (`clearProps`), so elements end in their authored CSS state.
5. GSAP downloads only when a page declares motion, in idle time, and never for reduced motion, Save-Data, or 2G-class connections (`getMotionLevel()`).
6. Reveals are triggered by IntersectionObserver, not ScrollTrigger: phones pay for GSAP core only (28KB gz). ScrollTrigger (18KB) loads only for parallax on ≥768px fine-pointer devices. Flip (10KB) and SplitText (4KB) load only where used.
**Rationale:** (a) puts a 28KB+ dependency on the critical path of every interaction and breaks everything before JS loads; (b) can't do FLIP, line-split text, or cross-element moments, and scroll-driven animations aren't in Safari. (c) gives GSAP the work only it does well. GSAP has been 100% free including all plugins since 3.13 (Webflow); its license only excludes building a competing visual site builder, which this isn't.
**Inline styles:** GSAP writes transient inline `transform`/`opacity`. This is runtime animation state, not authored styling, and the contract clears it on settle — the "no inline styles" rule governs authored markup. Documented here so an audit doesn't flag it.
**Status:** Active

---

### φ-Derived Expressive Easing + Motion Tokens (Stagger, Distance) + JS Token Export

**Date/Phase:** 2026-09-25 — Motion + break-it audit
**Context:** Only Material-standard curves existed; GSAP needed the same values as CSS without reading custom properties per frame.
**Options considered:** (a) Popular curves (expo-out 0.16,1,0.3,1; back-out 0.34,1.56,0.64,1); (b) curves whose control points are φ powers; (c) GSAP's built-in named eases (no CSS parity).
**Decision:** (b): `emphasized` (0.146, 1, 0.382, 1), `emphasized-in` (0.618, 0, 0.854, 0), `glide` (0.618, 0, 0.382, 1), `spring` (0.382, 1.618, 0.618, 1). Stagger continues the ×φ duration series down (62ms, 38ms, plus 100ms loose); distance reuses phi spacing (10/16/26/42px). `@ds/tokens` now exports `motion` (numbers) from a generated `src/motion.json` subset; `@ds/motion` registers every easing token as a GSAP ease `ds.<name>` using its own ~40-line cubic-bezier solver instead of CustomEase (saves 3KB gz).
**Rationale:** The φ curves land within a hair of the popular curves (emphasized ≈ expo-out; spring ≈ back-out with y₁ = φ), so nothing is lost in feel, and the motion scale now follows the same law as every other scale. One source (tokens.json) drives both CSS and GSAP.
**Status:** Active

---

### Native Cross-Document View Transitions for Page Navigation

**Date/Phase:** 2026-09-25 — Motion + break-it audit
**Context:** Page-to-page navigation was a hard cut. Options: Astro's `<ViewTransitions />` client router, a GSAP page-transition script (barba-style), or the native CSS `@view-transition { navigation: auto }`.
**Decision:** Native CSS, shipped in `@ds/motion/css`, gated on `prefers-reduced-motion: no-preference`. Outgoing page fades fast (normal, emphasized-in); incoming rises 10px (slower, emphasized). Regions that must stay put opt in with `data-motion-persist="header|nav"` (docs sidebar, site header).
**Rationale:** Zero JS, zero bytes, works on any multi-page site — Astro static and Shopify Liquid alike. Astro's router changes script semantics site-wide and needs JS; a GSAP router would need JS on every navigation. Unsupported browsers (Firefox today) navigate normally. Persisted names must be unique per page or the browser skips the transition — which is why it's opt-in, not on `.ds-header` (docs pages render several headers).
**Status:** Active

---

### Focus Ring: Solid 2px Ring with Background Gap (replaces 20% alpha halo)

**Date/Phase:** 2026-09-25 — Motion + break-it audit
**Context:** The foundation audit measured `--focus-ring` (3px at 20% alpha) at 1.39:1 against the page in light mode and 1.38:1 in dark — failing WCAG 1.4.11 / 2.4.13 (3:1). ~50 component rules use it as the *only* focus indicator (`outline: none` + ring).
**Decision:** `--focus-ring: 0 0 0 2px var(--color-background), 0 0 0 4px var(--color-focus-ring)` (8.7:1 light, 7.1:1 dark). Same shape for `--focus-ring-error` (destructive). `--focus-ring-inset` is a solid 2px inset. `--focus-ring-color` now equals `--color-focus-ring`. All composites are emitted per mode (see next entry). Components pair the ring with `outline: 2px solid transparent` so Windows High Contrast (which drops box-shadows) still paints a ring.
**Rationale:** One token change fixes every usage. The gap ring keeps the ring legible on any control color.
**Status:** Active

---

### Composite Tokens Per Mode; Dark Overlay Always Darkens; Dark Destructive → brick-400; `--color-border-control`

**Date/Phase:** 2026-09-25 — Motion + break-it audit
**Context:** (1) Composites declared once on `:root` kept light values inside nested `.dark` regions. (2) `--color-overlay` mixed `--color-foreground`, near-white in dark mode, so dark dialogs *lightened* the page. (3) Dark `--color-destructive` (brick-500) measured 4.12:1 as button label contrast and 3.69–4.12:1 as error text — failing AA wherever errors, sale prices and destructive buttons appear. (4) Form controls used `--color-border` (1.34:1) as their only boundary.
**Decision:** (1) `compositeBlock()` in build-css.mjs emits composites in both mode blocks; each block also sets `color-scheme`. (2) Overlay = stone-950 at 38.2% light / 61.8% dark. (3) Dark destructive = brick-400 (6.0:1 on bg, 5.38 on surface, 4.57 on its own tint), hover/active = brick-300 (9.3:1 with its label). The Badge/Toast/Avatar `.dark` destructive patches become redundant. (4) New semantic `--color-border-control`: light = 38.2% stone-400 + 61.8% stone-500 (#918A80, 3.0–3.4:1), dark = 61.8% stone-500 + 38.2% stone-600 (≥3.4:1). A φ mix of two existing primitives rather than a new ramp step.
**Rationale:** Contrast fixes belong in tokens, never in component `.dark` patches. The φ mix keeps the ramp generator untouched.
**Status:** Active

---

### Docs `.prose` Styles Live in a Cascade Layer

**Date/Phase:** 2026-09-25 — Motion + break-it audit
**Context:** `.prose table/th/td/code/pre` beat component styles inside doc pages — the third recurrence of the prose-specificity bug (Accordion text, Footer headings, now Table and inline code). Previous fixes bumped component specificity one at a time.
**Decision:** All `.prose` rules in `apps/docs/src/layouts/base.css` are wrapped in `@layer docs-prose`. Layered rules lose to unlayered rules regardless of specificity, so every component (unlayered) wins inside docs. `.prose > p` also gained `max-width: var(--measure-reading)`.
**Rationale:** Fixes the class of bug, not the instance. No component needs to know docs exist.
**Status:** Retired with the Astro docs site (2026-09-25) — see "Docs Site Retired → Visual Workbench Built on Stories". History only.

---

### Docs Performance: Per-Component Library Build + `client:visible` Islands + Zero-JS Footer

**Date/Phase:** 2026-09-25 — Motion + break-it audit
**Context:** Every docs page with any island shipped ~123KB gz of JS: the whole `@ds/components` library (one 200KB module) plus React DOM, and all 254 islands used `client:load` (hydrate immediately, even far below the fold). The static Footer was hydrated on every example page though it has no state.
**Decision:** (1) Multi-entry, code-split tsup build for `@ds/components` (see 02-tooling-setup). (2) Component galleries use `client:visible`; example pages `client:idle`; Header `client:idle`; Footer has no directive (server-rendered only). (3) Motion demos that must be hydrated before the reader scrolls to them use `client:idle`.
**Result (measured, `astro build`):** average 123.2KB → 56.8KB gz per interactive page; the floor is now React DOM (~45KB).
**Remaining:** CSS is one ~25KB gz sheet on every page; Google Fonts is a render-blocking cross-origin stylesheet. Next steps: self-host a Latin subset with a metric-matched fallback; per-component CSS.
**Status:** Partly retired — (1) the per-component library build is active (and got per-component CSS in round 4); (2) and (3) retired with the Astro docs site on 2026-09-25.

---

### Docs Site Retired → Visual Workbench Built on Stories

**Date/Phase:** 2026-09-25 — Workbench rebuild
**Context:** Alvin is the only person who uses the docs site, and what he needs is a place to go through components and visually confirm they work and look consistent — not documentation. The Astro site (73 pages of prose, props tables and code snippets, plus ~60 hand-written gallery files mirroring the stories) cost parity work on every component and still couldn't show a component at real phone width next to desktop, or light next to dark.
**Options considered:** (a) improve the Astro site; (b) configure Storybook minimal; (c) a purpose-built workbench that renders the existing stories.
**Decision:** (c). `apps/workbench` (Vite + React): sidebar grouped by kind with review-status dots; a toolbar for Theme (Light / Dark / Both) and Screen (Phone 375 / Tablet 768 / Desktop 1280 / All), test modes (Motion off, Outlines, Long text, RTL), Replay and an on-demand axe check; device frames as real iframes, scaled to fit, with linked scrolling; a state picker per component; a review bar (Not reviewed / Looks good / Needs work + note, stored in localStorage) with keyboard shortcuts (G, N, J/K, T, W, R); an Overview with progress and "Copy notes". Plus foundation sheets (colors with live contrast in the frame's theme, type, space/radius/elevation, motion), three consistency line-ups (control heights on guide bands, status colors, form states), and the eight store pages. Deployed to GitHub Pages in place of the docs.
**Rationale:** Stories already exist for all 58 components (418 states) and are the 4-file rule's specimens — rendering them directly removes the duplicate gallery layer entirely. Real iframes at true widths are the only way media/container queries behave like a device. Storybook (b) stays as the engineering tool and Chromatic baseline, but its UI is dense and it can't compare devices/themes side by side or track review verdicts.
**Removed:** `apps/docs` (Astro, galleries, doc pages, demo-utilities.css). Store-page demos, product data and motion demos moved to `apps/workbench/src/specimens/`.
**Status:** Active — Storybook itself was removed on 2026-09-27; the workbench is the only app. See "Storybook Removed — Workbench Is the Only App".

---

### `@ds/motion` Never Mutates Global GSAP State

**Date/Phase:** 2026-09-25 — Audit round 2
**Context:** `loadGsap()` called `gsap.defaults()` and `gsap.ticker.lagSmoothing()` on the shared GSAP instance. A store that also uses GSAP directly (Lenis smooth scroll with `lagSmoothing(0)`, its own tweens) would silently inherit our choices, and `killTweensOf` calls in `enter()`/`bump()` could kill the store's own tweens on the same elements.
**Decision:** No global mutation. Every tween passes its own duration and ease; the only global additions are the namespaced `ds.*` eases and plugin registration. Motion tracks and kills only its own tweens/timelines.
**Rationale:** A design system's animation layer is a guest on the page.
**Status:** Active

---

### Dark Mode Grey Ladder Mirrors Light

**Date/Phase:** 2026-09-25 — Audit round 2
**Context:** Dark `foreground-subtle` (stone-400, 7.1:1) and `foreground-muted` (stone-500, 4.7:1) were much stronger than their light counterparts (3.9:1, 2.5:1), so "disabled" text in dark didn't look disabled and the subtle/secondary steps collapsed.
**Decision:** Dark subtle → stone-500 (4.65:1 on bg, 4.17:1 on surface), dark muted → stone-600 (3.02:1). Secondary stays stone-300 (10.7:1).
**Rationale:** Same role, same relative step in both themes; every role still meets its rule (subtle ≥3:1 for large text/icons; muted is decorative/disabled only).
**Status:** Active

---

### One Radix Internals Version (menu-inside-dialog fix)

**Date/Phase:** 2026-09-25 — Audit round 2
**Context:** A Popover or DropdownMenu opened inside a Modal/Drawer couldn't be clicked, and one Escape closed both. Dialog resolved `@radix-ui/react-dismissable-layer` 1.1.11 while Popover/Menu/Tooltip resolved 1.1.15 (and `react-focus-scope` was split too) — two layer stacks that don't know about each other, so the popover inherited the dialog's `pointer-events: none`.
**Decision:** Update every `@radix-ui/*` dependency together (`pnpm update -r "@radix-ui/*"`, all within existing `^` ranges). The lockfile now resolves one version of each internal (dismissable-layer 1.1.19, focus-scope 1.1.16, portal 1.1.17…). Verified in the Modal "With popover" story: the popover receives clicks, and the first Escape closes only the popover.
**Rule:** Bump Radix packages as a set, never one at a time.
**Status:** Active

---

### Wrap Radix Parts — Never Rename Them

**Date/Phase:** 2026-09-25 — Audit round 3
**Context:** Modal, Popover and DropdownMenu re-exported Radix parts (`export const ModalTrigger = Dialog.Trigger`) and then set `ModalTrigger.displayName = 'ModalTrigger'`. That renamed Radix's own shared component, so every other Dialog/Popover on the page showed up in DevTools and error messages under our name.
**Decision:** Each exported part is a thin `forwardRef` wrapper with its own `displayName`. Tests assert the Radix object keeps its original name.
**Status:** Active

---

### Development-Only Misuse Warnings

**Date/Phase:** 2026-09-25 — Audit round 3
**Context:** Silent misuse (an icon-only button with no accessible name, a controlled `value` without `onChange`) rendered fine and failed only for screen-reader users or at runtime.
**Decision:** `internal/dev-warning.ts` logs a one-time console warning in development. It never throws, and the `process.env.NODE_ENV` check makes it dead code in production bundles. A missing `process` (unbundled browser) counts as production.
**Status:** Active

---

### One Money Formatter, Explicit Locale, Cents for Every Currency

**Date/Phase:** 2026-09-25 — Audit round 3
**Context:** Five components each built their own `Intl.NumberFormat` on every render (~160µs each on a throttled phone — a 48-card grid spent ~8ms just constructing formatters), all hardcoded to en-US/USD.
**Decision:** `internal/format-money.ts` caches one formatter per locale + currency. Price components take `currency` and `locale` props (defaults `USD`, `en-US`). The locale is never the runtime default, so server and browser format identically (no hydration mismatch). Amounts are integer hundredths for every currency, the Shopify convention: ¥4,800 = 480000.
**Note:** CLAUDE.md says prices in cents follow "the same convention as Shopify and Stripe". That is true for USD but not for zero-decimal currencies — Stripe sends JPY as whole yen. Convert at the API boundary. **Open (needs Alvin):** correct the CLAUDE.md line — tracked in `12-audit-2026-09-25.md` → "Open after five rounds"; suggested wording in the round 5 playbook pass report.
**Status:** Active

---

### Print and High-Contrast Token Modes

**Date/Phase:** 2026-09-25 — Audit round 3
**Context:** Printing a dark-mode page used a dark background (ink, and often dropped by the browser to white text on white). Users who ask the OS for more contrast got the same faint borders and grey text as everyone else.
**Decision:** `build-css.mjs` emits two adaptive blocks. `@media print` forces the light semantic + composite tokens on every theme. `@media (prefers-contrast: more)` raises `--color-border` to the control border and moves subtle/muted text one step darker (light) or lighter (dark). Components need no changes — they read the same tokens.
**Status:** Active

---

### iOS Page Globals Ship With the Tokens

**Date/Phase:** 2026-09-25 — Audit round 3
**Context:** iPhone Safari enlarged text after rotating to landscape and painted a grey flash over every tapped control, on top of our own pressed states.
**Decision:** `tokens.css` sets `text-size-adjust: 100%` and `-webkit-tap-highlight-color: transparent` on `html`. Every component already has visible `:active` and `:focus-visible` states, so the grey flash was redundant.
**Status:** Active

---

### Textarea `rows` Is the Minimum Height When Auto-Resizing

**Date/Phase:** 2026-09-25 — Audit round 3
**Context:** With `autoResize`, Chrome and Safari 26 size the field natively (`field-sizing: content`) and start at one line, ignoring `rows`. Firefox and older Safari use the JS fallback and start at `rows`. Same component, two starting heights.
**Decision:** The component passes `rows` as `--textarea-rows`, and CSS sets `min-height` to that many lines plus padding and borders. Measured: 2 rows = 60px in Chromium, WebKit and Firefox.
**Status:** Active

---

### Disabled Fades the Control, Not Its Hint

**Date/Phase:** 2026-09-25 — Audit round 3 (final sweep)
**Context:** Input, Select and Textarea faded only the field when disabled. Checkbox, Switch and RadioGroup faded their whole root, hint included — so "Add a phone number to enable" fell to 1.75:1, the one line telling you how to turn the setting on.
**Decision:** All form controls fade the control + label; hint and error text keep full contrast. The Input adornment ("USD", icons) also moved from `foreground-subtle` (4.06:1) to `foreground-secondary`, matching the placeholder.
**Status:** Active

---

### Round 4 — Guards, Semantics, Hit Areas, Packaging

**Date/Phase:** 2026-09-26 — Audit round 4 (seven parallel passes: code hygiene, WCAG 2.2 stress, screen-reader semantics, cross-component consistency, package health, motion feel/cost, workbench)
**Context:** Rounds 1–3 fixed what broke. Round 4 looked for what fails *silently* (no error, no test failure) and for criteria axe cannot test.
**Decisions (all active):**
- **`check-css` runs in lint.** Undefined `var()`, dead component tokens, raw values, stray `!important`, non-token breakpoints, ungated `:hover`. Exceptions live in its header. Chosen over stylelint: no dependency, 0.2s, rules written for this system.
- **`:hover` only inside `@media (hover: hover)`** (50 rules gated). Keyboard-highlight rules written as `:not(:hover)` stay ungated.
- **`.ds-motion-safe` opts an element out of the global reduced-motion reset,** which also now applies under `<html data-motion="off">`. An element with the class promises to handle both conditions itself with a non-moving animation. First user: Spinner's opacity pulse, which the `!important` reset had frozen as a solid ring.
- **Disabled fades the control and its inline label only** — field/group labels and hints stay full strength; one fade, never fade + muted colour; focused `aria-disabled` controls un-fade so the ring keeps 7:1.
- **Keyboard-highlighted list rows** (Select, DropdownMenu, PredictiveSearch) get a 2px inset focus-ring outline via `[data-highlighted]:not(:hover)` — 1.34:1 → ~8:1. `:focus-visible` can't be used: Radix focuses items from script on hover.
- **Live regions exist empty and speak on change** (`internal/use-change-announcement.ts`). Badge is no longer a live region by default (opt in with `role="status"`); ToastProvider keeps persistent polite/assertive regions. Resolves round-1 open items 4 and 5.
- **Popover is named after its trigger by default**; `aria-label`/`aria-labelledby` override; dev warning when unnamed. Tab is not trapped (non-modal dialog pattern).
- **ProductCard image is decorative by default** (the card link already carries the name); `imageAlt` gives it a real description.
- **Breadcrumb `schema` prop emits BreadcrumbList JSON-LD** (opt-in). FAQPage JSON-LD stays with the page — accordion answers are free-form.
- **Sticky header publishes `--sticky-header-height` and sets `scroll-padding-top`** so keyboard focus is never hidden under it (WCAG 2.4.11); sticky columns clear it.
- **Hit areas:** ≥24px for every pointer, 44px on touch, extended invisibly and outward only.
- **Packaging:** per-component CSS subpath exports, types split per condition, tsup `clean: true`, turbo outputs matching reality, stories type-checked through the workbench.
- **Motion:** stagger children individually as each enters (phones), a "fully visible" fallback observer, `Flip.getState(…, { simple: true })` and only on-screen leavers, fly-to-cart arc on `ds.glide`, `data-motion="off"` also cancels page view transitions.
**Status:** Active

---

### Shopify Theme Extracted to Its Own Repo

**Date/Phase:** 2026-06-25 (commit `a30c5b4`) — recorded 2026-09-26 in the playbook pass; no entry had been written at the time
**Context:** The theme lived in `apps/theme/` inside this monorepo ("Shopify Theme Location" above). Shopify's GitHub integration and CLI expect the theme at a repo root, and running the CLI from the wrong directory had already corrupted a dev theme (`07` → `#shopify-theme-dev-cwd`).
**Options considered:** (a) keep `apps/theme/` and deploy through a subdirectory workaround; (b) move the theme to its own repo, history preserved.
**Decision:** (b). The theme is `sixbase/mason-storefront`, checked out at `/Users/alvinthong/Code/mason-storefront`. It consumes the design system by copying `tokens.css` and porting component CSS/markup by hand.
**Rationale:** Deploys from the repo root with no workarounds, and the CLI can't be run against the wrong directory by accident. Cost: token and component changes no longer reach the theme in the same PR — the storefront drifts unless re-synced (on 2026-09-26 its `tokens.css` lacked ~50 current tokens).
**Status:** Active — sync automation is open (`12-audit-2026-09-25.md` → "Open after five rounds").

---

### Playbook: How-To Chapters State Today's Rules; Logs Are History; One Open List

**Date/Phase:** 2026-09-26 — audit round 5 (playbook pass)
**Context:** After four fast audit rounds, most current rules (hover gating, hit areas, disabled, live regions, `.ds-motion-safe`, `check-css`, story typecheck, internal helpers) lived only in this log and in `07`, while the how-to chapters still described the retired Astro docs site, removed CI workflows, a 31-component list and an invalid `text-box-trim` snippet. The success metric — someone new can rebuild an equivalent system from the playbook — was not met.
**Options considered:** (a) leave the how-to chapters and point readers to the logs; (b) rewrite the logs; (c) bring the how-to chapters up to date, keep the logs append-only (mark superseded entries' Status), and keep one deduplicated open list.
**Decision:** (c). Chapters 01–05 and 08–11 corrected against the code; new `13-motion.md` and `14-accessibility.md` collect rules that existed only in the logs; the README became a start-here page with reading order; `[PENDING DECISION]`/`[NEEDS INPUT]` tags now either state the answer or point to `12` → "Open after five rounds".
**Rationale:** A newcomer should never need the history to know today's rules, and an open item listed in three places is closed in one and forgotten in two.
**Status:** Active


---

### Round 5 — Seams, Safety, Tests, Tokens

**Date/Phase:** 2026-09-27 — Audit round 5 (review of the audit's own edits, shopper journeys, security/privacy, test quality, token math and colour pairs, playbook accuracy, Storybook/story coverage, storefront gap report)
**Decisions (all active):**
- **Links built from store data go through `internal/safe-url.ts`** (`javascript:`, `vbscript:`, `data:` blocked, including with hidden whitespace). React 18 — inside our peer range — renders `javascript:` hrefs.
- **Money that isn't a finite number renders blank** (dev warning), never "$0.00" or "$NaN". Every clamp handles non-finite input.
- **Merchant/shopper ids are never looked up in a plain `{}`** — `Map` or own-property checks (`constructor`, `__proto__`).
- **One helper per cross-cutting concern:** `internal/direction.ts` (`isRtl()`), `internal/use-overflow-tab-stop.ts` (Modal/Drawer). Six hand-rolled RTL checks and two copies removed.
- **Non-modal fixed banners sit below modal layers and reserve page space** (CookieConsent), so they never cover a drawer's controls or the page end.
- **Focus return uses `preventScroll` when the opener is on screen;** focusable controls never get `pointer-events: none` (swallow the click instead).
- **Entrance animations run only for things opened after first render** (Accordion, Tabs, filter pills) — `[data-state]` animations otherwise fire on page load.
- **Token build guards:** fails when light and dark list different names, or a `color-mix()` names an unknown `--color-*`. Print is emitted after the contrast block. `--font-size-base` floor 0.875rem (never below `sm`). `border-strong` moves with `border` in "more contrast".
- **Non-text contrast (WCAG 1.4.11) uses `--color-border-control`:** interactive empty stars, colour-swatch edges, and the dark-mode selected segment edge. Decorative/display-only marks keep the quiet border.
- **`container-ultra` (1680px) is a design-system token** — the storefront's ≥1600px frame had been hand-added in the theme and would have been wiped by a token resync.
- **Stories:** overlays open on load; `name:` gives plain labels without renaming exports; shared Mason fixtures in `src/story-fixtures.ts` (never shipped).
- **Axe tests on portalled components scan `baseElement`;** global axe rule changes go in `configureAxe({ globalOptions })`.
- **Storefront port plan lives in `15-storefront-port-plan.md`** (P1–P3, file-level).
- **A link blocked by `safeHref` renders nothing** (as if no link was given) — never a dead, link-styled `<a>` that can't be focused.
- **Radio and Switch rows grow to 44px on touch** (`pointer: coarse`) instead of overlapping 44px hit zones; 24px zones for every pointer, as Checkbox.
- **Table warns in development when unnamed** — its scroll wrapper is always a tab stop.
**Status:** Active

---

### Storybook Removed — Workbench Is the Only App

**Date/Phase:** 2026-09-27
**Context:** Storybook (`apps/storybook`) was kept as an "engineering tool" after the workbench replaced the docs site, but the owner reviews everything in the workbench and doesn't use Storybook. It was a second app to install, build and type-check, with its own config drift (fonts, dark mode, RTL decorators duplicated from the workbench).
**Options considered:** (a) keep it; (b) remove the Storybook app but keep stories in Component Story Format, rendered by the workbench via `@storybook/react`'s `composeStories`; (c) also drop `@storybook/react` and write a local `composeStories` + story types.
**Decision:** (b). Deleted `apps/storybook` and its addons (incl. `@chromatic-com/storybook`), the `storybook` launch config and the changesets ignore entry; stripped `tags: ['autodocs']` from every story. Stories, `tsconfig.stories.json` and the workbench's `@storybook/react` + `storybook` devDependencies stay.
**Rationale:** (b) removes the unused app with zero change to how stories are written or rendered. (c) is possible later but means owning story typing/composition code for no current benefit. Chromatic would now need Storybook restored first.
**Status:** Active

---

### Divider Hairline: `--color-border-subtle`

**Date/Phase:** 2026-09-27
**Context:** Horizontal dividers read too heavy. The header and footer rules, list and table rows, menu separators and the Divider component all used `--color-border`: stone-200 in light (1.27:1 on the page) and stone-800 in dark (1.43:1). The storefront had already patched this with a theme-side `--color-border-subtle` (50% border + 50% background) and asked for it to become a token (`15` → D2).
**Options considered:** (a) Lighten `--color-border` itself. That would also fade card, popover, drawer and modal edges. (b) A lighter solid step mixed toward the page background, either the storefront's 50% or a φ mix. On `--color-background-subtle` it falls to 1.03–1.07:1, and on dark surfaces (drawers, modals) to 1.05–1.09:1, so rules vanish there. (c) A translucent hairline: the foreground stone at a low alpha.
**Decision:** (c). A new semantic token, `--color-border-subtle`:
- Light: `color-mix(in srgb, var(--color-stone-950) 5.57%, transparent)`. Dark: `color-mix(in srgb, var(--color-stone-50) 5.57%, transparent)`. 5.57% is φ⁻⁶, one step below `--opacity-ghost`.
- It measures 1.12:1 on background, subtle and surface in light, and 1.13:1 on background and 1.16:1 on surface in dark.
- `prefers-contrast: more` raises it to `--color-border-control`, along with the other borders.

Every rule *between* content moved to it:
- **Components:** Divider, Accordion items, CartDrawer header and footer, CartLineItem, the CollectionFilters clear row, the DropdownMenu and Select separators, Footer (top and bottom bar), Header (underline and mobile nav rows), the PredictiveSearch footer, Table rows (`--table-border-color`) and the Tabs baseline.
- **Workbench:** the store pages, foundation-sheet rows, story separators, and the toolbar and review-bar rules.

These stay on `--color-border`:
- **Box edges:** Card, Popover, the DropdownMenu and Select panels, Modal, Drawer, CookieConsent, pills, swatches, the bordered Accordion panel, and stacked Table rows (via the new `--table-stack-border-color`).
- **Tracks:** Slider, ProgressBar and Stepper.
- **Scroll shadows.**

**Also:** Divider `variant="subtle"` dimmed the line to 38.2% opacity. On the new hairline that would be ≈1.04:1, which is invisible. The variant is deprecated and now renders like the default, and its three duplicate stories were removed.
**Rationale:** Dividers are decorative, and WCAG 1.4.11 does not apply to them, so a transparent mix is allowed (`07` → `#color-mix-contrast`). It is also the only option that keeps one visual weight on every surface in both modes. The token has the same name as the storefront's, so the theme replaces its local definition with the synced one.
**Status:** Active
