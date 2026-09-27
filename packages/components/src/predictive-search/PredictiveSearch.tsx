import { forwardRef, useCallback, useEffect, useId, useRef, useState } from 'react';
import type { HTMLAttributes } from 'react';
import { Search, X } from '../icon';
import { Skeleton } from '../skeleton/Skeleton';
import { Text } from '../typography/Typography';
import { formatMoney } from '../internal/format-money';
import './PredictiveSearch.css';

// ─── Types ──────────────────────────────────────────────────

export type SearchResultType = 'product' | 'collection' | 'page' | 'article';
/** Input height step — same scale as `InputSize`. */
export type PredictiveSearchSize = 'sm' | 'md' | 'lg';

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
  /**
   * Format price from cents for display. Overrides `currency`/`locale`;
   * the default formats with them (was USD + en-US, hardcoded).
   */
  formatPrice?: (cents: number) => string;
  /** ISO 4217 currency code for result prices (default `'USD'`) */
  currency?: string;
  /** BCP 47 locale for result prices (default `'en-US'`) */
  locale?: string;
  /** Accessible label for the search input (visually hidden) */
  label?: string;
  /** Size of the input */
  size?: PredictiveSearchSize;
}

// ─── Helpers ────────────────────────────────────────────────

const GROUP_LABELS: Record<SearchResultType, string> = {
  product: 'Products',
  collection: 'Collections',
  page: 'Pages',
  article: 'Articles',
};

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
 *   // Encode the query: raw, "a&type=page" or "#" rewrites the search URL
 *   onViewAll={(q) => navigate(`/search?q=${encodeURIComponent(q)}`)}
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
      formatPrice: formatPriceProp,
      currency = 'USD',
      locale,
      label = 'Search',
      size = 'md',
      className,
      ...props
    },
    ref,
  ) {
    // Used only while rendering results (never an effect dependency), so a
    // fresh closure per render costs nothing; the Intl instance is cached
    // (internal/format-money) — it runs 2–3× per result on every keystroke.
    const formatPrice = formatPriceProp ?? ((cents: number) => formatMoney(cents, currency, locale));
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [announcement, setAnnouncement] = useState('');
    // The query the last onSearch call was made for. Until the debounce
    // fires, the results on screen belong to an older query (or none).
    const [searchedQuery, setSearchedQuery] = useState('');

    const internalInputRef = useRef<HTMLInputElement | null>(null);
    const rootRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>();
    // Latest-ref for onSearch: consumers commonly pass an inline arrow
    // (see the @example above). With onSearch in the debounce effect's
    // deps, every parent re-render — including the one the consumer
    // triggers by storing results — re-armed the timer and searched again,
    // looping forever. The ref keeps the call current without re-arming.
    const onSearchRef = useRef(onSearch);
    onSearchRef.current = onSearch;

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
    // What is typed hasn't been searched yet (the debounce is still
    // pending). An empty list then means "not asked", not "nothing found":
    // every first search used to show "No results for “ca” — Try a
    // different search term" for the whole debounce before results arrived.
    const awaitingSearch = showDropdown && searchedQuery !== query;
    const showSkeleton = loading || (awaitingSearch && !hasResults);
    const showListbox = showDropdown && !loading && hasResults;
    // The stored index can outlive the results it pointed at (results
    // shrink after a late fetch, or the list is swapped for the loading
    // skeleton). Resolve it against what is actually rendered so
    // aria-activedescendant never references a missing option.
    const currentIndex = showListbox && activeIndex < flat.length ? activeIndex : -1;

    // ─── Debounced search ─────────────────────────────────
    useEffect(() => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (query.length >= minChars) {
        debounceRef.current = setTimeout(() => {
          setSearchedQuery(query);
          onSearchRef.current(query);
        }, debounce);
      }

      return () => {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
      };
    }, [query, minChars, debounce]);

    // ─── Announce results ─────────────────────────────────
    // Keyed on the summary TEXT, not the `groups` array: groupResults()
    // builds a new array every render, so every hover and arrow key re-ran
    // this effect and its setState forced a second render of the whole list.
    const resultSummary = groups
      .map((g) => `${g.items.length} ${g.items.length === 1 ? g.type : `${g.type}s`}`)
      .join(', ');
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
        // Only once this exact query has been searched. During the debounce
        // the list is empty because nothing has run yet, and every keystroke
        // announced "No results for c", "No results for ca", … before the
        // search had even started.
        if (searchedQuery === query) setAnnouncement(`No results for ${query}`);
        return;
      }

      // Results still on screen from the previous query are not news while
      // this one waits for its debounce: after clearing "card" and typing
      // "zz", "1 product found" was read for results that didn't match.
      if (flat.length > 0 && searchedQuery === query) {
        setAnnouncement(`${resultSummary} found`);
      }
    }, [flat.length, resultSummary, loading, query, searchedQuery, minChars, showDropdown]);

    // ─── Click outside ────────────────────────────────────
    // pointerdown, not mousedown: iOS Safari only synthesizes mouse events
    // for taps on "clickable" elements, so a tap on plain page content
    // never reached a mousedown listener and the dropdown stayed open.
    useEffect(() => {
      if (!isOpen) return;
      function handlePointerDownOutside(e: PointerEvent) {
        if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
          setIsOpen(false);
          setActiveIndex(-1);
        }
      }

      document.addEventListener('pointerdown', handlePointerDownOutside);
      return () => document.removeEventListener('pointerdown', handlePointerDownOutside);
    }, [isOpen]);

    // ─── Escape inside a parent overlay ───────────────────
    // Radix Dialog/Drawer handle Escape on document in the capture phase —
    // before this input's own keydown handler ever runs — so an Escape
    // meant to close the suggestions closed the whole search drawer.
    // A window-level capture listener runs first; preventDefault marks the
    // key as consumed, which Radix layers respect.
    useEffect(() => {
      if (!showDropdown) return;
      function handleEscapeCapture(e: KeyboardEvent) {
        if (e.key !== 'Escape' || e.target !== internalInputRef.current) return;
        e.preventDefault();
        setIsOpen(false);
        setActiveIndex(-1);
      }

      window.addEventListener('keydown', handleEscapeCapture, true);
      return () => window.removeEventListener('keydown', handleEscapeCapture, true);
    }, [showDropdown]);

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
      // Keys pressed while an IME composition is open (CJK input) belong to
      // the composition — Enter commits the text, it must not select.
      // keyCode 229 covers Safari, which reports isComposing=false there.
      if (e.nativeEvent.isComposing || e.keyCode === 229) return;

      if (!showDropdown) {
        if (e.key === 'ArrowDown' && query.length >= minChars) {
          e.preventDefault();
          setIsOpen(true);
          if (hasResults) setActiveIndex(0);
        }
        // APG combobox: the first Escape closes the popup, a second one
        // clears. In a real browser the window capture listener above closes
        // the list and React re-renders before this handler runs (microtasks
        // flush between listeners), so the same keypress arrived here as
        // "closed" and wiped the query too. It already consumed the key.
        if (e.key === 'Escape' && query && !e.nativeEvent.defaultPrevented) {
          e.preventDefault();
          handleClear();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          if (!showListbox) return;
          setActiveIndex(currentIndex < flat.length - 1 ? currentIndex + 1 : 0);
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          if (!showListbox) return;
          setActiveIndex(currentIndex > 0 ? currentIndex - 1 : flat.length - 1);
          break;
        }
        case 'Home': {
          e.preventDefault();
          if (showListbox) setActiveIndex(0);
          break;
        }
        case 'End': {
          e.preventDefault();
          if (showListbox) setActiveIndex(flat.length - 1);
          break;
        }
        case 'Enter': {
          const activeResult = currentIndex >= 0 ? flat[currentIndex] : undefined;
          if (activeResult) {
            e.preventDefault();
            handleSelect(activeResult);
          } else if (onViewAll) {
            e.preventDefault();
            onViewAll(query);
            setIsOpen(false);
          }
          // Otherwise leave Enter alone: a search input inside
          // <form action="/search"> must still submit natively.
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
      currentIndex >= 0 ? `${baseId}-option-${currentIndex}` : undefined;

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
          <div
            className="ds-predictive-search__dropdown"
            // Keep DOM focus on the input (combobox pattern): without this,
            // pressing on a non-focusable option blurred the input and
            // dropped focus to <body> after a mouse selection. The handler
            // only catches bubbled presses — the wrapper itself is not
            // interactive, hence role="presentation".
            role="presentation"
            onMouseDown={(e) => e.preventDefault()}
          >
            {showSkeleton ? (
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
                        const isActive = currentIndex === item._flatIndex;
                        const itemClasses = [
                          'ds-predictive-search__result',
                          isActive && 'ds-predictive-search__result--active',
                        ]
                          .filter(Boolean)
                          .join(' ');

                        // Full text for assistive tech — the visible title is
                        // truncated with an ellipsis on narrow widths
                        const ariaLabel =
                          item.type === 'product' && item.price != null
                            ? `${item.title}, ${formatPrice(item.price)}${
                                item.compareAtPrice != null
                                  ? `, was ${formatPrice(item.compareAtPrice)}`
                                  : ''
                              }`
                            : item.title;

                        return (
                          <li
                            key={item.id}
                            id={`${baseId}-option-${item._flatIndex}`}
                            role="option"
                            aria-selected={isActive}
                            aria-label={ariaLabel}
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
                                <div
                                  className={[
                                    'ds-predictive-search__result-price',
                                    item.compareAtPrice != null &&
                                      'ds-predictive-search__result-price--sale',
                                  ]
                                    .filter(Boolean)
                                    .join(' ')}
                                >
                                  <Text
                                    size="sm"
                                    weight="medium"
                                    className="ds-predictive-search__result-current"
                                  >
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

        {/* Placeholder listbox whenever the real one isn't rendered (closed,
            loading, no results) so aria-controls never dangles */}
        {!showListbox && (
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
