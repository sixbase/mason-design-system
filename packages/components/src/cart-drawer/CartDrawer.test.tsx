import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import { CartDrawer } from './CartDrawer';
import type { CartDrawerItemData } from './CartDrawer';

expect.extend(toHaveNoViolations);

const sampleItems: CartDrawerItemData[] = [
  {
    id: 'item-1',
    name: 'Canvas Tote',
    price: 4800,
    quantity: 1,
    image: 'https://example.com/tote.jpg',
  },
  {
    id: 'item-2',
    name: 'Linen Shirt',
    price: 8900,
    quantity: 2,
    options: [{ name: 'Size', value: 'M' }],
  },
];

const defaultProps = {
  open: true,
  onOpenChange: vi.fn(),
  items: sampleItems,
  subtotal: 22600,
  onUpdateQuantity: vi.fn(),
  onRemoveItem: vi.fn(),
};

describe('CartDrawer', () => {
  // ── Rendering ──────────────────────────────────────────

  it('renders as a dialog when open', () => {
    render(<CartDrawer {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<CartDrawer {...defaultProps} open={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('has accessible label for shopping cart', () => {
    render(<CartDrawer {...defaultProps} />);
    expect(screen.getByRole('dialog')).toHaveAttribute(
      'aria-label',
      'Shopping cart',
    );
  });

  // ── Content ────────────────────────────────────────────

  it('displays item count in heading', () => {
    render(<CartDrawer {...defaultProps} />);
    // 1 + 2 = 3 total items
    expect(screen.getByText('Your Bag (3)')).toBeInTheDocument();
  });

  it('renders all cart line items', () => {
    render(<CartDrawer {...defaultProps} />);
    expect(screen.getByText('Canvas Tote')).toBeInTheDocument();
    expect(screen.getByText('Linen Shirt')).toBeInTheDocument();
  });

  it('shows item options when provided', () => {
    render(<CartDrawer {...defaultProps} />);
    expect(screen.getByText('Size: M')).toBeInTheDocument();
  });

  it('displays formatted subtotal', () => {
    render(<CartDrawer {...defaultProps} />);
    expect(screen.getByText('$226.00')).toBeInTheDocument();
  });

  it('renders checkout link with correct href', () => {
    render(<CartDrawer {...defaultProps} />);
    const checkoutLink = screen.getByRole('link', { name: 'Checkout' });
    expect(checkoutLink).toHaveAttribute('href', '/checkout');
  });

  it('renders checkout and continue-shopping as large (55px) controls', () => {
    render(<CartDrawer {...defaultProps} />);
    expect(
      screen.getByRole('link', { name: 'Checkout' }).className,
    ).toContain('ds-button--lg');
    expect(
      screen.getByRole('button', { name: 'Continue Shopping' }).className,
    ).toContain('ds-button--lg');
  });

  it('uses custom checkout URL', () => {
    render(<CartDrawer {...defaultProps} checkoutUrl="/custom-checkout" />);
    const checkoutLink = screen.getByRole('link', { name: 'Checkout' });
    expect(checkoutLink).toHaveAttribute('href', '/custom-checkout');
  });

  // ── Empty state ────────────────────────────────────────

  it('shows empty state when no items', () => {
    render(<CartDrawer {...defaultProps} items={[]} subtotal={0} />);
    expect(screen.getByText('Your bag is empty')).toBeInTheDocument();
  });

  it('shows custom empty message', () => {
    render(
      <CartDrawer
        {...defaultProps}
        items={[]}
        subtotal={0}
        emptyMessage="Nothing here yet"
      />,
    );
    expect(screen.getByText('Nothing here yet')).toBeInTheDocument();
  });

  it('hides subtotal and checkout in empty state', () => {
    render(<CartDrawer {...defaultProps} items={[]} subtotal={0} />);
    expect(screen.queryByText('Subtotal')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Checkout' })).not.toBeInTheDocument();
  });

  // ── Interactions ───────────────────────────────────────

  it('calls onRemoveItem when remove button is clicked', async () => {
    const onRemoveItem = vi.fn();
    const user = userEvent.setup();
    render(<CartDrawer {...defaultProps} onRemoveItem={onRemoveItem} />);

    await user.click(screen.getByLabelText('Remove Canvas Tote from cart'));
    expect(onRemoveItem).toHaveBeenCalledWith('item-1');
  });

  it('calls onOpenChange(false) when Continue Shopping is clicked', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(<CartDrawer {...defaultProps} onOpenChange={onOpenChange} />);

    await user.click(screen.getByText('Continue Shopping'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  // ── Live region ────────────────────────────────────────

  it('announces item count via aria-live', () => {
    render(<CartDrawer {...defaultProps} />);
    expect(screen.getByText('3 items in your cart')).toBeInTheDocument();
  });

  it('announces empty cart via aria-live', () => {
    render(<CartDrawer {...defaultProps} items={[]} subtotal={0} />);
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });

  // ── Children (footer slot) ────────────────────────────

  it('renders children in footer area', () => {
    render(
      <CartDrawer {...defaultProps}>
        <span>Free shipping on orders over $50</span>
      </CartDrawer>,
    );
    expect(screen.getByText('Free shipping on orders over $50')).toBeInTheDocument();
  });

  // ── Accessibility ──────────────────────────────────────

  it('has no accessibility violations', async () => {
    const { container } = render(<CartDrawer {...defaultProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations in empty state', async () => {
    const { container } = render(
      <CartDrawer {...defaultProps} items={[]} subtotal={0} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
