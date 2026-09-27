#!/usr/bin/env node
/**
 * check-css — guards component CSS against mistakes that fail silently.
 *
 * Runs as part of `pnpm --filter @ds/components lint`. No dependencies,
 * ~100ms. It checks every src/**\/*.css file for:
 *
 *   1. var(--x) with no fallback that nothing defines. A misspelt or
 *      renamed token doesn't error — the declaration just drops out.
 *      "Defined" = in @ds/tokens' tokens.css, declared in any component
 *      CSS, set from a component .tsx (style={{ '--x': … }}), or --radix-*.
 *   2. Component custom properties declared but never read (a knob that
 *      does nothing when a consumer turns it).
 *   3. Raw values: hex / rgb() / hsl() / named colours, px / rem / em
 *      lengths, ms / s durations, cubic-bezier() / steps(), and bare
 *      numbers for z-index, font-weight, opacity, line-height and scale().
 *   4. !important outside @media (prefers-reduced-motion: reduce).
 *   5. @media widths that aren't the token breakpoints.
 *   6. :hover outside @media (hover: hover). Touch screens (iOS Safari)
 *      keep :hover after a tap, so a hover fill sticks and reads as
 *      "selected" or "pressed". Exempt: :not(:hover) (a keyboard highlight
 *      shown when the pointer isn't there — gating it would hide it on
 *      touch) and rules inside reduced-motion / forced-colors blocks.
 *
 * ALLOWED without a token (keep this list short — every entry is a rule):
 *   - 0 in any unit; percentages; fr; deg/turn (geometry, not design values)
 *   - viewport units (100vh, 50dvh…): proportions of the screen, like %
 *   - ch: reading measures (the 65ch rule in CLAUDE.md is written in ch)
 *   - 1em / 1lh / 1cap: "exactly the size of the surrounding text"
 *   - 0.05em: the optical-centering nudge in the text-box-trim fallbacks
 *     (token pending — see 03-tokens.md, "No optical nudge token")
 *   - scale(1), scale(-1) / scaleX(-1): identity and mirroring
 *   - z-index -1 / 0 / 1: stacking inside one component
 *   - 1px / -1px on width, height, margin in the visually-hidden pattern
 *     (a rule that also sets clip-path: inset(50%) or clip: rect(…))
 *   - @container conditions: container queries can't read custom
 *     properties, so component-local breakpoints are written as lengths
 *   - FILE_ALLOW below: named one-offs, each with its reason
 *
 * Exit code 1 on any finding, so CI fails.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const PKG = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(PKG, 'src');
const require = createRequire(import.meta.url);

/** Named one-offs: file (relative to src) → values allowed in it, with why. */
const FILE_ALLOW = {
  // Inline code sits inside any text size (a heading, a caption), so its
  // size and padding must stay relative to that text. No relative-size
  // tokens exist; fixed spacing tokens would make it wrong at every size
  // but one.
  'typography/Typography.css': ['0.9em', '0.1em', '0.35em'],
};

/** min-width / max-width values allowed in @media — the --breakpoint-* tokens (max = token − 1). */
const BREAKPOINTS = { min: [640, 768, 1024, 1280], max: [639, 767, 1023, 1279] };

const NAMED_COLORS =
  /(?<![\w-])(white|black|red|green|blue|gray|grey|silver|orange|yellow|purple|pink|navy|teal|maroon|olive|lime|aqua|fuchsia|brown|gold|beige|ivory|tan|coral|salmon|crimson|indigo|violet)(?![\w-])/i;

// ─── Files ────────────────────────────────────────────────────
function walk(dir, ext, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, ext, out);
    else if (e.name.endsWith(ext)) out.push(p);
  }
  return out;
}
const cssFiles = walk(SRC, '.css');
const tsxFiles = walk(SRC, '.tsx').filter((f) => !/\.(test|stories)\.tsx$/.test(f));

// ─── Tiny CSS reader: declarations with their at-rule/selector context ──
/** Blank out comments and strings' contents, keeping offsets and newlines. */
function blankComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
}

/**
 * Returns { decls: [{prop, value, line, context: string[], rule}], atRules: [{prelude, line}] }.
 * context = preludes of the enclosing blocks, outermost first.
 */
function parse(src) {
  const text = blankComments(src);
  const decls = [];
  const atRules = [];
  const stack = []; // { prelude, decls: [] }
  let start = 0;
  let paren = 0;
  let quote = null;
  const lineAt = (i) => text.slice(0, i).split('\n').length;
  const flush = (end) => {
    const chunk = text.slice(start, end);
    const trimmed = chunk.trim();
    if (!trimmed || !stack.length) return;
    const colon = trimmed.indexOf(':');
    if (colon < 1) return;
    const lead = chunk.length - chunk.trimStart().length;
    const decl = {
      prop: trimmed.slice(0, colon).trim().toLowerCase(),
      value: trimmed.slice(colon + 1).trim(),
      line: lineAt(start + lead),
      context: stack.map((s) => s.prelude),
      rule: stack[stack.length - 1],
    };
    decls.push(decl);
    stack[stack.length - 1].decls.push(decl);
  };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      if (c === '\\') i++;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'") quote = c;
    else if (c === '(') paren++;
    else if (c === ')') paren--;
    else if (paren > 0) continue;
    else if (c === '{') {
      const prelude = text.slice(start, i).trim().replace(/\s+/g, ' ');
      if (prelude.startsWith('@')) atRules.push({ prelude, line: lineAt(i) });
      stack.push({ prelude, decls: [] });
      start = i + 1;
    } else if (c === ';') {
      flush(i);
      start = i + 1;
    } else if (c === '}') {
      flush(i);
      stack.pop();
      start = i + 1;
    }
  }
  return { decls, atRules };
}

// ─── Definitions ──────────────────────────────────────────────
const tokensCss = fs.readFileSync(require.resolve('@ds/tokens/css'), 'utf8');
const tokenDefs = new Set([...tokensCss.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));

const parsed = cssFiles.map((file) => ({ file, rel: path.relative(SRC, file), ...parse(fs.readFileSync(file, 'utf8')) }));
const cssDefs = new Set(parsed.flatMap((p) => p.decls.filter((d) => d.prop.startsWith('--')).map((d) => d.prop)));
const tsxSource = tsxFiles.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
const tsxDefs = new Set([...tsxSource.matchAll(/['"`](--[\w-]+)['"`]/g)].map((m) => m[1]));
const allCss = parsed.map((p) => fs.readFileSync(p.file, 'utf8')).join('\n');
const reads = new Set([...(allCss + tsxSource).matchAll(/var\(\s*(--[\w-]+)/g)].map((m) => m[1]));

// ─── Checks ───────────────────────────────────────────────────
const problems = [];
const report = (rel, line, msg) => problems.push(`${rel}:${line}  ${msg}`);

const inReducedMotion = (ctx) => ctx.some((p) => /^@media\b.*prefers-reduced-motion:\s*reduce/.test(p));
const isVisuallyHidden = (rule) =>
  rule.decls.some((d) => (d.prop === 'clip-path' && /inset\(\s*50%\s*\)/.test(d.value)) || (d.prop === 'clip' && /rect\(/.test(d.value)));

function rawValues(decl, rel) {
  const found = [];
  const allowed = FILE_ALLOW[rel] || [];
  // Look only at literal text: drop var(--x) names (keep fallbacks), url(), strings.
  const v = decl.value
    .replace(/!important/g, '')
    .replace(/url\([^)]*\)/g, 'url()')
    .replace(/"[^"]*"|'[^']*'/g, '""')
    .replace(/var\(\s*--[\w-]+\s*(,)?/g, (_m, comma) => (comma ? 'var(' : 'var('));

  for (const m of v.matchAll(/#[0-9a-f]{3,8}\b/gi)) found.push(m[0]);
  for (const m of v.matchAll(/(?<![\w-])(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/gi)) found.push(`${m[1]}()`);
  const named = v.match(NAMED_COLORS);
  if (named) found.push(named[0]);
  for (const m of v.matchAll(/(?<![\w.#-])(-?\d*\.?\d+)(px|rem|em|pt|pc|cm|mm|in|q|ex|ic|cap|lh|rlh)\b/gi)) {
    const [tok, num, unit] = m;
    if (Number(num) === 0) continue;
    if (/^(em|lh|cap|ic)$/i.test(unit) && Math.abs(Number(num)) === 1) continue;
    if (tok === '0.05em' || tok === '-0.05em') continue;
    if (/^-?1px$/.test(tok) && /^(width|height|margin)$/.test(decl.prop) && isVisuallyHidden(decl.rule)) continue;
    if (allowed.includes(tok)) continue;
    found.push(tok);
  }
  for (const m of v.matchAll(/(?<![\w.#-])(-?\d*\.?\d+)(ms|s)\b/g)) if (Number(m[1]) !== 0) found.push(m[0]);
  for (const m of v.matchAll(/(cubic-bezier|steps)\(/g)) found.push(`${m[1]}()`);
  for (const m of v.matchAll(/scale[XYZ3d]*\(([^)]*)\)/g)) {
    for (const arg of m[1].split(/[\s,]+/)) if (/^-?\d*\.?\d+$/.test(arg) && !['1', '-1', '0'].includes(arg)) found.push(m[0]);
  }
  const bare = [...v.matchAll(/(?<![\w.#%-])-?\d*\.?\d+(?![\w.%(])/g)].map((m) => m[0]);
  if (decl.prop === 'z-index') found.push(...bare.filter((n) => !['-1', '0', '1'].includes(n)));
  if (decl.prop === 'opacity') found.push(...bare.filter((n) => !['0', '1'].includes(n)));
  if (decl.prop === 'font-weight') found.push(...bare, ...(v.match(/\b(bold|bolder|lighter|normal)\b/) || []).slice(0, 1));
  if (decl.prop === 'line-height') found.push(...bare.filter((n) => n !== '0'));
  if (decl.prop === 'aspect-ratio') found.push(...bare);
  return found;
}

for (const { rel, decls, atRules } of parsed) {
  for (const d of decls) {
    // 1. unresolved var() — only references without a fallback
    for (const m of d.value.matchAll(/var\(\s*(--[\w-]+)\s*\)/g)) {
      const name = m[1];
      if (name.startsWith('--radix-') || tokenDefs.has(name) || cssDefs.has(name) || tsxDefs.has(name)) continue;
      report(rel, d.line, `var(${name}) is not defined anywhere (typo or renamed token?)`);
    }
    // 2. declared, never read
    if (d.prop.startsWith('--') && !tokenDefs.has(d.prop) && !reads.has(d.prop)) {
      report(rel, d.line, `${d.prop} is declared but nothing reads it — wire it up or remove it`);
    }
    // 3. raw values
    const raw = rawValues(d, rel);
    if (raw.length) report(rel, d.line, `raw value in "${d.prop}: ${d.value}" → ${[...new Set(raw)].join(', ')} (use a token)`);
    // 4. !important
    if (/!important/.test(d.value) && !inReducedMotion(d.context)) {
      report(rel, d.line, `!important in "${d.prop}" — only the prefers-reduced-motion reset may use it`);
    }
  }
  // 6. ungated :hover (one report per rule)
  const seen = new Set();
  for (const d of decls) {
    if (seen.has(d.rule)) continue;
    seen.add(d.rule);
    const selector = d.context[d.context.length - 1] ?? '';
    const hovers = selector.split(',').some((part) => part.replace(/:not\(\s*:hover\s*\)/g, '').includes(':hover'));
    if (!hovers) continue;
    const outer = d.context.slice(0, -1);
    if (outer.some((p) => /^@media\b.*\(hover:\s*hover\)/.test(p))) continue;
    if (outer.some((p) => /^@media\b.*(prefers-reduced-motion|forced-colors)/.test(p))) continue;
    report(rel, d.line, `${selector} — wrap :hover in @media (hover: hover) so it can't stick after a tap`);
  }
  // 5. media breakpoints
  for (const a of atRules) {
    if (!a.prelude.startsWith('@media')) continue;
    for (const m of a.prelude.matchAll(/(min|max)-width\s*:\s*([\d.]+)(px|em|rem)/g)) {
      const [, kind, num, unit] = m;
      if (unit !== 'px' || !BREAKPOINTS[kind].includes(Number(num))) {
        report(rel, a.line, `${a.prelude} — ${kind}-width must be a --breakpoint-* token value (${BREAKPOINTS[kind].join('/')}px)`);
      }
    }
  }
}

if (problems.length) {
  console.error(`check-css: ${problems.length} problem(s)\n`);
  console.error(problems.join('\n'));
  console.error('\nSee the header of scripts/check-css.mjs for what is allowed and why.');
  process.exit(1);
}
console.log(`check-css: ${cssFiles.length} files clean`);
