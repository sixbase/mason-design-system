import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import './Spinner.css';

// ─── Types ────────────────────────────────────────────────

export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  /** Size of the spinner — maps to the icon size scale */
  size?: SpinnerSize;
  /** Accessible label announced by screen readers */
  label?: string;
  /** Show the label as visible text beside the spinner */
  showLabel?: boolean;
}

/**
 * Spinner
 *
 * A standalone loading indicator using the same visual language as the
 * Button loading spinner. Announces itself to screen readers via
 * `role="status"`.
 *
 * Common ecommerce uses: loading search results, deferred cart totals,
 * inline "checking availability" states.
 *
 * @example
 * <Spinner />
 * <Spinner size="lg" label="Loading products" showLabel />
 */
export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  {
    size = 'md',
    label = 'Loading',
    showLabel = false,
    className,
    ...props
  },
  ref,
) {
  const classes = [
    'ds-spinner',
    `ds-spinner--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span ref={ref} role="status" className={classes} {...props}>
      {/* ds-motion-safe: exempt from the global reduced-motion reset, which
          would freeze the pulse below on its first frame. Spinner.css swaps
          the spin for a non-moving pulse under both reduce conditions. */}
      <span className="ds-spinner__circle ds-motion-safe" aria-hidden="true" />
      <span className={showLabel ? 'ds-spinner__label' : 'ds-spinner__sr-only'}>
        {label}
      </span>
    </span>
  );
});

Spinner.displayName = 'Spinner';
