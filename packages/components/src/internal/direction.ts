/**
 * Whether `el` lays out right-to-left — for arrow keys and scroll maths
 * that must follow the visual direction (in RTL the "next" item is to the
 * left).
 *
 * Computed style in browsers, so `direction` set from CSS or `dir="auto"`
 * counts too. jsdom computes no `direction`, so there it falls back to the
 * nearest `dir` attribute. One helper so every component answers the same
 * way: some read only the attribute (missing CSS-set direction), one read
 * only the computed style (untestable in jsdom).
 */
export function isRtl(el: Element): boolean {
  const direction = getComputedStyle(el).direction;
  if (direction) return direction === 'rtl';
  return el.closest('[dir]')?.getAttribute('dir')?.toLowerCase() === 'rtl';
}
