# 11 — Theme Port Execution Plan

> How to parallelize the Shopify theme port across multiple Claude Code agents without merge conflicts. Intended to be a throwaway operational plan — delete or mark complete when all streams land.

---

## Principle

**Parallelize vertical slices, serialize shared foundations.** Agents work on distinct sections + their dedicated CSS + their dedicated snippets. Shared infrastructure (base.css, layout.css, theme.liquid, reusable snippets, primitive component CSS) is built first, sequentially, by a single agent or you+Claude.

If parallelization starts before foundations are done, every agent reinvents the price formatter and the button CSS. Merge conflicts explode.

---

## Phase 0 — Foundations (sequential, blocks everything)

**Owner:** You + main Claude session. Not delegated.

**Why sequential:** Every stream depends on these outputs. If two streams both invent `snippets/price.liquid`, we get conflicts at merge time and inconsistent price formatting at runtime.

### Deliverables

1. **Shared snippets** — small reusable Liquid partials with stable APIs:
   - `snippets/icon.liquid` — accepts `name`, `size`, renders inline SVG from sprite
   - `snippets/price.liquid` — accepts `price` (cents), `compare_at_price` (optional), renders `.ds-price-display` HTML matching `PriceDisplay` component
   - `snippets/responsive-image.liquid` — accepts `image`, `sizes`, `alt`, outputs `srcset` + `loading` per SEO spec
   - `snippets/breadcrumb.liquid` — accepts current template context, renders `.ds-breadcrumb` + JSON-LD `BreadcrumbList`

2. **Primitive component CSS ported into theme assets:**
   - `assets/typography.css` ← from `packages/components/src/typography/Typography.css`
   - `assets/button.css` ← from `packages/components/src/button/Button.css`
   - `assets/input.css` ← from `packages/components/src/input/Input.css`
   - `assets/badge.css` ← from `packages/components/src/badge/Badge.css`
   - `assets/select.css` ← from `packages/components/src/select/Select.css`
   - `assets/icon.css` ← from `packages/components/src/icon/Icon.css`
   - Import all of these in `layout/theme.liquid`

3. **Section API conventions doc** — add to `10-shopify-theme.md`:
   - Every section's settings schema follows `{heading, body, image, cta_label, cta_url}` pattern where applicable
   - Section files named `main-{template}.liquid` for template-bound sections (product, collection, cart), plain name for global sections (header, footer)
   - CSS file per section named `{section-name}.css` imported from `layout/theme.liquid`

4. **`.theme-check.yml` tuning** — set severity rules that match our design system disciplines (no inline styles except tokens, no raw pixel values, etc.). Agents will fail theme-check if they violate them — catches drift early.

**Done when:** A new empty section can reference any primitive class (`.ds-button--primary`, `.ds-text--sm`, `.ds-heading--h2`) or snippet (`{% render 'price', price: 4800 %}`) and render correctly.

---

## Phase 1 — Parallel section streams (6 agents concurrent)

**Owner:** Agents via `Agent` tool with `isolation: "worktree"`. Each runs on its own branch, touches its own files, produces a PR you review and merge.

### Stream layout (each is independent)

| Stream | Scope | Files Touched | Test URL |
|--------|-------|---------------|----------|
| **A. Header + announcement** | `sections/header.liquid`, `sections/announcement-bar.liquid`, `assets/header.css`, `assets/announcement-bar.css` | sections A's own files — announcement bar now sourced from DS `packages/components/src/announcement-bar/` | `/` |
| **B. Footer** | `sections/footer.liquid`, `assets/footer.css` | sections B's own files | `/` |
| **C. PDP (product template)** | `sections/main-product.liquid`, `snippets/product-form.liquid`, `snippets/product-gallery.liquid`, `assets/product.css`, `assets/product-gallery.css`, `assets/variant-selector.css`, `assets/stock-indicator.css`, `assets/star-rating.css`, `assets/add-to-cart-button.css` | C's own files | `/products/<handle>` |
| **D. PLP (collection template)** | `sections/main-collection.liquid`, `sections/collection-filters.liquid`, `assets/collection.css`, `assets/product-card.css`, `assets/collection-filters.css`, `assets/pagination.css` | D's own files | `/collections/<handle>` |
| **E. Cart + drawer** | `sections/main-cart.liquid`, `sections/cart-drawer.liquid`, `snippets/cart-line-item.liquid`, `assets/cart.css`, `assets/cart-drawer.css`, `assets/cart-line-item.css` | E's own files | `/cart` |
| **F. Customer flow** | `sections/main-login.liquid`, `sections/main-register.liquid`, `sections/main-account.liquid`, `sections/main-addresses.liquid`, `sections/main-order.liquid`, `sections/main-reset-password.liquid`, `sections/main-activate-account.liquid`, `assets/customer.css` | F's own files | `/account/login`, `/account` |

### What keeps streams from conflicting

- **Distinct section files** — no two streams write to the same section
- **Distinct CSS files** — each stream owns its own asset files
- **No stream modifies** `layout/theme.liquid`, `assets/tokens.css`, `assets/base.css`, `assets/layout.css`, or any Phase 0 snippet
- **No stream edits** another stream's templates (`templates/product.json` only updated by Stream C, etc.)
- **Read-only dependencies** on Phase 0 output — streams consume primitives but never redefine them

### Hard rules for every stream prompt

Every agent prompt must include:
1. **What to port from:** exact path to the React component in `packages/components/src/`
2. **What BEM classes to preserve:** list every `.ds-*` class the section must output (agent copies them from the component CSS)
3. **What tokens to use:** reminder that every visual value references `--color-*`, `--spacing-*`, `--font-size-*` tokens — no raw values
4. **What snippets to consume:** e.g. "use `{% render 'price' %}` for prices, do not inline the formatter"
5. **What section settings to expose:** content only (text, images, URLs) — never design settings (color, font, spacing)
6. **SEO requirements:** which JSON-LD schema applies, which headings are required for hierarchy, image alt rules
7. **Test procedure:** run `shopify theme check`, visit test URL, screenshot the section, compare to component's Storybook story
8. **What NOT to touch:** explicit list of foundation files off-limits

### Running the streams

Spawn all 6 in a single message to the Agent tool (max parallelism). Each with `isolation: "worktree"` so they each get a separate branch and checkout. You review and merge them one by one — do not try to merge all 6 simultaneously.

Typical cadence:
- All 6 agents launched in parallel → each produces a PR over ~30–60 min
- You merge A (header) first (foundation for visible layout)
- Then B (footer) — visible layout complete
- Then in any order: C, D, E, F — independent routes

---

## Phase 2 — Composition (sequential)

**Owner:** Main Claude session. Not parallelized because these touch multiple streams' output.

1. **Home page sections** — now that header and footer are live, build home-page-only sections: `sections/hero.liquid`, `sections/featured-collection.liquid`, `sections/feature-block.liquid`, etc. These reference ProductCard (Stream D's CSS), Button (Phase 0), PriceDisplay (Phase 0 snippet). Add them to `templates/index.json`.
2. **SEO JSON-LD pass** — add `Product`, `CollectionPage`, `FAQPage`, `Organization`, `WebSite` JSON-LD blocks to the relevant templates. Can only happen after template sections are in place.
3. **404 + password pages** — low complexity, quick polish with existing primitives.
4. **Cross-browser + mobile QA pass** — real browser testing against the dev store, not just `http://127.0.0.1:9292` on one machine.
5. **Tokens sync automation** — resolve the PENDING DECISION in `10-shopify-theme.md` about manual vs scripted `tokens.css` copy. Likely a Turborepo task.

---

## Orchestration checklist for you

When you're ready to start parallelization:

- [ ] Phase 0 complete and committed (all foundations on `main`)
- [ ] `shopify theme dev` confirmed running locally against dev store
- [ ] Each stream's prompt drafted (I will write these when Phase 0 is done)
- [ ] Launch all 6 agents in one message with `isolation: "worktree"`
- [ ] Monitor for completion — agents notify when done
- [ ] Review each agent's branch + screenshots before merging
- [ ] Merge A → B → C, D, E, F (any order after B)
- [ ] Move to Phase 2

---

## Risks & mitigations

| Risk | Mitigation |
|------|-----------|
| Two streams both decide they need a new shared snippet | Phase 0 enumerates all shared snippets upfront; agent prompts forbid creating new shared snippets (must escalate) |
| Stream drifts from component's BEM class names, causing style mismatch | Prompt explicitly lists every class to preserve, agent screenshots compared to Storybook |
| Stream introduces raw values (hex, px) to ship faster | `theme-check.yml` rule flags it; prompt reiterates "every visual value is a token" |
| Stream modifies a Phase 0 file to "fix" something | Prompt explicit: Phase 0 files are read-only; raise in PR description if something's missing |
| Agent worktree stale vs. main | Each agent pulls `main` at start; if conflicts, surface to you before attempting auto-resolution |
| Shopify CLI can't run multiple `theme dev` sessions | You keep the single dev session running; agents don't need Shopify CLI to do their work, they just write Liquid + CSS files |
| Merge order matters for visible debugging | Merge Header first so the layout has top chrome; keeps subsequent visual QA readable |

---

## Expected timeline (rough)

- Phase 0: 1 focused session with Claude (~60–90 min)
- Phase 1: 6 agents × ~45 min each, running in parallel → ~1 hour wall time + your review time (~30 min per PR)
- Phase 2: 1–2 focused sessions

Wall-clock: ~1 day of focused work to go from scaffold to a fully-ported theme, if Phase 0 is done first. Calendar time depends on your review cadence.
