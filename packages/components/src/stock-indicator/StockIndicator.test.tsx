import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import { StockIndicator } from './StockIndicator';

describe('StockIndicator', () => {
  it('renders the default in-stock label', () => {
    render(<StockIndicator />);
    expect(screen.getByText('In stock and ready to ship')).toBeInTheDocument();
  });

  it('renders the default label for each status', () => {
    const { rerender } = render(<StockIndicator status="low-stock" />);
    expect(screen.getByText('Low stock — order soon')).toBeInTheDocument();

    rerender(<StockIndicator status="out-of-stock" />);
    expect(screen.getByText('Out of stock')).toBeInTheDocument();
  });

  it('renders a custom label', () => {
    render(<StockIndicator status="low-stock" label="Only 2 left" />);
    expect(screen.getByText('Only 2 left')).toBeInTheDocument();
    expect(screen.queryByText('Low stock — order soon')).not.toBeInTheDocument();
  });

  it('applies the status class', () => {
    const { container } = render(<StockIndicator status="out-of-stock" />);
    expect(container.querySelector('.ds-stock-indicator--out-of-stock')).toBeInTheDocument();
  });

  it('pulses the dot for in-stock and low-stock', () => {
    const { container, rerender } = render(<StockIndicator status="in-stock" />);
    expect(container.querySelector('.ds-stock-indicator__dot--pulse')).toBeInTheDocument();

    rerender(<StockIndicator status="low-stock" />);
    expect(container.querySelector('.ds-stock-indicator__dot--pulse')).toBeInTheDocument();
  });

  it('does not pulse the dot when out of stock', () => {
    const { container } = render(<StockIndicator status="out-of-stock" />);
    expect(container.querySelector('.ds-stock-indicator__dot')).toBeInTheDocument();
    expect(container.querySelector('.ds-stock-indicator__dot--pulse')).not.toBeInTheDocument();
  });

  it('merges custom className', () => {
    const { container } = render(<StockIndicator className="custom" />);
    expect(container.querySelector('.ds-stock-indicator')).toHaveClass('custom');
  });

  it('passes through html attributes', () => {
    render(<StockIndicator data-testid="stock" />);
    expect(screen.getByTestId('stock')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <StockIndicator status="in-stock" />
        <StockIndicator status="low-stock" />
        <StockIndicator status="out-of-stock" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
