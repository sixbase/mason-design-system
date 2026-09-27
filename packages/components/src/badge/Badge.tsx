import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import './Badge.css';

export type BadgeVariant = 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Visual style variant */
  variant?: BadgeVariant;
  /** Size of the badge */
  size?: BadgeSize;
  /**
   * Notification count displayed by this badge.
   * When set, the badge automatically renders with role="status"
   * and aria-label="N notifications".
   */
  count?: number;
  /**
   * Show a small status dot before the label. The dot inherits the
   * variant's text color, so the label always names the state the dot
   * signals (color is never the only indicator — WCAG 1.4.1).
   * Common for stock/status: "In stock", "Low stock", "Shipped".
   */
  dot?: boolean;
}

/**
 * Badge
 *
 * A small label for status, categories, and product metadata.
 * Common uses: "New", "Sale", "Out of stock", "Free shipping", order status.
 *
 * Accessibility:
 * - A badge is plain text by default, whatever its variant. A live region
 *   (`role="status"`) is announced whenever its text changes, so making
 *   every "Sale" / "Out of stock" badge one meant a filtered grid re-read
 *   its badges aloud. Pass `role="status"` yourself only on a badge whose
 *   text changes while the page is open and should be announced.
 * - Use `count` for notification badges (role="status" + aria-label, since
 *   a count is live by nature and a plain span cannot carry a label)
 * - Focus ring provided for interactive usage (links, buttons, dismissible)
 *
 * @example
 * <Badge variant="success">In stock</Badge>
 * <Badge variant="destructive">Out of stock</Badge>
 * <Badge variant="secondary">Sale</Badge>
 * <Badge count={3} />
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { variant = 'default', size = 'md', count, dot = false, className, children, role, ...props },
  ref,
) {
  const classes = [
    'ds-badge',
    `ds-badge--${variant}`,
    `ds-badge--${size}`,
    dot && 'ds-badge--dot',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Explicit role wins. Only a count badge is a live region by default.
  const resolvedRole = role ?? (count != null ? 'status' : undefined);

  // Notification count badge: "3 notifications"
  const ariaLabel =
    props['aria-label'] ??
    (count != null ? `${count} notification${count !== 1 ? 's' : ''}` : undefined);

  const content = count != null ? count : children;

  return (
    <span
      ref={ref}
      className={classes}
      role={resolvedRole}
      aria-label={ariaLabel}
      {...props}
    >
      {dot && <span className="ds-badge__dot" aria-hidden="true" />}
      {content}
    </span>
  );
});

Badge.displayName = 'Badge';
