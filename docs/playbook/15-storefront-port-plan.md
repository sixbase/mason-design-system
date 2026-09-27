# 15 — Storefront Port Plan (audit round 5, 2026-09-27)

> The prioritised list of design-system fixes the Shopify theme (`mason-storefront`) still lacks. Work top to bottom; tick items off here as they land. Supersedes the port list in `12-audit-2026-09-25.md` round 1 item 8.

Read-only audit of `/Users/alvinthong/Code/mason-storefront` against the design system (DS) on `feat/motion-audit`.
The storefront's git tree was clean. Its token file was last synced on 2026-07-01, plus one Shopify-admin edit on 2026-08-01.

**How this was checked.** I read tokens, site-wide rules, motion, speed and SEO line by line. Three helper auditors covered the product page, the cart plus form parts, and browsing plus site chrome. I also read the browsing and cart code myself, and checked every P1 a helper raised against the files before listing it. Nothing was rendered in a browser. Contrast numbers come from the DS audit record.

Priorities: **P1** shoppers affected (broken or inaccessible). **P2** visible inconsistency, or friction for shoppers. **P3** nice to have.
Sizes: **S** under 1 hour, **M** about half a session, **L** a session or more.
Paths without a repo are in the storefront. `DS:` means `mason-design-system/packages/components/src/` unless a full path is given.

**Count: 84 items. P1 18, P2 38, P3 28.** There are also 6 design-system prerequisites (section 0).

---

## 0. Do these on the DS side first

- ~~**D1 · S**~~ **Done 2026-09-27** — `container-ultra: 1680px` is now in `tokens.json`. Add `--size-container-ultra: 1680px` to `packages/tokens/src/tokens.json`, or move it into the theme's `assets/layout.css`. It exists only because someone edited `assets/tokens.css` in the Shopify admin (commit a04173d). A straight resync deletes it. `assets/layout.css:61` would then break, and pages would go full-width at 1600px and above.
- ~~**D2 · S**~~ **Done 2026-09-27 (DS side)** — `--color-border-subtle` is now in `tokens.json`, and it is translucent: stone-950 at 5.57% in light, stone-50 at 5.57% in dark (≈1.12:1 on every surface). The theme's 50% solid mix vanished on tinted and dark surfaces (1.03–1.05:1). See `06` → "Divider Hairline".
  - **Theme side:** sync `tokens.css`, then delete the local definition and its comment in `assets/base.css:8-23`. Theme rules already on `--color-border-subtle` pick it up: `header.css:6,465`, `footer.css:9,203,335`, `gift-card.css:16`, `list-collections.css:113`, and two box edges, `collection-nav.css:77` and `list-collections.css:199`.
  - **Theme rules still on `--color-border` that look like dividers** (read each before moving it; box edges stay): `accordion.css:44`, `cart-line-item.css:28`, `cart-drawer.css:38,52,188`, `search.css:62`, `collection-filters.css:111,125,342`, `product.css:181,237`, `product-reviews.css:32,86,227`, `article.css:119`, `journal.css:166`, `customer.css:235`, `cart.css:273`, `sticky-atc.css:36,74`. Their DS twins moved to the new token in this change.
- **D3 · M** Make a browser build of `@ds/motion`. Today `dist/index.mjs` imports bare `gsap` and `@ds/tokens`, and splits into hashed chunks. A Shopify theme has a flat `assets/` folder and no bundler. The build needs to be one ESM file with `@ds/tokens` bundled in (`noExternal`). GSAP should resolve through an import map in `layout/theme.liquid` that points at self-hosted GSAP ESM files. This is needed only for items M-4 and M-6b.
- ~~**D4 · S**~~ **Done 2026-09-27** (`09-layout-grid.md`). Document the 1600px "ultra" frame as a second storefront divergence in `docs/playbook/09-layout-grid.md`.
- **D5 · S (decision)** Optical centring. The storefront uses the VALID `text-box: trim-both cap alphabetic` only in `button.css:47`, `badge.css:26`, `announcement-bar.css:59` and `product-reviews.css:56`. Everywhere else it uses the same INVALID `text-box-trim: both` as the DS. Also, `button.css:155` and `badge.css:89` still test the invalid syntax inside `@supports not`, so the 0.05em nudge runs on top of the valid trim. Copy the query from `announcement-bar.css:71` instead. Do not copy DS button or badge CSS over the storefront's until the DS is fixed.
  - Flagged by the cart helper, not re-checked by me: `customer.css:235` must stay invalid, because a valid trim would shrink table rows by about 13px. The trim in `typography.css` should be deleted, since the DS removed trim from flowing text.
  - Also from the helpers: header icon buttons carry text trim and sit 0.05em low (`header.css:136-138,474-479`). The DS removed that (`Header.css:213-215`).
- **D6 · S** Automate the token sync (the PENDING DECISION in `10-shopify-theme.md`). After every sync, run the storefront's own `python3 scripts/twins-check.py`. It found 43 issues today.

---

## 1. Tokens and global rules

| ID | Pri | What | Where | Copy from | Size |
|----|-----|------|-------|-----------|------|
| T1 | P1 | **Resync `assets/tokens.css`** (after D1). See the notes below this table. | `assets/tokens.css` | `packages/tokens/dist/tokens.css` | S |
| T2 | P1 | **Selected collection chip is invisible.** `--color-text` and `--color-text-muted` are never defined. The active chip gets no background and near-white text. | `assets/collection-nav.css:22,34,58,63,67,69`; `assets/list-collections.css:153,162,186,216` | use `--color-foreground` / `--color-foreground-secondary` | S |
| T3 | P1 | Newsletter fine print is on the "muted" grey (about 2.5:1). | `assets/newsletter.css:170` | `--color-foreground-secondary` | S |
| T4 | P2 | About 12 readable-text rules sit on the "subtle" grey (about 3.9:1). The DS rule is secondary grey or darker for readable text. | `product.css:265`, `product-reviews.css:211`, `ugc-strip.css:25`, `header.css:444`, `footer.css:317`, `collection-filters.css:69,144,264`, `pagination.css:71`, `breadcrumb.css:49`, `select.css:129`, `drawer.css:163` | decisions log "Text Tone Roles" | S–M |
| T6 | P3 | `--transition-base` is undefined, so the sticky Add to Bag bar snaps instead of fading. | `assets/sticky-atc.css:46-48` | `var(--transition-normal)` etc. | S |

**What T1 fixes.**
- The focus ring goes from a 20% halo (about 1.4:1) to a solid ring with a gap (8.7:1).
- Dark-mode red goes from 3.7–4.1:1 to about 6:1. This covers error text and sale badges, and the theme has a working dark toggle.
- The dark-mode overlay currently lightens the page behind the cart drawer and mobile menu. T1 makes it darken.
- `--color-border-control` arrives, which K-5 needs.
- 37 other tokens arrive, including hit area, safe-area, scale and easing tokens.
- New global blocks: print (always light), more-contrast mode, `color-scheme`, iOS text-size and tap-flash, and a token-based global focus outline.
- The global reduced-motion reset and `data-motion="off"` arrive too. Nine animated files have no reduced-motion rule today: `add-to-cart-button, badge, cart, breadcrumb, input, journal, blog, select, list-collections`.

**What changes visibly after T1.**
- Every focus ring looks different.
- Dark-mode muted and subtle greys get darker.
- Display sizes become fluid. Only `stats.css:52` uses them.
- Check afterwards: the dark drawer backdrop, dark error text, stats numbers on a phone, and the sticky Add to Bag bar.

---

## 2a. Component map

**DS components with a storefront port (29 CSS files):**
- accordion, add-to-cart-button, alert, announcement-bar, badge, breadcrumb, button, carousel
- cart-drawer, cart-line-item, collection-filters, drawer, feature-block, footer, header, highlights
- icon, image-gallery, input, pagination, price-display, product-card, quantity-selector
- select (as a native `<select>`), skeleton, star-rating, stock-indicator, typography, variant-selector
- Also: the skip link lives in `sections/header.liquid:14`, and table styles live in `customer.css`.

**DS components with no storefront counterpart:**
- avatar, card (used as classes only), checkbox (native used), color-picker, color-swatch, container, cookie-consent, countdown, divider
- dropdown-menu, empty-state, grid, layout-grid, modal, popover, predictive-search, progress-bar, radio-group
- segmented-control, slider, spinner, stepper, switch, table, tabs, tag, textarea, toast, tooltip
- None is urgent. Whether cookie consent is legally needed was not checked.

**Storefront sections with no DS component:**
- about-page, accessibility-statement, founder-note, journal, newsletter, product-lifestyle, product-recommendations, product-reviews, promo-pair, stats, testimonials, ugc-strip
- sticky-atc, gallery-view-toggle, collection-nav, list-collections, blog/article, 404, customer pages

## 2b. Cross-cutting component items

| ID | Pri | What | Where | Copy from | Size |
|----|-----|------|-------|-----------|------|
| C1 | P1 | **Focus rings vanish in Windows High Contrast.** 34 `outline:none` rules use only a box-shadow ring. None pairs it with `outline: 2px solid transparent`. | `button.css:28,51-56`, `drawer.css:183-186`, `cart-line-item.css:88-92`, `quantity-selector.css:36-41,77-82`, `input.css:37,63-66`, `select.css:65-68`, `customer.css:82,96-99,168-172`, `accordion.css:54-58`, `cart.css:102,112-115`, `variant-selector.css:65,104-106,120-122`, `carousel.css:325-328`, `product-card.css:42-45,185-189`, plus badge, announcement-bar, footer, header, collection-filters, image-gallery, product-reviews | each DS component CSS, e.g. `DS: button/Button.css`, `variant-selector/VariantSelector.css:125-129`, `carousel/Carousel.css:233-236` | M |
| C2 | P1 | **No forced-colors rules anywhere.** In High Contrast these can't be told apart: the selected variant chip, carousel dot, gallery thumb, stock dot, current nav link and current page number. Stars show 4.5 as 0.5. The **ticked filter checkbox looks unticked**, because its tick is a background plus clip-path. | `variant-selector.css`, `star-rating.css`, `image-gallery.css`, `carousel.css`, `stock-indicator.css`, `header.css:102-104`, `pagination.css:57-93`, `collection-filters.css:193-232` | `VariantSelector.css:238-253`, `StarRating.css:40-57`, `ImageGallery.css:125-158`, `Header.css:154-161`, `Pagination.css:71-79`, `Checkbox.css:116-126` (draw the tick with `currentColor`), `StockIndicator.css` | M |
| C3 | P2 | 55 `:hover` rules are not limited to real pointers, so hover sticks after a tap. For example, a tapped product card keeps showing its second photo. Hover fills are also invisible: the quantity button uses `background-subtle` (invisible in dark mode), and the header icon hover is about 1.07:1 and the same as the surface in dark. | e.g. `button.css:85,103,120`, `variant-selector.css:93-96,115-118`, `quantity-selector.css:27`, `input.css:69`, `select.css:57`, `accordion.css:48`, `drawer.css:173`, `header.css:98,157-159,371,414,449`, `footer.css:113,234,290,325`, `product-card.css:64,80,150,232,236`, `collection-filters.css:53,130,211`, `collection-nav.css:62` | wrap in `@media (hover: hover)`; icon and quantity hover to `--color-secondary` (`Header.css:236-243`) | M |
| C5 | P2 | Touch targets are under 44px on phones: small buttons, drawer close, quantity +/−, accordion trigger, announcement ✕ (28px), nav and drawer meta links, footer and legal links, breadcrumb links, filter pills, and filter rows (19px tall, 4px apart). | `button.css`, `drawer.css:149`, `quantity-selector.css:10` (`overflow:hidden` would clip them), `accordion.css:30`, `announcement-bar.css:107-129`, `header.css:90,437-451`, `footer.css:106,283`, `breadcrumb.css:37`, `collection-filters.css:29,157`, `collection-nav.css:107-115` | the coarse-pointer `::after` blocks in `Button.css`, `Drawer.css`, `QuantitySelector.css:84-105`, `AnnouncementBar.css:135-142`, `Header.css:163-180,218-231`, `Footer.css:142-155,203-213`, `Breadcrumb.css:71-91`, `Checkbox.css:65-92` | M |
| C6 | P2 | iPhone zooms the page when a small field is tapped (font under 16px). Affects login, newsletter, contact, search, cart note, price filter and quantity. | `input.css:50,55`, `customer.css:93`, `quantity-selector.css:100,112`, `cart.css:94`, `main-search.liquid:20` | the `--font-size-tight-base` coarse-pointer block (`QuantitySelector.css:177-187`; the theme's `select.css:169-177` already has it) | S |
| C7 | P2 | Long words overflow at 320px. | `typography.css:2-28`, `cart-line-item.css:71-82` | `Typography.css` `max-width:min(100%,…)`, `CartLineItem.css` | S |

## 2c. Per-component items

### Product page

| ID | Pri | What | Where | Copy from | Size |
|----|-----|------|-------|-----------|------|
| P-1 | P1 | Quantity focus ring is clipped by `overflow:hidden`. The ring should wrap the whole control. | `quantity-selector.css:10,36-41,77-82`; `snippets/product-form.liquid:297-322` | `QuantitySelector.css:10-29,50-61` (`:has()` ring, no overflow, inner corners) | M |
| P-2 | P1 | Gallery thumb focus ring shows at about 24%: the focused thumb is the active one, which is dimmed to `--opacity-low`. The ring is also clipped in the scrolling strip. | `image-gallery.css:228-239` | `ImageGallery.css:125-158` (outline inset) plus un-dim on `:focus-visible` | S |
| P-3 | P1 | Carousel Next becomes natively `disabled` and hidden at the end, so keyboard focus is thrown to the page body. | `assets/carousel.js:102-103`, `carousel.css:332-336` | `Carousel.tsx:387-415`, `Carousel.css:238-248` (aria-disabled, stays focusable) | M |
| P-4 | P1 | **Product card link has `aria-label="{{ product.title }}"`.** That replaces its contents, so screen readers never hear the price, "Sale" or "Sold out" on any product grid or carousel. | `snippets/product-card.liquid:49-53` | `DS: product-card/ProductCard.tsx` (no aria-label; the name is the text; image `alt=""` by default, line 30-34, 98) | S |
| P-5 | P2 | Variant pills are `<a role="radio">`. Every pill is a tab stop, with no arrow keys and no roving tabindex. The group name includes ": Black" because `aria-labelledby` points at the label plus the selected value. | `snippets/product-form.liquid:209-269` (demo `:71-140`) | `VariantSelector.tsx:154,169-251` (`aria-label={option.name}`, roving tabindex) | M |
| P-6 | P2 | Unavailable variant chips are faded with opacity, so their text drops below 4.5:1 even though they're selectable. | `variant-selector.css:125-127` | `VariantSelector.css:151-156` | S |
| P-7 | P2 | Sale price reads "$38.00 Original price: $48.00" with no "Sale price:" label. The "Sale" badge next to it repeats the fact. | `snippets/price.liquid:30`; `snippets/cart-line-item.liquid:100` | `PriceDisplay.tsx:52`; aria-hidden on the badge | S |
| P-8 | P2 | Carousel steps with a relative `scrollBy` and always scrolls smoothly, so rapid clicks drift off the cards and reduced motion is ignored. | `assets/carousel.js:134-136` | `Carousel.tsx:245-319` | M |
| P-9 | P2 | `touch-action: pan-y` blocks pinch-zoom on the main product photo. | `image-gallery.css:39` | `ImageGallery.css:41` | S |
| P-10 | P2 | The sticky Add to Bag bar (phones) can cover the focused element; there is no `scroll-padding-bottom`. | `sticky-atc.css:139-150` | DS sticky-header `scroll-padding` pattern | S |
| P-11 | P2 | Reviews "Read more" hides itself on click, so focus falls to the page body. Its hit area is under 24px. | `assets/product-reviews.js:117-121`, `product-reviews.css:154-167` | Show-more focus handling in the same file | S |
| P-12 | P2 | Quantity is 44px tall, not 42, and misaligned with the button beside it. − isn't dimmed at 1. | `quantity-selector.css:91-113`, `product-form.liquid:367-373` | `QuantitySelector.css` `--quantity-selector-inner` | S |
| P-13 | P3 | Add to Bag isn't guarded while loading, so a second Enter adds twice. Sold-out uses native `disabled`, which Tab skips. | `product-form.liquid:330-333,386-399`; `sticky-atc.js:45-56` | `AddToCartButton.tsx:106,135-137` | S |
| P-14 | P3 | Gallery thumbs aren't paired to a tabpanel. Arrow keys aren't mirrored for RTL. The thumbs-left layout lacks `contain:size`. | `main-product.liquid:126,193-202,604-605`; `image-gallery.css:206-212` | `ImageGallery.tsx:83-165`, `ImageGallery.css:89-104` | S |
| P-15 | P3 | Carousel has no region or slide labels and no RTL maths. It uses raw values (40px, 240ms, 0.96). | `product-recommendations.liquid:67`; `carousel.js:87-88`; `carousel.css:134,196-197,283-320` | `Carousel.tsx:79-101,347-360` | M |
| P-16 | P3 | Star label says "(1 reviews)" and "0.0 out of 5 stars" when empty, and counts are ungrouped (1158). The core fix is already in: the count is in the label, and Liquid can't produce NaN. | `snippets/star-rating.liquid:20`; `product-reviews.js:88`; `product-reviews.liquid:118,137` | `StarRating.tsx:86-118` | S |
| P-18 | P3 | Small CSS catch-ups: price row wrap, `.ds-sr-only` clip fallback, raw variant press scale, no print colours. | `price-display.css:2-6,34-44`; `variant-selector.css:100,153` | `PriceDisplay.css:2-9,49-60`; `VariantSelector.css:119,263` | S |

### Cart and dialogs

| ID | Pri | What | Where | Copy from | Size |
|----|-----|------|-------|-----------|------|
| K-1 | P1 | **Every quantity change or removal in the drawer replaces the drawer's HTML** (`root.innerHTML = …`). The focused button is destroyed, focus falls to `<body>`, and Tab then leaves the dialog for the page behind. − at quantity 1 is natively `disabled`, so there is nothing to refocus. | `sections/cart-drawer.liquid:450-473`; `snippets/cart-line-item.liquid:126` | `DS: cart-drawer/CartDrawer.tsx:122-148` (refocus by `data-line-key`, else the next line's Remove, else the empty-state button); aria-disabled pattern from lesson `#aria-disabled-focus` | M |
| K-2 | P1 | **Safari and VoiceOver focus return.** Both the cart drawer and the mobile menu return focus to `document.activeElement`. After a tap, Safari leaves that on `<body>`, so closing drops the shopper at the top of the page. | `cart-drawer.liquid:291,331`; `sections/header.liquid` (mobile-nav `open()` / `close()`) | `DS: internal/dialog-opener.ts` (remember the last capture-phase `pointerdown`) | S |
| K-3 | P1 | The cart live region is pre-filled by the server and sits inside the swapped HTML. A new, already-filled copy is inserted on every refresh, so announcements are unreliable. | `cart-drawer.liquid:203-210` | `DS: internal/use-change-announcement.ts` (one persistent empty region outside the swapped markup; set text only when the count changes) | S |
| K-5 | P1 | Form control borders use `--color-border` (1.3:1, fails WCAG 1.4.11). Affects inputs, selects (including sort), quantity, variant chips, the filter checkbox, customer selects and the cart note. | `input.css:25`, `select.css:36`, `quantity-selector.css:8,59-60`, `variant-selector.css:59`, `collection-filters.css:200`, `customer.css:71`, `cart.css:97` | `--color-border-control` (`Input.css:33-35`, `Checkbox.css:30`); needs T1 | S |
| K-6 | P1 | **Failed address saves are invisible** (storefront-only bug). Shopify re-renders the errors inside a panel that ships `hidden`, and nothing opens it. | `sections/main-addresses.liquid:22,144,252-276` | render the panel open, with `aria-expanded="true"`, when `form.errors` | S |
| K-7 | P2 | Customer forms don't link errors or hints to their fields: no `aria-invalid`, no `aria-describedby`. | `main-login.liquid:44-68`, `main-register.liquid:94-105`, `main-contact.liquid:52-104`, `main-addresses.liquid:52-92`, `main-activate-account.liquid:53`, `main-reset-password.liquid:59` | `Input.tsx:52-72,98-117`; `footer.liquid:146` already does it | M |
| K-8 | P2 | The required asterisk is read aloud as "star". | `input.css:18-21` | `Input.css:21-27` (`content: ' *' / ''`) | S |
| K-9 | P2 | On desktop the cart line hides its unit price, so a sale shows only a bare "Sale" pill. The pill also stretches across the column. | `cart-line-item.css:64-69,171-174`; `cart-line-item.liquid:104` | `CartLineItem.tsx:107,178-185`, `CartLineItem.css:199-201` | S |
| K-10 | P2 | On the cart page, every quantity change or removal reloads the page and focus goes to the top. | `sections/main-cart.liquid:140-152` | reuse the drawer's AJAX and refocus (K-1) | M |
| K-11 | P2 | PDP heading skips from h1 to h3 when a product has no description, because the "Description" h2 is conditional. | `main-product.liquid:308,319,369` | — | S |
| K-12 | P2 | Country and province selects have `appearance:none` and no chevron, so nothing shows they are dropdowns (storefront-only). | `customer.css:86-87` | the `.ds-select-trigger` wrapper | S |
| K-13 | P2 | Alert still has the pre-redesign look. Warning uses `role="status"`. Destructive `--alert-fg` is the white button-label token. | `alert.css:6-50`; `main-order.liquid:20` | `DS: alert/Alert.css`, `Alert.tsx` | M |
| K-15 | P2 | If `/cart/change.js` or `/cart/update.js` answers with an error, the code reads `item_count` from the error body. The header badge disappears and the cart link is renamed "Shopping bag (undefined items)". Errors are otherwise swallowed. | `cart-drawer.liquid:418-445,475-495` | check `r.ok`; show the message | S |
| K-21 | P2 | Suspected, not browser-tested: pressing Enter in an unchanged drawer quantity field submits with the form's first button, which is line 1's "−". That would remove one of the first item. | `cart-drawer.liquid:377-400` | handle Enter on `[data-qty-input]` explicitly | S |
| K-14 | P3 | Minor visual drift: the skeleton band is lighter than the page, the line image radius is 2px vs 8px, and the placeholder icon is muted, not subtle. | `skeleton.css:4-5`; `cart-line-item.css:19,60` | `Skeleton.css`, `CartLineItem.css` | S |
| K-16 | P3 | Skeleton shimmer animates `background-position`, which repaints every frame. | `skeleton.css:11-28` | `Skeleton.css` `::after` transform | S |
| K-17 | P3 | Accordion lacks the text fade, `overflow:clip` with the Safari fallback, `text-align:start`, and region roles. | `accordion.css:37,83,88-94` | `DS: accordion/Accordion.css` | S |
| K-18 | P3 | The drawer body isn't a tab stop when it overflows. | `drawer.css:189` | `Drawer.tsx:50-72`, `Drawer.css:249-251` | S |
| K-19 | P3 | Focused aria-disabled or loading buttons don't un-fade; there is no spinner and no print colours. | `button.css:130-141` | `DS: button/Button.css` | S |
| K-20 | P3 | Drawer skeleton has inline raw widths and an `aria-label` on a role-less div. "Continue Shopping" is md, not lg. Options have no "·" separator. | `cart-drawer.liquid:66-75,83,194`; `cart-line-item.css:94-98` | — | S |
| K-22 | P3 | The order-table scroll wrapper isn't focusable or named. | `customer.css:258` | `Table.tsx:133-165` | S |

### Browsing and site chrome

| ID | Pri | What | Where | Copy from | Size |
|----|-----|------|-------|-----------|------|
| B-1 | P1 | **Each filter tick (and each sort change) reloads the page** via `form.submit()`. Focus jumps to the top. On phones the filter panel is a `<details>` that comes back closed, so shoppers must reopen Filters after every choice. The results-count live region is already filled on load, so it is rarely announced. | `snippets/collection-filters.liquid:36-38,224-230,238-252`; `sections/main-collection.liquid:49-53,263-271` | short term: submit button on mobile, or restore the open panel and focus. Long term: Section Rendering API plus `CollectionFilters.tsx` focus restore, `internal/use-change-announcement.ts` and DS `createFlip` | M (L long term) |
| B-8 | P1 | **Product cards show no visible keyboard focus.** The ring is drawn on an inline `<a>` that wraps block elements, so it barely paints. It affects every grid and carousel. | `assets/product-card.css:180-189` | `DS: card/Card.css:58-69` (block link, `:focus-visible > .ds-card--interactive`, transparent outline) | S |
| B-9 | P1 | Collection tiles are `<a role="listitem">`, so screen readers lose that they are links (storefront-only). | `sections/main-list-collections.liquid:93-97` | move the role to a wrapper | S |
| B-3 | P2 | Pagination current page puts `aria-label="Page N"` on a `<span>`, which is ignored, so it reads just "3". The markup is duplicated in two places. | `snippets/pagination.liquid:38`; `sections/main-collection.liquid:160-164` | DS Pagination: visually hidden "Page 5, current page" (lesson `#aria-label-no-role`); make main-collection render the snippet | S |
| B-17 | P2 | The pagination row on phones overflows at 320px (the info text is `nowrap`), and page buttons have no 44px zone. | `pagination.css:57-93` | `Pagination.css:111-128,158-177` | S |
| B-4 | P2 | Breadcrumb nav has `overflow:hidden`, which clips link focus outlines. Links have no label span, so parent crumbs never truncate, and at 320px the current page gets squeezed to 0px. | `breadcrumb.css:2-4,37-42,71-75`; `snippets/breadcrumb.liquid:69-72` | `DS: breadcrumb/Breadcrumb.css:1-9,37-50,149-153`, `Breadcrumb.tsx:112-117` | S |
| B-5 | P2 | The sort select submits on change (WCAG 3.2.2 risk with arrow keys). It can mark two options `selected` (the chosen one and the default), so the shown sort may be wrong. | `sections/main-collection.liquid:49-58,263-271` | add an Apply button or submit on blur; one `selected` | S |
| B-7 | P2 | The footer newsletter field's label is the placeholder ("your@email.com"), so screen readers hear an example address, not "Email". | `sections/footer.liquid:130-132` | — | S |
| B-10 | P2 | Desktop nav doesn't wrap, so a long menu overflows at 768px. It also sits off-centre (flex space-between). | `header.css:36-47,79-88` | `Header.css:37-54,117-137` | M |
| B-11 | P2 | The skip link isn't the first focusable element: the announcement bar's link and ✕ come before it. | `layout/theme.liquid:160-161`; `sections/header.liquid:14` | move it first in `theme.liquid`; style from `DS: skip-link/SkipLink.css` | S |
| B-12 | P2 | Footer grid is plain `1fr`, not the 12-column grid from 1024px. A 4th column wraps under the brand, and there is no bottom safe-area padding. | `footer.css:13-38` | `Footer.css:7-84` | S |
| B-13 | P2 | Desktop shows two "Clear all" buttons, and the price pill has a dangling dash ("Price:– $50"). | `collection-filters.liquid:72-77,115-128` | `CollectionFilters.tsx` "From / Up to" wording (`priceRangeLabel`) and the hidden desktop clear row | S |
| B-14 | P2 | The narrowing-chip bar nests `ds-page-container` inside another one (double side padding). Its scroll row clips the chip focus outline on phones. | `snippets/collection-nav.liquid:131`; `collection-nav.css:92-101` | — | S |
| B-15 | P2 | The page frame ignores left and right safe areas even with `viewport-fit=cover`, so content goes under the notch on landscape iPhones. | `assets/layout.css:66-71` | `DS: container/Container.css:5-32` | S |
| B-16 | P2 | The `warning` and `outline` badge variants are used on the order pages but don't exist, so order-status badges show no colour. | `assets/badge.css`; `main-account.liquid:47,52`; `main-order.liquid:37,45` | `DS: badge/Badge.css` variants | S |
| B-6 | P3 | The filter panel renders twice (desktop and mobile), duplicating `PriceMin-both` and `PriceMax-both` ids. Count `aria-label` sits on a role-less span. | `collection-filters.liquid:152-176,125-131` | unique ids per context | S |
| C4 | P3 | Duplicate `id="MainContent"`. The skip link still reaches `<main>` (first match), but the HTML is invalid. Rename the inner one. | `layout/theme.liquid:163`, `sections/main-collection.liquid:105` | — | S |
| B-18 | P3 | Product card has no container queries. Physical left/right is used instead of logical properties (RTL). Grids use `1fr`, not `minmax(0,1fr)`. | `product-card.css:208-214`, `announcement-bar.css:116`, `collection-filters.css:293`, `header.css:9`, `layout.css:118`, `search.css:33`, `list-collections.css:9` | `ProductCard.css` container rules, `inset-inline-*` | S |
| B-19 | P3 | Cart count has no bump, no 99+ cap and no High Contrast outline. | `header.liquid:118-122`, `cart-drawer.liquid:475-493`, `header.css:172-186` | `Header.css:326-397` | S |
| B-20 | P3 | Filter groups aren't headings, and there's no "Show N more". | `collection-filters.liquid:131-146` | `CollectionFilters.tsx` | M |
| B-21 | P3 | Footer link columns are divs, not `<nav>`; headings and tagline skip the Heading/Text classes. | `footer.liquid:41,46,82-89` | `DS: footer/Footer.tsx` | S |
| B-22 | P3 | Mobile menu is `<nav role="dialog">`, which drops the nav landmark. Its motion uses raw values. | `header.liquid:135-139`; `header.css:331-344` | `DS: header/Header.tsx` + `drawer/Drawer.tsx` | S |

**Checked and already fine:**
- Badges are not live regions anywhere.
- Footer column headings are h2 (`footer.liquid:84-88`).
- PDP accordion headings are h3 under an h2 (except K-11).
- Prices always go through Liquid `money`, so the DS "$4800.00" and mixed-currency bugs can't happen here.
- The mobile menu closes when rotated to desktop width (`header.liquid:398-405`), has Escape and a focus trap, and handles the notch with `env()` padding.
- The header is **not sticky**, so the sticky-header focus offset doesn't apply. The only sticky overlay is the phone Add to Bag bar (P-10).
- Header icon buttons are 44px on touch.
- The newsletter section and footer already link their errors.
- The Add to Bag live region starts empty.

---

## 3. Motion

The storefront today loads `assets/animations.js`, GSAP core (72KB min) and ScrollTrigger (44KB min) with `defer` on **every page** (`layout/theme.liquid:153-155`).

| ID | Pri | What | Where | Copy from | Size |
|----|-----|------|-------|-----------|------|
| M-1 | P1 | **The reveal hides cards with `autoAlpha`** (`visibility:hidden`), including cards already on screen. They leave the tab order and the screen-reader tree until scrolled in, blink out at load, and can delay the main image on collection pages. | `assets/animations.js:47` | contract in `packages/motion/src/reveal.ts:25-40`. Quick fix: opacity + y only, skip items in view | S |
| M-2 | P2 | Reduced motion is read once. Save-Data, 2G and `data-motion="off"` are ignored. An 8-second timer is the only failure safety net. | `animations.js:17,84-90` | `packages/motion/src/env.ts` | S |
| M-4 | P2 | GSAP isn't lazy: about 46KB gz on every page, including cart, account and 404. | `layout/theme.liquid:153-155` | `packages/motion/src/gsap.ts`; needs D3 | M |
| M-5 | P2 | The UGC ticker moves forever with no pause button (WCAG 2.2.2), and ignores `data-motion="off"` (storefront-only). | `assets/ugc-ticker.js`, `sections/ugc-strip.liquid` | — | S |
| M-6a | P3 | Hero entrance (LCP-safe from 9% opacity) and cross-document view transitions are missing. The transitions need zero JavaScript and would soften the filter reloads. | copy `packages/motion/dist/motion.css` to `assets/motion.css`; add `data-motion="hero"` in `sections/hero.liquid` | — | S |
| M-6b | P3 | Fly-to-cart and cart bump are missing. They need `data-motion-cart-target` on the header cart link. | `sections/header.liquid`, `snippets/product-form.liquid` | `packages/motion/src/commerce.ts`; needs D3 | S |

## 4. Performance

| ID | Pri | What | Where | Size |
|----|-----|------|-------|------|
| F-1 | P2 | Fonts block rendering. They come from Google, with the full 100–700 axis, roman and italic, plus JetBrains Mono. This is also open DS-side (round 1, item 7), so it's a joint decision, not drift. Recommend Shopify's font library (IBM Plex Sans is in it) or self-hosted Latin woff2 files with preload. | `layout/theme.liquid:106-108` | M |
| F-2 | P3 | Hero fallback images are single JPEGs (201KB desktop, 140KB phone) with no srcset or WebP. Upload them as a section image so `image_url` can resize. | `sections/hero.liquid:55-78` | S |

## 5. SEO (read-only)

- **One h1 per template: OK.** Reset-password's two h1s are in if/else branches.
- **Organization and WebSite with SearchAction: present** (`layout/theme.liquid:76-101`).
- **Product: present.** It merges with the reviews block by `@id` (`main-product.liquid:673-713`, `product-reviews.liquid:197-214`).
- **CollectionPage: present** (`main-collection.liquid:274-300`).
- **FAQPage: present** on the About page. PDP accordions are product details, so they correctly have none.
- **Canonical, Open Graph and Twitter card: present** (`layout/theme.liquid:31-73`).
- **Images:** srcset through `snippets/responsive-image.liquid`. Lazy below the fold and eager with high priority for the hero.

| ID | Pri | What | Where | Size |
|----|-----|------|-------|------|
| S-1 | P3 | BreadcrumbList is missing on articles (the snippet has an article branch but `main-article.liquid` never renders it), search, the collections list, and cart (no branch). | `snippets/breadcrumb.liquid:17-52`, `sections/main-article.liquid` | S |
| S-2 | P3 | Product schema lacks gtin/mpn, per-variant offers (only the current variant), `priceValidUntil`, and shipping and return policies. | `main-product.liquid:673-713` | S–M |
| S-3 | P3 | Two Organization entities: the site-wide one has no `@id`, and the About one has a hardcoded URL. They may not merge. | `theme.liquid:76-85`; `about-page.liquid:243-262` | S |
| S-4 | P3 | There is no `templates/robots.txt.liquid`, so Shopify's default applies and the CLAUDE.md AI-crawler allowances are not explicit. The live file was not fetched. | — | S |
| S-5 | P3 | Hero image alt repeats the h1, so it is read twice. The homepage h1 disappears if the hero heading is blank. | `sections/hero.liquid:61-78,91-94` | S |

---

## 6. Deliberate divergences (confirmed, not drift)

- The 1300px page frame (`--size-container-wide`), per playbook 09 and the decisions log.
- The 1680px frame at 1600px and up (`layout.css:53-63`). It's deliberate per its comment, but undocumented DS-side and fragile (D1, D4).
- The valid `text-box` syntax in button, badge, announcement bar and reviews. The theme is ahead here; see D5.
- The cart drawer uses plain JavaScript and the Section Rendering API, not Radix (decisions log 2026-04-24). Remove is a link and quantity is a typeable input, so the cart works without JavaScript.
- Variant pills are links that reload the page. Options with more than 7 values become a native select. Chips are a visible 44px tall on phones.
- Gallery: 34px editorial radius, the active thumb dims instead of getting a border, grid view toggle. Carousel: full-bleed track, edge fades, desktop-only arrows, 29% peek.
- The drawer opens at once with a skeleton, instead of showing an "Added!" button state.
- The drawer is named by its visible h2, so it doesn't have the DS's hidden duplicate h2.
- The theme-color meta is kept in sync by script for the manual dark toggle.
- The 10px product-card price on phones is the same in the DS. That's an open DS decision, not drift.
- `.ds-reviews [hidden]{display:none !important}` (`product-reviews.css:19-21`) is documented, but it breaks the no-`!important` rule.

## 7. Suggested sessions

1. **Tokens and contrast** (about 1 session): D1 and D2 DS-side, then T1, T2, T3, T4, K-5, B-16 and T6, then run `twins-check.py`. Look at the focus rings, dark drawer, dark error text and sticky Add to Bag bar.
2. **Focus, High Contrast and touch** (about 1 session, mostly copying CSS): C1, C2, C3, C5, C6, C7, P-1, P-2, B-8, B-4, B-14, B-17, plus M-1's quick fix and B-9.
3. **Cart and dialogs** (about 1 session): K-1, K-2 (both drawers), K-3, K-15, K-21, K-9, K-6, then K-10.
4. **Product and browsing behaviour** (1–2 sessions): P-4, P-3, B-1, P-5 to P-12, B-3, B-5, B-7, B-10 to B-13, B-15, K-7, K-8, K-11 to K-13.
5. **Motion and speed** (about 1 session, after D3): M-2, M-4, M-5, M-6a, M-6b, F-1, F-2.
6. **SEO extras and P3 polish.**
