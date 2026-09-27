import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { StrictMode, createElement } from 'react';
import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cubicBezier } from './bezier';
import { getMotionLevel, watchMotionLevel, whenIdle } from './env';
import type { RevealOptions } from './reveal';

// ─── Test environment helpers ────────────────────────────────

let reducedMotion = false;
let richPointer = false;
let connection: (EventTarget & { saveData?: boolean; effectiveType?: string }) | undefined;
const mediaListeners = new Set<() => void>();

function matchesQuery(query: string): boolean {
  if (query.includes('prefers-reduced-motion: reduce')) return reducedMotion;
  const pointer = query.includes('pointer: fine');
  const noPreference = query.includes('no-preference');
  if (!pointer && !noPreference) return false;
  return (!pointer || richPointer) && (!noPreference || !reducedMotion);
}

function installMatchMedia() {
  window.matchMedia = ((query: string) => {
    const mql = {
      get matches() {
        return matchesQuery(query);
      },
      media: query,
      onchange: null,
      addEventListener: (_: string, fn: (e: unknown) => void) => mediaListeners.add(() => fn(mql)),
      removeEventListener: () => {},
      addListener: (fn: (e: unknown) => void) => mediaListeners.add(() => fn(mql)),
      removeListener: () => {},
      dispatchEvent: () => false,
    };
    return mql;
  }) as unknown as typeof window.matchMedia;
}

/** Flip the OS reduced-motion setting and notify every media-query listener. */
function setReducedMotion(on: boolean) {
  reducedMotion = on;
  mediaListeners.forEach((fn) => fn());
}

type IOEntry = { isIntersecting: boolean; target: Element; intersectionRatio?: number };
type IOCallback = (entries: IOEntry[]) => void;
type IOOptions = { rootMargin?: string; threshold?: number };
const observers: Array<{ cb: IOCallback; targets: Set<Element>; options?: IOOptions }> = [];

class MockIntersectionObserver {
  private record: { cb: IOCallback; targets: Set<Element>; options?: IOOptions };
  constructor(cb: IOCallback, options?: IOOptions) {
    // Browsers throw on an unparseable margin, e.g. "-NaN%"
    if (options?.rootMargin && /NaN|undefined/.test(options.rootMargin)) throw new SyntaxError('rootMargin');
    this.record = { cb, targets: new Set(), options };
    observers.push(this.record);
  }
  observe(el: Element) {
    this.record.targets.add(el);
  }
  unobserve(el: Element) {
    this.record.targets.delete(el);
  }
  disconnect() {
    this.record.targets.clear();
  }
}

/** Fire an intersection for `el` on every observer watching it. */
function intersect(el: Element, isIntersecting = true) {
  for (const o of observers) if (o.targets.has(el)) o.cb([{ isIntersecting, target: el }]);
}
const observed = (el: Element) => observers.some((o) => o.targets.has(el));

function placeAt(el: Element, top: number, height = 100, left = 0, width = 300) {
  el.getBoundingClientRect = () =>
    ({
      top,
      bottom: top + height,
      left,
      right: left + width,
      width,
      height,
      x: left,
      y: top,
      toJSON() {},
    }) as DOMRect;
}

/** jsdom never loads images; mark one as decoded and on screen. */
function loaded(img: HTMLImageElement) {
  Object.defineProperty(img, 'complete', { configurable: true, value: true });
  Object.defineProperty(img, 'naturalWidth', { configurable: true, value: 800 });
}

/**
 * Record every element appended to <body> — ghosts live only for a few ms
 * at test speed. Deduped: under jsdom (no layout) GSAP briefly re-parents
 * a fixed element to read its transform, which re-adds the same node.
 */
function recordAdded() {
  const added: HTMLElement[] = [];
  const mo = new MutationObserver((records) =>
    records.forEach((r) =>
      r.addedNodes.forEach((n) => n.nodeType === 1 && !added.includes(n as HTMLElement) && added.push(n as HTMLElement)),
    ),
  );
  mo.observe(document.body, { childList: true });
  return { added, stop: () => mo.disconnect() };
}

const disposers: Array<() => void> = [];
async function startReveal(root?: ParentNode, options?: RevealOptions) {
  const { reveal } = await import('./reveal');
  const dispose = reveal(root, options);
  disposers.push(dispose);
  return dispose;
}

const tick = () => new Promise((r) => setTimeout(r, 0));

beforeEach(async () => {
  reducedMotion = false;
  richPointer = false;
  connection = undefined;
  mediaListeners.clear();
  installMatchMedia();
  Object.defineProperty(navigator, 'connection', { configurable: true, get: () => connection });
  (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver = MockIntersectionObserver;
  (window as unknown as { requestIdleCallback: unknown }).requestIdleCallback = (cb: () => void) => setTimeout(cb, 0);
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1200 });
  document.documentElement.removeAttribute('data-motion');
  document.body.innerHTML = '';
  observers.length = 0;
  // Run every tween ~100× faster so tests stay quick.
  const { loadGsap } = await import('./gsap');
  const gsap = await loadGsap();
  gsap.globalTimeline.timeScale(100);
});

afterEach(() => {
  disposers.splice(0).forEach((dispose) => dispose());
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.doUnmock('gsap');
});

// ─── cubicBezier ─────────────────────────────────────────────

describe('cubicBezier', () => {
  it('pins the endpoints', () => {
    const f = cubicBezier(0.146, 1, 0.382, 1);
    expect(f(0)).toBe(0);
    expect(f(1)).toBe(1);
  });

  it('is linear for a linear curve', () => {
    const f = cubicBezier(0, 0, 1, 1);
    expect(f(0.25)).toBeCloseTo(0.25, 4);
    expect(f(0.7)).toBeCloseTo(0.7, 4);
  });

  it('matches the CSS `ease` keyword at its midpoint', () => {
    // Reference value for cubic-bezier(0.25, 0.1, 0.25, 1) at x = 0.5
    expect(cubicBezier(0.25, 0.1, 0.25, 1)(0.5)).toBeCloseTo(0.8024, 3);
  });

  it('overshoots for the spring token', () => {
    const f = cubicBezier(0.382, 1.618, 0.618, 1);
    const peak = Math.max(...Array.from({ length: 50 }, (_, i) => f(i / 50)));
    expect(peak).toBeGreaterThan(1);
  });
});

// ─── getMotionLevel ──────────────────────────────────────────

describe('getMotionLevel', () => {
  it('is full by default', () => {
    expect(getMotionLevel()).toBe('full');
  });

  it('respects prefers-reduced-motion', () => {
    reducedMotion = true;
    expect(getMotionLevel()).toBe('reduced');
  });

  it('turns off under Save-Data', () => {
    connection = Object.assign(new EventTarget(), { saveData: true });
    expect(getMotionLevel()).toBe('off');
  });

  it('turns off on 2G-class connections', () => {
    connection = Object.assign(new EventTarget(), { effectiveType: 'slow-2g' });
    expect(getMotionLevel()).toBe('off');
    connection = Object.assign(new EventTarget(), { effectiveType: '2g' });
    expect(getMotionLevel()).toBe('off');
    connection = Object.assign(new EventTarget(), { effectiveType: '4g' });
    expect(getMotionLevel()).toBe('full');
  });

  it('honours a page-level opt-out', () => {
    document.documentElement.dataset.motion = 'off';
    expect(getMotionLevel()).toBe('off');
  });

  it('is off, and nothing throws, without a DOM (SSR)', async () => {
    vi.stubGlobal('window', undefined);
    expect(getMotionLevel()).toBe('off');
    expect(() => watchMotionLevel(() => {})()).not.toThrow();
    await expect(whenIdle()).resolves.toBeUndefined();
  });
});

// ─── watchMotionLevel / whenIdle ─────────────────────────────

describe('watchMotionLevel', () => {
  it('reports reduced motion, a page opt-out and Save-Data switched on mid-session', async () => {
    connection = Object.assign(new EventTarget(), { saveData: false });
    const levels: string[] = [];
    const stop = watchMotionLevel((level) => levels.push(level));

    setReducedMotion(true);
    setReducedMotion(false);
    document.documentElement.dataset.motion = 'off';
    await tick(); // MutationObserver delivery
    delete document.documentElement.dataset.motion;
    await tick();
    connection.saveData = true;
    connection.dispatchEvent(new Event('change'));
    expect(levels).toEqual(['reduced', 'full', 'off', 'full', 'off']);

    stop();
    connection.saveData = false;
    connection.dispatchEvent(new Event('change'));
    expect(levels).toHaveLength(5);
  });
});

describe('whenIdle', () => {
  it('waits for the load event before idling', async () => {
    Object.defineProperty(document, 'readyState', { configurable: true, get: () => 'loading' });
    try {
      let resolved = false;
      void whenIdle(5000).then(() => (resolved = true));
      await new Promise((r) => setTimeout(r, 20));
      expect(resolved).toBe(false);
      window.dispatchEvent(new Event('load'));
      await vi.waitFor(() => expect(resolved).toBe(true));
    } finally {
      delete (document as unknown as { readyState?: string }).readyState;
    }
  });

  it('falls back to a short task where requestIdleCallback is missing (Safari)', async () => {
    delete (window as unknown as { requestIdleCallback?: unknown }).requestIdleCallback;
    await expect(whenIdle()).resolves.toBeUndefined();
  });
});

// ─── GSAP loader ─────────────────────────────────────────────

describe('loadGsap', () => {
  it('never changes the shared GSAP instance a store may also use', async () => {
    // vitest inlines gsap, so a module reset hands out a fresh instance — take
    // that one, then load it through a fresh ./gsap exactly as a page would.
    vi.resetModules();
    const { gsap } = await import('gsap');
    const defaults = vi.spyOn(gsap, 'defaults');
    const lag = vi.spyOn(gsap.ticker, 'lagSmoothing');
    const fresh = await import('./gsap');
    expect(await fresh.loadGsap()).toBe(gsap);
    await fresh.loadFlip();
    expect(defaults).not.toHaveBeenCalled();
    expect(lag).not.toHaveBeenCalled();
    // …but our eases are there, namespaced
    expect(gsap.parseEase('ds.emphasized')(0.5)).toBeGreaterThan(0.5);
  });

  it('passes an explicit ease and duration on every tween', async () => {
    const { gsap } = await import('gsap');
    // GSAP writes its defaults into the vars object, so copy each one as it's passed.
    const seen: Array<Record<string, unknown>> = [];
    const record = <F extends (...args: never[]) => unknown>(owner: object, name: string) => {
      const real = (owner as Record<string, F>)[name]!;
      vi.spyOn(owner as Record<string, F>, name).mockImplementation(function (this: unknown, ...args: never[]) {
        const vars = args.find((a) => a && typeof a === 'object' && !Array.isArray(a) && !(a as object as Node).nodeType);
        if (vars) seen.push({ ...(vars as object) });
        return real.apply(this, args);
      } as F);
    };
    record(gsap, 'to');
    record(gsap.core.Timeline.prototype, 'to');
    const { enter } = await import('./reveal');
    const { bump } = await import('./commerce');
    document.body.innerHTML = '<div class="a">A</div><ul class="b"><li>1</li><li>2</li></ul><button>Cart</button>';
    await enter(document.querySelector<HTMLElement>('.a'));
    await enter(document.querySelector<HTMLElement>('.b'), 'stagger');
    await enter(document.querySelector<HTMLElement>('.a'), 'media');
    await bump(document.querySelector('button'));
    expect(seen.length).toBeGreaterThanOrEqual(5);
    for (const vars of seen) {
      expect(vars).toHaveProperty('ease');
      expect(vars).toHaveProperty('duration');
    }
  });

  it('eases every one-shot tween with a design-token curve (ds.*), fly-to-cart included', async () => {
    const { gsap } = await import('gsap');
    const eases: unknown[] = [];
    const real = gsap.core.Timeline.prototype.to;
    vi.spyOn(gsap.core.Timeline.prototype, 'to').mockImplementation(function (this: unknown, ...args: never[]) {
      eases.push((args[1] as { ease?: unknown }).ease);
      return real.apply(this, args);
    } as typeof real);
    const { flyToCart } = await import('./commerce');
    document.body.innerHTML = '<img src="a.jpg" alt="Tote" /><button data-motion-cart-target>Cart</button>';
    const img = document.querySelector('img')!;
    const cart = document.querySelector('button')!;
    loaded(img);
    placeAt(img, 200, 400);
    placeAt(cart, 10, 40, 1100, 40);
    await flyToCart(img, cart);
    expect(eases.length).toBeGreaterThanOrEqual(5); // lift, rise, sweep, shrink, fade (+ the bump)
    for (const e of eases) expect(e).toMatch(/^ds\./);
  });

  it('forgets a failed download so the next call retries', async () => {
    vi.resetModules();
    vi.doMock('gsap', () => {
      throw new Error('Failed to fetch dynamically imported module');
    });
    const fresh = await import('./gsap');
    await expect(fresh.loadGsap()).rejects.toThrow();
    vi.doUnmock('gsap');
    await expect(fresh.loadGsap()).resolves.toHaveProperty('to');
  });

  it('leaves the page static, without an unhandled rejection, when GSAP fails to load', async () => {
    vi.resetModules();
    vi.doMock('gsap', () => {
      throw new Error('offline');
    });
    const { reveal, enter } = await import('./reveal');
    const { flyToCart, bump } = await import('./commerce');
    const { createFlip } = await import('./flip');
    document.body.innerHTML =
      '<section data-motion="reveal">Below</section><img src="a.jpg" alt="" /><button data-motion-cart-target>Cart</button>';
    const section = document.querySelector('section')!;
    placeAt(section, 1600);
    disposers.push(reveal());
    await enter(section);
    await flyToCart(document.querySelector('img'));
    await bump(document.querySelector('button'));
    await createFlip(document.body).ready;
    await new Promise((r) => setTimeout(r, 30));
    expect(section.getAttribute('style')).toBeNull();
    expect(section.dataset.motionState).toBeUndefined();
  });
});

// ─── reveal ──────────────────────────────────────────────────

describe('reveal', () => {
  const settle = () => new Promise((r) => setTimeout(r, 60));

  it('does nothing under reduced motion', async () => {
    reducedMotion = true;
    document.body.innerHTML = '<section data-motion="reveal">Hello</section>';
    const section = document.querySelector('section')!;
    placeAt(section, 2000);
    await startReveal();
    await settle();
    expect(section.getAttribute('style')).toBeNull();
    expect(section.dataset.motionState).toBeUndefined();
    expect(observers).toHaveLength(0);
  });

  it('never hides content that is already on screen', async () => {
    document.body.innerHTML = '<section data-motion="reveal">Above the fold</section>';
    const section = document.querySelector('section')!;
    placeAt(section, 100);
    await startReveal();
    await settle();
    expect(section.style.opacity).toBe('');
    expect(section.dataset.motionState).toBeUndefined();
  });

  it('leaves display:none content alone', async () => {
    document.body.innerHTML = '<section data-motion="reveal">Collapsed</section>';
    // A collapsed panel reports a zero-size rect. It sits below the fold here
    // so only the zero-size check keeps it visible: jsdom's default rect has
    // top 0 (on screen anyway), so the old version could never fail.
    placeAt(document.querySelector('section')!, 1600, 0, 0, 0);
    await startReveal();
    await settle();
    expect(document.querySelector('section')!.style.opacity).toBe('');
  });

  it('removes its focusin and beforeprint listeners on cleanup', async () => {
    document.body.innerHTML = '<section data-motion="reveal">Below</section>';
    const section = document.querySelector('section')!;
    placeAt(section, 1600);
    const docAdd = vi.spyOn(document, 'addEventListener');
    const docRemove = vi.spyOn(document, 'removeEventListener');
    const winAdd = vi.spyOn(window, 'addEventListener');
    const winRemove = vi.spyOn(window, 'removeEventListener');
    const dispose = await startReveal();
    await vi.waitFor(() => expect(section.dataset.motionState).toBe('pending'));
    const onFocus = docAdd.mock.calls.find(([type]) => type === 'focusin')?.[1];
    const onPrint = winAdd.mock.calls.find(([type]) => type === 'beforeprint')?.[1];
    expect(onFocus).toBeDefined();
    expect(onPrint).toBeDefined();
    dispose();
    expect(docRemove.mock.calls.some(([type, fn]) => type === 'focusin' && fn === onFocus)).toBe(true);
    expect(winRemove.mock.calls.some(([type, fn]) => type === 'beforeprint' && fn === onPrint)).toBe(true);
  });

  it('hides below-the-fold content with opacity only, then removes every inline style', async () => {
    document.body.innerHTML = '<section data-motion="reveal">Below</section>';
    const section = document.querySelector('section')!;
    placeAt(section, 1600);
    await startReveal();
    await vi.waitFor(() => expect(section.dataset.motionState).toBe('pending'));
    expect(section.style.opacity).toBe('0');
    // Still in the accessibility tree
    expect(section.style.visibility).toBe('');
    expect(section.style.display).toBe('');

    intersect(section);
    await vi.waitFor(() => expect(section.dataset.motionState).toBe('done'));
    expect(section.hasAttribute('style')).toBe(false);
  });

  it('staggers the direct children of a stagger group', async () => {
    document.body.innerHTML = '<ul data-motion="stagger"><li>a</li><li>b</li><li>c</li></ul>';
    const list = document.querySelector('ul')!;
    placeAt(list, 1200);
    const items = Array.from(list.children) as HTMLElement[];
    items.forEach((li, i) => placeAt(li, 1200, 100, i * 320)); // one row
    await startReveal();
    await vi.waitFor(() => expect(list.dataset.motionState).toBe('pending'));
    items.forEach((li) => expect(li.style.opacity).toBe('0'));
    const { gsap } = await import('gsap');
    const to = vi.spyOn(gsap, 'to');
    // The row scrolls in together: one cascade, in reading order
    for (const o of observers) if (items.some((li) => o.targets.has(li))) o.cb(items.map((target) => ({ isIntersecting: true, target })));
    const delays = to.mock.calls.map(([targets, vars]) => [(targets as HTMLElement[])[0], (vars as { delay: number }).delay] as const);
    expect(delays.map(([el]) => el)).toEqual(items);
    expect(delays[0]![1]).toBe(0);
    expect(delays[1]![1]).toBeGreaterThan(0);
    expect(delays[2]![1]).toBeGreaterThan(delays[1]![1]);
    await vi.waitFor(() => expect(list.dataset.motionState).toBe('done'));
    items.forEach((li) => expect(li.hasAttribute('style')).toBe(false));
  });

  it('reveals a stagger group taller than the screen child by child, as each scrolls in', async () => {
    // A phone: three cards stacked, the lower ones far below the first
    document.body.innerHTML = '<div data-motion="stagger"><article>a</article><article>b</article><article>c</article></div>';
    const group = document.querySelector('div')!;
    const [a, b, c] = Array.from(group.children) as HTMLElement[];
    placeAt(group, 900, 1800);
    placeAt(a!, 900, 560);
    placeAt(b!, 1500, 560);
    placeAt(c!, 2100, 560);
    await startReveal();
    await vi.waitFor(() => expect(group.dataset.motionState).toBe('pending'));
    intersect(a!);
    await vi.waitFor(() => expect(a!.dataset.motionState).toBe('done'));
    // The others are still waiting for their turn — not animated off-screen
    expect(b!.style.opacity).toBe('0');
    expect(c!.style.opacity).toBe('0');
    expect(group.dataset.motionState).toBe('pending');
    intersect(b!);
    intersect(c!);
    await vi.waitFor(() => expect(group.dataset.motionState).toBe('done'));
    [a, b, c].forEach((el) => expect(el!.hasAttribute('style')).toBe(false));
  });

  it('leaves the on-screen children of a stagger group alone, and still reveals a target nested in one', async () => {
    document.body.innerHTML =
      '<ul data-motion="stagger"><li><p data-motion="reveal">nested</p></li><li>below</li></ul>';
    const list = document.querySelector('ul')!;
    const [top, below] = Array.from(list.children) as HTMLElement[];
    const nested = document.querySelector('p')!;
    placeAt(list, 300, 2000);
    placeAt(top!, 300, 1200); // starts on screen, runs past the fold
    placeAt(nested, 1100);
    placeAt(below!, 1600);
    await startReveal();
    await vi.waitFor(() => expect(below!.style.opacity).toBe('0'));
    expect(top!.style.opacity).toBe('');
    expect(top!.dataset.motionState).toBeUndefined();
    await vi.waitFor(() => expect(nested.dataset.motionState).toBe('pending'));
  });

  it('enter() on a stagger group reveal() is still holding shows every child at full opacity', async () => {
    document.body.innerHTML = '<ul data-motion="stagger"><li>a</li><li>b</li></ul>';
    const list = document.querySelector('ul')!;
    const items = Array.from(list.children) as HTMLElement[];
    placeAt(list, 1200);
    items.forEach((li, i) => placeAt(li, 1200 + i * 600));
    await startReveal();
    await vi.waitFor(() => expect(items[1]!.style.opacity).toBe('0'));
    const { enter } = await import('./reveal');
    await enter(list, 'stagger');
    expect(list.dataset.motionState).toBe('done');
    items.forEach((li) => expect(li.hasAttribute('style')).toBe(false));
  });

  it('reveals a short element at the very end of the page once it is wholly on screen', async () => {
    // The page can't scroll far enough for its top to cross the reveal line
    document.body.innerHTML = '<p data-motion="reveal">© 2026 Mason Supply Co.</p>';
    const p = document.querySelector('p')!;
    placeAt(p, 1600, 34);
    await startReveal();
    await vi.waitFor(() => expect(p.dataset.motionState).toBe('pending'));
    const whole = observers.find((o) => o.targets.has(p) && o.options?.threshold);
    expect(whole).toBeDefined();
    // Partly in view (reported on observe, or on the way out): still waiting
    whole!.cb([{ isIntersecting: true, target: p, intersectionRatio: 0.5 }]);
    expect(p.dataset.motionState).toBe('pending');
    whole!.cb([{ isIntersecting: true, target: p, intersectionRatio: 1 }]);
    await vi.waitFor(() => expect(p.dataset.motionState).toBe('done'));
    expect(observed(p)).toBe(false);
  });

  it('reveals immediately when keyboard focus lands inside hidden content', async () => {
    document.body.innerHTML = '<section data-motion="reveal"><a href="#x">Link</a></section>';
    const section = document.querySelector('section')!;
    placeAt(section, 1600);
    await startReveal();
    await vi.waitFor(() => expect(section.style.opacity).toBe('0'));
    document.querySelector('a')!.focus();
    expect(section.style.opacity).toBe('');
    expect(section.dataset.motionState).toBe('done');
  });

  it('reveals pending and in-flight content before printing', async () => {
    document.body.innerHTML = '<section class="a" data-motion="reveal">A</section><section class="b" data-motion="reveal">B</section>';
    const [a, b] = Array.from(document.querySelectorAll('section'));
    placeAt(a!, 1600);
    placeAt(b!, 2600);
    await startReveal();
    await vi.waitFor(() => expect(b!.dataset.motionState).toBe('pending'));
    const { gsap } = await import('gsap');
    gsap.globalTimeline.timeScale(0.01); // freeze A mid-animation
    intersect(a!);
    expect(a!.dataset.motionState).toBe('running');
    window.dispatchEvent(new Event('beforeprint'));
    expect(a!.dataset.motionState).toBe('done');
    expect(b!.dataset.motionState).toBe('done');
    expect(a!.hasAttribute('style')).toBe(false);
    expect(b!.hasAttribute('style')).toBe(false);
  });

  it('cleanup restores anything still pending', async () => {
    document.body.innerHTML = '<section data-motion="reveal">Below</section>';
    const section = document.querySelector('section')!;
    placeAt(section, 1600);
    const dispose = await startReveal();
    await vi.waitFor(() => expect(section.style.opacity).toBe('0'));
    dispose();
    expect(section.style.opacity).toBe('');
  });

  it('lets a hidden outer target own nested targets', async () => {
    document.body.innerHTML = '<section data-motion="reveal"><div data-motion="reveal">inner</div></section>';
    const [outer, inner] = Array.from(document.querySelectorAll<HTMLElement>('[data-motion]'));
    placeAt(outer!, 1600);
    placeAt(inner!, 1650);
    await startReveal();
    await vi.waitFor(() => expect(outer!.dataset.motionState).toBe('pending'));
    expect(inner!.dataset.motionState).toBeUndefined();
  });

  it('still reveals a nested target when its outer target was on screen', async () => {
    document.body.innerHTML = '<section data-motion="reveal"><div data-motion="reveal">inner</div></section>';
    const [outer, inner] = Array.from(document.querySelectorAll<HTMLElement>('[data-motion]'));
    placeAt(outer!, 400, 3000); // tall section starting on screen
    placeAt(inner!, 2400);
    await startReveal();
    await vi.waitFor(() => expect(inner!.dataset.motionState).toBe('pending'));
    expect(outer!.dataset.motionState).toBeUndefined();
  });

  it('reveals everything at once when reduced motion is switched on mid-session', async () => {
    document.body.innerHTML = '<section class="a" data-motion="reveal">A</section><section class="b" data-motion="reveal">B</section>';
    const [a, b] = Array.from(document.querySelectorAll('section'));
    placeAt(a!, 1600);
    placeAt(b!, 2600);
    await startReveal();
    await vi.waitFor(() => expect(b!.dataset.motionState).toBe('pending'));
    const { gsap } = await import('gsap');
    gsap.globalTimeline.timeScale(0.01);
    intersect(a!); // A is mid-animation, B still hidden
    setReducedMotion(true);
    expect(a!.dataset.motionState).toBe('done');
    expect(b!.dataset.motionState).toBe('done');
    expect(a!.hasAttribute('style')).toBe(false);
    expect(b!.hasAttribute('style')).toBe(false);
    expect(observed(b!)).toBe(false);
  });

  it('reveals everything when the page opts out after setup', async () => {
    document.body.innerHTML = '<section data-motion="reveal">Below</section>';
    const section = document.querySelector('section')!;
    placeAt(section, 1600);
    await startReveal();
    await vi.waitFor(() => expect(section.dataset.motionState).toBe('pending'));
    document.documentElement.dataset.motion = 'off';
    await vi.waitFor(() => expect(section.dataset.motionState).toBe('done'));
    expect(section.hasAttribute('style')).toBe(false);
  });

  it('never leaves content hidden when setup fails part-way', async () => {
    const report = vi.fn();
    vi.stubGlobal('reportError', report);
    vi.spyOn(MockIntersectionObserver.prototype, 'observe').mockImplementation(() => {
      throw new Error('boom');
    });
    document.body.innerHTML = '<section data-motion="reveal">Below</section>';
    const section = document.querySelector('section')!;
    placeAt(section, 1600);
    await startReveal();
    await vi.waitFor(() => expect(report).toHaveBeenCalled());
    expect(section.style.opacity).toBe('');
    expect(section.dataset.motionState).toBe('done');
  });

  it('survives an invalid offset', async () => {
    document.body.innerHTML = '<section data-motion="reveal">Below</section>';
    const section = document.querySelector('section')!;
    placeAt(section, 1600);
    await startReveal(document, { offset: Number.NaN });
    await vi.waitFor(() => expect(section.dataset.motionState).toBe('pending'));
    intersect(section);
    await vi.waitFor(() => expect(section.dataset.motionState).toBe('done'));
  });

  it('picks up [data-motion] content added later, and hides only what is below the fold', async () => {
    document.body.innerHTML = '<main><section data-motion="reveal">First</section></main>';
    placeAt(document.querySelector('section')!, 1600);
    await startReveal();
    await vi.waitFor(() => expect(document.querySelector('section')!.dataset.motionState).toBe('pending'));

    const below = document.createElement('div');
    below.dataset.motion = 'reveal';
    placeAt(below, 2400);
    const visible = document.createElement('div');
    visible.dataset.motion = 'reveal';
    placeAt(visible, 300);
    document.querySelector('main')!.append(below, visible);
    await tick();
    expect(below.dataset.motionState).toBe('pending');
    expect(visible.dataset.motionState).toBeUndefined();
    intersect(below);
    await vi.waitFor(() => expect(below.dataset.motionState).toBe('done'));
  });

  it('releases hidden nodes that are removed before they reveal', async () => {
    document.body.innerHTML = '<section data-motion="reveal">Below</section>';
    const section = document.querySelector('section')!;
    placeAt(section, 1600);
    await startReveal();
    await vi.waitFor(() => expect(section.dataset.motionState).toBe('pending'));
    section.remove();
    await tick();
    expect(observed(section)).toBe(false);
    // Restored, so re-inserting it can never show a blank section
    expect(section.style.opacity).toBe('');
    expect(section.dataset.motionState).toBe('done');
  });

  it("animates to the element's own resting opacity and keeps authored inline styles", async () => {
    const { gsap } = await import('gsap');
    const to = vi.spyOn(gsap, 'to');
    document.body.innerHTML = '<section data-motion="reveal" style="opacity: 0.5; transform: rotate(2deg)">Muted</section>';
    const section = document.querySelector('section')!;
    placeAt(section, 1600);
    await startReveal();
    await vi.waitFor(() => expect(section.dataset.motionState).toBe('pending'));
    intersect(section);
    await vi.waitFor(() => expect(section.dataset.motionState).toBe('done'));
    const call = to.mock.calls.find(([t]) => Array.isArray(t) && t[0] === section);
    const opacity = (call![1] as { opacity: (i: number) => number }).opacity;
    expect(opacity(0)).toBe(0.5);
    expect(section.style.opacity).toBe('0.5');
    expect(section.style.transform).toBe('rotate(2deg)');
  });

  it('never holds content back for longer than the cascade cap', async () => {
    const { gsap } = await import('gsap');
    const { MAX_CASCADE } = await import('./gsap');
    const to = vi.spyOn(gsap, 'to');
    document.body.innerHTML = Array.from({ length: 20 }, (_, i) => `<div data-motion="reveal">${i}</div>`).join('');
    const cards = Array.from(document.querySelectorAll('div'));
    cards.forEach((c, i) => placeAt(c, 1600 + i));
    await startReveal();
    await vi.waitFor(() => expect(cards[19]!.dataset.motionState).toBe('pending'));
    const io = observers.find((o) => o.targets.has(cards[0]!))!;
    io.cb(cards.map((target) => ({ isIntersecting: true, target })));
    const delays = to.mock.calls.map(([, vars]) => (vars as { delay: number }).delay);
    expect(Math.max(...delays)).toBeLessThanOrEqual(MAX_CASCADE);

    to.mockClear();
    document.body.innerHTML = `<ul data-motion="stagger">${'<li>x</li>'.repeat(30)}</ul>`;
    const { enter } = await import('./reveal');
    await enter(document.querySelector('ul'), 'stagger');
    const each = (to.mock.calls[0]![1] as { stagger: number }).stagger;
    expect(each * 29).toBeLessThanOrEqual(MAX_CASCADE + 1e-9);
  });

  it('sets nothing up (and downloads nothing) for parallax alone on a phone', async () => {
    const { reveal } = await import('./reveal');
    const idle = vi.fn((cb: () => void) => setTimeout(cb, 0));
    (window as unknown as { requestIdleCallback: unknown }).requestIdleCallback = idle;
    document.body.innerHTML = '<div class="frame"><img data-motion="parallax" alt="" /></div>';
    placeAt(document.querySelector('img')!, 1600, 400);
    disposers.push(reveal());
    await settle();
    expect(idle).not.toHaveBeenCalled();
    expect(observers).toHaveLength(0);
  });

  it('keeps an in-view parallax image still until it has scrolled away', async () => {
    richPointer = true;
    document.body.innerHTML = '<div class="frame"><img data-motion="parallax" alt="" /></div>';
    const img = document.querySelector('img')!;
    placeAt(img, 200, 400);
    await startReveal();
    const later = () => observers.find((o) => o.targets.has(img));
    await vi.waitFor(() => expect(later()).toBeDefined(), { timeout: 3000 });
    expect(img.style.transform).toBe('');
    intersect(img, false);
    expect(img.style.transform).toContain('scale');
  });
});

// ─── split headings ──────────────────────────────────────────

describe('split', () => {
  it("hands the heading's original nodes back, so a framework can keep updating them", async () => {
    const { enter } = await import('./reveal');
    document.body.innerHTML = '<h2>Made <em>to</em> last</h2>';
    const h2 = document.querySelector('h2')!;
    const [first, em, last] = Array.from(h2.childNodes);
    await enter(h2, 'split');
    expect(Array.from(h2.childNodes)).toEqual([first, em, last]);
    expect(h2.textContent).toBe('Made to last');
    expect(h2.hasAttribute('aria-label')).toBe(false);
    // What React would do on the next render: update its own text node
    (last as Text).data = ' longer';
    expect(h2.textContent).toBe('Made to longer');
  });

  it('keeps text that was replaced while the lines were animating', async () => {
    const { gsap } = await import('gsap');
    const { enter } = await import('./reveal');
    document.body.innerHTML = '<h2>Old headline</h2>';
    const h2 = document.querySelector('h2')!;
    gsap.globalTimeline.timeScale(0.01);
    const done = enter(h2, 'split');
    await vi.waitFor(() => expect(h2.dataset.motionState).toBe('running'));
    await vi.waitFor(() => expect(h2.querySelector('div')).not.toBeNull());
    h2.textContent = 'New headline';
    gsap.globalTimeline.timeScale(100);
    await done;
    expect(h2.textContent).toBe('New headline');
    expect(h2.dataset.motionState).toBe('done');
  });

  it('fades in unsplit instead of staying blank while a web font is slow', async () => {
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      // A real FontFaceSet is an EventTarget. GSAP's SplitText caches
      // document.fonts the first time it registers and later calls
      // removeEventListener on it — a plain object here broke every later
      // split test whenever this one happened to run first (shuffle).
      value: Object.assign(new EventTarget(), { status: 'loading', ready: new Promise(() => {}) }),
    });
    try {
      const { enter } = await import('./reveal');
      document.body.innerHTML = '<h2>Waiting on a font</h2>';
      const h2 = document.querySelector('h2')!;
      await enter(h2, 'split');
      expect(h2.dataset.motionState).toBe('done');
      expect(h2.hasAttribute('style')).toBe(false);
      expect(h2.querySelector('div')).toBeNull();
    } finally {
      delete (document as unknown as { fonts?: unknown }).fonts;
    }
  });
});

// ─── enter ───────────────────────────────────────────────────

describe('enter', () => {
  it('plays an entrance immediately and settles back to authored styles', async () => {
    const { enter } = await import('./reveal');
    document.body.innerHTML = '<div class="card">New content</div>';
    const card = document.querySelector<HTMLElement>('.card')!;
    await enter(card);
    expect(card.dataset.motionState).toBe('done');
    expect(card.style.opacity).toBe('');
    expect(card.style.transform).toBe('');
  });

  it('leaves content untouched under reduced motion', async () => {
    reducedMotion = true;
    const { enter } = await import('./reveal');
    document.body.innerHTML = '<div class="card">New content</div>';
    const card = document.querySelector<HTMLElement>('.card')!;
    await enter(card);
    expect(card.dataset.motionState).toBeUndefined();
  });

  it('restarting an entrance resolves the earlier call', async () => {
    const { gsap } = await import('gsap');
    const { enter } = await import('./reveal');
    document.body.innerHTML = '<div class="card">Replay me</div>';
    const card = document.querySelector<HTMLElement>('.card')!;
    gsap.globalTimeline.timeScale(0.01);
    let firstDone = false;
    void enter(card).then(() => (firstDone = true));
    await vi.waitFor(() => expect(card.dataset.motionState).toBe('running'));
    gsap.globalTimeline.timeScale(100);
    const second = enter(card);
    await vi.waitFor(() => expect(firstDone).toBe(true));
    await second;
    expect(card.dataset.motionState).toBe('done');
    expect(card.hasAttribute('style')).toBe(false);
  });

  it('shows content a reveal() is still holding hidden at its full opacity', async () => {
    document.body.innerHTML = '<section data-motion="reveal">Below</section>';
    const section = document.querySelector('section')!;
    placeAt(section, 1600);
    await startReveal();
    await vi.waitFor(() => expect(section.dataset.motionState).toBe('pending'));
    const { gsap } = await import('gsap');
    const to = vi.spyOn(gsap, 'to');
    const { enter } = await import('./reveal');
    await enter(section);
    const opacity = (to.mock.calls[0]![1] as { opacity: (i: number) => number }).opacity;
    expect(opacity(0)).toBe(1);
    expect(section.dataset.motionState).toBe('done');
    // The reveal's own observer no longer replays it
    intersect(section);
    expect(section.dataset.motionState).toBe('done');
  });

  it("never kills a store's own tweens on the same element", async () => {
    const { gsap } = await import('gsap');
    const { enter } = await import('./reveal');
    document.body.innerHTML = '<div class="card">Mine too</div>';
    const card = document.querySelector<HTMLElement>('.card')!;
    const theirs = gsap.to(card, { backgroundColor: 'red', duration: 1000, ease: 'none' });
    await enter(card);
    expect(gsap.getTweensOf(card)).toContain(theirs);
    theirs.kill();
  });
});

// ─── flyToCart / bump ────────────────────────────────────────

describe('flyToCart', () => {
  it('is a no-op without a cart target', async () => {
    const { flyToCart } = await import('./commerce');
    document.body.innerHTML = '<img src="a.jpg" alt="Tote" />';
    await flyToCart(document.querySelector('img'));
    expect(document.querySelectorAll('img')).toHaveLength(1);
  });

  it('flies an inert, aria-hidden copy and removes it afterwards', async () => {
    const { flyToCart } = await import('./commerce');
    document.body.innerHTML =
      '<img id="hero" src="a.jpg" srcset="a-400.jpg 400w, a-800.jpg 800w" alt="Tote" /><button data-motion-cart-target aria-label="Cart">Cart</button>';
    const img = document.querySelector('img')!;
    const cart = document.querySelector('button')!;
    loaded(img);
    placeAt(img, 200, 400);
    placeAt(cart, 10, 40, 1100, 40);

    const rec = recordAdded();
    await flyToCart(img, cart);
    await Promise.resolve();
    rec.stop();

    expect(rec.added).toHaveLength(1);
    const ghost = rec.added[0] as HTMLImageElement;
    expect(ghost.tagName).toBe('IMG');
    expect(ghost.getAttribute('aria-hidden')).toBe('true');
    expect(ghost.hasAttribute('inert')).toBe(true);
    expect(ghost.id).toBe('');
    // Locked to the file already on screen — no new srcset fetch
    expect(ghost.hasAttribute('srcset')).toBe(false);
    expect(document.querySelectorAll('img')).toHaveLength(1);
    expect(cart.hasAttribute('style')).toBe(false);
  });

  it('does nothing under reduced motion', async () => {
    reducedMotion = true;
    const { flyToCart } = await import('./commerce');
    document.body.innerHTML = '<img src="a.jpg" alt="Tote" /><button data-motion-cart-target>Cart</button>';
    placeAt(document.querySelector('img')!, 200, 400);
    placeAt(document.querySelector('button')!, 10, 40);
    await flyToCart(document.querySelector('img'));
    expect(document.querySelectorAll('img')).toHaveLength(1);
  });

  it("only bumps the cart when the image hasn't loaded yet", async () => {
    const { gsap } = await import('gsap');
    const { flyToCart } = await import('./commerce');
    document.body.innerHTML = '<img src="a.jpg" alt="Tote" /><button data-motion-cart-target>Cart</button>';
    const cart = document.querySelector('button')!;
    placeAt(document.querySelector('img')!, 200, 400);
    placeAt(cart, 10, 40, 1100, 40);
    const timeline = vi.spyOn(gsap, 'timeline');
    const rec = recordAdded();
    await flyToCart(document.querySelector('img'));
    rec.stop();
    expect(rec.added).toHaveLength(0);
    expect(timeline).toHaveBeenCalledTimes(1); // the bump
  });

  it('flies to the cart that is on screen when a page renders two', async () => {
    const { flyToCart } = await import('./commerce');
    document.body.innerHTML =
      '<header hidden><a data-motion-cart-target>Cart</a></header><header><a data-motion-cart-target>Cart</a></header><img src="a.jpg" alt="Tote" />';
    const [, visibleCart] = Array.from(document.querySelectorAll('a'));
    placeAt(visibleCart!, 10, 40, 1100, 40);
    const img = document.querySelector('img')!;
    loaded(img);
    placeAt(img, 300, 400);
    const rec = recordAdded();
    await flyToCart(img);
    rec.stop();
    expect(rec.added).toHaveLength(1);
  });

  it('does nothing when the cart is scrolled out of view', async () => {
    const { gsap } = await import('gsap');
    const { flyToCart } = await import('./commerce');
    document.body.innerHTML = '<img src="a.jpg" alt="Tote" /><button data-motion-cart-target>Cart</button>';
    const img = document.querySelector('img')!;
    loaded(img);
    placeAt(img, 200, 400);
    placeAt(document.querySelector('button')!, -200, 40, 1100, 40);
    const timeline = vi.spyOn(gsap, 'timeline');
    await flyToCart(img);
    expect(timeline).not.toHaveBeenCalled();
  });

  it('flies the image the shopper can see, and strips ids and form names from a copy', async () => {
    const { flyToCart } = await import('./commerce');
    document.body.innerHTML = `<div class="gallery">
        <img class="offscreen" src="1.jpg" alt="" />
        <img class="current" src="2.jpg" alt="" />
      </div>
      <div class="card"><input type="radio" name="size" id="s1" checked /><label for="s1">S</label></div>
      <button data-motion-cart-target>Cart</button>`;
    const gallery = document.querySelector<HTMLElement>('.gallery')!;
    const [off, current] = Array.from(gallery.querySelectorAll('img'));
    placeAt(gallery, 100, 500, 0, 600);
    placeAt(off!, 100, 500, -600, 600); // a slide scrolled out to the left
    placeAt(current!, 100, 500, 0, 600);
    loaded(off!);
    loaded(current!);
    placeAt(document.querySelector('button')!, 10, 40, 1100, 40);

    let rec = recordAdded();
    await flyToCart(gallery);
    rec.stop();
    expect((rec.added[0] as HTMLImageElement).src).toMatch(/\/2\.jpg$/);

    const card = document.querySelector<HTMLElement>('.card')!;
    placeAt(card, 300, 200);
    rec = recordAdded();
    const flight = flyToCart(card);
    await vi.waitFor(() => expect(rec.added).toHaveLength(1));
    const ghost = rec.added[0]!;
    expect(ghost.querySelector('[id], [name]')).toBeNull();
    expect(ghost.hasAttribute('inert')).toBe(true);
    await flight;
    rec.stop();
    expect(document.querySelector<HTMLInputElement>('#s1')!.checked).toBe(true);
  });

  it('removes the copy even if something kills its animation', async () => {
    const { gsap } = await import('gsap');
    const { flyToCart } = await import('./commerce');
    document.body.innerHTML = '<img src="a.jpg" alt="" /><button data-motion-cart-target>Cart</button>';
    const img = document.querySelector('img')!;
    loaded(img);
    placeAt(img, 200, 400);
    placeAt(document.querySelector('button')!, 10, 40, 1100, 40);
    gsap.globalTimeline.timeScale(0.01);
    const flight = flyToCart(img);
    await vi.waitFor(() => expect(document.querySelector('[data-motion-ghost]')).not.toBeNull());
    gsap.globalTimeline.getChildren(false, true, true).forEach((t) => t.kill());
    gsap.globalTimeline.timeScale(100);
    await flight;
    expect(document.querySelector('[data-motion-ghost]')).toBeNull();
  });
});

describe('bump', () => {
  it("restarts on repeated calls — every call resolves, scale never compounds, a store's own tweens survive", async () => {
    const { gsap } = await import('gsap');
    const { bump } = await import('./commerce');
    document.body.innerHTML = '<button>Cart</button>';
    const cart = document.querySelector('button')!;
    const theirs = gsap.to(cart, { backgroundColor: 'red', duration: 1000, ease: 'none' });
    gsap.globalTimeline.timeScale(1);
    // Sample every GSAP frame rather than polling: at 1× the pulse is above
    // 1.05 for only a few hundred ms, and vi.waitFor's 50ms polls missed it
    // on a machine busy with parallel test runs (flaked, audit round 5).
    let rising = 1;
    const sample = () => {
      rising = Math.max(rising, Number(gsap.getProperty(cart, 'scale')));
    };
    gsap.ticker.add(sample);
    const first = bump(cart);
    await vi.waitFor(() => expect(rising).toBeGreaterThan(1.05), { timeout: 5000 });
    gsap.ticker.remove(sample);
    gsap.globalTimeline.timeScale(100);
    const peaks: number[] = [];
    const ticker = () => peaks.push(Number(gsap.getProperty(cart, 'scale')));
    gsap.ticker.add(ticker);
    await Promise.all([first, bump(cart), bump(cart)]);
    gsap.ticker.remove(ticker);
    expect(Math.max(...peaks)).toBeLessThanOrEqual(1.18 + 1e-6);
    expect(cart.style.transform).toBe('');
    expect(gsap.getTweensOf(cart)).toContain(theirs);
    theirs.kill();
  });

  // The test above passes even when pulses stack (each one scales to the
  // same absolute 1.18); count the live tweens instead.
  it('a new pulse replaces the running one instead of stacking another', async () => {
    const { gsap } = await import('gsap');
    const { bump } = await import('./commerce');
    document.body.innerHTML = '<button>Cart</button>';
    const cart = document.querySelector('button')!;
    gsap.globalTimeline.timeScale(0.01);
    const pulses = [bump(cart), bump(cart), bump(cart)];
    await vi.waitFor(() => expect(gsap.getTweensOf(cart).length).toBeGreaterThan(0));
    // One pulse = one timeline of two tweens (up, then back down)
    expect(gsap.getTweensOf(cart)).toHaveLength(2);
    gsap.globalTimeline.timeScale(100);
    await Promise.all(pulses);
    expect(cart.style.transform).toBe('');
  });
});

// ─── createFlip ──────────────────────────────────────────────

describe('createFlip', () => {
  it('returns an inert controller under reduced motion', async () => {
    reducedMotion = true;
    const { createFlip } = await import('./flip');
    document.body.innerHTML = '<ul><li data-flip-id="a">a</li></ul>';
    const flip = createFlip(document.querySelector('ul')!);
    expect(() => {
      flip.capture();
      flip.play();
      flip.dispose();
    }).not.toThrow();
  });

  it('animates a removed item out as an inert copy, then removes the copy', async () => {
    const { createFlip } = await import('./flip');
    document.body.innerHTML = '<ul><li data-flip-id="a" id="a">a</li><li data-flip-id="b">b</li></ul>';
    const list = document.querySelector('ul')!;
    placeAt(list.children[0]!, 0);
    placeAt(list.children[1]!, 100);
    const flip = createFlip(list);
    await flip.ready; // plugin loads on idle

    flip.capture();
    list.firstElementChild!.remove();
    flip.play();

    const ghost = document.querySelector<HTMLElement>('[data-flip-ghost]');
    expect(ghost).not.toBeNull();
    expect(ghost!.getAttribute('aria-hidden')).toBe('true');
    expect(ghost!.hasAttribute('inert')).toBe(true);
    expect(ghost!.id).toBe('');
    await vi.waitFor(() => expect(document.querySelector('[data-flip-ghost]')).toBeNull());
    flip.dispose();
  });

  it('dispose() removes a leave copy that is still fading out', async () => {
    const { gsap } = await import('gsap');
    const { createFlip } = await import('./flip');
    document.body.innerHTML = '<ul><li data-flip-id="a">a</li><li data-flip-id="b">b</li></ul>';
    const list = document.querySelector('ul')!;
    placeAt(list.children[0]!, 0);
    placeAt(list.children[1]!, 100);
    const flip = createFlip(list);
    await flip.ready;

    flip.capture();
    list.firstElementChild!.remove();
    gsap.globalTimeline.timeScale(0.01);
    flip.play();
    expect(document.querySelector('[data-flip-ghost]')).not.toBeNull();
    flip.dispose(); // e.g. the list unmounts mid-animation
    expect(document.querySelector('[data-flip-ghost]')).toBeNull();
  });

  it('inserts every leave copy in one batch before measuring any (performance)', async () => {
    const { createFlip } = await import('./flip');
    document.body.innerHTML = '<ul>' + ['a', 'b', 'c', 'd'].map((id) => `<li data-flip-id="${id}">${id}</li>`).join('') + '</ul>';
    const list = document.querySelector('ul')!;
    Array.from(list.children).forEach((li, i) => placeAt(li, i * 100));
    const flip = createFlip(list);
    await flip.ready;

    const records: MutationRecord[] = [];
    const mo = new MutationObserver((r) => records.push(...r));
    mo.observe(document.body, { childList: true });
    flip.capture();
    list.replaceChildren(list.children[3]!);
    flip.play();
    await Promise.resolve(); // deliver the mutation records
    mo.disconnect();

    // Was one insert per copy, each measured right after it went in — a
    // forced layout per removed card. Now all three go in together and are
    // measured after.
    const inserts = records.filter((r) =>
      Array.from(r.addedNodes).some((n) => n instanceof HTMLElement && n.hasAttribute('data-motion-ghost')),
    );
    expect(inserts).toHaveLength(1);
    expect(inserts[0]!.addedNodes).toHaveLength(3);
    flip.dispose();
  });

  it('copies only the removed items the shopper could see (performance)', async () => {
    const { createFlip } = await import('./flip');
    document.body.innerHTML = '<ul>' + ['a', 'b', 'c', 'd'].map((id) => `<li data-flip-id="${id}">${id}</li>`).join('') + '</ul>';
    const list = document.querySelector('ul')!;
    const [a, b, c, d] = Array.from(list.children);
    placeAt(a!, 100); // on screen (innerHeight 800)
    placeAt(b!, 760); // straddles the fold
    placeAt(c!, 2400); // far below
    placeAt(d!, -600); // scrolled past
    const flip = createFlip(list);
    await flip.ready;
    const { added, stop } = recordAdded();
    flip.capture();
    list.replaceChildren();
    flip.play();
    await Promise.resolve(); // deliver the mutation records
    stop();
    expect(added.filter((n) => n.hasAttribute('data-flip-ghost')).map((n) => n.textContent)).toEqual(['a', 'b']);
    flip.dispose();
  });

  // Round 5 (shopper journeys): filtering a collection down to zero
  // results logged "GSAP target not found" — Flip.from() ran with no items.
  it('filters down to nothing without calling Flip or warning', async () => {
    const { createFlip } = await import('./flip');
    const { loadFlip } = await import('./gsap');
    const Flip = await loadFlip();
    const from = vi.spyOn(Flip, 'from');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    document.body.innerHTML = '<ul><li data-flip-id="a">a</li><li data-flip-id="b">b</li></ul>';
    const list = document.querySelector('ul')!;
    placeAt(list.children[0]!, 0);
    placeAt(list.children[1]!, 100);
    const flip = createFlip(list);
    await flip.ready;
    flip.capture();
    list.replaceChildren();
    flip.play();
    expect(from).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    // the removed items still fade out as copies
    expect(document.querySelectorAll('[data-flip-ghost]').length).toBe(2);
    warn.mockRestore();
    from.mockRestore();
    flip.dispose();
  });

  it('records positions without building a matrix per item (no forced layout per card)', async () => {
    const { createFlip } = await import('./flip');
    const { loadFlip } = await import('./gsap');
    const Flip = await loadFlip();
    const getState = vi.spyOn(Flip, 'getState');
    document.body.innerHTML = '<ul><li data-flip-id="a">a</li></ul>';
    const list = document.querySelector('ul')!;
    const flip = createFlip(list);
    await flip.ready;
    flip.capture();
    expect(getState).toHaveBeenCalledWith(expect.any(Array), expect.objectContaining({ simple: true }));
    flip.dispose();
  });

  it('layers a leave copy with its container (e.g. above a drawer panel)', async () => {
    const { createFlip } = await import('./flip');
    document.body.innerHTML = '<aside style="position: fixed; z-index: 400"><ul><li data-flip-id="a">a</li></ul></aside>';
    const list = document.querySelector('ul')!;
    placeAt(list.children[0]!, 0);
    const flip = createFlip(list);
    await flip.ready;
    flip.capture();
    list.firstElementChild!.remove();
    flip.play();
    expect(document.querySelector<HTMLElement>('[data-flip-ghost]')!.style.zIndex).toBe('400');
    flip.dispose();
  });

  it('is instant once reduced motion is switched on after creation', async () => {
    const { createFlip } = await import('./flip');
    document.body.innerHTML = '<ul><li data-flip-id="a">a</li><li data-flip-id="b">b</li></ul>';
    const list = document.querySelector('ul')!;
    placeAt(list.children[0]!, 0);
    const flip = createFlip(list);
    await flip.ready;
    reducedMotion = true;
    flip.capture();
    list.firstElementChild!.remove();
    flip.play();
    expect(document.querySelector('[data-flip-ghost]')).toBeNull();
    flip.dispose();
  });

  it('dispose() mid-flight finishes the flip instead of freezing items, and spares other tweens', async () => {
    const { gsap } = await import('gsap');
    const { createFlip } = await import('./flip');
    document.body.innerHTML = '<ul><li data-flip-id="a">a</li><li data-flip-id="b">b</li></ul>';
    const list = document.querySelector('ul')!;
    const [a, b] = Array.from(list.children) as HTMLElement[];
    placeAt(a!, 0);
    placeAt(b!, 100);
    const flip = createFlip(list);
    await flip.ready;
    const theirs = gsap.to(a!, { backgroundColor: 'red', duration: 1000, ease: 'none' });

    flip.capture();
    list.append(a!); // swap order
    placeAt(a!, 100);
    placeAt(b!, 0);
    gsap.globalTimeline.timeScale(0.01);
    flip.play();
    await vi.waitFor(() => expect(a!.style.transform).not.toBe(''));
    flip.dispose();
    gsap.globalTimeline.timeScale(100);
    expect(a!.style.transform).toBe('');
    expect(b!.style.transform).toBe('');
    expect(gsap.getTweensOf(a!)).toContain(theirs);
    theirs.kill();
  });
});

// ─── React bindings ──────────────────────────────────────────

describe('react', () => {
  it('useReveal under StrictMode wires each target exactly once', async () => {
    const { useReveal } = await import('./react');
    function Page() {
      const ref = useReveal<HTMLDivElement>();
      return createElement('div', { ref }, createElement('section', { 'data-motion': 'reveal', className: 's' }, 'Below'));
    }
    const view = render(createElement(StrictMode, null, createElement(Page)));
    const section = view.container.querySelector<HTMLElement>('.s')!;
    placeAt(section, 1600);
    await vi.waitFor(() => expect(section.dataset.motionState).toBe('pending'));
    // One reveal() run: its reveal-line observer (the whole-view observer is its partner)
    expect(observers.filter((o) => o.targets.has(section) && o.options?.rootMargin)).toHaveLength(1);
    view.unmount();
    expect(section.style.opacity).toBe('');
  });
});

// ─── motion.css ──────────────────────────────────────────────

describe('motion.css', () => {
  const css = readFileSync(resolve(__dirname, 'motion.css'), 'utf8');

  it('holds the hero start state only during its delay, and never prints mid-entrance', () => {
    expect(css).not.toMatch(/ds-motion-(rise|settle)[^;]*\bboth\b/);
    expect(css).toMatch(/ds-motion-rise[^;]*\bbackwards\b/);
    expect(css).toMatch(/@media screen and \(prefers-reduced-motion: no-preference\)\s*{\s*:root:not\(\[data-motion='off'\]\) \[data-motion='hero'\]/);
  });

  it("styles only its own page transitions, not a store's other view transitions", () => {
    expect(css).toMatch(/types:\s*ds-page/);
    const pseudoRules = css.match(/^[^\n{}]*::view-transition-[^{]*{/gm) ?? [];
    expect(pseudoRules.length).toBeGreaterThan(0);
    for (const rule of pseudoRules) expect(rule).toMatch(/^:root:active-view-transition-type\(ds-page\)(\[data-motion='off'\])?::/);
  });

  it('navigates with a plain cut, not even the default cross-fade, when the page opted out of motion', () => {
    const off = css.match(/((?::root:active-view-transition-type\(ds-page\)\[data-motion='off'\]::view-transition-[a-z]+\(\*\),?\s*)+){\s*animation:\s*none;\s*}/);
    expect(off).not.toBeNull();
    for (const part of ['group', 'old', 'new']) expect(off![1]).toContain(`::view-transition-${part}(*)`);
  });
});
