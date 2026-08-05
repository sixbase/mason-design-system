import {
  Children,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useState,
} from 'react';
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  KeyboardEvent,
  ReactElement,
  ReactNode,
} from 'react';
import './SegmentedControl.css';

// ─── Types ──────────────────────────────────────────────────

export interface SegmentedControlProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Controlled selected value */
  value?: string;
  /** Uncontrolled initial value */
  defaultValue?: string;
  /** Called when the selected value changes */
  onValueChange?: (value: string) => void;
  /** Size variant — track height uses --size-control-sm / --size-control-md */
  size?: 'sm' | 'md';
  /** 2–5 <SegmentedControlItem> children */
  children: ReactNode;
}

export interface SegmentedControlItemProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  /** Value this segment represents */
  value: string;
  /** Segment content — text label or an icon (icon-only requires aria-label) */
  children?: ReactNode;
}

// ─── Context ────────────────────────────────────────────────

interface SegmentedControlContextValue {
  selectedValue: string | undefined;
  firstValue: string | undefined;
  onSelect: (value: string) => void;
}

const SegmentedControlContext =
  createContext<SegmentedControlContextValue | null>(null);

function useSegmentedControlContext(): SegmentedControlContextValue {
  const context = useContext(SegmentedControlContext);
  if (!context) {
    throw new Error(
      'SegmentedControlItem must be used within a SegmentedControl',
    );
  }
  return context;
}

// ─── Root ───────────────────────────────────────────────────

/**
 * SegmentedControl
 *
 * A single-select group of 2–5 adjacent segments — view switchers
 * (grid/list), sort toggles, and similar mutually exclusive choices.
 *
 * ARIA: implemented as `role="radiogroup"` with `role="radio"` buttons
 * and roving tabindex, NOT as tabs. Tabs navigate between panels of
 * content; a segmented control selects a value. Arrow keys move focus
 * and selection together, matching native radio group behavior.
 *
 * The selected segment renders as a raised pill that slides inside a
 * muted track. The slide is driven by `data-index` / `data-count`
 * attributes mapped to CSS transforms — no inline styles.
 *
 * ```tsx
 * <SegmentedControl defaultValue="grid" aria-label="View">
 *   <SegmentedControlItem value="grid">Grid</SegmentedControlItem>
 *   <SegmentedControlItem value="list">List</SegmentedControlItem>
 * </SegmentedControl>
 * ```
 */
export const SegmentedControl = forwardRef<
  HTMLDivElement,
  SegmentedControlProps
>(function SegmentedControl(
  {
    value,
    defaultValue,
    onValueChange,
    size = 'md',
    children,
    className,
    onKeyDown,
    ...props
  },
  ref,
) {
  const [internalValue, setInternalValue] = useState<string | undefined>(
    defaultValue,
  );
  const isControlled = value !== undefined;
  const selectedValue = isControlled ? value : internalValue;

  const handleSelect = useCallback(
    (nextValue: string) => {
      if (!isControlled) setInternalValue(nextValue);
      if (nextValue !== selectedValue) onValueChange?.(nextValue);
    },
    [isControlled, selectedValue, onValueChange],
  );

  // Items must be direct children — the root reads their values to
  // compute the sliding indicator position and the segment count.
  const itemValues = Children.toArray(children)
    .filter(
      (child): child is ReactElement<SegmentedControlItemProps> =>
        isValidElement(child) &&
        (child.props as SegmentedControlItemProps).value !== undefined,
    )
    .map((child) => child.props.value);

  const count = itemValues.length;
  const selectedIndex =
    selectedValue !== undefined ? itemValues.indexOf(selectedValue) : -1;

  // Roving tabindex: arrow keys move focus AND selection together
  // (native radio group behavior). Wraps at both ends.
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);

      const group = event.currentTarget;
      const radios = Array.from(
        group.querySelectorAll<HTMLButtonElement>(
          '[role="radio"]:not(:disabled)',
        ),
      );
      if (radios.length === 0) return;

      const focusedIndex = radios.findIndex(
        (radio) => radio === document.activeElement,
      );
      const currentIndex = focusedIndex >= 0 ? focusedIndex : 0;

      let nextIndex: number | null = null;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        nextIndex = currentIndex < radios.length - 1 ? currentIndex + 1 : 0;
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : radios.length - 1;
      } else if (event.key === 'Home') {
        nextIndex = 0;
      } else if (event.key === 'End') {
        nextIndex = radios.length - 1;
      }

      if (nextIndex !== null) {
        event.preventDefault();
        const nextRadio = radios[nextIndex];
        if (nextRadio) {
          nextRadio.focus();
          nextRadio.click();
        }
      }
    },
    [onKeyDown],
  );

  const classes = [
    'ds-segmented-control',
    `ds-segmented-control--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <SegmentedControlContext.Provider
      value={{
        selectedValue,
        firstValue: itemValues[0],
        onSelect: handleSelect,
      }}
    >
      <div
        ref={ref}
        role="radiogroup"
        // Focusable for the keydown listener (lint requirement) but out
        // of the tab order — the roving tabindex on the radios owns it.
        tabIndex={-1}
        className={classes}
        data-count={count}
        data-index={selectedIndex >= 0 ? selectedIndex : undefined}
        onKeyDown={handleKeyDown}
        {...props}
      >
        <span className="ds-segmented-control__indicator" aria-hidden="true" />
        {children}
      </div>
    </SegmentedControlContext.Provider>
  );
});

SegmentedControl.displayName = 'SegmentedControl';

// ─── Item ───────────────────────────────────────────────────

export const SegmentedControlItem = forwardRef<
  HTMLButtonElement,
  SegmentedControlItemProps
>(function SegmentedControlItem(
  { value, children, className, onClick, ...props },
  ref,
) {
  const { selectedValue, firstValue, onSelect } = useSegmentedControlContext();

  const isSelected = value === selectedValue;
  // Roving tabindex: only the selected segment is tabbable. With no
  // selection yet, the first segment takes the tab stop.
  const isTabStop =
    isSelected || (selectedValue === undefined && value === firstValue);

  const classes = [
    'ds-segmented-control__item',
    isSelected && 'ds-segmented-control__item--selected',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      ref={ref}
      type="button"
      role="radio"
      aria-checked={isSelected}
      tabIndex={isTabStop ? 0 : -1}
      className={classes}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) onSelect(value);
      }}
      {...props}
    >
      {children}
    </button>
  );
});

SegmentedControlItem.displayName = 'SegmentedControlItem';
