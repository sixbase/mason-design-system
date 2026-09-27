/**
 * React bindings for @ds/motion.
 *
 *   const ref = useReveal<HTMLDivElement>();
 *   <div ref={ref}>…<section data-motion="reveal">…</section></div>
 *
 *   const { ref, capture } = useFlip<HTMLUListElement>();
 *   onChange={(v) => { capture(); setSort(v); }}   // animates after commit
 *
 * Effects run after hydration, so GSAP never touches server-rendered markup
 * before React has claimed it (avoids hydration mismatches on inline styles).
 */
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { createFlip } from './flip';
import type { FlipController } from './flip';
import { reveal } from './reveal';
import type { RevealOptions } from './reveal';

// useLayoutEffect warns during SSR; it is only needed in the browser.
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Reveal every `[data-motion]` element inside the returned ref (and the ref
 * itself) — including ones rendered later, while the component is mounted.
 * The ref must stay on the same element for the component's lifetime.
 */
export function useReveal<T extends HTMLElement = HTMLElement>(options?: RevealOptions): RefObject<T> {
  const ref = useRef<T>(null);
  const offset = options?.offset;
  useEffect(() => {
    if (!ref.current) return undefined;
    return reveal(ref.current, { offset });
  }, [offset]);
  return ref;
}

export interface UseFlipResult<T extends HTMLElement> {
  ref: RefObject<T>;
  /** Call right before the state update that rearranges the items. */
  capture: () => void;
}

/**
 * FLIP-animate `[data-flip-id]` descendants of the ref whenever `capture()`
 * precedes a render of THIS component. Items rendered through a portal
 * aren't descendants — put the ref on the portal's own list element.
 */
export function useFlip<T extends HTMLElement = HTMLElement>(selector?: string): UseFlipResult<T> {
  const ref = useRef<T>(null);
  const controller = useRef<FlipController | null>(null);
  const armed = useRef(false);

  useEffect(() => {
    if (!ref.current) return undefined;
    const flip = createFlip(ref.current, selector);
    controller.current = flip;
    return () => {
      flip.dispose();
      controller.current = null;
    };
  }, [selector]);

  // No deps on purpose: after EVERY commit, play if a capture is pending.
  useIsomorphicLayoutEffect(() => {
    if (!armed.current) return;
    armed.current = false;
    controller.current?.play();
  });

  const capture = useCallback(() => {
    controller.current?.capture();
    armed.current = true;
  }, []);

  return { ref, capture };
}

export { bump, flyToCart } from './commerce';
export { enter } from './reveal';
export { getMotionLevel } from './env';
