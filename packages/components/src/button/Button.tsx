import { forwardRef } from 'react';
import { Slot } from '@ds/primitives';
import type { Size, Variant } from '@ds/primitives';
import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from 'react';
import { devWarning } from '../internal/dev-warning';
import './Button.css';

/** Button visual style — `primary` | `secondary` | `ghost` | `destructive`. */
export type ButtonVariant = Variant;
/** Button height step — maps to `--size-control-sm/md/lg`. */
export type ButtonSize = Size;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: ButtonSize;
  /** Render the button as a child element (e.g. a link) using Radix Slot */
  asChild?: boolean;
  /** Show a loading spinner and prevent interaction */
  loading?: boolean;
  /** Icon-only button — removes horizontal padding, requires an aria-label */
  iconOnly?: boolean;
  /** Stretch to fill parent container width */
  fullWidth?: boolean;
  /** Icon to render before the label */
  leadingIcon?: ReactNode;
  /** Icon to render after the label */
  trailingIcon?: ReactNode;
}

/**
 * Button
 *
 * The primary interactive element. Supports four variants (primary, secondary,
 * ghost, destructive), three sizes, loading state, icon-only layout, and
 * polymorphic rendering via `asChild`.
 *
 * @example
 * <Button variant="primary" size="md" onClick={handleSave}>Save changes</Button>
 * <Button asChild><a href="/dashboard">Go to dashboard</a></Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    asChild = false,
    loading = false,
    iconOnly = false,
    fullWidth = false,
    leadingIcon,
    trailingIcon,
    disabled,
    type,
    onClick,
    className,
    children,
    ...props
  },
  ref,
) {
  const Comp = asChild ? Slot : 'button';
  const isDisabled = Boolean(disabled || loading);

  // An icon-only button has no text, so without one of these it is
  // announced as just "button". (With asChild the slotted child names it.)
  if (iconOnly && !asChild && !props['aria-label'] && !props['aria-labelledby'] && !props.title) {
    devWarning(
      'Button:icon-only-name',
      'Button: `iconOnly` needs an `aria-label` (or `aria-labelledby`) — screen readers otherwise announce it as just "button".',
    );
  }

  const classes = [
    'ds-button',
    `ds-button--${variant}`,
    `ds-button--${size}`,
    loading && 'ds-button--loading',
    iconOnly && 'ds-button--icon-only',
    fullWidth && 'ds-button--full-width',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // When asChild, Slot requires exactly one child element — skip spinner/icons.
  // Icon-only + loading: the spinner replaces the icon (two glyphs don't fit
  // the square); the required aria-label still names the button.
  const content = asChild
    ? children
    : (
      <>
        {loading && <span className="ds-button__spinner" aria-hidden="true" />}
        {!loading && leadingIcon}
        {!(loading && iconOnly) && children}
        {!loading && trailingIcon}
      </>
    );

  // A slotted element (e.g. <a>) has no native disabled state: `disabled`
  // is invalid on it and the link would stay focusable and navigable. Take
  // it out of the tab order and swallow activation instead.
  const slotDisabled = asChild && isDisabled;
  // Loading is NOT native `disabled`: disabling the button the user just
  // pressed throws their keyboard focus to <body> (focus is lost for the
  // whole loading → success cycle). A loading button stays focusable,
  // announces aria-disabled + aria-busy, and swallows activation instead
  // — which also blocks a second form submit.
  const loadingOnly = loading && !disabled;
  const handleClick =
    slotDisabled || loadingOnly
      ? (event: MouseEvent<HTMLButtonElement>) => event.preventDefault()
      : onClick;

  return (
    <Comp
      ref={ref}
      className={classes}
      // Default to "button" so a Button inside a <form> never submits by
      // accident; pass type="submit" explicitly for submit buttons.
      type={asChild ? undefined : (type ?? 'button')}
      disabled={asChild ? undefined : Boolean(disabled)}
      aria-disabled={isDisabled}
      aria-busy={loading || undefined}
      tabIndex={slotDisabled ? -1 : undefined}
      onClick={handleClick}
      {...props}
    >
      {content}
    </Comp>
  );
});

Button.displayName = 'Button';
