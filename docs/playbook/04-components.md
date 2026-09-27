# 04 — Components

> Architecture, patterns, and review standards for every component. Accessibility rules are collected in `14-accessibility.md`; motion rules in `13-motion.md`.

---

## Rules — Non-Negotiable

Read these before building or modifying any component.

1. **4-file rule.** Every component has at least: `{Component}.tsx`, `{Component}.css`, `{Component}.test.tsx`, `{Component}.stories.tsx`, `index.ts` (Icon adds `icons.tsx`, the registry). All built in the same session. No exceptions.
2. **Components own their styles.** All visual styling lives in the component's CSS file. Demo pages and example pages never override component appearance.
3. **If something looks wrong on a page, fix the component — not the page.** The fix must benefit every page that uses the component.
4. **No overrides.** Block components never target a primitive's internal CSS classes. If the primitive doesn't support what you need, update the primitive first. See the No Overrides section below.
5. **No raw values.** Every CSS value references a token. If the token doesn't exist, flag it as a gap.
6. **`forwardRef` on everything.** Every component accepts a ref. Set `displayName`.
7. **Accessibility passes or the component doesn't ship.** Every component passes axe with zero violations. Keyboard navigation works. Focus states are visible. Full list: `14-accessibility.md`.
8. **Always use `<Heading>` and `<Text>`.** Never raw `<h1>`–`<h6>` or `<p>` — not in components, not in demos, not anywhere.
9. **Disabled state uses `opacity: var(--opacity-medium)`.** Never `opacity: 0.5`. Fade the control and the label beside it (checkbox, switch, radio option) — never the field or group label above it, and never the hint, which often explains how to enable it. One fade only: never opacity plus a muted colour. A focusable `aria-disabled` control un-fades while focused, or its focus ring fades too.
10. **Hover only where a pointer hovers.** Wrap every `:hover` rule in `@media (hover: hover)`; touch screens keep `:hover` after a tap. Exception: `:not(:hover)` keyboard-highlight rules stay ungated. `check-css` enforces it.
11. **Hit areas:** at least 24×24px for every pointer (WCAG 2.5.8), 44px on touch, grown invisibly (pseudo-element) without changing the φ control heights — and grown outward, never over a neighbouring field.
12. **`display: none` on a child component's class = missing API.** Flag it and fix the component. Don't work around it in consumer CSS.
13. **Use the shared helpers** in `src/internal/` (below) — never a second money formatter, a hand-rolled live region, an unchecked data-driven `href`, or `document.activeElement` to find a dialog's opener.
14. **`pnpm lint` and `pnpm typecheck` pass.** Lint runs `check-css` over every component CSS file; typecheck compiles every story.

---

## Common Mistakes

| Mistake | What Happens | Correct Approach |
|---------|-------------|-----------------|
| Styling a component from the page CSS | Same component looks different across pages | Fix the component, create a variant if needed |
| `.parent .ds-accordion__trigger { padding }` | Invisible contract — breaks if primitive refactors | Update the primitive to support the use case |
| `display: none` on child's internal class | Fragile, invisible, breaks on refactor | Add a prop or render slot to the component |
| Forgetting `font-family` on portalled content | Select dropdown, Modal content use wrong font | Explicitly declare `font-family: var(--font-family-body)` on Radix Portal elements |
| `color-mix(… 8%, transparent)` for badge bg | Fails WCAG contrast — mathematically impossible | Use solid primitive (e.g., `--color-sage-50`) |
| Visual inline `style={{ }}` in stories or workbench sheets | Invisible to search, drifts from tokens | Layout wrappers only, with `var(--token)` values; anything visual belongs in the component |
| Raw `<p>` or `<h2>` in stories or sheets | Doesn't use the design system's own components | Use `<Text>` and `<Heading>` |
| Native `disabled` on a control that disables itself while focused | Focus drops to `<body>` | `aria-disabled="true"` and ignore the click |
| `:hover` outside `@media (hover: hover)` | Hover sticks after a tap on phones | Gate it (`check-css` fails the lint) |
| Hardcoded `opacity: 0.5` | Not φ-derived, inconsistent | `var(--opacity-medium)` — 0.382 |
| Fixed-width component in fluid grid | Phantom gaps, uneven whitespace | Provide a `fluid` variant |

---

## The 4-File Rule

Every component lives in its own folder:

```
packages/components/src/{component}/
├── {Component}.tsx          ← React implementation
├── {Component}.css          ← Styles (component tokens + all variants)
├── {Component}.test.tsx     ← Vitest + Testing Library + axe
├── {Component}.stories.tsx  ← Storybook stories (one per variant/state)
└── index.ts                 ← Re-exports
```

---

## TypeScript Patterns

### Required on every component

```tsx
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ variant = 'primary', size = 'md', ...props }, ref) {
    return <button ref={ref} type="button" {...props} />
  }
)
Button.displayName = 'Button'
```

| Requirement | Why |
|------------|-----|
| `forwardRef` with correct element type | Consumers need ref for focus, animation, 3rd-party libs |
| `displayName` | Without it, React DevTools shows "ForwardRef" |
| Extends native HTML attributes | Consumers get `onClick`, `disabled`, `aria-*` for free |
| Default `variant` and `size` in signature | Most common usage needs zero props |
| `type="button"` on buttons | Prevents accidental form submission |
| String literal unions, not enums | Enums generate runtime code. Unions are zero-cost. |

### Props interface pattern

```tsx
// Extends all native <button> attributes
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  asChild?: boolean
  loading?: boolean
}

// When native prop conflicts with ours — Omit it
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg'
  label?: string
  error?: string
}
```

### Component API conventions

| Convention | Example | Why |
|------------|---------|-----|
| Default variant is `'primary'` | `variant = 'primary'` | Most common, no prop required |
| Default size is `'md'` | `size = 'md'` | Middle of scale |
| Boolean props false by default | `loading = false` | Opt-in |
| Polymorphic via `asChild` | `asChild?: boolean` | Radix Slot — the correct way |
| Loading blocks activation, keeps focus | `aria-disabled` + `aria-busy`, click swallowed — never native `disabled` | Prevents double-submit without dropping focus to `<body>` |
| Icons are `ReactNode` | `leadingIcon?: ReactNode` | Accepts any icon library |
| Error strings, not booleans | `error?: string` | Text is both indicator and message |
| Prices are integer hundredths | `price={4800}` + `currency`/`locale` props | See "Internal Helpers" → `format-money` |
| Every prop set is exported | `export type { ButtonProps }` from `index.ts` | Consumers can wrap and extend |
| Wrap Radix parts, never rename them | `forwardRef` wrapper with its own `displayName` | Renaming the Radix object renames it for every user on the page |

---

## The `asChild` / Slot Pattern

The correct way to make polymorphic components. **Do not use `as={Link}` prop patterns — they break type safety.**

```tsx
import { Slot } from '@radix-ui/react-slot'

const Comp = asChild ? Slot : 'button'
return <Comp className={classes} {...props}>{children}</Comp>
```

```tsx
// The <a> gets all Button styles and aria attributes
<Button asChild>
  <a href="/checkout">Proceed to checkout</a>
</Button>
```

Used in: Button, plus the trigger/close parts that wrap Radix (Modal, Popover, Tooltip, DropdownMenu). Typography does **not** use `asChild` — `Heading` and `Text` take `as` (the element to render).

---

## Internal Helpers (`src/internal/`)

Shared, not exported from the package. Use them — each exists because the hand-rolled version broke.

| Helper | Use it when | Why |
|--------|-------------|-----|
| `format-money.ts` — `formatMoney(cents, currency, locale)`, `currencyDecimals()` | Any component shows a price | Amounts are integer hundredths for **every** currency (Shopify's convention: $48.00 = 4800, ¥4,800 = 480000); Intl shows each currency's own decimals. One cached formatter per locale + currency (constructing one costs ~160µs on a phone). Locale is always explicit, so server and browser agree (no hydration mismatch). |
| `use-change-announcement.ts` — `useChangeAnnouncement(message)` | A count or status should be read aloud when it changes | Returns `''` on first render and the new text on change. A live region rendered with its text is skipped or read twice. |
| `dialog-opener.ts` — `trackDialogOpeners()`, `dialogOpener()` | An overlay must return focus on close | Safari doesn't focus a clicked button, so `document.activeElement` is `<body>`; this remembers the last pressed control. |
| `safe-url.ts` — `safeHref(href)` (added 2026-09-26) | Any `href` that comes from store data (menus, breadcrumbs, cart lines, announcement links) | React 18 renders `href="javascript:…"` as given. Returns the href unchanged when safe, `undefined` (an inert link) for `javascript:`, `vbscript:` and `data:`. |
| `dev-warning.ts` — `devWarning(key, message)` | A prop combination is misuse (icon-only button without a name, unnamed popover, controlled value without `onChange`) | One console warning per kind of misuse, development only — dead code in production bundles. Tests call `resetDevWarnings()`. |

---

## CSS Patterns

### BEM with `ds-` namespace

```
.ds-{component}                ← root
.ds-{component}--{variant}     ← variant modifier
.ds-{component}--{state}       ← state modifier
.ds-{component}__{part}        ← child element
```

### Class assembly — always this pattern

```tsx
// ✅ Array + filter
const classes = [
  'ds-button',
  `ds-button--${variant}`,
  `ds-button--${size}`,
  loading && 'ds-button--loading',
  className,
].filter(Boolean).join(' ')

// ❌ Never template literals for conditional classes
const classes = `ds-button ds-button--${variant}${loading ? ' ds-button--loading' : ''}`
```

### Component token scoping

Each component declares tokens on its root class — the "knobs" consumers can turn:

```css
.ds-button {
  --button-radius:      var(--radius-md);
  --button-font-weight: var(--font-weight-medium);
  border-radius: var(--button-radius);
  font-weight: var(--button-font-weight);
}
```

### `font-family` inheritance

Declare once on root. Children inherit. **Exception:** Radix Portal content (Select dropdown, Modal) renders at `document.body` — must declare `font-family` explicitly.

```css
/* Root — declare once */
.ds-input-root { font-family: var(--font-family-body); }

/* Portalled content — must be explicit */
.ds-select-trigger { font-family: var(--font-family-body); }
.ds-select-item    { font-family: var(--font-family-body); }
```

### Transition shorthand

```css
/* ✅ */  transition: background-color var(--transition-fast);
/* ✅ */  transition: transform var(--transition-duration-slow) var(--transition-easing-emphasized);
/* ❌ */  transition: background-color 100ms cubic-bezier(0.4, 0, 0.2, 1);
```

### Hover, disabled, hit areas

```css
/* Hover only where a pointer hovers — touch keeps :hover after a tap */
@media (hover: hover) {
  .ds-x:hover:not(:disabled):not([aria-disabled='true']) { background-color: var(--color-secondary-hover); }
}

/* One fade, on the control (and its inline label) — never on the hint */
.ds-x:disabled,
.ds-x[aria-disabled='true'] { opacity: var(--opacity-medium); cursor: not-allowed; }

/* Grow the hit zone invisibly, outward; the visible size stays on the φ ladder.
   The element needs position: relative. Isolated control: no media guard.
   Controls with close neighbours: wrap in @media (pointer: coarse). */
.ds-x::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: max(100%, var(--size-hit-area));
  height: max(100%, var(--size-hit-area));
  transform: translate(-50%, -50%);
}
```

Which hit-area pattern fits (isolated, adjacent, flush-stacked, inline) is in `07-lessons-learned.md#hit-area-selection`.

### Where `check-css` draws the line

`packages/components/scripts/check-css.mjs` runs in `pnpm lint` and fails on: undefined `var()`, component tokens nothing reads, raw values (colours, lengths, durations, curves, bare z-index/font-weight/opacity/line-height/scale numbers), `!important` outside reduced-motion, `@media` widths that aren't the breakpoint tokens (640/768/1024/1280, or one less for `max-width`), and ungated `:hover`. Its header lists the allowed exceptions (0, %, `fr`, `deg`, viewport units, `ch`, `1em`, the 0.05em optical nudge, the visually-hidden 1px pattern, `@container` lengths, and named per-file one-offs). Media queries can't read custom properties, so write the raw width with a comment: `/* @breakpoint-md = 768px */`.

---

## No Overrides Rule

**Block components must never override a primitive's internal CSS classes.**

### What counts as an override

Any CSS in a composed component that targets a primitive's internal class:

```css
/* ❌ NEVER — reaching into Accordion internals from CookieConsent */
.ds-cookie-consent__preferences .ds-accordion__trigger { padding: var(--spacing-1) 0; }
.ds-cookie-consent__preferences .ds-accordion__item:first-child { border-top: none; }
```

### What to do instead

1. **Identify the gap** — what doesn't the primitive support?
2. **Update the primitive** — add a prop, variant, or smarter default
3. **Use the new API** with zero overrides

| Need | ❌ Override | ✅ Fix primitive |
|------|-----------|-----------------|
| Accordion without outer borders | `.parent .ds-accordion__item:first-child { border-top: none }` | Add `flush` prop |
| Checkbox centered (no label) | `.parent .ds-checkbox-field { align-items: center }` | Default to `center` when no label (`:has()`) |
| Accordion header leaks h3 styles | `.parent .ds-accordion__header { margin: 0 }` | Add `font-size: inherit` in primitive CSS |

### What IS allowed in block component CSS

- Layout rules for the block's own elements (flex, grid, gap on `.ds-cookie-consent__*`)
- Block-specific styles (typography on block's own class)
- Generic child selectors for layout (`.ds-cookie-consent__actions > *`)
- Responsive rules for the block's own elements

---

## Optical Text Centering — current state (open decision)

Fixed-height controls (buttons, badges, tags, inputs, select triggers, tabs) look slightly high because browsers centre the em box, not the visible letters.

**What the code does today:** about 24 component CSS files declare `text-box-trim: both; text-box-edge: cap alphabetic;` plus an `@supports not (text-box-trim: both) { … translateY(0.05em) … }` block. `both` is **not a valid value** (the valid form is `text-box: trim-both cap alphabetic`), so no browser applies the trim, the `@supports not` test is always true, and the only thing that runs everywhere is the 0.05em downward nudge. Measured: text is already within 0.4px of centre (0.9px on the small Input). Valid trim would also need a label span on flex roots (Button, Badge) and would shrink table rows.

**Status:** open — the owner decides badge height, then one pass switches every file to valid syntax and re-baselines visuals. Tracked in `12-audit-2026-09-25.md` → "Open after five rounds" item 1; full analysis in `07-lessons-learned.md#text-box-trim-invalid`.

**Until then:** don't treat the property as working. A new fixed-height component copies Button's existing block unchanged, so the fix pass can find every instance with `grep -rl text-box-trim packages/components/src`. Never apply any of it to flowing text (Accordion, Card body, Typography, Modal, Breadcrumb).

---

## List Divider Convention

**Inner-only dividers — the default for all list-style components.** No border above the first item, no border below the last. Dividers only between siblings.

Applies to: Accordion items, cart line items, and any vertical list with dividers.

```css
.ds-{component}__item { border-bottom: var(--border-width-sm) solid var(--color-border); }
.ds-{component}__item:last-child { border-bottom: none; }
```

No `border-top` on first item. Use CSS `:last-child`, not JavaScript.

The `bordered` accordion variant wraps in a panel with its own border + radius — inner dividers nest cleanly inside the container border.

---

## Optimal Reading Width (65ch)

All body/paragraph text: `max-width: var(--measure-reading)` (65ch). Typographic sweet spot (Bringhurst 45–75 range). `.ds-text` uses `min(100%, var(--measure-reading))` so a long word can't push a narrow column sideways.

**Applied to:** `.ds-text`, `.ds-feature-block__desc`, `.ds-cookie-consent__description`, `.ds-readable-width` utility.

**NOT applied to:** Headings (run wider), captions, labels, buttons, badges, single-line text.

**Uses `ch` units** — adapts automatically if font or size changes. Never `px`.

**If body text renders wider than 65ch anywhere, it's a bug.**

---

## Focus Management

```css
/* ✅ Replace the default outline with the token ring + a transparent outline */
.ds-button { outline: none; }
.ds-button:focus-visible {
  box-shadow: var(--focus-ring);
  /* paints nothing normally; Windows High Contrast drops box-shadow and shows this */
  outline: var(--border-width-lg) solid transparent;
  outline-offset: var(--border-width-lg);
}

/* ❌ Never — keyboard users lose focus visibility */
.ds-button:focus { outline: none; }
```

Use `:focus-visible` not `:focus`. Keyboard users see the ring, mouse users don't. Clipped or overlapped elements, Radix list highlights and sticky headers have their own rules — see `14-accessibility.md` → Focus.

### Focus ring tokens

```css
.ds-button:focus-visible { box-shadow: var(--focus-ring); }
.ds-button--primary:focus-visible { box-shadow: var(--shadow-sm), var(--focus-ring); }
.ds-accordion__trigger:focus-visible { box-shadow: var(--focus-ring-inset); }
.ds-input-field[aria-invalid="true"]:focus { box-shadow: var(--focus-ring-error); }
```

Never write the ring's shadow expression directly — always use the composite token.

Global fallback in `tokens.css`: `*:focus-visible { outline: 2px solid var(--color-focus-ring); outline-offset: 2px; }`

---

## Accessibility Requirements by Component Type

### Button
- `type="button"` by default (pass `type="submit"` explicitly for submit buttons)
- `disabled` → native `disabled`; `loading` → `aria-disabled` + `aria-busy`, stays focusable, activation swallowed
- `iconOnly` needs `aria-label` (dev warning otherwise)
- Spinner gets `aria-hidden="true"`

### Input
- Label associated via `htmlFor`/`id` (use `useId()`)
- Error: `aria-invalid={true}` + `aria-describedby={errorId}` + `role="alert"` on error element
- Hint: `aria-describedby={hintId}` (no `role="alert"` — not announced immediately)

### Typography
- `Heading` renders `h1`–`h4` via `as` (default `h2`). There is **no `level` prop** — an unknown prop becomes an HTML attribute and you silently get `<h2>`.
- **Semantic level ≠ visual size.** `as` controls the element, `size` (`xl` | `2xl` | `3xl` | `4xl`) the visual scale; `display` swaps to the display scale. `<Heading as="h1" size="2xl">` is correct for an h1 in a narrow column. There is no size below `xl` yet (open item in `12`).
- Heading supports `weight` (normal, medium, semibold, bold; default semibold) and `muted`.
- `Text`: `as` (`p` default, `span`, `div`, `label`, `strong`, `em`), `size` (`xs`–`xl`), `weight`, `muted`, `truncate`/`lineClamp`.

### Typography token mapping

| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| Heading h1 (4xl) | 54px | semibold | tight (1.15) | normal |
| Heading h2 (3xl) | 42px | semibold | tight | normal |
| Heading h3 (2xl) | 33px | semibold | tight | normal |
| Heading h4 (xl) | 26px | semibold | tight | normal |
| Text lg | 20px | normal | snug (1.382) | normal |
| Text base | 16px | normal | snug (1.382) | normal |
| Text sm | 14px | normal | normal (1.5) | normal |
| Caption | 12px | normal | normal (1.5) | normal |
| Code | 0.9em | normal | inherited | normal |

### Modal (Radix Dialog)
- Focus trapped inside. Returns to the opener on close (via `dialog-opener.ts`).
- `role="dialog"`, `aria-labelledby`, `aria-describedby`
- `Escape` closes

### Select (Radix Select)
- `aria-expanded`, `aria-haspopup="listbox"`; named by its label through `aria-labelledby` (or `aria-label` when there's no visible label)
- Arrow keys navigate, Enter/Space select, Escape closes; highlighted row uses `[data-highlighted]:not(:hover)`

### Universal
- All icons: `aria-hidden="true"` (decorative) or `aria-label`
- Disabled: `opacity: var(--opacity-medium)` on the control only (see Rule 9)
- Color is never the only state indicator — also use icons, text, or borders

---

## Testing Every Component

Minimum test coverage — no exceptions:

1. Renders without crashing
2. Correct HTML element rendered
3. `asChild` renders child element (if applicable)
4. Disabled state behavior
5. User interaction (click/keyboard)
6. `axe` no accessibility violations
7. Every bug fixed gets a regression test that fails without the fix
8. Dev warnings: assert with a `console.warn` spy, and call `resetDevWarnings()` between tests

```tsx
it('has no accessibility violations', async () => {
  const { container } = render(<Button>Click me</Button>)
  expect(await axe(container)).toHaveNoViolations()
})
```

---

## Storybook Story Conventions

- `tags: ['autodocs']` on every meta object
- One story per meaningful state, in the order you want to review them (the workbench reads source order)
- Use `render` for complex layouts (multiple components side by side)
- Inline styles in stories are layout only and use token references: `gap: 'var(--spacing-3)'`, `maxWidth: 'var(--size-content-sm)'` — not `'12px'`/`'640px'` (about 34 older wrappers still use px — open cleanup in `12`)
- Stories must type-check: `pnpm --filter @ds/workbench typecheck` compiles every `*.stories.tsx`

---

## Workbench Standards (replaces the docs-site gallery rules — 2026-09-25)

The Astro docs site is gone. `apps/workbench` renders every story directly, so **stories are the only specimens** — there are no gallery files or doc pages to keep in parity.

- **One story per meaningful state, in reading order.** The workbench lists states in file order: default first, then variants, sizes, states (disabled, loading, error), then edge cases.
- **Include the edge cases you'd want to eyeball** — long labels, empty, many items. The workbench's *Long text* and *RTL* modes stress every story automatically; don't write a story just to double a label.
- **Stories that open overlays on mount** (a banner, a toast) are shown one at a time — add the component id to `SOLO` in `apps/workbench/src/lib/catalog.ts`.
- **Give the meta a one-line description** (`parameters.docs.description.component`); the workbench shows it under the title.
- **Non-story sheets** (foundations, line-ups, store pages) live in `apps/workbench/src/specimens/`, use `<Heading>`/`<Text>`, and never restyle components.

### Review checklist (in the workbench)

Phone first, then Desktop. Light, then Dark (or *Both*). Toggle *Long text* and *RTL*. Tab through with the keyboard. Run *Check accessibility*. Mark *Looks good* or *Needs work* with a note.

### Foundation sheets

The workbench's Foundations group (Colors with live contrast in the frame's theme, Type scale, Space/radius/shadow, Motion) and Consistency line-ups (control sizes, status colors, form states) show tokens visually. When a token category is added, add it to the matching sheet in `apps/workbench/src/specimens/`.

---

## Component List

The current list, grouped the way the workbench shows it, is in `01-planning.md` → "Components". Each component's props are documented in JSDoc in its `.tsx`, and its stories show every state. (The older tiered catalog here listed 30 of today's 59 folders with stale details and was removed on 2026-09-26.)

---

## Responsive Component Patterns

### CSS-based collapse (Breadcrumb)
All items in DOM, CSS hides/shows at breakpoints. Better than JS: no layout shift, works without JS, animatable.

### Scroll-snap carousel
Native CSS `scroll-snap-type: x mandatory`. 60fps, native touch physics, zero JS bundle cost. Slide widths via `flex-basis` at breakpoints.

### Primary-first button stacking (CookieConsent)
Mobile: buttons stack vertically, primary promoted via `order: -1`. DOM order stays secondary→primary (correct for desktop left-to-right). Generalizes to any action bar.

### CSS order swap (FeatureBlock)
Alternating layouts via `order` property. DOM stays image→text (correct reading order), only visual order changes.

---

## Cookie Consent — Copy & Structure

**Tone:** Conversational, no legalese.

**Main dialog:** "We use cookies" heading. Three buttons: Manage Preferences (secondary) · Decline All (secondary) · Accept All (primary).

**Category defaults:** Strictly Necessary (always on, disabled toggle) · Functional (on) · Performance (on) · Targeting (off).

Each category has `learnMoreHref` for per-category privacy policy links.

**Mobile:** Primary button promoted to top via `order: -1`. Desktop keeps left-secondary / right-primary.

---

## Store Page Conventions (workbench)

The eight store pages in `apps/workbench/src/specimens/pages/` follow these rules:

- **BEM classes:** today `.ds-homepage__hero`, `.ds-collection__grid` (renaming demo classes to a `wb-` prefix, so they can't be mistaken for library classes, is an open item in `12`)
- **Layout grid system:** `.ds-page-container`, `.ds-layout`, `.ds-section` — see `09-layout-grid.md`
- **Section spacing:** `--spacing-16` (64px) between major sections via `.ds-section`
- **Component internals:** Standard 4px grid (`--spacing-1` through `--spacing-8`)
- **Typography:** Always `<Heading>` and `<Text>`, never raw tags
- **Icons:** the internal registry `packages/components/src/icon/icons.tsx` (Lucide-equivalent paths) — no icon library
- **Link-buttons:** `<Button asChild><a href="...">Label</a></Button>`, not `onClick` navigation
- **Prices in cents:** 4800 = $48.00. Pass cents to components (they format internally). The demo data's `formatPrice()` (en-US only) is for page copy, not components.
- **Placeholders:** SVG data URIs via `makePlaceholder()` / `makeLifestylePlaceholder()` — earthy tones matching palette
- **Responsive breakpoints:** 640px (sm), 768px (md), 1024px (lg), 1280px (xl)

### Page-level CSS rules

- **Pages handle composition only** — grid placement, section ordering, content arrangement
- **Pages never override component styles** — no page CSS targeting `.ds-button`, `.ds-accordion__trigger`, etc.
- **All values from tokens** — no hardcoded px or hex in page CSS

### Shared data layer

`apps/workbench/src/specimens/data/products.ts` (and `placeholder.ts` for `makePlaceholder()`):
- `Product` interface with `id`, `name`, `price` (cents), `compareAtPrice`, `image`, `category`, `badge`, `description`
- `PRODUCTS` — mock products with earthy SVG placeholders
- `formatPrice(cents, currency)` — demo-only `Intl.NumberFormat` formatter

---

## Site-Level Layout Components

Store pages in the workbench are wrapped by `PageChrome` (`apps/workbench/src/specimens/pages/PageChrome.tsx`): the real `Header` (sticky) + `main.ds-page-container` + `Footer`. Links inside use in-frame routes (`#/page/examples/cart`) so clicking through the store switches every frame.

### Header
Logo + nav (desktop) / Drawer menu (mobile) + theme toggle (`showThemeToggle`) + cart link carrying `data-motion-cart-target`. `sticky` publishes `--sticky-header-height` and `scroll-padding-top` so focus never hides under it. Ships the skip link.

### Footer
Brand block + link columns + bottom bar (copyright, legal links). One column on phones, `2fr` + three columns from 768px, the 12-column grid from 1024px (5–6 columns put the brand on its own row). Headings and text use `<Heading>`/`<Text>`.

Dark mode: logo `filter: invert(1)`, all colors via CSS custom properties.
