/**
 * A decorative copy of an element, pinned (position: fixed) exactly where
 * the original appeared — the leaving item of a FLIP, the product image
 * of a fly-to-cart.
 *
 * The copy is inert and aria-hidden, and loses every id and form `name`:
 * it can never be focused, announced, targeted by a label or
 * aria-labelledby, or join a radio group (a cloned checked radio would
 * uncheck the real one). It is marked data-motion-ghost so reveal() never
 * treats it as new content.
 */
export function ghostOf(source: Element, rect: DOMRect, zIndex = 'auto'): HTMLElement {
  return ghostsOf([{ source, rect }], zIndex)[0]!;
}

/**
 * Several copies at once — the cards a filter removes. Every copy is
 * inserted, then every copy is measured, then any correction is written:
 * one layout for the whole batch. Made one at a time, each copy's
 * measurement forced a fresh layout (the previous copy had just been
 * inserted), so a filter that removed 12 cards paid for 12 layouts inside
 * the click handler.
 */
export function ghostsOf(items: ReadonlyArray<{ source: Element; rect: DOMRect }>, zIndex = 'auto'): HTMLElement[] {
  const ghosts = items.map(({ source, rect }) => copyOf(source, rect, zIndex));
  document.body.append(...ghosts);

  // Fixed positioning is relative to the viewport — unless <html> or
  // <body> has a transform or filter (some themes shift the page for a
  // drawer). Measure where the copies landed and correct for it. Reads
  // first, writes after.
  const landed = ghosts.map((ghost) => ghost.getBoundingClientRect());
  ghosts.forEach((ghost, i) => {
    const at = landed[i]!;
    const { rect } = items[i]!;
    const dx = at.left - rect.left;
    const dy = at.top - rect.top;
    if ((at.width || at.height) && (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5)) {
      ghost.style.left = `${rect.left - dx}px`;
      ghost.style.top = `${rect.top - dy}px`;
    }
  });
  return ghosts;
}

/** The detached, pinned copy — not yet in the document. */
function copyOf(source: Element, rect: DOMRect, zIndex: string): HTMLElement {
  const ghost = source.cloneNode(true) as HTMLElement;
  for (const node of [ghost, ...Array.from(ghost.querySelectorAll('[id], [name]'))]) {
    node.removeAttribute('id');
    node.removeAttribute('name');
  }
  ghost.setAttribute('aria-hidden', 'true');
  ghost.setAttribute('inert', '');
  ghost.dataset.motionGhost = '';
  // Lock an image to the file already on screen: srcset/sizes on a copy
  // of a different size, or a <picture>'s lost <source>, would fetch anew.
  if (source instanceof HTMLImageElement && ghost instanceof HTMLImageElement) {
    ghost.src = source.currentSrc || source.src;
    ghost.removeAttribute('srcset');
    ghost.removeAttribute('sizes');
    ghost.removeAttribute('loading');
  }

  const s = ghost.style;
  // The rect already includes any transform the original had mid-animation.
  for (const p of ['transform', 'translate', 'rotate', 'scale']) s.removeProperty(p);
  s.position = 'fixed';
  s.top = `${rect.top}px`;
  s.left = `${rect.left}px`;
  s.width = `${rect.width}px`;
  s.height = `${rect.height}px`;
  s.margin = '0';
  s.boxSizing = 'border-box';
  s.pointerEvents = 'none';
  s.zIndex = zIndex;
  return ghost;
}
