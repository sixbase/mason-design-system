import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Profiler, useState } from 'react';
import { flushSync } from 'react-dom';
import { describe, expect, it, vi } from 'vitest';
import { Drawer } from '../drawer/Drawer';
import { PredictiveSearch } from './PredictiveSearch';
import type { SearchResult } from './PredictiveSearch';

// ─── Mock data ──────────────────────────────────────────────

const MOCK_RESULTS: SearchResult[] = [
  { type: 'product', id: 'p1', title: 'Canvas Tote', url: '/products/tote', image: '/tote.jpg', price: 4800 },
  { type: 'product', id: 'p2', title: 'Linen Shirt', url: '/products/shirt', price: 8900, compareAtPrice: 11200 },
  { type: 'collection', id: 'c1', title: 'Summer Collection', url: '/collections/summer' },
  { type: 'page', id: 'pg1', title: 'About Us', url: '/pages/about' },
  { type: 'article', id: 'a1', title: 'Style Guide', url: '/blogs/style-guide' },
];

function noop() {}

// ─── Rendering ──────────────────────────────────────────────

describe('PredictiveSearch', () => {
  describe('rendering', () => {
    it('renders a combobox input', () => {
      render(<PredictiveSearch onSearch={noop} />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('renders placeholder text', () => {
      render(<PredictiveSearch onSearch={noop} placeholder="Find something…" />);
      expect(screen.getByPlaceholderText('Find something…')).toBeInTheDocument();
    });

    it('renders default placeholder', () => {
      render(<PredictiveSearch onSearch={noop} />);
      expect(screen.getByPlaceholderText('Search products…')).toBeInTheDocument();
    });

    it('renders a visually-hidden label linked to input', () => {
      render(<PredictiveSearch onSearch={noop} label="Search products" />);
      const input = screen.getByRole('combobox');
      const label = screen.getByText('Search products');
      expect(label).toHaveAttribute('for', input.id);
    });

    it('renders search icon', () => {
      const { container } = render(<PredictiveSearch onSearch={noop} />);
      expect(container.querySelector('.ds-predictive-search__icon')).toBeInTheDocument();
    });

    it('does not render dropdown when closed', () => {
      const { container } = render(<PredictiveSearch onSearch={noop} results={MOCK_RESULTS} />);
      expect(container.querySelector('.ds-predictive-search__dropdown')).not.toBeInTheDocument();
    });
  });

  // ─── Query behavior ─────────────────────────────────────

  describe('query behavior', () => {
    it('calls onSearch after debounce when query meets minChars', async () => {
      const onSearch = vi.fn();
      const user = userEvent.setup();
      render(<PredictiveSearch onSearch={onSearch} debounce={50} />);

      await user.type(screen.getByRole('combobox'), 'tote');
      await waitFor(() => expect(onSearch).toHaveBeenCalledWith('tote'));
    });

    it('does not call onSearch when query is shorter than minChars', async () => {
      const onSearch = vi.fn();
      const user = userEvent.setup();
      render(<PredictiveSearch onSearch={onSearch} debounce={50} minChars={3} />);

      await user.type(screen.getByRole('combobox'), 'ab');
      // Wait a bit beyond debounce
      await new Promise((r) => setTimeout(r, 100));
      expect(onSearch).not.toHaveBeenCalled();
    });

    it('shows clear button when query has text', async () => {
      const user = userEvent.setup();
      render(<PredictiveSearch onSearch={noop} />);
      expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();

      await user.type(screen.getByRole('combobox'), 'tote');
      expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
    });

    it('clear button resets input and closes dropdown', async () => {
      const user = userEvent.setup();
      render(<PredictiveSearch onSearch={noop} results={MOCK_RESULTS} />);

      await user.type(screen.getByRole('combobox'), 'tote');
      await user.click(screen.getByLabelText('Clear search'));

      expect(screen.getByRole('combobox')).toHaveValue('');
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
    });
  });

  // ─── Results display ────────────────────────────────────

  describe('results display', () => {
    async function openWithResults(results: SearchResult[] = MOCK_RESULTS) {
      const user = userEvent.setup();
      render(<PredictiveSearch onSearch={noop} results={results} debounce={0} />);
      await user.type(screen.getByRole('combobox'), 'to');
      return user;
    }

    it('shows dropdown when query meets minChars and results exist', async () => {
      await openWithResults();
      expect(screen.getByRole('listbox')).toBeVisible();
    });

    it('groups results by type with labels', async () => {
      await openWithResults();
      expect(screen.getByText('Products')).toBeInTheDocument();
      expect(screen.getByText('Collections')).toBeInTheDocument();
      expect(screen.getByText('Pages')).toBeInTheDocument();
      expect(screen.getByText('Articles')).toBeInTheDocument();
    });

    it('shows product title and price', async () => {
      await openWithResults();
      expect(screen.getByText('Canvas Tote')).toBeInTheDocument();
      expect(screen.getByText('$48.00')).toBeInTheDocument();
    });

    it('formats prices with the currency and locale props (was USD/en-US only)', async () => {
      const user = userEvent.setup();
      render(
        <PredictiveSearch onSearch={noop} results={MOCK_RESULTS} debounce={0} currency="EUR" locale="fr-FR" />,
      );
      await user.type(screen.getByRole('combobox'), 'to');
      const fr = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(48);
      expect(fr).toContain('48,00');
      // Identity normalizer: fr-FR uses (narrow) no-break spaces.
      expect(screen.getByText(fr, { normalizer: (s) => s })).toBeInTheDocument();
      expect(screen.queryByText('$48.00')).not.toBeInTheDocument();
    });

    it('shows compare-at price with strikethrough', async () => {
      await openWithResults();
      const comparePrice = screen.getByText('$112.00');
      expect(comparePrice.closest('.ds-predictive-search__result-compare')).toBeInTheDocument();
    });

    // Regression: the sale price rendered in the body color, the only commerce
    // surface that didn't mark a sale like PriceDisplay does. The --sale
    // modifier drives the destructive color; regular prices must not get it.
    it('marks only compare-at (sale) prices with the sale modifier', async () => {
      await openWithResults();
      const salePrice = screen.getByText('$112.00').closest('.ds-predictive-search__result-price');
      expect(salePrice).toHaveClass('ds-predictive-search__result-price--sale');
      const regularPrice = screen.getByText('$48.00').closest('.ds-predictive-search__result-price');
      expect(regularPrice).not.toHaveClass('ds-predictive-search__result-price--sale');
      expect(screen.getByText('$48.00')).toHaveClass('ds-predictive-search__result-current');
    });

    it('shows thumbnail for products with images', async () => {
      const { container } = render(
        <PredictiveSearch onSearch={noop} results={MOCK_RESULTS} debounce={0} />,
      );
      const user = userEvent.setup();
      await user.type(screen.getByRole('combobox'), 'to');
      const img = container.querySelector('.ds-predictive-search__thumbnail');
      expect(img).toHaveAttribute('src', '/tote.jpg');
    });

    it('shows title-only for non-product results', async () => {
      await openWithResults();
      expect(screen.getByText('Summer Collection')).toBeInTheDocument();
      expect(screen.getByText('About Us')).toBeInTheDocument();
    });

    it('respects maxResults per group', async () => {
      const manyProducts: SearchResult[] = Array.from({ length: 8 }, (_, i) => ({
        type: 'product' as const,
        id: `p${i}`,
        title: `Product ${i}`,
        url: `/products/${i}`,
        price: 1000 + i * 100,
      }));

      const user = userEvent.setup();
      render(<PredictiveSearch onSearch={noop} results={manyProducts} maxResults={2} debounce={0} />);
      await user.type(screen.getByRole('combobox'), 'pr');

      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(2);
    });

    it('respects showTypes filter', async () => {
      const user = userEvent.setup();
      render(
        <PredictiveSearch
          onSearch={noop}
          results={MOCK_RESULTS}
          showTypes={['product']}
          debounce={0}
        />,
      );
      await user.type(screen.getByRole('combobox'), 'to');

      expect(screen.getByText('Products')).toBeInTheDocument();
      expect(screen.queryByText('Collections')).not.toBeInTheDocument();
    });
  });

  // ─── Loading state ──────────────────────────────────────

  describe('loading state', () => {
    it('shows skeleton placeholders when loading', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <PredictiveSearch onSearch={noop} loading={true} debounce={0} />,
      );
      await user.type(screen.getByRole('combobox'), 'to');

      expect(container.querySelectorAll('.ds-predictive-search__skeleton-row')).toHaveLength(3);
    });

    it('sets aria-busy on loading container', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <PredictiveSearch onSearch={noop} loading={true} debounce={0} />,
      );
      await user.type(screen.getByRole('combobox'), 'to');

      expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
    });
  });

  // ─── Empty state ────────────────────────────────────────

  describe('empty state', () => {
    it('shows "No results" message when results are empty', async () => {
      const user = userEvent.setup();
      const { container } = render(<PredictiveSearch onSearch={noop} results={[]} debounce={0} />);
      await user.type(screen.getByRole('combobox'), 'xyznotfound');

      expect(container.querySelector('.ds-predictive-search__empty')).toBeInTheDocument();
    });

    // Every keystroke announced "No results for c", "No results for ca", …
    // while the debounce was still pending — before any search had run.
    // Fake timers: with a real 200ms debounce, "not searched yet" was only
    // true if typing finished within 200ms — not a given on a busy machine.
    it('announces "No results" only after the query has been searched', () => {
      vi.useFakeTimers();
      try {
        const onSearch = vi.fn();
        const { container } = render(
          <PredictiveSearch onSearch={onSearch} results={[]} debounce={200} />,
        );
        const live = container.querySelector('[aria-live="polite"]') as HTMLElement;
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'c' } });
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'ca' } });
        act(() => vi.advanceTimersByTime(199));
        expect(onSearch).not.toHaveBeenCalled();
        expect(live).not.toHaveTextContent(/No results/);
        act(() => vi.advanceTimersByTime(1));
        expect(onSearch).toHaveBeenCalledWith('ca');
        expect(live).toHaveTextContent('No results for ca');
      } finally {
        vi.useRealTimers();
      }
    });

    // Round 5 (shopper journeys): the empty state rendered as soon as two
    // characters were typed, so every first search flashed "No results for
    // “ca” — Try a different search term" for the whole debounce.
    it('shows the loading skeleton, not "No results", until the query has been searched', () => {
      vi.useFakeTimers();
      try {
        const { container } = render(
          <PredictiveSearch onSearch={noop} results={[]} debounce={200} />,
        );
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'ca' } });
        expect(container.querySelector('.ds-predictive-search__empty')).toBeNull();
        expect(container.querySelector('.ds-predictive-search__loading')).toBeInTheDocument();
        act(() => vi.advanceTimersByTime(200));
        expect(container.querySelector('.ds-predictive-search__loading')).toBeNull();
        expect(container.querySelector('.ds-predictive-search__empty')).toBeInTheDocument();
      } finally {
        vi.useRealTimers();
      }
    });

    // Round 5: results left from the previous query were announced for the
    // new one before it had been searched ("1 product found" for "zz").
    it('does not announce results left over from the previous query', () => {
      vi.useFakeTimers();
      try {
        function Search() {
          const [results, setResults] = useState<SearchResult[]>([]);
          return (
            <PredictiveSearch
              debounce={200}
              results={results}
              onSearch={(q) => setResults(MOCK_RESULTS.filter((r) => r.title.toLowerCase().includes(q)))}
            />
          );
        }
        const { container } = render(<Search />);
        const live = container.querySelector('[aria-live="polite"]') as HTMLElement;
        const input = screen.getByRole('combobox');
        fireEvent.change(input, { target: { value: 'canvas' } });
        act(() => vi.advanceTimersByTime(200));
        expect(live).toHaveTextContent('1 product found');
        fireEvent.change(input, { target: { value: '' } });
        fireEvent.change(input, { target: { value: 'zz' } });
        // Still showing the Canvas Tote, but "zz" hasn't been searched
        expect(live.textContent).toBe('');
        act(() => vi.advanceTimersByTime(200));
        expect(live).toHaveTextContent('No results for zz');
      } finally {
        vi.useRealTimers();
      }
    });
  });

  // ─── Selection ──────────────────────────────────────────

  describe('selection', () => {
    it('calls onSelect when a result is clicked', async () => {
      const onSelect = vi.fn();
      const user = userEvent.setup();
      render(
        <PredictiveSearch onSearch={noop} results={MOCK_RESULTS} onSelect={onSelect} debounce={0} />,
      );
      await user.type(screen.getByRole('combobox'), 'to');
      await user.click(screen.getByText('Canvas Tote'));

      expect(onSelect).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'p1', title: 'Canvas Tote' }),
      );
    });

    it('calls onViewAll when footer link is clicked', async () => {
      const onViewAll = vi.fn();
      const user = userEvent.setup();
      render(
        <PredictiveSearch
          onSearch={noop}
          results={MOCK_RESULTS}
          onViewAll={onViewAll}
          debounce={0}
        />,
      );
      await user.type(screen.getByRole('combobox'), 'to');
      await user.click(screen.getByText(/View all results/));

      expect(onViewAll).toHaveBeenCalledWith('to');
    });
  });

  // ─── Keyboard navigation ───────────────────────────────

  describe('keyboard navigation', () => {
    async function setupKeyboard() {
      const onSelect = vi.fn();
      const user = userEvent.setup();
      render(
        <PredictiveSearch
          onSearch={noop}
          results={MOCK_RESULTS}
          onSelect={onSelect}
          debounce={0}
        />,
      );
      await user.type(screen.getByRole('combobox'), 'to');
      return { user, onSelect };
    }

    it('ArrowDown highlights first option', async () => {
      const { user } = await setupKeyboard();
      await user.keyboard('{ArrowDown}');

      const input = screen.getByRole('combobox');
      expect(input.getAttribute('aria-activedescendant')).toBeTruthy();
      const activeOption = document.getElementById(input.getAttribute('aria-activedescendant')!);
      expect(activeOption).toHaveAttribute('aria-selected', 'true');
    });

    it('ArrowDown moves to next option', async () => {
      const { user } = await setupKeyboard();
      await user.keyboard('{ArrowDown}{ArrowDown}');

      const input = screen.getByRole('combobox');
      const activeId = input.getAttribute('aria-activedescendant')!;
      const activeOption = document.getElementById(activeId);
      expect(activeOption).toHaveTextContent('Linen Shirt');
    });

    it('ArrowUp moves to previous option', async () => {
      const { user } = await setupKeyboard();
      await user.keyboard('{ArrowDown}{ArrowDown}{ArrowUp}');

      const input = screen.getByRole('combobox');
      const activeId = input.getAttribute('aria-activedescendant')!;
      const activeOption = document.getElementById(activeId);
      expect(activeOption).toHaveTextContent('Canvas Tote');
    });

    it('ArrowUp wraps to last option', async () => {
      const { user } = await setupKeyboard();
      await user.keyboard('{ArrowDown}{ArrowUp}');

      const input = screen.getByRole('combobox');
      const activeId = input.getAttribute('aria-activedescendant')!;
      const activeOption = document.getElementById(activeId);
      expect(activeOption).toHaveTextContent('Style Guide');
    });

    it('ArrowDown wraps from the last option to the first', async () => {
      const { user } = await setupKeyboard();
      await user.keyboard('{ArrowDown}{End}{ArrowDown}');

      const input = screen.getByRole('combobox');
      const activeId = input.getAttribute('aria-activedescendant')!;
      expect(document.getElementById(activeId)).toHaveTextContent('Canvas Tote');
    });

    it('Tab closes the list (focus moves on, suggestions do not linger)', async () => {
      const { user } = await setupKeyboard();
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
      await user.keyboard('{Tab}');
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
    });

    it('Enter on highlighted option calls onSelect', async () => {
      const { user, onSelect } = await setupKeyboard();
      await user.keyboard('{ArrowDown}{Enter}');

      expect(onSelect).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'p1', title: 'Canvas Tote' }),
      );
    });

    it('Escape closes dropdown', async () => {
      const { user } = await setupKeyboard();
      await user.keyboard('{Escape}');

      expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
    });

    // Regression (keyboard audit, real browser): one Escape closed the list
    // AND cleared the query. Browsers flush React's update from the window
    // capture listener before React's own handler runs, so that handler saw
    // a closed list and cleared. flushSync in a later capture listener
    // reproduces the browser's ordering in jsdom.
    it('first Escape closes the list and keeps the query; the second clears', async () => {
      const { user } = await setupKeyboard();
      const flush = (e: KeyboardEvent) => {
        if (e.key === 'Escape') flushSync(() => {});
      };
      window.addEventListener('keydown', flush, true);
      try {
        await user.keyboard('{Escape}');
        const input = screen.getByRole('combobox');
        expect(input).toHaveAttribute('aria-expanded', 'false');
        expect(input).not.toHaveValue('');

        await user.keyboard('{Escape}');
        expect(input).toHaveValue('');
      } finally {
        window.removeEventListener('keydown', flush, true);
      }
    });

    it('Home moves to first option', async () => {
      const { user } = await setupKeyboard();
      await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{Home}');

      const input = screen.getByRole('combobox');
      const activeId = input.getAttribute('aria-activedescendant')!;
      const activeOption = document.getElementById(activeId);
      expect(activeOption).toHaveTextContent('Canvas Tote');
    });

    it('End moves to last option', async () => {
      const { user } = await setupKeyboard();
      await user.keyboard('{ArrowDown}{End}');

      const input = screen.getByRole('combobox');
      const activeId = input.getAttribute('aria-activedescendant')!;
      const activeOption = document.getElementById(activeId);
      expect(activeOption).toHaveTextContent('Style Guide');
    });
  });

  // ─── Accessibility ──────────────────────────────────────

  describe('accessibility', () => {
    it('aria-expanded reflects open state', async () => {
      const user = userEvent.setup();
      render(<PredictiveSearch onSearch={noop} results={MOCK_RESULTS} debounce={0} />);
      const input = screen.getByRole('combobox');

      expect(input).toHaveAttribute('aria-expanded', 'false');
      await user.type(input, 'to');
      expect(input).toHaveAttribute('aria-expanded', 'true');
    });

    it('aria-controls points to listbox', () => {
      render(<PredictiveSearch onSearch={noop} />);
      const input = screen.getByRole('combobox');
      const listboxId = input.getAttribute('aria-controls');
      expect(listboxId).toBeTruthy();
      expect(document.getElementById(listboxId!)).toBeInTheDocument();
    });

    it('has aria-autocomplete="list"', () => {
      render(<PredictiveSearch onSearch={noop} />);
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-autocomplete', 'list');
    });

    it('adds aria-label with full text (and price) to result options', async () => {
      const user = userEvent.setup();
      render(
        <PredictiveSearch onSearch={noop} results={MOCK_RESULTS} debounce={0} />,
      );
      await user.type(screen.getByRole('combobox'), 'to');

      expect(
        screen.getByRole('option', { name: 'Canvas Tote, $48.00' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', {
          name: 'Linen Shirt, $89.00, was $112.00',
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: 'Summer Collection' }),
      ).toBeInTheDocument();
    });

    it('has no axe violations (default state)', async () => {
      const { container } = render(<PredictiveSearch onSearch={noop} />);
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no axe violations (with results)', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <PredictiveSearch onSearch={noop} results={MOCK_RESULTS} debounce={0} />,
      );
      await user.type(screen.getByRole('combobox'), 'to');
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no axe violations (loading state)', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <PredictiveSearch onSearch={noop} loading={true} debounce={0} />,
      );
      await user.type(screen.getByRole('combobox'), 'to');
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no axe violations (empty results)', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <PredictiveSearch onSearch={noop} results={[]} debounce={0} />,
      );
      await user.type(screen.getByRole('combobox'), 'to');
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  // ─── Size variants ──────────────────────────────────────

  describe('size variants', () => {
    it.each(['sm', 'md', 'lg'] as const)('applies %s size class', (size) => {
      const { container } = render(<PredictiveSearch onSearch={noop} size={size} />);
      expect(
        container.querySelector(`.ds-predictive-search__input--${size}`),
      ).toBeInTheDocument();
    });
  });

  // ─── Regressions ───────────────────────────────────────

  describe('regressions', () => {
    it('does not re-fire onSearch when an inline callback changes identity', async () => {
      // Bug: onSearch sat in the debounce effect deps. An inline arrow plus
      // the consumer's own setResults re-render re-armed the timer every
      // time — an endless search loop (10 calls in 1.5s).
      vi.useFakeTimers();
      try {
        const spy = vi.fn();
        function Parent() {
          const [results, setResults] = useState<SearchResult[]>([]);
          return (
            <PredictiveSearch
              debounce={100}
              results={results}
              onSearch={(q) => {
                spy(q);
                setResults([...MOCK_RESULTS]); // fresh array, like a real fetch
              }}
            />
          );
        }
        render(<Parent />);
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'to' } });
        for (let i = 0; i < 10; i++) {
          await act(async () => {
            vi.advanceTimersByTime(150);
          });
        }
        expect(spy).toHaveBeenCalledTimes(1);
      } finally {
        vi.useRealTimers();
      }
    });

    it('lets Enter submit an enclosing form when nothing is highlighted', async () => {
      // Bug: Enter was always preventDefault-ed while the dropdown was open,
      // so <form action="/search"> never submitted without onViewAll.
      const user = userEvent.setup();
      const onSubmit = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
      render(
        <form onSubmit={onSubmit}>
          <PredictiveSearch onSearch={noop} results={MOCK_RESULTS} debounce={0} />
        </form>,
      );
      await user.type(screen.getByRole('combobox'), 'to');
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      await user.keyboard('{Enter}');
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('never points aria-activedescendant at a missing option', async () => {
      // Bug: the highlighted index outlived a shrinking result set.
      const user = userEvent.setup();
      const { rerender } = render(
        <PredictiveSearch onSearch={noop} results={MOCK_RESULTS} debounce={0} />,
      );
      await user.type(screen.getByRole('combobox'), 'to');
      await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
      rerender(
        <PredictiveSearch onSearch={noop} results={MOCK_RESULTS.slice(0, 1)} debounce={0} />,
      );
      const input = screen.getByRole('combobox');
      const activeId = input.getAttribute('aria-activedescendant');
      if (activeId) expect(document.getElementById(activeId)).not.toBeNull();

      rerender(<PredictiveSearch onSearch={noop} results={MOCK_RESULTS} loading debounce={0} />);
      expect(input).not.toHaveAttribute('aria-activedescendant');
    });

    it('keeps aria-controls resolvable while loading and with no results', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<PredictiveSearch onSearch={noop} loading debounce={0} />);
      await user.type(screen.getByRole('combobox'), 'to');
      const input = screen.getByRole('combobox');
      expect(document.getElementById(input.getAttribute('aria-controls')!)).not.toBeNull();

      rerender(<PredictiveSearch onSearch={noop} results={[]} debounce={0} />);
      expect(document.getElementById(input.getAttribute('aria-controls')!)).not.toBeNull();
    });

    it('Escape inside a Drawer closes the suggestions, not the drawer', async () => {
      // Bug: Radix handles Escape in the document capture phase, before the
      // input's handler — the whole search drawer closed instead.
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(
        <Drawer open onOpenChange={onOpenChange} title="Search">
          <PredictiveSearch onSearch={noop} results={MOCK_RESULTS} debounce={0} />
        </Drawer>,
      );
      await user.type(screen.getByRole('combobox'), 'to');
      await user.keyboard('{Escape}');
      expect(onOpenChange).not.toHaveBeenCalled();
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');

      // A second Escape (suggestions already closed) reaches the drawer
      await user.keyboard('{Escape}');
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('closes on a touch pointerdown outside', async () => {
      // Bug: listened for mousedown only — iOS Safari doesn't synthesize it
      // for taps on non-clickable content, so the dropdown stayed open.
      const user = userEvent.setup();
      render(
        <div>
          <span>Outside</span>
          <PredictiveSearch onSearch={noop} results={MOCK_RESULTS} debounce={0} />
        </div>,
      );
      await user.type(screen.getByRole('combobox'), 'to');
      fireEvent.pointerDown(screen.getByText('Outside'), { pointerType: 'touch' });
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
    });

    it('removes its document pointerdown listener when it unmounts', async () => {
      const add = vi.spyOn(document, 'addEventListener');
      const remove = vi.spyOn(document, 'removeEventListener');
      const user = userEvent.setup();
      const { unmount } = render(<PredictiveSearch onSearch={noop} results={MOCK_RESULTS} debounce={0} />);
      await user.type(screen.getByRole('combobox'), 'to');
      const added = add.mock.calls.filter(([type]) => type === 'pointerdown').map(([, fn]) => fn);
      expect(added.length).toBeGreaterThan(0);
      unmount();
      const removed = remove.mock.calls.filter(([type]) => type === 'pointerdown').map(([, fn]) => fn);
      added.forEach((fn) => expect(removed).toContain(fn));
      add.mockRestore();
      remove.mockRestore();
    });

    it('keeps focus on the input after a mouse selection', async () => {
      const user = userEvent.setup();
      render(<PredictiveSearch onSearch={noop} results={MOCK_RESULTS} debounce={0} />);
      await user.type(screen.getByRole('combobox'), 'to');
      await user.click(screen.getByText('Summer Collection'));
      expect(screen.getByRole('combobox')).toHaveFocus();
    });

    it('ignores Enter while an IME composition is open', async () => {
      const onSelect = vi.fn();
      const user = userEvent.setup();
      render(
        <PredictiveSearch onSearch={noop} results={MOCK_RESULTS} onSelect={onSelect} debounce={0} />,
      );
      await user.type(screen.getByRole('combobox'), 'to');
      await user.keyboard('{ArrowDown}');
      fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter', isComposing: true });
      expect(onSelect).not.toHaveBeenCalled();
    });
  });

  // ─── Render cost (performance) ────────────────────────────

  describe('render cost', () => {
    it('renders once per hovered option and reuses one price formatter', async () => {
      const user = userEvent.setup();
      let renders = 0;
      render(
        <Profiler id="search" onRender={() => renders++}>
          <PredictiveSearch onSearch={noop} results={MOCK_RESULTS} debounce={0} />
        </Profiler>,
      );
      await user.type(screen.getByRole('combobox'), 'to');
      const options = screen.getAllByRole('option');
      const NumberFormat = vi.spyOn(Intl, 'NumberFormat');
      renders = 0;
      options.forEach((option) => fireEvent.mouseEnter(option));
      // Was 2 per hover: the announcement effect depended on a `groups`
      // array rebuilt every render, and its setState re-rendered the list.
      expect(renders).toBe(options.length);
      // Was 2–3 new Intl.NumberFormat per product result on every render.
      expect(NumberFormat).not.toHaveBeenCalled();
      NumberFormat.mockRestore();
    });
  });
});
