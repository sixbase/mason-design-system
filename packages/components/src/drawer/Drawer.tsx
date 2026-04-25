import * as Dialog from '@radix-ui/react-dialog';
import { forwardRef } from 'react';
import type { ReactNode } from 'react';
import { X } from '../icon';
import './Drawer.css';

// ─── Types ────────────────────────────────────────────────

export type DrawerSide = 'left' | 'right';

export interface DrawerProps {
  /** Whether the drawer is open */
  open: boolean;
  /** Callback when the open state changes */
  onOpenChange: (open: boolean) => void;
  /** Which edge the drawer slides from */
  side?: DrawerSide;
  /** CSS width value (ignored below 768px — becomes full-width) */
  width?: string;
  /** Accessible title — rendered as a visually hidden label */
  title: string;
  /** Drawer body content */
  children: ReactNode;
  /** Additional class name on the panel */
  className?: string;
}

// ─── Component ────────────────────────────────────────────

export const Drawer = forwardRef<HTMLDivElement, DrawerProps>(
  function Drawer(
    {
      open,
      onOpenChange,
      side = 'right',
      width,
      title,
      children,
      className,
    },
    ref,
  ) {
    const classes = [
      'ds-drawer__panel',
      `ds-drawer__panel--${side}`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="ds-drawer__overlay" />
          <Dialog.Content
            ref={ref}
            className={classes}
            aria-label={title}
            style={width ? ({ '--drawer-width': width } as React.CSSProperties) : undefined}
          >
            <Dialog.Title className="ds-drawer__title">
              {title}
            </Dialog.Title>
            <Dialog.Description className="ds-drawer__title">
              {title}
            </Dialog.Description>

            <Dialog.Close className="ds-drawer__close" aria-label="Close">
              <X size="sm" />
            </Dialog.Close>

            <div className="ds-drawer__body">
              {children}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  },
);

Drawer.displayName = 'Drawer';
