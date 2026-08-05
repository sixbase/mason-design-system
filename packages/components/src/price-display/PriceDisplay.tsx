import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { Text } from '../typography/Typography';
import './PriceDisplay.css';

export interface PriceDisplayProps extends HTMLAttributes<HTMLDivElement> {
  /** Current / sale price */
  price: string;
  /** Original price shown with strikethrough (optional) */
  comparePrice?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Emphasis treatment. `'sale'` renders the current price in the
   * destructive (sale) color even without a `comparePrice`.
   * `'none'` keeps the default behavior: the sale color still applies
   * automatically when a `comparePrice` is present.
   */
  emphasis?: 'none' | 'sale';
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
        <Text as="span" weight="medium" className="ds-price-display__price">{price}</Text>
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
