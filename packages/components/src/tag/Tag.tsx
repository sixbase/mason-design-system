import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { X } from '../icon';
import './Tag.css';

export type TagVariant = 'default' | 'outline';
export type TagSize = 'sm' | 'md';

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  /** Visual style variant */
  variant?: TagVariant;
  /** Size of the tag — aligned with Badge sizing */
  size?: TagSize;
  /** Optional leading icon (decorative — hidden from assistive tech) */
  icon?: ReactNode;
  /**
   * When provided, renders a remove button after the label.
   * Called when the remove button is clicked.
   */
  onDismiss?: () => void;
  /**
   * Accessible label for the remove button.
   * Defaults to "Remove {children}" when children is a string.
   * Required for accessibility when children is not a plain string.
   */
  removeLabel?: string;
}

/**
 * Tag
 *
 * An interactive, removable token — active filters, selected options,
 * applied search refinements. Distinct from Badge: Badge is a passive
 * status display (stock state, sale labels); Tag represents a value the
 * user selected and can remove via `onDismiss`.
 *
 * Accessibility:
 * - Remove button gets `aria-label="Remove {children}"` automatically
 * - Remove button meets the 44px hit area on touch devices via an
 *   invisible pseudo-element (coarse-pointer only, since dismissible
 *   tags typically sit adjacent in a row)
 * - Focus ring on the remove button via `--focus-ring`
 *
 * @example
 * <Tag>Blue</Tag>
 * <Tag variant="outline">Size: M</Tag>
 * <Tag onDismiss={() => removeFilter('blue')}>Blue</Tag>
 */
export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag(
  {
    variant = 'default',
    size = 'md',
    icon,
    onDismiss,
    removeLabel,
    className,
    children,
    ...props
  },
  ref,
) {
  const classes = [
    'ds-tag',
    `ds-tag--${variant}`,
    `ds-tag--${size}`,
    onDismiss && 'ds-tag--dismissible',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const removeAriaLabel =
    removeLabel ??
    (typeof children === 'string' ? `Remove ${children}` : 'Remove');

  return (
    <span ref={ref} className={classes} {...props}>
      {icon && (
        <span className="ds-tag__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="ds-tag__label">{children}</span>
      {onDismiss && (
        <button
          type="button"
          className="ds-tag__remove"
          aria-label={removeAriaLabel}
          onClick={onDismiss}
        >
          <X size="sm" />
        </button>
      )}
    </span>
  );
});

Tag.displayName = 'Tag';
