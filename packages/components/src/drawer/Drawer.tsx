import * as Dialog from '@radix-ui/react-dialog';
import { forwardRef } from 'react';
import type { ReactNode } from 'react';
import { X } from '../icon';
import './Drawer.css';

// ─── Types ────────────────────────────────────────────────

export type DrawerSide = 'left' | 'right' | 'bottom';
export type DrawerSize = 'sm' | 'md' | 'lg';

export interface DrawerProps {
  /** Whether the drawer is open */
  open: boolean;
  /** Callback when the open state changes */
  onOpenChange: (open: boolean) => void;
  /** Which edge the drawer slides from. `bottom` renders a bottom sheet. */
  side?: DrawerSide;
  /**
   * Width preset for left/right drawers — maps to the modal size tokens
   * (`--size-modal-sm/md/lg`). Ignored for `side="bottom"` (always full-width).
   * When omitted, falls back to the drawer's default width.
   */
  size?: DrawerSize;
  /** CSS width value (overrides `size`; ignored below 768px — becomes full-width) */
  width?: string;
  /** Accessible title — rendered as a visually hidden label */
  title: string;
  /**
   * Accessible description announced when the drawer opens.
   * When omitted, `aria-describedby` is not set (no redundant text for screen readers).
   */
  description?: string;
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
      size,
      width,
      title,
      description,
      children,
      className,
    },
    ref,
  ) {
    const isBottom = side === 'bottom';

    const classes = [
      'ds-drawer__panel',
      `ds-drawer__panel--${side}`,
      size && !isBottom && `ds-drawer__panel--size-${size}`,
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
            // Radix auto-wires aria-describedby to a Description element.
            // Without one, explicitly opt out so no dangling reference is emitted.
            {...(description ? {} : { 'aria-describedby': undefined })}
            style={
              width && !isBottom
                ? ({ '--drawer-width': width } as React.CSSProperties)
                : undefined
            }
          >
            <Dialog.Title className="ds-drawer__title">
              {title}
            </Dialog.Title>
            {description && (
              <Dialog.Description className="ds-drawer__description">
                {description}
              </Dialog.Description>
            )}

            {isBottom && (
              <div className="ds-drawer__handle" aria-hidden="true" />
            )}

            <Dialog.Close type="button" className="ds-drawer__close" aria-label="Close">
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
