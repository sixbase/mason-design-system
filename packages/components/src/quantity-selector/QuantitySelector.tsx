import { forwardRef, useCallback, useState } from 'react';
import type { ChangeEvent, HTMLAttributes, KeyboardEvent } from 'react';
import { Minus, Plus } from '../icon';
import './QuantitySelector.css';

/** Control height step — matches `--size-control-sm/md/lg`. */
export type QuantitySelectorSize = 'sm' | 'md' | 'lg';

export interface QuantitySelectorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Current value (controlled) */
  value: number;
  /** Called with the new number (not an event), already clamped to min/max */
  onChange: (value: number) => void;
  /** Minimum value (default 1) */
  min?: number;
  /** Maximum value (default 99) */
  max?: number;
  /** Step increment */
  step?: number;
  /** Size variant */
  size?: QuantitySelectorSize;
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

    // Non-finite input (a NaN quantity from bad cart data) lands on min:
    // Math.max(min, NaN) is NaN, so "+" used to send onChange(NaN).
    const clamp = useCallback(
      (next: number) => (Number.isFinite(next) ? Math.min(max, Math.max(min, next)) : min),
      [min, max],
    );
    const validValue = Number.isFinite(value);

    // The value a step starts from. A pending typed draft wins over the
    // prop: Safari never moves focus to a clicked button, so the input never
    // blurred, the draft was never committed, and "+" stepped from the stale
    // prop while the field kept showing the typed number.
    const parsedDraft = draft === null ? Number.NaN : Number.parseInt(draft, 10);
    const current = Number.isNaN(parsedDraft) ? value : clamp(parsedDraft);

    // Every step lands inside [min, max] — also when the prop itself is out
    // of range (e.g. stock dropped below the quantity already in the cart).
    const stepBy = useCallback(
      (delta: number) => {
        const next = clamp(current + delta);
        if (next !== value) onChange(next);
        setDraft(null);
      },
      [current, clamp, value, onChange],
    );

    const decrement = useCallback(() => stepBy(-step), [stepBy, step]);
    const increment = useCallback(() => stepBy(step), [stepBy, step]);

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
      // Digits only — quantities are positive integers. A decimal or exponent
      // part is cut first: stripping alone turned a pasted "2.5" into 25 and
      // "1e9" into 19.
      setDraft(event.target.value.replace(/(\d)[.,eE].*$/, '$1').replace(/[^0-9]/g, ''));
    }, []);

    const handleInputKeyDown = useCallback(
      (event: KeyboardEvent<HTMLInputElement>) => {
        switch (event.key) {
          case 'Enter':
            event.preventDefault();
            commitDraft();
            break;
          case 'ArrowUp':
            event.preventDefault();
            increment();
            break;
          case 'ArrowDown':
            event.preventDefault();
            decrement();
            break;
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
      [value, min, max, commitDraft, increment, decrement, onChange],
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
          disabled={disabled || current <= min}
        >
          <Minus size="sm" />
        </button>
        <input
          type="text"
          role="spinbutton"
          inputMode="numeric"
          autoComplete="off"
          className="ds-quantity-selector__value"
          value={draft ?? (validValue ? String(value) : '')}
          aria-label={ariaLabel}
          aria-valuenow={validValue ? value : undefined}
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
          disabled={disabled || current >= max}
        >
          <Plus size="sm" />
        </button>
      </div>
    );
  },
);
QuantitySelector.displayName = 'QuantitySelector';
