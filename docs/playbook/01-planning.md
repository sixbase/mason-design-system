# 01 — Planning

> Goals, scope decisions, and the design mandate for this design system.

---

## Rules for This File

- **When adding or removing a component:** Update the component list below (and the group in `apps/workbench/src/lib/catalog.ts`).
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

IBM Plex Sans is loaded from Google Fonts. Designed by IBM (Bold Monday) — open-source humanist sans (SIL OFL). We load: Light (300), Regular (400), Medium (500), Semibold (600), Bold (700) + italic variants. Numerals (prices, quantities, page numbers) use JetBrains Mono through `--font-family-numeric`. The storefront theme serves the font files itself, with a preload, since 2026-10-07 (decisions log, "Measures in em; stand-in fonts"); the workbench still loads them from Google Fonts.

**Do not change the font without a decisions log entry and a full audit of every component for visual regressions.**

---

## Origin Story

This design system was started from an empty GitHub repository with one directive: build something that meets the standards of large engineering organizations — Apple, Meta, Google. That meant:

- A monorepo structure that scales to many teams and many packages
- A token system that makes consistent theming and dark mode non-optional
- Components that are accessible by default (keyboard navigation, screen reader support, WCAG contrast)
- Full test coverage and visual regression testing from day one
- A documentation site that consumers can actually use, not just a Storybook dump (later replaced by the visual workbench — see "Why One App" below)

The system is built for an **ecommerce context** — the color palette, typography, and component priorities all reflect that use case.

---

## Scope

The build strategy was **primitives-first**: establish the token system and foundational components before anything ecommerce-specific.

### Packages

| Package | What It Contains | Depends On |
|---------|-----------------|------------|
| `@ds/tokens` | `tokens.json` source of truth → CSS variables (`@ds/tokens/css`) + a JS `motion` export | Nothing |
| `@ds/primitives` | Radix UI wrappers, shared TypeScript types | Radix (label, slot, visually-hidden) |
| `@ds/components` | Styled, accessible components; all CSS at `@ds/components/styles` or one file per component at `@ds/components/styles/<name>.css` | `@ds/tokens`, `@ds/primitives`, Radix |
| `@ds/motion` | GSAP choreography layer — scroll reveals, FLIP, fly-to-cart; hero + page-transition CSS at `@ds/motion/css`. Lazy-loads GSAP; off for reduced motion / Save-Data / 2G. See `13-motion.md` | `@ds/tokens`, `gsap` (React optional) |

`packages/dskit` is a separate URL-audit command-line tool (runs on Bun). It is not part of the design system and nothing depends on it.

**Build order:** tokens → primitives → components (motion needs only tokens). Turborepo handles it. See `05-workflows.md`.

### Components (59 folders: 58 components + LayoutGrid)

Grouped as in the workbench sidebar (`apps/workbench/src/lib/catalog.ts`). Each component's props are documented in JSDoc in its `.tsx`; its stories show every state.

| Group | Components |
|-------|-----------|
| Basics | Typography (Heading, Text, Caption, Code), Button, Badge, Tag, Avatar, Icon (+ internal icon registry `icon/icons.tsx`), Divider, Spinner, Skeleton |
| Forms | Input, Textarea, Select, Checkbox, RadioGroup, Switch, Slider, SegmentedControl, QuantitySelector, ColorPicker, ColorSwatch, VariantSelector |
| Layout | Container, Grid (product grid), LayoutGrid (PageContainer, Section, LayoutGrid, LayoutGridItem — see `09`), Card, Accordion, Tabs, Table |
| Overlays | Modal, Drawer, Popover, Tooltip, DropdownMenu, Toast, CookieConsent |
| Feedback | Alert, EmptyState, ProgressBar, StockIndicator, Countdown |
| Commerce | ProductCard, PriceDisplay, StarRating, AddToCartButton, CartLineItem, CartDrawer, CollectionFilters, ImageGallery, Carousel, FeatureBlock, Highlights, PredictiveSearch |
| Navigation | Header, Footer, AnnouncementBar, Breadcrumb, Pagination, Stepper, SkipLink |

Removed: SidebarNav and an empty `mega-menu/` (2026-07-01, never finished — see the decisions log).

### Store pages (8, in the workbench)

Home, Product, Collection, Cart, Search, Sale, Account, Terms — in `apps/workbench/src/specimens/pages/`, each wrapped by `PageChrome` (real Header + `main.ds-page-container` + Footer). Specs for five of them are in `08-page-templates.md`.

No components are currently deferred. Open design decisions live in `12-audit-2026-09-25.md` → "Open after five rounds".

---

## Why One App (the Workbench)?

`apps/workbench` is the only app: `:4321` locally, deployed to GitHub Pages. It renders the stories directly — every state at real device widths, light/dark, stress modes, an on-demand axe check, and review verdicts.

Storybook was removed on 2026-09-27. The owner reviews everything in the workbench; Storybook's controls and a11y panel went unused, and it was one more app to install, build and type-check. Stories stay in Component Story Format, so nothing about writing them changed. The public Astro docs site (usage prose, props tables, code snippets) was retired on 2026-09-25 — its only real user wanted a visual test bench, not documentation. See `06-decisions-log.md`.

---

## Infrastructure

### CI

| Workflow | Trigger | What It Does |
|----------|---------|--------------|
| `ci.yml` | Every PR + push to `main` | Build packages → lint (incl. `check-css`) → typecheck (incl. every story) → tests (incl. axe) |
| `deploy-docs.yml` | Push to `main`, manual | Builds and deploys the workbench to GitHub Pages |

Chromatic and Changesets-release workflows existed at the start but were removed as unconfigured (commit `325bcf2`). Visual regression today is the workbench review, not Chromatic.

### Branch protection on `main`

Recorded in the decisions log ("CI/CD & Code Quality"): PRs only, CI must pass, one approving review, stale reviews dismissed. These are GitHub settings — not visible in the repo and not re-checked since.

### Three "from day one" disciplines

1. **CI from day one** — GitHub Actions before any components.
2. **Testing from day one** — every component ships with its test file. If axe fails, the test fails.
3. **Stories from day one** — every component ships with stories in the same session; the workbench renders them, so a component with stories is reviewable immediately.
