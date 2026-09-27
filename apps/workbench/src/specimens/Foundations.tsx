/**
 * Foundation sheets — the tokens themselves, drawn.
 *
 * Swatches, bars and shapes set a single CSS property to a token with an
 * inline style (`var(--token)`): that is the only way to draw N tokens
 * without N classes. Values are always token references, never raw.
 */
import { useEffect, useRef, useState } from 'react';
import { Heading, Text } from '@ds/components';
import tokens from '@ds/tokens/json';
import './specimens.css';

type Ramp = Record<string, string>;
const primitive = tokens.primitive as unknown as {
  color: Record<string, Ramp>;
  spacing: Record<string, string>;
  radius: Record<string, string>;
  shadow: Record<string, string>;
  font: { size: Record<string, string> };
};
const semanticLight = tokens.semantic.color.light as Record<string, { $value: string }>;

// ─── Contrast (WCAG) ────────────────────────────────────────

function luminance(color: string): number | null {
  // rgb(r g b) for plain colors; color(srgb r g b) (0–1) for color-mix() results
  const srgb = color.match(/color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)/);
  const rgb = color.match(/rgba?\(([^)]+)\)/);
  let parts: number[];
  if (srgb) parts = srgb.slice(1, 4).map((v) => Number(v) * 255);
  else if (rgb) parts = rgb[1]!.split(/[\s,/]+/).map(Number);
  else return null;
  const [r, g, b] = parts;
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r!) + 0.7152 * lin(g!) + 0.0722 * lin(b!);
}

function ratio(a: string, b: string): number | null {
  const x = luminance(a);
  const y = luminance(b);
  if (x === null || y === null) return null;
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

/** Live contrast of a text color token against the page, in the current theme */
function ContrastTag({ token, against = 'background', need }: { token: string; against?: string; need: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState<number | null>(null);
  useEffect(() => {
    const probe = document.createElement('span');
    probe.style.color = `var(--color-${token})`;
    probe.style.backgroundColor = `var(--color-${against})`;
    ref.current?.appendChild(probe);
    const cs = getComputedStyle(probe);
    setValue(ratio(cs.color, cs.backgroundColor));
    probe.remove();
  }, [token, against]);
  const pass = value !== null && value >= need;
  const target = need <= 1 ? 'no minimum (decorative)' : `target ${need}:1`;
  return (
    <span ref={ref}>
      {value === null ? '—' : `${value.toFixed(2)}:1 · ${target}${need > 1 ? (pass ? ' ✓' : ' ✗') : ''}`}
    </span>
  );
}

// ─── Colors ─────────────────────────────────────────────────

const TEXT_ROLES: Array<[string, number, string]> = [
  ['foreground', 4.5, 'Primary text'],
  ['foreground-secondary', 4.5, 'Readable secondary text — the floor for normal text'],
  ['foreground-subtle', 3, 'Large text and icons only'],
  ['foreground-muted', 1, 'Disabled / decorative only'],
  ['border-control', 3, 'Form control edges'],
  ['focus-ring', 3, 'Keyboard focus ring'],
  ['destructive', 4.5, 'Errors, sale prices'],
  ['success-foreground', 4.5, 'Success text'],
  ['warning-foreground', 4.5, 'Warning text'],
  ['info-foreground', 4.5, 'Info text'],
];

export function ColorsSheet() {
  return (
    <div className="wb-sheet">
      <section className="wb-sheet__section">
        <Heading as="h2" size="xl">
          Text & edge colors — live contrast
        </Heading>
        <Text size="sm" muted className="wb-sheet__note">
          Measured live against the page background in this frame's theme. Show Light and Dark side by side to compare.
        </Text>
        <div className="wb-grid wb-grid--wide">
          {TEXT_ROLES.map(([name, need, use]) => (
            <div key={name} className="wb-swatch">
              <div className="wb-swatch__chip" style={{ background: `var(--color-${name})` }} />
              <div className="wb-swatch__meta">
                <strong>{name}</strong>
                <span>{use}</span>
                <ContrastTag token={name} need={need} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="wb-sheet__section">
        <Heading as="h2" size="xl">
          All semantic colors
        </Heading>
        <div className="wb-grid">
          {Object.keys(semanticLight).map((name) => (
            <div key={name} className="wb-swatch">
              <div className="wb-swatch__chip" style={{ background: `var(--color-${name})` }} />
              <div className="wb-swatch__meta">
                <strong>{name}</strong>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="wb-sheet__section">
        <Heading as="h2" size="xl">
          Palettes
        </Heading>
        {Object.entries(primitive.color).map(([name, ramp]) => (
          <div key={name} className="wb-swatch">
            <Text size="sm" weight="medium">
              {name}
            </Text>
            <div className="wb-ramp">
              {Object.keys(ramp).map((step) => (
                <div key={step} className="wb-ramp__step" style={{ background: `var(--color-${name}-${step})` }} />
              ))}
            </div>
            <div className="wb-ramp-labels">
              {Object.keys(ramp).map((step) => (
                <span key={step}>{step}</span>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

// ─── Type ───────────────────────────────────────────────────

const SAMPLE = 'Everyday essentials, thoughtfully made';

/** The rendered px size of an element's font — fluid tokens change with width */
function PxSize({ token }: { token: string }) {
  const [px, setPx] = useState<string>('');
  useEffect(() => {
    const probe = document.createElement('span');
    probe.style.fontSize = `var(--font-size-${token})`;
    document.body.appendChild(probe);
    setPx(`${parseFloat(getComputedStyle(probe).fontSize).toFixed(1)}px`);
    probe.remove();
  }, [token]);
  return <span className="wb-type-px">{px}</span>;
}

export function TypeSheet() {
  const scales: Array<[string, string[]]> = [
    ['Default (fluid) — body copy and headings', ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl']],
    ['Tight — fixed UI text: labels, buttons, inputs', ['tight-2xs', 'tight-xs', 'tight-sm', 'tight-base', 'tight-lg', 'tight-xl', 'tight-2xl', 'tight-3xl', 'tight-4xl']],
    ['Display — editorial headlines', ['display-xs', 'display-sm', 'display-md', 'display-lg', 'display-xl', 'display-2xl']],
  ];
  return (
    <div className="wb-sheet">
      <section className="wb-sheet__section">
        <Heading as="h2" size="xl">
          Heading and Text components
        </Heading>
        <Text size="sm" muted className="wb-sheet__note">
          Sizes are fluid: compare Phone and Desktop — the printed px values change with the frame width.
        </Text>
        {(['4xl', '3xl', '2xl', 'xl'] as const).map((size) => (
          <div key={size} className="wb-type-row">
            <span className="wb-row__label">Heading {size}</span>
            <Heading as="h3" size={size}>
              {SAMPLE}
            </Heading>
          </div>
        ))}
        {(['4xl', '3xl', '2xl', 'xl'] as const).map((size) => (
          <div key={`d-${size}`} className="wb-type-row">
            <span className="wb-row__label">Display {size}</span>
            <Heading as="h3" size={size} display>
              {SAMPLE}
            </Heading>
          </div>
        ))}
        {(['xl', 'lg', 'base', 'sm', 'xs'] as const).map((size) => (
          <div key={`t-${size}`} className="wb-type-row">
            <span className="wb-row__label">Text {size}</span>
            <Text size={size}>
              Sustainably crafted goods designed to stand the test of time. From canvas totes to ceramic mugs.
            </Text>
          </div>
        ))}
      </section>

      {scales.map(([title, steps]) => (
        <section key={title} className="wb-sheet__section">
          <Heading as="h2" size="xl">
            {title}
          </Heading>
          {steps.map((step) => (
            <div key={step} className="wb-type-row">
              <span className="wb-row__label">
                {step} <PxSize token={step} />
              </span>
              <span style={{ fontSize: `var(--font-size-${step})`, lineHeight: 'var(--line-height-tight)' }}>
                {SAMPLE}
              </span>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}

// ─── Space, radius, shadow ──────────────────────────────────

export function SpaceSheet() {
  const spacing = Object.keys(primitive.spacing).filter((k) => !k.startsWith('fluid'));
  return (
    <div className="wb-sheet">
      <section className="wb-sheet__section">
        <Heading as="h2" size="xl">
          Spacing
        </Heading>
        {spacing.map((k) => (
          <div key={k} className="wb-row">
            <span className="wb-row__label">
              {k} · {primitive.spacing[k]}
            </span>
            <div className="wb-bar" style={{ width: `var(--spacing-${k})` }} />
          </div>
        ))}
        {['fluid-sm', 'fluid-md', 'fluid-lg', 'fluid-xl'].map((k) => (
          <div key={k} className="wb-row">
            <span className="wb-row__label">{k}</span>
            <div className="wb-bar" style={{ width: `var(--spacing-${k})` }} />
          </div>
        ))}
      </section>

      <section className="wb-sheet__section">
        <Heading as="h2" size="xl">
          Layout grid
        </Heading>
        <Text size="sm" muted className="wb-sheet__note">
          1200px container, 12 columns, 24px gutters, 64px between sections. Columns collapse to one on phones.
        </Text>
        <div className="ds-layout wb-grid-demo" aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i} className="wb-grid-demo__col">
              {i + 1}
            </span>
          ))}
        </div>
        {(
          [
            ['golden', '7 + 5'],
            ['golden-reverse', '5 + 7'],
            ['halves', '6 + 6'],
            ['thirds', '4 + 4 + 4'],
            ['wide-narrow', '8 + 4'],
          ] as const
        ).map(([split, label]) => (
          <div key={split} className={['ds-layout', `ds-layout--${split}`, 'wb-split-demo'].join(' ')} aria-hidden="true">
            {label.split(' + ').map((cols, i) => (
              <span key={i} className="wb-split-demo__cell">
                {split} · {cols}
              </span>
            ))}
          </div>
        ))}
      </section>

      <section className="wb-sheet__section">
        <Heading as="h2" size="xl">
          Radius
        </Heading>
        <div className="wb-row">
          {Object.keys(primitive.radius).map((k) => (
            <div key={k} className="wb-shape wb-shape--lg" style={{ borderRadius: `var(--radius-${k})` }}>
              {k}
              <span>{primitive.radius[k]}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="wb-sheet__section">
        <Heading as="h2" size="xl">
          Elevation
        </Heading>
        <div className="wb-row wb-elevation-stage">
          {['card', 'dropdown', 'sticky', 'modal', 'toast'].map((k) => (
            <div key={k} className="wb-shape" style={{ boxShadow: `var(--elevation-${k})`, borderRadius: 'var(--radius-lg)' }}>
              {k}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
