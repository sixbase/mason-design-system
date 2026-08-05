import { forwardRef, useCallback, useState } from 'react';
import type { ChangeEvent, HTMLAttributes, KeyboardEvent } from 'react';
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

/**
 * QuantitySelector
 *
 * A stepper for numeric values following the WAI-ARIA spinbutton pattern.
 * The value is an editable text field (inputMode="numeric") — typed values
 * are clamped to min/max on blur or Enter. Arrow Up/Down step the value,
 * Home/End jump to min/max. The +/- buttons are pointer affordances and
 * are removed from the tab order per the APG spinbutton pattern.
 */
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
    // Draft holds in-progress typed text; null means "display the value prop".
    const [draft, setDraft] = useState<string | null>(null);

    const clamp = useCallback(
      (next: number) => Math.min(max, Math.max(min, next)),
      [min, max],
    );

    const decrement = useCallback(() => {
      const next = Math.max(min, value - step);
      if (next !== value) onChange(next);
    }, [value, min, step, onChange]);

    const increment = useCallback(() => {
      const next = Math.min(max, value + step);
      if (next !== value) onChange(next);
    }, [value, max, step, onChange]);

    const commitDraft = useCallback(() => {
      if (draft === null) return;
      const parsed = Number.parseInt(draft, 10);
      if (!Number.isNaN(parsed)) {
        const next = clamp(parsed);
        if (next !== value) onChange(next);
      }
      setDraft(null);
    }, [draft, clamp, value, onChange]);

    const handleInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
      // Digits only — quantities are positive integers.
      setDraft(event.target.value.replace(/[^0-9]/g, ''));
    }, []);

    const handleInputKeyDown = useCallback(
      (event: KeyboardEvent<HTMLInputElement>) => {
        const stepFrom = () => {
          if (draft === null) return value;
          const parsed = Number.parseInt(draft, 10);
          return Number.isNaN(parsed) ? value : clamp(parsed);
        };

        switch (event.key) {
          case 'Enter':
            event.preventDefault();
            commitDraft();
            break;
          case 'ArrowUp': {
            event.preventDefault();
            const next = clamp(stepFrom() + step);
            if (next !== value) onChange(next);
            setDraft(null);
            break;
          }
          case 'ArrowDown': {
            event.preventDefault();
            const next = clamp(stepFrom() - step);
            if (next !== value) onChange(next);
            setDraft(null);
            break;
          }
          case 'Home':
            event.preventDefault();
            if (value !== min) onChange(min);
            setDraft(null);
            break;
          case 'End':
            event.preventDefault();
            if (value !== max) onChange(max);
            setDraft(null);
            break;
          default:
            break;
        }
      },
      [draft, value, step, min, max, clamp, commitDraft, onChange],
    );

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
          tabIndex={-1}
          onClick={decrement}
          disabled={disabled || value <= min}
        >
          <Minus size="sm" />
        </button>
        <input
          type="text"
          role="spinbutton"
          inputMode="numeric"
          autoComplete="off"
          className="ds-quantity-selector__value"
          value={draft ?? String(value)}
          aria-label={ariaLabel}
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
          disabled={disabled}
          onChange={handleInputChange}
          onBlur={commitDraft}
          onKeyDown={handleInputKeyDown}
        />
        <button
          type="button"
          className="ds-quantity-selector__btn"
          aria-label="Increase quantity"
          tabIndex={-1}
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
