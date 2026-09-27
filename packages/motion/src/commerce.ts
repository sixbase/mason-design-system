/**
 * Commerce moments — the two animations that tell a shopper "that worked".
 *
 * flyToCart(source)  A copy of the product image lifts off and arcs into
 *                    the cart icon, which then bumps. The cart target is
 *                    the first on-screen element with
 *                    `data-motion-cart-target` (the Header's cart button
 *                    carries it; a page may render more than one header).
 * bump(el)           A small spring pulse — for a cart count that changed.
 *                    Repeated calls restart the pulse; they never stack.
 *
 * Both are pure decoration: the cart state, the count, and the screen
 * reader announcement all happen without them. They resolve immediately
 * (no-op) under reduced motion, Save-Data, when GSAP can't load, or when
 * the cart is missing or scrolled off-screen. With the cart visible but
 * the source image off-screen or not yet loaded, only the cart bumps.
 */
import { getMotionLevel } from './env';
import { duration, ease, loadGsap } from './gsap';
import type { Gsap } from './gsap';
import { ghostOf } from './ghost';

function onScreen(r: DOMRect): boolean {
  return r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 && r.top < window.innerHeight && r.left < window.innerWidth;
}

function visibleArea(r: DOMRect, clip: DOMRect): number {
  const w = Math.min(r.right, clip.right, window.innerWidth) - Math.max(r.left, clip.left, 0);
  const h = Math.min(r.bottom, clip.bottom, window.innerHeight) - Math.max(r.top, clip.top, 0);
  return w > 0 && h > 0 ? w * h : 0;
}

function cartTarget(): Element | null {
  const all = Array.from(document.querySelectorAll('[data-motion-cart-target]'));
  return all.find((el) => onScreen(el.getBoundingClientRect())) ?? all[0] ?? null;
}

/**
 * The image to fly: the one the shopper is looking at. For a container,
 * that's its most visible <img> (a gallery's main image, not a thumbnail
 * or a slide scrolled out of view); failing that, the container itself.
 */
function visualOf(source: Element): Element {
  if (source instanceof HTMLImageElement) return source;
  const clip = source.getBoundingClientRect();
  let best: Element = source;
  let bestArea = 0;
  for (const img of Array.from(source.querySelectorAll('img')).slice(0, 24)) {
    const area = visibleArea(img.getBoundingClientRect(), clip);
    if (area > bestArea) {
      best = img;
      bestArea = area;
    }
  }
  return best;
}

/** The running pulse per element — a new bump() finishes the old one's promise and takes over. */
const pulses = new WeakMap<Element, () => void>();

export async function bump(el: Element | null | undefined): Promise<void> {
  if (!el || getMotionLevel() !== 'full') return;
  let gsap: Gsap;
  try {
    gsap = await loadGsap();
  } catch {
    return;
  }
  pulses.get(el)?.();
  await new Promise<void>((resolve) => {
    let superseded = false;
    const end = () => {
      if (pulses.get(el) === takeOver) pulses.delete(el);
      // A superseding pulse carries on from the current scale and clears at its own end.
      if (!superseded) {
        gsap.set(el, { clearProps: 'transform' });
        if (el.getAttribute('style') === '') el.removeAttribute('style');
      }
      resolve();
    };
    // Absolute values (1.18 → 1), so a pulse restarted mid-flight never compounds.
    const tl = gsap
      .timeline({ onComplete: end, onInterrupt: end })
      .to(el, { scale: 1.18, duration: duration.fast, ease: ease.emphasized })
      .to(el, { scale: 1, duration: duration.slower, ease: ease.spring });
    const takeOver = () => {
      superseded = true;
      tl.kill();
    };
    pulses.set(el, takeOver);
  });
}

export async function flyToCart(
  source: Element | null | undefined,
  target: Element | null = typeof document === 'undefined' ? null : cartTarget(),
): Promise<void> {
  if (!source || !target || getMotionLevel() !== 'full') return;

  let gsap: Gsap;
  try {
    gsap = await loadGsap();
  } catch {
    return;
  }
  // Measure after the (first-use) download: the page may have scrolled.
  const to = target.getBoundingClientRect();
  if (!onScreen(to)) return; // a cart scrolled away can't be seen landing or bumping
  const visual = visualOf(source);
  const from = visual.getBoundingClientRect();
  // An image that hasn't loaded would fly as an empty, shadowed box.
  const unloaded = visual instanceof HTMLImageElement && (!visual.complete || visual.naturalWidth === 0);
  if (!onScreen(from) || unloaded) {
    await bump(target);
    return;
  }

  // Photos usually get their rounding from a clipping frame, not the img.
  const ownRadius = getComputedStyle(visual).borderRadius;
  const frameRadius = visual.parentElement ? getComputedStyle(visual.parentElement).borderRadius : '';
  const radius = ownRadius && ownRadius !== '0px' ? ownRadius : frameRadius || 'var(--radius-md)';
  const ghost = ghostOf(visual, from, 'var(--z-index-toast)');
  gsap.set(ghost, { borderRadius: radius, objectFit: 'cover', transformOrigin: '50% 50%' });
  ghost.style.setProperty('box-shadow', 'var(--elevation-modal)');

  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  const endScale = Math.min(Math.max(to.width / from.width, 0.06), 0.3);
  const travel = duration.slowest;

  // The arc: vertical motion front-loads (emphasized) while horizontal
  // motion eases in and out (glide), so the copy lifts first, curves
  // across and settles into the cart — a toss, not a slide. Measured on a
  // phone, halfway through the flight the copy is 93% of the way up and
  // 28% across, 88% across at three quarters. (It used power2.in, which is
  // not a token: 6% and 34% — the copy shot up and then slid along the
  // header, an L rather than an arc.) Scale front-loads too: a large PDP image becomes
  // thumbnail-sized in the first beat instead of a full-size photo
  // sweeping across the page.
  await new Promise<void>((resolve) => {
    const done = () => {
      ghost.remove();
      resolve();
    };
    gsap
      // onInterrupt: if anything kills the timeline, the copy must not stay on screen.
      .timeline({ onComplete: done, onInterrupt: done })
      .to(ghost, { scale: 1.04, duration: duration.fast, ease: ease.emphasized })
      .to(ghost, { y: dy, duration: travel, ease: ease.emphasized })
      .to(ghost, { x: dx, duration: travel, ease: ease.glide }, '<')
      .to(ghost, { scale: endScale, duration: travel, ease: ease.emphasized }, '<')
      .to(ghost, { opacity: 0, duration: duration.fast, ease: ease.emphasizedIn }, `>-${duration.fast}`);
  });

  await bump(target);
}
