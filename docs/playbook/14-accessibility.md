# 14 — Accessibility

> Every accessibility rule in force today, in one place. The "why" behind each is in `07-lessons-learned.md` (linked by anchor) and the decisions log. Contrast numbers are in `03-tokens.md`.

Accessibility is a ship gate: a component that fails any rule below is not done.

---

## Colour and contrast

- **Readable text** (below large size) uses `--color-foreground` or `--color-foreground-secondary` — secondary is the floor (≥4.5:1).
- **`--color-foreground-subtle`** is for large text (≥24px, or ≥18.7px bold) and icons/chevrons only (≥3:1).
- **`--color-foreground-muted`** is for disabled and decorative things only — never readable text, never a glyph that carries state.
- **A control's boundary** (input, select, checkbox, radio, switch track) uses `--color-border-control` (≥3:1). `--color-border` and `--color-border-subtle` are decoration only. The same applies to anything that *is* a control or shows a control's state (WCAG 1.4.11): colour-swatch edges, interactive empty stars, the selected segment (dark mode needs an edge — its raised fill alone is 1.28:1).
- **Never `color-mix(… %, transparent)` for anything that needs contrast.** Use solid tokens (`07` → `#color-mix-contrast`).
- **Colour is never the only signal** — add text, an icon, a border or a shape.
- **Forced colors (Windows High Contrast)** removes backgrounds and box-shadows. A state shown only by a fill (selected segment, swatch ring, switch thumb, progress fill) also needs a transparent `outline`/border, or system colours in `@media (forced-colors: active)` (`#forced-colors`).

## Focus

- Style `:focus-visible`, never `:focus`. Remove the default outline only if you replace it.
- The ring is `box-shadow: var(--focus-ring)` **plus** `outline: var(--border-width-lg) solid transparent` — the transparent outline is what forced-colors mode paints. Errors use `--focus-ring-error`.
- Inside a clipping container, or where the next element paints over the ring (slides, card images): `--focus-ring-inset`, or an outline with a negative `outline-offset` (`#inset-outline`, `#focus-ring-inset-overflow`). A scroll container's own ring is drawn by an overlay sibling (`#scroll-outline`).
- **Keyboard highlight in Radix lists** (Select, DropdownMenu, PredictiveSearch rows): `[data-highlighted]:not(:hover)` with an inset outline. `:focus-visible` can't be used — Radix focuses items on hover (`#radix-highlight`).
- **Sticky header:** Header publishes `--sticky-header-height` and sets `scroll-padding-top`; any other sticky element offsets by it, so focus is never hidden under the bar (WCAG 2.4.11, `#sticky-focus`).
- `tokens.css` ships a global `*:focus-visible` outline as a safety net for elements no component styles.

## Pointer and touch

- **Hover only where a pointer hovers:** every `:hover` rule sits inside `@media (hover: hover)`. Touch screens keep `:hover` after a tap. Exempt: keyboard-highlight rules written as `:not(:hover)`. `check-css` enforces this.
- **Hit areas:** at least 24×24px for every pointer (WCAG 2.5.8), 44px (`--size-hit-area`) on touch. Grow the hit zone invisibly with a pseudo-element, outward, never over a neighbouring control; the visible φ control heights (34/42/55) don't change. Pick the pattern by neighbourhood (`#hit-area-selection`).
- **iOS zoom:** form controls pin `font-size` to `--font-size-tight-base` (16px) under `@media (pointer: coarse)` (`#ios-zoom-fluid-base`).

## Disabled

- `opacity: var(--opacity-medium)` on the control and its inline label (checkbox, switch, radio option). Never on the field/group label above it, never on the hint or error — the hint often explains how to enable it.
- One fade only: never opacity plus a muted colour.
- **Native `disabled`** for controls that start disabled. **`aria-disabled="true"`** (and ignore the click) for controls that can disable themselves while focused — pagination Next on the last page, quantity − at 1, a loading button. Native `disabled` would drop focus to `<body>` (`#aria-disabled-focus`).
- A focused `aria-disabled` control un-fades, or its focus ring fades too (`#opacity-ring`).

## Names, labels, headings

- Inputs: visible `<label>` linked with `htmlFor` + `useId()`. Radix controls that render a `<button>` (Select) use `aria-labelledby` (`#radix-select-aria`).
- Hints and errors are linked with `aria-describedby` — only to ids that are actually rendered. Errors carry `role="alert"`.
- Required asterisk: `content: ' *' / ''` so it isn't read as "star".
- Icon-only buttons need `aria-label` (Button warns in development).
- `aria-label` on an element with no role is ignored — use visually hidden text instead (`#aria-label-no-role`).
- Everything inside a heading becomes the heading's name — keep controls beside headings, not inside (`#heading-name`).
- One `<h1>` per page, no skipped levels. `<Heading as="h1">` — there is no `level` prop (`#heading-level-prop`).

## Announcements (live regions)

- A live region must exist **before** its message: render it empty, fill it on change. Use `internal/use-change-announcement.ts` — it returns `''` on first render and the new text only when it changes (`#live-region-first`).
- Don't make static status text a live region: Badge is not live by default (opt in with `role="status"`).
- Toasts announce through persistent polite/assertive regions owned by `ToastProvider`.
- Never copy a live region into a Radix modal — the page's regions stay exposed and it would announce twice.
- Sale prices read as "Sale price … Original price …" via visually hidden text.

## Overlays and composite widgets

- Modal/Drawer: focus trapped, Escape closes, focus returns to the opener. Get the opener from `internal/dialog-opener.ts` — Safari doesn't focus a clicked button, so `document.activeElement` is `<body>` (`#safari-click-focus`). Every new overlay uses it.
- Escape inside a nested widget (search inside a modal) closes only the inner one.
- Popover is named after its trigger by default and does not trap Tab (non-modal).
- Combobox (PredictiveSearch): DOM focus stays on the input; the active option is `aria-activedescendant` (`#combobox-focus-pattern`).
- Radix portals: pass a BEM modifier down instead of styling from an ancestor; set `aria-controls` only while the content is mounted (`#radix-portal-gotchas`).

## Motion

Respect OS reduced motion and `<html data-motion="off">`; never start above-the-fold content at opacity 0. Full rules: `13-motion.md`.

## Right-to-left and language

Use logical properties (`inset-inline-*`, `margin-inline-*`, `padding-inline-*`) and check the workbench **RTL** mode. Still open (see `12`): Radix `DirectionProvider`, Drawer `start`/`end` sides, mirrored arrow icons, and hardcoded English strings/plurals.

---

## How it's checked

| Layer | What | Catches |
|-------|------|---------|
| Lint | `eslint-plugin-jsx-a11y`; `check-css` (ungated hover) | Missing alt/roles/labels in JSX; sticky hover |
| Unit tests | `jest-axe` in every `*.test.tsx` (region rule off) | Names, roles, ARIA misuse in each state |
| Dev warnings | `internal/dev-warning.ts` | Misuse at runtime: unnamed icon button, unnamed popover, controlled value with no `onChange` |
| Workbench | **Check accessibility** (axe in the frame, light and dark), keyboard walk, Long text, RTL, Motion off | Contrast in real themes, layout-dependent issues |
| Manual | Screen reader and WCAG 2.2 criteria axe can't test (target size, focus not obscured, what is announced) | Everything above misses |

Latest measured results: `12-audit-2026-09-25.md` (round 4: axe 0 violations, light + dark, 375 + 1280, three engines).
