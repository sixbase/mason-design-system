import { forwardRef, useCallback } from 'react';
import type { HTMLAttributes } from 'react';
import { Minus, Plus } from '../icon';
import './QuantitySelector.css';

export interface QuantitySelectorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Current value (controlled) */
  value: number;
  /** Called when value changes */
  onChange: (value: number) => void;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Step increment */
  step?: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Disabled state */
  disabled?: boolean;
}

export const QuantitySelector = forwardRef<HTMLDivElement, QuantitySelectorProps>(
  function QuantitySelector(
    {
      value,
      onChange,
      min = 1,
      max = 99,
      step = 1,
      size = 'md',
      disabled = false,
      className,
      'aria-label': ariaLabel = 'Quantity',
      ...props
    },
    ref,
  ) {
    const decrement = useCallback(() => {
      const next = Math.max(min, value - step);
      if (next !== value) onChange(next);
    }, [value, min, step, onChange]);

    const increment = useCallback(() => {
      const next = Math.min(max, value + step);
      if (next !== value) onChange(next);
    }, [value, max, step, onChange]);

    return (
      <div
        ref={ref}
        role="group"
        aria-label={ariaLabel}
        className={[
          'ds-quantity-selector',
          `ds-quantity-selector--${size}`,
          disabled && 'ds-quantity-selector--disabled',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        <button
          type="button"
          className="ds-quantity-selector__btn"
          aria-label="Decrease quantity"
          onClick={decrement}
          disabled={disabled || value <= min}
        >
          <Minus size="sm" />
        </button>
        <output className="ds-quantity-selector__value">{value}</output>
        <button
          type="button"
          className="ds-quantity-selector__btn"
          aria-label="Increase quantity"
          onClick={increment}
          disabled={disabled || value >= max}
        >
          <Plus size="sm" />
        </button>
      </div>
    );
  },
);
QuantitySelector.displayName = 'QuantitySelector';
