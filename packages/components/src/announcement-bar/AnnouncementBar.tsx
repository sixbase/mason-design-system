import { forwardRef, useState, useCallback } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { Text } from '../typography/Typography';
import { X } from '../icon';
import './AnnouncementBar.css';

// ─── Types ────────────────────────────────────────────────

export interface AnnouncementBarProps extends HTMLAttributes<HTMLElement> {
  /** Announcement message text */
  children: ReactNode;
  /** Optional link URL — wraps the message in an anchor */
  href?: string;
  /** Whether the bar can be dismissed */
  dismissible?: boolean;
  /** Called when the dismiss button is clicked */
  onDismiss?: () => void;
}

// ─── Component ────────────────────────────────────────────

export const AnnouncementBar = forwardRef<HTMLElement, AnnouncementBarProps>(
  function AnnouncementBar(
    {
      children,
      href,
      dismissible = false,
      onDismiss,
      className,
      ...props
    },
    ref,
  ) {
    const [dismissed, setDismissed] = useState(false);

    const handleDismiss = useCallback(() => {
      setDismissed(true);
      onDismiss?.();
    }, [onDismiss]);

    if (dismissed) return null;

    const classes = ['ds-announcement-bar', className]
      .filter(Boolean)
      .join(' ');

    const message = (
      <Text as="span" size="sm" className="ds-announcement-bar__message">
        {children}
      </Text>
    );

    return (
      <aside
        ref={ref}
        className={classes}
        role="region"
        aria-label="Store announcement"
        {...props}
      >
        <div className="ds-announcement-bar__inner">
          {href ? (
            <a href={href} className="ds-announcement-bar__link">
              {message}
            </a>
          ) : (
            message
          )}

          {dismissible && (
            <button
              type="button"
              className="ds-announcement-bar__dismiss"
              aria-label="Dismiss announcement"
              onClick={handleDismiss}
            >
              <X size="sm" />
            </button>
          )}
        </div>
      </aside>
    );
  },
);

AnnouncementBar.displayName = 'AnnouncementBar';
