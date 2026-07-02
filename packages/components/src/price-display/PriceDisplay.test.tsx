import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import { PriceDisplay } from './PriceDisplay';

describe('PriceDisplay', () => {
  it('renders the price', () => {
    render(<PriceDisplay price="$48.00" />);
    expect(screen.getByText('$48.00')).toBeInTheDocument();
  });

  it('renders the compare price when provided', () => {
    render(<PriceDisplay price="$38.00" comparePrice="$48.00" />);
    expect(screen.getByText('$38.00')).toBeInTheDocument();
    expect(screen.getByText('$48.00')).toBeInTheDocument();
  });

  it('does not render a compare element by default', () => {
    const { container } = render(<PriceDisplay price="$48.00" />);
    expect(container.querySelector('.ds-price-display__compare')).not.toBeInTheDocument();
  });

  it('labels the compare price for screen readers', () => {
    const { container } = render(<PriceDisplay price="$38.00" comparePrice="$48.00" />);
    const srOnly = container.querySelector('.ds-price-display__compare .ds-sr-only');
    expect(srOnly).toHaveTextContent('Original price:');
  });

  it('applies default size class', () => {
    const { container } = render(<PriceDisplay price="$48.00" />);
    expect(container.querySelector('.ds-price-display--md')).toBeInTheDocument();
  });

  it('applies size class', () => {
    const { container } = render(<PriceDisplay price="$48.00" size="lg" />);
    expect(container.querySelector('.ds-price-display--lg')).toBeInTheDocument();
  });

  it('merges custom className', () => {
    render(<PriceDisplay price="$48.00" className="custom" data-testid="price" />);
    expect(screen.getByTestId('price')).toHaveClass('custom', 'ds-price-display');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<PriceDisplay ref={ref} price="$48.00" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <PriceDisplay price="$48.00" />
        <PriceDisplay price="$38.00" comparePrice="$48.00" size="lg" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
