import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import { CollectionFilters } from './CollectionFilters';
import type { Filter } from './CollectionFilters';

expect.extend(toHaveNoViolations);

// ─── Fixtures ──────────────────────────────────────────────

const listFilter: Filter = {
  id: 'color',
  label: 'Color',
  type: 'list',
  values: [
    { label: 'Black', value: 'black', count: 12, active: false },
    { label: 'White', value: 'white', count: 8, active: true },
    { label: 'Blue', value: 'blue', count: 3, active: false },
  ],
};

const priceFilter: Filter = {
  id: 'price',
  label: 'Price',
  type: 'price_range',
  min: 0,
  max: 50000,
};

const booleanFilter: Filter = {
  id: 'availability',
  label: 'Availability',
  type: 'boolean',
  values: [{ label: 'In stock only', value: 'in_stock', active: false }],
};

const defaultProps = {
  filters: [listFilter, priceFilter, booleanFilter],
  activeCount: 1,
  onFilterChange: vi.fn(),
  onClearAll: vi.fn(),
};

// ─── Tests ─────────────────────────────────────────────────

describe('CollectionFilters', () => {
  // ── Rendering ──────────────────────────────────────────

  it('renders without crashing', () => {
    render(<CollectionFilters {...defaultProps} />);
    expect(screen.getByText('Color')).toBeInTheDocument();
    expect(screen.getByText('Price')).toBeInTheDocument();
    expect(screen.getByText('Availability')).toBeInTheDocument();
  });

  it('renders nothing when filters array is empty', () => {
    const { container } = render(
      <CollectionFilters {...defaultProps} filters={[]} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('applies custom className', () => {
    const { container } = render(
      <CollectionFilters {...defaultProps} className="custom-filters" />,
    );
    expect(container.firstChild).toHaveClass('ds-collection-filters');
    expect(container.firstChild).toHaveClass('custom-filters');
  });

  // ── List filter checkboxes ─────────────────────────────

  it('renders checkbox values for list filters', () => {
    render(<CollectionFilters {...defaultProps} />);
    expect(screen.getAllByText('Black').length).toBeGreaterThan(0);
    expect(screen.getAllByText('White').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Blue').length).toBeGreaterThan(0);
  });

  it('shows product counts for filter values', () => {
    render(<CollectionFilters {...defaultProps} />);
    expect(screen.getAllByText('(12)').length).toBeGreaterThan(0);
    expect(screen.getAllByText('(8)').length).toBeGreaterThan(0);
  });

  it('calls onFilterChange when a checkbox is toggled', async () => {
    const onFilterChange = vi.fn();
    const user = userEvent.setup();
    render(
      <CollectionFilters {...defaultProps} onFilterChange={onFilterChange} />,
    );

    // Find the desktop panel's checkbox for "Black"
    const checkboxes = screen.getAllByRole('checkbox', { name: /Black/i });
    await user.click(checkboxes[0]);
    expect(onFilterChange).toHaveBeenCalledWith('color', 'black', true);
  });

  // ── Price range filter ─────────────────────────────────

  it('renders price range inputs', () => {
    render(<CollectionFilters {...defaultProps} />);
    const minInputs = screen.getAllByLabelText(/Minimum price/i);
    const maxInputs = screen.getAllByLabelText(/Maximum price/i);
    expect(minInputs.length).toBeGreaterThan(0);
    expect(maxInputs.length).toBeGreaterThan(0);
  });

  it('calls onFilterChange when price range is applied', async () => {
    const onFilterChange = vi.fn();
    const user = userEvent.setup();
    render(
      <CollectionFilters {...defaultProps} onFilterChange={onFilterChange} />,
    );

    const minInputs = screen.getAllByLabelText(/Minimum price/i);
    const maxInputs = screen.getAllByLabelText(/Maximum price/i);

    await user.type(minInputs[0], '10');
    await user.type(maxInputs[0], '50');

    const applyButtons = screen.getAllByRole('button', { name: 'Apply' });
    await user.click(applyButtons[0]);

    expect(onFilterChange).toHaveBeenCalledWith('price', [1000, 5000], true);
  });

  it('shows error when min > max in price range', async () => {
    const user = userEvent.setup();
    render(<CollectionFilters {...defaultProps} />);

    const minInputs = screen.getAllByLabelText(/Minimum price/i);
    const maxInputs = screen.getAllByLabelText(/Maximum price/i);

    await user.type(minInputs[0], '100');
    await user.type(maxInputs[0], '10');

    const applyButtons = screen.getAllByRole('button', { name: 'Apply' });
    await user.click(applyButtons[0]);

    expect(screen.getAllByText('Min must be less than max').length).toBeGreaterThan(0);
  });

  // ── Active filter pills ────────────────────────────────

  it('renders active filter pills', () => {
    render(<CollectionFilters {...defaultProps} />);
    expect(screen.getAllByLabelText(/Remove filter: Color: White/i).length).toBeGreaterThan(0);
  });

  it('calls onFilterChange when a pill is dismissed', async () => {
    const onFilterChange = vi.fn();
    const user = userEvent.setup();
    render(
      <CollectionFilters {...defaultProps} onFilterChange={onFilterChange} />,
    );

    const pills = screen.getAllByLabelText(/Remove filter: Color: White/i);
    await user.click(pills[0]);
    expect(onFilterChange).toHaveBeenCalledWith('color', 'white', false);
  });

  // ── Clear all ──────────────────────────────────────────

  it('calls onClearAll when "Clear all" is clicked', async () => {
    const onClearAll = vi.fn();
    const user = userEvent.setup();
    render(
      <CollectionFilters {...defaultProps} onClearAll={onClearAll} />,
    );

    const clearButtons = screen.getAllByLabelText('Clear all filters');
    await user.click(clearButtons[0]);
    expect(onClearAll).toHaveBeenCalled();
  });

  it('hides clear all and pills when activeCount is 0', () => {
    render(
      <CollectionFilters
        {...defaultProps}
        activeCount={0}
        filters={[{ ...listFilter, values: listFilter.values?.map(v => ({ ...v, active: false })) }]}
      />,
    );
    expect(screen.queryByLabelText('Clear all filters')).not.toBeInTheDocument();
  });

  // ── Show more / Show less ──────────────────────────────

  it('shows "Show more" when values exceed threshold', () => {
    const manyValues: Filter = {
      id: 'size',
      label: 'Size',
      type: 'list',
      values: Array.from({ length: 10 }, (_, i) => ({
        label: `Size ${i}`,
        value: `size-${i}`,
        count: i + 1,
        active: false,
      })),
    };

    render(
      <CollectionFilters
        {...defaultProps}
        filters={[manyValues]}
        activeCount={0}
        showMoreThreshold={5}
      />,
    );

    expect(screen.getAllByText('Show 5 more').length).toBeGreaterThan(0);
  });

  it('toggles between show more and show less', async () => {
    const user = userEvent.setup();
    const manyValues: Filter = {
      id: 'size',
      label: 'Size',
      type: 'list',
      values: Array.from({ length: 8 }, (_, i) => ({
        label: `Size ${i}`,
        value: `size-${i}`,
        count: i + 1,
        active: false,
      })),
    };

    render(
      <CollectionFilters
        {...defaultProps}
        filters={[manyValues]}
        activeCount={0}
        showMoreThreshold={5}
      />,
    );

    const showMoreBtns = screen.getAllByText('Show 3 more');
    await user.click(showMoreBtns[0]);

    expect(screen.getAllByText('Show less').length).toBeGreaterThan(0);
  });

  // ── Results count ──────────────────────────────────────

  it('announces results count via aria-live region', () => {
    render(
      <CollectionFilters {...defaultProps} resultsCount={24} />,
    );
    expect(screen.getByText('24 products')).toBeInTheDocument();
  });

  it('uses singular form for 1 product', () => {
    render(
      <CollectionFilters {...defaultProps} resultsCount={1} />,
    );
    expect(screen.getByText('1 product')).toBeInTheDocument();
  });

  // ── Disabled filter values ─────────────────────────────

  it('disables checkboxes with count 0', () => {
    const withZeroCount: Filter = {
      id: 'color',
      label: 'Color',
      type: 'list',
      values: [
        { label: 'Red', value: 'red', count: 0, active: false },
      ],
    };

    render(
      <CollectionFilters
        {...defaultProps}
        filters={[withZeroCount]}
        activeCount={0}
      />,
    );

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).toBeDisabled();
  });

  // ── Mobile drawer ──────────────────────────────────────

  it('renders mobile filter button', () => {
    render(<CollectionFilters {...defaultProps} />);
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('opens drawer when mobile button is clicked', async () => {
    const user = userEvent.setup();
    render(<CollectionFilters {...defaultProps} />);

    await user.click(screen.getByText('Filters'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('shows active count badge on mobile button', () => {
    render(<CollectionFilters {...defaultProps} activeCount={3} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('applies the drawer panel variant (safe-area padding) inside the mobile drawer only', async () => {
    const user = userEvent.setup();
    render(<CollectionFilters {...defaultProps} />);

    // Desktop sidebar panel has no drawer modifier
    const desktopPanel = document.querySelector(
      '.ds-collection-filters__desktop .ds-collection-filters__panel',
    );
    expect(desktopPanel).not.toHaveClass('ds-collection-filters__panel--drawer');

    await user.click(screen.getByText('Filters'));
    const dialog = screen.getByRole('dialog');
    const drawerPanel = dialog.querySelector('.ds-collection-filters__panel');
    expect(drawerPanel).toHaveClass('ds-collection-filters__panel--drawer');
  });

  it('price range inputs have visible labels and accessible names', () => {
    render(<CollectionFilters {...defaultProps} />);
    // Visible labels (desktop panel + drawer share markup; at least one each)
    expect(screen.getAllByText('Min').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Max').length).toBeGreaterThan(0);
    // Accessible names include the filter context
    expect(screen.getAllByLabelText(/Minimum price for Price/i).length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText(/Maximum price for Price/i).length).toBeGreaterThan(0);
  });

  // ── Accessibility ──────────────────────────────────────

  it('has no accessibility violations', async () => {
    const { container } = render(
      <CollectionFilters {...defaultProps} resultsCount={24} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has aria-live region for results count', () => {
    render(<CollectionFilters {...defaultProps} resultsCount={10} />);
    const liveRegion = screen.getByText('10 products');
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
  });
});
