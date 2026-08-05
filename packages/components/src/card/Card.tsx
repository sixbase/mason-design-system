import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import './Card.css';

export type CardVariant = 'elevated' | 'outlined' | 'ghost';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual style of the card surface */
  variant?: CardVariant;
  /** Makes the card interactive (hover + focus styles) */
  interactive?: boolean;
  /** Remove internal padding — useful when the card contains a full-bleed image */
  noPadding?: boolean;
}

/**
 * Card
 *
 * A surface container for grouping related content. The core layout
 * primitive for product listings, article previews, and dashboard panels.
 *
 * Compose with sub-components for structured layouts:
 * - CardImage    — full-bleed image at the top
 * - CardBody     — padded content area
 * - CardFooter   — action row at the bottom
 *
 * Interactivity: the `interactive` prop is visual only (hover lift + focus
 * styles) — it does NOT add `role`, `tabIndex`, or keyboard handling. Always
 * wrap an interactive card in a semantic element (`<a>` around the card, or
 * a `<button>`/link inside it). If you attach `onClick` directly to the Card
 * with no semantic wrapper, you must also pass `role="button"`, `tabIndex={0}`
 * and keyboard handlers yourself — prefer the wrapper.
 *
 * @example
 * <Card>
 *   <CardImage src="/product.jpg" alt="Product name" />
 *   <CardBody>
 *     <Heading as="h3">Product name</Heading>
 *     <Text>$42.00</Text>
 *   </CardBody>
 *   <CardFooter>
 *     <Button fullWidth>Add to Cart</Button>
 *   </CardFooter>
 * </Card>
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = 'elevated', interactive = false, noPadding = false, className, children, ...props },
  ref,
) {
  const classes = [
    'ds-card',
    `ds-card--${variant}`,
    interactive && 'ds-card--interactive',
    noPadding && 'ds-card--no-padding',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={ref} className={classes} {...props}>
      {children}
    </div>
  );
});
Card.displayName = 'Card';

// ─── CardImage ────────────────────────────────────────────

export interface CardImageProps extends HTMLAttributes<HTMLDivElement> {
  src: string;
  alt: string;
  /**
   * Aspect ratio of the image container. When omitted, the container falls
   * back to the `--aspect-landscape` token (4/3). To use any other aspect
   * token, override the `--card-image-ratio` component token instead:
   * `style={{ '--card-image-ratio': 'var(--aspect-portrait)' }}` — all
   * `--aspect-*` tokens (square, portrait, landscape, video, golden,
   * golden-portrait) are valid values.
   */
  aspectRatio?: '1/1' | '4/3' | '3/2' | '16/9' | '4/5';
}

export const CardImage = forwardRef<HTMLDivElement, CardImageProps>(function CardImage(
  { src, alt, aspectRatio, className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={['ds-card-image', className].filter(Boolean).join(' ')}
      style={
        aspectRatio
          ? ({ '--card-image-ratio': aspectRatio } as React.CSSProperties)
          : undefined
      }
      {...props}
    >
      <img src={src} alt={alt} className="ds-card-image__img" loading="lazy" />
    </div>
  );
});
CardImage.displayName = 'CardImage';

// ─── CardBody ─────────────────────────────────────────────

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {}

export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(function CardBody(
  { className, children, ...props },
  ref,
) {
  return (
    <div ref={ref} className={['ds-card-body', className].filter(Boolean).join(' ')} {...props}>
      {children}
    </div>
  );
});
CardBody.displayName = 'CardBody';

// ─── CardFooter ───────────────────────────────────────────

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(function CardFooter(
  { className, children, ...props },
  ref,
) {
  return (
    <div ref={ref} className={['ds-card-footer', className].filter(Boolean).join(' ')} {...props}>
      {children}
    </div>
  );
});
CardFooter.displayName = 'CardFooter';
