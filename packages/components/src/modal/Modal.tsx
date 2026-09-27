import * as Dialog from '@radix-ui/react-dialog';
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react';
import type { ComponentPropsWithoutRef, ElementRef, HTMLAttributes, ReactNode } from 'react';
import { X } from '../icon';
import { dialogOpener, returnFocus, trackDialogOpeners } from '../internal/dialog-opener';
import { useOverflowTabStop } from '../internal/use-overflow-tab-stop';
import './Modal.css';

// ─── Types ────────────────────────────────────────────────

export type ModalSize = 'sm' | 'md' | 'lg';

export interface ModalProps extends ComponentPropsWithoutRef<typeof Dialog.Root> {
  /**
   * Size preset — controls max-width of the dialog panel. Applies to the
   * nested ModalContent unless it sets its own `size`.
   */
  size?: ModalSize;
}

export interface ModalContentProps
  extends ComponentPropsWithoutRef<typeof Dialog.Content> {
  /** Size preset — controls max-width. Defaults to the Modal's `size`, then `'md'`. */
  size?: ModalSize;
  /** Below 640px, expand to fill the viewport (full-screen sheet) */
  fullScreenOnMobile?: boolean;
}

export interface ModalHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export interface ModalBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export interface ModalFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

// ─── Root ─────────────────────────────────────────────────

// Carries the root `size` down to ModalContent. The prop used to be
// accepted and documented on <Modal> but was silently dropped.
const ModalSizeContext = createContext<ModalSize | undefined>(undefined);

/**
 * Modal
 *
 * An accessible dialog overlay built on Radix UI Dialog. Traps focus,
 * returns focus on close, supports Escape key, and prevents background scrolling.
 *
 * Compound component API:
 * ```tsx
 * <Modal open={open} onOpenChange={setOpen}>
 *   <ModalTrigger asChild>
 *     <Button>Open dialog</Button>
 *   </ModalTrigger>
 *   <ModalContent>
 *     <ModalHeader>
 *       <ModalTitle>Confirm action</ModalTitle>
 *       <ModalDescription>Are you sure?</ModalDescription>
 *     </ModalHeader>
 *     <ModalBody>Content here</ModalBody>
 *     <ModalFooter>
 *       <ModalClose asChild><Button variant="secondary">Cancel</Button></ModalClose>
 *       <Button>Confirm</Button>
 *     </ModalFooter>
 *   </ModalContent>
 * </Modal>
 * ```
 */
export function Modal({ size, children, ...props }: ModalProps) {
  // Safari never focuses the button that was clicked/tapped, so the opener
  // is taken from the last press there (see internal/dialog-opener).
  useEffect(() => trackDialogOpeners(), []);
  return (
    <ModalSizeContext.Provider value={size}>
      <Dialog.Root {...props}>{children}</Dialog.Root>
    </ModalSizeContext.Provider>
  );
}

// ─── Trigger ──────────────────────────────────────────────

// Thin wrappers, not bare re-exports: setting `displayName` on
// `Dialog.Trigger` / `Dialog.Close` renamed Radix's shared components, so
// every other Dialog in the app (Drawer, CartDrawer, the Header menu)
// showed up in React DevTools as "ModalClose".
export const ModalTrigger = forwardRef<
  ElementRef<typeof Dialog.Trigger>,
  ComponentPropsWithoutRef<typeof Dialog.Trigger>
>(function ModalTrigger(props, ref) {
  return <Dialog.Trigger ref={ref} {...props} />;
});
ModalTrigger.displayName = 'ModalTrigger';

// ─── Close ────────────────────────────────────────────────

export const ModalClose = forwardRef<
  ElementRef<typeof Dialog.Close>,
  ComponentPropsWithoutRef<typeof Dialog.Close>
>(function ModalClose(props, ref) {
  return <Dialog.Close ref={ref} {...props} />;
});
ModalClose.displayName = 'ModalClose';

// ─── Portal + Overlay + Content ───────────────────────────

export const ModalContent = forwardRef<HTMLDivElement, ModalContentProps>(
  function ModalContent(
    {
      size: sizeProp,
      fullScreenOnMobile = false,
      className,
      children,
      onOpenAutoFocus,
      onCloseAutoFocus,
      ...props
    },
    ref,
  ) {
    // A controlled Modal opened from a plain button (no ModalTrigger) lost
    // keyboard focus to <body> on close: Radix only returns focus to its
    // own trigger ref. Remember what had focus at open and return there.
    const returnFocusRef = useRef<HTMLElement | null>(null);
    const rootSize = useContext(ModalSizeContext);
    const size = sizeProp ?? rootSize ?? 'md';
    const classes = [
      'ds-modal__content',
      `ds-modal__content--${size}`,
      fullScreenOnMobile && 'ds-modal__content--full-screen-mobile',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <Dialog.Portal>
        <Dialog.Overlay className="ds-modal__overlay" />
        <Dialog.Content
          ref={ref}
          className={classes}
          {...props}
          // Fires before focus moves in, so activeElement is still the opener
          onOpenAutoFocus={(event) => {
            returnFocusRef.current = dialogOpener();
            onOpenAutoFocus?.(event);
          }}
          onCloseAutoFocus={(event) => {
            onCloseAutoFocus?.(event);
            const opener = returnFocusRef.current;
            returnFocusRef.current = null;
            if (!event.defaultPrevented && opener?.isConnected) {
              event.preventDefault();
              returnFocus(opener);
            }
          }}
        >
          {children}
          <Dialog.Close type="button" className="ds-modal__close" aria-label="Close">
            <X size="sm" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    );
  },
);
ModalContent.displayName = 'ModalContent';

// ─── Title ────────────────────────────────────────────────

export const ModalTitle = forwardRef<
  HTMLHeadingElement,
  ComponentPropsWithoutRef<typeof Dialog.Title>
>(function ModalTitle({ className, ...props }, ref) {
  const classes = ['ds-modal__title', className].filter(Boolean).join(' ');
  return <Dialog.Title ref={ref} className={classes} {...props} />;
});
ModalTitle.displayName = 'ModalTitle';

// ─── Description ──────────────────────────────────────────

export const ModalDescription = forwardRef<
  HTMLParagraphElement,
  ComponentPropsWithoutRef<typeof Dialog.Description>
>(function ModalDescription({ className, ...props }, ref) {
  const classes = ['ds-modal__description', className]
    .filter(Boolean)
    .join(' ');
  return <Dialog.Description ref={ref} className={classes} {...props} />;
});
ModalDescription.displayName = 'ModalDescription';

// ─── Header ───────────────────────────────────────────────

export const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  function ModalHeader({ className, ...props }, ref) {
    const classes = ['ds-modal__header', className].filter(Boolean).join(' ');
    return <div ref={ref} className={classes} {...props} />;
  },
);
ModalHeader.displayName = 'ModalHeader';

// ─── Body ─────────────────────────────────────────────────

export const ModalBody = forwardRef<HTMLDivElement, ModalBodyProps>(
  function ModalBody({ className, tabIndex, ...props }, ref) {
    const [setNode, overflows] = useOverflowTabStop();
    const setRefs = useCallback(
      (el: HTMLDivElement | null) => {
        setNode(el);
        if (typeof ref === 'function') ref(el);
        else if (ref) ref.current = el;
      },
      [ref, setNode],
    );
    const classes = ['ds-modal__body', className].filter(Boolean).join(' ');
    return (
      <div
        ref={setRefs}
        className={classes}
        tabIndex={tabIndex ?? (overflows ? 0 : undefined)}
        {...props}
      />
    );
  },
);
ModalBody.displayName = 'ModalBody';

// ─── Footer ───────────────────────────────────────────────

export const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
  function ModalFooter({ className, ...props }, ref) {
    const classes = ['ds-modal__footer', className].filter(Boolean).join(' ');
    return <div ref={ref} className={classes} {...props} />;
  },
);
ModalFooter.displayName = 'ModalFooter';
