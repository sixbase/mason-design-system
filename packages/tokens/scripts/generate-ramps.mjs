// Generate 12-step accent ramps harmonized with the stone neutral spine.
// Anchors (existing brand values) are preserved byte-identical; only the
// missing steps (0, 200, 300, 800, 900, 950) are derived, in OKLCH.
//
// This is a REFERENCE/REGENERATION tool, not part of the build: its output
// was pasted into src/tokens.json on 2026-07-01 (see the decisions log entry
// "Accent Ramps Extended to 12 Steps"). Run `node scripts/generate-ramps.mjs`
// to re-derive — e.g. after changing an anchor — and re-paste the fragment.

// ── sRGB ↔ OKLab/OKLCH ──────────────────────────────────────
const srgb2lin = c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lin2srgb = c => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

function hex2rgb(hex) {
  const h = hex.replace('#', '');
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
}
function rgb2hex([r, g, b]) {
  const q = v => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, '0').toUpperCase();
  return '#' + q(r) + q(g) + q(b);
}
function rgb2oklab([r, g, b]) {
  const [lr, lg, lb] = [r, g, b].map(srgb2lin);
  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;
  const [l_, m_, s_] = [l, m, s].map(Math.cbrt);
  return [
    0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  ];
}
function oklab2rgb([L, a, b]) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const [l, m, s] = [l_, m_, s_].map(v => v ** 3);
  return [
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map(lin2srgb);
}
const lab2lch = ([L, a, b]) => [L, Math.hypot(a, b), (Math.atan2(b, a) * 180) / Math.PI];
const lch2lab = ([L, C, h]) => [L, C * Math.cos((h * Math.PI) / 180), C * Math.sin((h * Math.PI) / 180)];
const hex2lch = hex => lab2lch(rgb2oklab(hex2rgb(hex)));

// Reduce chroma until inside the sRGB gamut, then hex.
function lch2hex([L, C, h]) {
  for (let c = C; c >= 0; c -= 0.001) {
    const rgb = oklab2rgb(lch2lab([L, c, h]));
    if (rgb.every(v => v >= -0.0005 && v <= 1.0005)) return rgb2hex(rgb);
  }
  return rgb2hex(oklab2rgb(lch2lab([L, 0, h])));
}

// WCAG contrast
function lum(hex) {
  const [r, g, b] = hex2rgb(hex).map(srgb2lin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const cr = (x, y) => {
  const [a, b] = [lum(x), lum(y)].sort((p, q) => q - p);
  return (a + 0.05) / (b + 0.05);
};

// ── Palettes ────────────────────────────────────────────────
const STEPS = ['0', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
const stone = {
  0: '#FFFFFF', 50: '#FAF9F7', 100: '#F2F0EB', 200: '#E3DED6', 300: '#C8C2B8',
  400: '#A59E94', 500: '#847D73', 600: '#675F56', 700: '#4E473F', 800: '#342F2A',
  900: '#1F1C18', 950: '#131010',
};
const accents = {
  brick: { 50: '#FDF0ED', 100: '#FAE0D8', 400: '#E07060', 500: '#C45040', 600: '#A03830', 700: '#7D2A24' },
  sage:  { 50: '#F2F7F0', 100: '#E0EDD9', 400: '#82B074', 500: '#5E8F50', 600: '#4A7040', 700: '#375530' },
  amber: { 50: '#FBF5E6', 100: '#F5E7C0', 400: '#D4A040', 500: '#B8853A', 600: '#9A6B28', 700: '#7A5020' },
  slate: { 50: '#EFF2F8', 100: '#DDE4F0', 400: '#7A90B8', 500: '#607AA8', 600: '#4A5F8A', 700: '#374870' },
};

const stoneLCH = Object.fromEntries(Object.entries(stone).map(([k, v]) => [k, hex2lch(v)]));

const lerp = (a, b, t) => a + (b - a) * t;
const lerpHue = (a, b, t) => {
  let d = b - a;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return a + d * t;
};

const out = {};
for (const [name, ramp] of Object.entries(accents)) {
  const A = Object.fromEntries(Object.entries(ramp).map(([k, v]) => [k, hex2lch(v)]));
  const dL = k => A[k][0] - stoneLCH[k][0]; // accent's lightness offset from the stone spine

  const gen = {};
  // 200/300: bridge the pastel tints (100) to the vivid mid (400).
  // Lightness rides the stone spine + interpolated offset; hue/chroma interpolate.
  for (const [step, t] of [['200', 1 / 3], ['300', 2 / 3]]) {
    gen[step] = [
      stoneLCH[step][0] + lerp(dL('100'), dL('400'), t),
      lerp(A['100'][1], A['400'][1], t),
      lerpHue(A['100'][2], A['400'][2], t),
    ];
  }
  // 800/900/950: descend from 700 toward the stone dark ground.
  // Offsets and chroma taper by powers of 1/φ so every ramp converges on the
  // same near-black the dark theme backgrounds live in.
  const inv = 0.618;
  const taper = { 800: inv, 900: inv ** 2, 950: inv ** 3.5 };
  for (const step of ['800', '900', '950']) {
    gen[step] = [
      stoneLCH[step][0] + dL('700') * taper[step],
      Math.max(A['700'][1] * taper[step], stoneLCH[step][1]),
      A['700'][2],
    ];
  }
  // 0: the faintest wash — one breath off pure white, hue of the 50 tint.
  gen['0'] = [lerp(stoneLCH['0'][0], A['50'][0], 0.35), A['50'][1] * 0.45, A['50'][2]];

  out[name] = {};
  for (const step of STEPS) out[name][step] = ramp[step] ?? lch2hex(gen[step]);
}

// ── Report ──────────────────────────────────────────────────
for (const [name, ramp] of Object.entries(out)) {
  console.log(`\n${name}:`);
  for (const step of STEPS) {
    const [L, C, h] = hex2lch(ramp[step]);
    const isNew = !(step in accents[name]);
    console.log(
      `  ${step.padStart(3)}: ${ramp[step]}  L=${L.toFixed(3)} C=${C.toFixed(3)} h=${h.toFixed(1).padStart(6)}` +
      (isNew ? '  ← new' : ''),
    );
  }
}

console.log('\n── Lightness spine check (accent L − stone L per step) ──');
for (const [name, ramp] of Object.entries(out)) {
  const diffs = STEPS.map(s => (hex2lch(ramp[s])[0] - stoneLCH[s][0]).toFixed(2)).join(' ');
  console.log(`  ${name.padEnd(6)} ${diffs}`);
}

console.log('\n── Monotonic lightness check ──');
for (const [name, ramp] of Object.entries(out)) {
  const Ls = STEPS.map(s => hex2lch(ramp[s])[0]);
  const mono = Ls.every((v, i) => i === 0 || v < Ls[i - 1] + 1e-6);
  console.log(`  ${name}: ${mono ? 'OK' : 'NOT MONOTONIC ' + Ls.map(x => x.toFixed(3)).join(',')}`);
}

console.log('\n── Contrast checks ──');
for (const [name, ramp] of Object.entries(out)) {
  console.log(
    `  ${name.padEnd(6)} 600/white ${cr(ramp['600'], '#FFFFFF').toFixed(2)}  700/50 ${cr(ramp['700'], ramp['50']).toFixed(2)}` +
    `  | dark: 400/stone900 ${cr(ramp['400'], stone['900']).toFixed(2)}  300/stone950 ${cr(ramp['300'], stone['950']).toFixed(2)}` +
    `  200/stone900 ${cr(ramp['200'], stone['900']).toFixed(2)}`,
  );
}

// JSON fragment for tokens.json
console.log('\n── tokens.json fragment ──');
for (const [name, ramp] of Object.entries(out)) {
  console.log(`      "${name}": {`);
  console.log(STEPS.map(s => `        "${s}":${' '.repeat(4 - s.length)}"${ramp[s]}"`).join(',\n'));
  console.log('      },');
}
