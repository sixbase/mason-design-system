import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
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

    it('shows compare-at price with strikethrough', async () => {
      await openWithResults();
      const comparePrice = screen.getByText('$112.00');
      expect(comparePrice.closest('.ds-predictive-search__result-compare')).toBeInTheDocument();
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
});
