import type { Meta, StoryObj } from '@storybook/react';
import { useState, useCallback } from 'react';
import { Button } from '../button';
import { PRODUCTS } from '../story-fixtures';
import { Text } from '../typography';
import { CartDrawer } from './CartDrawer';
import type { CartDrawerItemData, CartDrawerProps } from './CartDrawer';

// ─── Shared sample data (the story catalogue) ─────────────

function line(key: keyof typeof PRODUCTS, quantity: number, extra: Partial<CartDrawerItemData> = {}): CartDrawerItemData {
  const p = PRODUCTS[key];
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    quantity,
    image: p.image,
    imageAlt: p.imageAlt,
    href: p.href,
    ...extra,
  };
}

const SAMPLE_ITEMS: CartDrawerItemData[] = [
  line('tote', 1),
  line('shirt', 2, { options: [{ name: 'Size', value: 'M' }, { name: 'Color', value: 'Oat' }] }),
  line('wallet', 1),
];

const MANY_ITEMS: CartDrawerItemData[] = [
  ...SAMPLE_ITEMS,
  line('mug', 4, { options: [{ name: 'Glaze', value: 'Speckled white' }] }),
  line('apron', 1, { options: [{ name: 'Color', value: 'Olive' }] }),
  line('beanie', 2, { options: [{ name: 'Color', value: 'Charcoal' }] }),
  line('blanket', 1),
  line('candle', 3),
];

function computeSubtotal(items: CartDrawerItemData[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

/**
 * The drawer with working quantity and remove. Opens on load so the state
 * is visible without a click; the button brings it back after closing.
 */
function CartDemo({
  initialItems,
  buttonLabel = 'Open cart',
  ...props
}: { initialItems: CartDrawerItemData[]; buttonLabel?: string } & Partial<CartDrawerProps>) {
  const [open, setOpen] = useState(true);
  const [items, setItems] = useState(initialItems);

  const handleUpdateQuantity = useCallback((id: string, quantity: number) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)));
  }, []);

  const handleRemoveItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return (
    <>
      <Button onClick={() => setOpen(true)}>{buttonLabel}</Button>
      <CartDrawer
        {...props}
        open={open}
        onOpenChange={setOpen}
        items={items}
        subtotal={computeSubtotal(items)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />
    </>
  );
}

// ─── Meta ─────────────────────────────────────────────────

const meta: Meta<typeof CartDrawer> = {
  title: 'Ecommerce/Cart Drawer',
  component: CartDrawer,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      // Each state opens its drawer on load; in their own frames they don't
      // cover the docs page or each other.
      story: { inline: false, iframeHeight: 640 },
      description: {
        component:
          'The cart that slides in from the right: items, quantities, subtotal and the checkout button.',
      },
    },
  },
  argTypes: {
    open: { table: { disable: true } },
    onOpenChange: { table: { disable: true } },
    items: { table: { disable: true } },
    onUpdateQuantity: { table: { disable: true } },
    onRemoveItem: { table: { disable: true } },
    children: { table: { disable: true } },
    className: { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof CartDrawer>;

// ─── Stories ──────────────────────────────────────────────

export const Default: Story = {
  render: () => <CartDemo initialItems={SAMPLE_ITEMS} />,
};

/** Anything passed as children sits above the subtotal — a shipping note, a gift option. */
export const WithFooterContent: Story = {
  name: 'With a note above the subtotal',
  render: () => (
    <CartDemo initialItems={SAMPLE_ITEMS.slice(0, 1)}>
      <Text size="xs" muted>
        Free shipping on orders over $50
      </Text>
    </CartDemo>
  ),
};

/** `currency` + `locale` format every price in the drawer: 48,00 € in Germany. */
export const EuroPrices: Story = {
  name: 'Prices in euros (Germany)',
  render: () => <CartDemo initialItems={SAMPLE_ITEMS} currency="EUR" locale="de-DE" />,
};

export const EmptyCart: Story = {
  render: () => <CartDemo initialItems={[]} />,
};

export const CustomEmptyMessage: Story = {
  render: () => <CartDemo initialItems={[]} emptyMessage="Nothing in here yet — your next favourite mug is waiting." />,
};

/** Eight lines: the item list scrolls while the subtotal and checkout stay put. */
export const ManyItems: Story = {
  render: () => <CartDemo initialItems={MANY_ITEMS} buttonLabel="Open cart (8 items)" />,
};
