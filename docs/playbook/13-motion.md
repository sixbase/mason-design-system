# 13 — Motion

> How things move, and the rules that keep motion cheap, optional and accessible. Tokens are in `03-tokens.md` (Transitions, Easing, Motion primitives); the history is in the decisions log ("Motion Layer: `@ds/motion`…" onwards) and `12-audit-2026-09-25.md`.

---

## Two layers

| Layer | Owns | Lives in | Needs JS? |
|-------|------|----------|-----------|
| **CSS** | Micro-interactions: hover, press, focus, overlay open/close, checkbox tick, switch spring, tab-panel rise, accordion fade | Each component's `.css` | No |
| **`@ds/motion`** | Choreography CSS can't do: scroll reveals, FLIP (filter/sort/remove), split headlines, parallax, fly-to-cart | `packages/motion` | Yes — GSAP, loaded lazily |

Plus two CSS-only page effects in `@ds/motion/css` (`packages/motion/src/motion.css`): the **hero entrance** (`data-motion="hero"`) and **native page transitions** (cross-document view transitions). They run at first paint, before any script.

Rule: if it must work without JavaScript or happens on every interaction, it is CSS in the component. `@ds/motion` is decoration layered on top — the page must be complete without it.

---

## Rules

1. **Tokens only.** Durations `--transition-duration-*` (100 → 686ms, ×φ), shorthands `--transition-fast|normal|slow`, easings `--transition-easing-*`, staggers `--motion-stagger-*`, distances `--motion-distance-*`, scales `--scale-*`. No raw `ms`, `s` or `cubic-bezier()` — `check-css` fails the lint.
2. **Pick the curve by job.** `emphasized` for arrivals (overlays opening, reveals), `emphasized-in` for exits, `glide` for moving between two resting places (FLIP, sliding indicators), `spring` only for small (≤44px) confirmations, never on large surfaces.
3. **Never hide content before the animation library has loaded,** and never hide anything already on screen. `@ds/motion` hides with opacity only, only below the fold, only after GSAP is in memory (`07` → `#reveal-hide-after-load`).
4. **Above the fold starts at `--opacity-ghost` (9%), never 0.** An element painted at opacity 0 is not a Largest Contentful Paint candidate — it doubled homepage LCP on a throttled phone (`07` → `#lcp-opacity-zero`).
5. **Three off switches, all honoured everywhere:**
   - OS **reduced motion** → the global reset in `tokens.css` cuts every CSS animation/transition to 0.01ms with no delay; `@ds/motion` reports `reduced` (no travel, scale or parallax).
   - **`<html data-motion="off">`** (a site "pause animations" switch) → same CSS reset, page view transitions cancelled, `@ds/motion` reports `off`.
   - **Save-Data or a 2G connection** → `@ds/motion` reports `off` and never downloads GSAP.
6. **`.ds-motion-safe` opts an element out of the global reset.** Use it only for a non-moving replacement animation that must keep running (Spinner's opacity pulse). The element then handles reduced motion *and* `data-motion="off"` itself. Without it, the `!important` reset freezes the animation on its first frame (`07` → `#reset-kills-fallback`).
7. **A looping animation needs its own reduced-motion state** if its final keyframe is off-screen or mid-sweep (indeterminate progress, shimmer) — the reset parks it on that frame (`07` → `#reduced-motion-off-screen`).
8. **Animate `transform` and `opacity`.** Move a layer, don't repaint (Skeleton shimmer moved from `background-position` to a transformed pseudo-element). Pause off-screen timers.
9. **`@ds/motion` is a guest on the page.** It never changes GSAP's global defaults and only kills its own tweens.
10. **Motion is never the only signal.** Cart state, counts and screen-reader announcements happen without the animation; `flyToCart`/`bump` resolve as no-ops when motion is off.

---

## Using `@ds/motion`

```ts
import '@ds/tokens/css';
import '@ds/motion/css';                          // hero entrance + page transitions
import { reveal, createFlip, flyToCart, bump, getMotionLevel } from '@ds/motion';
import { useReveal, useFlip } from '@ds/motion/react';
```

Declare reveals in markup, then wire a root once (`reveal(root)` or `useReveal()`):

| Attribute | Effect |
|-----------|--------|
| `data-motion="reveal"` | Rises and fades in when scrolled into view |
| `data-motion="stagger"` | Direct children rise in turn, each as it enters (`data-motion-stagger="tight|normal|loose"`) |
| `data-motion="split"` | A static headline's lines rise out of a mask |
| `data-motion="media"` | An image frame settles in |
| `data-motion="parallax"` | Image drifts against the scroll — fine pointer, ≥768px only |
| `data-motion="hero"` | CSS-only first-paint entrance (needs `@ds/motion/css`) |

- **FLIP:** `const { ref, capture } = useFlip()`; call `capture()` right before the state change that reorders items.
- **Fly-to-cart:** `flyToCart(imageEl)` arcs a copy into the first on-screen `[data-motion-cart-target]` (the Header's cart button carries it).
- **When:** IntersectionObserver decides *when*, GSAP core does *how*. ScrollTrigger is only for scrubbed (scroll-linked) effects.
- GSAP is a dependency of `@ds/motion` only and is marked `external` in its build, so the consumer's bundler splits it into lazy chunks. Never bundle it into a package.

---

## Checking motion

- Workbench → Foundations → **Motion** shows every token and demo; the toolbar's **Motion off** and **Replay** test the off switch and entrances.
- Judge motion by sampled numbers (opacity/transform/position per frame), not screenshots — that is how the L-shaped fly-to-cart path and off-screen staggers were found (`07` → `#sample-motion`).
- Measure cost on a throttled phone: LCP within noise, zero layout shift, no long tasks (round 4 numbers are in `12`).

Open motion decisions (double cart bounce, phone fly-to-cart, Countdown announcements, sliding Tabs underline) are in `12-audit-2026-09-25.md` → "Open after five rounds".
