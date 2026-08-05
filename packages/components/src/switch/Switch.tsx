import * as RadixSwitch from '@radix-ui/react-switch';
import { forwardRef, useId } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import './Switch.css';

// ─── Types ────────────────────────────────────────────────

export type SwitchSize = 'sm' | 'md';

export interface SwitchProps extends Omit<ComponentPropsWithoutRef<typeof RadixSwitch.Root>, 'asChild'> {
  /** Visible label next to the switch */
  label?: string;
  /** Helper text below the label */
  hint?: string;
  /** Error message — adds error styling */
  error?: string;
  /** Size of the switch */
  size?: SwitchSize;
}

/**
 * Switch
 *
 * An accessible toggle switch built on Radix UI. Supports label, hint, and
 * error. Use for instant on/off settings — unlike a checkbox, a switch
 * implies the change takes effect immediately.
 *
 * Common ecommerce uses: notification preferences, gift wrapping toggle,
 * billing address same-as-shipping, marketing opt-in in account settings.
 *
 * @example
 * <Switch label="Email me about restocks" />
 * <Switch label="Gift wrapping" hint="Adds $5.00 at checkout" />
 * <Switch label="Accept terms" error="You must enable this to continue" />
 */
export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  {
    label,
    hint,
    error,
    size = 'md',
    id: idProp,
    className,
    disabled,
    ...rootProps
  },
  ref,
) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const describedBy =
    [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined;

  const rootClasses = [
    'ds-switch-root',
    `ds-switch-root--${size}`,
    disabled && 'ds-switch-root--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const trackClasses = [
    'ds-switch-track',
    `ds-switch-track--${size}`,
    error && 'ds-switch-track--error',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClasses}>
      <div className="ds-switch-field">
        <RadixSwitch.Root
          ref={ref}
          id={id}
          className={trackClasses}
          disabled={disabled}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          {...rootProps}
        >
          <RadixSwitch.Thumb className="ds-switch-thumb" />
        </RadixSwitch.Root>

        {label && (
          <label htmlFor={id} className="ds-switch-label">
            {label}
          </label>
        )}
      </div>

      {hint && !error && (
        <span id={hintId} className="ds-switch-hint">
          {hint}
        </span>
      )}
      {error && (
        <span id={errorId} className="ds-switch-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
});
Switch.displayName = 'Switch';
