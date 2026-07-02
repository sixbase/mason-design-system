# 01 — Planning

> Goals, scope decisions, and the design mandate for this design system.

---

## Rules for This File

- **When adding a new component:** Update the component status table immediately. Include the component name, status, and notes describing its API surface.
- **When completing a deferred component:** Move it from the "Deferred" table to the appropriate "Built" table and update the count in the section heading.
- **When adding a new docs page:** Add it to the documentation pages table.
- **When changing the design mandate:** Add a decisions log entry in `06-decisions-log.md` explaining why.

---

## Design Mandate

This is the aesthetic DNA of the entire system. Every visual decision should trace back to these principles.

### Aesthetic Direction

**Premium, warm, editorial.** High-end ecommerce: luxury goods, considered lifestyle brands. Not clinical SaaS blues and greys.

| Dimension | Direction | Specifics |
|-----------|-----------|-----------|
| **Color** | Warm earth tones | Primary palette is `stone` (warm off-white through near-black). Supporting palettes: `brick` (error), `sage` (success), `amber` (warning), `slate` (info). All muted and earthy. |
| **Typography** | Humanist sans | IBM Plex Sans. Clear, engineered, and modern — precise without being cold. Reads as considered product design. |
| **Shape** | Restrained radius | Fibonacci-derived. Not pill buttons, not sharp corners — a refined middle ground. |
| **Proportion** | Golden ratio (φ) | Every scale decision — type, spacing, radius, shadows, opacity, timing, layout splits — is derived from φ (1.618), its inverse (0.618), and Fibonacci sequences. |

### The Golden Ratio Governs All Proportions

This is not decorative. It is the generative DNA of the system.

- When choosing between candidate values, **prefer the ratio closer to φ**.
- When defining a new scale, **derive it from φ multiplication**.
- When evaluating whether a value belongs, **check if it fits the existing φ-derived progression**.

See `03-tokens.md` for the complete mathematical reference. See `06-decisions-log.md` for the full φ analysis with current token values and ideal targets.

### Font

| Iteration | Font | Why Changed |
|-----------|------|-------------|
| Default | Inter | Too generic, no personality |
| v2 | EB Garamond | Too ornate and heavy at small UI sizes |
| v3 | Ancizar Serif | Scholarly serif, but reverted for readability |
| v4 | Source Serif 4 | Warm literary serif — replaced in the move to sans |
| **Final** | **IBM Plex Sans** | Humanist sans — clearer at UI sizes, modern product character |

IBM Plex Sans is loaded from Google Fonts. Designed by IBM (Bold Monday) — open-source humanist sans (SIL OFL). We load: Light (300), Regular (400), Medium (500), Semibold (600), Bold (700) + italic variants.

**Do not change the font without a decisions log entry and a full audit of every component for visual regressions.**

---

## Origin Story

This design system was started from an empty GitHub repository with one directive: build something that meets the standards of large engineering organizations — Apple, Meta, Google. That meant:

- A monorepo structure that scales to many teams and many packages
- A token system that makes consistent theming and dark mode non-optional
- Components that are accessible by default (keyboard navigation, screen reader support, WCAG contrast)
- Full test coverage and visual regression testing from day one
- A documentation site that consumers can actually use, not just a Storybook dump

The system is built for an **ecommerce context** — the color palette, typography, and component priorities all reflect that use case.

---

## Scope: What's in v1

The build strategy was **primitives-first**: establish the token system and foundational components before anything ecommerce-specific.

### Packages

| Package | What It Contains | Depends On |
|---------|-----------------|------------|
| `@ds/tokens` | CSS variables, TypeScript exports, JSON source of truth | Nothing |
| `@ds/primitives` | Radix UI wrappers, shared TypeScript types | `@ds/tokens` |
| `@ds/components` | Styled, accessible components | `@ds/tokens`, `@ds/primitives` |

**Build order:** tokens → primitives → components. Always. See `05-workflows.md`.

### Components Built (31 total)

**When adding a component, update this table and the docs pages table below.**

#### Foundation (v1)

| Component | Status | Notes |
|-----------|--------|-------|
| Button | ✅ Complete | 4 variants (primary, secondary, ghost, destructive), 3 sizes, loading, icon-only, asChild, leading/trailing icons |
| Input | ✅ Complete | Label, hint, error, leading/trailing adornments, sm/md/lg sizes |
| Typography | ✅ Complete | Heading (h1–h4), Text, Caption, Code. Always use these — never raw HTML tags. |
| ColorSwatch | ✅ Complete | Docs utility only — not a user-facing component |
| Badge | ✅ Complete | 6 variants (default, secondary, success, warning, destructive, outline), 2 sizes. Uses solid primitives for contrast — not `color-mix` with transparent. |
| Card | ✅ Complete | 3 variants (default, bordered, ghost), interactive mode (hover lift + image zoom) |
| Select | ✅ Complete | 3 sizes, groups, separators, hint/error, Radix UI. Portal content needs explicit `font-family`. |
| Checkbox | ✅ Complete | Indeterminate state, 2 sizes, hint/error, Radix UI |
| Divider | ✅ Complete | Horizontal (`<hr>`) and vertical (`<div role="separator">`), 2 variants (default, subtle), 4 spacing options (none/sm/md/lg) |
| Icon | ✅ Complete | Library-agnostic SVG wrapper. 3 sizes (sm/md/lg), `currentColor` inheritance, decorative/labelled a11y modes. Unlocks all icon-bearing components. |
| Alert | ✅ Complete | 4 variants (info, success, warning, destructive), dismissible, icon override, composes Icon + Text + Button |

#### Ecommerce Components (v1.x)

| Component | Status | Notes |
|-----------|--------|-------|
| Modal | ✅ Complete | Compound API (Trigger, Content, Header, Body, Footer, Close), Radix Dialog. Portal content needs explicit `font-family`. |
| Accordion | ✅ Complete | Radix primitive, single/multiple mode, 3 sizes, inner-only dividers (no top/bottom borders) |
| Breadcrumb | ✅ Complete | CSS-based responsive collapse, maxItems truncation |
| QuantitySelector | ✅ Complete | Controlled stepper, min/max bounds, 3 sizes |
| ImageGallery | ✅ Complete | Main + thumbnails, keyboard nav, aspect ratio control |
| ProductCard | ✅ Complete | Composed from Card + Badge + image. `renderPrice` prop for custom pricing, `badge` prop for overlays, `hoverImage` prop for hover swap, `fluid` variant for grid contexts. |
| StarRating | ✅ Complete | SVG stars (full/half/empty), review count, 3 sizes |
| StockIndicator | ✅ Complete | 3 statuses (in-stock/low-stock/out-of-stock), pulse animation with `prefers-reduced-motion` |
| Carousel | ✅ Complete | Scroll-snap, responsive slide sizes (sm/md/lg), gap variants |
| FeatureBlock | ✅ Complete | Image + text grid, `reverse` prop for alternating layouts |
| CartLineItem | ✅ Complete | Composed: QuantitySelector + PriceDisplay + Button (ghost) + Badge + Text. Prices in cents, `formatPrice` internal. Responsive: row on desktop, stacked on mobile. Inner-only dividers. |
| CartDrawer | ✅ Complete | Pattern: Drawer + CartLineItem + Button + Heading + Text. Right-slide cart panel with empty state, sticky footer (subtotal + checkout), `children` slot for footer content (shipping notes). `aria-live` item count. |
| Drawer | ✅ Complete | Slide-out panel primitive (left/right), Radix Dialog, custom width, full-width on mobile. Unlocks: Cart Drawer, mobile menu, filter sidebar. |
| Table | ✅ Complete | Compound component (Table.Header/.Body/.Row/.Head/.Cell/.Empty). Variants: default (row borders), striped. Sizes: sm/md. Sticky header, sort indicators, scroll wrapper with CSS-only scroll shadows. |
| Pagination | ✅ Complete | Two modes: SPA (`onPageChange` → buttons) and SSR/Shopify (`baseUrl` → anchor tags). Truncation with ellipsis, `siblingCount`, 2 sizes (sm/md). Responsive: desktop shows full numbers, mobile shows "Page X of Y". Renders nothing for 1 page. |
| CollectionFilters | ✅ Complete | Pattern: Accordion + Checkbox + Button + Badge + Input + Drawer + Text. Faceted navigation with list filters (checkboxes), price range (min/max), boolean filters. Desktop sidebar, mobile drawer. Show more/less for 20+ values. Active filter pills with dismiss. `aria-live` results count. |
| AddToCartButton | ✅ Complete | Composed: Button + Toast integration. Size/variant selection, loading state, disabled when out of stock. |
| VariantSelector | ✅ Complete | Option group selector (size, color, material). Pill-style toggles with selection state, disabled/out-of-stock variants. |
| Tabs | ✅ Complete | Compound component (Tabs, TabsList, TabsTrigger, TabsContent). Keyboard nav (arrow keys), `aria-selected`, responsive. |
| Skeleton | ✅ Complete | Loading placeholder. Configurable width/height, circle variant, pulse animation with `prefers-reduced-motion`. |
| Toast | ✅ Complete | Provider + `useToast()` hook. 4 variants (default, success, warning, destructive), auto-dismiss with hover-pause, stacking, portal-based, slide animation with reduced-motion fallback. |
| PredictiveSearch | ✅ Complete | WAI-ARIA combobox pattern. `onSearch` + `results`/`loading` props (consumer handles data fetching). Debounced input, keyboard nav via `aria-activedescendant`, recent searches, Skeleton loading state. |
| SidebarNav | ❌ Deleted (2026-07-01) | Draft was never completed — single .tsx importing a CSS file that didn't exist, never exported. Removed in the system audit; see decisions log. Docs sidebar is implemented in the docs app layout instead. |
| EmptyState | ✅ Complete | Pattern: centered flex column composing Heading + Text + Button. Icon slot, primary/secondary actions (asChild links), compact variant for constrained contexts (Cart Drawer). |
| ProgressBar | ✅ Complete | Primitive: native `<progress>` element, custom-styled. 2 sizes (sm/md), success variant (green at 100%). `valueText` for custom screen reader text (e.g., "$12 away from free shipping"). Composes Text for label/value display. |

#### Layout Utilities

| Utility | Status | Notes |
|---------|--------|-------|
| Layout Grid | ✅ Complete | `.ds-page-container`, `.ds-layout`, `.ds-section`, column split modifiers. See `09-layout-grid.md`. |

### Documentation Pages

| Page | URL | Type |
|------|-----|------|
| Introduction | `/` | Foundation |
| Getting Started | `/getting-started` | Foundation |
| Colors | `/tokens/colors` | Token reference |
| Typography | `/tokens/typography` | Token reference |
| Spacing | `/tokens/spacing` | Token reference |
| Accordion | `/components/accordion` | Component |
| Badge | `/components/badge` | Component |
| Breadcrumb | `/components/breadcrumb` | Component |
| Button | `/components/button` | Component |
| Card | `/components/card` | Component |
| Cart Drawer | `/components/cart-drawer` | Component |
| Cart Line Item | `/components/cart-line-item` | Component |
| Carousel | `/components/carousel` | Component |
| Checkbox | `/components/checkbox` | Component |
| Collection Filters | `/components/collection-filters` | Component |
| Alert | `/components/alert` | Component |
| Color Swatch | `/components/color-swatch` | Component |
| Divider | `/components/divider` | Component |
| Drawer | `/components/drawer` | Component |
| Feature Block | `/components/feature-block` | Component |
| Icon | `/components/icon` | Component |
| Image Gallery | `/components/image-gallery` | Component |
| Input | `/components/input` | Component |
| Modal | `/components/modal` | Component |
| Pagination | `/components/pagination` | Component |
| Predictive Search | `/components/predictive-search` | Component |
| Progress Bar | `/components/progress-bar` | Component |
| Product Card | `/components/product-card` | Component |
| Quantity Selector | `/components/quantity-selector` | Component |
| Select | `/components/select` | Component |
| Skeleton | `/components/skeleton` | Component |
| Star Rating | `/components/star-rating` | Component |
| Stock Indicator | `/components/stock-indicator` | Component |
| Tabs | `/components/tabs` | Component |
| Table | `/components/table` | Component |
| Toast | `/components/toast` | Component |
| Typography | `/components/typography` | Component |
| Product Detail Page | `/examples/product-detail` | Example page |
| Homepage | `/examples/homepage` | Example page |
| Collection | `/examples/collection` | Example page |
| Cart | `/examples/cart` | Example page |

### Example Pages (4 total)

| Page | Layout | Key Patterns |
|------|--------|-------------|
| Homepage | Full-width sections, centered flex | Hero with `Button asChild → <a>`, Carousel with ProductCard, FeatureBlock alternating, Newsletter form |
| Collection | Breadcrumb + header/sort + product grid | Responsive grid (2→3→4 col), Select sort, ProductCard with `fluid` |
| Product Detail | Golden split (7+5) | ImageGallery + sticky details, Accordion FAQ, Carousel lifestyle, FeatureBlock |
| Cart | Golden split (7+5) | CartLineItem component, sticky order summary, empty state |

---

## Scope: What's Deferred

All previously deferred P1–P3 components have been built:
- ~~Toast~~ → ✅ Built (Phase 3)
- ~~Skeleton~~ → ✅ Built (Phase 3)
- ~~Tabs~~ → ✅ Built (Phase 3)

No components are currently deferred. See `08-page-templates.md` Token Gap Report for remaining feature gaps identified during page template design.

---

## Why Two Apps (Docs + Storybook)?

**They serve different audiences. Do not merge them.**

| | Storybook | Astro Docs |
|--|-----------|------------|
| **Audience** | Component engineers | Consumers of the design system |
| **Need** | Isolated rendering, controls, interaction testing | Usage examples, copy-paste code, prop tables |
| **Runs** | Locally during development (`:6006`) | Deployed publicly (`:4321`) |
| **Key job** | Visual regression baseline (Chromatic) | Source of truth for consumers |

Storybook is a **development tool**. The docs site is the **consumer reference**. Conflating them leads to docs that are too technical or a Storybook cluttered with prose.

**Parity rule:** Every feature visible in Storybook must have a live preview in the docs. A docs section with only a heading and code snippet (no `<Gallery client:load />`) is a gap. See `04-components.md` for the full docs page checklist.

---

## Infrastructure Decisions

### CI/CD from day one

Set up before any components were built:

| Workflow | Trigger | What It Does |
|----------|---------|--------------|
| `ci.yml` | Every PR + push to main | Lint, typecheck, tests (including axe a11y) |
| `chromatic.yml` | Every PR | Visual regression screenshots via Storybook |
| `release.yml` | Merge to main | Changesets version bump + npm publish |

### Branch protection on `main`

Direct pushes blocked. Every change requires a PR that:
1. Passes CI (lint + typecheck + all tests including axe)
2. Gets 1 approving review
3. Stale reviews dismissed on new commits

**No code reaches main without passing lint, typecheck, tests, AND review.**

### Three "from day one" disciplines

1. **CI from day one** — GitHub Actions before any components
2. **Testing from day one** — every component ships with its test file. If axe fails, the PR fails.
3. **Documentation from day one** — every component gets a docs page in the same session. "I'll document it later" never happens.
