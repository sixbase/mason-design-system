import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { Text } from '../typography/Typography';
import './PriceDisplay.css';

/** Price text size step. */
export type PriceDisplaySize = 'sm' | 'md' | 'lg';
/** Sale-colour treatment — see `PriceDisplayProps.emphasis`. */
export type PriceDisplayEmphasis = 'none' | 'sale';

export interface PriceDisplayProps extends HTMLAttributes<HTMLDivElement> {
  /** Current / sale price, already formatted (e.g. "$48.00") */
  price: string;
  /** Original price shown with strikethrough (optional, already formatted) */
  comparePrice?: string;
  /** Size variant */
  size?: PriceDisplaySize;
  /**
   * Emphasis treatment. `'sale'` renders the current price in the
   * destructive (sale) color even without a `comparePrice`.
   * `'none'` keeps the default behavior: the sale color still applies
   * automatically when a `comparePrice` is present.
   */
  emphasis?: PriceDisplayEmphasis;
}

/**
 * PriceDisplay
 *
 * Displays a product price with an optional compare-at / original price
 * shown with a strikethrough.
 */
export const PriceDisplay = forwardRef<HTMLDivElement, PriceDisplayProps>(
  function PriceDisplay(
    { price, comparePrice, size = 'md', emphasis = 'none', className, ...props },
    ref,
  ) {
    const classes = [
      'ds-price-display',
      `ds-price-display--${size}`,
      emphasis !== 'none' && `ds-price-display--emphasis-${emphasis}`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={classes} {...props}>
        <Text as="span" weight="medium" className="ds-price-display__price">
          {/* With a compare price, the first number is the sale price —
              said out loud, it was a bare "$38.00" before "Original price". */}
          {comparePrice && <span className="ds-sr-only">Sale price: </span>}
          {price}
        </Text>
        {comparePrice && (
          <Text as="span" muted className="ds-price-display__compare">
            <span className="ds-sr-only">Original price:</span>
            {comparePrice}
          </Text>
        )}
      </div>
    );
  },
);

PriceDisplay.displayName = 'PriceDisplay';
