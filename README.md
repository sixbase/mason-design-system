# Mason Design System

A token-driven, accessible React component library built for premium ecommerce. Golden ratio proportions, warm editorial aesthetic, dark mode, and tests with accessibility checks on every component.

🔗 **Workbench:** https://sixbase.github.io/mason-design-system/ — every component at phone, tablet and desktop, light and dark

## Quick Start

Needs Node 18+ (CI uses 20) and pnpm 9.

```bash
pnpm install     # install dependencies
pnpm dev         # workbench → http://localhost:4321, Storybook → http://localhost:6006
```

## Packages

| Package | Description |
|---------|-------------|
| `@ds/tokens` | `tokens.json` source of truth → CSS variables (`@ds/tokens/css`) and a JS `motion` export |
| `@ds/primitives` | Radix UI wrappers, shared TypeScript types |
| `@ds/components` | Styled, accessible components — 58 plus the LayoutGrid utility |
| `@ds/motion` | Lazy-loaded GSAP choreography (scroll reveals, FLIP, fly-to-cart) + CSS hero/page transitions (`@ds/motion/css`) |

Apps: `apps/workbench` (the visual test bench) and `apps/storybook`. `packages/dskit` is a separate URL-audit command-line tool, not part of the design system.

## Use it in an app

```ts
import '@ds/tokens/css';                        // tokens + page globals — once, first
import '@ds/components/styles';                 // all component CSS…
// import '@ds/components/styles/button.css';   // …or one file per component you use
import { Button } from '@ds/components';
```

Prices are integer hundredths of the currency unit (4800 = $48.00).

## Checks

```bash
pnpm lint         # ESLint (incl. jsx-a11y) + check-css (tokens only, gated hover, no stray !important)
pnpm typecheck    # every package, Storybook, the workbench, and every story
pnpm test         # Vitest + axe accessibility scans, all packages
pnpm --filter @ds/components test:watch   # watch mode while working on components
```

CI runs build → lint → typecheck → test on every pull request and push to `main`. If axe fails, the test fails.

## Build

```bash
pnpm build                            # all packages (Turborepo handles the order)
pnpm --filter @ds/tokens build        # tokens only — rerun after editing tokens.json
pnpm --filter @ds/components build    # components only
```

Build order: tokens → primitives → components. The workbench and Storybook read component source, so you only need to rebuild tokens to see a change there.

## Documentation

- **Playbook:** [`docs/playbook/`](./docs/playbook/README.md) — start with its README: the rules, reading order, every decision and lesson, and the list of open decisions
- **CLAUDE.md:** [`CLAUDE.md`](./CLAUDE.md) — operating instructions for AI agent sessions
- **Workbench:** `http://localhost:4321` (run `pnpm dev`) — every story at real device widths, light/dark, long text, right-to-left, motion off, an accessibility check, and review notes
- **Storybook:** `http://localhost:6006` (run `pnpm dev`) — component development with controls and an accessibility panel

## Tech Stack

TypeScript (strict) · React · pnpm workspaces · Turborepo · tsup · Radix UI · GSAP · Vite · Storybook 8 · Vitest + jest-axe · Changesets · IBM Plex Sans

## License

Private
