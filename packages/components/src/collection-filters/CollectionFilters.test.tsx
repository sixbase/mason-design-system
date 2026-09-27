import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
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

  it('renders filter group headings at h3 by default and at headingLevel when set', () => {
    const { rerender } = render(<CollectionFilters {...defaultProps} />);
    expect(screen.getAllByRole('heading', { level: 3, name: /Color/ }).length).toBeGreaterThan(0);
    rerender(<CollectionFilters {...defaultProps} headingLevel={2} />);
    expect(screen.getAllByRole('heading', { level: 2, name: /Color/ }).length).toBeGreaterThan(0);
    expect(screen.queryByRole('heading', { level: 3, name: /Color/ })).not.toBeInTheDocument();
  });

  it('labels the mobile trigger with mobileButtonLabel (default "Filters")', () => {
    const { container, rerender } = render(<CollectionFilters {...defaultProps} />);
    const trigger = () =>
      container.querySelector('.ds-collection-filters__mobile-trigger') as HTMLElement;
    expect(trigger()).toHaveTextContent(/^Filters/);
    rerender(<CollectionFilters {...defaultProps} mobileButtonLabel="Refine" />);
    expect(trigger()).toHaveTextContent(/^Refine/);
  });

  it('renders the header slot above the filters', () => {
    render(<CollectionFilters {...defaultProps} header={<span>Filter by</span>} />);
    expect(screen.getAllByText('Filter by').length).toBeGreaterThan(0);
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

  // Regression: the pill entrance played on page load for filters that were
  // already active. Only a pill added after the first render animates.
  it('animates only pills added after the first render', () => {
    const withBlack: Filter = {
      ...listFilter,
      values: listFilter.values?.map((v) => (v.value === 'black' ? { ...v, active: true } : v)),
    };
    const { rerender } = render(<CollectionFilters {...defaultProps} />);
    const white = screen.getByRole('button', { name: 'Remove filter: Color: White' });
    expect(white).toHaveClass('ds-collection-filters__pill');
    expect(white).not.toHaveClass('ds-collection-filters__pill--enter');

    rerender(<CollectionFilters {...defaultProps} filters={[withBlack, priceFilter, booleanFilter]} activeCount={2} />);
    expect(screen.getByRole('button', { name: 'Remove filter: Color: Black' })).toHaveClass(
      'ds-collection-filters__pill--enter',
    );
    // The pill that was there from the start still does not animate.
    expect(screen.getByRole('button', { name: 'Remove filter: Color: White' })).not.toHaveClass(
      'ds-collection-filters__pill--enter',
    );
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

    const { container } = render(
      <CollectionFilters
        {...defaultProps}
        filters={[manyValues]}
        activeCount={0}
        showMoreThreshold={5}
      />,
    );

    expect(screen.getAllByText('Show 5 more').length).toBeGreaterThan(0);
    const panel = within(container.querySelector('.ds-collection-filters__desktop') as HTMLElement);
    expect(panel.getAllByRole('checkbox')).toHaveLength(5);
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

    const { container } = render(
      <CollectionFilters
        {...defaultProps}
        filters={[manyValues]}
        activeCount={0}
        showMoreThreshold={5}
      />,
    );
    const panel = within(container.querySelector('.ds-collection-filters__desktop') as HTMLElement);

    const showMoreBtns = screen.getAllByText('Show 3 more');
    await user.click(showMoreBtns[0]);

    expect(screen.getAllByText('Show less').length).toBeGreaterThan(0);
    expect(panel.getAllByRole('checkbox')).toHaveLength(8);
  });

  // ── Results count ──────────────────────────────────────

  // The region used to render filled ("24 products"): read in browse mode
  // as a hidden copy of the page's visible count. It now speaks on change.
  const countRegion = (root: ParentNode = document) =>
    root.querySelector('.ds-collection-filters__sr-only[aria-live="polite"]');

  it('starts with an empty results-count live region', () => {
    render(<CollectionFilters {...defaultProps} resultsCount={24} />);
    expect(countRegion()).toBeEmptyDOMElement();
  });

  it('announces results count via aria-live region when it changes', () => {
    const { rerender } = render(<CollectionFilters {...defaultProps} resultsCount={24} />);
    rerender(<CollectionFilters {...defaultProps} resultsCount={12} />);
    expect(countRegion()).toHaveTextContent(/^12 products$/);
  });

  it('uses singular form for 1 product', () => {
    const { rerender } = render(<CollectionFilters {...defaultProps} resultsCount={24} />);
    rerender(<CollectionFilters {...defaultProps} resultsCount={1} />);
    expect(countRegion()).toHaveTextContent(/^1 product$/);
  });

  // One region only. The mobile drawer's modal aria-hidden leaves
  // [aria-live] elements exposed (aria-hidden package), so the page-level
  // region still speaks while the drawer is open — a second copy inside
  // the drawer made every count change announce twice.
  it('keeps a single results-count region while the mobile drawer is open', async () => {
    const user = userEvent.setup();
    render(<CollectionFilters {...defaultProps} resultsCount={24} />);
    await user.click(screen.getByRole('button', { name: /^Filters/ }));
    await screen.findByRole('dialog', { name: 'Filter products' });
    expect(document.querySelectorAll('.ds-collection-filters__sr-only[aria-live]')).toHaveLength(1);
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
    expect(countRegion()).toHaveAttribute('aria-atomic', 'true');
  });

  // ── Regressions ─────────────────────────────────────────

  describe('price range regressions', () => {
    const desktop = (container: HTMLElement) =>
      within(container.querySelector('.ds-collection-filters__desktop') as HTMLElement);
    const pillsOf = (container: HTMLElement) =>
      within(container.querySelector('.ds-collection-filters__active-pills') as HTMLElement);

    it('labels one-sided ranges in words, not with a dangling dash', () => {
      const { container, rerender } = render(
        <CollectionFilters {...defaultProps} filters={[{ ...priceFilter, activeMax: 5000 }]} />,
      );
      // "–$50.00" read as negative fifty
      expect(pillsOf(container).getByRole('button', { name: 'Remove filter: Price: Up to $50.00' })).toBeInTheDocument();

      rerender(<CollectionFilters {...defaultProps} filters={[{ ...priceFilter, activeMin: 1000 }]} />);
      expect(pillsOf(container).getByRole('button', { name: 'Remove filter: Price: From $10.00' })).toBeInTheDocument();

      rerender(
        <CollectionFilters {...defaultProps} filters={[{ ...priceFilter, activeMin: 1000, activeMax: Infinity }]} />,
      );
      expect(pillsOf(container).getByRole('button', { name: 'Remove filter: Price: From $10.00' })).toBeInTheDocument();
    });

    it('labels price pills in the filters currency and locale (was a hardcoded "$")', () => {
      const { container } = render(
        <CollectionFilters
          {...defaultProps}
          currency="EUR"
          locale="de-DE"
          filters={[{ ...priceFilter, activeMin: 2000, activeMax: 15000 }]}
        />,
      );
      const de = (amount: number) =>
        new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
      expect(
        pillsOf(container).getByRole('button', { name: `Remove filter: Price: ${de(20)}–${de(150)}` }),
      ).toBeInTheDocument();
    });

    it('uses the currency precision for inputs: whole yen, no ".00"', async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();
      const { container } = render(
        <CollectionFilters
          {...defaultProps}
          onFilterChange={onFilterChange}
          currency="JPY"
          locale="ja-JP"
          filters={[{ ...priceFilter, max: 5000000, activeMin: 480000 }]}
        />,
      );
      const min = desktop(container).getByRole('spinbutton', { name: /Minimum price/ });
      const max = desktop(container).getByRole('spinbutton', { name: /Maximum price/ });
      expect(min).toHaveValue(4800); // was "4800.00"
      expect(max).toHaveAttribute('placeholder', '50000');
      expect(min).toHaveAttribute('step', '1');
      await user.type(max, '9000');
      await user.click(desktop(container).getByRole('button', { name: 'Apply' }));
      // Still hundredths on the way out, like every other price prop.
      expect(onFilterChange).toHaveBeenCalledWith('price', [480000, 900000], true);
    });

    it('sends an open upper bound (not 0) when max is blank and the filter has no max', async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();
      const { container } = render(
        <CollectionFilters
          {...defaultProps}
          filters={[{ id: 'price', label: 'Price', type: 'price_range' }]}
          activeCount={0}
          onFilterChange={onFilterChange}
        />,
      );
      await user.type(desktop(container).getByRole('spinbutton', { name: /minimum/i }), '10');
      await user.click(desktop(container).getByRole('button', { name: 'Apply' }));
      // Was [1000, 0] — an inverted range that matched nothing.
      expect(onFilterChange).toHaveBeenCalledWith('price', [1000, Infinity], true);
    });

    // 19.99 × 100 is 1998.9999… in floating point: truncating sends 1998.
    it('rounds typed prices to the nearest cent', async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();
      const { container } = render(
        <CollectionFilters
          {...defaultProps}
          filters={[{ id: 'price', label: 'Price', type: 'price_range' }]}
          activeCount={0}
          onFilterChange={onFilterChange}
        />,
      );
      await user.type(desktop(container).getByRole('spinbutton', { name: /minimum/i }), '19.99');
      await user.type(desktop(container).getByRole('spinbutton', { name: /maximum/i }), '64.99');
      await user.click(desktop(container).getByRole('button', { name: 'Apply' }));
      expect(onFilterChange).toHaveBeenCalledWith('price', [1999, 6499], true);
    });

    it('resets the inputs when the parent clears the applied range', () => {
      const { container, rerender } = render(
        <CollectionFilters {...defaultProps} filters={[{ ...priceFilter, activeMin: 1000, activeMax: 5000 }]} />,
      );
      expect(desktop(container).getByRole('spinbutton', { name: /minimum/i })).toHaveValue(10);
      rerender(<CollectionFilters {...defaultProps} filters={[priceFilter]} activeCount={0} />);
      expect(desktop(container).getByRole('spinbutton', { name: /minimum/i })).toHaveValue(null);
      expect(desktop(container).getByRole('spinbutton', { name: /maximum/i })).toHaveValue(null);
    });
  });

  it('keeps an active value uncheckable after its count drops to 0', () => {
    const { container } = render(
      <CollectionFilters
        {...defaultProps}
        filters={[
          {
            id: 'color',
            label: 'Color',
            type: 'list',
            values: [
              { label: 'Black', value: 'black', count: 0, active: true },
              { label: 'Red', value: 'red', count: 0, active: false },
            ],
          },
        ]}
      />,
    );
    const panel = within(container.querySelector('.ds-collection-filters__desktop') as HTMLElement);
    expect(panel.getByRole('checkbox', { name: 'Black' })).toBeEnabled();
    expect(panel.getByRole('checkbox', { name: 'Red' })).toBeDisabled();
  });

  // Regression (keyboard audit): removing a pill or pressing Clear all
  // unmounted the focused button and dropped keyboard focus to <body>.
  describe('focus after removing active filters', () => {
    function Stateful() {
      const [filters, setFilters] = useState<Filter[]>([
        {
          id: 'color',
          label: 'Color',
          type: 'list',
          values: [
            { label: 'Black', value: 'black', count: 12, active: true },
            { label: 'White', value: 'white', count: 8, active: true },
            { label: 'Blue', value: 'blue', count: 3, active: false },
          ],
        },
      ]);
      const setActive = (value: string, active: boolean) =>
        setFilters((prev) =>
          prev.map((f) => ({
            ...f,
            values: f.values?.map((v) => (v.value === value ? { ...v, active } : v)),
          })),
        );
      return (
        <CollectionFilters
          filters={filters}
          activeCount={filters[0].values?.filter((v) => v.active).length ?? 0}
          onFilterChange={(_id, value, active) => setActive(value as string, active)}
          onClearAll={() =>
            setFilters((prev) =>
              prev.map((f) => ({ ...f, values: f.values?.map((v) => ({ ...v, active: false })) })),
            )
          }
        />
      );
    }

    it('moves focus to the pill that takes the removed one\'s place', async () => {
      const user = userEvent.setup();
      render(<Stateful />);
      screen.getByRole('button', { name: 'Remove filter: Color: Black' }).focus();
      await user.keyboard('{Enter}');
      expect(screen.getByRole('button', { name: 'Remove filter: Color: White' })).toHaveFocus();
    });

    it('moves focus into the filter panel when the last filter is cleared', async () => {
      const user = userEvent.setup();
      render(<Stateful />);
      const clearAll = screen
        .getAllByRole('button', { name: 'Clear all filters' })
        .find((b) => b.closest('.ds-collection-filters__active-pills'))!;
      clearAll.focus();
      await user.keyboard('{Enter}');
      expect(document.activeElement).not.toBe(document.body);
      expect(document.activeElement).toHaveClass('ds-accordion__trigger');
    });

    // Round 5 (shopper journeys): on a phone, "Clear all" inside the filter
    // Drawer removed its own row and Radix parked focus on the dialog —
    // the keyboard user started over from the drawer's top edge.
    it('keeps focus in the drawer panel when Clear all empties it', async () => {
      const user = userEvent.setup();
      render(<Stateful />);
      await user.click(screen.getByRole('button', { name: /^Filters/ }));
      const dialog = await screen.findByRole('dialog');
      const clearAll = within(dialog).getByRole('button', { name: 'Clear all filters' });
      clearAll.focus();
      await user.keyboard('{Enter}');
      await waitFor(() => expect(document.activeElement).toHaveClass('ds-accordion__trigger'));
      expect(dialog).toContainElement(document.activeElement as HTMLElement);
    });
  });
});

// ─── Motion (CSS) ──────────────────────────────────────────
// jsdom has no animations — read the stylesheet the component ships.

describe('CollectionFilters motion', () => {
  const css = readFileSync(resolve(__dirname, 'CollectionFilters.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const pillRule = css.match(/(?:^|})\s*\.ds-collection-filters__pill\s*\{([^}]*)\}/)?.[1] ?? '';
  const enterRule = css.match(/(?:^|})\s*\.ds-collection-filters__pill--enter\s*\{([^}]*)\}/)?.[1] ?? '';

  it('keeps the entrance off the base pill, so pills active on page load just show', () => {
    expect(pillRule).not.toMatch(/animation/);
  });

  it('brings an applied filter pill in with token timing, from ghost opacity, without replacing its transform', () => {
    expect(enterRule).toMatch(
      /animation:\s*ds-collection-filters-pill-in var\(--transition-duration-normal\) var\(--transition-easing-emphasized\) backwards/,
    );
    const keyframes = css.match(/@keyframes ds-collection-filters-pill-in\s*\{([\s\S]*?)\}\s*\}/)?.[1] ?? '';
    expect(keyframes).toContain('opacity: var(--opacity-ghost)');
    expect(keyframes).toContain('scale: var(--scale-enter)');
    expect(keyframes).not.toContain('transform');
  });

  it('turns the pill entrance off for reduced motion', () => {
    const reduced = css.match(/@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\}\s*\}/)?.[1] ?? '';
    expect(reduced).toMatch(/\.ds-collection-filters__pill--enter\s*\{[^}]*animation:\s*none/);
  });
});
