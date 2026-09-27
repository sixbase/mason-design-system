import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
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
  it('formats line items in the drawer currency, not USD', () => {
    render(<CartDrawer {...defaultProps} currency="EUR" />);
    const dialog = screen.getByRole('dialog');
    expect(dialog.textContent).toContain('€');
    expect(dialog.textContent).not.toContain('$');
  });

  it('formats the subtotal and every line in the drawer locale', () => {
    render(<CartDrawer {...defaultProps} currency="EUR" locale="de-DE" />);
    const de = (amount: number) =>
      new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
    const dialog = screen.getByRole('dialog');
    expect(dialog.textContent).toContain(de(226)); // subtotal
    expect(dialog.textContent).toContain(de(48)); // Canvas Tote line
    expect(dialog.textContent).toContain(de(178)); // Linen Shirt × 2 line total
    expect(dialog.textContent).not.toContain('€48.00'); // no en-US leftovers
  });

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

  // The region used to open already filled ("3 items in your cart"), which
  // screen readers read in browse mode as a hidden repeat of "Your Bag (3)".
  // It now starts empty and speaks only when the count changes.
  const liveRegion = () => document.querySelector('.ds-cart-drawer [aria-live="polite"]');

  it('opens with an empty live region', () => {
    render(<CartDrawer {...defaultProps} />);
    expect(liveRegion()).toBeInTheDocument();
    expect(liveRegion()).toBeEmptyDOMElement();
  });

  it('announces item count via aria-live when it changes', () => {
    const { rerender } = render(<CartDrawer {...defaultProps} />);
    rerender(
      <CartDrawer
        {...defaultProps}
        items={[{ ...sampleItems[0], quantity: 2 }, sampleItems[1]]}
        subtotal={27400}
      />,
    );
    expect(liveRegion()).toHaveTextContent('4 items in your cart');
  });

  it('says "item", not "items", for a single item', () => {
    const { rerender } = render(<CartDrawer {...defaultProps} />);
    rerender(<CartDrawer {...defaultProps} items={[sampleItems[0]!]} subtotal={4800} />);
    expect(liveRegion()).toHaveTextContent('1 item in your cart');
  });

  it('announces empty cart via aria-live when the last item goes', () => {
    const { rerender } = render(<CartDrawer {...defaultProps} />);
    rerender(<CartDrawer {...defaultProps} items={[]} subtotal={0} />);
    expect(liveRegion()).toHaveTextContent('Your cart is empty');
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

  // The drawer portals to <body>, so `container` is empty: scan baseElement.
  it('has no accessibility violations', async () => {
    const { baseElement } = render(<CartDrawer {...defaultProps} />);
    const results = await axe(baseElement);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations in empty state', async () => {
    const { baseElement } = render(
      <CartDrawer {...defaultProps} items={[]} subtotal={0} />,
    );
    const results = await axe(baseElement);
    expect(results).toHaveNoViolations();
  });

  // Regression (keyboard audit): removing a line unmounted the focused
  // Remove button and focus fell back to the drawer panel (top of the cart).
  describe('focus after removing a line', () => {
    function Stateful() {
      const [items, setItems] = useState(sampleItems);
      return (
        <CartDrawer
          {...defaultProps}
          items={items}
          onRemoveItem={(id) => setItems((prev) => prev.filter((i) => i.id !== id))}
        />
      );
    }

    it('moves focus to the Remove button of the line that takes its place', async () => {
      const user = userEvent.setup();
      render(<Stateful />);
      screen.getByRole('button', { name: 'Remove Canvas Tote from cart' }).focus();
      await user.keyboard('{Enter}');
      expect(screen.getByRole('button', { name: 'Remove Linen Shirt from cart' })).toHaveFocus();
    });

    // With two lines, "the line in its place" and "the first line" are the
    // same button; a middle line tells them apart.
    it('keeps focus at the same position when a middle line is removed', async () => {
      const three = [...sampleItems, { id: 'item-3', name: 'Wool Scarf', price: 3500, quantity: 1 }];
      function StatefulThree() {
        const [items, setItems] = useState(three);
        return (
          <CartDrawer
            {...defaultProps}
            items={items}
            onRemoveItem={(id) => setItems((prev) => prev.filter((i) => i.id !== id))}
          />
        );
      }
      const user = userEvent.setup();
      render(<StatefulThree />);
      screen.getByRole('button', { name: 'Remove Linen Shirt from cart' }).focus();
      await user.keyboard('{Enter}');
      expect(screen.getByRole('button', { name: 'Remove Wool Scarf from cart' })).toHaveFocus();
    });

    it('moves focus to the empty state once the last line is removed', async () => {
      const user = userEvent.setup();
      render(<Stateful />);
      screen.getByRole('button', { name: 'Remove Linen Shirt from cart' }).focus();
      await user.keyboard('{Enter}');
      expect(screen.getByRole('button', { name: 'Remove Canvas Tote from cart' })).toHaveFocus();
      await user.keyboard('{Enter}');
      expect(screen.getByRole('button', { name: 'Continue Shopping' })).toHaveFocus();
    });
  });

  // Round 5 (shopper journeys): tabbing down a long bag, each line scrolled
  // in at the bottom edge — under the sticky footer (subtotal, Checkout),
  // completely hidden. The focused control is lifted clear of the footer.
  it('scrolls a focused line control out from under the sticky footer', () => {
    render(<CartDrawer {...defaultProps} />);
    const dialog = screen.getByRole('dialog');
    const scroller = dialog.querySelector<HTMLElement>('.ds-drawer__body')!;
    scroller.style.overflowY = 'auto'; // jsdom has no stylesheet
    const footer = dialog.querySelector<HTMLElement>('.ds-cart-drawer__footer')!;
    const rect = (top: number, bottom: number) =>
      ({ x: 0, y: top, top, bottom, left: 0, right: 100, width: 100, height: bottom - top, toJSON: () => ({}) });
    vi.spyOn(footer, 'getBoundingClientRect').mockReturnValue(rect(500, 700));
    const [first, second] = screen.getAllByRole('spinbutton');
    vi.spyOn(first!, 'getBoundingClientRect').mockReturnValue(rect(300, 342));
    vi.spyOn(second!, 'getBoundingClientRect').mockReturnValue(rect(520, 562));

    first!.focus(); // clear of the footer: left alone
    expect(scroller.scrollTop).toBe(0);
    second!.focus(); // 62px under the footer
    expect(scroller.scrollTop).toBe(62);
  });
});

