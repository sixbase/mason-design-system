import { useMemo, useState } from 'react';
import {
  Breadcrumb,
  CollectionFilters,
  Grid,
  Heading,
  ProductCard,
  Select,
  SelectItem,
  Text,
} from '@ds/components';
import type { Filter } from '@ds/components';
import { PRODUCTS } from '../data/products';
import type { Product } from '../data/products';
import './CollectionDemo.css';

// ─── Sort helpers ─────────────────────────────────────────

type SortKey = 'newest' | 'price-asc' | 'price-desc' | 'best-selling';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'best-selling', label: 'Best Selling' },
];

function sortProducts(products: Product[], key: SortKey): Product[] {
  const sorted = [...products];
  switch (key) {
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'best-selling':
      return sorted.sort((a, b) => (b.badge ? 1 : 0) - (a.badge ? 1 : 0));
    case 'newest':
    default:
      return sorted;
  }
}

// ─── Filter helpers ────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  bags: 'Bags',
  home: 'Home',
  clothing: 'Clothing',
  accessories: 'Accessories',
};

interface FilterState {
  categories: Set<string>;
  priceMin: number | null; // cents
  priceMax: number | null; // cents
  onSale: boolean;
}

const EMPTY_FILTERS: FilterState = {
  categories: new Set(),
  priceMin: null,
  priceMax: null,
  onSale: false,
};

function applyFilters(products: Product[], state: FilterState): Product[] {
  return products.filter((p) => {
    if (state.categories.size > 0 && !state.categories.has(p.category)) return false;
    if (state.priceMin != null && p.price < state.priceMin) return false;
    if (state.priceMax != null && p.price > state.priceMax) return false;
    if (state.onSale && !p.compareAtPrice) return false;
    return true;
  });
}

function countActive(state: FilterState): number {
  let n = state.categories.size;
  if (state.priceMin != null || state.priceMax != null) n += 1;
  if (state.onSale) n += 1;
  return n;
}

// ─── Component ────────────────────────────────────────────

export function CollectionDemo({ basePath = '' }: { basePath?: string }) {
  const [sortValue, setSortValue] = useState<SortKey>('newest');
  const [filterState, setFilterState] = useState<FilterState>(EMPTY_FILTERS);

  const filtered = useMemo(
    () => sortProducts(applyFilters(PRODUCTS, filterState), sortValue),
    [filterState, sortValue],
  );

  // Build the filter definitions for <CollectionFilters>. Counts reflect the
  // total inventory per category, not the filtered subset — this is the
  // ecommerce convention so users see what's available before narrowing.
  const filters: Filter[] = useMemo(() => {
    const categoryCounts = PRODUCTS.reduce<Record<string, number>>((acc, p) => {
      acc[p.category] = (acc[p.category] ?? 0) + 1;
      return acc;
    }, {});
    return [
      {
        id: 'category',
        label: 'Category',
        type: 'list',
        values: Object.keys(CATEGORY_LABELS).map((cat) => ({
          label: CATEGORY_LABELS[cat],
          value: cat,
          count: categoryCounts[cat] ?? 0,
          active: filterState.categories.has(cat),
        })),
      },
      {
        id: 'price',
        label: 'Price',
        type: 'price_range',
        min: 0,
        max: 30000,
        activeMin: filterState.priceMin ?? undefined,
        activeMax: filterState.priceMax ?? undefined,
      },
      {
        id: 'on-sale',
        label: 'On sale',
        type: 'boolean',
        values: [
          { label: 'On sale', value: 'on-sale', active: filterState.onSale },
        ],
      },
    ];
  }, [filterState]);

  const handleFilterChange = (
    filterId: string,
    value: string | [number, number],
    active: boolean,
  ) => {
    setFilterState((prev) => {
      if (filterId === 'category' && typeof value === 'string') {
        const next = new Set(prev.categories);
        if (active) next.add(value);
        else next.delete(value);
        return { ...prev, categories: next };
      }
      if (filterId === 'price' && Array.isArray(value)) {
        return { ...prev, priceMin: value[0], priceMax: value[1] };
      }
      if (filterId === 'on-sale') {
        return { ...prev, onSale: active };
      }
      return prev;
    });
  };

  const handleClearAll = () => setFilterState(EMPTY_FILTERS);

  const activeCount = countActive(filterState);

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Home', href: `${basePath}/examples/homepage` },
          { label: 'Collections', href: `${basePath}/examples/collection` },
          { label: 'All Products' },
        ]}
      />

      <div className="ds-results-header">
        <div className="ds-results-header__row">
          <div>
            <Heading as="h1" size="2xl">
              All Products
            </Heading>
            <Text size="sm" muted>
              {filtered.length} of {PRODUCTS.length} products
            </Text>
          </div>
          <div className="ds-results-header__sort">
            <Select
              size="sm"
              value={sortValue}
              onValueChange={(v) => setSortValue(v as SortKey)}
              placeholder="Sort by"
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

      <div className="ds-collection-layout ds-collection-layout--with-filters">
        <aside className="ds-collection-layout__sidebar" aria-label="Filters">
          <CollectionFilters
            filters={filters}
            activeCount={activeCount}
            onFilterChange={handleFilterChange}
            onClearAll={handleClearAll}
            resultsCount={filtered.length}
          />
        </aside>

        <div className="ds-collection-layout__main">
          {filtered.length > 0 ? (
            <Grid cols={2} colsSm={2} colsMd={3} colsLg={4}>
              {filtered.map((product) => (
                <a
                  key={product.id}
                  href={`${basePath}/examples/product-detail`}
                  className="ds-unstyled-link"
                >
                  <ProductCard
                    fluid
                    name={product.name}
                    price={product.price}
                    image={product.image}
                  />
                </a>
              ))}
            </Grid>
          ) : (
            <div className="ds-collection-layout__empty">
              <Text>No products match the current filters.</Text>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
