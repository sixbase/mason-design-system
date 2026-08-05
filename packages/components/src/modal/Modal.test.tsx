import { render, screen } from '@testing-library/react';
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

  it('has no accessibility violations', async () => {
    const { container } = render(<TestModal open />);
    const results = await axe(container);
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
});
