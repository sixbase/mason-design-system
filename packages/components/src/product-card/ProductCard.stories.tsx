import type { Meta, StoryObj } from '@storybook/react';
import { ProductCard } from './ProductCard';
import { Badge } from '../badge/Badge';
import { Button } from '../button/Button';

const meta: Meta<typeof ProductCard> = {
  title: 'Components/ProductCard',
  component: ProductCard,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof ProductCard>;

export const Default: Story = {
  render: () => (
    <ProductCard
      name="Classic Cotton T-Shirt"
      price={3200}
      image="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop"
      style={{ width: 220 }}
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
      style={{ width: 220 }}
    />
  ),
};

export const WithRenderPrice: Story = {
  render: () => (
    <ProductCard
      name="Classic Cotton T-Shirt"
      price={2400}
      image="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop"
      renderPrice={(price, currency) => (
        <span>
          <s style={{ color: 'var(--color-foreground-muted)' }}>$32.00</s>{' '}
          <strong>${(price / 100).toFixed(2)}</strong>
        </span>
      )}
      style={{ width: 220 }}
    />
  ),
};

export const WithHoverImage: Story = {
  render: () => (
    <ProductCard
      name="Classic Cotton T-Shirt"
      price={3200}
      image="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop"
      hoverImage="https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&h=500&fit=crop"
      style={{ width: 220 }}
    />
  ),
};

export const WithActionSlot: Story = {
  render: () => (
    <ProductCard
      name="Classic Cotton T-Shirt"
      price={3200}
      image="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop"
      actionSlot={
        <Button variant="secondary" size="sm" iconOnly aria-label="Add to wishlist">
          ♡
        </Button>
      }
      style={{ width: 220 }}
    />
  ),
};

export const WithFooterSlot: Story = {
  render: () => (
    <ProductCard
      name="Classic Cotton T-Shirt"
      price={3200}
      image="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop"
      footerSlot={
        <Button variant="secondary" size="sm" fullWidth>
          Quick add
        </Button>
      }
      style={{ width: 220 }}
    />
  ),
};

/**
 * The card is a container-query component: internals adapt to the grid
 * cell width, not the viewport. Narrow cells (< 200px) tighten insets and
 * type; wide cells (≥ 320px) relax type up to base size.
 */
export const ContainerAdaptive: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '160px 220px 360px',
        gap: 'var(--spacing-4)',
        alignItems: 'start',
      }}
    >
      <ProductCard
        name="Narrow Cell (160px)"
        price={3200}
        image="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop"
        fluid
      />
      <ProductCard
        name="Reference Cell (220px)"
        price={3200}
        image="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=500&fit=crop"
        fluid
      />
      <ProductCard
        name="Wide Cell (360px)"
        price={3200}
        image="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=500&fit=crop"
        fluid
      />
    </div>
  ),
};

export const Grid: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 220px)', gap: 'var(--spacing-4)' }}>
      <ProductCard
        name="Classic Cotton T-Shirt"
        price={3200}
        image="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop"
      />
      <ProductCard
        name="Minimalist Watch"
        price={28500}
        image="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=500&fit=crop"
      />
      <ProductCard
        name="Leather Crossbody Bag"
        price={12800}
        image="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=500&fit=crop"
        badge={<Badge variant="success" size="sm">New</Badge>}
      />
      <ProductCard
        name="Polarized Sunglasses"
        price={9500}
        image="https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=500&fit=crop"
      />
    </div>
  ),
};
