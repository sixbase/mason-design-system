import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { Heading } from '../typography/Typography';
import type { HeadingLevel } from '../typography/Typography';
import { Text } from '../typography/Typography';
import { Button } from '../button/Button';
import { safeHref } from '../internal/safe-url';
import './EmptyState.css';

// ─── Types ────────────────────────────────────────────────

export interface EmptyStateAction {
  /** Button label */
  label: string;
  /** Link target */
  href: string;
}

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  /** Optional icon or illustration */
  icon?: ReactNode;
  /** Main heading text */
  heading: string;
  /** Supporting description */
  description?: string;
  /** Primary call to action */
  action?: EmptyStateAction;
  /** Secondary call to action */
  secondaryAction?: EmptyStateAction;
  /** Compact layout for constrained contexts (e.g. Cart Drawer) */
  compact?: boolean;
  /**
   * Heading level (default `h2`). Size is unchanged — pick the level that
   * fits the page outline, e.g. `h3` inside a drawer or section that already
   * has its own `h2`.
   */
  headingLevel?: Exclude<HeadingLevel, 'h1'>;
}

// ─── Component ────────────────────────────────────────────

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  function EmptyState(
    {
      icon,
      heading,
      description,
      action,
      secondaryAction,
      compact = false,
      headingLevel = 'h2',
      className,
      ...props
    },
    ref,
  ) {
    const classes = [
      'ds-empty-state',
      compact && 'ds-empty-state--compact',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={classes} {...props}>
        {icon && <div className="ds-empty-state__icon">{icon}</div>}

        <Heading as={headingLevel} size={compact ? 'xl' : '2xl'} className="ds-empty-state__heading">
          {heading}
        </Heading>

        {description && (
          <Text as="p" size="sm" className="ds-empty-state__description">
            {description}
          </Text>
        )}

        {(action || secondaryAction) && (
          <div className="ds-empty-state__actions">
            {action && (
              <Button asChild variant="primary">
                <a href={safeHref(action.href)}>{action.label}</a>
              </Button>
            )}
            {secondaryAction && (
              <Button asChild variant="ghost">
                <a href={safeHref(secondaryAction.href)}>{secondaryAction.label}</a>
              </Button>
            )}
          </div>
        )}
      </div>
    );
  },
);

EmptyState.displayName = 'EmptyState';
