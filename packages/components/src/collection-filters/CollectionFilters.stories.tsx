import type { Meta, StoryObj } from '@storybook/react';
import { useState, useCallback } from 'react';
import { CollectionFilters } from './CollectionFilters';
import type { Filter, FilterValue } from './CollectionFilters';
import { Heading } from '../typography';

const meta: Meta<typeof CollectionFilters> = {
  title: 'Ecommerce/CollectionFilters',
  component: CollectionFilters,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The filter panel beside a product list — colour, size, price, availability. On phones it opens as a drawer.',
      },
    },
  },
  argTypes: {
    filters: { table: { disable: true } },
    onFilterChange: { table: { disable: true } },
    onClearAll: { table: { disable: true } },
    header: { table: { disable: true } },
    activeCount: { control: 'number', description: 'Total number of active filters' },
    showMoreThreshold: { control: 'number', description: 'Values shown before "Show more"' },
    mobileButtonLabel: { control: 'text', description: 'Mobile button label' },
    resultsCount: { control: 'number', description: 'Products count for aria-live' },
  },
};

export default meta;
type Story = StoryObj<typeof CollectionFilters>;

// ─── Helpers ──────────────────────────────────────────────

function useFilterState(initialFilters: Filter[]) {
  const [filters, setFilters] = useState(initialFilters);

  const activeCount = filters.reduce((count, f) => {
    if (f.type === 'list' || f.type === 'boolean') {
      return count + (f.values?.filter((v) => v.active).length ?? 0);
    }
    if (f.type === 'price_range' && (f.activeMin != null || f.activeMax != null)) {
      return count + 1;
    }
    return count;
  }, 0);

  const onFilterChange = useCallback(
    (filterId: string, value: string | [number, number], active: boolean) => {
      setFilters((prev) =>
        prev.map((f) => {
          if (f.id !== filterId) return f;

          if (f.type === 'price_range' && Array.isArray(value)) {
            return { ...f, activeMin: value[0], activeMax: value[1] };
          }

          if ((f.type === 'list' || f.type === 'boolean') && typeof value === 'string') {
            return {
              ...f,
              values: f.values?.map((v) =>
                v.value === value ? { ...v, active } : v,
              ),
            };
          }

          return f;
        }),
      );
    },
    [],
  );

  const onClearAll = useCallback(() => {
    setFilters((prev) =>
      prev.map((f) => ({
        ...f,
        values: f.values?.map((v) => ({ ...v, active: false })),
        activeMin: undefined,
        activeMax: undefined,
      })),
    );
  }, []);

  return { filters, activeCount, onFilterChange, onClearAll };
}

// ─── Fixtures ──────────────────────────────────────────────

// A tuple, so sampleFilters[2] is a Filter (not Filter | undefined) under
// noUncheckedIndexedAccess
const sampleFilters: [Filter, Filter, Filter, Filter] = [
  {
    id: 'color',
    label: 'Color',
    type: 'list',
    values: [
      { label: 'Black', value: 'black', count: 42, active: false },
      { label: 'White', value: 'white', count: 28, active: false },
      { label: 'Navy', value: 'navy', count: 15, active: false },
      { label: 'Stone', value: 'stone', count: 8, active: false },
    ],
  },
  {
    id: 'size',
    label: 'Size',
    type: 'list',
    values: [
      { label: 'XS', value: 'xs', count: 5, active: false },
      { label: 'S', value: 's', count: 12, active: false },
      { label: 'M', value: 'm', count: 18, active: false },
      { label: 'L', value: 'l', count: 14, active: false },
      { label: 'XL', value: 'xl', count: 9, active: false },
      { label: 'XXL', value: 'xxl', count: 3, active: false },
    ],
  },
  {
    id: 'price',
    label: 'Price',
    type: 'price_range',
    min: 0,
    max: 50000,
  },
  {
    id: 'availability',
    label: 'Availability',
    type: 'boolean',
    values: [{ label: 'In stock only', value: 'in_stock', count: 48, active: false }],
  },
];

const filtersWithActive: Filter[] = [
  {
    ...sampleFilters[0],
    values: sampleFilters[0].values?.map((v) =>
      v.value === 'black' || v.value === 'navy' ? { ...v, active: true } : v,
    ),
  },
  sampleFilters[1],
  {
    ...sampleFilters[2],
    activeMin: 2000,
    activeMax: 15000,
  },
  sampleFilters[3],
];

// ─── Stories ──────────────────────────────────────────────

export const Default: Story = {
  render: function DefaultStory() {
    const state = useFilterState(sampleFilters);
    return (
      <div style={{ maxWidth: 'calc(var(--spacing-phi-89) * 2)' }}>
        <CollectionFilters {...state} resultsCount={64} />
      </div>
    );
  },
};

export const WithActiveFilters: Story = {
  render: function ActiveStory() {
    const state = useFilterState(filtersWithActive);
    return (
      <div style={{ maxWidth: 'calc(var(--spacing-phi-89) * 2)' }}>
        <CollectionFilters {...state} resultsCount={12} />
      </div>
    );
  },
};

/** `currency` + `locale` format the price range: the pill reads “20 € – 150 €”. */
export const EuroPrices: Story = {
  name: 'Prices in euros (Germany)',
  render: function EuroStory() {
    const state = useFilterState(filtersWithActive);
    return (
      <div style={{ maxWidth: 'calc(var(--spacing-phi-89) * 2)' }}>
        <CollectionFilters {...state} resultsCount={12} currency="EUR" locale="de-DE" />
      </div>
    );
  },
};

export const WithHeader: Story = {
  render: function HeaderStory() {
    const state = useFilterState(sampleFilters);
    return (
      <div style={{ maxWidth: 'calc(var(--spacing-phi-89) * 2)' }}>
        <CollectionFilters
          {...state}
          // h2: the filter groups below are h3 (headingLevel default).
          // `level`/`size="sm"` are not Heading props — they rendered <h2 level="3">.
          header={<Heading as="h2" size="xl">Filter by</Heading>}
          resultsCount={64}
        />
      </div>
    );
  },
};

export const ManyValues: Story = {
  render: function ManyValuesStory() {
    const manyColorFilter: Filter = {
      id: 'color',
      label: 'Color',
      type: 'list',
      values: [
        'Black', 'White', 'Navy', 'Stone', 'Sage', 'Amber',
        'Burgundy', 'Charcoal', 'Ivory', 'Slate', 'Olive', 'Rust',
      ].map((name, i) => ({
        label: name,
        value: name.toLowerCase(),
        count: 20 - i,
        active: false,
      })),
    };

    const state = useFilterState([manyColorFilter, sampleFilters[2]]);
    return (
      <div style={{ maxWidth: 'calc(var(--spacing-phi-89) * 2)' }}>
        <CollectionFilters {...state} showMoreThreshold={5} resultsCount={96} />
      </div>
    );
  },
};

export const ZeroCountValues: Story = {
  render: function ZeroCountStory() {
    const withZeros: Filter = {
      id: 'size',
      label: 'Size',
      type: 'list',
      values: [
        { label: 'XS', value: 'xs', count: 5, active: false },
        { label: 'S', value: 's', count: 0, active: false },
        { label: 'M', value: 'm', count: 12, active: false },
        { label: 'L', value: 'l', count: 0, active: false },
        { label: 'XL', value: 'xl', count: 3, active: false },
      ],
    };
    const state = useFilterState([withZeros]);
    return (
      <div style={{ maxWidth: 'calc(var(--spacing-phi-89) * 2)' }}>
        <CollectionFilters {...state} resultsCount={20} />
      </div>
    );
  },
};

export const PriceRangeOnly: Story = {
  render: function PriceOnlyStory() {
    const state = useFilterState([sampleFilters[2]]);
    return (
      <div style={{ maxWidth: 'calc(var(--spacing-phi-89) * 2)' }}>
        <CollectionFilters {...state} resultsCount={64} />
      </div>
    );
  },
};

export const BooleanOnly: Story = {
  render: function BooleanOnlyStory() {
    const state = useFilterState([sampleFilters[3]]);
    return (
      <div style={{ maxWidth: 'calc(var(--spacing-phi-89) * 2)' }}>
        <CollectionFilters {...state} resultsCount={48} />
      </div>
    );
  },
};
