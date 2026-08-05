import * as RadixRadioGroup from '@radix-ui/react-radio-group';
import { createContext, forwardRef, useContext, useId } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import './RadioGroup.css';

// ─── Types ────────────────────────────────────────────────

export type RadioGroupSize = 'sm' | 'md';
export type RadioGroupOrientation = 'horizontal' | 'vertical';

export interface RadioGroupProps
  extends Omit<ComponentPropsWithoutRef<typeof RadixRadioGroup.Root>, 'asChild' | 'orientation'> {
  /** Visible label for the whole group */
  label?: string;
  /** Helper text below the group */
  hint?: string;
  /** Error message — adds error styling to all items */
  error?: string;
  /** Size of the radio circles */
  size?: RadioGroupSize;
  /** Layout direction of the items */
  orientation?: RadioGroupOrientation;
}

export interface RadioGroupItemProps
  extends Omit<ComponentPropsWithoutRef<typeof RadixRadioGroup.Item>, 'asChild'> {
  /** Visible label next to the radio */
  label: string;
  /** Optional helper text below the item label */
  description?: string;
}

// ─── Context (group → items) ──────────────────────────────

interface RadioGroupContextValue {
  size: RadioGroupSize;
  hasError: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextValue>({
  size: 'md',
  hasError: false,
});

// ─── RadioGroup ───────────────────────────────────────────

/**
 * RadioGroup
 *
 * An accessible radio group built on Radix UI. Group-level label, hint, and
 * error; per-item label and optional description. Arrow keys move selection.
 *
 * Common ecommerce uses: shipping method, payment method, delivery frequency,
 * product option pickers where only one choice is valid.
 *
 * @example
 * <RadioGroup label="Shipping method" defaultValue="standard">
 *   <RadioGroupItem value="standard" label="Standard" description="4–7 business days" />
 *   <RadioGroupItem value="express" label="Express" description="1–2 business days" />
 * </RadioGroup>
 */
export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup(
  {
    label,
    hint,
    error,
    size = 'md',
    orientation = 'vertical',
    id: idProp,
    className,
    disabled,
    children,
    ...rootProps
  },
  ref,
) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const labelId = `${id}-label`;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const describedBy =
    [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined;

  const rootClasses = [
    'ds-radio-group-root',
    disabled && 'ds-radio-group-root--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClasses}>
      {label && (
        <span id={labelId} className="ds-radio-group-label">
          {label}
        </span>
      )}

      <RadixRadioGroup.Root
        ref={ref}
        id={id}
        className="ds-radio-group-items"
        orientation={orientation}
        disabled={disabled}
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        {...rootProps}
      >
        <RadioGroupContext.Provider value={{ size, hasError: Boolean(error) }}>
          {children}
        </RadioGroupContext.Provider>
      </RadixRadioGroup.Root>

      {hint && !error && (
        <span id={hintId} className="ds-radio-group-hint">
          {hint}
        </span>
      )}
      {error && (
        <span id={errorId} className="ds-radio-group-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
});
RadioGroup.displayName = 'RadioGroup';

// ─── RadioGroupItem ───────────────────────────────────────

/**
 * RadioGroupItem
 *
 * A single option inside a RadioGroup. Label is required; description is
 * optional and announced via aria-describedby.
 */
export const RadioGroupItem = forwardRef<HTMLButtonElement, RadioGroupItemProps>(
  function RadioGroupItem({ label, description, id: idProp, className, ...itemProps }, ref) {
    const { size, hasError } = useContext(RadioGroupContext);

    const generatedId = useId();
    const id = idProp ?? generatedId;
    const descriptionId = `${id}-description`;

    const itemClasses = ['ds-radio-item', `ds-radio-item--${size}`].filter(Boolean).join(' ');

    const circleClasses = [
      'ds-radio-item-circle',
      `ds-radio-item-circle--${size}`,
      hasError && 'ds-radio-item-circle--error',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={itemClasses}>
        <div className="ds-radio-item-field">
          <RadixRadioGroup.Item
            ref={ref}
            id={id}
            className={circleClasses}
            aria-describedby={description ? descriptionId : undefined}
            {...itemProps}
          >
            <RadixRadioGroup.Indicator className="ds-radio-item-indicator" />
          </RadixRadioGroup.Item>

          <label htmlFor={id} className="ds-radio-item-label">
            {label}
          </label>
        </div>

        {description && (
          <span id={descriptionId} className="ds-radio-item-description">
            {description}
          </span>
        )}
      </div>
    );
  },
);
RadioGroupItem.displayName = 'RadioGroupItem';
