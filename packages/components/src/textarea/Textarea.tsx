import { forwardRef, useId } from 'react';
import type { FormEvent, TextareaHTMLAttributes } from 'react';
import './Textarea.css';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Visible label above the textarea */
  label?: string;
  /** Helper text shown below the textarea */
  hint?: string;
  /** Error message — sets aria-invalid and shows error styling */
  error?: string;
  /** Grow with content (CSS field-sizing where supported, JS fallback elsewhere) */
  autoResize?: boolean;
}

/** True when the browser supports `field-sizing: content` natively. */
function supportsFieldSizing(): boolean {
  return (
    typeof CSS !== 'undefined' &&
    typeof CSS.supports === 'function' &&
    CSS.supports('field-sizing', 'content')
  );
}

/**
 * Textarea
 *
 * A multi-line text input with built-in label, hint, and error state.
 * Accessible by default — label is associated via htmlFor/id, and hint/error
 * messages are announced via aria-describedby.
 *
 * Common ecommerce uses: order notes, gift messages, product reviews,
 * contact forms.
 *
 * @example
 * <Textarea label="Order notes" placeholder="Delivery instructions..." />
 * <Textarea label="Gift message" autoResize hint="Printed on the packing slip" />
 * <Textarea label="Review" error="Please write at least 20 characters" />
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    label,
    hint,
    error,
    autoResize = false,
    rows = 4,
    id: idProp,
    required,
    disabled,
    className,
    onInput,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const fieldClasses = [
    'ds-textarea-field',
    autoResize && 'ds-textarea-field--auto-resize',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined;

  // JS fallback for browsers without field-sizing: content — the element
  // tracks its own scrollHeight. Progressive enhancement, not a style override.
  const handleInput = (event: FormEvent<HTMLTextAreaElement>) => {
    if (autoResize && !supportsFieldSizing()) {
      const element = event.currentTarget;
      element.style.height = 'auto';
      element.style.height = `${element.scrollHeight}px`;
    }
    onInput?.(event);
  };

  return (
    <div className="ds-textarea-root">
      {label && (
        <label
          htmlFor={id}
          className={['ds-textarea-label', required && 'ds-textarea-label--required']
            .filter(Boolean)
            .join(' ')}
        >
          {label}
        </label>
      )}

      <textarea
        ref={ref}
        id={id}
        className={fieldClasses}
        rows={rows}
        disabled={disabled}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        onInput={handleInput}
        {...props}
      />

      {hint && !error && (
        <span id={hintId} className="ds-textarea-hint">
          {hint}
        </span>
      )}

      {error && (
        <span id={errorId} className="ds-textarea-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';
