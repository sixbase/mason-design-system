import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { Text } from '../typography/Typography';
import './Divider.css';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerVariant = 'default' | 'subtle';
export type DividerSpacing = 'none' | 'sm' | 'md' | 'lg';

export interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  /** Orientation of the divider */
  orientation?: DividerOrientation;
  /** Visual style variant */
  variant?: DividerVariant;
  /** Spacing above/below (horizontal) or left/right (vertical) */
  spacing?: DividerSpacing;
  /**
   * Optional centered text label between two rule lines — the "OR"
   * pattern in checkout ("Express checkout — OR — pay by card").
   * Horizontal orientation only; ignored when vertical.
   */
  label?: string;
}

/**
 * Divider
 *
 * A visual separator between content sections. Renders as `<hr>` for
 * horizontal orientation and `<div role="separator">` for vertical.
 *
 * @example
 * <Divider />
 * <Divider variant="subtle" spacing="lg" />
 * <Divider orientation="vertical" />
 * <Divider label="OR" />
 */
export const Divider = forwardRef<HTMLHRElement, DividerProps>(function Divider(
  {
    orientation = 'horizontal',
    variant = 'default',
    spacing = 'md',
    label,
    className,
    ...props
  },
  ref,
) {
  const classes = [
    'ds-divider',
    `ds-divider--${orientation}`,
    `ds-divider--${variant}`,
    `ds-divider--spacing-${spacing}`,
    orientation === 'horizontal' && label != null && 'ds-divider--labeled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (orientation === 'horizontal' && label != null) {
    return (
      // role="separator" has presentational children, so the visible
      // label never reaches assistive tech — name the separator with it.
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        role="separator"
        aria-orientation="horizontal"
        aria-label={label}
        className={classes}
        {...(props as HTMLAttributes<HTMLDivElement>)}
      >
        <span className="ds-divider__line" aria-hidden="true" />
        <Text as="span" size="sm" className="ds-divider__label">
          {label}
        </Text>
        <span className="ds-divider__line" aria-hidden="true" />
      </div>
    );
  }

  if (orientation === 'vertical') {
    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        role="separator"
        aria-orientation="vertical"
        className={classes}
        {...(props as HTMLAttributes<HTMLDivElement>)}
      />
    );
  }

  return (
    <hr
      ref={ref}
      className={classes}
      {...props}
    />
  );
});

Divider.displayName = 'Divider';
