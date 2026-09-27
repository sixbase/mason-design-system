/**
 * Lazy GSAP loader.
 *
 * Nothing here runs at import time. The first call to `loadGsap()` fetches
 * GSAP core (~28KB gz) as its own chunk, registers the design-system eases,
 * and memoizes the promise — every later caller shares it. A failed fetch
 * (offline, or a chunk removed by a newer deploy) is forgotten, so the next
 * call tries again instead of failing forever.
 *
 * The GSAP instance is shared with the rest of the page. A store that also
 * uses GSAP directly must not inherit our choices, so this module never
 * touches global state — no gsap.defaults(), no ticker.lagSmoothing().
 * Every tween here passes its own duration and ease; the only global
 * additions are the namespaced `ds.*` eases and the plugins we use.
 *
 * Plugins are separate chunks fetched only by the feature that needs them:
 *
 *   Flip          ~10KB gz  — layout transitions (filter / sort / remove)
 *   SplitText     ~4KB gz   — line-mask headline reveals
 *   ScrollTrigger ~18KB gz  — scroll-scrubbed parallax, desktop only
 *
 * Scroll-triggered reveals deliberately do NOT use ScrollTrigger: a native
 * IntersectionObserver decides *when*, GSAP only decides *how*. That keeps
 * the most common motion on phones at core-only weight with zero scroll
 * listeners on the main thread.
 */
import { motion } from '@ds/tokens';
import type { gsap as GsapInstance } from 'gsap';
import type { Flip as FlipPlugin } from 'gsap/Flip';
import type { ScrollTrigger as ScrollTriggerPlugin } from 'gsap/ScrollTrigger';
import type { SplitText as SplitTextPlugin } from 'gsap/SplitText';
import { cubicBezier } from './bezier';

export type Gsap = typeof GsapInstance;

/** Ease names registered on GSAP — `ease: 'ds.emphasized'` etc. */
export const ease = {
  standard: 'ds.default',
  emphasized: 'ds.emphasized',
  emphasizedIn: 'ds.emphasized-in',
  glide: 'ds.glide',
  spring: 'ds.spring',
} as const;

/** Token durations in seconds (GSAP's unit) */
export const duration = {
  fast: motion.duration.fast / 1000,
  normal: motion.duration.normal / 1000,
  slow: motion.duration.slow / 1000,
  slower: motion.duration.slower / 1000,
  slowest: motion.duration.slowest / 1000,
} as const;

/** Token staggers in seconds */
export const stagger = {
  tight: motion.stagger.tight / 1000,
  normal: motion.stagger.normal / 1000,
  loose: motion.stagger.loose / 1000,
} as const;

export const distance = motion.distance;

/**
 * Longest a cascade may hold back its last item. Twenty cards entering at
 * once would otherwise leave on-screen content blank for over a second.
 */
export const MAX_CASCADE = duration.slower;

/** A per-item stagger, tightened so `count` items all start within MAX_CASCADE. */
export function spread(each: number, count: number): number {
  return count > 1 ? Math.min(each, MAX_CASCADE / (count - 1)) : each;
}

/** Memoize a loader, but drop a rejected promise so a later call can retry. */
function memo<T>(load: () => Promise<T>): () => Promise<T> {
  let promise: Promise<T> | null = null;
  return () => {
    if (!promise) {
      promise = load();
      promise.catch(() => {
        promise = null;
      });
    }
    return promise;
  };
}

export const loadGsap: () => Promise<Gsap> = memo(() =>
  import('gsap').then(({ gsap }) => {
    for (const [name, points] of Object.entries(motion.easing)) {
      gsap.registerEase(`ds.${name}`, cubicBezier(...points));
    }
    return gsap;
  }),
);

export const loadFlip: () => Promise<typeof FlipPlugin> = memo(() =>
  Promise.all([loadGsap(), import('gsap/Flip')]).then(([gsap, { Flip }]) => {
    gsap.registerPlugin(Flip);
    return Flip;
  }),
);

export const loadSplitText: () => Promise<typeof SplitTextPlugin> = memo(() =>
  Promise.all([loadGsap(), import('gsap/SplitText')]).then(([gsap, { SplitText }]) => {
    gsap.registerPlugin(SplitText);
    return SplitText;
  }),
);

export const loadScrollTrigger: () => Promise<typeof ScrollTriggerPlugin> = memo(() =>
  Promise.all([loadGsap(), import('gsap/ScrollTrigger')]).then(([gsap, { ScrollTrigger }]) => {
    gsap.registerPlugin(ScrollTrigger);
    return ScrollTrigger;
  }),
);
