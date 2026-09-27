// Token values are consumed as CSS custom properties via @ds/tokens/css.
// See packages/tokens/dist/tokens.css for the generated output.
// See packages/tokens/src/tokens.json for the source of truth.
//
// The one JS export is `motion`: JavaScript animation (GSAP in @ds/motion)
// can't read CSS custom properties cheaply mid-tween, so the same
// tokens.json values are exposed here as plain numbers. One source, two
// outputs — a duration change in tokens.json moves CSS transitions and
// GSAP timelines together. The values come from src/motion.json, a small
// subset build-css.mjs generates, so JS bundles don't carry every token.
import motionTokens from './motion.json';

type Bezier = [number, number, number, number];

function toNumbers<K extends string>(group: Record<K, string>): Record<K, number> {
  const out = {} as Record<K, number>;
  for (const key of Object.keys(group) as K[]) {
    // "162ms" → 162, "16px" → 16
    out[key] = parseFloat(group[key]);
  }
  return out;
}

function toBeziers<K extends string>(group: Record<K, string>): Record<K, Bezier> {
  const out = {} as Record<K, Bezier>;
  for (const key of Object.keys(group) as K[]) {
    const inner = /cubic-bezier\(([^)]+)\)/.exec(group[key])?.[1];
    if (!inner) throw new Error(`Easing token "${key}" is not a cubic-bezier()`);
    out[key] = inner.split(',').map(Number) as Bezier;
  }
  return out;
}

export const motion = {
  /** Milliseconds — the ×φ series: 100, 162, 262, 424, 686 */
  duration: toNumbers(motionTokens.duration),
  /** cubic-bezier control points, identical to the CSS easing tokens */
  easing: toBeziers(motionTokens.easing),
  /** Milliseconds between staggered siblings */
  stagger: toNumbers(motionTokens.stagger),
  /** Pixels of travel for enter/reveal motion */
  distance: toNumbers(motionTokens.distance),
} as const;

export type MotionTokens = typeof motion;
export type MotionEasing = keyof typeof motion.easing;
export type MotionDuration = keyof typeof motion.duration;
