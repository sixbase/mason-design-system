import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import { Checkbox } from '../checkbox/Checkbox';
import { ChevronDown } from '../icon';
import './Accordion.css';

// ─── Types ────────────────────────────────────────────────

export type AccordionSize = 'sm' | 'md' | 'lg';

export type AccordionProps = ComponentPropsWithoutRef<typeof AccordionPrimitive.Root> & {
  /** Size variant — controls padding and font size */
  size?: AccordionSize;
  /** @deprecated Inner-only dividers are now the default behavior. Kept for API compatibility. */
  flush?: boolean;
  /** Wraps the accordion in a bordered, rounded panel container */
  bordered?: boolean;
};

export interface AccordionItemProps
  extends ComponentPropsWithoutRef<typeof AccordionPrimitive.Item> {}

export interface AccordionTriggerProps
  extends ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> {
  /** Size variant — controls padding and font size */
  size?: AccordionSize;
  /** Show a checkbox before the trigger text. When defined, renders the checkbox variant. */
  checked?: boolean | 'indeterminate';
  /** Callback when the checkbox is toggled */
  onCheckedChange?: (checked: boolean | 'indeterminate') => void;
  /** Disable only the checkbox (not the accordion trigger) */
  checkboxDisabled?: boolean;
  /** Accessible label for the checkbox (defaults to children text content) */
  checkboxLabel?: string;
}

export interface AccordionContentProps
  extends ComponentPropsWithoutRef<typeof AccordionPrimitive.Content> {
  /** Size variant — controls padding */
  size?: AccordionSize;
}

// ─── Root ─────────────────────────────────────────────────

/**
 * Accordion
 *
 * A vertically stacked set of collapsible sections.
 * Built on Radix UI Accordion for full keyboard and screen reader support.
 *
 * Compound component API:
 * ```tsx
 * <Accordion type="single" collapsible>
 *   <AccordionItem value="item-1">
 *     <AccordionTrigger>Section title</AccordionTrigger>
 *     <AccordionContent>Section content</AccordionContent>
 *   </AccordionItem>
 * </Accordion>
 * ```
 */
export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  function Accordion({ size = 'md', flush, bordered, className, ...props }, ref) {
    const classes = [
      'ds-accordion',
      `ds-accordion--${size}`,
      flush && 'ds-accordion--flush',
      bordered && 'ds-accordion--bordered',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return <AccordionPrimitive.Root ref={ref} className={classes} {...props} />;
  },
);
Accordion.displayName = 'Accordion';

// ─── Item ─────────────────────────────────────────────────

export const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
  function AccordionItem({ className, ...props }, ref) {
    const classes = ['ds-accordion__item', className].filter(Boolean).join(' ');
    return <AccordionPrimitive.Item ref={ref} className={classes} {...props} />;
  },
);
AccordionItem.displayName = 'AccordionItem';

// ─── Trigger ──────────────────────────────────────────────

export const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  function AccordionTrigger(
    { className, children, checked, onCheckedChange, checkboxDisabled, checkboxLabel, ...props },
    ref,
  ) {
    const classes = ['ds-accordion__trigger', className].filter(Boolean).join(' ');
    const hasCheckbox = checked !== undefined;

    const trigger = (
      <AccordionPrimitive.Trigger ref={ref} className={classes} {...props}>
        <span className="ds-accordion__trigger-text">{children}</span>
        <ChevronDown size="sm" className="ds-accordion__chevron" />
      </AccordionPrimitive.Trigger>
    );

    if (!hasCheckbox) {
      return (
        <AccordionPrimitive.Header className="ds-accordion__header">
          {trigger}
        </AccordionPrimitive.Header>
      );
    }

    const label =
      checkboxLabel ?? (typeof children === 'string' ? children : undefined);

    return (
      <AccordionPrimitive.Header className="ds-accordion__header">
        <div className="ds-accordion__trigger-row">
          <Checkbox
            size="sm"
            checked={checked}
            onCheckedChange={onCheckedChange}
            disabled={checkboxDisabled}
            aria-label={label}
          />
          {trigger}
        </div>
      </AccordionPrimitive.Header>
    );
  },
);
AccordionTrigger.displayName = 'AccordionTrigger';

// ─── Content ──────────────────────────────────────────────

export const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(
  function AccordionContent({ className, children, ...props }, ref) {
    const classes = ['ds-accordion__content', className].filter(Boolean).join(' ');
    return (
      <AccordionPrimitive.Content ref={ref} className={classes} {...props}>
        <div className="ds-accordion__content-inner">{children}</div>
      </AccordionPrimitive.Content>
    );
  },
);
AccordionContent.displayName = 'AccordionContent';
