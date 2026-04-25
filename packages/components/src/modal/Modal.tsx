import * as Dialog from '@radix-ui/react-dialog';
import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { X } from '../icon';
import './Modal.css';

// ─── Types ────────────────────────────────────────────────

export type ModalSize = 'sm' | 'md' | 'lg';

export interface ModalProps extends ComponentPropsWithoutRef<typeof Dialog.Root> {
  /** Size preset — controls max-width of the dialog panel */
  size?: ModalSize;
}

export interface ModalContentProps
  extends ComponentPropsWithoutRef<typeof Dialog.Content> {
  /** Size preset — controls max-width */
  size?: ModalSize;
}

export interface ModalHeaderProps {
  children: ReactNode;
  className?: string;
}

export interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}

// ─── Root ─────────────────────────────────────────────────

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
export function Modal({ children, ...props }: ModalProps) {
  return <Dialog.Root {...props}>{children}</Dialog.Root>;
}

// ─── Trigger ──────────────────────────────────────────────

export const ModalTrigger = Dialog.Trigger;
ModalTrigger.displayName = 'ModalTrigger';

// ─── Close ────────────────────────────────────────────────

export const ModalClose = Dialog.Close;
ModalClose.displayName = 'ModalClose';

// ─── Portal + Overlay + Content ───────────────────────────

export const ModalContent = forwardRef<HTMLDivElement, ModalContentProps>(
  function ModalContent({ size = 'md', className, children, ...props }, ref) {
    const classes = [
      'ds-modal__content',
      `ds-modal__content--${size}`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <Dialog.Portal>
        <Dialog.Overlay className="ds-modal__overlay" />
        <Dialog.Content ref={ref} className={classes} {...props}>
          {children}
          <Dialog.Close className="ds-modal__close" aria-label="Close">
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

export function ModalHeader({ children, className }: ModalHeaderProps) {
  const classes = ['ds-modal__header', className].filter(Boolean).join(' ');
  return <div className={classes}>{children}</div>;
}

// ─── Body ─────────────────────────────────────────────────

export function ModalBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const classes = ['ds-modal__body', className].filter(Boolean).join(' ');
  return <div className={classes}>{children}</div>;
}

// ─── Footer ───────────────────────────────────────────────

export function ModalFooter({ children, className }: ModalFooterProps) {
  const classes = ['ds-modal__footer', className].filter(Boolean).join(' ');
  return <div className={classes}>{children}</div>;
}
