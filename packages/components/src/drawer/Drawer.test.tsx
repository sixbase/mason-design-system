import { render, screen } from '@testing-library/react';
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
    const { container } = render(
      <Drawer {...defaultProps} side="bottom">
        Content
      </Drawer>,
    );
    const results = await axe(container);
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

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Drawer {...defaultProps}>Content</Drawer>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
