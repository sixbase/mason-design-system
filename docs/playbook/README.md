# Design System Playbook

> The instruction manual for building this design system — and the next one.

This playbook records every rule, decision, dead end and "oh, that's how that works" moment from this build, so the next design system takes a fraction of the time.

**How it is organised:** chapters 01–05, 09, 13 and 14 are *how-to* — they state today's rules. `06-decisions-log.md` and `07-lessons-learned.md` are *history* (append-only; read them for the "why"). `12-audit-2026-09-25.md` holds the measured audit results and the **one list of open decisions**.

---

## Start here

1. Read the rules below.
2. Run the project (see "Run it").
3. Then read by task:

| You are… | Read |
|----------|------|
| New to the project | 01 → 02 → 03 → 04 → 05, in order (it follows the build sequence) |
| Building or changing a component | 04, 05 (checklist), 14, and 13 if it moves |
| Changing tokens | 03 |
| Composing a page | 09, 08 |
| Working on the Shopify storefront | 10 (the theme is a separate repo) |
| Picking up open work | 12 → "Open after five rounds" |
| Debugging something odd | 07 (search it) |

---

## The rules

1. **Every visual value comes from a token.** No raw hex, px, rem, ms or `cubic-bezier()`. If a token is missing, flag the gap — don't invent a value. `check-css` fails the lint on raw values (its header lists the few allowed exceptions).
2. **Components are the single source of truth.** Pages and specimens compose; they never restyle. If something looks wrong on a page, fix the component.
3. **The layout grid is the law.** `.ds-page-container` (1200px, `--size-container`), 12 columns, `--spacing-6` gutters, `--spacing-16` section rhythm, no full-bleed. (The storefront deliberately runs a 1300px frame — see `09`.)
4. **Golden ratio (φ) governs proportions** — type, spacing, radius, shadows, opacity, timing. See `03`.
5. **No overrides.** No `!important` (the one exception: the global reduced-motion reset in `tokens.css`), no inline visual styles, no CSS that undoes the system, no `display: none` on a child component's class.
6. **Every component ships with its files in one session:** `.tsx`, `.css`, `.test.tsx` (with axe), `.stories.tsx`, `index.ts`.
7. **Accessibility is a ship gate** — axe passes, keyboard works, contrast meets WCAG AA, hover is gated to real pointers, hit areas ≥24px (44px on touch), live regions speak on change only, reduced motion is honoured. Full list: `14`.
8. **Review in the workbench** at Phone and Desktop, Light and Dark, with Long text and RTL, before calling anything done.
9. **Document as you go.** Rules → the how-to chapter. Decisions → `06`. Gotchas → `07`. Open items → `12`.

---

## Run it

```bash
pnpm install
pnpm dev          # workbench http://localhost:4321 + Storybook http://localhost:6006 (+ package watchers)
pnpm lint         # ESLint + check-css (component CSS guard)
pnpm typecheck    # every package, Storybook, the workbench, and every story
pnpm test         # Vitest + axe, all packages
pnpm build        # all packages, in dependency order (Turborepo)
```

CI (`.github/workflows/ci.yml`) runs build → lint → typecheck → test on every PR and push to `main`. `deploy-docs.yml` deploys the workbench to GitHub Pages on push to `main`.

---

## What's where

```
packages/tokens/src/tokens.json          token source of truth
packages/tokens/scripts/build-css.mjs    → dist/tokens.css (+ src/motion.json)
packages/components/src/{name}/          one folder per component (59: 58 components + LayoutGrid)
packages/components/src/internal/        shared helpers: dev-warning, dialog-opener, format-money, safe-url, use-change-announcement
packages/components/scripts/check-css.mjs  CSS lint guard
packages/motion/                         @ds/motion — lazy GSAP choreography + motion.css
packages/primitives/                     Radix wrappers, shared types
packages/dskit/                          separate URL-audit CLI (Bun); not part of the design system
apps/workbench/                          visual test bench (renders every story)
apps/workbench/src/lib/catalog.ts        sidebar groups, SOLO list
apps/workbench/src/specimens/            foundations, line-ups, store pages, mock data
apps/storybook/.storybook/               Storybook config
tooling/                                 shared TypeScript and ESLint configs
```

Repo: `/Users/alvinthong/Code/mason-design-system`. Storefront: `/Users/alvinthong/Code/mason-storefront` (`sixbase/mason-storefront`).

---

## Tech stack

| Concern | Tool | Version | Why |
|---------|------|---------|-----|
| Language | TypeScript (strict) | `^5.4.5` | `noUncheckedIndexedAccess` catches runtime errors at compile time |
| UI library | React | peer `>=18` (18 tested) | Deepest ecosystem; Radix is React-only |
| Package manager | pnpm workspaces | `9.0.0` | Strict isolation, no phantom dependencies |
| Build orchestration | Turborepo | `^2.0.0` | `^build` dependency graph, content caching |
| Bundler | tsup | `^8.0.2` | ESM + CJS, per-component entries and CSS |
| Primitives | Radix UI | `^1.x` / `^2.x` | Accessible, unstyled; bump all `@radix-ui/*` together |
| Visual test bench | Vite + React (`apps/workbench`) | `^5.x` | Stories at real device widths, light/dark, review notes |
| Component dev | Storybook | `8.x` | Controls, addon-a11y |
| Unit tests | Vitest + Testing Library + jest-axe | `^1.6.0` | Vite-native, Jest API |
| Lint | ESLint 9 flat config + jsx-a11y; `check-css` | `9.x` | A11y and token rules at lint time |
| Format | Prettier | `^3.2.5` | |
| Versioning | Changesets | `^2.27.1` | Configured; no release workflow yet |
| Motion | GSAP via `@ds/motion` | `^3.15.0` | Lazy-loaded, never on the critical path |
| Font | IBM Plex Sans (+ JetBrains Mono for numerals) | Google Fonts | Neutral, technical warmth, SIL OFL |

Visual regression (Chromatic) is **not** wired: the addon is installed but there is no workflow. See `02`.

---

## Table of contents

| File | What it covers | Kind |
|------|----------------|------|
| [01-planning.md](./01-planning.md) | Goals, design mandate, component list, scope | How-to |
| [02-tooling-setup.md](./02-tooling-setup.md) | Every tool, config, guard, gotcha | How-to |
| [03-tokens.md](./03-tokens.md) | φ math, 3-tier tokens, dark/print/contrast modes, build pipeline | How-to |
| [04-components.md](./04-components.md) | Component rules, TypeScript/CSS patterns, internal helpers, stories | How-to |
| [05-workflows.md](./05-workflows.md) | New-component checklist, tokens, checks, CI, releases | How-to |
| [06-decisions-log.md](./06-decisions-log.md) | Every significant decision with rationale | History |
| [07-lessons-learned.md](./07-lessons-learned.md) | Gotchas and bugs, each with a rule | History |
| [08-page-templates.md](./08-page-templates.md) | Store page specs (PLP, Search, Account, Terms, Sale) | Spec |
| [09-layout-grid.md](./09-layout-grid.md) | Container, 12-column grid, splits, responsive collapse | How-to |
| [10-shopify-theme.md](./10-shopify-theme.md) | How the Liquid storefront consumes the system | Spec (separate repo) |
| [11-theme-port-plan.md](./11-theme-port-plan.md) | Parallel port plan for the storefront | Operational, historical |
| [12-audit-2026-09-25.md](./12-audit-2026-09-25.md) | Five audit rounds: measurements, fixes, **open decisions** | Record + open list |
| [13-motion.md](./13-motion.md) | CSS vs `@ds/motion`, motion rules, off switches | How-to |
| [14-accessibility.md](./14-accessibility.md) | Every accessibility rule in one place | How-to |
| [15-storefront-port-plan.md](./15-storefront-port-plan.md) | What the Shopify theme still lacks, prioritised P1–P3 with files and sizes | Operational (live) |

---

## Maintenance rules

Claude keeps this playbook current without being asked:

| Trigger | Action |
|---------|--------|
| New rule or convention | Put it in the how-to chapter it belongs to (03, 04, 05, 09, 13, 14) |
| Decision made | Add an entry at the bottom of `06`; if it reverses an older one, set the old entry's **Status** to "Changed — see …" |
| Bug or gotcha found | Add to `07` with a `Rule:` line |
| Something left open | Add it to `12` → "Open after five rounds" (one list, no duplicates elsewhere — other chapters link to it) |
| Component added or removed | Update the list in `01` and the workbench catalog |
| Tool added or removed | Update `02` and the tech stack above |
| New chapter | Add it to the table of contents |

---

## Common pitfalls

| Pitfall | What happens | Prevention |
|---------|-------------|------------|
| Raw values in CSS | Breaks dark mode, drifts | `var(--token)`; `pnpm lint` runs `check-css` |
| Renamed a token | `var(--old)` silently drops the declaration | `grep -r "old-name" .` — `check-css` only covers component CSS |
| Page-level component overrides | Same component looks different on each page | Fix or add a variant in the component |
| `color-mix(… %, transparent)` for contrast | Can't reach WCAG | Solid tokens |
| Ungated `:hover` | Sticky hover after a tap on phones | `@media (hover: hover)` |
| Native `disabled` on a button that disables itself | Focus drops to `<body>` | `aria-disabled` |
| Live region rendered with its text | Screen readers skip it or repeat it | `useChangeAnnouncement` |
| `types` not first in an exports condition | TypeScript can't find declarations | `types` first in each condition |
| Storybook stories glob | Empty Storybook, no error | Path is relative to `.storybook/` |
| Restyling components in workbench sheets | The bench stops showing what ships | Sheets compose only |
