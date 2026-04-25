import { forwardRef, useCallback, useEffect, useId, useRef, useState } from 'react';
import type { HTMLAttributes } from 'react';
import { Search, X } from '../icon';
import { Skeleton } from '../skeleton/Skeleton';
import { Text } from '../typography/Typography';
import './PredictiveSearch.css';

// ─── Types ──────────────────────────────────────────────────

export type SearchResultType = 'product' | 'collection' | 'page' | 'article';

export interface SearchResult {
  /** Type of result */
  type: SearchResultType;
  /** Unique identifier */
  id: string;
  /** Display title */
  title: string;
  /** Navigation URL */
  url: string;
  /** Thumbnail image URL (products only) */
  image?: string;
  /** Price in cents (products only) */
  price?: number;
  /** Compare-at price in cents for sale items (products only) */
  compareAtPrice?: number;
}

export interface PredictiveSearchProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect' | 'results'> {
  /** Called when the user types (after debounce). Consumer fetches data and passes back via `results`. */
  onSearch: (query: string) => void;
  /** Search results to display, grouped by type */
  results?: SearchResult[];
  /** Called when a result is selected (click or Enter) */
  onSelect?: (result: SearchResult) => void;
  /** Input placeholder */
  placeholder?: string;
  /** Max results shown per type group */
  maxResults?: number;
  /** Which result types to show and in what order */
  showTypes?: SearchResultType[];
  /** Whether results are currently loading */
  loading?: boolean;
  /** Debounce delay in ms */
  debounce?: number;
  /** Minimum characters before triggering search */
  minChars?: number;
  /** Called when "View all results" footer link is clicked */
  onViewAll?: (query: string) => void;
  /** Format price from cents for display */
  formatPrice?: (cents: number) => string;
  /** Accessible label for the search input (visually hidden) */
  label?: string;
  /** Size of the input */
  size?: 'sm' | 'md' | 'lg';
}

// ─── Helpers ────────────────────────────────────────────────

const GROUP_LABELS: Record<SearchResultType, string> = {
  product: 'Products',
  collection: 'Collections',
  page: 'Pages',
  article: 'Articles',
};

function defaultFormatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

interface FlatResult extends SearchResult {
  _flatIndex: number;
}

interface ResultGroup {
  type: SearchResultType;
  items: FlatResult[];
}

function groupResults(
  results: SearchResult[],
  showTypes: SearchResultType[],
  maxResults: number,
): { groups: ResultGroup[]; flat: FlatResult[] } {
  const flat: FlatResult[] = [];
  const groups: ResultGroup[] = [];

  for (const type of showTypes) {
    const items = results
      .filter((r) => r.type === type)
      .slice(0, maxResults)
      .map((r) => {
        const item: FlatResult = { ...r, _flatIndex: flat.length };
        flat.push(item);
        return item;
      });

    if (items.length > 0) {
      groups.push({ type, items });
    }
  }

  return { groups, flat };
}

// ─── Component ──────────────────────────────────────────────

/**
 * PredictiveSearch
 *
 * Live search results as the user types. Dropdown below the input shows
 * products, collections, pages, and articles grouped by type. Implements
 * the WAI-ARIA combobox pattern with listbox popup.
 *
 * The component handles debouncing and UI state internally. Data fetching
 * is the consumer's responsibility via the `onSearch` callback.
 *
 * @example
 * <PredictiveSearch
 *   onSearch={(q) => fetchResults(q)}
 *   results={results}
 *   loading={isLoading}
 *   onSelect={(r) => navigate(r.url)}
 *   onViewAll={(q) => navigate(`/search?q=${q}`)}
 * />
 */
export const PredictiveSearch = forwardRef<HTMLInputElement, PredictiveSearchProps>(
  function PredictiveSearch(
    {
      onSearch,
      results = [],
      onSelect,
      placeholder = 'Search products\u2026',
      maxResults = 4,
      showTypes = ['product', 'collection', 'page', 'article'],
      loading = false,
      debounce = 300,
      minChars = 2,
      onViewAll,
      formatPrice = defaultFormatPrice,
      label = 'Search',
      size = 'md',
      className,
      ...props
    },
    ref,
  ) {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [announcement, setAnnouncement] = useState('');

    const internalInputRef = useRef<HTMLInputElement | null>(null);
    const rootRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>();

    // Merge forwarded ref with internal ref
    const setInputRef = useCallback(
      (node: HTMLInputElement | null) => {
        internalInputRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );

    const baseId = useId();
    const inputId = `${baseId}-input`;
    const listboxId = `${baseId}-listbox`;

    const { groups, flat } = groupResults(results, showTypes, maxResults);
    const hasResults = flat.length > 0;
    const showDropdown = isOpen && query.length >= minChars;

    // ─── Debounced search ─────────────────────────────────
    useEffect(() => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (query.length >= minChars) {
        debounceRef.current = setTimeout(() => {
          onSearch(query);
        }, debounce);
      }

      return () => {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
      };
    }, [query, minChars, debounce, onSearch]);

    // ─── Announce results ─────────────────────────────────
    useEffect(() => {
      if (!showDropdown) {
        setAnnouncement('');
        return;
      }

      if (loading) {
        setAnnouncement('Loading results');
        return;
      }

      if (flat.length === 0 && query.length >= minChars) {
        setAnnouncement(`No results for ${query}`);
        return;
      }

      if (flat.length > 0) {
        const parts = groups.map(
          (g) => `${g.items.length} ${g.items.length === 1 ? g.type : `${g.type}s`}`,
        );
        setAnnouncement(`${parts.join(', ')} found`);
      }
    }, [flat.length, groups, loading, query, minChars, showDropdown]);

    // ─── Click outside ────────────────────────────────────
    useEffect(() => {
      function handleClickOutside(e: MouseEvent) {
        if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
          setIsOpen(false);
          setActiveIndex(-1);
        }
      }

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ─── Handlers ─────────────────────────────────────────
    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const value = e.target.value;
      setQuery(value);
      setActiveIndex(-1);

      if (value.length >= minChars) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    }

    function handleFocus() {
      if (query.length >= minChars) {
        setIsOpen(true);
      }
    }

    function handleClear() {
      setQuery('');
      setIsOpen(false);
      setActiveIndex(-1);
      internalInputRef.current?.focus();
    }

    function handleSelect(result: SearchResult) {
      onSelect?.(result);
      setIsOpen(false);
      setActiveIndex(-1);
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
      if (!showDropdown) {
        if (e.key === 'ArrowDown' && query.length >= minChars) {
          e.preventDefault();
          setIsOpen(true);
          if (hasResults) setActiveIndex(0);
        }
        if (e.key === 'Escape' && query) {
          e.preventDefault();
          handleClear();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          if (!hasResults) return;
          setActiveIndex((prev) => (prev < flat.length - 1 ? prev + 1 : 0));
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          if (!hasResults) return;
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : flat.length - 1));
          break;
        }
        case 'Home': {
          e.preventDefault();
          if (hasResults) setActiveIndex(0);
          break;
        }
        case 'End': {
          e.preventDefault();
          if (hasResults) setActiveIndex(flat.length - 1);
          break;
        }
        case 'Enter': {
          e.preventDefault();
          const activeResult = activeIndex >= 0 ? flat[activeIndex] : undefined;
          if (activeResult) {
            handleSelect(activeResult);
          } else if (onViewAll) {
            onViewAll(query);
            setIsOpen(false);
          }
          break;
        }
        case 'Escape': {
          e.preventDefault();
          setIsOpen(false);
          setActiveIndex(-1);
          break;
        }
        case 'Tab': {
          setIsOpen(false);
          setActiveIndex(-1);
          break;
        }
      }
    }

    // ─── Class assembly ───────────────────────────────────
    const rootClasses = ['ds-predictive-search', className].filter(Boolean).join(' ');

    const wrapperClasses = [
      'ds-predictive-search__input-wrapper',
      query && 'ds-predictive-search__input-wrapper--has-clear',
    ]
      .filter(Boolean)
      .join(' ');

    const inputClasses = [
      'ds-predictive-search__input',
      `ds-predictive-search__input--${size}`,
    ]
      .filter(Boolean)
      .join(' ');

    const activeOptionId =
      activeIndex >= 0 ? `${baseId}-option-${activeIndex}` : undefined;

    // ─── Render ───────────────────────────────────────────
    return (
      <div ref={rootRef} className={rootClasses} {...props}>
        <label htmlFor={inputId} className="ds-sr-only">
          {label}
        </label>

        <div className={wrapperClasses}>
          <span className="ds-predictive-search__icon" aria-hidden="true">
            <Search size="sm" />
          </span>

          <input
            ref={setInputRef}
            id={inputId}
            type="search"
            role="combobox"
            className={inputClasses}
            placeholder={placeholder}
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            aria-expanded={showDropdown}
            aria-controls={listboxId}
            aria-activedescendant={activeOptionId}
            aria-autocomplete="list"
            aria-haspopup="listbox"
            autoComplete="off"
          />

          {query && (
            <button
              type="button"
              className="ds-predictive-search__clear"
              aria-label="Clear search"
              onClick={handleClear}
            >
              <X size="sm" />
            </button>
          )}
        </div>

        {showDropdown && (
          <div className="ds-predictive-search__dropdown">
            {loading ? (
              <div
                className="ds-predictive-search__loading"
                aria-busy="true"
                aria-label="Loading results"
                role="status"
              >
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="ds-predictive-search__skeleton-row">
                    <Skeleton variant="rectangular" width={48} height={48} />
                    <div className="ds-predictive-search__skeleton-text">
                      <Skeleton variant="text" width="70%" />
                      <Skeleton variant="text" width="40%" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !hasResults ? (
              <div className="ds-predictive-search__empty">
                <Text size="sm" muted>
                  No results for &ldquo;{query}&rdquo;
                </Text>
                <Text size="sm" muted>
                  Try a different search term
                </Text>
              </div>
            ) : (
              <ul
                id={listboxId}
                role="listbox"
                className="ds-predictive-search__results"
                aria-label={`${label} results`}
              >
                {groups.map((group) => (
                  <li key={group.type} role="presentation" className="ds-predictive-search__group">
                    <div className="ds-predictive-search__group-label" role="presentation">
                      {GROUP_LABELS[group.type]}
                    </div>
                    <ul
                      role="group"
                      aria-label={GROUP_LABELS[group.type]}
                      className="ds-predictive-search__group-list"
                    >
                      {group.items.map((item) => {
                        const isActive = activeIndex === item._flatIndex;
                        const itemClasses = [
                          'ds-predictive-search__result',
                          isActive && 'ds-predictive-search__result--active',
                        ]
                          .filter(Boolean)
                          .join(' ');

                        return (
                          <li
                            key={item.id}
                            id={`${baseId}-option-${item._flatIndex}`}
                            role="option"
                            aria-selected={isActive}
                            className={itemClasses}
                            onClick={() => handleSelect(item)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSelect(item);
                            }}
                            onMouseEnter={() => setActiveIndex(item._flatIndex)}
                          >
                            {item.type === 'product' && item.image && (
                              <img
                                className="ds-predictive-search__thumbnail"
                                src={item.image}
                                alt=""
                                loading="lazy"
                              />
                            )}
                            <div className="ds-predictive-search__result-content">
                              <Text
                                size="sm"
                                className="ds-predictive-search__result-title"
                              >
                                {item.title}
                              </Text>
                              {item.type === 'product' && item.price != null && (
                                <div className="ds-predictive-search__result-price">
                                  <Text size="sm" weight="medium">
                                    {formatPrice(item.price)}
                                  </Text>
                                  {item.compareAtPrice != null && (
                                    <Text
                                      size="sm"
                                      muted
                                      className="ds-predictive-search__result-compare"
                                    >
                                      {formatPrice(item.compareAtPrice)}
                                    </Text>
                                  )}
                                </div>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                ))}
              </ul>
            )}

            {!loading && hasResults && onViewAll && (
              <div className="ds-predictive-search__footer">
                <button
                  type="button"
                  className="ds-predictive-search__view-all"
                  onClick={() => {
                    onViewAll(query);
                    setIsOpen(false);
                  }}
                >
                  View all results for &ldquo;{query}&rdquo;
                </button>
              </div>
            )}
          </div>
        )}

        {/* Always render listbox for aria-controls reference when dropdown is closed */}
        {!showDropdown && (
          <ul id={listboxId} role="listbox" className="ds-sr-only" aria-label={`${label} results`} />
        )}

        <div aria-live="polite" aria-atomic="true" className="ds-sr-only">
          {announcement}
        </div>
      </div>
    );
  },
);

PredictiveSearch.displayName = 'PredictiveSearch';
