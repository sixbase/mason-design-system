import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import { CartLineItem } from './CartLineItem';

const defaultProps = {
  id: 'item-1',
  name: 'Canvas Tote Bag',
  price: 4800,
  quantity: 2,
  onQuantityChange: vi.fn(),
  onRemove: vi.fn(),
};

describe('CartLineItem', () => {
  it('renders without crashing', () => {
    render(<CartLineItem {...defaultProps} />);
    expect(screen.getByRole('group', { name: 'Canvas Tote Bag' })).toBeInTheDocument();
  });

  it('renders correct HTML element (div with role="group")', () => {
    render(<CartLineItem {...defaultProps} />);
    const el = screen.getByRole('group', { name: 'Canvas Tote Bag' });
    expect(el.tagName).toBe('DIV');
    expect(el).toHaveClass('ds-cart-line-item');
  });

  it('displays product name', () => {
    render(<CartLineItem {...defaultProps} />);
    expect(screen.getByText('Canvas Tote Bag')).toBeInTheDocument();
  });

  it('displays formatted line total (price x quantity)', () => {
    render(<CartLineItem {...defaultProps} price={4800} quantity={2} />);
    expect(screen.getByText('$96.00')).toBeInTheDocument();
  });

  it('caps the quantity stepper at maxQuantity (default 99)', () => {
    const { rerender } = render(<CartLineItem {...defaultProps} />);
    expect(screen.getByRole('spinbutton')).toHaveAttribute('aria-valuemax', '99');
    rerender(<CartLineItem {...defaultProps} quantity={3} maxQuantity={3} />);
    expect(screen.getByRole('spinbutton')).toHaveAttribute('aria-valuemax', '3');
    expect(screen.getByRole('button', { name: 'Increase quantity' })).toBeDisabled();
  });

  it('displays options when provided', () => {
    render(
      <CartLineItem
        {...defaultProps}
        options={[
          { name: 'Size', value: 'XL' },
          { name: 'Color', value: 'Stone' },
        ]}
      />,
    );
    expect(screen.getByText('Size: XL')).toBeInTheDocument();
    expect(screen.getByText('Color: Stone')).toBeInTheDocument();
  });

  it('shows sale badge when compareAtPrice is provided', () => {
    render(<CartLineItem {...defaultProps} compareAtPrice={6500} />);
    expect(screen.getByText('Sale')).toBeInTheDocument();
  });

  it('is not a sale when the compare-at price equals the price', () => {
    render(<CartLineItem {...defaultProps} compareAtPrice={4800} />);
    expect(screen.queryByText('Sale')).not.toBeInTheDocument();
    expect(screen.queryByText(/Original price/)).not.toBeInTheDocument();
  });

  // Removal is its own button: the stepper never offers quantity 0.
  it('stops the quantity stepper at 1', () => {
    render(<CartLineItem {...defaultProps} quantity={1} />);
    expect(screen.getByRole('spinbutton')).toHaveAttribute('aria-valuemin', '1');
    expect(screen.getByRole('button', { name: 'Decrease quantity' })).toBeDisabled();
  });

  // Read aloud it was "Sale, $48.00, Original price: $65.00"; the price now
  // names itself, so the pill is visual only and the sale is said once.
  it('says "Sale" once: in the price, not the pill', () => {
    const { container } = render(<CartLineItem {...defaultProps} compareAtPrice={6500} />);
    expect(screen.getByText('Sale')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('.ds-price-display')).toHaveTextContent(/^Sale price:/);
  });

  it('renders product link when href is provided', () => {
    render(<CartLineItem {...defaultProps} href="/products/tote" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/products/tote');
  });

  it('renders placeholder when no image is provided', () => {
    const { container } = render(<CartLineItem {...defaultProps} />);
    expect(container.querySelector('.ds-cart-line-item__placeholder')).toBeInTheDocument();
  });

  it('renders image when provided', () => {
    render(<CartLineItem {...defaultProps} image="/tote.jpg" imageAlt="A canvas tote" />);
    const img = screen.getByAltText('A canvas tote');
    expect(img).toHaveAttribute('src', '/tote.jpg');
  });

  it('calls onQuantityChange when quantity is adjusted', async () => {
    const onQuantityChange = vi.fn();
    render(<CartLineItem {...defaultProps} onQuantityChange={onQuantityChange} />);
    await userEvent.click(screen.getByLabelText('Increase quantity'));
    expect(onQuantityChange).toHaveBeenCalledWith(3);
  });

  it('calls onRemove when remove button is clicked', async () => {
    const onRemove = vi.fn();
    render(<CartLineItem {...defaultProps} onRemove={onRemove} />);
    await userEvent.click(screen.getByLabelText('Remove Canvas Tote Bag from cart'));
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it('uses product name as default image alt', () => {
    render(<CartLineItem {...defaultProps} image="/tote.jpg" />);
    expect(screen.getByAltText('Canvas Tote Bag')).toBeInTheDocument();
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(<CartLineItem {...defaultProps} ref={ref} />);
    expect(ref).toHaveBeenCalled();
    expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<CartLineItem {...defaultProps} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  // Regression: desktop hid the unit price unconditionally, so a sale line
  // showed a "Sale" pill with no strikethrough price anywhere on the row.
  describe('unit price on desktop', () => {
    it('flags the unit price as informative for a sale line', () => {
      const { container } = render(<CartLineItem {...defaultProps} quantity={1} compareAtPrice={6500} />);
      expect(container.querySelector('.ds-cart-line-item__unit-price')).toHaveClass(
        'ds-cart-line-item__unit-price--informative',
      );
    });

    it('flags the unit price as informative when quantity > 1', () => {
      const { container } = render(<CartLineItem {...defaultProps} quantity={2} />);
      expect(container.querySelector('.ds-cart-line-item__unit-price')).toHaveClass(
        'ds-cart-line-item__unit-price--informative',
      );
    });

    it('does not flag a full-price single unit (it would repeat the total)', () => {
      const { container } = render(<CartLineItem {...defaultProps} quantity={1} />);
      expect(container.querySelector('.ds-cart-line-item__unit-price')).not.toHaveClass(
        'ds-cart-line-item__unit-price--informative',
      );
    });
  });

  describe('price formatting regressions', () => {
    it('groups thousands in large line totals', () => {
      render(<CartLineItem {...defaultProps} price={240000} quantity={2} />);
      expect(screen.getByText('$4,800.00')).toBeInTheDocument();
    });

    it('puts the minus sign before the currency symbol', () => {
      render(<CartLineItem {...defaultProps} price={-500} quantity={1} />);
      expect(screen.getAllByText('-$5.00').length).toBeGreaterThan(0);
      expect(screen.queryByText('$-5.00')).not.toBeInTheDocument();
    });

    it('formats every price in the given currency', () => {
      render(
        <CartLineItem {...defaultProps} currency="EUR" price={3800} compareAtPrice={4800} quantity={2} />,
      );
      expect(screen.getByText('€38.00')).toBeInTheDocument();
      expect(screen.getByText('€48.00')).toBeInTheDocument();
      expect(screen.getByText('€76.00')).toBeInTheDocument();
    });

    it('reuses one formatter per currency across lines and renders (performance)', () => {
      render(<CartLineItem {...defaultProps} currency="GBP" price={3800} compareAtPrice={4800} />);
      const NumberFormat = vi.spyOn(Intl, 'NumberFormat');
      const { rerender } = render(
        <CartLineItem {...defaultProps} currency="GBP" price={3800} compareAtPrice={4800} quantity={2} />,
      );
      rerender(<CartLineItem {...defaultProps} currency="GBP" price={3800} compareAtPrice={4800} quantity={3} />);
      // Was a new Intl.NumberFormat for each of the 3 prices on every render —
      // 2/3 of the line's render time when a cart drawer opened.
      expect(NumberFormat).not.toHaveBeenCalled();
      expect(screen.getByText('£114.00')).toBeInTheDocument();
      NumberFormat.mockRestore();
    });
  });
});
