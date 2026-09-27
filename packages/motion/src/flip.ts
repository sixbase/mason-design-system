/**
 * FLIP layout transitions — for changes that rearrange a set of items:
 * filtering, sorting, removing a cart line, switching grid ↔ list.
 *
 *   const flip = createFlip(gridEl);          // items carry data-flip-id
 *   flip.capture();                            // 1. record positions
 *   applyFilter();                             // 2. change the DOM
 *   flip.play();                               // 3. glide from old → new
 *
 * Staying items glide to their new slots, entering items fade up, and
 * leaving items fade out from where they were. Leaving items need special
 * handling because frameworks (React) remove them from the DOM before we
 * can animate: we keep a reference at capture time and, after the change,
 * animate a detached *copy* over the old position. The copy is inert and
 * aria-hidden, so it never reaches assistive tech or the tab order.
 *
 * Interrupting is safe: a capture() during a running flip records what the
 * visitor sees right now, and the new flip continues from there.
 *
 * The Flip plugin is fetched during idle time on creation, so the first
 * interaction animates. If it hasn't arrived yet, the change just happens
 * instantly — never delayed. The same goes for a visitor who turns on
 * reduced motion after the page loaded.
 */
import { getMotionLevel, whenIdle } from './env';
import { distance, duration, ease, loadFlip, loadGsap, spread, stagger } from './gsap';
import type { Gsap } from './gsap';
import { ghostsOf } from './ghost';

export interface FlipController {
  /** Record the current layout. Call immediately before the DOM changes. */
  capture(): void;
  /** Animate from the captured layout to the current one. Call after the DOM has changed. */
  play(): void;
  /** Finish in-flight animations (items end in their CSS state) and remove any leave copies. */
  dispose(): void;
  /**
   * Resolves once the Flip plugin has loaded and capture/play will animate
   * — or once loading has failed, in which case they stay instant. Changes
   * made before then simply happen instantly — never delayed.
   */
  ready: Promise<void>;
}

type FlipPlugin = Awaited<ReturnType<typeof loadFlip>>;
type FlipState = ReturnType<FlipPlugin['getState']>;

interface Snapshot {
  state: FlipState;
  items: Array<{ el: HTMLElement; rect: DOMRect; opacity: string }>;
}

const noopController: FlipController = { capture() {}, play() {}, dispose() {}, ready: Promise.resolve() };

/**
 * The z-index a container competes with at the page root. A leave copy
 * lives on <body>, so it borrows this to layer where the item did — above
 * a drawer's panel when the list is in a cart drawer, below a sticky
 * header when the list is on the page.
 */
function rootZ(el: Element): string {
  let z = 'auto';
  for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
    const v = getComputedStyle(n).zIndex;
    if (v && v !== 'auto') z = v;
  }
  return z;
}

export function createFlip(container: HTMLElement, selector = '[data-flip-id]'): FlipController {
  const level = getMotionLevel();
  if (level !== 'full') return noopController;

  let Flip: FlipPlugin | null = null;
  let gsap: Gsap | null = null;
  let snapshot: Snapshot | null = null;
  let active: { progress(value: number): { kill(): unknown } } | null = null;
  let disposed = false;
  const ghosts = new Set<HTMLElement>();

  const ready = whenIdle()
    .then(() => Promise.all([loadGsap(), loadFlip()]))
    .then(([g, f]) => {
      gsap = g;
      Flip = f;
    })
    .catch(() => {}); // offline or a stale chunk: changes stay instant

  const query = () =>
    Array.from(container.querySelectorAll<HTMLElement>(selector)).filter((el) => !el.closest('[data-motion-ghost]'));

  // Every leaving item at once: the copies are made in one batch (one
  // layout) and faded by ONE tween. GSAP reads each target's transform as a
  // tween starts, so a tween per copy interleaved those reads with the
  // previous tween's writes — a forced layout per removed card, all inside
  // the shopper's click. Same duration and ease for all, so it looks the same.
  const leave = (gone: Snapshot['items'], zIndex: string) => {
    const g = gsap;
    if (!g) return;
    // Only items the shopper could see get a copy. On a phone most of a
    // filtered grid is off-screen: copying every removed card deep-cloned
    // ~30 cards inside the tap to fade ones nobody was looking at.
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const shown = gone.filter(
      ({ rect }) => (rect.width !== 0 || rect.height !== 0) && rect.bottom > 0 && rect.right > 0 && rect.top < vh && rect.left < vw,
    );
    if (!shown.length) return;
    const copies = ghostsOf(
      shown.map(({ el, rect }) => ({ source: el, rect })),
      zIndex,
    );
    copies.forEach((ghost) => {
      ghost.dataset.flipGhost = '';
      ghosts.add(ghost);
    });
    const drop = () =>
      copies.forEach((ghost) => {
        ghost.remove();
        ghosts.delete(ghost);
      });
    g.fromTo(
      copies,
      // An item removed mid-fade (an interrupted flip) leaves from the opacity it had.
      { opacity: (i: number) => (shown[i]!.opacity === '' ? 1 : parseFloat(shown[i]!.opacity)) },
      { opacity: 0, scale: 0.96, duration: duration.normal, ease: ease.emphasizedIn, onComplete: drop, onInterrupt: drop },
    );
  };

  return {
    ready,
    capture() {
      if (disposed || !Flip || getMotionLevel() !== 'full') {
        snapshot = null;
        return;
      }
      const items = query();
      // Rects first: getState() pushes a flip that's still running to its
      // end, and a leaving item must fade from where the visitor saw it.
      const seen = items.map((el) => ({ el, rect: el.getBoundingClientRect(), opacity: el.style.opacity }));
      // simple: positions from the rects alone. Without it Flip builds each
      // item's global matrix with temporary elements — a forced layout per
      // item (~25ms for 48 cards on a 4× throttled phone), all inside the
      // tap. play() already animates with simple: true (no rotated or
      // scaled ancestors), so the two halves agree.
      snapshot = { state: Flip.getState(items, { simple: true }), items: seen };
    },
    play() {
      if (disposed || !Flip || !gsap || !snapshot) return;
      const { state, items } = snapshot;
      snapshot = null;
      const g = gsap;

      const gone = items.filter(({ el }) => !el.isConnected || !container.contains(el));
      if (gone.length) leave(gone, rootZ(container));

      const current = query();
      // Filtered down to nothing (the empty state replaced the grid): the
      // leaving copies above are the whole animation. Flip.from() with no
      // targets logged "GSAP target not found" on every zero-result filter.
      if (!current.length) return;
      active = Flip.from(state, {
        targets: current,
        duration: duration.slower,
        ease: ease.glide,
        simple: true,
        prune: true,
        stagger: spread(stagger.tight / 2, current.length),
        onEnter: (entering) =>
          g.fromTo(
            entering,
            { opacity: 0, y: distance.md },
            {
              opacity: 1,
              y: 0,
              duration: duration.slower,
              ease: ease.emphasized,
              stagger: spread(stagger.tight, entering.length),
            },
          ),
        onComplete: () => {
          active = null;
          g.set(current, { clearProps: 'transform,opacity' });
          current.forEach((el) => el.getAttribute('style') === '' && el.removeAttribute('style'));
        },
      });
    },
    dispose() {
      disposed = true;
      snapshot = null;
      // Finish rather than freeze: an item stopped mid-glide would keep its
      // transform. Only our own timeline — never other tweens on the items.
      active?.progress(1).kill();
      active = null;
      ghosts.forEach((ghost) => ghost.remove());
      ghosts.clear();
    },
  };
}
