import * as RadixPopover from '@radix-ui/react-popover';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resetDevWarnings } from '../internal/dev-warning';
import {
  Popover,
  PopoverAnchor,
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

  it('draws the arrow with a border-colored edge that has no base line', async () => {
    render(<TestPopover open />);
    await screen.findByRole('dialog');
    const arrow = document.querySelector('.ds-popover__arrow');
    expect(arrow?.tagName.toLowerCase()).toBe('svg');
    expect(arrow?.getAttribute('viewBox')).toBe('0 0 10 5');
    // Open path (two slanted sides only) so no line crosses the join
    expect(arrow?.querySelector('.ds-popover__arrow-edge')?.getAttribute('d')).toBe('M0 0L5 5L10 0');
    expect(arrow?.querySelector('.ds-popover__arrow-fill')).not.toBeNull();
  });

  it('exposes content as a dialog', async () => {
    render(<TestPopover open />);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  // Radix leaves the dialog unnamed: screen readers said only "dialog".
  it('names the dialog after its trigger by default', async () => {
    const user = userEvent.setup();
    render(<TestPopover />);
    await user.click(screen.getByRole('button', { name: 'Open popover' }));
    expect(await screen.findByRole('dialog', { name: 'Open popover' })).toBeInTheDocument();
  });

  it('names the dialog after an asChild trigger that brings its own id', async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverTrigger asChild>
          <button type="button" id="size-guide-trigger">Size guide</button>
        </PopoverTrigger>
        <PopoverContent>Measurements are in inches.</PopoverContent>
      </Popover>,
    );
    await user.click(screen.getByRole('button', { name: 'Size guide' }));
    expect(await screen.findByRole('dialog', { name: 'Size guide' })).toBeInTheDocument();
  });

  it('prefers an explicit aria-label or aria-labelledby on the content', async () => {
    const user = userEvent.setup();
    const { unmount } = render(
      <Popover>
        <PopoverTrigger>Info</PopoverTrigger>
        <PopoverContent aria-label="Shipping details">Ships in 2 days.</PopoverContent>
      </Popover>,
    );
    await user.click(screen.getByRole('button', { name: 'Info' }));
    expect(await screen.findByRole('dialog', { name: 'Shipping details' })).toBeInTheDocument();
    unmount();

    render(
      <Popover>
        <PopoverTrigger>Info</PopoverTrigger>
        <PopoverContent aria-labelledby="returns-title">
          <span id="returns-title">Returns</span> Free within 30 days.
        </PopoverContent>
      </Popover>,
    );
    await user.click(screen.getByRole('button', { name: 'Info' }));
    expect(await screen.findByRole('dialog', { name: 'Returns' })).toBeInTheDocument();
  });

  describe('unnamed-panel dev warning', () => {
    beforeEach(() => resetDevWarnings());

    it('warns in development when the panel has no name', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      render(
        <Popover open>
          <PopoverAnchor>Anchor</PopoverAnchor>
          <PopoverContent>Unnamed panel</PopoverContent>
        </Popover>,
      );
      await screen.findByRole('dialog');
      await waitFor(() =>
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('PopoverContent has no accessible name')),
      );
      warn.mockRestore();
    });

    it('does not warn for a popover opened from its trigger', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const user = userEvent.setup();
      render(<TestPopover />);
      await user.click(screen.getByRole('button', { name: 'Open popover' }));
      await screen.findByRole('dialog', { name: 'Open popover' });
      expect(warn).not.toHaveBeenCalled();
      warn.mockRestore();
    });

    // The panel renders one commit before the trigger reports its id, so an
    // open-on-load popover warned although it ends up named by its trigger.
    it('does not warn for a popover that starts open with a trigger', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      render(
        <Popover defaultOpen>
          <PopoverTrigger>Size guide</PopoverTrigger>
          <PopoverContent>Chart</PopoverContent>
        </Popover>,
      );
      expect(await screen.findByRole('dialog', { name: 'Size guide' })).toBeInTheDocument();
      await new Promise((r) => setTimeout(r, 20));
      expect(warn).not.toHaveBeenCalled();
      warn.mockRestore();
    });

    it('does not warn when the panel is labelled', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      render(
        <Popover open>
          <PopoverAnchor>Anchor</PopoverAnchor>
          <PopoverContent aria-label="Store hours">Open 9–5.</PopoverContent>
        </Popover>,
      );
      expect(await screen.findByRole('dialog', { name: 'Store hours' })).toBeInTheDocument();
      expect(warn).not.toHaveBeenCalled();
      warn.mockRestore();
    });
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

  // The panel portals to <body>; scanning `container` checked only the trigger.
  it('has no accessibility violations when open', async () => {
    const { baseElement } = render(<TestPopover open showClose />);
    await screen.findByRole('dialog');
    expect(await axe(baseElement)).toHaveNoViolations();
  });

  it('has no accessibility violations when closed', async () => {
    const { container } = render(<TestPopover />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('names its parts without renaming the shared Radix Popover parts', () => {
    expect(PopoverTrigger.displayName).toBe('PopoverTrigger');
    expect(PopoverAnchor.displayName).toBe('PopoverAnchor');
    expect(PopoverClose.displayName).toBe('PopoverClose');
    // Wrappers, not the Radix objects themselves — assigning displayName
    // to a Radix export mutates it for every consumer.
    expect(RadixPopover.Trigger).not.toBe(PopoverTrigger);
    expect(RadixPopover.Close).not.toBe(PopoverClose);
    expect(RadixPopover.Anchor).not.toBe(PopoverAnchor);
  });
});
