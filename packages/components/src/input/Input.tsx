import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import './Input.css';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Visible label above the input */
  label?: string;
  /** Helper text shown below the input */
  hint?: string;
  /** Error message — sets aria-invalid and shows error styling */
  error?: string;
  /** Size of the input field */
  size?: InputSize;
  /** Icon or element before the input value */
  leadingAdornment?: ReactNode;
  /** Icon or element after the input value */
  trailingAdornment?: ReactNode;
}

/**
 * Input
 *
 * A text input with built-in label, hint, and error state. Accessible by
 * default — label is always associated with the input via htmlFor/id, and
 * error messages are announced via aria-describedby.
 *
 * @example
 * <Input label="Email" type="email" placeholder="you@example.com" />
 * <Input label="Email" error="Please enter a valid email" />
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    hint,
    error,
    size = 'md',
    leadingAdornment,
    trailingAdornment,
    id: idProp,
    required,
    disabled,
    className,
    'aria-describedby': ariaDescribedBy,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const hasLeading = Boolean(leadingAdornment);
  const hasTrailing = Boolean(trailingAdornment);

  const wrapperClasses = [
    'ds-input-wrapper',
    hasLeading && 'ds-input-wrapper--leading',
    hasTrailing && 'ds-input-wrapper--trailing',
  ]
    .filter(Boolean)
    .join(' ');

  const fieldClasses = ['ds-input-field', `ds-input-field--${size}`, className].filter(Boolean).join(' ');

  // Only reference ids that are actually rendered — the hint is hidden while
  // an error shows. Consumer ids are kept, not replaced.
  const showHint = Boolean(hint) && !error;
  const describedBy =
    [ariaDescribedBy, showHint && hintId, error && errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="ds-input-root">
      {label && (
        <label
          htmlFor={id}
          className={['ds-input-label', required && 'ds-input-label--required'].filter(Boolean).join(' ')}
        >
          {label}
        </label>
      )}

      <div className={wrapperClasses}>
        {hasLeading && (
          <span className="ds-input-adornment ds-input-adornment--leading" aria-hidden="true">
            {leadingAdornment}
          </span>
        )}

        <input
          ref={ref}
          id={id}
          className={fieldClasses}
          disabled={disabled}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...props}
        />

        {hasTrailing && (
          <span className="ds-input-adornment ds-input-adornment--trailing" aria-hidden="true">
            {trailingAdornment}
          </span>
        )}
      </div>

      {showHint && (
        <span id={hintId} className="ds-input-hint">
          {hint}
        </span>
      )}

      {error && (
        <span id={errorId} className="ds-input-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
