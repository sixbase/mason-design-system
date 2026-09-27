import type { Meta, StoryObj } from '@storybook/react';
import { ProductCard } from './ProductCard';
import { Badge } from '../badge/Badge';
import { Button } from '../button/Button';
import { Heart } from '../icon';
import { PriceDisplay } from '../price-display/PriceDisplay';

/** Same Intl formatter the card uses for its own price. */
const money = (cents: number, currency: string) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100);

const meta: Meta<typeof ProductCard> = {
  title: 'Components/ProductCard',
  component: ProductCard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'One product in a grid: picture, name and price, with an optional badge, wishlist button and quick add.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof ProductCard>;

export const Default: Story = {
  render: () => (
    <ProductCard
      name="Classic Cotton T-Shirt"
      price={3200}
      image="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop"
      imageAlt="White crew-neck T-shirt on a hanger"
    />
  ),
};

/** `size="lg"` — a quarter of the 1200px container, with base-size name and price. */
export const Large: Story = {
  render: () => (
    <ProductCard
      size="lg"
      name="Classic Cotton T-Shirt"
      price={3200}
      image="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop"
    />
  ),
};

export const WithBadge: Story = {
  render: () => (
    <ProductCard
      name="Classic Cotton T-Shirt"
      price={3200}
      image="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop"
      badge={<Badge variant="destructive" size="sm">Sale</Badge>}
    />
  ),
};

export const WithRenderPrice: Story = {
  name: 'Sale price (custom price area)',
  render: () => (
    <ProductCard
      name="Classic Cotton T-Shirt"
      price={2400}
      image="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop"
      badge={<Badge variant="destructive" size="sm">Sale</Badge>}
      // The sale price composes PriceDisplay — the same component the sale
      // page and cart use — rather than a hand-built <s>/<strong> pair.
      renderPrice={(price, currency) => (
        <PriceDisplay size="sm" price={money(price, currency)} comparePrice={money(3200, currency)} />
      )}
    />
  ),
};

/** A second photo swaps in on hover (mouse only — touch keeps the first). */
export const WithHoverImage: Story = {
  name: 'Second photo on hover',
  render: () => (
    <ProductCard
      name="Classic Cotton T-Shirt"
      price={3200}
      image="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop"
      hoverImage="https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&h=500&fit=crop"
    />
  ),
};

export const WithActionSlot: Story = {
  name: 'With a wishlist button',
  render: () => (
    <ProductCard
      name="Classic Cotton T-Shirt"
      price={3200}
      image="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop"
      actionSlot={
        // Name the product: a grid of cards otherwise reads "Add to wishlist"
        // twelve times with nothing to tell them apart.
        <Button
          variant="secondary"
          size="sm"
          iconOnly
          aria-label="Add Classic Cotton T-Shirt to wishlist"
        >
          <Heart size="sm" />
        </Button>
      }
    />
  ),
};

export const WithFooterSlot: Story = {
  name: 'With a quick-add button',
  render: () => (
    <ProductCard
      name="Classic Cotton T-Shirt"
      price={3200}
      image="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop"
      footerSlot={
        // Visible words first (label in name), then the product
        <Button variant="secondary" size="sm" fullWidth aria-label="Quick add Classic Cotton T-Shirt">
          Quick add
        </Button>
      }
    />
  ),
};

/**
 * `currency` + `locale` format the price the local way — the same card in
 * Germany (32,00 €) and Japan (￥4,800).
 */
export const OtherCurrencies: Story = {
  name: 'Prices in euros and yen',
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-4)', alignItems: 'flex-start' }}>
      <ProductCard
        name="Klassisches Baumwoll-T-Shirt"
        price={3200}
        currency="EUR"
        locale="de-DE"
        image="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop"
        imageAlt="Weißes T-Shirt mit Rundhalsausschnitt auf einem Bügel"
      />
      <ProductCard
        name="クラシックコットンTシャツ"
        price={480000}
        currency="JPY"
        locale="ja-JP"
        image="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop"
        imageAlt="ハンガーに掛けた白いクルーネックTシャツ"
      />
    </div>
  ),
};

export const NoImage: Story = {
  render: () => (
    <ProductCard name="Waxed Canvas Apron" price={6400} image="" />
  ),
};

/**
 * The card is a container-query component: internals adapt to the grid
 * cell width, not the viewport. Narrow cells (< 200px) tighten insets and
 * type; wide cells (≥ 320px) relax type up to base size.
 */
export const ContainerAdaptive: Story = {
  name: 'Adapts to its column width',
  render: () => (
    // Wraps instead of scrolling sideways on a phone. Each cell width is a
    // token: 178px (< 200 → narrow), 220px (reference), 356px (≥ 320 → wide).
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-4)', alignItems: 'flex-start' }}>
      <div style={{ width: 'var(--spacing-phi-89)', maxWidth: '100%' }}>
        <ProductCard
          name="Narrow Cell (178px)"
          price={3200}
          image="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop"
          fluid
        />
      </div>
      <div style={{ width: 'calc(var(--spacing-phi-55) * 2)', maxWidth: '100%' }}>
        <ProductCard
          name="Reference Cell (220px)"
          price={3200}
          image="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=500&fit=crop"
          fluid
        />
      </div>
      <div style={{ width: 'calc(var(--spacing-phi-89) * 2)', maxWidth: '100%' }}>
        <ProductCard
          name="Wide Cell (356px)"
          price={3200}
          image="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop"
          fluid
        />
      </div>
    </div>
  ),
};

export const Grid: Story = {
  name: 'In a product grid',
  render: () => (
    // Auto-fill, not a fixed repeat(4, 220px) that ran ~570px off a phone:
    // two up at 375, four up on desktop — like the collection grid. Fluid
    // cards so the grid owns the width.
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(var(--spacing-phi-89), calc(50% - var(--spacing-2))), 1fr))',
        gap: 'var(--spacing-4)',
        maxWidth: 'var(--size-container)',
      }}
    >
      <ProductCard
        fluid
        name="Classic Cotton T-Shirt"
        price={3200}
        image="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop"
      />
      <ProductCard
        fluid
        name="Minimalist Watch"
        price={28500}
        image="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=500&fit=crop"
      />
      <ProductCard
        fluid
        name="Leather Weekender"
        price={12800}
        image="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop"
        badge={<Badge variant="success" size="sm">New</Badge>}
      />
      <ProductCard
        fluid
        name="Polarized Sunglasses"
        price={9500}
        image="https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=500&fit=crop"
      />
    </div>
  ),
};
