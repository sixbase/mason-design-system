import { forwardRef } from 'react';
import { Slot } from '@ds/primitives';
import type { Size, Variant } from '@ds/primitives';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: Variant;
  /** Size of the button */
  size?: Size;
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
    className,
    children,
    ...props
  },
  ref,
) {
  const Comp = asChild ? Slot : 'button';

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

  // When asChild, Slot requires exactly one child element — skip spinner/icons
  const content = asChild
    ? children
    : (
      <>
        {loading && <span className="ds-button__spinner" aria-hidden="true" />}
        {!loading && leadingIcon}
        {children}
        {!loading && trailingIcon}
      </>
    );

  return (
    <Comp
      ref={ref}
      className={classes}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {content}
    </Comp>
  );
});

Button.displayName = 'Button';
