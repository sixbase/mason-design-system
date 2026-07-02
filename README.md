# Mason Design System

A token-driven, accessible React component library built for premium ecommerce. Golden ratio proportions, warm editorial aesthetic, dark mode, and full test coverage from day one.

🔗 **Live docs:** https://sixbase.github.io/mason-design-system/

## Quick Start

```bash
# Install dependencies
pnpm install

# Start both dev servers
pnpm dev

# Docs site → http://localhost:4321
# Storybook → http://localhost:6006
```

## Packages

| Package | Description |
|---------|-------------|
| `@ds/tokens` | CSS variables, TypeScript exports, JSON source of truth |
| `@ds/primitives` | Radix UI wrappers, shared TypeScript types |
| `@ds/components` | Styled, accessible components (18 shipped) |

## Build

```bash
pnpm build                            # Build all (Turborepo handles order)
pnpm --filter @ds/tokens build        # Tokens only
pnpm --filter @ds/components build    # Components only
```

Build order: tokens → primitives → components. Turborepo handles this automatically.

## Test

```bash
pnpm test                             # All tests (unit + a11y)
pnpm --filter @ds/components test:watch  # Watch mode
```

Every component includes axe accessibility scans. If axe fails, the test fails.

## Documentation

- **Playbook:** [`docs/playbook/`](./docs/playbook/README.md) — every decision, convention, and lesson from this build
- **CLAUDE.md:** [`CLAUDE.md`](./CLAUDE.md) — operating instructions for AI agent sessions
- **Docs site:** `http://localhost:4321` (run `pnpm dev`)
- **Storybook:** `http://localhost:6006` (run `pnpm dev`)

## Tech Stack

TypeScript (strict) · React · pnpm workspaces · Turborepo · tsup · Radix UI · Storybook 8 · Astro 4 · Vitest · Chromatic · Changesets · IBM Plex Sans

## License

Private
