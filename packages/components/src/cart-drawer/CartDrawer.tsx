import { forwardRef, useMemo } from 'react';
import type { ReactNode } from 'react';
import { Drawer } from '../drawer';
import { Heading } from '../typography';
import { Text } from '../typography';
import { Button } from '../button';
import { CartLineItem } from '../cart-line-item';
import type { CartLineItemOption } from '../cart-line-item';
import './CartDrawer.css';

// ─── Types ────────────────────────────────────────────────

export interface CartDrawerItemData {
  /** Unique identifier for the cart line */
  id: string;
  /** Product name */
  name: string;
  /** Unit price in cents */
  price: number;
  /** Original price in cents (shown with strikethrough when on sale) */
  compareAtPrice?: number;
  /** Quantity in cart */
  quantity: number;
  /** Maximum allowed quantity */
  maxQuantity?: number;
  /** Product image URL */
  image?: string;
  /** Alt text for product image */
  imageAlt?: string;
  /** Product options (e.g., Size, Color) */
  options?: CartLineItemOption[];
  /** Link to product detail page */
  href?: string;
}

export interface CartDrawerProps {
  /** Whether the drawer is open */
  open: boolean;
  /** Callback when the open state changes */
  onOpenChange: (open: boolean) => void;
  /** Cart line items */
  items: CartDrawerItemData[];
  /** Cart subtotal in cents */
  subtotal: number;
  /** Currency code for formatting */
  currency?: string;
  /** Callback when item quantity changes */
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  /** Callback when an item is removed */
  onRemoveItem: (itemId: string) => void;
  /** URL for checkout button */
  checkoutUrl?: string;
  /** Message shown when cart is empty */
  emptyMessage?: string;
  /** Additional class name */
  className?: string;
  /** Content to render in the footer before the subtotal (e.g., shipping note) */
  children?: ReactNode;
}

// ─── Helpers ──────────────────────────────────────────────

function formatPrice(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100);
}

// ─── Component ────────────────────────────────────────────

export const CartDrawer = forwardRef<HTMLDivElement, CartDrawerProps>(
  function CartDrawer(
    {
      open,
      onOpenChange,
      items,
      subtotal,
      currency = 'USD',
      onUpdateQuantity,
      onRemoveItem,
      checkoutUrl = '/checkout',
      emptyMessage = 'Your bag is empty',
      className,
      children,
    },
    ref,
  ) {
    const itemCount = useMemo(
      () => items.reduce((sum, item) => sum + item.quantity, 0),
      [items],
    );

    const drawerTitle = itemCount > 0
      ? `Your Bag (${itemCount})`
      : 'Your Bag';

    const isEmpty = items.length === 0;

    const classes = ['ds-cart-drawer', className].filter(Boolean).join(' ');

    return (
      <Drawer
        ref={ref}
        open={open}
        onOpenChange={onOpenChange}
        side="right"
        title="Shopping cart"
        className={classes}
      >
        <div className="ds-cart-drawer__content">
          {/* ── Header ─────────────────────────────────────── */}
          <div className="ds-cart-drawer__header">
            <Heading as="h2" size="xl">
              {drawerTitle}
            </Heading>
          </div>

          {isEmpty ? (
            /* ── Empty state ───────────────────────────────── */
            <div className="ds-cart-drawer__empty">
              <Text size="base" muted>
                {emptyMessage}
              </Text>
              <Button
                variant="secondary"
                size="md"
                onClick={() => onOpenChange(false)}
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              {/* ── Items list ─────────────────────────────── */}
              <div className="ds-cart-drawer__items">
                {items.map((item) => (
                  <CartLineItem
                    key={item.id}
                    id={item.id}
                    name={item.name}
                    price={item.price}
                    compareAtPrice={item.compareAtPrice}
                    quantity={item.quantity}
                    maxQuantity={item.maxQuantity}
                    image={item.image}
                    imageAlt={item.imageAlt}
                    options={item.options}
                    href={item.href}
                    onQuantityChange={(qty) => onUpdateQuantity(item.id, qty)}
                    onRemove={() => onRemoveItem(item.id)}
                  />
                ))}
              </div>

              {/* ── Footer ─────────────────────────────────── */}
              <div className="ds-cart-drawer__footer">
                {children}
                <div className="ds-cart-drawer__subtotal">
                  <Text size="base" weight="medium">
                    Subtotal
                  </Text>
                  <Text
                    size="base"
                    weight="semibold"
                    className="ds-cart-drawer__subtotal-value"
                  >
                    {formatPrice(subtotal, currency)}
                  </Text>
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  asChild
                >
                  <a href={checkoutUrl}>Checkout</a>
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  fullWidth
                  onClick={() => onOpenChange(false)}
                >
                  Continue Shopping
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Live region for item count announcements */}
        <div aria-live="polite" className="ds-sr-only">
          {itemCount > 0
            ? `${itemCount} ${itemCount === 1 ? 'item' : 'items'} in your cart`
            : 'Your cart is empty'}
        </div>
      </Drawer>
    );
  },
);

CartDrawer.displayName = 'CartDrawer';
