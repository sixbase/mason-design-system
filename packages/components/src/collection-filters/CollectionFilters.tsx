import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import type { HTMLAttributes, MutableRefObject, ReactNode } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../accordion/Accordion';
import type { AccordionHeadingLevel } from '../accordion/Accordion';
import { Badge } from '../badge/Badge';
import { Button } from '../button/Button';
import { Checkbox } from '../checkbox/Checkbox';
import { Drawer } from '../drawer/Drawer';
import { X } from '../icon';
import { Input } from '../input/Input';
import { Text } from '../typography';
import { currencyDecimals, formatMoney } from '../internal/format-money';
import { useChangeAnnouncement } from '../internal/use-change-announcement';
import './CollectionFilters.css';

// ─── Types ────────────────────────────────────────────────

export interface FilterValue {
  /** Display label */
  label: string;
  /** Value identifier */
  value: string;
  /** Product count for this filter value */
  count?: number;
  /** Whether this value is currently active */
  active?: boolean;
}

export interface Filter {
  /** Unique filter identifier */
  id: string;
  /** Display label (e.g. "Color", "Size", "Price") */
  label: string;
  /** Filter type */
  type: 'list' | 'price_range' | 'boolean';
  /** Available values for list filters */
  values?: FilterValue[];
  /** Minimum price in cents (for price_range) */
  min?: number;
  /** Maximum price in cents (for price_range) */
  max?: number;
  /** Currently active minimum price in cents */
  activeMin?: number;
  /** Currently active maximum price in cents */
  activeMax?: number;
}

export interface CollectionFiltersProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Filter definitions */
  filters: Filter[];
  /** Total number of active filters */
  activeCount: number;
  /**
   * Callback when a filter value changes. For `price_range` filters the value
   * is `[minCents, maxCents]`; a blank max with no `filter.max` is sent as
   * `Infinity` (no upper bound).
   */
  onFilterChange: (filterId: string, value: string | [number, number], active: boolean) => void;
  /** Callback to clear all active filters */
  onClearAll: () => void;
  /** Number of values to show before "Show more" toggle (default: 5) */
  showMoreThreshold?: number;
  /** Label for the mobile filter button (default: "Filters") */
  mobileButtonLabel?: string;
  /** Optional header above the filter groups */
  header?: ReactNode;
  /** Results count for screen reader announcement */
  resultsCount?: number;
  /**
   * Heading level for each filter group's trigger (2–6). Default 3. Match
   * the page outline: directly under the page's h1, pass 2.
   */
  headingLevel?: AccordionHeadingLevel;
  /** ISO 4217 currency for price-range pills and inputs (default `'USD'`) */
  currency?: string;
  /** BCP 47 locale for price-range pills (default `'en-US'`) */
  locale?: string;
}

// ─── Price Range Sub-component ──────────────────────────────

/** Currency + locale for every price the filters show (see internal/format-money). */
interface Money {
  currency: string;
  locale?: string;
}

interface PriceRangeFilterProps {
  filter: Filter;
  onApply: (filterId: string, range: [number, number]) => void;
  money: Money;
}

/**
 * Plain input text for an amount in hundredths, at the currency's own
 * precision: "48.00" for USD, "4800" for JPY (was always 2 decimals, so a
 * yen filter showed "4800.00").
 */
function formatCents(cents: number, decimals: number): string {
  return (cents / 100).toFixed(decimals);
}

/** Input text for a bound — blank when unset or open-ended (Infinity). */
function boundInput(cents: number | undefined, decimals: number): string {
  return cents != null && Number.isFinite(cents) ? formatCents(cents, decimals) : '';
}

/**
 * Pill text for a price range. One-sided ranges get words, not a dangling
 * dash: "–$50.00" reads as negative fifty, "$10.00–" as a typo. Formatted
 * with the filters' currency and locale — it used to hardcode "$", so a
 * euro store showed "Price: $20.00–$150.00".
 */
function priceRangeLabel(min: number | undefined, max: number | undefined, money: Money): string {
  const hasMin = min != null && Number.isFinite(min);
  const hasMax = max != null && Number.isFinite(max);
  const fmt = (cents: number) => formatMoney(cents, money.currency, money.locale);
  if (hasMin && hasMax) return `${fmt(min)}–${fmt(max)}`;
  if (hasMin) return `From ${fmt(min)}`;
  if (hasMax) return `Up to ${fmt(max)}`;
  return 'Any price';
}

function parseDollars(str: string): number | null {
  const num = parseFloat(str);
  if (Number.isNaN(num) || num < 0) return null;
  return Math.round(num * 100);
}

function PriceRangeFilter({ filter, onApply, money }: PriceRangeFilterProps) {
  const decimals = currencyDecimals(money.currency, money.locale);
  const [minInput, setMinInput] = useState(boundInput(filter.activeMin, decimals));
  const [maxInput, setMaxInput] = useState(boundInput(filter.activeMax, decimals));
  const [error, setError] = useState('');

  const handleApply = () => {
    const minVal = minInput ? parseDollars(minInput) : filter.min ?? 0;
    const maxVal = maxInput ? parseDollars(maxInput) : filter.max ?? Infinity;

    if (minVal == null || maxVal == null) {
      setError('Enter valid prices');
      return;
    }
    if (minVal > maxVal) {
      setError('Min must be less than max');
      return;
    }

    setError('');
    // Blank max: fall back to the filter's ceiling, else leave it open.
    // (Falling back to 0 sent an inverted [min, 0] range that matched nothing.)
    onApply(filter.id, [minVal, maxVal]);
  };

  return (
    <div className="ds-collection-filters__price-range">
      <div className="ds-collection-filters__price-inputs">
        <Input
          size="sm"
          label="Min"
          type="number"
          // Step at the currency's precision: the default step of 1 flagged
          // "12.50" as invalid, and 0.01 would allow fractional yen.
          step={10 ** -decimals}
          placeholder={formatCents(filter.min ?? 0, decimals)}
          value={minInput}
          onChange={(e) => setMinInput(e.target.value)}
          aria-label={`Minimum price for ${filter.label}`}
        />
        <span className="ds-collection-filters__price-separator" aria-hidden="true">
          –
        </span>
        <Input
          size="sm"
          label="Max"
          type="number"
          step={10 ** -decimals}
          placeholder={filter.max != null ? formatCents(filter.max, decimals) : ''}
          value={maxInput}
          onChange={(e) => setMaxInput(e.target.value)}
          aria-label={`Maximum price for ${filter.label}`}
        />
      </div>
      {error && (
        <Text as="span" size="sm" className="ds-collection-filters__price-error" role="alert">
          {error}
        </Text>
      )}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={handleApply}
        className="ds-collection-filters__price-apply"
      >
        Apply
      </Button>
    </div>
  );
}

// ─── Filter Value List Sub-component ──────────────────────

interface FilterValueListProps {
  filter: Filter;
  threshold: number;
  onFilterChange: (filterId: string, value: string, active: boolean) => void;
}

function FilterValueList({ filter, threshold, onFilterChange }: FilterValueListProps) {
  const [expanded, setExpanded] = useState(false);
  const values = filter.values ?? [];
  const needsTruncation = values.length > threshold;
  const visible = needsTruncation && !expanded ? values.slice(0, threshold) : values;

  return (
    <div className="ds-collection-filters__value-list" role="group" aria-label={filter.label}>
      {visible.map((fv) => (
        <div key={fv.value} className="ds-collection-filters__value-row">
          <Checkbox
            size="sm"
            label={fv.label}
            checked={fv.active ?? false}
            onCheckedChange={(checked) => {
              onFilterChange(filter.id, fv.value, checked === true);
            }}
            // A zero count disables *adding* the value — but an already
            // active value must stay uncheckable, or the user is stuck.
            disabled={fv.count === 0 && !fv.active}
          />
          {fv.count != null && (
            <Text
              as="span"
              size="sm"
              className="ds-collection-filters__value-count"
              aria-label={`${fv.count} products`}
            >
              ({fv.count})
            </Text>
          )}
        </div>
      ))}
      {needsTruncation && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="ds-collection-filters__show-more"
        >
          {expanded ? 'Show less' : `Show ${values.length - threshold} more`}
        </Button>
      )}
    </div>
  );
}

// ─── Active Filter Pills ──────────────────────────────────

interface FilterPillProps {
  label: string;
  onRemove: () => void;
  /** True once the pill group has finished its first render. */
  groupMounted: MutableRefObject<boolean>;
}

/**
 * One active-filter pill (a remove button). It animates in only when it
 * mounts after the group's first render — a filter just applied. Pills
 * already active when the page renders just show; they used to play the
 * entrance on every page load. Same gate as Accordion's content fade and
 * Tabs' panel rise.
 */
function FilterPill({ label, onRemove, groupMounted }: FilterPillProps) {
  const [enter] = useState(() => groupMounted.current);
  const classes = ['ds-collection-filters__pill', enter && 'ds-collection-filters__pill--enter']
    .filter(Boolean)
    .join(' ');
  return (
    <button
      type="button"
      className={classes}
      onClick={onRemove}
      aria-label={`Remove filter: ${label}`}
    >
      <span className="ds-collection-filters__pill-text">{label}</span>
      <X size="sm" className="ds-collection-filters__pill-icon" />
    </button>
  );
}

interface ActiveFilterPillsProps {
  filters: Filter[];
  onFilterChange: (filterId: string, value: string | [number, number], active: boolean) => void;
  onClearAll: () => void;
  activeCount: number;
  money: Money;
}

function ActiveFilterPills({
  filters,
  onFilterChange,
  onClearAll,
  activeCount,
  money,
}: ActiveFilterPillsProps) {
  // Set after the first commit; pills mounting later animate in (FilterPill).
  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
  }, []);

  // Removing a pill (or Clear all) unmounts the button that had focus, and
  // keyboard focus fell to <body> — the next Tab restarted at the top of the
  // page (WCAG 2.4.3). Remember which pill was pressed; once the consumer's
  // update lands and focus is found lost, move it to the pill now in that
  // slot, else (none left) to the filter panel that is on screen.
  const groupRef = useRef<HTMLDivElement>(null);
  const pendingFocusRef = useRef<{ index: number; root: Element | null } | null>(null);
  const remember = (index: number) => {
    pendingFocusRef.current = {
      index,
      root: groupRef.current?.closest('.ds-collection-filters') ?? null,
    };
  };
  useEffect(() => {
    const pending = pendingFocusRef.current;
    if (!pending) return;
    const focused = document.activeElement;
    if (focused && focused !== document.body) {
      // Still on the pill (consumer hasn't updated yet): keep waiting.
      // Anywhere else: the user moved on — forget it.
      if (!groupRef.current?.contains(focused)) pendingFocusRef.current = null;
      return;
    }
    pendingFocusRef.current = null;
    const pills = groupRef.current?.querySelectorAll<HTMLElement>('.ds-collection-filters__pill');
    if (pills && pills.length > 0) {
      pills[Math.min(pending.index, pills.length - 1)]?.focus();
      return;
    }
    const fallbacks = Array.from(
      pending.root?.querySelectorAll<HTMLElement>(
        '.ds-collection-filters__desktop .ds-accordion__trigger, .ds-collection-filters__mobile-trigger',
      ) ?? [],
    );
    (fallbacks.find((el) => el.getClientRects().length > 0) ?? fallbacks[0])?.focus();
  });

  if (activeCount === 0) return null;

  const activePills: { filterId: string; label: string; value: string }[] = [];

  for (const filter of filters) {
    if (filter.type === 'list' && filter.values) {
      for (const fv of filter.values) {
        if (fv.active) {
          activePills.push({
            filterId: filter.id,
            label: `${filter.label}: ${fv.label}`,
            value: fv.value,
          });
        }
      }
    }
    if (filter.type === 'price_range' && (filter.activeMin != null || filter.activeMax != null)) {
      activePills.push({
        filterId: filter.id,
        label: `${filter.label}: ${priceRangeLabel(filter.activeMin, filter.activeMax, money)}`,
        value: 'price_range',
      });
    }
    if (filter.type === 'boolean' && filter.values) {
      for (const fv of filter.values) {
        if (fv.active) {
          activePills.push({
            filterId: filter.id,
            label: fv.label,
            value: fv.value,
          });
        }
      }
    }
  }

  return (
    <div
      ref={groupRef}
      className="ds-collection-filters__active-pills"
      aria-label="Active filters"
      role="group"
    >
      {activePills.map((pill, index) => (
        <FilterPill
          key={`${pill.filterId}-${pill.value}`}
          label={pill.label}
          groupMounted={mountedRef}
          onRemove={() => {
            remember(index);
            onFilterChange(pill.filterId, pill.value, false);
          }}
        />
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => {
          remember(0);
          onClearAll();
        }}
        aria-label="Clear all filters"
      >
        Clear all
      </Button>
    </div>
  );
}

// ─── Filter Panel Content (shared between desktop & mobile) ─

interface FilterPanelContentProps {
  filters: Filter[];
  activeCount: number;
  onFilterChange: (filterId: string, value: string | [number, number], active: boolean) => void;
  onClearAll: () => void;
  showMoreThreshold: number;
  header?: ReactNode;
  headingLevel: AccordionHeadingLevel;
  money: Money;
  /** Rendered inside the mobile Drawer — pads bottom for the device safe area */
  inDrawer?: boolean;
}

function FilterPanelContent({
  filters,
  activeCount,
  onFilterChange,
  onClearAll,
  showMoreThreshold,
  header,
  headingLevel,
  money,
  inDrawer = false,
}: FilterPanelContentProps) {
  // First 3 filters open by default
  const defaultOpen = filters.slice(0, 3).map((f) => f.id);

  const handlePriceApply = useCallback(
    (filterId: string, range: [number, number]) => {
      onFilterChange(filterId, range, true);
    },
    [onFilterChange],
  );

  const panelClasses = [
    'ds-collection-filters__panel',
    inDrawer && 'ds-collection-filters__panel--drawer',
  ]
    .filter(Boolean)
    .join(' ');

  // "Clear all" removes its own row (no active filters left). In the mobile
  // Drawer, Radix then parked focus on the dialog itself, so a keyboard or
  // screen-reader user started over from the drawer's top edge. Once the
  // clear lands and focus is found lost, move it to the first filter group
  // — the next thing in the panel.
  const panelRef = useRef<HTMLDivElement>(null);
  const clearPendingRef = useRef(false);
  useEffect(() => {
    if (!clearPendingRef.current) return;
    const focused = document.activeElement;
    const lost = !focused || focused === document.body || focused.getAttribute('role') === 'dialog';
    if (!lost) {
      // Still on the button (consumer hasn't cleared yet): keep waiting.
      if (!panelRef.current?.contains(focused)) clearPendingRef.current = false;
      return;
    }
    clearPendingRef.current = false;
    panelRef.current?.querySelector<HTMLElement>('.ds-accordion__trigger')?.focus();
  });

  return (
    <div ref={panelRef} className={panelClasses}>
      {header && <div className="ds-collection-filters__header">{header}</div>}

      {activeCount > 0 && (
        <div className="ds-collection-filters__clear-row">
          <Text as="span" size="sm" className="ds-collection-filters__active-label">
            {activeCount} active {activeCount === 1 ? 'filter' : 'filters'}
          </Text>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              clearPendingRef.current = true;
              onClearAll();
            }}
            aria-label="Clear all filters"
          >
            Clear all
          </Button>
        </div>
      )}

      <Accordion type="multiple" defaultValue={defaultOpen} size="sm" headingLevel={headingLevel}>
        {filters.map((filter) => (
          <AccordionItem key={filter.id} value={filter.id}>
            <AccordionTrigger>{filter.label}</AccordionTrigger>
            <AccordionContent>
              {filter.type === 'list' && (
                <FilterValueList
                  filter={filter}
                  threshold={showMoreThreshold}
                  onFilterChange={onFilterChange}
                />
              )}
              {filter.type === 'price_range' && (
                <PriceRangeFilter
                  // Inputs are seeded from the applied range once; re-key on
                  // it so "Clear all" / pill removal resets them.
                  key={`${filter.activeMin ?? ''}:${filter.activeMax ?? ''}`}
                  filter={filter}
                  onApply={handlePriceApply}
                  money={money}
                />
              )}
              {filter.type === 'boolean' && (
                <FilterValueList
                  filter={filter}
                  threshold={showMoreThreshold}
                  onFilterChange={onFilterChange}
                />
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

/**
 * Polite region that speaks the results count when it changes — empty on
 * mount, so it is not read as a hidden copy of the page's visible count.
 */
function ResultsCountAnnouncer({ count }: { count: number }) {
  const text = useChangeAnnouncement(`${count} ${count === 1 ? 'product' : 'products'}`);
  return (
    <div className="ds-collection-filters__sr-only" aria-live="polite" aria-atomic="true">
      {text}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────

/**
 * CollectionFilters
 *
 * Faceted navigation for collection pages. Supports list filters (checkboxes),
 * price range filters (min/max inputs), and boolean filters. Desktop renders
 * as a sidebar; mobile uses a Drawer.
 *
 * Composes: Accordion, Checkbox, Button, Badge, Input, Drawer, Text
 *
 * @example
 * ```tsx
 * <CollectionFilters
 *   filters={[
 *     { id: 'color', label: 'Color', type: 'list', values: [
 *       { label: 'Black', value: 'black', count: 12, active: false },
 *       { label: 'White', value: 'white', count: 8, active: true },
 *     ]},
 *     { id: 'price', label: 'Price', type: 'price_range', min: 0, max: 50000 },
 *   ]}
 *   activeCount={1}
 *   onFilterChange={(id, value, active) => console.log(id, value, active)}
 *   onClearAll={() => console.log('clear')}
 * />
 * ```
 */
export const CollectionFilters = forwardRef<HTMLDivElement, CollectionFiltersProps>(
  function CollectionFilters(
    {
      filters,
      activeCount,
      onFilterChange,
      onClearAll,
      showMoreThreshold = 5,
      mobileButtonLabel = 'Filters',
      header,
      resultsCount,
      headingLevel = 3,
      currency = 'USD',
      locale,
      className,
      ...props
    },
    ref,
  ) {
    const money: Money = { currency, locale };
    const [drawerOpen, setDrawerOpen] = useState(false);

    const classes = ['ds-collection-filters', className].filter(Boolean).join(' ');

    if (filters.length === 0) return null;

    const sharedProps = {
      filters,
      activeCount,
      onFilterChange,
      onClearAll,
      showMoreThreshold,
      header,
      headingLevel,
      money,
    };

    return (
      <div ref={ref} className={classes} {...props}>
        {/* ── Live region for results count ── */}
        {resultsCount != null && <ResultsCountAnnouncer count={resultsCount} />}

        {/* ── Active filter pills (above results, both viewports) ── */}
        <ActiveFilterPills
          filters={filters}
          onFilterChange={onFilterChange}
          onClearAll={onClearAll}
          activeCount={activeCount}
          money={money}
        />

        {/* ── Desktop sidebar ── */}
        <div className="ds-collection-filters__desktop">
          <FilterPanelContent {...sharedProps} />
        </div>

        {/* ── Mobile trigger + drawer ── */}
        <div className="ds-collection-filters__mobile">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setDrawerOpen(true)}
            className="ds-collection-filters__mobile-trigger"
          >
            {mobileButtonLabel}
            {activeCount > 0 && (
              <Badge size="sm" variant="default" className="ds-collection-filters__mobile-badge">
                {activeCount}
              </Badge>
            )}
          </Button>

          <Drawer
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
            side="left"
            title="Filter products"
          >
            <FilterPanelContent {...sharedProps} inDrawer />
          </Drawer>
        </div>
      </div>
    );
  },
);

CollectionFilters.displayName = 'CollectionFilters';
