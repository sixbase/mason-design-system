import { forwardRef } from 'react';
import type { SVGAttributes, ReactNode } from 'react';
import './Icon.css';

export type IconSize = 'sm' | 'md' | 'lg';

export interface IconProps extends SVGAttributes<SVGElement> {
  /** Icon size — sm (--size-icon-sm), md (--size-icon-md), lg (--size-icon-lg) */
  size?: IconSize;
  /** Accessible label — required when decorative={false} */
  label?: string;
  /**
   * When true (default), the icon is decorative: it renders with
   * `aria-hidden="true"` and is invisible to assistive technology.
   * Keep the default whenever the icon sits next to visible text that
   * already carries the meaning (e.g. a chevron in an accordion trigger,
   * the icon inside a labeled button).
   *
   * Set `decorative={false}` ONLY when the icon is the sole conveyor of
   * meaning (e.g. a standalone status glyph) — then you MUST also pass
   * `label`, which becomes the `aria-label` on a `role="img"` element.
   *
   * @example
   * // Decorative (default) — text carries the meaning
   * <Button><CartIcon /> Add to cart</Button>
   *
   * @example
   * // Meaningful — icon stands alone
   * <Icon decorative={false} label="In stock"><CheckPath /></Icon>
   */
  decorative?: boolean;
  /** Pass an SVG element directly */
  children?: ReactNode;
}

/**
 * Icon
 *
 * Base SVG wrapper for the design system icon set. Sizes come from
 * `--size-icon-*` tokens; color inherits `currentColor` from the parent.
 */
export const Icon = forwardRef<SVGSVGElement, IconProps>(
  function Icon(
    {
      size = 'md',
      label,
      decorative = true,
      children,
      className,
      ...props
    },
    ref,
  ) {
    if (!children) {
      return null;
    }

    const classes = [
      'ds-icon',
      `ds-icon--${size}`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const ariaProps = decorative
      ? { 'aria-hidden': true as const }
      : { role: 'img' as const, 'aria-label': label };

    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={classes}
        {...ariaProps}
        {...props}
      >
        {children}
      </svg>
    );
  },
);

Icon.displayName = 'Icon';
