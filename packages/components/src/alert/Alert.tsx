import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { Text } from '../typography/Typography';
import { CircleCheck, CircleX, Info, TriangleAlert, X } from '../icon';
import { Button } from '../button/Button';
import './Alert.css';

// ─── Types ────────────────────────────────────────────────

export type AlertVariant = 'info' | 'success' | 'warning' | 'destructive';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual style */
  variant?: AlertVariant;
  /** Optional heading */
  title?: string;
  /** Description content */
  children: ReactNode;
  /** Show dismiss button */
  dismissible?: boolean;
  /** Called when dismiss button is clicked */
  onDismiss?: () => void;
  /** Override the default variant icon */
  icon?: ReactNode;
}

// ─── Variant icons ────────────────────────────────────────

const VARIANT_ICONS: Record<AlertVariant, () => ReactNode> = {
  info: () => <Info size="md" />,
  success: () => <CircleCheck size="md" />,
  warning: () => <TriangleAlert size="md" />,
  destructive: () => <CircleX size="md" />,
};

/** Destructive/warning use assertive role="alert"; info/success use polite role="status" */
const VARIANT_ROLES: Record<AlertVariant, 'alert' | 'status'> = {
  info: 'status',
  success: 'status',
  warning: 'alert',
  destructive: 'alert',
};

// ─── Component ────────────────────────────────────────────

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  function Alert(
    {
      variant = 'info',
      title,
      children,
      dismissible = false,
      onDismiss,
      icon,
      className,
      ...props
    },
    ref,
  ) {
    const classes = [
      'ds-alert',
      `ds-alert--${variant}`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const VariantIcon = VARIANT_ICONS[variant];

    return (
      <div
        ref={ref}
        className={classes}
        role={VARIANT_ROLES[variant]}
        {...props}
      >
        <span className="ds-alert__icon">
          {icon ?? <VariantIcon />}
        </span>

        <div className="ds-alert__content">
          {title && (
            <Text as="p" size="sm" weight="semibold" className="ds-alert__title">
              {title}
            </Text>
          )}
          <Text as="p" size="sm" className="ds-alert__description">
            {children}
          </Text>
        </div>

        {dismissible && (
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            onClick={onDismiss}
            aria-label="Dismiss alert"
            className="ds-alert__dismiss"
          >
            <X size="sm" />
          </Button>
        )}
      </div>
    );
  },
);

Alert.displayName = 'Alert';
