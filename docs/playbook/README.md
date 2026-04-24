# Design System Playbook

> The instruction manual for building this design system — and the next one.

This playbook captures every decision, dead end, config file, and "oh that's how that works" moment from this build. The goal: the next design system should take a fraction of the time because this playbook exists.

---

## Rules — Read Before Every Session

These are the non-negotiable constraints that govern all work on this project. If you read nothing else, read this.

1. **Every visual value comes from a token.** No raw hex, px, rem, or hardcoded values anywhere. If a token doesn't exist, flag it — don't invent a value.
2. **Components are the single source of truth.** Pages consume components. If something looks wrong on a page, fix the component — never override at the page level.
3. **The layout grid is the law.** 1200px container, 12 columns, `--spacing-6` gutters, `--spacing-16` section rhythm. No exceptions, no full-bleed.
4. **Golden ratio (φ) governs all proportions.** Type scales, spacing, radius, shadows, opacity, timing — all derived from φ and Fibonacci. See `03-tokens.md`.
5. **No overrides.** No `!important`, no inline styles, no CSS that undoes what the system sets. No `display: none` on child component classes.
6. **Every component ships with 4 files.** Implementation, CSS, tests (including axe a11y), and Storybook stories. Built in the same session. No "I'll add tests later."
7. **Accessibility is non-negotiable.** Every component passes axe. Keyboard navigation works. Contrast meets WCAG AA. `prefers-reduced-motion` respected.
8. **Document as you go.** Decisions → `06-decisions-log.md`. Gotchas → `07-lessons-learned.md`. New components → update `01-planning.md` status table. This is not optional.

---

## Who This Is For

- Engineers onboarding to this repo who need context fast
- AI agents (Claude Code) working on this project — these docs are your memory across sessions
- Anyone building a new React design system and wanting a proven starting structure
- Future-you, six months from now, who forgot why we made a particular decision

**Assumed knowledge:** Comfortable with React and TypeScript. Some familiarity with monorepos is helpful but not required.

---

## How to Use This

**AI agent (Claude Code):** Read `CLAUDE.md` first, then the relevant playbook file for your task before writing any code. If building a component → read `04-components.md` + `05-workflows.md`. If working on tokens → read `03-tokens.md`. If composing a page → read `09-layout-grid.md` + `08-page-templates.md`. Always.

**First time building a design system:** Read sequentially, 01 through 09. The files are ordered to match the actual build sequence.

**Looking for something specific:** Jump to the relevant file. The decisions log (`06`) and lessons learned (`07`) are especially useful if you're debugging a problem you've seen before.

---

## Tech Stack

| Concern | Tool | Version | Why This One |
|---------|------|---------|--------------|
| Language | TypeScript (strict) | `^5.4.5` | `noUncheckedIndexedAccess` catches runtime errors at compile time |
| UI library | React | `>=18.0.0` | Deepest ecosystem for design systems, Radix is React-only |
| Package manager | pnpm workspaces | `9.0.0` | Strict dep isolation prevents phantom dependencies |
| Build orchestration | Turborepo | `^2.0.0` | `^build` dependency graph, content-based caching |
| Package bundler | tsup | `^8.0.2` | Dual ESM+CJS, CSS bundling, esbuild speed |
| Primitives | Radix UI | various `^1.x` | Battle-tested a11y, completely unstyled |
| Dev environment | Storybook | `8.x` | Chromatic integration, addon-a11y |
| Public docs | Astro | `^4.x` | Island architecture, MDX, static output |
| Unit testing | Vitest + Testing Library | `^1.6.0` | Vite-native, same API as Jest |
| Visual regression | Chromatic | via GitHub Actions | Purpose-built for Storybook |
| Versioning | Changesets | `^2.27.1` | Per-package versioning, PR-based workflow |
| Linting | ESLint (flat config) + Prettier | `9.x` / `^3.2.5` | jsx-a11y plugin catches a11y at lint time |
| Font | Ancizar Serif | Google Fonts | Scholarly authority, 9 weights, SIL OFL |

---

## Table of Contents

| File | What It Covers | Read When |
|------|----------------|-----------|
| [01-planning.md](./01-planning.md) | Goals, scope, component status, design mandate | Starting the project or adding components |
| [02-tooling-setup.md](./02-tooling-setup.md) | Every tool, config snippets, gotchas | Setting up, debugging build issues |
| [03-tokens.md](./03-tokens.md) | Golden ratio math, 3-tier tokens, dark mode, build pipeline | Working with any visual values |
| [04-components.md](./04-components.md) | 4-file rule, TypeScript patterns, CSS naming, a11y, docs standards | Building or modifying any component |
| [05-workflows.md](./05-workflows.md) | New component checklist, dev environment, CI/CD, releases | Step-by-step build process |
| [06-decisions-log.md](./06-decisions-log.md) | Every significant decision with rationale | Understanding why something is the way it is |
| [07-lessons-learned.md](./07-lessons-learned.md) | Gotchas, bugs, antipatterns, rules | Before doing anything you haven't done before |
| [08-page-templates.md](./08-page-templates.md) | PLP, Search, Account, Terms, Sale specs | Composing pages or preparing for Shopify |
| [09-layout-grid.md](./09-layout-grid.md) | 12-column grid, container, splits, responsive | Any page layout work |
| [10-shopify-theme.md](./10-shopify-theme.md) | Theme architecture, strip strategy, dev workflow, Shopify gotchas | Any work inside `apps/theme/` |

---

## Maintenance Rules

Claude is responsible for keeping this playbook current. These are automatic — do not wait to be asked:

| Trigger | Action |
|---------|--------|
| New decision made | Add entry to `06-decisions-log.md` |
| Bug or gotcha discovered | Add to `07-lessons-learned.md` |
| New component built | Update status table in `01-planning.md` |
| New tool added or removed | Update `02-tooling-setup.md` |
| Convention established | Add to relevant file (`03`, `04`, `09`, etc.) |
| Previous decision changed | Update old entry status to "Superseded" and add new entry |
| `[PENDING DECISION]` resolved | Update tag with actual decision and rationale |
| New playbook file needed | Create it and add to this README's table of contents |

---

## Project Locations

```
Monorepo root:     /Users/alvinthong/claude-design-system
Token source:      packages/tokens/src/tokens.json
Token CSS output:  packages/tokens/dist/tokens.css
Component source:  packages/components/src/{name}/{Name}.tsx
Component CSS:     packages/components/src/{name}/{Name}.css
Layout grid CSS:   packages/components/src/layout-grid/layout-grid.css
Demo utilities:    apps/docs/src/styles/demo-utilities.css
Docs pages:        apps/docs/src/pages/
Mock data:         apps/docs/src/data/products.ts
Storybook config:  apps/storybook/.storybook/main.ts
```

```
Docs site:    http://localhost:4321
Storybook:    http://localhost:6006
```

---

## Common Pitfalls — Quick Reference

These are the mistakes that have cost the most time. Check `07-lessons-learned.md` for full details.

| Pitfall | What happens | Prevention |
|---------|-------------|------------|
| Raw values in CSS | Inconsistency, dark mode breaks | Always use `var(--token)` |
| Page-level component overrides | Same component looks different across pages | Fix the component, not the page |
| `color-mix(%, transparent)` for contrast | Mathematically impossible to meet WCAG | Use solid primitive references |
| `display: none` on child class | Fragile, couples to internal structure | Add a prop or slot to the component |
| Forgot to rebuild tokens after change | CSS variables silently resolve to `initial` | Always `grep -r "old-name"` after renames |
| Storybook stories glob path | Empty Storybook, no error | Path relative to `.storybook/`, not package root |
| `types` not first in package.json exports | TypeScript can't find declarations | Always put `types` before `import` |
| Inline styles in demo files | Docs site drifts from system discipline | Use `demo-utilities.css` shared classes |
| Fixed-width components in fluid grids | Phantom gaps, uneven whitespace | Provide a `fluid` variant |
| Escalating gap tokens per breakpoint | Visual noise at viewport transitions | Two tiers max (mobile + desktop) |
