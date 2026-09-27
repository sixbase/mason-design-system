/**
 * Everything a frame does to its own document: theme, direction, test
 * modes, error reporting, scroll linking and the accessibility check.
 */
import type { AxeIssue, FrameParams, FrameToShell, ShellToFrame } from '../lib/messages';
import { frameHash, isWbMessage, parseFrameHash } from '../lib/messages';

export function post(msg: FrameToShell) {
  if (window.parent !== window) window.parent.postMessage(msg, window.location.origin);
}

const fid = () => parseFrameHash(window.location.hash).fid;

/** What this frame is showing right now, in the same form the shell writes it */
export const currentView = () => frameHash(parseFrameHash(window.location.hash));

// ─── Theme and test modes ───────────────────────────────────

export function applyEnvironment(p: FrameParams) {
  const root = document.documentElement;
  root.classList.toggle('dark', p.theme === 'dark');
  root.dir = p.rtl ? 'rtl' : 'ltr';
  root.classList.toggle('wb-outlines', p.outlines);
  // Motion off = the design system's own switch: tokens.css stops CSS
  // motion under <html data-motion="off"> and @ds/motion skips its JS.
  // (No frame-level freeze stylesheet: a blanket `*` reset also froze
  // .ds-motion-safe elements — the Spinner's reduced-motion pulse — so the
  // frame showed a solid ring the product never shows.)
  if (p.motion) delete root.dataset.motion;
  else root.dataset.motion = 'off';
}

// ─── Loading ────────────────────────────────────────────────

/** Placeholders carry this attribute while a story module or sheet loads */
export const LOADING_ATTR = 'data-wb-loading';

/**
 * Resolves once nothing in the frame is still loading (or after `timeout`),
 * plus a frame for React to commit — so checks never run against "Loading…".
 */
export function whenSettled(timeout = 5000): Promise<void> {
  const start = performance.now();
  return new Promise((resolve) => {
    const tick = () => {
      if (!document.querySelector(`[${LOADING_ATTR}]`) || performance.now() - start > timeout) {
        requestAnimationFrame(() => resolve());
      } else {
        window.setTimeout(tick, 50);
      }
    };
    tick();
  });
}

// ─── Stretch text (stress test) ─────────────────────────────

/*
 * Doubles every piece of visible text in the document — including overlay
 * portals (modals, menus, tooltips render outside the frame root), text
 * that loads late, and text React changes later (a ticking countdown, an
 * accordion opened after the mode was switched on). A MutationObserver
 * re-applies it as the page changes; a WeakMap remembers each node's
 * original text so switching the mode off restores it exactly, without
 * holding removed nodes in memory.
 */
const stretchedText = new WeakMap<Text, { original: string; applied: string }>();
let stretchObserver: MutationObserver | null = null;

const shouldStretch = (n: Text) => {
  const parent = n.parentElement;
  if (!parent || parent.closest('script, style, .wb-story__label')) return false;
  return /[\p{L}\p{N}]{2,}/u.test(n.nodeValue ?? '');
};

function stretchNode(n: Text) {
  const value = n.nodeValue ?? '';
  const known = stretchedText.get(n);
  if (known && known.applied === value) return; // already doubled (or our own write)
  if (!shouldStretch(n)) return;
  const applied = `${value} ${value.trim()}`;
  stretchedText.set(n, { original: value, applied });
  n.nodeValue = applied;
}

function eachText(root: Node, fn: (n: Text) => void) {
  if (root.nodeType === Node.TEXT_NODE) {
    fn(root as Text);
    return;
  }
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) fn(n as Text);
}

export function setStretch(on: boolean) {
  if (on && !stretchObserver) {
    eachText(document.body, stretchNode);
    stretchObserver = new MutationObserver((records) => {
      for (const r of records) {
        if (r.type === 'characterData') stretchNode(r.target as Text);
        else r.addedNodes.forEach((node) => eachText(node, stretchNode));
      }
    });
    stretchObserver.observe(document.body, { subtree: true, childList: true, characterData: true });
  } else if (!on && stretchObserver) {
    stretchObserver.disconnect();
    stretchObserver = null;
    eachText(document.body, (n) => {
      const known = stretchedText.get(n);
      // Only undo our own doubling — if React has since replaced the text, keep React's
      if (known && n.nodeValue === known.applied) n.nodeValue = known.original;
      stretchedText.delete(n);
    });
  }
}

// ─── Errors ─────────────────────────────────────────────────

// Keyed by view, so the same error in the next component is reported again
const reported = new Set<string>();

export function reportError(message: string) {
  const text = message.replace(/\s+/g, ' ').trim().slice(0, 400);
  const view = currentView();
  if (!text || reported.has(`${view}\n${text}`)) return;
  reported.add(`${view}\n${text}`);
  post({ type: 'wb:error', fid: fid(), view, message: text });
}

export function installErrorReporting() {
  window.addEventListener('error', (e) => reportError(e.message || String(e.error)));
  window.addEventListener('unhandledrejection', (e) => reportError(`Unhandled: ${String(e.reason)}`));
  const original = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    original(...args);
    // React dev warnings use printf-style %s placeholders
    const [first, ...rest] = args;
    let msg = typeof first === 'string' ? first : String(first);
    for (const r of rest) msg = msg.replace(/%[sdoO]/, String(r));
    reportError(msg);
  };
}

// ─── Linked scrolling ───────────────────────────────────────

let suppressUntil = 0;
let frame = 0;

/** How far down the whole document is scrolled, 0–1 */
const pageFraction = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
};

/**
 * Component sheets link by state (the same state lines up in every frame).
 * Store pages and foundation sheets have no states, so they link by how far
 * down the page each frame is — the phone page is taller than the desktop
 * one, so matching pixels would put them at different sections.
 */
function currentPosition(): { story: string; offset: number } | null {
  const sections = document.querySelectorAll<HTMLElement>('[data-wb-story]');
  if (!sections.length) return { story: '', offset: pageFraction() };
  for (const s of sections) {
    const r = s.getBoundingClientRect();
    if (r.bottom > 0) {
      return { story: s.dataset.wbStory ?? '', offset: r.height ? Math.min(1, Math.max(0, -r.top / r.height)) : 0 };
    }
  }
  return null;
}

export function installScrollLink() {
  window.addEventListener(
    'scroll',
    () => {
      if (performance.now() < suppressUntil || frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const pos = currentPosition();
        if (pos) post({ type: 'wb:scroll', fid: fid(), view: currentView(), ...pos });
      });
    },
    { passive: true },
  );
}

export function scrollToStory(story: string, offset = 0, smooth = false) {
  if (!story) {
    // A store page or sheet: the same fraction of the way down
    suppressUntil = performance.now() + 250;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: Math.max(0, max) * offset, behavior: smooth ? 'smooth' : 'auto' });
    return;
  }
  const el = document.querySelector<HTMLElement>(`[data-wb-story="${CSS.escape(story)}"]`);
  if (!el) return;
  suppressUntil = performance.now() + 250;
  const top = el.getBoundingClientRect().top + window.scrollY + el.offsetHeight * offset;
  window.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' });
}

// ─── Accessibility check ────────────────────────────────────

let axeRunning = false;
let lastRun = 0;
let queuedRun = 0;

/**
 * One check at a time (axe throws if started twice). A request that
 * arrives mid-check is queued, not dropped — otherwise the shell would
 * wait forever for an answer. Repeats of a run already done are ignored.
 */
export async function runAxe(run: number) {
  if (run === lastRun || run === queuedRun) return;
  if (axeRunning) {
    queuedRun = run;
    return;
  }
  axeRunning = true;
  lastRun = run;
  try {
    await whenSettled();
    // Capture what's on screen now: if the frame moves on mid-check, the
    // shell sees the old view on the result and ignores it.
    const view = currentView();
    try {
      post({ type: 'wb:axe', fid: fid(), view, run, issues: await runAxeOnce() });
    } catch (err) {
      post({ type: 'wb:axe', fid: fid(), view, run, issues: [], failed: String(err) });
    }
  } finally {
    axeRunning = false;
    if (queuedRun) {
      const next = queuedRun;
      queuedRun = 0;
      void runAxe(next);
    }
  }
}

async function runAxeOnce(): Promise<AxeIssue[]> {
  const { default: axe } = await import('axe-core');
  // The whole body, so overlays rendered in portals (modals, menus) are checked too
  const result = await axe.run(document.body, {
    resultTypes: ['violations'],
    // Page-level rules don't apply to a sheet of isolated specimens
    rules: {
      region: { enabled: false },
      'landmark-one-main': { enabled: false },
      'page-has-heading-one': { enabled: false },
      'landmark-unique': { enabled: false },
      'landmark-no-duplicate-banner': { enabled: false },
      'landmark-no-duplicate-contentinfo': { enabled: false },
    },
  });
  // WCAG exempts text that is part of a disabled control (1.4.3), but axe
  // can't see that a label or hint belongs to one. Drop contrast findings
  // inside anything the design system marks disabled, so the toolbar only
  // reports real problems.
  const DISABLED = '[class*="--disabled"], [data-disabled], [aria-disabled="true"], :disabled';
  const nodeOf = (target: unknown): Element | null => {
    const selector = Array.isArray(target) ? String(target[target.length - 1]) : String(target);
    try {
      return document.querySelector(selector);
    } catch {
      return null;
    }
  };
  const insideDisabled = (target: unknown) => Boolean(nodeOf(target)?.closest(DISABLED));
  // Which state each problem is in, by the label printed above it — so the
  // results say where to look ("in Disabled"), not a CSS selector
  const stateOf = (target: unknown) =>
    nodeOf(target)?.closest('[data-wb-story]')?.querySelector('.wb-story__label')?.textContent?.trim() ?? '';
  return result.violations
    .map((v) => ({
      ...v,
      nodes: v.id === 'color-contrast' ? v.nodes.filter((n) => !insideDisabled(n.target)) : v.nodes,
    }))
    .filter((v) => v.nodes.length > 0)
    .map((v) => ({
      id: v.id,
      impact: v.impact ?? 'minor',
      help: v.help,
      count: v.nodes.length,
      states: [...new Set(v.nodes.map((n) => stateOf(n.target)).filter(Boolean))],
      targets: v.nodes.slice(0, 3).map((n) => n.target.join(' ')),
    }));
}

export function installShellListener(onScrollTo: (story: string, offset: number) => void) {
  window.addEventListener('message', (e: MessageEvent) => {
    if (e.origin !== window.location.origin || e.source !== window.parent || !isWbMessage(e.data)) return;
    const msg = e.data as ShellToFrame;
    if (msg.type === 'wb:scrollTo') onScrollTo(msg.story, msg.offset);
    if (msg.type === 'wb:runAxe') void runAxe(msg.run);
  });
}

// ─── Shortcuts typed while focus is inside a frame ──────────

// Widgets where a letter key means "jump to the option starting with…"
const TYPEAHEAD = '[role="listbox"], [role="menu"], [role="menubar"], [role="combobox"]';

export function installKeyForwarding() {
  window.addEventListener('keydown', (e) => {
    const t = e.target as HTMLElement | null;
    if (e.defaultPrevented || e.isComposing || e.metaKey || e.ctrlKey || e.altKey) return;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    // An open select or menu owns its letter keys (typeahead). Dialogs don't
    // block: overlay stories open on load and still need J/K to move on.
    if (t?.closest?.(TYPEAHEAD)) return;
    if (/^[jkgntwr[\]]$/i.test(e.key)) {
      e.preventDefault();
      post({ type: 'wb:key', key: e.key.toLowerCase() });
    }
  });
}

// ─── Links inside specimens ─────────────────────────────────

/**
 * Store-page links use in-frame routes (`#/page/examples/cart`). A click
 * asks the shell to switch every frame (and the sidebar) to that page.
 * Links that would leave the workbench are swallowed.
 *
 * Same-page anchors (skip links → `#main-content`) are followed by hand:
 * letting the browser do it would replace the frame's route hash — the
 * frame would forget what it shows — and add a Back-button step.
 */
export function installLinkRouting() {
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const a = (e.target as Element | null)?.closest?.('a[href]');
    if (!a) return;
    const href = a.getAttribute('href') ?? '';
    e.preventDefault();
    const route = href.match(/^#\/page\/(?:examples\/)?([\w-]*)/);
    if (route) {
      post({ type: 'wb:navigate', kind: 'page', id: route[1] || 'homepage' });
      return;
    }
    const anchor = href.match(/^#([\w-]+)$/);
    const target = anchor ? document.getElementById(anchor[1]!) : null;
    if (target) {
      target.scrollIntoView({ block: 'start' });
      // Moves focus like a real fragment jump does (targets carry tabindex="-1")
      target.focus({ preventScroll: true });
    }
  });
}
