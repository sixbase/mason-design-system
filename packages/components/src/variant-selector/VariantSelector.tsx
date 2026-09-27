import { forwardRef, useCallback } from 'react';
import type { HTMLAttributes, KeyboardEvent } from 'react';
import { Text } from '../typography';
import { ColorPicker } from '../color-picker';
import type { ColorOption } from '../color-picker';
import { isRtl } from '../internal/direction';
import './VariantSelector.css';

// ─── Types ──────────────────────────────────────────────────

export interface VariantOptionValue {
  /** Display label — e.g. "Midnight Blue", "XL", "Leather" */
  label: string;
  /** Shopify variant value identifier */
  value: string;
  /** Hex color for type: 'color' options */
  colorHex?: string;
  /** Out of stock but still browsable (Shopify convention) */
  available?: boolean;
  /** Completely unavailable — not clickable */
  disabled?: boolean;
}

export interface VariantOption {
  /** Option name — e.g. "Color", "Size", "Material" */
  name: string;
  /** Rendering strategy: 'color' uses ColorPicker swatches, 'button' uses text buttons */
  type: 'color' | 'button';
  /** Available values for this option */
  values: VariantOptionValue[];
}

/** Swatch/chip size step. */
export type VariantSelectorSize = 'sm' | 'md';

export interface VariantSelectorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Product option groups to render */
  options: VariantOption[];
  /** Currently selected value per option name — e.g. { Color: "midnight-blue", Size: "xl" } */
  selectedValues: Record<string, string>;
  /** Called when a value is selected */
  onValueChange: (optionName: string, value: string) => void;
  /** Size of controls */
  size?: VariantSelectorSize;
}

// ─── Component ──────────────────────────────────────────────

export const VariantSelector = forwardRef<HTMLDivElement, VariantSelectorProps>(
  function VariantSelector(
    { options, selectedValues, onValueChange, size = 'md', className, ...props },
    ref,
  ) {
    const classes = [
      'ds-variant-selector',
      `ds-variant-selector--${size}`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={classes} {...props}>
        {/* An option with no values list (bad product data) has nothing to
            pick and used to throw on `values.find`, blanking the PDP. */}
        {options.filter((option) => Array.isArray(option.values)).map((option) => (
          <OptionGroup
            key={option.name}
            option={option}
            selectedValue={selectedValues[option.name]}
            onValueChange={onValueChange}
            size={size}
          />
        ))}
      </div>
    );
  },
);

VariantSelector.displayName = 'VariantSelector';

// ─── Option Group ───────────────────────────────────────────

interface OptionGroupProps {
  option: VariantOption;
  selectedValue?: string;
  onValueChange: (optionName: string, value: string) => void;
  size: 'sm' | 'md';
}

function OptionGroup({ option, selectedValue, onValueChange, size }: OptionGroupProps) {
  const selectedLabel = option.values.find((v) => v.value === selectedValue)?.label;

  const handleChange = useCallback(
    (value: string) => {
      onValueChange(option.name, value);
    },
    [onValueChange, option.name],
  );

  // The group label is a caption for a form control, not a document
  // heading. It used to be a hard-coded <h4>, which broke the heading
  // outline wherever the selector landed (h1 product title → h4 "Color").
  // The radiogroup below carries the accessible name via aria-label.
  return (
    <div className="ds-variant-selector__group">
      <Text as="span" size="sm" weight="medium" className="ds-variant-selector__label">
        {option.name}
        {selectedLabel && (
          <span className="ds-variant-selector__selected-value">: {selectedLabel}</span>
        )}
      </Text>

      {option.type === 'color' ? (
        <ColorOptionGroup
          option={option}
          selectedValue={selectedValue}
          onChange={handleChange}
          size={size}
        />
      ) : (
        <ButtonOptionGroup
          option={option}
          selectedValue={selectedValue}
          onChange={handleChange}
          size={size}
        />
      )}
    </div>
  );
}

// ─── Color Options (delegates to ColorPicker) ───────────────

interface ColorOptionGroupProps {
  option: VariantOption;
  selectedValue?: string;
  onChange: (value: string) => void;
  size: 'sm' | 'md';
}

function ColorOptionGroup({ option, selectedValue, onChange, size }: ColorOptionGroupProps) {
  const colorOptions: ColorOption[] = option.values
    .filter((v) => !v.disabled)
    .map((v) => ({
      color: v.colorHex ?? '#000000',
      label: v.available === false ? `${v.label} (out of stock)` : v.label,
      value: v.value,
    }));

  return (
    <ColorPicker
      options={colorOptions}
      value={selectedValue}
      onChange={onChange}
      size={size === 'sm' ? 'sm' : 'md'}
      aria-label={option.name}
    />
  );
}

// ─── Button Options ─────────────────────────────────────────

interface ButtonOptionGroupProps {
  option: VariantOption;
  selectedValue?: string;
  onChange: (value: string) => void;
  size: 'sm' | 'md';
}

function ButtonOptionGroup({ option, selectedValue, onChange, size: _size }: ButtonOptionGroupProps) {
  const enabledValues = option.values.filter((v) => !v.disabled);

  // Roving tabindex: exactly one tab stop — the selected option, else the
  // first enabled one. (The group itself used to be tabIndex=0 as well, so
  // Tab stopped twice per option group, and with nothing selected no option
  // was reachable except through the group.)
  const selectedIsEnabled = enabledValues.some((v) => v.value === selectedValue);
  const tabStopValue = selectedIsEnabled ? selectedValue : enabledValues[0]?.value;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const group = e.currentTarget;
      const buttons = Array.from(
        group.querySelectorAll<HTMLButtonElement>('[role="radio"]:not([disabled])'),
      );
      if (buttons.length === 0) return;
      const enabled = option.values.filter((v) => !v.disabled);

      // Move from the focused option (it may not be selected yet), falling
      // back to the selected one.
      const focusedIndex = buttons.findIndex((b) => b === document.activeElement);
      const currentIndex =
        focusedIndex >= 0 ? focusedIndex : enabled.findIndex((v) => v.value === selectedValue);

      // Options lay out right-to-left in RTL, so the horizontal arrows swap.
      const rtl = isRtl(group);
      const forwardKey = rtl ? 'ArrowLeft' : 'ArrowRight';
      const backwardKey = rtl ? 'ArrowRight' : 'ArrowLeft';

      let nextIndex: number | null = null;
      if (e.key === forwardKey || e.key === 'ArrowDown') {
        nextIndex = currentIndex < buttons.length - 1 ? currentIndex + 1 : 0;
      } else if (e.key === backwardKey || e.key === 'ArrowUp') {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : buttons.length - 1;
      }
      if (nextIndex === null) return;

      e.preventDefault();
      const nextValue = enabled[nextIndex];
      if (nextValue && nextValue.value !== selectedValue) onChange(nextValue.value);
      buttons[nextIndex]?.focus();
    },
    [option.values, selectedValue, onChange],
  );

  return (
    <div
      className="ds-variant-selector__buttons"
      role="radiogroup"
      aria-label={option.name}
      // Focusable for the keydown listener (lint requirement) but out of
      // the tab order — the roving tabindex on the options owns it.
      tabIndex={-1}
      onKeyDown={handleKeyDown}
    >
      {option.values.map((optionValue) => {
        const isSelected = optionValue.value === selectedValue;
        const isUnavailable = optionValue.available === false;
        const isDisabled = optionValue.disabled === true;

        const buttonClasses = [
          'ds-variant-selector__option',
          isSelected && 'ds-variant-selector__option--selected',
          isUnavailable && 'ds-variant-selector__option--unavailable',
        ]
          .filter(Boolean)
          .join(' ');

        const ariaLabel = isUnavailable
          ? `${optionValue.label} (out of stock)`
          : optionValue.label;

        return (
          <button
            key={optionValue.value}
            type="button"
            className={buttonClasses}
            role="radio"
            aria-checked={isSelected}
            aria-label={ariaLabel}
            disabled={isDisabled}
            tabIndex={optionValue.value === tabStopValue ? 0 : -1}
            onClick={() => onChange(optionValue.value)}
          >
            <span className="ds-variant-selector__option-label">{optionValue.label}</span>
          </button>
        );
      })}
    </div>
  );
}
