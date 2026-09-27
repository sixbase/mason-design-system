import { forwardRef, useRef } from 'react';
import type { HTMLAttributes, KeyboardEvent } from 'react';
import { isRtl } from '../internal/direction';
import './ColorPicker.css';

export interface ColorOption {
  /** CSS color value */
  color: string;
  /** Accessible label for this color (e.g. "Carbon Black") */
  label: string;
  /** Unique value identifier */
  value: string;
}

/** Swatch diameter step. */
export type ColorPickerSize = 'sm' | 'md' | 'lg';

export interface ColorPickerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Available color options */
  options: ColorOption[];
  /**
   * Currently selected value. Controlled only — the picker keeps no
   * selection of its own, so pass `value` and update it in `onChange`.
   */
  value?: string;
  /** Called with the chosen option's `value` (not an event) */
  onChange?: (value: string) => void;
  /** Size of the swatches */
  size?: ColorPickerSize;
  /** Show the selected option's name next to the swatch group */
  showLabel?: boolean;
}

/**
 * ColorPicker
 *
 * A group of selectable color swatches. Used for product option selection
 * such as choosing a case color on a PDP.
 *
 * Follows the WAI-ARIA radio group pattern: one tab stop (roving tabindex),
 * arrow keys move and select, Space selects the focused swatch.
 */
export const ColorPicker = forwardRef<HTMLDivElement, ColorPickerProps>(
  function ColorPicker(
    { options, value, onChange, size = 'md', showLabel = false, className, ...props },
    ref,
  ) {
    const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

    const selectedIndex = options.findIndex((option) => option.value === value);
    // Roving tabindex: the selected swatch is the single tab stop;
    // fall back to the first swatch when nothing is selected.
    const tabStopIndex = selectedIndex >= 0 ? selectedIndex : 0;
    const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
      // Swatches lay out right-to-left in RTL, so the horizontal arrows swap.
      const rtl = isRtl(event.currentTarget);
      const forwardKey = rtl ? 'ArrowLeft' : 'ArrowRight';
      const backwardKey = rtl ? 'ArrowRight' : 'ArrowLeft';

      let nextIndex: number;
      if (event.key === forwardKey || event.key === 'ArrowDown') {
        nextIndex = (index + 1) % options.length;
      } else if (event.key === backwardKey || event.key === 'ArrowUp') {
        nextIndex = (index - 1 + options.length) % options.length;
      } else {
        return;
      }
      const next = options[nextIndex];
      if (!next) return;
      event.preventDefault();
      // A one-swatch group wraps onto itself — don't report a "change".
      if (next.value !== value) onChange?.(next.value);
      buttonRefs.current.get(next.value)?.focus();
    };

    const classes = [
      'ds-color-picker',
      `ds-color-picker--${size}`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const group = (
      <div
        ref={ref}
        className={classes}
        role="radiogroup"
        {...props}
      >
        {options.map((option, index) => (
          <button
            key={option.value}
            ref={(node) => {
              if (node) {
                buttonRefs.current.set(option.value, node);
              } else {
                buttonRefs.current.delete(option.value);
              }
            }}
            type="button"
            className={[
              'ds-color-picker__btn',
              value === option.value && 'ds-color-picker__btn--active',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{ backgroundColor: option.color }}
            aria-label={option.label}
            aria-checked={value === option.value}
            role="radio"
            tabIndex={index === tabStopIndex ? 0 : -1}
            onClick={() => onChange?.(option.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          />
        ))}
      </div>
    );

    if (!showLabel) return group;

    return (
      <div className="ds-color-picker-root">
        {group}
        {selected && (
          <span className="ds-color-picker-label">{selected.label}</span>
        )}
      </div>
    );
  },
);

ColorPicker.displayName = 'ColorPicker';
