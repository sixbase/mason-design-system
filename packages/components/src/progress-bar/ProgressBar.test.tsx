import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  it('renders without crashing', () => {
    render(<ProgressBar value={50} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders a native progress element', () => {
    render(<ProgressBar value={50} />);
    expect(screen.getByRole('progressbar').tagName).toBe('PROGRESS');
  });

  it('applies default size and variant classes', () => {
    const { container } = render(<ProgressBar value={50} />);
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass('ds-progress-bar');
    expect(root).toHaveClass('ds-progress-bar--md');
    expect(root).toHaveClass('ds-progress-bar--default');
  });

  it('applies size class', () => {
    const { container } = render(<ProgressBar value={50} size="sm" />);
    expect(container.firstChild).toHaveClass('ds-progress-bar--sm');
  });

  it('merges custom className', () => {
    const { container } = render(<ProgressBar value={50} className="custom" />);
    expect(container.firstChild).toHaveClass('ds-progress-bar', 'custom');
  });

  /* ─── ARIA attributes ──────────────────────────────────────────── */

  it('sets aria-valuenow to clamped percentage', () => {
    render(<ProgressBar value={75} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75');
  });

  it('sets aria-label from label prop', () => {
    render(<ProgressBar value={50} label="Upload progress" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', 'Upload progress');
  });

  it('sets aria-valuetext from valueText prop', () => {
    render(<ProgressBar value={75} valueText="$12 away from free shipping" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuetext',
      '$12 away from free shipping',
    );
  });

  /* ─── Label & value text ───────────────────────────────────────── */

  it('renders label text when provided', () => {
    render(<ProgressBar value={50} label="Free shipping progress" />);
    expect(screen.getByText('Free shipping progress')).toBeInTheDocument();
  });

  it('renders percentage when showValue is true', () => {
    render(<ProgressBar value={66} showValue />);
    expect(screen.getByText('66%')).toBeInTheDocument();
  });

  it('renders custom valueText instead of percentage', () => {
    render(<ProgressBar value={75} showValue valueText="$12 away" />);
    expect(screen.getByText('$12 away')).toBeInTheDocument();
    expect(screen.queryByText('75%')).not.toBeInTheDocument();
  });

  it('does not render value text when showValue is false and no valueText', () => {
    const { container } = render(<ProgressBar value={50} />);
    expect(container.querySelector('.ds-progress-bar__value-text')).toBeNull();
  });

  /* ─── Edge cases: clamping ─────────────────────────────────────── */

  it('caps value above max at 100%', () => {
    render(<ProgressBar value={150} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  it('caps negative value at 0%', () => {
    render(<ProgressBar value={-10} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('handles custom max value', () => {
    render(<ProgressBar value={25} max={50} showValue />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  /* ─── Success variant ──────────────────────────────────────────── */

  it('applies success class when variant is success and value is 100', () => {
    const { container } = render(<ProgressBar value={100} variant="success" />);
    expect(container.firstChild).toHaveClass('ds-progress-bar--success');
  });

  it('applies default class when variant is success but not complete', () => {
    const { container } = render(<ProgressBar value={50} variant="success" />);
    expect(container.firstChild).toHaveClass('ds-progress-bar--default');
    expect(container.firstChild).not.toHaveClass('ds-progress-bar--success');
  });

  /* ─── Indeterminate ────────────────────────────────────────────── */

  describe('indeterminate', () => {
    it('renders a div-based progressbar with the indeterminate classes', () => {
      const { container } = render(<ProgressBar indeterminate label="Loading" />);
      const bar = screen.getByRole('progressbar');
      expect(bar.tagName).toBe('DIV');
      expect(container.firstChild).toHaveClass('ds-progress-bar--indeterminate');
      expect(
        container.querySelector('.ds-progress-bar__indeterminate-fill'),
      ).toBeInTheDocument();
    });

    it('exposes aria-valuetext="Loading" and no aria-valuenow', () => {
      render(<ProgressBar indeterminate label="Loading" />);
      const bar = screen.getByRole('progressbar');
      expect(bar).toHaveAttribute('aria-valuetext', 'Loading');
      expect(bar).not.toHaveAttribute('aria-valuenow');
    });

    it('falls back to aria-label="Loading" when no label is given', () => {
      render(<ProgressBar indeterminate />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', 'Loading');
    });

    it('ignores showValue when indeterminate', () => {
      const { container } = render(<ProgressBar indeterminate showValue label="Loading" />);
      expect(container.querySelector('.ds-progress-bar__value-text')).toBeNull();
    });

    it('does not resolve the success variant when indeterminate', () => {
      const { container } = render(
        <ProgressBar indeterminate value={100} variant="success" label="Loading" />,
      );
      expect(container.firstChild).toHaveClass('ds-progress-bar--default');
      expect(container.firstChild).not.toHaveClass('ds-progress-bar--success');
    });

    it('has no accessibility violations (indeterminate)', async () => {
      const { container } = render(
        <div>
          <ProgressBar indeterminate label="Loading products" />
          <ProgressBar indeterminate />
        </div>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  /* ─── Accessibility ────────────────────────────────────────────── */

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <ProgressBar value={50} label="Upload progress" />
        <ProgressBar value={100} variant="success" label="Complete" />
        <ProgressBar value={75} valueText="$12 away from free shipping" label="Shipping" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
