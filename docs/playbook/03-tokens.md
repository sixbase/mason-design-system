# 03 — Design Tokens

> The most important part of the system. Everything else builds on top of this.

---

## Rules — Non-Negotiable

1. **Every visual value must come from a token.** No hex codes, no pixel values, no raw numbers in component or page CSS. If the token doesn't exist, flag it as a gap — do not invent a value.
2. **All scales derive from the golden ratio (φ).** When adding a new token or scale, derive it from φ, 1/φ, fractional powers of φ, or the Fibonacci sequence. See the math reference below.
3. **Semantic tokens are what components use.** Components never reference primitives directly except in documented edge cases (see Known Gaps below). If a semantic token doesn't exist for your need, add one — don't reach for the primitive.
4. **Token renames require a full codebase grep.** CSS variables fail silently. `var(--old-name)` resolves to `initial` with no error. Always `grep -r "old-name" .` before and after renaming.
5. **Two spacing scales, two scopes.** Standard 4px grid (`--spacing-*`) is the default for all spacing: component internals, element-to-element gaps, section rhythm, and any "I need some space here" situation. Section rhythm uses `--spacing-16` (64px) via `.ds-section`. Phi scale (`--spacing-phi-*`) is reserved for proportional layout relationships where the mathematical relationship to φ is the actual design intent — sidebar-to-content ratios, aspect ratio approximations, layout split proportions. Never mix scales within the same component. See "Phi vs Standard Spacing" below for detailed rules.
6. **Never use `color-mix(… %, transparent)` for elements that need WCAG contrast.** The math makes it impossible to reach 3:1 or 4.5:1 at low percentages. Use solid primitive references (typically 50-shade for backgrounds, 600+ for borders/text). See Common Mistakes below.
7. **Disabled states use `opacity: var(--opacity-medium)`.** Never hardcode `opacity: 0.5`.
8. **Transitions use shorthand tokens.** Write `var(--transition-fast)`, never raw `100ms cubic-bezier(…)`.

---

## Common Mistakes — Read Before Working With Tokens

| Mistake | What Happens | Correct Approach |
|---------|-------------|-----------------|
| Raw hex/px in CSS | Inconsistency, dark mode breaks, no single source of truth | Always `var(--token-name)` |
| `color-mix(… 8%, transparent)` for badge backgrounds | Near-invisible, fails WCAG contrast | Use solid primitive (e.g., `--color-sage-50`) |
| `color-mix(… %, transparent)` for borders | Can't reach 3:1 non-text contrast | Use 600-shade semantic or primitive token |
| Reaching for primitive in component CSS | Dark mode breaks unless you add manual `.dark` override | Use semantic token; extend semantic layer if gap exists |
| Renaming token without grep | Silent failure — `var(--old-name)` resolves to `initial` | `grep -r "old-name" .` before AND after rename |
| Hardcoding `opacity: 0.5` for disabled | Doesn't use φ-derived value, inconsistent | `opacity: var(--opacity-medium)` (0.382) |
| Writing raw duration + easing | Inconsistent timing, not φ-derived | `var(--transition-fast)` / `normal` / `slow` |
| Using `--spacing-phi-*` for "I need some space" | Phi tokens are for proportional relationships, not general spacing | Use `--spacing-*` for all general spacing; phi only for proportional layout math |

---

## Golden Ratio Foundation

Every numeric scale is derived from **φ = 1.618** and its inverse **1/φ = 0.618**. This is not ornamental — it encodes a mathematical relationship that appears at every level: within a component, between components, between sections, and across the full page.

### Why φ?

The human eye perceives proportions close to φ as balanced without being static. Equal ratios feel rigid; random ratios feel chaotic; φ-ratios feel resolved. For an editorial, premium ecommerce system the governing proportion needs to feel unhurried and considered.

### Math Reference Table

| Constant | Value | Role | Where Used |
|----------|-------|------|-----------|
| φ | 1.618 | Step ratio | Display type scale, transition timing multiplier |
| √φ | 1.272 | Step ratio | Default type scale, control height progression |
| φ^(1/3) | 1.175 | Step ratio | Tight type scale |
| 1/φ | 0.618 | Contraction | Opacity "high", layout minor column |
| (1/φ)² | 0.382 | Contraction | Opacity "medium", layout minor split, disabled state |
| (1/φ)³ | 0.236 | Contraction | Opacity "low" |
| (1/φ)⁴ | 0.146 | Contraction | Opacity "subtle" |
| (1/φ)⁵ | 0.09 | Contraction | Opacity "ghost" |
| Fibonacci | 1,1,2,3,5,8,13,21,34,55,89 | Integer φ | Radius, spacing (phi scale), shadow blur, control heights |

### Decision Rule

When choosing between candidate values for any new token:
1. **Check if a Fibonacci number fits.** If yes, use it.
2. **Check if φ × the previous step fits.** If yes, use it.
3. **If neither fits cleanly, prefer the value closer to φ** and document the deviation.

### Fractal Coherence Principle

The same ratio appears at every scale level simultaneously:
- Inner padding × φ ≈ outer margin
- Component gap × φ ≈ section gap
- Section gap × φ ≈ page gap
- Minor column (38.2%) × φ ≈ major column (61.8%)

This creates layouts where the eye moves naturally from detail to structure to page without abrupt visual transitions.

---

## What Are Design Tokens?

Design tokens are named values for every visual decision. Instead of `color: #342F2A`, write `color: var(--color-primary)`. The hex lives in one place and flows everywhere.

The source of truth is: **`packages/tokens/src/tokens.json`**

---

## The 3-Tier Architecture

```
Tier 1: Primitive tokens   →  raw named values    (the paint store)
Tier 2: Semantic tokens    →  intent-mapped        (the design spec)
Tier 3: Component tokens   →  scoped overrides     (the sticky note)
```

### When to use which tier

| Situation | Use This Tier | Example |
|-----------|--------------|---------|
| Building a component's styles | **Semantic** (Tier 2) | `color: var(--color-primary)` |
| Defining a component-scoped default | **Component** (Tier 3) | `--button-radius: var(--radius-md)` |
| Consumer wants to override one component | **Component** (Tier 3) | `.my-app .ds-button { --button-radius: var(--radius-full) }` |
| Semantic token doesn't exist for your need | **Add a semantic token** | Don't reach for a primitive — extend the semantic layer |
| Edge case: a11y requires a specific shade | **Primitive** (Tier 1) with documented reason + dark mode override | `color: var(--color-stone-600)` + `.dark` block |

### Tier 1: Primitive Tokens

Raw values named by **scale**, not intent.

```json
// packages/tokens/src/tokens.json → primitive.color
"stone": {
  "0":   "#FFFFFF",
  "50":  "#FAF9F7",   // warm parchment
  "100": "#F2F0EB",
  "200": "#E3DED6",
  "300": "#C8C2B8",
  "400": "#A59E94",
  "500": "#847D73",   // mid-grey
  "600": "#675F56",
  "700": "#4E473F",
  "800": "#342F2A",   // primary button (light mode)
  "900": "#1F1C18",
  "950": "#131010"    // near-black
}
```

**Complete palettes:**

| Palette | Personality | Used For | Semantic Mapping |
|---------|-------------|----------|-----------------|
| `stone` | Warm neutral greys | Primary, backgrounds, text, borders | `--color-primary`, `--color-background`, `--color-foreground`, `--color-border` |
| `brick` | Muted terracotta red | Destructive / error states | `--color-destructive` |
| `sage` | Earthy green | Success states | `--color-success` |
| `amber` | Warm yellow-gold | Warning states | `--color-warning` |
| `slate` | Cool blue-grey | Info / informational states | `--color-info` |

**Why named palettes instead of `gray`?** Personality (stone = warm, gray = nothing), avoids Tailwind naming collisions, easier to find the right value.

**Ramp structure (2026-07-01):** All five palettes carry the identical 12-step index set: `0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950`. The accent ramps' original 6 anchors (50, 100, 400, 500, 600, 700) are the brand values and are unchanged; the other 6 steps per accent were derived in OKLCH against stone's lightness curve as the tonal spine, so any accent step sits at the same perceived depth as the same stone step. Hue is held constant within each ramp; chroma tapers toward both ends so ramps converge on the stone backgrounds — step 0 is a barely-tinted wash one breath off white, and the 900/950 steps are quiet tinted near-blacks that sit beside `stone.950` in dark mode. Generation script preserved at the decisions log entry "Accent Ramps Extended to 12 Steps". Guaranteed properties: monotonic lightness per ramp; `600` on white ≥ 4.5:1; `300` on `stone.950` ≥ 9:1 (dark-mode text headroom).

### Tier 2: Semantic Tokens

Map primitives to **purpose**. Components use this layer. Dark mode swaps this layer without touching components.

```json
"primary":              { "$value": "{primitive.color.stone.800}" },
"primary-hover":        { "$value": "{primitive.color.stone.900}" },
"primary-foreground":   { "$value": "{primitive.color.stone.0}" },
"background":           { "$value": "{primitive.color.stone.0}" },
"foreground":           { "$value": "{primitive.color.stone.950}" }
```

**Naming contract:** Semantic tokens come in pairs where applicable:
- `--color-primary` = background/fill color
- `--color-primary-foreground` = text color on top of primary

Both sides of the contrast pair are defined together — illegible text is impossible if you follow this pattern.

**Complete semantic color set** (defined per mode in `tokens.json` under `semantic.color.light` / `semantic.color.dark` — 32 tokens each, parity enforced by the build):
```
--color-background           --color-background-subtle      --color-background-surface
--color-foreground           --color-foreground-secondary   --color-foreground-subtle    --color-foreground-muted
--color-border               --color-border-strong
--color-primary              --color-primary-hover          --color-primary-active       --color-primary-foreground
--color-secondary            --color-secondary-hover        --color-secondary-active     --color-secondary-foreground
--color-destructive          --color-destructive-hover      --color-destructive-active   --color-destructive-foreground   --color-destructive-subtle
--color-success              --color-success-subtle         --color-success-foreground
--color-warning              --color-warning-subtle         --color-warning-foreground
--color-info                 --color-info-subtle            --color-info-foreground
--color-focus-ring
--color-overlay              (composite: color-mix with φ-derived 38.2% opacity)
```

**Text tone roles — the contrast contract (light mode, on stone.50):**

| Token | Value | Contrast | Permitted use |
|-------|-------|----------|---------------|
| `--color-foreground` | stone.950 | 17.9:1 | Primary text |
| `--color-foreground-secondary` | stone.600 | 5.96:1 | **The floor for any normal-size readable text** — hints, captions, placeholders, meta, supporting copy |
| `--color-foreground-subtle` | stone.500 | 3.87:1 | Large text (≥24px, or ≥18.7px bold) and non-text UI glyphs (chevrons, separators) only — passes 3:1, fails 4.5:1 |
| `--color-foreground-muted` | stone.400 | 2.52:1 | Disabled and decorative elements only (WCAG-exempt) — never readable text, never state-bearing glyphs |

### Tier 3: Component Tokens

Scoped to the component's root class. Lets consumers override without touching globals.

```css
/* Component defines defaults */
.ds-button {
  --button-radius:      var(--radius-md);
  --button-font-weight: var(--font-weight-medium);
}

/* Consumer overrides cleanly — no !important, no specificity wars */
.my-app .ds-button {
  --button-radius: var(--radius-full);
}
```

---

## Known Semantic Token Gaps

Both previously-listed gaps are **resolved** (2026-07-01 audit):

| Former gap | Resolution |
|-----------|-----------|
| No "moderate foreground" | `--color-foreground-secondary` (stone.600 light / stone.300 dark) fills this role — see the text tone roles table above |
| No variant-specific `*-foreground` | `--color-{success,warning,info,destructive}-foreground` and `*-subtle` all exist in both modes, defined in `tokens.json` |

No known gaps remain. **Rule:** When you find a new gap, add it here AND add a decisions log entry. Don't silently use a primitive — document why the semantic layer doesn't cover it.

---

## Dark Mode

Implemented by overriding semantic tokens under `.dark` on `<html>`:

```css
:root {
  --color-background:  #FFFFFF;
  --color-foreground:  #131010;
  --color-primary:     #342F2A;
}

.dark {
  --color-background:  #131010;
  --color-foreground:  #FAF9F7;
  --color-primary:     #E3DED6;
}
```

**To enable:** Add `class="dark"` to `<html>`. Components need zero dark-mode-specific code.

**In Storybook:** `preview.ts` decorator toggles `.dark` on `document.body` when dark background is selected.

**Dark mode + `color-mix`:** Mixing against `transparent` produces unpredictable results in dark mode. Mixing against `var(--color-background-subtle)` (an opaque dark color) works because both sides are opaque.

---

## CSS Variable Naming Convention

```
--{category}-{subcategory?}-{modifier?}

--color-primary                  category: color, modifier: primary
--color-primary-hover            with state modifier
--color-primary-foreground       paired foreground
--font-size-sm                   category: font, subcategory: size, scale: sm
--spacing-4                      category: spacing, scale: 4 = 16px
--spacing-phi-13                 category: spacing, phi scale: Fib(13) × 2 = 26px
--shadow-md                      category: shadow, scale: md
--transition-fast                category: transition, shorthand
--radius-lg                      category: radius, scale: lg
--z-index-modal                  category: z-index, context: modal
--size-control-md                category: size, subcategory: control, scale: md
--size-content-xl                category: size, subcategory: content, scale: xl
--opacity-medium                 category: opacity, scale: medium (φ-derived)
--spacing-fluid-md               category: spacing, fluid scale: clamp() 26px→42px
--aspect-golden                  category: aspect, ratio: φ:1
--elevation-card                 category: elevation, surface: card (→ var(--shadow-md))
--safe-area-bottom               category: safe-area, edge: bottom (env() inset)
--scale-press                    category: scale, interaction: pressed state
--measure-reading                category: measure, context: body-text line length
```

---

## All Token Scales — Complete Reference

### Type Scales

Three scales, each using a different fractional power of φ:

| Scale | CSS Prefix | Step Ratio | Use Case |
|-------|-----------|-----------|----------|
| **Tight** | `--font-size-tight-*` | φ^(1/3) ≈ 1.175 | Component UI text (see mapping below) |
| **Default** | `--font-size-*` | √φ ≈ 1.272 | Page content (see mapping below) |
| **Display** | `--font-size-display-*` | φ ≈ 1.618 | Marketing / editorial (see mapping below) |

**Default scale** (base 16px, √φ step):
```
xs   = 12px (0.75rem)    sm   = 14px (0.875rem)   base = 16px (1rem)
lg   = 20px (1.25rem)    xl   = 26px (1.625rem)    2xl  = 33px (2.0625rem)
3xl  = 42px (2.625rem)   4xl  = 54px (3.375rem)    5xl  = 68px (4.25rem)
```
Note: xs and sm anchored at 12px/14px (not strict φ values 10px/13px) for accessibility at small sizes.

**Fluid sizing (clamp).** `base` through `5xl` are *fluid*, not fixed: each token
is a `clamp(min, preferred + Nvw, max)` where the px listed above is the **max**
(the desktop cap). They scale down smoothly on narrower viewports to a floor and
grow back up with the screen — so type resizes continuously with viewport width,
with **no breakpoints**. `xs` and `sm` stay fixed (legibility at small sizes).

Example — `--font-size-4xl: clamp(2.125rem, 1.39rem + 3.76vw, 3.375rem)` renders
~34px on a 375px phone and caps at 54px on desktop. Because heading classes
(`.ds-heading--4xl` etc.) and body classes (`.ds-text--lg` etc.) consume these
tokens directly, every consumer inherits the fluid behavior automatically —
avoid re-declaring `font-size` at breakpoints unless a specific design step-down
is intended (e.g. the hero headline drops one scale on mobile on purpose).

**Tight scale** (base 16px, φ^(1/3) step):
```
tight-2xs = 10px   tight-xs = 12px    tight-sm = 14px    tight-base = 16px
tight-lg  = 19px   tight-xl = 22px    tight-2xl = 26px   tight-3xl = 30px   tight-4xl = 36px
```

**Display scale** (base 16px, φ step):
```
display-xs = 10px    display-sm = 16px
display-md = 26px    display-lg = 42px   display-xl = 68px   display-2xl = 110px
```

**Display scale is fluid too (2026-07-06).** `display-md` through `display-2xl` use the
same `clamp()` technique as `base`–`5xl`: min = desktop value × 0.72 at a 375px viewport,
max = the φ-scale value above, linear interpolation between 375px and 1200px.
`display-xs` and `display-sm` stay fixed (legibility at small sizes — same reasoning as `xs`/`sm`).

| Token | 375px floor | Desktop max | Emitted value |
|-------|------------|-------------|---------------|
| `--font-size-display-md` | 18.72px | 26px | `clamp(1.17rem, 0.9632rem + 0.88vw, 1.625rem)` |
| `--font-size-display-lg` | 30.24px | 42px | `clamp(1.89rem, 1.5559rem + 1.43vw, 2.625rem)` |
| `--font-size-display-xl` | 48.96px | 68px | `clamp(3.06rem, 2.5191rem + 2.31vw, 4.25rem)` |
| `--font-size-display-2xl` | 79.2px | 110px | `clamp(4.95rem, 4.075rem + 3.73vw, 6.875rem)` |

Clamp math (same for every fluid token): `slope = (max − min) / (1200 − 375)`,
vw coefficient = slope × 100, intercept = min − slope × 375, both converted to rem (÷16).

### Type Scale Context Mapping

Use this table to determine which scale applies in a given context. When in doubt, use the Default scale.

| Context | Scale | Examples |
|---------|-------|----------|
| **Component UI text** | **Tight** | Form labels, input text, table cells, badge text, caption text, breadcrumb text, select options, checkbox labels, tooltip text |
| **Page content** | **Default** | Body paragraphs, headings (h1–h4), card titles, product names, prices, accordion triggers, modal titles, navigation links |
| **Marketing / editorial** | **Display** | Hero headings, campaign text, pull quotes, landing page headlines, promotional banners |

**Decision rule for ambiguous cases:**
- If the text lives *inside* a reusable component → **Tight**
- If the text is part of *page content* that a user reads → **Default**
- If the text is designed to *make an impression* before being read → **Display**

**PDP example:** A product page section heading ("You May Also Like") uses the **Default** scale — it's page content, not component UI. The product card's price text inside the grid uses the **Default** scale too (it's the primary content). The breadcrumb above it uses **Tight** (component UI).

### Typography

```
Font families:   body (IBM Plex Sans), code (JetBrains Mono), numeric (JetBrains Mono)
                 Named by role, not classification — see 06-decisions-log.md
                 numeric = numerals/amounts (prices, quantities, page numbers, %),
                 monospace for tabular alignment. Applied via --font-family-numeric.
Font weights:    normal (400) → medium (500) → semibold (600) → bold (700)
Line heights:    none (1) → tight (1.15) → snug (1.382) → normal (1.5) → relaxed (1.618=φ) → loose (2)
                 φ derivations: tight=1.15 (visual override, see decisions log)
                                snug=1+1/φ²=1.382, normal=1.5 (conventional, see decisions log)
                                relaxed=φ=1.618, loose=2×1 (double-space)
Letter spacing:  tighter → tight → normal → wide → wider
```

### Spacing

**Two scales — different scopes. Never mix within the same component.**

| Scale | Tokens | Base | Use For |
|-------|--------|------|---------|
| **Standard (4px grid)** | `--spacing-0` through `--spacing-24` | 4px | Default for everything: component internals, element-to-element gaps, section rhythm |
| **Phi (Fibonacci × 2)** | `--spacing-phi-1` through `--spacing-phi-89` | 2px | Proportional layout relationships: sidebar-to-content ratios, layout split proportions |

**Standard scale values:**
```
0=0  1=4px  2=8px  3=12px  4=16px  5=20px  6=24px  8=32px  10=40px  12=48px  16=64px  20=80px  24=96px
```

**Phi scale values:**
```
phi-1=2px  phi-2=4px  phi-3=6px  phi-5=10px  phi-8=16px  phi-13=26px  phi-21=42px  phi-34=68px  phi-55=110px  phi-89=178px
```

**Layout grid section rhythm:** `--spacing-16` (64px) for gaps between major page sections. See `09-layout-grid.md`.

### Fluid Spacing (2026-07-06)

Four clamp-based steps for **section/layout rhythm** that scales continuously with the
viewport — no breakpoints. Each step interpolates between two adjacent phi-scale values
(min at a 375px viewport, max at 1200px), using the same rem + vw `clamp()` technique
as the fluid type scale. Because the endpoints are consecutive phi steps, each token is
its floor value on mobile and grows by ×φ by desktop — the φ relationship holds at both
ends of the range.

| Token | Min (375px) | Max (1200px) | Phi endpoints | Emitted value |
|-------|-------------|--------------|---------------|---------------|
| `--spacing-fluid-sm` | 16px | 26px | phi-8 → phi-13 | `clamp(1rem, 0.7159rem + 1.21vw, 1.625rem)` |
| `--spacing-fluid-md` | 26px | 42px | phi-13 → phi-21 | `clamp(1.625rem, 1.1705rem + 1.94vw, 2.625rem)` |
| `--spacing-fluid-lg` | 42px | 68px | phi-21 → phi-34 | `clamp(2.625rem, 1.8864rem + 3.15vw, 4.25rem)` |
| `--spacing-fluid-xl` | 68px | 110px | phi-34 → phi-55 | `clamp(4.25rem, 3.0568rem + 5.09vw, 6.875rem)` |

**Scope:** section/page-level rhythm only (hero padding, section gaps that should breathe
with the viewport). Component internals keep the fixed standard scale — fluid values inside
components would break their fixed-height/optical-centering math.

Derivation per token: `slope = (max − min) / (1200 − 375)`; vw coefficient = slope × 100;
rem intercept = (min − slope × 375) / 16. Example (`fluid-md`): slope = 16 / 825 = 0.0194 →
`1.94vw`; intercept = 26 − 7.27 = 18.73px = `1.1705rem`.

### Phi vs Standard Spacing — When to Use Which

**Standard scale (`--spacing-*`) is the default for everything.** Use it for:
- Component internals (padding, margins, gaps between elements)
- Space between a heading and its following paragraph → `--spacing-3` or `--spacing-4`
- Space between a form label and its input → `--spacing-1` or `--spacing-2`
- Space between a breadcrumb and the page heading below it → `--spacing-4` or `--spacing-6`
- Space between an accordion group and the next content section → `--spacing-6` or `--spacing-8`
- Section rhythm → `--spacing-16` (64px) via `.ds-section`
- Any time you're thinking "I need some space here"

**Phi scale (`--spacing-phi-*`) is only for proportional layout relationships.** Use it when:
- The mathematical relationship to φ is the actual design intent
- Establishing sidebar-to-content width ratios (e.g., a secondary column sized at `--spacing-phi-*` relative to the primary)
- Aspect ratio approximations in layout calculations
- Any case where the Fibonacci progression itself — not just "a spacing value" — drives the decision

**Never use phi scale for:**
- Section rhythm (use `--spacing-16` / `.ds-section`)
- Vertical spacing between page sections
- Component padding or margins
- Element-to-element gaps

**Test: "Would any standard scale value work just as well here?"** If yes, use the standard scale. Phi is only appropriate when the proportional relationship matters more than the absolute value.

### Radius

Fibonacci sequence: `none` (0) → `sm` (2px) → `md` (5px) → `lg` (8px) → `xl` (13px) → `2xl` (21px) → `full` (9999px)

### Shadows

Fibonacci blur progression with warm alpha values:

| Token | Y-offset | Blur | Fibonacci Steps |
|-------|----------|------|----------------|
| `--shadow-sm` | 1px | 2px | Fib(1), Fib(3) |
| `--shadow-md` | 2px | 5px | Fib(3), Fib(5) |
| `--shadow-lg` | 5px | 13px | Fib(5), Fib(7) |
| `--shadow-xl` | 8px | 21px | Fib(6), Fib(8) |
| `--shadow-2xl` | 13px | 34px | Fib(7), Fib(9) |

Warm shadows use lower alpha (`rgb(0 0 0 / 0.05–0.18)`) than typical cold-grey systems to match the palette.

### Opacity

φ-derived: successive powers of 1/φ:
```
full = 1.0    high = 0.618    medium = 0.382    low = 0.236    subtle = 0.146    ghost = 0.09
```

**`--opacity-medium` (0.382) is used for all disabled states.** Never hardcode `0.5`.

### Transitions

φ-derived durations with shared easing:
```
--transition-fast:   100ms cubic-bezier(0.4, 0, 0.2, 1)
--transition-normal: 162ms cubic-bezier(0.4, 0, 0.2, 1)    ← 100 × φ
--transition-slow:   262ms cubic-bezier(0.4, 0, 0.2, 1)    ← 162 × φ
```

Two further duration steps exist for animation loops (no shorthand — pair with an easing explicitly):
```
--transition-duration-slower:  424ms    ← 262 × φ
--transition-duration-slowest: 686ms    ← 424 × φ  (e.g. Button spinner rotation)
```
Ambient rhythms slower than this scale (e.g. StockIndicator's 2s pulse) are declared as component tokens with an inline rationale — they are status breathing, not interaction feedback.

```css
/* ✅ Do this */
transition: background-color var(--transition-fast);

/* ❌ Don't do this */
transition: background-color 100ms cubic-bezier(0.4, 0, 0.2, 1);
```

### Size: Control Heights

φ/Fibonacci-derived. Zero magic numbers in component CSS.

| Token | Value | Derivation | Used By |
|-------|-------|-----------|---------|
| `--size-control-sm` | 34px | Fibonacci | Small buttons, inputs, selects |
| `--size-control-md` | 42px | Fib × 2 (phi-21) | Default buttons, inputs, selects |
| `--size-control-lg` | 55px | Fibonacci | Large buttons, inputs, selects |
| `--size-checkbox-sm` | 13px | Fibonacci | Small checkbox |
| `--size-checkbox-md` | 21px | Fibonacci (13 × φ ≈ 21) | Default checkbox |
| `--size-icon` | 16px | Base font size | Standard icon dimension (legacy, prefer sized variants) |
| `--size-icon-sm` | 16px | 4px grid | Small icon (inline, dense UI) |
| `--size-icon-md` | 20px | 4px grid | Default icon (buttons, nav) |
| `--size-icon-lg` | 24px | 4px grid | Large icon (standalone, hero) |

Note: 34→42→55 approximates √φ step ratio (42/34=1.235, 55/42=1.310, avg≈1.272=√φ).

### Size: Content Widths

| Token | Value | Use Case |
|-------|-------|----------|
| `--size-content-sm` | 640px | Constrained dialogs, cookie consent, narrow overlays |
| `--size-content-md` | 768px | Medium content areas, form containers, settings panels |
| `--size-content-lg` | 960px | Wide content areas, feature sections |
| `--size-content-xl` | 1280px | Container component `xl` size |
| `--size-container` | 1200px | THE page container in the DS/docs — `.ds-page-container`, Header/Footer inner width |
| `--size-container-wide` | 1396px | Wide-screen page frame: the STOREFRONT's page container, header, footer, and announcement bar (1300px visible + 48px padding each side); also the docs-site AnnouncementBar |

**⚠️ Page content max-width: always use `.ds-page-container` (which references `--size-container`, 1200px).** The 1200px value was chosen for cleaner 12-column grid math (see `09-layout-grid.md`). As of the 2026-07-01 audit, Header, Footer, and the layout grid all reference `--size-container` — the value is defined exactly once.

**Storefront exception:** the Shopify storefront runs its whole page frame at `--size-container-wide` (1300px visible) on wide screens — a deliberate storefront-side decision that must NOT be ported back into the DS. See `09-layout-grid.md` → "Storefront divergence" and the decisions log.

### Aspect Ratios

Tokenized as of 2026-07-06 (`--aspect-*`). Two φ ratios plus the practical media
ratios components already use — always `aspect-ratio: var(--aspect-*)`, never a raw ratio:

| Token | Value | Use Case |
|-------|-------|----------|
| `--aspect-square` | 1 / 1 | Avatars, thumbnails, cart line images, icon tiles |
| `--aspect-portrait` | 4 / 5 | Product cards, gallery images (editorial standard) |
| `--aspect-landscape` | 4 / 3 | Default card image — `--card-image-ratio` references this shape |
| `--aspect-video` | 16 / 9 | Embedded video, wide media banners |
| `--aspect-golden` | 1.618 / 1 | φ landscape — banners, hero images |
| `--aspect-golden-portrait` | 1 / 1.618 | φ portrait — editorial/campaign imagery |

Note: 4/5 (= 0.8) is the practical neighbor of 1/√φ ≈ 0.786 — the standard product
ratio chosen with the storefront; the golden pair carries the exact φ proportion for
editorial moments.

### Elevation (Semantic Shadow Layer)

Semantic aliases over the Fibonacci shadow scale, added 2026-07-06. Components say what
the surface *is*; the shadow scale decides how it looks. Emitted as **references**
(`var(--shadow-*)`), not copied values — retuning a shadow flows through every elevation.

| Token | Maps To | Used For |
|-------|---------|----------|
| `--elevation-card` | `var(--shadow-md)` | Resting cards, tiles |
| `--elevation-dropdown` | `var(--shadow-lg)` | Select menus, popovers, tooltips |
| `--elevation-sticky` | `var(--shadow-lg)` | Sticky headers/bars once scrolled |
| `--elevation-modal` | `var(--shadow-xl)` | Modal dialogs |
| `--elevation-toast` | `var(--shadow-2xl)` | Toasts, drawers — topmost transient surfaces |

Rule: components reference `--elevation-*` (intent), not `--shadow-*` (scale), the same
way color works — semantic over primitive.

### Safe Area

Device inset tokens (notch, home indicator, curved corners) with a `0px` fallback so
they're inert on desktop:

```
--safe-area-top     env(safe-area-inset-top, 0px)
--safe-area-right   env(safe-area-inset-right, 0px)
--safe-area-bottom  env(safe-area-inset-bottom, 0px)
--safe-area-left    env(safe-area-inset-left, 0px)
```

Use in fixed/sticky chrome: `padding-bottom: calc(var(--spacing-4) + var(--safe-area-bottom))`
on bottom bars, drawers, and toasts. Requires `viewport-fit=cover` in the page's viewport
meta to take effect on notched devices.

### Interaction

| Token | Value | Purpose |
|-------|-------|---------|
| `--scale-press` | 0.98 | Pressed-state `transform: scale(var(--scale-press))` — previously a magic number in Button, Checkbox, Modal, Drawer, VariantSelector |
| `--size-hit-area` | 44px | Minimum touch **hit zone** (invisible) — Apple HIG/WCAG 2.5.8 floor. Distinct from `--size-touch-target` (36px), which is the *visual* icon-button size; extend the hit area with padding or a pseudo-element, not by growing the visual |
| `--size-swipe-threshold` | 50px | Minimum drag distance to register a swipe (carousels, drawers) — JS-consumable via the tokens JSON export |

Note: `--size-touch-target-lg` (44px) predates `--size-hit-area` and shares its value;
`hit-area` is the semantic name for "invisible minimum hit zone" — prefer it in new code.

### Reading Measure

```
--measure-reading: 65ch
```

The 65-character optimal line length for body text — the value behind the "reading width"
rule. Previously hardcoded as `max-width: 65ch` in Typography, Alert, Footer, and
EmptyState; components should reference the token. `ch` units only — never a px measure.

### Z-Index

```
base (0) → raised (10) → overlay (100) → modal (200) → toast (300) → tooltip (400)
```

Always `var(--z-index-*)`. Never hardcode z-index numbers.

---

## Transparent Color Variants

For semi-transparent versions of CSS variables (focus rings, overlays):

```css
/* ✅ Works in dark mode — variable resolves to current mode's value first */
box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-focus-ring) 20%, transparent);

/* ❌ Breaks in dark mode — hardcoded hex doesn't respond to .dark */
box-shadow: 0 0 0 3px rgba(78, 71, 63, 0.2);
```

### ⚠️ `color-mix` with `transparent` — WCAG limitation

`color-mix(in srgb, var(--color) N%, transparent)` is mathematically incapable of meeting WCAG contrast at low percentages:
- At 8% mix: near-invisible
- At 18% mix: borders can't reach 3:1
- Even at 50%: often insufficient

**Use `color-mix(… %, transparent)` ONLY for purely decorative elements** (focus rings, hover glows). For any element that needs WCAG contrast (badge backgrounds, borders, text), use solid primitive references.

**For dark mode `color-mix`:** Mix against `var(--color-background-subtle)` (opaque), not `transparent`. Both sides opaque = predictable result.

`color-mix()` browser support: Chrome 111+, Firefox 113+, Safari 16.2+.

---

## The Build Pipeline

`tokens.json` → CSS variables in two steps:

```bash
pnpm --filter @ds/tokens build
# Step 1: tsup → dist/index.mjs + dist/index.js (TypeScript exports)
# Step 2: node scripts/build-css.mjs → dist/tokens.css (CSS variables)
```

**`build-css.mjs` generates:**

| Output | Selector | What |
|--------|----------|------|
| Primitive tokens | `:root` | `--color-stone-50`, `--spacing-4`, etc. |
| Semantic tokens (light) | `:root, [data-theme="light"]` | `--color-primary`, etc. |
| Semantic tokens (dark) | `.dark, [data-theme="dark"]` | Same names, different primitives |
| Transition shorthands | `:root` | `--transition-fast/normal/slow` |
| Composite tokens | `:root` / `.dark` | `--color-overlay`, `--focus-ring-color` |
| Global focus-visible | `*:focus-visible` | Safety net for non-library elements |
| Reduced motion | `@media (prefers-reduced-motion)` | Accessibility requirement |

### ⚠️ Watch mode limitation

`tsup --watch` only rebuilds TypeScript exports. It does NOT regenerate `tokens.css`. If you change `tokens.json` and need CSS updates, run the full build:

```bash
pnpm --filter @ds/tokens build
```

---

## How to Add a New Token

1. Add the value to `packages/tokens/src/tokens.json` in the correct tier
2. If it's a composite token (like `--color-overlay`), add it to `build-css.mjs`
3. Run `pnpm --filter @ds/tokens build` to regenerate `dist/tokens.css`
4. Rebuild downstream: `pnpm --filter @ds/components build`
5. The new CSS variable is now available everywhere that imports `@ds/tokens/css`

## How to Rename a Token

1. `grep -r "old-token-name" .` — find every usage
2. Update the name in `tokens.json` (and `build-css.mjs` if applicable)
3. Update every reference found in step 1
4. Run `pnpm --filter @ds/tokens build`
5. `grep -r "old-token-name" .` again — verify zero results
6. Rebuild and test: `pnpm build && pnpm test`

**CSS variables fail silently.** There is no build error when a variable doesn't exist. The only way to catch stale references is to search for them.

## How to Extend a Scale

When adding a new step to an existing scale (e.g., a new font size):

1. Calculate the value using the scale's φ derivation (see math reference)
2. Verify it fits the existing progression — the ratio to adjacent steps should be consistent
3. If it deviates from φ, document why (e.g., accessibility minimum)
4. Add to `tokens.json`, rebuild, grep for conflicts
5. Update this document's reference table
6. Add a decisions log entry in `06-decisions-log.md`
