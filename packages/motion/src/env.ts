/**
 * Motion budget for the current visitor.
 *
 * - `full`    — animate.
 * - `reduced` — the OS asks for reduced motion. No travel, no scale, no
 *               parallax; state changes may still cross-fade.
 * - `off`     — no JS motion at all, and GSAP is never downloaded:
 *               Save-Data is on, the connection is 2G-class, the page
 *               opted out with <html data-motion="off">, or there is no
 *               DOM (SSR).
 *
 * Content is never hidden before this check runs, so `off` costs nothing:
 * the page simply renders as authored.
 */
export type MotionLevel = 'full' | 'reduced' | 'off';

interface NetworkInformationLike extends Partial<EventTarget> {
  saveData?: boolean;
  effectiveType?: string;
}

const REDUCE = '(prefers-reduced-motion: reduce)';

const connectionOf = () => (navigator as Navigator & { connection?: NetworkInformationLike }).connection;

export function getMotionLevel(): MotionLevel {
  if (typeof window === 'undefined' || typeof document === 'undefined') return 'off';
  if (document.documentElement.dataset.motion === 'off') return 'off';

  const connection = connectionOf();
  if (connection?.saveData) return 'off';
  if (connection?.effectiveType && /(^|-)2g$/.test(connection.effectiveType)) return 'off';

  if (typeof window.matchMedia === 'function' && window.matchMedia(REDUCE).matches) {
    return 'reduced';
  }
  return 'full';
}

/**
 * Call `onChange` when the motion level changes mid-session: the visitor
 * turns on reduced motion, the page opts out (<html data-motion="off">,
 * e.g. a "pause animations" toggle), or the connection drops to Save-Data
 * or 2G. Returns an unsubscribe.
 *
 * Anything that has hidden content or is mid-animation must listen: a
 * preference that arrives after setup still has to be honoured.
 */
export function watchMotionLevel(onChange: (level: MotionLevel) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  let last = getMotionLevel();
  const check = () => {
    const next = getMotionLevel();
    if (next === last) return;
    last = next;
    onChange(next);
  };
  const mql = typeof window.matchMedia === 'function' ? window.matchMedia(REDUCE) : null;
  mql?.addEventListener?.('change', check);
  const mo = typeof MutationObserver === 'function' ? new MutationObserver(check) : null;
  mo?.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });
  const connection = connectionOf();
  connection?.addEventListener?.('change', check);
  return () => {
    mql?.removeEventListener?.('change', check);
    mo?.disconnect();
    connection?.removeEventListener?.('change', check);
  };
}

/** Fine pointer + tablet-and-up: where scroll-linked effects (parallax) are worth their cost. */
export function isRichPointer(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(min-width: 768px) and (pointer: fine)').matches;
}

/**
 * Resolve once the page has loaded and the browser is idle, so motion
 * setup never competes with first render or the LCP image for bandwidth.
 * Each wait is capped at `timeout` ms. Safari has no requestIdleCallback;
 * there the load event alone is the signal.
 */
export function whenIdle(timeout = 1200): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve();
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number })
      .requestIdleCallback;
    let started = false;
    const idle = () => {
      if (started) return;
      started = true;
      if (ric) ric(() => resolve(), { timeout });
      else setTimeout(resolve, 1);
    };
    if (document.readyState === 'complete') return idle();
    window.addEventListener('load', idle, { once: true });
    setTimeout(idle, timeout);
  });
}
