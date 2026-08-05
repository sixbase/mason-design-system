import { Badge, Button, Grid, PriceDisplay, ProductCard } from '@ds/components';
import { Preview } from './Preview';
import { makePlaceholder } from '../lib/placeholder';

const placeholder = makePlaceholder('', '#D6D0C7', '#D6D0C7', { width: 400, height: 500 });
const placeholderAlt = makePlaceholder('', '#C8C1B6', '#C8C1B6', { width: 400, height: 500 });

const products = [
  {
    name: 'Aramid Fiber iPhone 17 Pro Max Case',
    price: 8500,
    image: placeholder,
  },
  {
    name: 'Minimalist Watch',
    price: 28500,
    image: placeholder,
  },
  {
    name: 'Leather Crossbody Bag',
    price: 12800,
    image: placeholder,
  },
  {
    name: 'Polarized Sunglasses',
    price: 9500,
    image: placeholder,
  },
];

export function ProductCardSingle() {
  return (
    <Preview>
      <ProductCard
        name="Aramid Fiber iPhone 17 Pro Max Case"
        price={8500}
        image={placeholder}
      />
    </Preview>
  );
}

export function ProductCardLarge() {
  return (
    <Preview>
      <ProductCard
        name="Aramid Fiber iPhone 17 Pro Max Case"
        price={8500}
        image={placeholder}
        size="lg"
      />
    </Preview>
  );
}

export function ProductCardWithBadge() {
  return (
    <Preview>
      <ProductCard
        name="Aramid Fiber iPhone 17 Pro Max Case"
        price={8500}
        image={placeholder}
        badge={<Badge variant="destructive" size="sm">Sale</Badge>}
      />
    </Preview>
  );
}

export function ProductCardWithRenderPrice() {
  return (
    <Preview>
      <ProductCard
        name="Aramid Fiber iPhone 17 Pro Max Case"
        price={6800}
        image={placeholder}
        badge={<Badge variant="destructive" size="sm">20% Off</Badge>}
        renderPrice={(price, currency) => (
          <PriceDisplay
            price={`$${(price / 100).toFixed(2)}`}
            comparePrice="$85.00"
            size="sm"
          />
        )}
      />
    </Preview>
  );
}

export function ProductCardWithHoverImage() {
  return (
    <Preview>
      <ProductCard
        name="Aramid Fiber iPhone 17 Pro Max Case"
        price={8500}
        image={placeholder}
        hoverImage={placeholderAlt}
      />
    </Preview>
  );
}

export function ProductCardWithActionSlot() {
  return (
    <Preview>
      <ProductCard
        name="Aramid Fiber iPhone 17 Pro Max Case"
        price={8500}
        image={placeholder}
        actionSlot={
          <Button variant="secondary" size="sm" iconOnly aria-label="Add to wishlist">
            ♡
          </Button>
        }
      />
    </Preview>
  );
}

export function ProductCardWithFooterSlot() {
  return (
    <Preview>
      <ProductCard
        name="Aramid Fiber iPhone 17 Pro Max Case"
        price={8500}
        image={placeholder}
        footerSlot={
          <Button variant="secondary" size="sm" fullWidth>
            Quick add
          </Button>
        }
      />
    </Preview>
  );
}

export function ProductCardContainerAdaptive() {
  return (
    <Preview>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '160px 220px 340px',
          gap: 'var(--spacing-4)',
          alignItems: 'start',
        }}
      >
        <ProductCard name="Narrow cell (160px)" price={8500} image={placeholder} fluid />
        <ProductCard name="Reference cell (220px)" price={8500} image={placeholder} fluid />
        <ProductCard name="Wide cell (340px)" price={8500} image={placeholderAlt} fluid />
      </div>
    </Preview>
  );
}

export function ProductCardGrid() {
  return (
    <Preview>
      <Grid cols={4}>
        {products.map((p) => (
          <ProductCard key={p.name} {...p} fluid />
        ))}
      </Grid>
    </Preview>
  );
}
