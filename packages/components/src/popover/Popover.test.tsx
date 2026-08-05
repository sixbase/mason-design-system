import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import {
  Popover,
  PopoverArrow,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from './Popover';

function TestPopover({
  open,
  onOpenChange,
  showClose,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showClose?: boolean;
}) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger>Open popover</PopoverTrigger>
      <PopoverContent showClose={showClose}>
        <PopoverArrow />
        Popover body content
      </PopoverContent>
    </Popover>
  );
}

describe('Popover', () => {
  it('renders the trigger and hides content initially', () => {
    render(<TestPopover />);
    expect(screen.getByText('Open popover')).toBeInTheDocument();
    expect(screen.queryByText('Popover body content')).not.toBeInTheDocument();
  });

  it('opens on trigger click', async () => {
    const user = userEvent.setup();
    render(<TestPopover />);

    await user.click(screen.getByText('Open popover'));
    expect(await screen.findByText('Popover body content')).toBeInTheDocument();
  });

  it('exposes content as a dialog', async () => {
    render(<TestPopover open />);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('closes when pressing Escape', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(<TestPopover open onOpenChange={onOpenChange} />);

    await user.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('closes via the built-in close button when showClose is set', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(<TestPopover open onOpenChange={onOpenChange} showClose />);

    await user.click(screen.getByLabelText('Close'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('closes via a composed PopoverClose', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Popover open onOpenChange={onOpenChange}>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>
          <PopoverClose>Dismiss</PopoverClose>
        </PopoverContent>
      </Popover>,
    );

    await user.click(screen.getByText('Dismiss'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('applies the ds-popover class to content', async () => {
    render(<TestPopover open />);
    const dialog = await screen.findByRole('dialog');
    expect(dialog.className).toContain('ds-popover');
  });

  it('forwards a custom className to content', async () => {
    render(
      <Popover open>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent className="custom-class">Content</PopoverContent>
      </Popover>,
    );
    const dialog = await screen.findByRole('dialog');
    expect(dialog.className).toContain('custom-class');
  });

  it('respects the side prop', async () => {
    render(
      <Popover open>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent side="top">Content</PopoverContent>
      </Popover>,
    );
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAttribute('data-side', 'top');
  });

  it('moves focus into the popover on open', async () => {
    const user = userEvent.setup();
    render(<TestPopover />);

    await user.click(screen.getByText('Open popover'));
    const dialog = await screen.findByRole('dialog');
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it('has no accessibility violations when open', async () => {
    const { container } = render(<TestPopover open showClose />);
    await screen.findByRole('dialog');
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no accessibility violations when closed', async () => {
    const { container } = render(<TestPopover />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
