# 10 — Shopify Theme

> How the design system is consumed by the Shopify storefront. The theme lives in `apps/theme/` and is the end goal of everything in `packages/`.

---

## Goal

The design system exists to power a Shopify storefront. The theme is not a second design system — it is the **consumer** of `@ds/tokens` and the HTML/CSS patterns established by `@ds/components`. If something looks different between the docs site and the storefront, the theme is wrong.

---

## Architecture

```
tokens.json
    ↓
@ds/tokens (dist/tokens.css)
    ↓              ↓
apps/docs     apps/theme (Shopify Liquid)
    ↓              ↓
Storybook    Mason storefront
```

- **Tokens travel via CSS custom properties.** `tokens.css` is copied into `apps/theme/assets/tokens.css` and imported in `layout/theme.liquid`.
- **Component CSS is ported, not imported.** React components can't render in Liquid. We copy the BEM CSS classes (`.ds-button`, `.ds-card`, etc.) into theme assets, and author Liquid sections/snippets that output matching HTML.
- **The React package stays canonical.** If a component's CSS changes in `packages/components/`, it must be re-synced into `apps/theme/assets/`.

---

## Directory Structure

```
apps/theme/
├── assets/
│   ├── tokens.css     ← copy of packages/tokens/dist/tokens.css
│   ├── base.css       ← global reset + body defaults
│   ├── layout.css     ← .ds-page-container + .ds-layout grid
│   └── {component}.css ← ported per component as sections get built
├── config/
│   ├── settings_schema.json  ← minimal, content-only (no design settings)
│   └── settings_data.json
├── layout/
│   └── theme.liquid   ← minimal head/body, imports token + base + layout CSS
├── locales/           ← Shopify translations, ~51 files (unchanged from Dawn)
├── sections/
│   └── main-placeholder.liquid  ← scaffold; replaced per template
├── snippets/          ← shared Liquid partials
└── templates/
    ├── index.json, product.json, collection.json, cart.json, ...
    └── customers/     ← account, login, register, etc.
```

---

## How We Got Here

**Starting point:** Shopify's [Dawn](https://github.com/Shopify/dawn) reference theme — 185 assets, 54 sections, 37 snippets. Full working theme with Dawn's own CSS system.

**Strip approach (chosen):** Delete all assets, all sections, all snippets. Keep only the Liquid scaffolding (`layout/theme.liquid` rewritten, `config/`, `locales/`, `templates/` rewritten as JSON pointing to a placeholder section). Rebuild sections one-by-one using `@ds/tokens` and ported component CSS.

**Why:** Dawn's CSS system would fight the design system at every turn. A clean slate means the design system is the only source of truth, from day one. Slower initial ramp but zero contamination risk.

**Rejected:** Keep Dawn, swap CSS files file-by-file. Would have led to months of fighting Dawn's opinions about spacing, typography, and color.

See [06-decisions-log.md](./06-decisions-log.md) — "Shopify Theme: Strip Dawn Aggressively".

---

## Dev Workflow

### Store setup

- **Dev store:** `mason-ufqqwrle.myshopify.com` (Shopify Partners development store)
- **Live theme:** "Horizon" — do not touch, this is the production theme
- **Dev theme:** Auto-created by `shopify theme dev`. Shows up in theme list as `Development (…Mac-mini-M2-Pro)`.

### Running the theme locally

Always run `shopify theme dev` from inside `apps/theme/` — never from the monorepo root. The CLI syncs the current working directory to the remote dev theme; running from the wrong dir will try to sync an empty/partial directory and fail to delete required files.

```bash
cd apps/theme
shopify theme dev --store=mason-ufqqwrle.myshopify.com
```

The CLI will prompt for the storefront password on the first run (find it at Admin → Online Store → Preferences → Password protection). Preview at `http://127.0.0.1:9292`.

### When the dev theme gets into a bad state

If a previous run corrupted the remote dev theme (half-synced, missing files, SSL errors mid-upload), delete it and let the CLI create a fresh one:

```bash
shopify theme list --store=mason-ufqqwrle.myshopify.com
# Identify the [development] [yours] theme id (NOT the [live] one)
shopify theme delete --store=mason-ufqqwrle.myshopify.com --theme=<id>
shopify theme dev --store=mason-ufqqwrle.myshopify.com
```

---

## Conventions

### 1. Design decisions live in the design system, not the theme

Per CLAUDE.md: the theme's `settings_schema.json` exposes **content** (text, images, URLs), never **design** (colors, fonts, spacing). The design system already made those decisions — merchants don't override them from the theme editor.

### 2. Never raw values in Liquid styles

Same rule as components: every visual value references a token. If a Liquid section needs a background, it uses `var(--color-background-subtle)`, not a hex. Inline `style=` attributes in Liquid are tolerated only when they consume tokens — and only during scaffolding; production sections should use classed CSS.

### 3. Prices in cents

Shopify and our `PriceDisplay` component both use cents (e.g., `4800` = `$48.00`). Never introduce a different convention in the theme.

### 4. Port, don't reinvent

When building a Shopify section for a pattern we already have as a React component (Header, ProductCard, etc.), the Liquid section must output HTML matching the component's BEM class structure and import the same CSS. If the component has 5 variants, the section has the same 5 variants.

### 5. One section per meaningful page region

Mirror the React component boundaries. Header is one section, ProductCard is rendered by a collection section, AddToCartButton is a snippet called from the product template. If a pattern is a component in `packages/components/`, it is a section or snippet in `apps/theme/`.

---

## Required Shopify File Gotchas

- **`settings_schema.json` Section 1 (theme_info):** must include `theme_documentation_url` (any valid URL) and **either** `theme_support_email` **or** `theme_support_url`, but not both. Empty strings fail URL validation.
- **`templates/gift_card.liquid`** is the only non-JSON template and is required.
- **All templates are required** — if `templates/404.json` or `templates/cart.json` is missing, Shopify falls back to a generic system page and the theme appears broken.
- **Customer templates** (`templates/customers/*.json`) are needed for `/account`, `/account/login`, etc. — if absent, those routes 404.
- **Locales:** keep the full set. Shopify expects them for translation fallback even if the storefront is English-only.

---

## Roadmap

| Phase | What | Status |
|-------|------|--------|
| Scaffold | Strip Dawn, boot with placeholder section + all tokens loaded | ✅ Complete |
| Header | Port `Header` component → `sections/header.liquid` | Next |
| Footer | Port `Footer` component → `sections/footer.liquid` | Pending |
| Product template (PDP) | Port ProductCard, PriceDisplay, VariantSelector, AddToCartButton, StockIndicator, StarRating | Pending |
| Collection template (PLP) | Port CollectionFilters, ProductCard grid, Pagination | Pending |
| Cart template + Drawer | Port CartLineItem, CartDrawer, quantity controls | Pending |
| Home page sections | FeatureBlock, Carousel, hero sections | Pending |
| SEO structured data | JSON-LD: Product, CollectionPage, BreadcrumbList, Organization, WebSite | Per page |
| Customer templates | Port Input, Button, Alert for login/register/account flows | Pending |

---

## Open Questions

**[PENDING DECISION]** How do we sync `packages/tokens/dist/tokens.css` → `apps/theme/assets/tokens.css` automatically? Options: (a) manual copy, (b) build script in `apps/theme/package.json`, (c) Turborepo task that runs after `@ds/tokens` build. Currently manual.

**[PENDING DECISION]** Where do ported component CSS files live? Options: (a) one combined `components.css` in theme assets, (b) one CSS file per component mirroring `packages/components/`. Leaning toward (b) for clarity.

**[PENDING DECISION]** Do we publish the theme as a public GitHub theme (shareable Dawn-style reference) or keep it private to the Mason store? Affects README, license, and whether we strip store-specific references.
