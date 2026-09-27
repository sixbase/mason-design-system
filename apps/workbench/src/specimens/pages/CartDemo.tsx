import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Heading, Text, Button, CartLineItem } from '@ds/components';
import { useFlip } from '@ds/motion/react';
import { PRODUCTS, formatPrice } from '../data/products';
import { setCartCount } from '../data/cart-count';
import type { Product } from '../data/products';
import './CartDemo.css';

// ─── Types ────────────────────────────────────────────────

interface CartItem {
  product: Product;
  quantity: number;
}

// ─── Initial cart (pre-populated for demo) ────────────────

const INITIAL_CART: CartItem[] = [
  { product: PRODUCTS[0]!, quantity: 1 }, // Canvas Tote
  { product: PRODUCTS[2]!, quantity: 2 }, // Linen Shirt
  { product: PRODUCTS[5]!, quantity: 1 }, // Leather Wallet
];

const FREE_SHIPPING_THRESHOLD = 5000; // $50.00
const SHIPPING_COST = 800; // $8.00

// ─── Component ────────────────────────────────────────────

export function CartDemo({ basePath = '' }: { basePath?: string }) {
  const [items, setItems] = useState<CartItem[]>(INITIAL_CART);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item,
      ),
    );
  }, []);

  // Removing a line: it fades out in place while the lines below glide up.
  const { ref: itemsRef, capture } = useFlip<HTMLDivElement>();

  // The pressed Remove button unmounts with its line, which would drop
  // keyboard focus to <body>. Move it to the line that slid into its place
  // (or the previous one, or the heading once the cart is empty).
  const focusAfterRemove = useRef<number | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const removeItem = useCallback(
    (productId: string) => {
      capture();
      setItems((prev) => {
        focusAfterRemove.current = prev.findIndex((item) => item.product.id === productId);
        return prev.filter((item) => item.product.id !== productId);
      });
    },
    [capture],
  );

  useEffect(() => {
    const index = focusAfterRemove.current;
    if (index === null) return;
    focusAfterRemove.current = null;
    const lines = itemsRef.current?.querySelectorAll<HTMLElement>('[data-flip-id]');
    const line = lines?.[Math.min(index, lines.length - 1)];
    // That line's Remove button, as CartDrawer does. "First enabled button"
    // landed on the quantity stepper's −/+ (tabindex -1, outside the tab
    // order): a screen reader heard "Decrease quantity" with no line named.
    const target = line?.querySelector<HTMLElement>('.ds-cart-line-item__remove button');
    (target ?? headingRef.current)?.focus();
  }, [items, itemsRef]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items],
  );

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // The header badge follows this cart
  useEffect(() => setCartCount(itemCount), [itemCount]);

  // ─── Empty state ──────────────────────────────────────

  if (items.length === 0) {
    return (
      <div className="ds-cart ds-layout ds-layout--full">
        <div className="ds-cart__empty">
          <Heading as="h1" size="xl" ref={headingRef} tabIndex={-1}>
            Your Cart Is Empty
          </Heading>
          <Text size="sm" muted>
            Looks like you haven't added anything yet.
          </Text>
          <Button variant="secondary" size="md" asChild>
            <a href={`${basePath}/examples/collection`}>Continue Shopping</a>
          </Button>
        </div>
      </div>
    );
  }

  // ─── Cart with items ──────────────────────────────────

  return (
    <div>
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="ds-cart__header">
        <Heading as="h1" size="2xl">
          Your Cart
        </Heading>
        <Text size="sm" muted>
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </Text>
      </div>

      {/* ── Items + Summary in golden split ─────────────────── */}
      <div className="ds-layout ds-layout--golden">
      <div className="ds-cart__items" ref={itemsRef}>
        {items.map((item) => (
          <CartLineItem
            key={item.product.id}
            data-flip-id={item.product.id}
            id={item.product.id}
            name={item.product.name}
            image={item.product.image}
            price={item.product.price}
            compareAtPrice={item.product.compareAtPrice}
            quantity={item.quantity}
            maxQuantity={10}
            onQuantityChange={(val) => updateQuantity(item.product.id, val)}
            onRemove={() => removeItem(item.product.id)}
          />
        ))}
      </div>

      {/* ── Summary ──────────────────────────────────────── */}
      <div className="ds-cart__summary ds-layout__sticky">
        <Heading as="h2" size="xl">
          Order Summary
        </Heading>

        <div className="ds-cart__summary-row">
          <Text size="sm" muted>Subtotal</Text>
          <Text size="sm">{formatPrice(subtotal)}</Text>
        </div>
        <div className="ds-cart__summary-row">
          <Text size="sm" muted>Shipping</Text>
          <Text size="sm">{shipping === 0 ? 'Free' : formatPrice(shipping)}</Text>
        </div>

        <hr className="ds-cart__summary-divider" />

        <div className="ds-cart__summary-row">
          <Text size="base" weight="semibold">Total</Text>
          <Text size="base" weight="semibold">{formatPrice(total)}</Text>
        </div>

        {shipping > 0 && (
          <Text size="xs" muted>
            Free shipping on orders over {formatPrice(FREE_SHIPPING_THRESHOLD)}
          </Text>
        )}

        <Button variant="primary" size="lg" fullWidth>
          Checkout
        </Button>

        <Button variant="secondary" size="md" fullWidth asChild>
          <a href={`${basePath}/examples/collection`}>Continue Shopping</a>
        </Button>
      </div>
      </div>
    </div>
  );
}
