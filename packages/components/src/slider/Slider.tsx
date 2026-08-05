import * as RadixSlider from '@radix-ui/react-slider';
import { forwardRef, useState } from 'react';
import type { ComponentPropsWithoutRef, ElementRef } from 'react';
import { Text } from '../typography/Typography';
import './Slider.css';

// ─── Types ────────────────────────────────────────────────

export interface SliderProps extends Omit<ComponentPropsWithoutRef<typeof RadixSlider.Root>, 'asChild'> {
  /** Visible label above the slider */
  label?: string;
  /** Show the current value(s) beside the label */
  showValue?: boolean;
  /** Format a value for display and aria-valuetext (e.g. cents → "$25") */
  formatValue?: (value: number) => string;
  /** Accessible labels for each thumb (e.g. ['Minimum price', 'Maximum price']) */
  thumbLabels?: string[];
}

/**
 * Slider
 *
 * An accessible slider built on Radix UI. Supports single-value and
 * range (two thumbs) modes — pass a one- or two-element array as
 * `value`/`defaultValue`. Full keyboard support: arrows, Home/End,
 * PageUp/PageDown.
 *
 * Common ecommerce uses: price range filtering, quantity ranges,
 * shipping distance radius.
 *
 * @example
 * <Slider label="Volume" defaultValue={[60]} />
 * <Slider
 *   label="Price"
 *   min={0}
 *   max={200}
 *   defaultValue={[25, 80]}
 *   formatValue={(v) => `$${v}`}
 *   showValue
 * />
 */
export const Slider = forwardRef<ElementRef<typeof RadixSlider.Root>, SliderProps>(
  function Slider(
    {
      label,
      showValue = false,
      formatValue,
      thumbLabels,
      min = 0,
      max = 100,
      value,
      defaultValue,
      onValueChange,
      disabled,
      className,
      ...rootProps
    },
    ref,
  ) {
    const [internalValues, setInternalValues] = useState<number[]>(
      value ?? defaultValue ?? [min],
    );
    const values = value ?? internalValues;
    const isRange = values.length > 1;

    const handleValueChange = (next: number[]) => {
      setInternalValues(next);
      onValueChange?.(next);
    };

    const format = formatValue ?? ((v: number) => String(v));
    const displayValue = values.map(format).join(' – ');

    const getThumbLabel = (index: number) => {
      if (thumbLabels?.[index]) return thumbLabels[index];
      if (!isRange) return label ?? 'Value';
      const base = label ?? 'Range';
      return index === 0 ? `${base} minimum` : `${base} maximum`;
    };

    const classes = [
      'ds-slider',
      disabled && 'ds-slider--disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={classes}>
        {(label || showValue) && (
          <div className="ds-slider__header">
            {label && (
              <Text as="span" size="sm" className="ds-slider__label">
                {label}
              </Text>
            )}
            {showValue && (
              <Text as="span" size="sm" className="ds-slider__value">
                {displayValue}
              </Text>
            )}
          </div>
        )}

        <RadixSlider.Root
          ref={ref}
          className="ds-slider__root"
          min={min}
          max={max}
          value={value}
          defaultValue={defaultValue}
          onValueChange={handleValueChange}
          disabled={disabled}
          {...rootProps}
        >
          <RadixSlider.Track className="ds-slider__track">
            <RadixSlider.Range className="ds-slider__range" />
          </RadixSlider.Track>
          {values.map((thumbValue, index) => (
            <RadixSlider.Thumb
              key={index}
              className="ds-slider__thumb"
              aria-label={getThumbLabel(index)}
              aria-valuetext={formatValue ? format(thumbValue) : undefined}
            />
          ))}
        </RadixSlider.Root>
      </div>
    );
  },
);

Slider.displayName = 'Slider';
