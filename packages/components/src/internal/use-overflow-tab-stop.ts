import { useEffect, useState } from 'react';

/**
 * A dialog body (Modal, Drawer) scrolls when its content is long, but
 * Radix's focus trap only cycles through tabbable controls — a body of
 * plain text (a returns policy) had no way in, so keyboard users could not
 * scroll it at all (WCAG 2.1.1, axe scrollable-region-focusable). While
 * the body overflows, it becomes a tab stop: pass `overflows` to its
 * tabIndex.
 *
 * Returns a callback ref for the scrolling element and whether it
 * currently overflows. Re-measures when the element or any direct child
 * resizes, and when children are added or removed.
 */
export function useOverflowTabStop() {
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const [overflows, setOverflows] = useState(false);
  useEffect(() => {
    if (!node || typeof ResizeObserver === 'undefined') return;
    const check = () => setOverflows(node.scrollHeight > node.clientHeight + 1);
    const observer = new ResizeObserver(check);
    const observeAll = () => {
      observer.disconnect();
      observer.observe(node);
      Array.from(node.children).forEach((child) => observer.observe(child));
      check();
    };
    observeAll();
    const mutations = new MutationObserver(observeAll);
    mutations.observe(node, { childList: true });
    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, [node]);
  return [setNode, overflows] as const;
}
