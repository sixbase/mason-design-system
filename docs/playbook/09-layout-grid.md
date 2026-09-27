# 09 — Layout Grid System

> The structural backbone of every page. 12 columns, one container, consistent rhythm.

---

## Rules — Non-Negotiable

1. **Every page section lives inside `.ds-page-container`.** 1200px max-width, centered. No exceptions.
2. **No full-bleed sections.** Nothing exceeds the container.
3. **One gutter width everywhere.** `--spacing-6` (24px) desktop, `--spacing-4` (16px) tablet. Do not vary between sections.
4. **Section spacing is `--spacing-16` (64px) via `.ds-section`.** No other value for section-level gaps. Do not use `--spacing-phi-*` for section rhythm — that convention has been superseded.
5. **The grid is the law.** If a component doesn't fit the grid, the component adapts. Never override grid values to accommodate a component.
6. **All grid values come from existing tokens.** No hardcoded pixels for gutters, margins, or spacing.
7. **Multi-column layouts collapse to single column below 768px.** No exceptions.

---

## When to Use What

| I need to... | Use this | Class |
|-------------|----------|-------|
| Wrap the entire page | Page container | `.ds-page-container` |
| Create a two-column layout | Layout grid + split modifier | `.ds-layout .ds-layout--golden` |
| Space between major sections | Section rhythm | `.ds-section` |
| Make a column sticky (PDP, Cart) | Sticky utility | `.ds-layout__sticky` |
| Put a full-width row (a section title) inside a split | Span utility | `.ds-layout__span-all` |
| Show a product card grid (2→3→4 cols) | Product grid component | `.ds-grid` (NOT the layout grid) |
| Wrap non-page content in a container | General container | `.ds-container` (NOT `.ds-page-container`) |

---

## How to Choose a Column Split

Use this decision tree when building a new two-column section:

```
Is one side clearly the "main" content?
├── Yes → Is there a sidebar/summary that should be sticky?
│         ├── Yes → Golden (7+5) + .ds-layout__sticky on sidebar
│         └── No → Golden (7+5) for primary+secondary
├── No → Are both sides equally important?
│         └── Yes → Halves (6+6)
└── Three or four equal items?
    ├── Three → Thirds (4+4+4)
    └── Four → Quarters (3+3+3+3)
```

**Default to Golden (7+5).** It's the most versatile two-column split and maintains the φ proportional DNA.

---

## Container

```css
.ds-page-container {
  width: 100%;
  max-width: var(--size-container);     /* 1200px */
  margin-inline: auto;
  padding-inline: var(--spacing-4);     /* 16px mobile */
}

@media (min-width: 768px) {
  .ds-page-container { padding-inline: var(--spacing-8); }   /* 32px tablet */
}

@media (min-width: 1024px) {
  .ds-page-container { padding-inline: var(--spacing-12); }  /* 48px desktop */
}
```

| Property | Mobile | Tablet (768px+) | Desktop (1024px+) |
|----------|--------|-----------------|-------------------|
| Max-width | 1200px | 1200px | 1200px |
| Page margins | `--spacing-4` (16px) | `--spacing-8` (32px) | `--spacing-12` (48px) |

Applied to `<main>` — in the workbench by `PageChrome` (`apps/workbench/src/specimens/pages/PageChrome.tsx`).

**Why 1200px instead of `--size-content-xl` (1280px)?** 1200px divides more cleanly into 12 columns and provides slightly more generous margins at large viewports. Header and Footer inner widths also use `--size-container` (since 2026-07-01); `--size-content-xl` (1280px) is now only the Container component's `xl` size. **For page content max-width, always use `.ds-page-container` (which references `--size-container`, 1200px), never `--size-content-xl`.** See `06-decisions-log.md` "Layout Grid System" and "Container Width Clarification."

### Storefront divergence: 1300px visible on wide screens

The Shopify storefront (`sixbase/mason-storefront`) deliberately runs a **wider page frame** than this document specifies. Its `.ds-page-container`, header inner, footer inner, and announcement bar all use `max-width: var(--size-container-wide)` (1396px), which with the 48px desktop padding yields **1300px of visible content** on wide screens. The grid itself is unchanged — same 12 columns, same 24px gutters, same 64px section rhythm — only the frame is wider.

**This is a documented divergence, not drift** (owner decision, 2026-07-01):
- The storefront's 1300px frame is **storefront-side and stays there** — do not port it back into the design system.
- The design system's own container (`--size-container`, 1200px) governs the React library and the workbench. (The DS AnnouncementBar is the one exception — it uses the wide frame; open item in `12`.)
- Both widths are tokens, so neither side hardcodes a number. If either value changes, update this section and the decisions log.
- **Large-desktop tier (≥1600px):** the storefront widens the frame again to `--size-container-ultra` (1680px) with a 64px gutter (`assets/layout.css`), because the 1396px frame left 200px+ of dead margin. Copy sections cap their own measure, so the extra width goes to media and grids, never to longer lines of text. The token was first hand-added in the theme; it now lives in `tokens.json` (2026-09-27) so a token resync keeps it.

---

## 12-Column Grid

```css
.ds-layout {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));   /* minmax(0, …) so a long word can't widen a track */
  gap: var(--spacing-6);   /* 24px universal gutter */
}
```

Two-column splits repeat per row (odd/even children), so a third and fourth child start a new row with the same split. The positional rules are wrapped in `:where()` to stay at class specificity — that is how the mobile stack rule wins without `!important`. A `.ds-layout__span-all` child spans the row and doesn't shift the odd/even count.

### Gutters

| Breakpoint | Gutter | Token |
|------------|--------|-------|
| Desktop (1024px+) | 24px | `--spacing-6` |
| Tablet (768–1023px) | 16px | `--spacing-4` |
| Mobile (<768px) | 24px vertical | `--spacing-6` (stacked items) |

**Why 24px?** At 1200px with 48px margins per side, content area is ~1104px. 11 gutters at 24px (264px) leave ~840px for column content — ~70px per column. Clear separation without fragmenting the page. Matches `--spacing-6` on the 4px grid.

---

## Column Splits

All applied as modifier classes on `.ds-layout`:

| Name | Class | Columns | Ratio | Use Case |
|------|-------|---------|-------|----------|
| Full | `ds-layout--full` | 12 | 100% | Single column |
| Halves | `ds-layout--halves` | 6 + 6 | 50/50 | Balanced two-column |
| **Golden** | **`ds-layout--golden`** | **7 + 5** | **58/42 ≈ φ** | **Primary + secondary (default two-column)** |
| Reverse golden | `ds-layout--golden-reverse` | 5 + 7 | 42/58 | Secondary + primary (flipped) |
| Thirds | `ds-layout--thirds` | 4 + 4 + 4 | 33/33/33 | Three equal columns |
| Quarters | `ds-layout--quarters` | 3 + 3 + 3 + 3 | 25/25/25/25 | Four equal columns |
| Wide + narrow | `ds-layout--wide-narrow` | 8 + 4 | 67/33 | Heavy primary + sidebar |

### Visual Reference

```
Full (12):
[████████████████████████████████████████████████████████████████]

Halves (6 + 6):
[██████████████████████████████]  [██████████████████████████████]

Golden (7 + 5):                              ← DEFAULT TWO-COLUMN
[███████████████████████████████████]  [████████████████████████]

Reverse Golden (5 + 7):
[████████████████████████]  [███████████████████████████████████]

Thirds (4 + 4 + 4):
[███████████████████]  [███████████████████]  [███████████████████]

Quarters (3 + 3 + 3 + 3):
[█████████████]  [█████████████]  [█████████████]  [█████████████]

Wide + Narrow (8 + 4):
[█████████████████████████████████████████]  [███████████████████]
```

---

## Section Spacing Rhythm

```css
.ds-section {
  margin-bottom: var(--spacing-16);   /* 64px */
}
.ds-section:last-child {
  margin-bottom: 0;
}
```

| Property | Value | Token |
|----------|-------|-------|
| Section gap | 64px | `--spacing-16` |

**Why 64px?** Upper end of the standard 4px-grid scale (…48, **64**, 80, 96). Creates clear visual chapter breaks. The previous ad-hoc spacing used `--spacing-phi-34` (68px) — close but from the phi scale. Standardizing on 64px keeps the grid system on one consistent scale.

**Use `.ds-section` for major page divisions only.** Not for internal component spacing — that uses the standard `--spacing-*` tokens directly.

---

## Sticky Sidebar

For PDP and Cart layouts where one column stays visible during scroll:

```css
.ds-layout__sticky {
  position: sticky;
  /* clears a sticky Header, which publishes --sticky-header-height on <html> */
  top: calc(var(--sticky-header-height, var(--spacing-0)) + var(--spacing-6));
  align-self: start;
}
```

Becomes `position: static` below 768px (when layout collapses to single column).

---

## Responsive Breakpoints & Collapse

| Breakpoint | Width | Grid Behavior |
|------------|-------|---------------|
| Mobile | < 768px | **All layouts collapse to a single track** (`minmax(0, 1fr)`, not 12 — twelve empty tracks keep eleven gutters and overflow a narrow parent). Items stack vertically. |
| Tablet | 768–1023px | Gutters step to 16px. Quarters → 2-up. Thirds → 2-up. |
| Desktop | ≥ 1024px | Full 12-column grid. 24px gutters. |

### Collapse by Split

| Split | Mobile (<768px) | Tablet (768–1023px) | Desktop (≥1024px) |
|-------|-----------------|--------------------|--------------------|
| Halves | 1 column | 2 columns | 2 columns |
| Golden / Reverse | 1 column | 2 columns | 2 columns (7+5 / 5+7) |
| Wide + Narrow | 1 column | 2 columns | 2 columns (8+4) |
| Thirds | 1 column | 2-up (third wraps) | 3 columns |
| Quarters | 1 column | 2-up | 4 columns |

---

## Building a New Section — Step by Step

### Step 1: Choose your split

Use the decision tree above. Default to Golden (7+5) for any two-column layout.

### Step 2: Write the markup

In React, use the components that output these classes — `PageContainer`, `Section`, `LayoutGrid variant="golden" section`, `LayoutGridItem sticky | spanAll` (from `@ds/components`). Raw classes work the same in Liquid or plain HTML.

```html
<!-- Single column section -->
<section class="ds-section">
  <Heading as="h2">Section Title</Heading>
  <Text>Content here...</Text>
</section>

<!-- Two-column with golden split -->
<div class="ds-layout ds-layout--golden ds-section">
  <div>Primary content (7 columns)</div>
  <div>Secondary content (5 columns)</div>
</div>

<!-- Golden split with sticky sidebar (PDP/Cart pattern) -->
<div class="ds-layout ds-layout--golden ds-section">
  <div>Scrollable content</div>
  <div class="ds-layout__sticky">Sticky sidebar</div>
</div>

<!-- Three equal columns -->
<div class="ds-layout ds-layout--thirds ds-section">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
</div>
```

### Step 3: Verify

- [ ] Uses `.ds-page-container` at the page level
- [ ] Uses `.ds-layout` with a split modifier
- [ ] Uses `.ds-section` for vertical rhythm
- [ ] No hardcoded widths, gaps, or margins
- [ ] Collapses cleanly on mobile (check at <768px)
- [ ] Gutter is `--spacing-6` (not custom)

---

## Pages Using the Grid

Workbench store pages. Home, Product and Cart use the layout grid; Collection, Search, Sale, Account and Terms use `.ds-grid` or their own page-level columns.

| Page | Splits Used | Section Rhythm | Sticky |
|------|-------------|----------------|--------|
| Homepage | Full (single-column sections) | `.ds-section` on the major sections | No |
| Product Detail | Golden (7+5) for gallery+details, Full for lifestyle/features | `.ds-section` on each major area | Yes — details column |
| Cart | Golden (7+5) for items+summary | `.ds-section` on header | Yes — order summary |

---

## Relationship to Other Layout Components

**These are different things. Don't confuse them.**

| Component | Class | Purpose | When to Use |
|-----------|-------|---------|-------------|
| **Page container** | `.ds-page-container` | 1200px max-width wrapper for entire page | Every page — wraps `<main>` |
| **Layout grid** | `.ds-layout` + modifiers | 12-column grid for section-level composition | Two-column, three-column, four-column layouts |
| **Section rhythm** | `.ds-section` | 64px vertical spacing between page sections | Between major content blocks |
| **Product grid** | `.ds-grid` | Responsive repeating grid (2→3→4 cols) | Product card grids, repeating content |
| **General container** | `.ds-container` | Older general-purpose wrapper | Non-page contexts |
| **FeatureBlock** | Internal `1fr 1fr` grid | Image + text side by side | Lives *inside* a layout grid section |

---

## CSS File Location

```
packages/components/src/layout-grid/layout-grid.css
```

Imported by `LayoutGrid.tsx`, so it is in `@ds/components/styles` (everything) and in `@ds/components/styles/layout-grid.css` on its own. Media queries use the breakpoint token values written as raw widths with a `/* @breakpoint-md = 768px */` comment — custom properties can't be used in `@media`, and `check-css` rejects any other width.

---

## Common Mistakes

| Mistake | What Happens | Correct Approach |
|---------|-------------|-----------------|
| Using `.ds-grid` for page layout | Product card grid behavior, not page sections | Use `.ds-layout` with split modifier |
| Hardcoded `max-width` on a section | Inconsistent with other sections | Use `.ds-page-container` — container handles max-width |
| Custom gutter on one section | Visual inconsistency across page | One gutter everywhere: `--spacing-6` |
| Using `--spacing-phi-34` for section gaps | Superseded convention | Use `--spacing-16` (64px) via `.ds-section` |
| Forgetting `.ds-section` between blocks | Sections run together, no rhythm | Add `.ds-section` to every major page block |
| Not collapsing layout on mobile | Columns cramped at small widths | Grid collapses automatically — verify at <768px |
| Using `.ds-page-container` inside another container | Double containment, unexpected margins | Only one container per page — on `<main>` |
