import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { createContext, forwardRef, useContext, useEffect, useRef, useState } from 'react';
import type { ComponentPropsWithoutRef, MutableRefObject, ReactNode } from 'react';
import { Checkbox } from '../checkbox/Checkbox';
import { ChevronDown } from '../icon';
import './Accordion.css';

// ─── Types ────────────────────────────────────────────────

export type AccordionSize = 'sm' | 'md' | 'lg';

/** Heading level for item headers (h2–h6). */
export type AccordionHeadingLevel = 2 | 3 | 4 | 5 | 6;

export type AccordionProps = ComponentPropsWithoutRef<typeof AccordionPrimitive.Root> & {
  /** Size variant — controls padding and font size */
  size?: AccordionSize;
  /** @deprecated Inner-only dividers are now the default behavior. Kept for API compatibility. */
  flush?: boolean;
  /** Wraps the accordion in a bordered, rounded panel container */
  bordered?: boolean;
  /**
   * Heading level each item's header renders at (default 3). Set it to
   * fit the page outline — e.g. 2 when the accordion sits directly under
   * the page `<h1>` — so headings never skip a level.
   */
  headingLevel?: AccordionHeadingLevel;
};

export interface AccordionItemProps
  extends ComponentPropsWithoutRef<typeof AccordionPrimitive.Item> {
  /**
   * Disables this item: the trigger cannot be activated and the item
   * renders at reduced opacity. Radix marks the trigger `disabled` +
   * `data-disabled`, which is what screen readers announce. (The item is
   * a role-less div, so `aria-disabled` on it meant nothing — removed.)
   */
  disabled?: boolean;
}

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

// Heading level flows from the root to every trigger. A nested accordion
// provides its own value, so levels don't leak between them.
const AccordionHeadingLevelContext = createContext<AccordionHeadingLevel>(3);

// Whether the root has finished its first render. Content opened after that
// fades in; content already open when the page renders does not — Radix
// skips the height animation on mount, and the fade used to play anyway
// (open-by-default panels such as the first filter groups were invisible,
// then faded in, on every page load).
const AccordionMountedContext = createContext<MutableRefObject<boolean>>({ current: true });

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
  function Accordion(
    { size = 'md', flush, bordered, headingLevel = 3, className, ...props },
    ref,
  ) {
    const mounted = useRef(false);
    useEffect(() => {
      mounted.current = true;
    }, []);
    const classes = [
      'ds-accordion',
      `ds-accordion--${size}`,
      flush && 'ds-accordion--flush',
      bordered && 'ds-accordion--bordered',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <AccordionHeadingLevelContext.Provider value={headingLevel}>
        <AccordionMountedContext.Provider value={mounted}>
          <AccordionPrimitive.Root ref={ref} className={classes} {...props} />
        </AccordionMountedContext.Provider>
      </AccordionHeadingLevelContext.Provider>
    );
  },
);
Accordion.displayName = 'Accordion';

// ─── Item ─────────────────────────────────────────────────

export const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
  function AccordionItem({ className, disabled, ...props }, ref) {
    const classes = [
      'ds-accordion__item',
      disabled && 'ds-accordion__item--disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ');
    return (
      <AccordionPrimitive.Item
        ref={ref}
        className={classes}
        disabled={disabled}
        {...props}
      />
    );
  },
);
AccordionItem.displayName = 'AccordionItem';

// ─── Trigger ──────────────────────────────────────────────

export const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  function AccordionTrigger(
    {
      className,
      children,
      size,
      checked,
      onCheckedChange,
      checkboxDisabled,
      checkboxLabel,
      ...props
    },
    ref,
  ) {
    const classes = [
      'ds-accordion__trigger',
      size && `ds-accordion__trigger--${size}`,
      className,
    ]
      .filter(Boolean)
      .join(' ');
    const hasCheckbox = checked !== undefined;
    const HeadingTag = `h${useContext(AccordionHeadingLevelContext)}` as const;

    const trigger = (
      <AccordionPrimitive.Trigger ref={ref} className={classes} {...props}>
        <span className="ds-accordion__trigger-text">{children}</span>
        <ChevronDown size="sm" className="ds-accordion__chevron" />
      </AccordionPrimitive.Trigger>
    );

    if (!hasCheckbox) {
      return (
        <AccordionPrimitive.Header asChild>
          <HeadingTag className="ds-accordion__header">{trigger}</HeadingTag>
        </AccordionPrimitive.Header>
      );
    }

    const label =
      checkboxLabel ?? (typeof children === 'string' ? children : undefined);

    // The checkbox sits beside the heading, not inside it. Inside, the
    // heading's name was built from both controls — screen readers read
    // "Functional Cookies Functional Cookies, heading level 3" — and the
    // WAI-ARIA accordion pattern keeps the button as the heading's only child.
    return (
      <div className="ds-accordion__trigger-row">
        <Checkbox
          size="sm"
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={checkboxDisabled}
          aria-label={label}
        />
        <AccordionPrimitive.Header asChild>
          <HeadingTag className="ds-accordion__header">{trigger}</HeadingTag>
        </AccordionPrimitive.Header>
      </div>
    );
  },
);
AccordionTrigger.displayName = 'AccordionTrigger';

// ─── Content ──────────────────────────────────────────────

export const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(
  function AccordionContent({ className, children, size, ...props }, ref) {
    const classes = [
      'ds-accordion__content',
      size && `ds-accordion__content--${size}`,
      className,
    ]
      .filter(Boolean)
      .join(' ');
    return (
      <AccordionPrimitive.Content ref={ref} className={classes} {...props}>
        <AccordionContentInner>{children}</AccordionContentInner>
      </AccordionPrimitive.Content>
    );
  },
);
AccordionContent.displayName = 'AccordionContent';

/** Radix renders content children only while open, so this mounts on every open. */
function AccordionContentInner({ children }: { children?: ReactNode }) {
  const rootMounted = useContext(AccordionMountedContext);
  const [fadeIn] = useState(() => rootMounted.current);
  const classes = ['ds-accordion__content-inner', fadeIn && 'ds-accordion__content-inner--enter']
    .filter(Boolean)
    .join(' ');
  return <div className={classes}>{children}</div>;
}
