import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders with text content', () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('renders as a span element', () => {
    render(<Badge>Label</Badge>);
    expect(screen.getByText('Label').tagName).toBe('SPAN');
  });

  it('applies default variant class', () => {
    render(<Badge>Label</Badge>);
    expect(screen.getByText('Label')).toHaveClass('ds-badge--default');
  });

  it('applies variant class', () => {
    render(<Badge variant="success">In stock</Badge>);
    expect(screen.getByText('In stock')).toHaveClass('ds-badge--success');
  });

  it('applies size class', () => {
    render(<Badge size="sm">Small</Badge>);
    expect(screen.getByText('Small')).toHaveClass('ds-badge--sm');
  });

  it('merges custom className', () => {
    render(<Badge className="custom">Label</Badge>);
    expect(screen.getByText('Label')).toHaveClass('custom');
  });

  it('passes through html attributes', () => {
    render(<Badge data-testid="badge-el">Label</Badge>);
    expect(screen.getByTestId('badge-el')).toBeInTheDocument();
  });

  /* ─── Notification count ─────────────────────────────────────── */

  it('renders count as content', () => {
    render(<Badge count={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('applies aria-label for count badge', () => {
    render(<Badge count={3} />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', '3 notifications');
  });

  it('uses singular for count of 1', () => {
    render(<Badge count={1} />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', '1 notification');
  });

  /* ─── Status dot ─────────────────────────────────────────────── */

  it('renders a status dot when dot is true', () => {
    const { container } = render(<Badge variant="success" dot>In stock</Badge>);
    const dot = container.querySelector('.ds-badge__dot');
    expect(dot).toBeInTheDocument();
    expect(dot).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('.ds-badge--dot')).toBeInTheDocument();
  });

  it('does not render a dot by default', () => {
    const { container } = render(<Badge variant="success">In stock</Badge>);
    expect(container.querySelector('.ds-badge__dot')).not.toBeInTheDocument();
  });

  it('keeps the label as accessible content with dot', () => {
    const { container } = render(<Badge variant="warning" dot>Low stock</Badge>);
    expect(container.querySelector('.ds-badge')).toHaveTextContent('Low stock');
  });

  /* ─── Semantic roles (WCAG) ──────────────────────────────────── */

  // A live region per badge made a filtered product grid read every
  // "Sale" / "Out of stock" aloud. Static labels are plain text now.
  it('does not make status-coloured badges live regions by default', () => {
    const { rerender } = render(<Badge variant="success">In stock</Badge>);
    expect(screen.queryByRole('status')).toBeNull();

    rerender(<Badge variant="warning">Low stock</Badge>);
    expect(screen.queryByRole('status')).toBeNull();

    rerender(<Badge variant="destructive">Sale</Badge>);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('becomes a live region when role="status" is passed', () => {
    render(<Badge variant="warning" role="status">2 left</Badge>);
    expect(screen.getByRole('status')).toHaveTextContent('2 left');
  });

  it('is not a live region by default (default variant)', () => {
    render(<Badge variant="default">New</Badge>);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('allows explicit role override', () => {
    render(<Badge variant="success" role="img" aria-label="Status: available">OK</Badge>);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  /* ─── Accessibility ──────────────────────────────────────────── */

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Badge>New</Badge>
        <Badge variant="success">In stock</Badge>
        <Badge variant="destructive">Out of stock</Badge>
        <Badge variant="success" dot>In stock</Badge>
        <Badge count={5} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
