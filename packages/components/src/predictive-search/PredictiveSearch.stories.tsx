import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PredictiveSearch } from './PredictiveSearch';
import type { SearchResult } from './PredictiveSearch';
import { PRODUCTS } from '../story-fixtures';
import type { SampleProduct } from '../story-fixtures';

// ─── Sample data (the story catalogue) ──────────────────────

const { tote, shirt, wallet, blanket, apron } = PRODUCTS;
const asResult = (p: SampleProduct): SearchResult => ({
  type: 'product',
  id: p.id,
  title: p.name,
  url: p.href,
  image: p.image,
  price: p.price,
  compareAtPrice: p.compareAtPrice,
});

const MOCK_RESULTS: SearchResult[] = [
  asResult(tote),
  asResult(shirt),
  asResult(wallet),
  { type: 'collection', id: 'c1', title: 'Bags & Totes', url: '/collections/bags' },
  { type: 'collection', id: 'c2', title: 'New Arrivals', url: '/collections/new' },
  { type: 'page', id: 'pg1', title: 'About Our Materials', url: '/pages/materials' },
  { type: 'article', id: 'a1', title: 'How to Care for Canvas and Leather', url: '/blogs/journal/canvas-care' },
];

const SALE_PRODUCTS: SearchResult[] = [asResult(shirt), asResult(blanket), { ...asResult(apron), price: 4800, compareAtPrice: apron.price }];

/**
 * Types a query into the search box once, on load — the box has no prop
 * for a starting query, and every state below only shows after typing.
 * Story harness only: sets the input's value the way a keystroke would.
 */
function Typed({ query, children }: { query: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const input = ref.current?.querySelector('input');
    if (!input) return;
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    setValue?.call(input, query);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }, [query]);
  return <div ref={ref}>{children}</div>;
}

// ─── Meta ───────────────────────────────────────────────────

const meta: Meta<typeof PredictiveSearch> = {
  title: 'Components/PredictiveSearch',
  component: PredictiveSearch,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'The search box that suggests products, collections and articles as you type.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 'var(--size-modal-sm)', minHeight: 'var(--size-modal-sm)' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PredictiveSearch>;

export const Default: Story = {
  args: {
    onSearch: () => {},
    placeholder: 'Search products\u2026',
  },
};

export const Small: Story = {
  args: {
    onSearch: () => {},
    size: 'sm',
    placeholder: 'Search\u2026',
  },
};

export const Large: Story = {
  args: {
    onSearch: () => {},
    size: 'lg',
    placeholder: 'Search products\u2026',
  },
};

/** “tote” typed on load: products, collections, pages and articles, grouped. */
export const WithResults: Story = {
  // Four groups run taller than the space the other states reserve
  decorators: [(Story) => <div style={{ minHeight: 'var(--size-modal-md)' }}><Story /></div>],
  render: () => (
    <Typed query="tote">
      <PredictiveSearch onSearch={() => {}} results={MOCK_RESULTS} />
    </Typed>
  ),
};

export const ProductsOnly: Story = {
  render: () => (
    <Typed query="tote">
      <PredictiveSearch
        onSearch={() => {}}
        results={MOCK_RESULTS.filter((r) => r.type === 'product')}
        showTypes={['product']}
      />
    </Typed>
  ),
};

export const WithSaleProducts: Story = {
  render: () => (
    <Typed query="linen">
      <PredictiveSearch onSearch={() => {}} results={SALE_PRODUCTS} showTypes={['product']} />
    </Typed>
  ),
};

/** `currency` + `locale` format result prices: 48,00 €. */
export const EuroPrices: Story = {
  name: 'Prices in euros (Germany)',
  render: () => (
    <Typed query="tote">
      <PredictiveSearch
        onSearch={() => {}}
        results={MOCK_RESULTS.filter((r) => r.type === 'product')}
        showTypes={['product']}
        currency="EUR"
        locale="de-DE"
      />
    </Typed>
  ),
};

export const Loading: Story = {
  render: () => (
    <Typed query="mug">
      <PredictiveSearch onSearch={() => {}} loading />
    </Typed>
  ),
};

export const NoResults: Story = {
  render: () => (
    <Typed query="umbrella">
      <PredictiveSearch onSearch={() => {}} results={[]} />
    </Typed>
  ),
};

/** Type anything: results filter as you go, after a short simulated network delay. */
export const Interactive: Story = {
  name: 'Try it: type to search',
  render: function InteractiveStory() {
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = useCallback((query: string) => {
      setLoading(true);
      // Simulate API delay
      setTimeout(() => {
        const filtered = MOCK_RESULTS.filter((r) =>
          r.title.toLowerCase().includes(query.toLowerCase()),
        );
        setResults(filtered);
        setLoading(false);
      }, 400);
    }, []);

    const handleSelect = useCallback((result: SearchResult) => {
      // eslint-disable-next-line no-console
      console.log('Selected:', result);
    }, []);

    const handleViewAll = useCallback((query: string) => {
      // eslint-disable-next-line no-console
      console.log('View all:', query);
    }, []);

    return (
      <PredictiveSearch
        onSearch={handleSearch}
        results={results}
        loading={loading}
        onSelect={handleSelect}
        onViewAll={handleViewAll}
        debounce={300}
      />
    );
  },
};
