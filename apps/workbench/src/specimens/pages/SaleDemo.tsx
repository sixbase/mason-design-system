import { useState, useMemo } from 'react';
import {
  Badge, Breadcrumb, Button, Grid, Heading, ProductCard,
  PriceDisplay, Select, SelectItem, Text,
} from '@ds/components';
import { PRODUCTS, formatPrice } from '../data/products';
import type { Product } from '../data/products';
import './SaleDemo.css';

// ─── Sale products: items with compareAtPrice ─────────────

const SALE_PRODUCTS: Product[] = PRODUCTS.filter((p) => p.compareAtPrice);

// If not enough products have compareAtPrice, create synthetic sale items
// for the demo by applying a discount to additional products.
const DEMO_SALE_PRODUCTS: Product[] =
  SALE_PRODUCTS.length >= 4
    ? SALE_PRODUCTS
    : [
        ...SALE_PRODUCTS,
        ...PRODUCTS.filter((p) => !p.compareAtPrice)
          .slice(0, 8 - SALE_PRODUCTS.length)
          .map((p) => ({
            ...p,
            compareAtPrice: Math.round(p.price * 1.25),
            badge: 'Sale',
          })),
      ];

// ─── Sort helpers ─────────────────────────────────────────

type SortKey = 'newest' | 'price-asc' | 'price-desc' | 'discount';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'discount', label: 'Biggest Savings' },
];

function sortProducts(products: Product[], key: SortKey): Product[] {
  const sorted = [...products];
  switch (key) {
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'discount':
      return sorted.sort((a, b) => {
        const discountA = (a.compareAtPrice ?? a.price) - a.price;
        const discountB = (b.compareAtPrice ?? b.price) - b.price;
        return discountB - discountA;
      });
    case 'newest':
    default:
      return sorted;
  }
}

// ─── Component ────────────────────────────────────────────

export function SaleDemo({ basePath = '' }: { basePath?: string }) {
  const [sortValue, setSortValue] = useState<SortKey>('newest');

  const sorted = useMemo(
    () => sortProducts(DEMO_SALE_PRODUCTS, sortValue),
    [sortValue],
  );

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Home', href: `${basePath}/examples/homepage` },
          { label: 'Sale' },
        ]}
      />

      {/* ── Sale Banner ──────────────────────────────────── */}
      <div className="ds-sale__banner">
        <Heading as="h1" size="2xl">
          End of Season Sale
        </Heading>
        <Text size="base" muted>
          Up to 40% off select items. While stocks last.
        </Text>
      </div>

      {/* ── Results Header ───────────────────────────────── */}
      <div className="ds-results-header">
        <div className="ds-results-header__row">
          <div>
            <Text size="sm" muted>
              {sorted.length} {sorted.length === 1 ? 'item' : 'items'} on sale
            </Text>
          </div>
          <div className="ds-results-header__sort">
            <Select
              size="sm"
              value={sortValue}
              onValueChange={(v) => setSortValue(v as SortKey)}
              placeholder="Sort by"
              aria-label="Sort by"
            >
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* ── Product Grid ─────────────────────────────────── */}
      <Grid cols={2} colsSm={2} colsMd={3} colsLg={4}>
        {sorted.map((product) => (
          <a
            key={product.id}
            href={`${basePath}/examples/product-detail`}
            className="ds-unstyled-link"
          >
            <ProductCard
              name={product.name}
              price={product.price}
              image={product.image}
              fluid
              // Visual only: the price already reads "Sale price …, Original price …"
              badge={<Badge variant="destructive" size="sm" aria-hidden="true">Sale</Badge>}
              renderPrice={
                product.compareAtPrice
                  ? (p, c) => (
                      <PriceDisplay
                        price={formatPrice(p)}
                        comparePrice={formatPrice(product.compareAtPrice!)}
                        size="sm"
                      />
                    )
                  : undefined
              }
            />
          </a>
        ))}
      </Grid>
    </div>
  );
}
