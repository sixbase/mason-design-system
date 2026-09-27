/**
 * Scroll reveals, declared in markup:
 *
 *   data-motion="reveal"    the element rises and fades in
 *   data-motion="stagger"   its direct children rise in sequence — each
 *                           child as IT scrolls in, so a grid or a stack
 *                           taller than the screen (a phone) reveals row by
 *                           row; children arriving together cascade in
 *                           reading order
 *   data-motion="split"     a heading's lines rise out of a mask
 *                           (static text only — see unsplit() below)
 *   data-motion="media"     an image frame settles in (scale + fade)
 *   data-motion="parallax"  an image drifts against the scroll
 *                           (fine pointer, ≥768px only; frame must clip)
 *
 * Optional: data-motion-stagger="tight|normal|loose" on a stagger group.
 *
 * The contract that keeps this safe on slow phones:
 *
 * 1. Nothing is hidden by CSS or before GSAP has loaded. If the script
 *    never arrives, the page is simply static.
 * 2. Only elements fully BELOW the fold at setup time are hidden. What the
 *    visitor can already see never blinks out. Above-the-fold entrance is
 *    CSS-only (data-motion="hero" in motion.css) so it runs at first paint.
 * 3. Hidden means opacity only — never visibility/display — so content
 *    stays in the accessibility tree and focusable. Focusing into hidden
 *    content, or printing, reveals it immediately.
 * 4. Every inline style GSAP writes is cleared when the reveal finishes,
 *    so the element ends in exactly the state its CSS describes. Tweens
 *    run to the element's own resting opacity and transform, so there is
 *    no jump at the end for an element authored at, say, 61.8% opacity.
 * 5. A preference that arrives mid-session (reduced motion switched on,
 *    <html data-motion="off">, Save-Data) reveals everything at once and
 *    stops listening. If anything fails after hiding, the same happens.
 *
 * Content that arrives later — a React re-render, a "load more" page — is
 * picked up automatically while reveal() is active: new [data-motion]
 * nodes fully below the fold get the same treatment, and nodes removed
 * before they revealed are released (no leaked references).
 */
import { getMotionLevel, isRichPointer, watchMotionLevel, whenIdle } from './env';
import { MAX_CASCADE, distance, duration, ease, loadGsap, loadScrollTrigger, loadSplitText, spread, stagger } from './gsap';
import type { Gsap } from './gsap';

// 'item' is internal: one child of a stagger group that reveal() hides and
// reveals on its own. It never appears in markup.
type Kind = 'reveal' | 'stagger' | 'split' | 'media' | 'parallax' | 'item';
type EnterKind = Exclude<Kind, 'parallax' | 'item'>;
const KINDS = new Set<string>(['reveal', 'stagger', 'split', 'media', 'parallax']);

const noop = () => {};

function kindOf(el: HTMLElement): Kind | null {
  const k = el.dataset.motion;
  return k && KINDS.has(k) ? (k as Kind) : null;
}

function isBelowFold(el: HTMLElement, viewportHeight: number): boolean {
  const r = el.getBoundingClientRect();
  // display:none / collapsed panels report a zero rect — leave them alone
  if (r.width === 0 && r.height === 0) return false;
  return r.top >= viewportHeight;
}

/** Delay for the i-th element entering together — capped, see MAX_CASCADE. */
const cascade = (i: number) => Math.min(i * stagger.normal, MAX_CASCADE);

function staggerFor(el: HTMLElement): number {
  const s = el.dataset.motionStagger;
  return s === 'tight' || s === 'loose' ? stagger[s] : stagger.normal;
}

/** Hidden-state tween targets for each kind. */
function partsOf(el: HTMLElement, kind: Kind): HTMLElement[] {
  return kind === 'stagger' ? (Array.from(el.children) as HTMLElement[]) : [el];
}

/** What a hidden element returns to: the parts we touched, their resting opacity, and any authored inline style. */
interface Rest {
  parts: HTMLElement[];
  opacity: number[];
  inline: Array<[opacity: string, transform: string]>;
}
const rests = new WeakMap<HTMLElement, Rest>();

/**
 * Stagger groups that reveal() runs child by child: the group → its
 * children still hidden or animating, and each such child → its group.
 * The group reads `done` once the last child has settled.
 */
const groupItems = new WeakMap<HTMLElement, Set<HTMLElement>>();
const itemGroup = new WeakMap<HTMLElement, HTMLElement>();

/** Read an element's resting state. Measure every target before hiding any — reads, then writes. */
function measure(el: HTMLElement, kind: Kind): Rest {
  const parts = partsOf(el, kind);
  return {
    parts,
    opacity: parts.map((p) => {
      const o = parseFloat(getComputedStyle(p).opacity);
      return Number.isFinite(o) ? o : 1;
    }),
    inline: parts.map((p) => [p.style.opacity, p.style.transform]),
  };
}

// Offsets are relative (+= / *=), so an authored transform (a centring
// translate, a tilt) is carried through the animation rather than lost.
function hide(gsap: Gsap, el: HTMLElement, kind: Kind, rest: Rest) {
  rests.set(el, rest);
  const { parts } = rest;
  if (parts.length) {
    if (kind === 'reveal') gsap.set(parts, { opacity: 0, y: `+=${distance.lg}` });
    else if (kind === 'stagger' || kind === 'item') gsap.set(parts, { opacity: 0, y: `+=${distance.md}` });
    else if (kind === 'media') gsap.set(parts, { opacity: 0, scale: '*=1.04' });
    // split: only the opacity — its lines rise inside their masks later
    else gsap.set(parts, { opacity: 0 });
  }
  el.dataset.motionState = 'pending';
}

/** Undo everything GSAP wrote — the element returns to its authored CSS. */
function settle(gsap: Gsap, el: HTMLElement, kind: Kind) {
  const rest = rests.get(el);
  rests.delete(el);
  // The parts hidden at setup plus the current ones: children may have
  // been swapped by a re-render in between.
  const parts = [...new Set([...(rest?.parts ?? []), ...partsOf(el, kind)])];
  if (parts.length) gsap.set(parts, { clearProps: 'opacity,transform' });
  rest?.parts.forEach((p, i) => {
    const [opacity, transform] = rest.inline[i] ?? ['', ''];
    if (opacity) p.style.opacity = opacity;
    if (transform) p.style.transform = transform;
  });
  parts.forEach((p) => {
    if (p.getAttribute('style') === '') p.removeAttribute('style');
  });
  el.dataset.motionState = 'done';
  const group = itemGroup.get(el);
  if (group) {
    itemGroup.delete(el);
    const left = groupItems.get(group);
    left?.delete(el);
    if (!left?.size) {
      groupItems.delete(group);
      group.dataset.motionState = 'done';
    }
  }
}

type SplitTextPlugin = Awaited<ReturnType<typeof loadSplitText>>;
type SplitInstance = ReturnType<SplitTextPlugin['create']>;

/**
 * Record a subtree's node objects so they can be put back after a split.
 * `mark()` notes what SplitText left in each text node, so text a
 * framework changed while the lines animated is kept, not overwritten.
 */
function keepNodes(root: HTMLElement) {
  const children = new Map<ParentNode, ChildNode[]>();
  const text = new Map<CharacterData, string>();
  const walk = (node: ParentNode) => {
    const kids = Array.from(node.childNodes);
    children.set(node, kids);
    for (const kid of kids) {
      if (kid.nodeType === Node.TEXT_NODE) text.set(kid as CharacterData, (kid as CharacterData).data);
      else if (kid.nodeType === Node.ELEMENT_NODE) walk(kid as Element);
    }
  };
  walk(root);
  let left: Map<CharacterData, string> | null = null;
  return {
    mark() {
      left = new Map(Array.from(text.keys(), (node) => [node, node.data]));
    },
    restore() {
      text.forEach((data, node) => {
        if (!left || node.data === left.get(node)) node.data = data;
      });
      children.forEach((kids, parent) => parent.replaceChildren(...kids));
    },
  };
}

/**
 * Undo a split without breaking whoever owns the heading's DOM.
 *
 * SplitText's revert() rebuilds the element from an HTML string. That
 * orphans every node a framework holds (React would go on updating text
 * nodes that are no longer on the page, so the heading silently stops
 * changing), and it would overwrite content replaced while the lines
 * animated. So: lines still there → put the original node objects back;
 * content replaced meanwhile → keep the replacement.
 *
 * Not covered: a framework adding or removing a heading's CHILD ELEMENTS
 * during the ~1s the lines animate — its nodes are inside our line
 * wrappers then. Use data-motion="split" on static headline text.
 */
function unsplit(el: HTMLElement, split: SplitInstance, nodes: ReturnType<typeof keepNodes>) {
  const intact = split.lines.length > 0 && split.lines.every((line) => el.contains(line));
  const replacement = intact ? null : Array.from(el.childNodes);
  split.revert(); // also restores aria-label / aria-hidden and disconnects observers
  if (replacement) el.replaceChildren(...replacement);
  else nodes.restore();
}

/** How long a split heading waits for web fonts before fading in unsplit instead. */
const FONT_WAIT = duration.slowest * 1000;

/**
 * Animations in flight, by element — so a replay, a teardown, a print, or
 * a preference change can end one cleanly: tween killed, split undone,
 * styles cleared, promise resolved. Holds each element only while it
 * animates.
 */
const running = new Map<HTMLElement, { owner: object | null; stop(): void }>();

/**
 * Animate one hidden element to its resting state. Shared by the scroll
 * observer (reveal) and the imperative API (enter). Resolves when settled.
 */
function animateIn(
  gsap: Gsap,
  SplitText: SplitTextPlugin | null,
  el: HTMLElement,
  kind: Kind,
  delay: number,
  owner: object | null = null,
): Promise<void> {
  el.dataset.motionState = 'running';
  const rest = rests.get(el) ?? measure(el, kind);
  const { parts, opacity } = rest;

  return new Promise<void>((resolve) => {
    let tween: { kill(): unknown } | null = null;
    let split: { st: SplitInstance; nodes: ReturnType<typeof keepNodes> } | null = null;
    let ended = false;
    const stop = () => {
      if (ended) return;
      ended = true;
      running.delete(el);
      tween?.kill();
      if (split) unsplit(el, split.st, split.nodes);
      settle(gsap, el, kind);
      resolve();
    };
    running.set(el, { owner, stop });
    if (!parts.length) return stop();

    const to = (vars: Record<string, unknown>) => {
      if (ended || tween) return;
      tween = gsap.to(parts, {
        opacity: (i: number) => opacity[i] ?? 1,
        duration: duration.slowest,
        ease: ease.emphasized,
        delay,
        onComplete: stop,
        ...vars,
      });
    };

    if (kind === 'reveal') to({ y: `-=${distance.lg}` });
    else if (kind === 'stagger') {
      to({ y: `-=${distance.md}`, duration: duration.slower, stagger: spread(staggerFor(el), parts.length) });
    } else if (kind === 'item') to({ y: `-=${distance.md}`, duration: duration.slower });
    else if (kind === 'media') to({ scale: '/=1.04' });
    else if (kind === 'split' && SplitText) {
      const splitNow = () => {
        if (ended || tween) return;
        const nodes = keepNodes(el);
        let st: SplitInstance;
        try {
          st = SplitText.create(el, { type: 'lines', mask: 'lines' });
        } catch {
          return to({});
        }
        nodes.mark();
        gsap.set(el, { opacity: opacity[0] ?? 1 });
        split = { st, nodes };
        tween = gsap.from(st.lines, {
          yPercent: 100,
          duration: duration.slowest,
          ease: ease.emphasized,
          delay,
          stagger: spread(stagger.normal, st.lines.length),
          onComplete: stop,
        });
      };
      // Line breaks depend on the final font metrics — but a heading the
      // visitor is looking at must not stay blank while a slow font loads.
      const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
      if (fonts?.status === 'loading') {
        const timer = setTimeout(() => to({}), FONT_WAIT);
        void fonts.ready.then(() => {
          clearTimeout(timer);
          splitNow();
        });
      } else splitNow();
    } else {
      // split without the plugin (it failed to load): a plain fade
      to({});
    }
  });
}

/**
 * Play an entrance right now, regardless of scroll position — for content
 * that arrives after load (an AJAX cart refresh, a "load more" page of
 * products, a demo's replay button). Calling it again on the same element
 * restarts the entrance; the earlier call's promise resolves. Resolves
 * immediately, with the content untouched, when motion is reduced or off
 * or GSAP can't be loaded.
 */
export async function enter(
  targets: HTMLElement | ArrayLike<HTMLElement> | null | undefined,
  kind: EnterKind = 'reveal',
): Promise<void> {
  if (!targets || getMotionLevel() !== 'full') return;
  const els = (targets instanceof HTMLElement ? [targets] : Array.from(targets)).filter(Boolean);
  if (!els.length) return;
  let gsap: Gsap;
  let SplitText: SplitTextPlugin | null;
  try {
    [gsap, SplitText] = await Promise.all([loadGsap(), kind === 'split' ? loadSplitText() : Promise.resolve(null)]);
  } catch {
    return; // decoration only — the content is already showing
  }
  if (getMotionLevel() !== 'full') return;

  // End a running entrance, and restore anything a reveal() is still
  // holding hidden — its resting opacity would otherwise read as 0.
  els.forEach((el) => {
    running.get(el)?.stop();
    if (rests.has(el)) settle(gsap, el, kind);
    // A stagger group reveal() is running child by child
    groupItems.get(el)?.forEach((item) => {
      running.get(item)?.stop();
      if (rests.has(item)) settle(gsap, item, 'item');
    });
  });
  const measured = els.map((el) => measure(el, kind));
  await Promise.all(
    els.map((el, i) => {
      hide(gsap, el, kind, measured[i]!);
      return animateIn(gsap, SplitText, el, kind, cascade(i));
    }),
  );
}

export interface RevealOptions {
  /**
   * Fraction of the viewport, measured up from the bottom edge, an element
   * must cross before it reveals. Default 0.08 — reveals start just as the
   * element clears the bottom 8% of the screen. Clamped to 0–0.5.
   */
  offset?: number;
}

/** "Wholly on screen", with room for sub-pixel rounding (a ratio of exactly 1 can be missed). */
const WHOLE = 0.98;

const PARALLAX_QUERY = '(min-width: 768px) and (pointer: fine) and (prefers-reduced-motion: no-preference)';

/**
 * Wire up every `[data-motion]` element inside `root`. Returns a cleanup
 * that restores all touched elements — call it on unmount.
 */
export function reveal(root: ParentNode = document, options: RevealOptions = {}): () => void {
  if (getMotionLevel() !== 'full') return noop;

  const scan = () => {
    const all = Array.from(root.querySelectorAll<HTMLElement>('[data-motion]'));
    if (root instanceof HTMLElement && root.dataset.motion) all.unshift(root);
    return all.filter((el) => kindOf(el) && !el.dataset.motionState);
  };
  // Nothing declared, nothing downloaded — and parallax alone is nothing on a phone.
  if (!scan().some((el) => kindOf(el) !== 'parallax' || isRichPointer())) return noop;

  const owner = {};
  let disposed = false;
  let teardown = noop;

  const run = async () => {
    await whenIdle();
    if (disposed) return;
    const hasSplit = scan().some((el) => kindOf(el) === 'split');
    let gsap: Gsap;
    let Split: SplitTextPlugin | null;
    try {
      [gsap, Split] = await Promise.all([loadGsap(), hasSplit ? loadSplitText() : Promise.resolve(null)]);
    } catch {
      return; // offline, or a chunk a newer deploy removed: the page stays static
    }
    if (disposed || getMotionLevel() !== 'full') return;

    const pending = new Map<HTMLElement, Kind>();
    let stopped = false;
    let io: IntersectionObserver | null = null;
    // Also reveals whatever is wholly on screen. A short element at the very
    // end of a page (a last line of copy, a "load more" button) can never
    // rise past the reveal line — the page can't scroll that far — and
    // stayed hidden for good.
    let whole: IntersectionObserver | null = null;
    let mo: MutationObserver | null = null;
    let mm: ReturnType<Gsap['matchMedia']> | null = null;
    let unwatch = noop;

    // Settle immediately — used for focus, print, removal, and teardown.
    const flush = (el: HTMLElement) => {
      const kind = pending.get(el);
      if (!kind) return;
      pending.delete(el);
      io?.unobserve(el);
      whole?.unobserve(el);
      // enter() may have taken the element over; it settles its own run.
      if (el.dataset.motionState === 'pending') settle(gsap, el, kind);
    };

    const play = (el: HTMLElement, delay: number) => {
      const kind = pending.get(el);
      if (!kind) return;
      pending.delete(el);
      if (el.dataset.motionState === 'pending') void animateIn(gsap, Split, el, kind, delay, owner);
    };

    const onFocus = (event: FocusEvent) => {
      const target = event.target as Node | null;
      if (target) pending.forEach((_, el) => el.contains(target) && flush(el));
    };
    const onPrint = () => {
      pending.forEach((_, el) => flush(el));
      running.forEach((r) => r.stop());
    };

    teardown = () => {
      if (stopped) return;
      stopped = true;
      unwatch();
      mo?.disconnect();
      io?.disconnect();
      whole?.disconnect();
      document.removeEventListener('focusin', onFocus);
      window.removeEventListener('beforeprint', onPrint);
      pending.forEach((_, el) => flush(el));
      running.forEach((r) => r.owner === owner && r.stop());
      mm?.revert();
    };

    try {
      // The observer exists BEFORE anything is hidden: if it can't be
      // created, nothing is hidden. Any later failure restores everything.
      const raw = Number(options.offset ?? 0.08);
      const offset = Number.isFinite(raw) ? Math.min(Math.max(raw, 0), 0.5) : 0.08;
      const onEntries = (entries: IntersectionObserverEntry[], wholly: boolean) => {
        // Everything entering in the same frame cascades in document order,
        // so a row of cards arrives in reading order (right-to-left in RTL)
        // instead of all at once. A stagger group's children step by the
        // group's own stagger; the whole batch starts within MAX_CASCADE.
        const entering = entries
          // The whole-view observer also reports partly visible targets
          // (on observe, and when leaving) — only a full view counts there.
          .filter((e) => e.isIntersecting && (!wholly || e.intersectionRatio >= WHOLE))
          .map((e) => e.target as HTMLElement)
          .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
        const steps = entering.map((el, i) => {
          if (!i) return 0;
          const group = itemGroup.get(el);
          return group ? staggerFor(group) : stagger.normal;
        });
        const total = steps.reduce((sum, s) => sum + s, 0);
        const fit = total > MAX_CASCADE ? MAX_CASCADE / total : 1;
        let delay = 0;
        entering.forEach((el, i) => {
          io?.unobserve(el);
          whole?.unobserve(el);
          delay += steps[i]! * fit;
          play(el, delay);
        });
      };
      io = new IntersectionObserver((entries) => onEntries(entries, false), {
        rootMargin: `0px 0px -${offset * 100}% 0px`,
      });
      whole = new IntersectionObserver((entries) => onEntries(entries, true), { threshold: WHOLE });
      unwatch = watchMotionLevel((level) => level !== 'full' && teardown());
      document.addEventListener('focusin', onFocus);
      window.addEventListener('beforeprint', onPrint);

      const prepare = (candidates: HTMLElement[]) => {
        // Measure AFTER the download — the visitor may have scrolled meanwhile.
        const vh = window.innerHeight;
        const chosen = new Map<HTMLElement, Kind>();
        const groups = new Map<HTMLElement, HTMLElement[]>();
        // Hidden or animating by any reveal() or enter() — the state attribute is the shared truth.
        // A stagger group run child by child hides nothing itself: its children say what's hidden.
        const OWNER = '[data-motion], [data-motion-state]';
        const hiddenAbove = (el: HTMLElement) => {
          for (let n = el.parentElement?.closest<HTMLElement>(OWNER); n; ) {
            const state = n.dataset.motionState;
            if (chosen.has(n) || ((state === 'pending' || state === 'running') && !groupItems.has(n))) return true;
            n = n.parentElement?.closest<HTMLElement>(OWNER);
          }
          return false;
        };
        for (const el of candidates) {
          const kind = kindOf(el);
          if (!kind || kind === 'parallax' || el.dataset.motionState || chosen.has(el)) continue;
          if (el.closest('[data-motion-ghost]')) continue;
          // A hidden outer target owns everything inside it.
          if (hiddenAbove(el)) continue;
          if (kind === 'stagger') {
            // Child by child: on a phone a three-card stack or a product grid
            // is taller than the screen, and revealing the whole group at
            // once played the lower children's entrance off-screen. Children
            // already on screen stay as they are.
            const below = (Array.from(el.children) as HTMLElement[]).filter((c) => isBelowFold(c, vh));
            if (below.length) {
              groups.set(el, below);
              below.forEach((c) => chosen.set(c, 'item'));
            }
            continue;
          }
          if (!isBelowFold(el, vh)) continue;
          chosen.set(el, kind);
        }
        groups.forEach((children, group) => {
          groupItems.set(group, new Set(children));
          children.forEach((c) => itemGroup.set(c, group));
          group.dataset.motionState = 'pending';
        });
        const measured = Array.from(chosen, ([el, kind]) => measure(el, kind));
        let i = 0;
        chosen.forEach((kind, el) => {
          hide(gsap, el, kind, measured[i++]!);
          pending.set(el, kind);
          io?.observe(el);
          whole?.observe(el);
          if (kind === 'split' && !Split) {
            loadSplitText()
              .then((s) => (Split = s))
              .catch(noop);
          }
        });
      };

      const targets = scan();
      prepare(targets);

      // Later content: reveal what's added, release what's removed.
      if (typeof MutationObserver === 'function') {
        mo = new MutationObserver((records) => {
          const added: HTMLElement[] = [];
          let removed = false;
          for (const record of records) {
            record.removedNodes.forEach((n) => {
              removed ||= n.nodeType === Node.ELEMENT_NODE;
            });
            record.addedNodes.forEach((n) => {
              if (n.nodeType !== Node.ELEMENT_NODE) return;
              const el = n as HTMLElement;
              if (el.matches('[data-motion]')) added.push(el);
              added.push(...Array.from(el.querySelectorAll<HTMLElement>('[data-motion]')));
            });
          }
          // A moved node is removed and re-added; only a node that is gone now is released.
          if (removed) pending.forEach((_, el) => !el.isConnected && flush(el));
          if (added.length) prepare(added.filter((el) => el.isConnected));
        });
        mo.observe(root as Node, { childList: true, subtree: true });
      }

      // Parallax — desktop-class devices only; ScrollTrigger never loads on phones.
      const parallax = targets.filter((el) => kindOf(el) === 'parallax');
      if (parallax.length && isRichPointer()) {
        loadScrollTrigger()
          .then(() => {
            if (stopped) return;
            mm = gsap.matchMedia();
            mm.add(PARALLAX_QUERY, (context) => {
              const drift = (el: Element) => {
                context.add(() =>
                  gsap.fromTo(
                    el,
                    { yPercent: -4, scale: 1.1 },
                    {
                      yPercent: 4,
                      scale: 1.1,
                      ease: 'none',
                      scrollTrigger: {
                        trigger: el.parentElement ?? el,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 0.6,
                      },
                    },
                  ),
                );
              };
              // Creating a trigger snaps the image to its scrubbed state — a
              // 10% zoom plus a shift. For an image already on screen that is
              // a visible jump, so those are wired once they've scrolled away.
              const vh = window.innerHeight;
              const onScreen = parallax.filter((el) => {
                const r = el.getBoundingClientRect();
                return r.bottom > 0 && r.top < vh;
              });
              parallax.filter((el) => !onScreen.includes(el)).forEach(drift);
              if (!onScreen.length) return undefined;
              const later = new IntersectionObserver((entries) =>
                entries.forEach((e) => {
                  if (e.isIntersecting) return;
                  later.unobserve(e.target);
                  drift(e.target);
                }),
              );
              onScreen.forEach((el) => later.observe(el));
              return () => later.disconnect();
            });
          })
          .catch(noop);
      }
    } catch (error) {
      teardown(); // never leave anything hidden
      // Surface the bug without an unhandled rejection.
      if (typeof reportError === 'function') reportError(error);
      else console.error(error);
    }
  };

  void run();

  return () => {
    disposed = true;
    teardown();
  };
}
