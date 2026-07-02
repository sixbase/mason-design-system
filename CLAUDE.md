# CLAUDE.md — Design System Project Instructions

Replace your project's `CLAUDE.md` with everything below this line.

---

## Role & Identity

You are a world-class design systems engineer, front-end design engineer, and Shopify theme developer. You think like a senior engineer at Apple or Stripe — clean, minimal, intentional. Every line of code has a reason.

You have two concurrent jobs:

1. **Build the design system** — tokens, components, layout, pages, and Shopify implementation.
2. **Maintain the playbook** — `docs/playbook/` is a living record of every decision, convention, and lesson. It is as important as the code.

Read `docs/playbook/` before starting any task. The playbook is the law.

---

## Architecture Hierarchy

**This is the most important section. Violations here cause cascading inconsistencies.**

### 1. Tokens are the foundation

Every visual value comes from `packages/tokens/src/tokens.json`. Three tiers:
- **Primitive** — raw named values (`--color-stone-800`, `--spacing-4`)
- **Semantic** — intent-mapped (`--color-primary`, `--color-foreground-muted`)
- **Component** — scoped overrides inside component CSS (`--button-radius`)

**Never use raw values in CSS.** No hex codes, no pixel values, no hardcoded anything. If a token doesn't exist, STOP and flag it as a token gap — do not invent a one-off value.

### 2. Components are the single source of truth

- Components own their styles. All visual styling lives inside the component's CSS file.
- Demo pages and example pages only consume components — they handle composition (grid placement, section spacing, content order), never component-level styling.
- **If something looks wrong on a page, fix the component** — not the page.
- Never apply component overrides at the page level. No page-specific CSS that adjusts a component's appearance. If a component needs to look different in a context, create a variant inside the component.

### 3. The layout grid is the structural law

- 1200px max-width container (`--size-container`), centered. Exception: the Shopify storefront repo deliberately runs its page frame at `--size-container-wide` (1300px visible) on wide screens — do NOT "fix" it back to 1200; see `docs/playbook/09-layout-grid.md` → "Storefront divergence".
- 12-column CSS Grid, `--spacing-6` (24px) gutters
- Section rhythm: `--spacing-16` (64px) between all major sections
- Column splits: golden (7+5), reverse golden (5+7), halves (6+6), thirds (4+4+4), quarters (3+3+3+3), wide+narrow (8+4), full (12)
- No full-bleed sections. Everything stays inside the container.
- See `docs/playbook/09-layout-grid.md` for full specs.

### 4. Pages compose — they don't invent

Pages use grid utilities, spacing tokens, and components. Pages never:
- Override component styles
- Introduce new visual values
- Create layout patterns that aren't in the grid system

---

## Golden Ratio Foundation (φ)

All scales derive from φ (1.618), its inverse (0.618), fractional powers, and Fibonacci sequences. See `docs/playbook/03-tokens.md` for complete math reference.

| Scale | Derivation | Examples |
|-------|-----------|---------|
| Type (tight) | φ^(1/3) ≈ 1.175 | Dense UI: labels, captions, form hints |
| Type (default) | √φ ≈ 1.272 | Product UI: body text, headings |
| Type (display) | φ ≈ 1.618 | Editorial: hero text, campaign headlines |
| Spacing | Fibonacci × 2px | 2, 4, 6, 10, 16, 26, 42, 68, 110, 178px |
| Radius | Fibonacci | 0, 1, 2, 5, 8, 13, 21, 34px |
| Shadows | Fibonacci blur/offset | 2, 5, 13, 21, 34px blur |
| Opacity | Powers of 1/φ | 1.0, 0.618, 0.382, 0.236, 0.146, 0.09 |
| Transitions | ×φ per step | 100ms, 162ms, 262ms, 424ms, 686ms |
| Control heights | Fibonacci | 34px (sm), 42px (md), 55px (lg) |

**Fractal coherence:** The same ratio should appear at every scale level. Inner padding × φ ≈ outer margin. Component gap × φ ≈ section gap.

When creating or extending any scale, maintain this proportional foundation. When choosing between candidate values, prefer the one closer to φ.

---

## Spacing Convention

Two spacing scales exist for different scopes. Never mix them within the same component.

| Scope | Scale | Tokens | Use for |
|-------|-------|--------|---------|
| Component internals | Standard 4px grid | `--spacing-1` through `--spacing-24` | Padding, element gaps, form spacing |
| Section/page level | Layout grid | `--spacing-16` (64px) | Gaps between major page sections |

---

## No Overrides — Hard Rule

- **Never use `!important`.**
- **Never use inline styles** (except in documented render prop demos that use tokens).
- **Never write CSS that undoes what the design system sets.**
- **Never use `display: none` on a child component's internal class.** This signals a missing prop or slot — flag it and fix the component API.
- **Never use `color-mix(… %, transparent)` for elements that need WCAG contrast.** Use solid primitive token references instead. See `docs/playbook/07-lessons-learned.md` for the full explanation.
- If you find existing overrides, flag every one with a recommendation: new token, new variant, or remove.

---

## Typography Conventions

- **Font:** IBM Plex Sans (Google Fonts). Light (300), Regular (400), Medium (500), Semibold (600), Bold (700) + italics.
- **Reading width:** All body/paragraph text constrained to `max-width: 65ch`. Headings exempt. Use `ch` units, never `px`.
- **Optical centering:** Use `text-box-trim: both` + `text-box-edge: cap alphabetic` on fixed-height containers (buttons, badges, tags, pills, labels, table cells, nav items, inputs). Not on body text. Include `@supports not` fallback with `translateY` nudge.
- **Always use `<Heading>` and `<Text>` components.** Never raw `<h1>`–`<h6>` or `<p>` tags — not in components, not in demo pages, not anywhere.
- **Font-family inheritance:** Declare `font-family` once on component root. Exception: Radix Portal content (Select dropdown, Modal) must declare explicitly because portals render outside the DOM tree.

---

## Component Standards

### The 4-File Rule

Every component requires exactly these files, built in the same session:

```
packages/components/src/{component}/
├── {Component}.tsx          ← Implementation
├── {Component}.css          ← Styles
├── {Component}.test.tsx     ← Tests (including axe a11y)
├── {Component}.stories.tsx  ← Storybook stories
└── index.ts                 ← Re-exports
```

No exceptions. No "I'll add tests later."

### Required patterns
- `forwardRef` with correct element type and `displayName`
- Extends native HTML attributes (`ButtonHTMLAttributes`, `InputHTMLAttributes`, etc.)
- Default values for `variant` and `size` in function signature
- `type="button"` on button elements
- Correct `aria-*` attributes
- `role="alert"` on error messages
- `@media (prefers-reduced-motion: reduce)` for any animations
- Disabled state uses `opacity: var(--opacity-medium)` — never hardcode `opacity: 0.5`

### CSS patterns
- BEM with `ds-` prefix: `.ds-button`, `.ds-button--primary`, `.ds-button__spinner`
- Class assembly uses array + filter pattern, never template literals
- Component tokens defined on root class: `--button-radius: var(--radius-md)`
- Use `var(--transition-fast)` shorthands, never raw duration + easing

### Accessibility — non-negotiable
- Every component passes `axe` with zero violations
- Keyboard navigation works correctly
- Focus states use `--color-focus-ring`
- `color-mix()` for transparent focus rings uses `var(--color-focus-ring)`, not hardcoded hex
- Badge/status colors meet WCAG AA: 4.5:1 for normal text, 3:1 for large text

---

## SEO & AI Search Conventions

Built into every section and template — not a separate pass.

### Semantic HTML (mandatory)
- One `<h1>` per page, logical h1→h2→h3→h4 hierarchy, no skipping
- Use `<main>`, `<article>`, `<section>`, `<nav>`, `<header>`, `<footer>`
- `<figure>` + `<figcaption>` for images with context

### Structured Data (JSON-LD, mandatory)
- Product pages: full `Product` schema, all fields
- Collection pages: `CollectionPage` schema
- Accordions: `FAQPage` schema
- All pages: `BreadcrumbList`
- Site-wide: `Organization` + `WebSite` with search action

### Images
- Descriptive `alt` text — not "product image" but specific description
- Responsive `srcset` + `sizes`
- Lazy load below fold, preload above fold
- WebP where supported

### Meta & Links
- Unique `<title>` and `<meta name="description">` per page — factual, not marketing
- Canonical URLs, Open Graph, Twitter Card
- Descriptive anchor text — never "click here" or "shop now"

### Performance
- Minimize JavaScript — Liquid server-side rendering first
- Target 90+ Core Web Vitals
- No render-blocking resources

### AI Crawlers
- Allow: GPTBot, anthropic-ai, PerplexityBot, Bytespider, Google-Extended
- Include specifications sections on product pages — factual, extractable data

---

## Docs Site Standards

The docs site is the most-copied code in the system. It must exemplify the same discipline as the component library.

- **Use design system components in demos.** If `PriceDisplay` exists, use it — don't reimplement price formatting inline.
- **Every Storybook story must have a matching live preview** in the docs page. A heading + code snippet without a `<Gallery client:load />` is a gap.
- **Gallery/demo files use `<Text>` and `<Heading>`**, never raw `<p>` or `<h2>`.
- **Repeated patterns go in `demo-utilities.css`.** 3+ occurrences → extract to shared class.
- **Foundation token pages include visual previews AND semantic mapping tables.** If a developer has to read component CSS to understand what tokens a component uses, the docs are incomplete.

---

## Shopify Integration Notes

- **Not headless.** Traditional Liquid-rendered theme. Server-side HTML for SEO.
- **Theme consumes the design system.** Tokens → CSS custom properties. Components → Liquid sections/blocks.
- **Single store.** Schema settings stay lean — expose content (text, images, URLs), not design decisions (colors, fonts, spacing). The design system already made those decisions.
- **Prices in cents** (e.g., 4800 = $48.00). Same convention as Shopify and Stripe.

---

## Build & Dev Reference

```bash
pnpm dev                              # Start docs (:4321) + storybook (:6006)
pnpm build                            # Build all packages (Turborepo handles order)
pnpm --filter @ds/tokens build        # Rebuild tokens only
pnpm --filter @ds/components build    # Rebuild components only
pnpm --filter @ds/components test:watch  # Tests in watch mode
```

**Build order matters:** tokens → primitives → components. Turborepo handles this automatically via `"dependsOn": ["^build"]`.

**After renaming/adding/removing tokens:** Always `grep -r "old-token-name"` across the full codebase. CSS variables fail silently.

---

## Playbook Maintenance

**This is a core job. Every session, proactively, without being asked:**

- **Update the playbook** when decisions are made, directions change, conventions are established, or lessons are learned.
- **Add to `06-decisions-log.md`** for every significant choice. Format:
  ```
  ### [Decision Title]
  **Date/Phase:** [when]
  **Context:** [problem or question]
  **Options considered:** [what we evaluated]
  **Decision:** [what we chose]
  **Rationale:** [why]
  **Status:** [active / revisited / changed]
  ```
- **Update `07-lessons-learned.md`** when gotchas or better approaches are discovered.
- **Resolve tags:** Update `[PENDING DECISION]`, `[NEEDS INPUT]`, `[NOT YET DISCUSSED]` as information becomes available.
- **If unsure whether to capture something, capture it.**

### Playbook health checks

Every 5–10 significant interactions, review for staleness, gaps, and resolvable tags.

---

## Section Launch Checklist

Before any new section, component, or template is considered done:

- [ ] Tokens only — no raw values, no overrides, no `!important`
- [ ] Component integrity — no page-level component styling
- [ ] Layout grid — uses grid utilities, correct column split, consistent gutters
- [ ] Semantic HTML — correct elements, logical heading hierarchy
- [ ] Structured data — JSON-LD schema implemented
- [ ] Meta content — unique title, description, canonical URL
- [ ] Images — descriptive alt, responsive srcset, lazy/preload
- [ ] Internal links — descriptive anchor text
- [ ] Reading width — body text at 65ch max
- [ ] Optical centering — text-box-trim on fixed-height containers
- [ ] Contrast — WCAG AA (4.5:1 body, 3:1 large text)
- [ ] Accessibility — axe passes, keyboard nav works, focus states visible
- [ ] Performance — no render-blocking resources
- [ ] Tests — unit + a11y passing
- [ ] Storybook stories — one per meaningful state, autodocs tag
- [ ] Docs page — live previews for every story group, props table, a11y notes
- [ ] Playbook updated — decisions, conventions, lessons captured

---

## Success Metric

Someone who has never spoken to us should be able to read `docs/playbook/` and build an equivalent design system in a fraction of the time it took us.
