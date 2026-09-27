import { useState, useMemo } from 'react';
import {
  Button, Grid, Heading, Input, ProductCard, Select, SelectItem, Text,
} from '@ds/components';
import { PRODUCTS, formatPrice } from '../data/products';
import type { Product } from '../data/products';
import './SearchDemo.css';

// ─── Sort helpers ─────────────────────────────────────────

type SortKey = 'relevance' | 'price-asc' | 'price-desc' | 'newest';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

function sortProducts(products: Product[], key: SortKey): Product[] {
  const sorted = [...products];
  switch (key) {
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'newest':
      return sorted.reverse();
    case 'relevance':
    default:
      return sorted;
  }
}

function filterProducts(products: Product[], query: string): Product[] {
  const q = query.toLowerCase().trim();
  if (!q) return products;
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q)),
  );
}

// ─── Search icon ──────────────────────────────────────────

const SearchIcon = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

// ─── Component ────────────────────────────────────────────

export function SearchDemo({ basePath = '' }: { basePath?: string }) {
  const [query, setQuery] = useState('canvas');
  const [sortValue, setSortValue] = useState<SortKey>('relevance');

  const results = useMemo(() => {
    const filtered = filterProducts(PRODUCTS, query);
    return sortProducts(filtered, sortValue);
  }, [query, sortValue]);

  return (
    <div className="ds-search">
      {/* ── Search Bar ─────────────────────────────────────── */}
      <form
        className="ds-search__bar"
        onSubmit={(e) => e.preventDefault()}
        role="search"
      >
        <Input
          type="search"
          size="lg"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          leadingAdornment={SearchIcon}
          aria-label="Search products"
        />
      </form>

      {/* ── Results ────────────────────────────────────────── */}
      {query.trim() && results.length > 0 && (
        <>
          <div className="ds-results-header">
            <div className="ds-results-header__row">
              <div>
                <Heading as="h1" size="2xl">
                  Results for &ldquo;{query}&rdquo;
                </Heading>
                <Text size="sm" muted>
                  {results.length} {results.length === 1 ? 'product' : 'products'}
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

          <Grid cols={2} colsSm={2} colsMd={3} colsLg={4}>
            {results.map((product) => (
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
                />
              </a>
            ))}
          </Grid>
        </>
      )}

      {/* ── No Results ─────────────────────────────────────── */}
      {/* The empty and no-results states replace the results header, so
          they carry the page's one h1 (it was an h2 — no h1 at all). */}
      {query.trim() && results.length === 0 && (
        <div className="ds-search__empty">
          <Heading as="h1" size="xl">
            No results for &ldquo;{query}&rdquo;
          </Heading>
          <Text size="sm" muted>
            Try a different search term or browse our collections.
          </Text>
          <Button variant="secondary" size="md" asChild>
            <a href={`${basePath}/examples/collection`}>Browse Collections</a>
          </Button>
        </div>
      )}

      {/* ── Empty query ────────────────────────────────────── */}
      {!query.trim() && (
        <div className="ds-search__empty">
          <Heading as="h1" size="xl">
            Search our store
          </Heading>
          <Text size="sm" muted>
            Enter a keyword to find products.
          </Text>
        </div>
      )}
    </div>
  );
}
