import * as Dialog from '@radix-ui/react-dialog';
import { forwardRef, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { X } from '../icon';
import { dialogOpener, returnFocus, trackDialogOpeners } from '../internal/dialog-opener';
import { useOverflowTabStop } from '../internal/use-overflow-tab-stop';
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

    // Drawer is controlled and has no Dialog.Trigger, so Radix's close
    // handler focused `triggerRef.current` — null — and keyboard focus fell
    // to <body> (WCAG 2.4.3). Remember what had focus when the drawer
    // opened (usually the button that opened it) and hand focus back to it.
    const returnFocusRef = useRef<HTMLElement | null>(null);
    // Safari never focuses the button that was clicked/tapped, so the opener
    // is taken from the last press there (see internal/dialog-opener).
    useEffect(() => trackDialogOpeners(), []);
    const [setBodyNode, bodyOverflows] = useOverflowTabStop();

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
            // No aria-describedby override: Radix (≥1.1.23) only sets it
            // while a Dialog.Description is mounted, which is exactly when
            // `description` is given.
            // Fires before focus moves in, so activeElement is still the opener
            onOpenAutoFocus={() => {
              returnFocusRef.current = dialogOpener();
            }}
            onCloseAutoFocus={(event) => {
              const opener = returnFocusRef.current;
              returnFocusRef.current = null;
              if (opener?.isConnected) {
                event.preventDefault();
                returnFocus(opener);
              }
            }}
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

            <div
              ref={setBodyNode}
              className="ds-drawer__body"
              // A scrollable region must be keyboard-focusable (WCAG 2.1.1,
              // axe scrollable-region-focusable) — see useOverflowTabStop.
              // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
              tabIndex={bodyOverflows ? 0 : undefined}
            >
              {children}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  },
);

Drawer.displayName = 'Drawer';
