import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import { Drawer } from './Drawer';

expect.extend(toHaveNoViolations);

const defaultProps = {
  open: true,
  onOpenChange: vi.fn(),
  title: 'Test drawer',
};

describe('Drawer', () => {
  // ── Rendering ──────────────────────────────────────────

  it('renders as a dialog when open', () => {
    render(<Drawer {...defaultProps}>Content</Drawer>);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <Drawer {...defaultProps} open={false}>
        Content
      </Drawer>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('has accessible title via aria-label', () => {
    render(<Drawer {...defaultProps}>Content</Drawer>);
    expect(screen.getByRole('dialog')).toHaveAttribute(
      'aria-label',
      'Test drawer',
    );
  });

  // ── Side variants ──────────────────────────────────────

  it('defaults to right side', () => {
    render(<Drawer {...defaultProps}>Content</Drawer>);
    const panel = screen.getByRole('dialog');
    expect(panel.className).toContain('ds-drawer__panel--right');
  });

  it('applies left side class', () => {
    render(
      <Drawer {...defaultProps} side="left">
        Content
      </Drawer>,
    );
    const panel = screen.getByRole('dialog');
    expect(panel.className).toContain('ds-drawer__panel--left');
  });

  // ── Bottom sheet ───────────────────────────────────────

  it('applies bottom side class', () => {
    render(
      <Drawer {...defaultProps} side="bottom">
        Content
      </Drawer>,
    );
    const panel = screen.getByRole('dialog');
    expect(panel.className).toContain('ds-drawer__panel--bottom');
  });

  it('renders a drag handle for bottom sheets, hidden from assistive tech', () => {
    render(
      <Drawer {...defaultProps} side="bottom">
        Content
      </Drawer>,
    );
    const handle = screen
      .getByRole('dialog')
      .querySelector('.ds-drawer__handle');
    expect(handle).toBeInTheDocument();
    expect(handle).toHaveAttribute('aria-hidden', 'true');
  });

  it('does not render a drag handle for side drawers', () => {
    render(<Drawer {...defaultProps}>Content</Drawer>);
    expect(
      screen.getByRole('dialog').querySelector('.ds-drawer__handle'),
    ).not.toBeInTheDocument();
  });

  it('ignores size and width for bottom sheets', () => {
    render(
      <Drawer {...defaultProps} side="bottom" size="lg" width="400px">
        Content
      </Drawer>,
    );
    const panel = screen.getByRole('dialog');
    expect(panel.className).not.toContain('ds-drawer__panel--size-lg');
    expect(panel.style.getPropertyValue('--drawer-width')).toBe('');
  });

  it('has no accessibility violations as a bottom sheet', async () => {
    const { baseElement } = render(
      <Drawer {...defaultProps} side="bottom">
        Content
      </Drawer>,
    );
    const results = await axe(baseElement);
    expect(results).toHaveNoViolations();
  });

  // ── Size presets ───────────────────────────────────────

  it.each(['sm', 'md', 'lg'] as const)(
    'applies %s size class for side drawers',
    (size) => {
      render(
        <Drawer {...defaultProps} size={size}>
          Content
        </Drawer>,
      );
      const panel = screen.getByRole('dialog');
      expect(panel.className).toContain(`ds-drawer__panel--size-${size}`);
    },
  );

  it('does not apply a size class when size is omitted', () => {
    render(<Drawer {...defaultProps}>Content</Drawer>);
    const panel = screen.getByRole('dialog');
    expect(panel.className).not.toContain('ds-drawer__panel--size');
  });

  // ── Custom width ───────────────────────────────────────

  it('applies custom width via CSS variable', () => {
    render(
      <Drawer {...defaultProps} width="400px">
        Content
      </Drawer>,
    );
    const panel = screen.getByRole('dialog');
    expect(panel.style.getPropertyValue('--drawer-width')).toBe('400px');
  });

  it('does not set --drawer-width when width is not provided', () => {
    render(<Drawer {...defaultProps}>Content</Drawer>);
    const panel = screen.getByRole('dialog');
    expect(panel.style.getPropertyValue('--drawer-width')).toBe('');
  });

  // ── Description ────────────────────────────────────────

  it('sets aria-describedby when a description is provided', () => {
    render(
      <Drawer {...defaultProps} description="Review items and check out">
        Content
      </Drawer>,
    );
    const dialog = screen.getByRole('dialog');
    const descId = dialog.getAttribute('aria-describedby');
    expect(descId).toBeTruthy();
    expect(document.getElementById(descId!)).toHaveTextContent(
      'Review items and check out',
    );
  });

  it('omits aria-describedby when no description is provided', () => {
    render(<Drawer {...defaultProps}>Content</Drawer>);
    expect(screen.getByRole('dialog')).not.toHaveAttribute(
      'aria-describedby',
    );
  });

  // Drawer no longer strips aria-describedby itself — it relies on Radix
  // wiring it only while a Description is mounted. Guard that reliance,
  // including a description that comes and goes while the drawer is open.
  it('follows the description as it appears and disappears', () => {
    const { rerender } = render(<Drawer {...defaultProps}>Content</Drawer>);
    const dialog = screen.getByRole('dialog');
    expect(dialog).not.toHaveAttribute('aria-describedby');

    rerender(<Drawer {...defaultProps} description="2 items">Content</Drawer>);
    const descId = dialog.getAttribute('aria-describedby');
    expect(descId).toBeTruthy();
    expect(document.getElementById(descId!)).toHaveTextContent('2 items');

    rerender(<Drawer {...defaultProps}>Content</Drawer>);
    expect(dialog).not.toHaveAttribute('aria-describedby');
  });

  it('does not duplicate the title as a description', () => {
    render(<Drawer {...defaultProps}>Content</Drawer>);
    expect(screen.getAllByText('Test drawer')).toHaveLength(1);
  });

  // ── Close behavior ─────────────────────────────────────

  it('calls onOpenChange(false) when close button is clicked', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Drawer {...defaultProps} onOpenChange={onOpenChange}>
        Content
      </Drawer>,
    );

    await user.click(screen.getByLabelText('Close'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls onOpenChange(false) on Escape key', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Drawer {...defaultProps} onOpenChange={onOpenChange}>
        Content
      </Drawer>,
    );

    await user.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  // ── Custom className ───────────────────────────────────

  it('forwards custom className', () => {
    render(
      <Drawer {...defaultProps} className="custom-drawer">
        Content
      </Drawer>,
    );
    const panel = screen.getByRole('dialog');
    expect(panel.className).toContain('custom-drawer');
  });

  // ── Accessibility ──────────────────────────────────────

  // The panel portals to <body>, so `container` is empty: scan baseElement.
  it('has no accessibility violations', async () => {
    const { baseElement } = render(
      <Drawer {...defaultProps}>Content</Drawer>,
    );
    const results = await axe(baseElement);
    expect(results).toHaveNoViolations();
  });

  // ── Focus return ───────────────────────────────────────

  // Bug: Drawer has no Dialog.Trigger, so Radix returned focus to a null
  // trigger ref and keyboard focus fell to <body> on close.
  function OpenerHarness() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button type="button" onClick={() => setOpen(true)}>Open menu</button>
        <Drawer open={open} onOpenChange={setOpen} title="Menu">
          <button type="button">Inside</button>
        </Drawer>
      </>
    );
  }

  it('returns focus to the element that opened it when closed with Escape', async () => {
    const user = userEvent.setup();
    render(<OpenerHarness />);
    const opener = screen.getByRole('button', { name: 'Open menu' });
    await user.click(opener);
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(opener).toHaveFocus();
  });

  it('returns focus to the opener when closed with the close button', async () => {
    const user = userEvent.setup();
    render(<OpenerHarness />);
    const opener = screen.getByRole('button', { name: 'Open menu' });
    await user.click(opener);
    await user.click(await screen.findByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(opener).toHaveFocus();
  });

  // Safari (macOS + iOS) never focuses a clicked/tapped button, so at open
  // time activeElement was <body> — or <main tabindex="-1">, which Safari
  // focuses instead — and closing dropped focus to the top of the page.
  it('returns focus to a tapped opener that Safari never focused', async () => {
    render(
      <main tabIndex={-1}>
        <OpenerHarness />
      </main>,
    );
    const opener = screen.getByRole('button', { name: 'Open menu' });
    const main = screen.getByRole('main');
    // What Safari does on a tap: pointerdown, focus goes to the focusable
    // ancestor (not the button), then click.
    fireEvent.pointerDown(opener);
    main.focus();
    fireEvent.click(opener);
    await screen.findByRole('dialog');
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(opener).toHaveFocus();
  });

  // Round 5 (shopper journeys): closing the mobile menu threw the page up
  // half a screen. The opener got a plain focus(), and the sticky header's
  // scroll-padding made the browser "reveal" a button that was on screen.
  it('returns focus without scrolling when the opener is on screen', async () => {
    const user = userEvent.setup();
    render(<OpenerHarness />);
    const opener = screen.getByRole('button', { name: 'Open menu' });
    vi.spyOn(opener, 'getBoundingClientRect').mockReturnValue(
      { x: 10, y: 10, top: 10, left: 10, bottom: 46, right: 46, width: 36, height: 36, toJSON: () => ({}) },
    );
    const focus = vi.spyOn(opener, 'focus');
    await user.click(opener);
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(focus).toHaveBeenLastCalledWith({ preventScroll: true });
    expect(opener).toHaveFocus();
  });

  it('still scrolls to an opener that is off screen', async () => {
    const user = userEvent.setup();
    render(<OpenerHarness />);
    const opener = screen.getByRole('button', { name: 'Open menu' });
    vi.spyOn(opener, 'getBoundingClientRect').mockReturnValue(
      { x: 10, y: -400, top: -400, left: 10, bottom: -364, right: 46, width: 36, height: 36, toJSON: () => ({}) },
    );
    const focus = vi.spyOn(opener, 'focus');
    await user.click(opener);
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(focus).toHaveBeenLastCalledWith({ preventScroll: false });
  });

  // Regression (keyboard audit): a long body with no focusable content could
  // not be scrolled from the keyboard — the focus trap only cycles tabbables
  // (the close button). An overflowing body is a tab stop; a short one isn't.
  it('makes the body a tab stop only while it overflows', () => {
    const heights = vi
      .spyOn(HTMLElement.prototype, 'scrollHeight', 'get')
      .mockImplementation(function (this: HTMLElement) {
        return this.classList.contains('ds-drawer__body') ? 900 : 0;
      });
    const client = vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(300);
    const { unmount } = render(<Drawer {...defaultProps}>Long content</Drawer>);
    expect(screen.getByText('Long content')).toHaveAttribute('tabindex', '0');
    unmount();
    heights.mockRestore();
    client.mockRestore();

    render(<Drawer {...defaultProps}>Short content</Drawer>);
    expect(screen.getByText('Short content')).not.toHaveAttribute('tabindex');
  });
});
