import * as RadixCheckbox from '@radix-ui/react-checkbox';
import { forwardRef, useId } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import './Checkbox.css';

// ─── Types ────────────────────────────────────────────────

export type CheckboxSize = 'sm' | 'md';

export interface CheckboxProps extends Omit<ComponentPropsWithoutRef<typeof RadixCheckbox.Root>, 'asChild'> {
  /** Visible label next to the checkbox */
  label?: string;
  /** Helper text below the label */
  hint?: string;
  /** Error message — adds error styling */
  error?: string;
  /** Size of the checkbox */
  size?: CheckboxSize;
}

/**
 * Checkbox
 *
 * An accessible checkbox built on Radix UI. Supports indeterminate state,
 * label, hint, and error. All keyboard-accessible by default.
 *
 * Common ecommerce uses: filter panels, newsletter opt-in, terms acceptance,
 * cart item selection.
 *
 * @example
 * <Checkbox label="Remember me" />
 * <Checkbox label="I agree to the terms" error="You must accept the terms" />
 * <Checkbox checked="indeterminate" label="Select all" />
 */
export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(function Checkbox(
  {
    label,
    hint,
    error,
    size = 'md',
    id: idProp,
    className,
    disabled,
    'aria-describedby': ariaDescribedBy,
    ...rootProps
  },
  ref,
) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  // Only reference ids that are actually rendered — the hint is hidden while
  // an error shows. Consumer ids are kept, not replaced.
  const showHint = Boolean(hint) && !error;
  const describedBy =
    [ariaDescribedBy, showHint && hintId, error && errorId].filter(Boolean).join(' ') || undefined;

  const rootClasses = [
    'ds-checkbox-root',
    `ds-checkbox-root--${size}`,
    disabled && 'ds-checkbox-root--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const boxClasses = [
    'ds-checkbox-box',
    `ds-checkbox-box--${size}`,
    error && 'ds-checkbox-box--error',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClasses}>
      <div className="ds-checkbox-field">
        <RadixCheckbox.Root
          ref={ref}
          id={id}
          className={boxClasses}
          disabled={disabled}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          {...rootProps}
        >
          <RadixCheckbox.Indicator className="ds-checkbox-indicator">
            <CheckIcon />
            <DashIcon />
          </RadixCheckbox.Indicator>
        </RadixCheckbox.Root>

        {label && (
          <label htmlFor={id} className="ds-checkbox-label">
            {label}
          </label>
        )}
      </div>

      {showHint && (
        <span id={hintId} className="ds-checkbox-hint">
          {hint}
        </span>
      )}
      {error && (
        <span id={errorId} className="ds-checkbox-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
});
Checkbox.displayName = 'Checkbox';

// ─── Icon ──────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg
      className="ds-checkbox-icon ds-checkbox-icon--check"
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden="true"
    >
      <path
        pathLength={1}
        d="M1.5 5L4 7.5L8.5 2.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Indeterminate dash. A stroked glyph (currentColor), not a CSS background:
 * forced-colors mode repaints backgrounds to the canvas color, which erased
 * the old ::before dash and made "indeterminate" look unchecked.
 */
function DashIcon() {
  return (
    <svg
      className="ds-checkbox-icon ds-checkbox-icon--dash"
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden="true"
    >
      <path d="M2.5 5H7.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}
