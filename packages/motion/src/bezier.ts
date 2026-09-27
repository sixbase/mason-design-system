/**
 * cubic-bezier() → easing function, so GSAP can run the exact curves the
 * CSS easing tokens use without loading CustomEase (~3KB gz).
 *
 * Same approach browsers use: x(t) is monotonic on [0,1] for valid CSS
 * curves, so solve x(t) = progress with Newton-Raphson (fast, converges
 * in 2–4 steps for typical curves) and fall back to bisection where the
 * slope is too flat for Newton to be stable. Then return y(t).
 */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): (p: number) => number {
  // Polynomial coefficients for B(t) = ((a·t + b)·t + c)·t
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const slopeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  const solveT = (x: number): number => {
    let t = x;
    for (let i = 0; i < 6; i++) {
      const err = sampleX(t) - x;
      if (Math.abs(err) < 1e-6) return t;
      const d = slopeX(t);
      if (Math.abs(d) < 1e-6) break;
      t -= err / d;
    }
    // Bisection fallback
    let lo = 0;
    let hi = 1;
    t = x;
    for (let i = 0; i < 24; i++) {
      const v = sampleX(t);
      if (Math.abs(v - x) < 1e-6) return t;
      if (v < x) lo = t;
      else hi = t;
      t = (lo + hi) / 2;
    }
    return t;
  };

  return (p: number) => {
    if (p <= 0) return 0;
    if (p >= 1) return 1;
    return sampleY(solveT(p));
  };
}
