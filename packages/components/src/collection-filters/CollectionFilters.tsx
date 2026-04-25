import { forwardRef, useCallback, useId, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../accordion/Accordion';
import { Badge } from '../badge/Badge';
import { Button } from '../button/Button';
import { Checkbox } from '../checkbox/Checkbox';
import { Drawer } from '../drawer/Drawer';
import { X } from '../icon';
import { Input } from '../input/Input';
import { Text } from '../typography';
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
  /** Callback when a filter value changes */
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
}

// ─── Price Range Sub-component ──────────────────────────────

interface PriceRangeFilterProps {
  filter: Filter;
  onApply: (filterId: string, range: [number, number]) => void;
}

function formatCents(cents: number): string {
  return (cents / 100).toFixed(2);
}

function parseDollars(str: string): number | null {
  const num = parseFloat(str);
  if (Number.isNaN(num) || num < 0) return null;
  return Math.round(num * 100);
}

function PriceRangeFilter({ filter, onApply }: PriceRangeFilterProps) {
  const [minInput, setMinInput] = useState(
    filter.activeMin != null ? formatCents(filter.activeMin) : '',
  );
  const [maxInput, setMaxInput] = useState(
    filter.activeMax != null ? formatCents(filter.activeMax) : '',
  );
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
    onApply(filter.id, [minVal, maxVal === Infinity ? filter.max ?? 0 : maxVal]);
  };

  return (
    <div className="ds-collection-filters__price-range">
      <div className="ds-collection-filters__price-inputs">
        <Input
          size="sm"
          label="Min"
          type="number"
          placeholder={filter.min != null ? formatCents(filter.min) : '0.00'}
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
          placeholder={filter.max != null ? formatCents(filter.max) : ''}
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
            disabled={fv.count === 0}
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

interface ActiveFilterPillsProps {
  filters: Filter[];
  onFilterChange: (filterId: string, value: string | [number, number], active: boolean) => void;
  onClearAll: () => void;
  activeCount: number;
}

function ActiveFilterPills({
  filters,
  onFilterChange,
  onClearAll,
  activeCount,
}: ActiveFilterPillsProps) {
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
      const min = filter.activeMin != null ? `$${formatCents(filter.activeMin)}` : '';
      const max = filter.activeMax != null ? `$${formatCents(filter.activeMax)}` : '';
      activePills.push({
        filterId: filter.id,
        label: `${filter.label}: ${min}–${max}`,
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
    <div className="ds-collection-filters__active-pills" aria-label="Active filters" role="group">
      {activePills.map((pill) => (
        <button
          key={`${pill.filterId}-${pill.value}`}
          type="button"
          className="ds-collection-filters__pill"
          onClick={() => onFilterChange(pill.filterId, pill.value, false)}
          aria-label={`Remove filter: ${pill.label}`}
        >
          <span className="ds-collection-filters__pill-text">{pill.label}</span>
          <X size="sm" className="ds-collection-filters__pill-icon" />
        </button>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onClearAll}
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
}

function FilterPanelContent({
  filters,
  activeCount,
  onFilterChange,
  onClearAll,
  showMoreThreshold,
  header,
}: FilterPanelContentProps) {
  // First 3 filters open by default
  const defaultOpen = filters.slice(0, 3).map((f) => f.id);

  const handlePriceApply = useCallback(
    (filterId: string, range: [number, number]) => {
      onFilterChange(filterId, range, true);
    },
    [onFilterChange],
  );

  return (
    <div className="ds-collection-filters__panel">
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
            onClick={onClearAll}
            aria-label="Clear all filters"
          >
            Clear all
          </Button>
        </div>
      )}

      <Accordion type="multiple" defaultValue={defaultOpen} size="sm">
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
                <PriceRangeFilter filter={filter} onApply={handlePriceApply} />
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
      className,
      ...props
    },
    ref,
  ) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const liveRegionId = useId();

    const classes = ['ds-collection-filters', className].filter(Boolean).join(' ');

    if (filters.length === 0) return null;

    const sharedProps = {
      filters,
      activeCount,
      onFilterChange,
      onClearAll,
      showMoreThreshold,
      header,
    };

    return (
      <div ref={ref} className={classes} {...props}>
        {/* ── Live region for results count ── */}
        {resultsCount != null && (
          <div
            id={liveRegionId}
            className="ds-collection-filters__sr-only"
            aria-live="polite"
            aria-atomic="true"
          >
            {resultsCount} {resultsCount === 1 ? 'product' : 'products'}
          </div>
        )}

        {/* ── Active filter pills (above results, both viewports) ── */}
        <ActiveFilterPills
          filters={filters}
          onFilterChange={onFilterChange}
          onClearAll={onClearAll}
          activeCount={activeCount}
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
            <FilterPanelContent {...sharedProps} />
          </Drawer>
        </div>
      </div>
    );
  },
);

CollectionFilters.displayName = 'CollectionFilters';
