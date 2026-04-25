import * as RadixSelect from '@radix-ui/react-select';
import { forwardRef, useId } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import { Check, ChevronDown, ChevronUp } from '../icon';
import './Select.css';

// ─── Types ────────────────────────────────────────────────

export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectProps extends ComponentPropsWithoutRef<typeof RadixSelect.Root> {
  /** Visible label above the select */
  label?: string;
  /** Placeholder text when no value is selected */
  placeholder?: string;
  /** Error message — adds error styling */
  error?: string;
  /** Helper text below the select */
  hint?: string;
  /** Size of the trigger */
  size?: SelectSize;
  /** Stretch to fill container width */
  fullWidth?: boolean;
}

/**
 * Select
 *
 * An accessible dropdown for choosing a single value. Built on Radix UI Select
 * for correct keyboard navigation, ARIA roles, and screen reader announcements.
 *
 * Common ecommerce uses: size picker, quantity selector, sort order, country/state.
 *
 * @example
 * <Select label="Size" placeholder="Choose a size">
 *   <SelectItem value="xs">XS</SelectItem>
 *   <SelectItem value="sm">SM</SelectItem>
 *   <SelectItem value="md">MD</SelectItem>
 * </Select>
 */
export const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select(
  {
    label,
    placeholder = 'Select an option',
    error,
    hint,
    size = 'md',
    fullWidth = false,
    children,
    disabled,
    ...rootProps
  },
  ref,
) {
  const labelId = useId();

  const triggerClasses = [
    'ds-select-trigger',
    `ds-select-trigger--${size}`,
    error && 'ds-select-trigger--error',
    fullWidth && 'ds-select-trigger--full-width',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={['ds-select-root', fullWidth && 'ds-select-root--full-width'].filter(Boolean).join(' ')}>
      {label && (
        <label id={labelId} className="ds-select-label">
          {label}
        </label>
      )}

      <RadixSelect.Root disabled={disabled} {...rootProps}>
        <RadixSelect.Trigger
          ref={ref}
          className={triggerClasses}
          aria-invalid={error ? true : undefined}
          aria-labelledby={label ? labelId : undefined}
        >
          <RadixSelect.Value placeholder={placeholder} />
          <RadixSelect.Icon className="ds-select-icon" aria-hidden="true">
            <ChevronDown size="sm" />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>

        <RadixSelect.Portal>
          <RadixSelect.Content className="ds-select-content" position="popper" sideOffset={4}>
            <RadixSelect.ScrollUpButton className="ds-select-scroll-btn">
              <ChevronUp size="sm" />
            </RadixSelect.ScrollUpButton>

            <RadixSelect.Viewport className="ds-select-viewport">
              {children}
            </RadixSelect.Viewport>

            <RadixSelect.ScrollDownButton className="ds-select-scroll-btn">
              <ChevronDown size="sm" />
            </RadixSelect.ScrollDownButton>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>

      {hint && !error && <span className="ds-select-hint">{hint}</span>}
      {error && <span className="ds-select-error" role="alert">{error}</span>}
    </div>
  );
});
Select.displayName = 'Select';

// ─── SelectItem ───────────────────────────────────────────

export interface SelectItemProps extends ComponentPropsWithoutRef<typeof RadixSelect.Item> {}

export const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(function SelectItem(
  { children, className, ...props },
  ref,
) {
  return (
    <RadixSelect.Item
      ref={ref}
      className={['ds-select-item', className].filter(Boolean).join(' ')}
      {...props}
    >
      <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
      <RadixSelect.ItemIndicator className="ds-select-item-indicator">
        <Check size="sm" />
      </RadixSelect.ItemIndicator>
    </RadixSelect.Item>
  );
});
SelectItem.displayName = 'SelectItem';

// ─── SelectGroup ──────────────────────────────────────────

export interface SelectGroupProps extends ComponentPropsWithoutRef<typeof RadixSelect.Group> {
  label?: string;
}

export const SelectGroup = forwardRef<HTMLDivElement, SelectGroupProps>(function SelectGroup(
  { label, children, ...props },
  ref,
) {
  return (
    <RadixSelect.Group ref={ref} {...props}>
      {label && (
        <RadixSelect.Label className="ds-select-group-label">{label}</RadixSelect.Label>
      )}
      {children}
    </RadixSelect.Group>
  );
});
SelectGroup.displayName = 'SelectGroup';

// ─── SelectSeparator ─────────────────────────────────────

export const SelectSeparator = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof RadixSelect.Separator>
>(function SelectSeparator({ className, ...props }, ref) {
  return (
    <RadixSelect.Separator
      ref={ref}
      className={['ds-select-separator', className].filter(Boolean).join(' ')}
      {...props}
    />
  );
});
SelectSeparator.displayName = 'SelectSeparator';

