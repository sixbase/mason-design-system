// @ds/motion — the choreography layer.
//
// CSS owns micro-interactions (hover, press, focus, overlay open/close):
// they must be instant and work without JavaScript. This package owns what
// CSS can't do well — scroll-triggered sequences, layout (FLIP) transitions,
// line-split text, and cross-element moments like fly-to-cart — using the
// same duration and easing tokens as the CSS.
//
// This package is ~6KB minified + gzipped. GSAP itself is fetched lazily, after
// load and in idle time, and only on pages that actually declare motion —
// never for visitors with reduced motion, Save-Data, or a 2G-class connection.
// It never changes GSAP's global defaults, so a store using GSAP directly
// is unaffected.
export { getMotionLevel, isRichPointer, watchMotionLevel, whenIdle } from './env';
export type { MotionLevel } from './env';
export { distance, duration, ease, loadFlip, loadGsap, loadScrollTrigger, loadSplitText, stagger } from './gsap';
export type { Gsap } from './gsap';
export { enter, reveal } from './reveal';
export type { RevealOptions } from './reveal';
export { createFlip } from './flip';
export type { FlipController } from './flip';
export { bump, flyToCart } from './commerce';
export { cubicBezier } from './bezier';
