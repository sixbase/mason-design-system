import { forwardRef } from 'react';
import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import './Typography.css';

// ─── Heading ──────────────────────────────────────────────────

export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4';
export type HeadingSize = 'xl' | '2xl' | '3xl' | '4xl';
export type HeadingWeight = 'normal' | 'medium' | 'semibold' | 'bold';

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  /** HTML heading level (semantic) */
  as?: HeadingLevel;
  /** Visual size — decouples from semantic level. Defaults to the size mapped to `as`. */
  size?: HeadingSize;
  /** Font weight override. Defaults to semibold. */
  weight?: HeadingWeight;
  /** Secondary foreground colour (`--color-foreground-secondary`) */
  muted?: boolean;
  /** Single-line ellipsis truncation. */
  truncate?: boolean;
  /**
   * Editorial/hero register: swaps the product-UI type scale (√φ steps)
   * for the fluid display scale (φ steps, clamp()-based). Each size maps
   * to the display token of the same rank:
   *
   * | size  | normal token       | display token               |
   * |-------|--------------------|-----------------------------|
   * | `xl`  | `--font-size-xl`   | `--font-size-display-md`    |
   * | `2xl` | `--font-size-2xl`  | `--font-size-display-lg`    |
   * | `3xl` | `--font-size-3xl`  | `--font-size-display-xl`    |
   * | `4xl` | `--font-size-4xl`  | `--font-size-display-2xl`   |
   *
   * A display `h1` (size 4xl) therefore renders at the full hero scale
   * (fluid 79 → 110px).
   */
  display?: boolean;
}

/** Default visual size for each heading level */
const defaultSizeMap: Record<HeadingLevel, HeadingSize> = {
  h1: '4xl',
  h2: '3xl',
  h3: '2xl',
  h4: 'xl',
};

/**
 * Rank-preserving map from heading sizes to the fluid display scale.
 * The display scale steps by φ (26 → 42 → 68 → 110px at desktop), so
 * each heading size trades its √φ-scale token for the same-rank
 * display token. See the `display` prop docs for the full table.
 */
const displaySizeMap: Record<HeadingSize, 'md' | 'lg' | 'xl' | '2xl'> = {
  xl: 'md',
  '2xl': 'lg',
  '3xl': 'xl',
  '4xl': '2xl',
};

/**
 * Heading
 *
 * Renders semantic heading elements (h1–h4) with consistent typographic scale.
 *
 * @example
 * <Heading as="h1">Page title</Heading>
 * <Heading as="h3" muted>Section subtitle</Heading>
 */
export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(function Heading(
  {
    as: Tag = 'h2',
    size,
    weight,
    muted = false,
    truncate = false,
    display = false,
    className,
    children,
    ...props
  },
  ref,
) {
  const resolvedSize = size ?? defaultSizeMap[Tag];
  const classes = [
    'ds-heading',
    display ? `ds-heading--display-${displaySizeMap[resolvedSize]}` : `ds-heading--${resolvedSize}`,
    weight && `ds-heading--${weight}`,
    muted && 'ds-heading--muted',
    truncate && 'ds-heading--truncate',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag ref={ref} className={classes} {...props}>
      {children}
    </Tag>
  );
});

Heading.displayName = 'Heading';

// ─── Text ─────────────────────────────────────────────────────

export type TextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl';
export type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';
export type TextElement = 'p' | 'span' | 'div' | 'label' | 'strong' | 'em';
export type TextLineClamp = 1 | 2 | 3;

export interface TextProps extends HTMLAttributes<HTMLElement> {
  /** Element to render. Default `p`; use `span` inside inline or flex contexts. */
  as?: TextElement;
  /** Type scale step. Default `base`. */
  size?: TextSize;
  /** Font weight. Defaults to the body weight (normal). */
  weight?: TextWeight;
  /** Secondary foreground colour (`--color-foreground-secondary`) */
  muted?: boolean;
  /** Single-line ellipsis truncation. Mutually exclusive with `lineClamp`. */
  truncate?: boolean;
  /**
   * Multi-line truncation: clamps to 1–3 lines with an ellipsis.
   * Mutually exclusive with `truncate` (which is single-line).
   */
  lineClamp?: TextLineClamp;
  children?: ReactNode;
}

/**
 * Text
 *
 * General-purpose text component for body copy, labels, and inline text.
 *
 * @example
 * <Text size="base">Body copy</Text>
 * <Text as="span" size="sm" muted>Helper text</Text>
 */
export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  {
    as: Tag = 'p' as ElementType,
    size = 'base',
    weight,
    muted = false,
    truncate = false,
    lineClamp,
    className,
    children,
    ...props
  },
  ref,
) {
  const classes = [
    'ds-text',
    `ds-text--${size}`,
    weight && `ds-text--${weight}`,
    muted && 'ds-text--muted',
    truncate && 'ds-text--truncate',
    lineClamp && `ds-text--clamp-${lineClamp}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag ref={ref as never} className={classes} {...props}>
      {children}
    </Tag>
  );
});

Text.displayName = 'Text';

// ─── Caption ─────────────────────────────────────────────────

export interface CaptionProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
}

/**
 * Caption
 *
 * Extra-small muted text for metadata, timestamps, and secondary labels.
 *
 * @example
 * <Caption>Last updated 2 hours ago</Caption>
 */
export const Caption = forwardRef<HTMLSpanElement, CaptionProps>(function Caption(
  { className, children, ...props },
  ref,
) {
  return (
    <span ref={ref} className={['ds-caption', className].filter(Boolean).join(' ')} {...props}>
      {children}
    </span>
  );
});

Caption.displayName = 'Caption';

// ─── Code ─────────────────────────────────────────────────────

export interface CodeProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

/**
 * Code
 *
 * Inline monospace code snippet with subtle background.
 *
 * @example
 * <Text>Use the <Code>import</Code> statement.</Text>
 */
export const Code = forwardRef<HTMLElement, CodeProps>(function Code(
  { className, children, ...props },
  ref,
) {
  return (
    <code ref={ref} className={['ds-code', className].filter(Boolean).join(' ')} {...props}>
      {children}
    </code>
  );
});

Code.displayName = 'Code';
