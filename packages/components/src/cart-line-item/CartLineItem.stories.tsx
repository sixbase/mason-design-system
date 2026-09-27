import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../button';
import { PRODUCTS, productImage } from '../story-fixtures';
import { CartLineItem } from './CartLineItem';

const meta: Meta<typeof CartLineItem> = {
  title: 'Ecommerce/CartLineItem',
  component: CartLineItem,
  parameters: {
    docs: {
      description: {
        component:
          'One product row in the cart: picture, name, options, price, quantity and remove.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof CartLineItem>;

const { tote, shirt, wallet, beanie, blanket } = PRODUCTS;

/** A line with working quantity and remove (and a way to bring it back). */
function Controlled(props: Partial<React.ComponentProps<typeof CartLineItem>>) {
  const [quantity, setQuantity] = useState(props.quantity ?? 1);
  const [removed, setRemoved] = useState(false);

  return (
    <div style={{ maxWidth: 'var(--size-content-md)' }}>
      {removed ? (
        <Button variant="secondary" size="sm" onClick={() => setRemoved(false)}>
          Put it back
        </Button>
      ) : (
        <CartLineItem
          id="demo-1"
          name={tote.name}
          price={tote.price}
          image={tote.image}
          imageAlt={tote.imageAlt}
          onQuantityChange={setQuantity}
          onRemove={() => setRemoved(true)}
          {...props}
          quantity={quantity}
        />
      )}
    </div>
  );
}

export const Default: Story = {
  render: () => <Controlled />,
};

export const WithOptions: Story = {
  render: () => (
    <Controlled
      name={shirt.name}
      price={shirt.price}
      image={shirt.image}
      imageAlt={shirt.imageAlt}
      options={[
        { name: 'Size', value: 'XL' },
        { name: 'Color', value: 'Oat' },
      ]}
    />
  ),
};

export const OnSale: Story = {
  render: () => (
    <Controlled
      name={blanket.name}
      price={blanket.price}
      compareAtPrice={blanket.compareAtPrice}
      image={blanket.image}
      imageAlt={blanket.imageAlt}
    />
  ),
};

/** `href` makes the picture and name a link back to the product page. */
export const WithLink: Story = {
  render: () => (
    <Controlled
      name={beanie.name}
      price={beanie.price}
      href={beanie.href}
      image={beanie.image}
      imageAlt={beanie.imageAlt}
    />
  ),
};

/** `currency` + `locale` format both prices: 128,00 € and the struck-through 160,00 €. */
export const EuroPrices: Story = {
  name: 'Prices in euros (Germany)',
  render: () => (
    <Controlled
      name={blanket.name}
      price={blanket.price}
      compareAtPrice={blanket.compareAtPrice}
      image={blanket.image}
      imageAlt={blanket.imageAlt}
      currency="EUR"
      locale="de-DE"
    />
  ),
};

export const NoImage: Story = {
  render: () => <Controlled name="Gift Card" price={5000} image={undefined} imageAlt={undefined} />,
};

export const LongName: Story = {
  render: () => (
    <Controlled
      name="Hand-Stitched Vegetable-Tanned Leather Weekender Bag with Brass Hardware and Adjustable Shoulder Strap"
      price={24500}
      image={productImage('Weekender', 3)}
      imageAlt="Tan leather weekender bag with brass buckles"
      options={[
        { name: 'Color', value: 'Cognac' },
        { name: 'Size', value: 'Large' },
        { name: 'Monogram', value: 'A.T.' },
      ]}
    />
  ),
};

export const MultipleItems: Story = {
  render: function CartList() {
    const [items, setItems] = useState([
      { ...tote, quantity: 1, options: undefined },
      { ...shirt, quantity: 2, options: [{ name: 'Size', value: 'M' }] },
      { ...wallet, quantity: 1, options: undefined },
    ]);

    return (
      <div style={{ maxWidth: 'var(--size-content-md)' }}>
        {items.map((item) => (
          <CartLineItem
            key={item.id}
            id={item.id}
            name={item.name}
            price={item.price}
            compareAtPrice={item.compareAtPrice}
            quantity={item.quantity}
            image={item.image}
            imageAlt={item.imageAlt}
            options={item.options}
            href={item.href}
            onQuantityChange={(q) =>
              setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, quantity: q } : i)))
            }
            onRemove={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
          />
        ))}
      </div>
    );
  },
};
