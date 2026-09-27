import * as Dialog from '@radix-ui/react-dialog';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import {
  Modal,
  ModalBody,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from './Modal';

expect.extend(toHaveNoViolations);

function TestModal({
  open,
  onOpenChange,
  size,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalTrigger>Open</ModalTrigger>
      <ModalContent size={size}>
        <ModalHeader>
          <ModalTitle>Test Title</ModalTitle>
          <ModalDescription>Test description</ModalDescription>
        </ModalHeader>
        <ModalBody>Modal body content</ModalBody>
        <ModalFooter>
          <ModalClose>Cancel</ModalClose>
          <button>Confirm</button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

describe('Modal', () => {
  it('renders trigger and opens on click', async () => {
    const user = userEvent.setup();
    render(<TestModal />);

    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.queryByText('Test Title')).not.toBeInTheDocument();

    await user.click(screen.getByText('Open'));
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders title, description, body, and footer', async () => {
    render(<TestModal open />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('Modal body content')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });

  it('closes when clicking the close button', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(<TestModal open onOpenChange={onOpenChange} />);

    await user.click(screen.getByLabelText('Close'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('closes when pressing Escape', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(<TestModal open onOpenChange={onOpenChange} />);

    await user.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('closes when clicking the Cancel button (ModalClose)', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(<TestModal open onOpenChange={onOpenChange} />);

    await user.click(screen.getByText('Cancel'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('applies size class', () => {
    render(<TestModal open size="lg" />);
    const content = screen.getByRole('dialog');
    expect(content.className).toContain('ds-modal__content--lg');
  });

  it('applies sm size class', () => {
    render(<TestModal open size="sm" />);
    const content = screen.getByRole('dialog');
    expect(content.className).toContain('ds-modal__content--sm');
  });

  it('defaults to md size', () => {
    render(<TestModal open />);
    const content = screen.getByRole('dialog');
    expect(content.className).toContain('ds-modal__content--md');
  });

  it('has correct ARIA role', () => {
    render(<TestModal open />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('associates title with dialog via aria-labelledby', () => {
    render(<TestModal open />);
    const dialog = screen.getByRole('dialog');
    const titleId = screen.getByText('Test Title').id;
    expect(dialog).toHaveAttribute('aria-labelledby', titleId);
  });

  it('associates description with dialog via aria-describedby', () => {
    render(<TestModal open />);
    const dialog = screen.getByRole('dialog');
    const descId = screen.getByText('Test description').id;
    expect(dialog).toHaveAttribute('aria-describedby', descId);
  });

  // The dialog portals to <body>; scanning `container` checked only the trigger.
  it('has no accessibility violations', async () => {
    const { baseElement } = render(<TestModal open />);
    const results = await axe(baseElement);
    expect(results).toHaveNoViolations();
  });

  it('applies full-screen-mobile class when fullScreenOnMobile is set', () => {
    render(
      <Modal open>
        <ModalContent fullScreenOnMobile>
          <ModalHeader>
            <ModalTitle>Title</ModalTitle>
            <ModalDescription>Description</ModalDescription>
          </ModalHeader>
        </ModalContent>
      </Modal>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog.className).toContain('ds-modal__content--full-screen-mobile');
  });

  it('does not apply full-screen-mobile class by default', () => {
    render(<TestModal open />);
    const dialog = screen.getByRole('dialog');
    expect(dialog.className).not.toContain(
      'ds-modal__content--full-screen-mobile',
    );
  });

  it('forwards custom className to content', () => {
    render(
      <Modal open>
        <ModalContent className="custom-class">
          <ModalHeader>
            <ModalTitle>Title</ModalTitle>
            <ModalDescription>Description</ModalDescription>
          </ModalHeader>
        </ModalContent>
      </Modal>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog.className).toContain('custom-class');
  });

  // ─── Regressions ────────────────────────────────────────

  it('applies the size set on the Modal root', () => {
    // Bug: <Modal size> was accepted and documented but silently dropped
    render(
      <Modal open size="lg">
        <ModalContent aria-describedby={undefined}>
          <ModalTitle>Sized</ModalTitle>
        </ModalContent>
      </Modal>,
    );
    expect(screen.getByRole('dialog')).toHaveClass('ds-modal__content--lg');
  });

  it('lets ModalContent size win over the root size', () => {
    render(
      <Modal open size="lg">
        <ModalContent size="sm" aria-describedby={undefined}>
          <ModalTitle>Sized</ModalTitle>
        </ModalContent>
      </Modal>,
    );
    expect(screen.getByRole('dialog')).toHaveClass('ds-modal__content--sm');
  });

  it('forwards refs and native attributes on header, body and footer', () => {
    const bodyRef = { current: null as HTMLDivElement | null };
    render(
      <Modal open>
        <ModalContent aria-describedby={undefined}>
          <ModalHeader data-testid="header">
            <ModalTitle>Parts</ModalTitle>
          </ModalHeader>
          <ModalBody ref={bodyRef}>Body</ModalBody>
          <ModalFooter id="modal-footer">Footer</ModalFooter>
        </ModalContent>
      </Modal>,
    );
    expect(screen.getByTestId('header')).toHaveClass('ds-modal__header');
    expect(bodyRef.current).toHaveClass('ds-modal__body');
    expect(document.getElementById('modal-footer')).toHaveClass('ds-modal__footer');
  });

  // Bug: a controlled Modal opened from a plain button (no ModalTrigger)
  // dropped keyboard focus to <body> on close.
  it('returns focus to the opener when controlled without a ModalTrigger', async () => {
    function Controlled() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>Open settings</button>
          <Modal open={open} onOpenChange={setOpen}>
            <ModalContent>
              <ModalTitle>Settings</ModalTitle>
              <ModalDescription>Change your settings.</ModalDescription>
            </ModalContent>
          </Modal>
        </>
      );
    }
    const user = userEvent.setup();
    render(<Controlled />);
    const opener = screen.getByRole('button', { name: 'Open settings' });
    await user.click(opener);
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(opener).toHaveFocus();
  });

  // Same Safari fix as Drawer: a tapped button is never focused there, so
  // the opener is the last pressed control. (Nothing else in this file
  // mounts a Drawer, so this fails if Modal stops tracking presses.)
  it('returns focus to a tapped opener that Safari never focused', async () => {
    function Controlled() {
      const [open, setOpen] = useState(false);
      return (
        <main tabIndex={-1}>
          <button type="button" onClick={() => setOpen(true)}>Open settings</button>
          <Modal open={open} onOpenChange={setOpen}>
            <ModalContent>
              <ModalTitle>Settings</ModalTitle>
              <ModalDescription>Change your settings.</ModalDescription>
            </ModalContent>
          </Modal>
        </main>
      );
    }
    render(<Controlled />);
    const opener = screen.getByRole('button', { name: 'Open settings' });
    fireEvent.pointerDown(opener);
    screen.getByRole('main').focus();
    fireEvent.click(opener);
    await screen.findByRole('dialog');
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(opener).toHaveFocus();
  });

  // Round 5: same as Drawer — handing focus back must not move the page.
  it('returns focus without scrolling when the opener is on screen', async () => {
    function Controlled() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>Open settings</button>
          <Modal open={open} onOpenChange={setOpen}>
            <ModalContent>
              <ModalTitle>Settings</ModalTitle>
              <ModalDescription>Change your settings.</ModalDescription>
            </ModalContent>
          </Modal>
        </>
      );
    }
    const user = userEvent.setup();
    render(<Controlled />);
    const opener = screen.getByRole('button', { name: 'Open settings' });
    vi.spyOn(opener, 'getBoundingClientRect').mockReturnValue(
      { x: 10, y: 10, top: 10, left: 10, bottom: 46, right: 46, width: 36, height: 36, toJSON: () => ({}) },
    );
    const focus = vi.spyOn(opener, 'focus');
    await user.click(opener);
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(focus).toHaveBeenLastCalledWith({ preventScroll: true });
  });

  it('still lets a consumer onCloseAutoFocus take over focus', async () => {
    const onCloseAutoFocus = vi.fn((e: Event) => e.preventDefault());
    function Controlled() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>Open settings</button>
          <Modal open={open} onOpenChange={setOpen}>
            <ModalContent onCloseAutoFocus={onCloseAutoFocus}>
              <ModalTitle>Settings</ModalTitle>
              <ModalDescription>Change your settings.</ModalDescription>
            </ModalContent>
          </Modal>
        </>
      );
    }
    const user = userEvent.setup();
    render(<Controlled />);
    const opener = screen.getByRole('button', { name: 'Open settings' });
    await user.click(opener);
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(onCloseAutoFocus).toHaveBeenCalled());
    expect(opener).not.toHaveFocus();
  });

  // ModalTrigger/ModalClose used to BE Dialog.Trigger/Dialog.Close with a
  // displayName assigned — which renamed Radix's shared components, so the
  // Drawer's close button showed up in DevTools as "ModalClose".
  it('names its parts without renaming the shared Radix Dialog parts', () => {
    expect(ModalTrigger.displayName).toBe('ModalTrigger');
    expect(ModalClose.displayName).toBe('ModalClose');
    expect(Dialog.Trigger).not.toBe(ModalTrigger);
    expect(Dialog.Close).not.toBe(ModalClose);
    expect(Dialog.Trigger.displayName).not.toBe('ModalTrigger');
    expect(Dialog.Close.displayName).not.toBe('ModalClose');
  });

  it('ModalTrigger forwards its ref to the trigger button', () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(
      <Modal>
        <ModalTrigger ref={ref}>Open</ModalTrigger>
      </Modal>,
    );
    expect(ref.current).toBe(screen.getByRole('button', { name: 'Open' }));
  });

  // Regression (keyboard audit): a long body of plain text had no focusable
  // content, Radix's trap only cycles tabbables, so keyboard users could not
  // scroll it at all. An overflowing body is a tab stop; a short one is not.
  it('makes the body a tab stop only while it overflows', () => {
    const heights = vi
      .spyOn(HTMLElement.prototype, 'scrollHeight', 'get')
      .mockImplementation(function (this: HTMLElement) {
        return this.classList.contains('ds-modal__body') ? 900 : 0;
      });
    const client = vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(300);
    render(<TestModal open />);
    const body = screen.getByText('Modal body content');
    expect(body).toHaveAttribute('tabindex', '0');
    heights.mockRestore();
    client.mockRestore();
  });

  it('leaves a body that fits out of the tab order', () => {
    render(<TestModal open />);
    expect(screen.getByText('Modal body content')).not.toHaveAttribute('tabindex');
  });
});
