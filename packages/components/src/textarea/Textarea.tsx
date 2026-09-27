import { forwardRef, useCallback, useEffect, useId, useLayoutEffect, useRef } from 'react';
import type { CSSProperties, FormEvent, TextareaHTMLAttributes } from 'react';
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

/** Grow/shrink the element to its content (JS fallback for field-sizing). */
function fitToContent(element: HTMLTextAreaElement) {
  element.style.height = 'auto';
  // scrollHeight excludes the borders, but the field is border-box: without
  // adding them back the box came out 2px short (Firefox, Safari ≤18), so
  // the last line sat under overflow: hidden and the text jumped up as each
  // new line was typed. offsetHeight − clientHeight = the two borders.
  const borders = element.offsetHeight - element.clientHeight;
  element.style.height = `${element.scrollHeight + borders}px`;
}

// Layout effect in the browser (no flash of the wrong height), plain effect on
// the server where layout effects warn and never run anyway.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

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
    style,
    'aria-describedby': ariaDescribedBy,
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

  // Only reference ids that are actually rendered — the hint is hidden while
  // an error shows. Consumer ids are kept, not replaced.
  const showHint = Boolean(hint) && !error;
  const describedBy =
    [ariaDescribedBy, showHint && hintId, error && errorId].filter(Boolean).join(' ') || undefined;

  // Local handle on the element for the auto-resize fallback, merged with the
  // consumer's ref.
  const fieldRef = useRef<HTMLTextAreaElement | null>(null);
  const setRefs = useCallback(
    (node: HTMLTextAreaElement | null) => {
      fieldRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  // JS fallback for browsers without field-sizing: content — the element
  // tracks its own scrollHeight. Progressive enhancement, not a style override.
  // Runs on input AND whenever the value arrives from outside (pre-filled
  // defaultValue, parent resets a controlled value). Input alone left a
  // pre-filled field stuck at `rows` height with overflow hidden, so the
  // extra text was clipped and unreachable.
  //
  // Each fit is a forced layout (write height, read scrollHeight). The text
  // last fitted is remembered so a controlled value that only echoes what the
  // input handler just measured isn't measured again — it was twice per
  // keystroke in the usual controlled form.
  const fittedText = useRef<string | null>(null);
  const fit = (element: HTMLTextAreaElement) => {
    fitToContent(element);
    fittedText.current = element.value;
  };

  const handleInput = (event: FormEvent<HTMLTextAreaElement>) => {
    if (autoResize && !supportsFieldSizing()) fit(event.currentTarget);
    onInput?.(event);
  };

  const { value } = props;
  useIsomorphicLayoutEffect(() => {
    const element = fieldRef.current;
    if (!autoResize || !element || supportsFieldSizing()) {
      fittedText.current = null;
      return;
    }
    if (element.value !== fittedText.current) fit(element);
  }, [autoResize, value]);

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
        ref={setRefs}
        id={id}
        className={fieldClasses}
        rows={rows}
        disabled={disabled}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        onInput={handleInput}
        // Auto-resize: `rows` is the minimum height in every browser. Native
        // field-sizing ignores `rows` (a 1-line field in Chrome/Safari 26)
        // while the JS fallback honoured it (Firefox, older Safari).
        style={autoResize ? ({ ...style, '--textarea-rows': rows } as CSSProperties) : style}
        {...props}
      />

      {showHint && (
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
