import * as RadixPopover from '@radix-ui/react-popover';
import { createContext, forwardRef, useCallback, useContext, useEffect, useId, useMemo, useState } from 'react';
import type { ComponentPropsWithoutRef, ElementRef } from 'react';
import { X } from '../icon';
import { devWarning } from '../internal/dev-warning';
import './Popover.css';

// ─── Types ────────────────────────────────────────────────

export type PopoverSide = 'top' | 'right' | 'bottom' | 'left';
export type PopoverAlign = 'start' | 'center' | 'end';

/** Collision padding: 16px = var(--spacing-4). Keeps content clear of viewport edges. */
const COLLISION_PADDING = 16;

/** Gap between trigger and popover: 8px = var(--spacing-2). */
const DEFAULT_SIDE_OFFSET = 8;

export interface PopoverProps extends ComponentPropsWithoutRef<typeof RadixPopover.Root> {}

export interface PopoverContentProps
  extends ComponentPropsWithoutRef<typeof RadixPopover.Content> {
  /** Preferred side — flips automatically on collision */
  side?: PopoverSide;
  /** Alignment along the trigger edge */
  align?: PopoverAlign;
  /** Show a dismiss button in the top-right corner */
  showClose?: boolean;
}

// ─── Naming ───────────────────────────────────────────────
// Radix renders the panel as role="dialog" with no name, so a screen reader
// announced a bare "dialog" and gave no hint what had opened. The panel is
// now labelled by its trigger ("Size guide, dialog") unless PopoverContent
// gets its own aria-label / aria-labelledby (e.g. the id of a heading inside).
// The id is read from the mounted trigger, not assumed: with `asChild`, a
// child that brings its own id wins over ours. It is state, not a ref, so
// PopoverContent (rendered once, closed, before the trigger mounts)
// re-renders with it.
interface PopoverNaming {
  /** Id handed to the trigger */
  triggerId: string;
  /** Id the mounted trigger actually has */
  triggerDomId: string | undefined;
  setTriggerDomId: (id: string | undefined) => void;
}
const PopoverNamingContext = createContext<PopoverNaming | null>(null);

// ─── Root ─────────────────────────────────────────────────

/**
 * Popover
 *
 * A floating panel anchored to a trigger, for rich interactive content that
 * doesn't warrant a modal — filters, size guides, mini forms, info panels.
 * Built on Radix UI Popover: focus is moved into the panel on open, and
 * returned to the trigger on close.
 *
 * Screen readers: the panel is a non-modal dialog named after its trigger
 * ("Size guide, dialog"); pass `aria-labelledby` (a heading inside) or
 * `aria-label` on PopoverContent to name it differently. Tab cycles through
 * the panel's controls (Radix's loop); Escape or a click outside closes it.
 * It is deliberately not a full focus trap — the page stays usable, as the
 * WAI-ARIA non-modal dialog pattern expects. Use Modal for "answer first".
 *
 * Compound component API:
 * ```tsx
 * <Popover>
 *   <PopoverTrigger asChild>
 *     <Button variant="secondary">Size guide</Button>
 *   </PopoverTrigger>
 *   <PopoverContent>
 *     <PopoverArrow />
 *     Panel content
 *   </PopoverContent>
 * </Popover>
 * ```
 */
export function Popover({ children, ...props }: PopoverProps) {
  const triggerId = useId();
  const [triggerDomId, setTriggerDomId] = useState<string | undefined>(undefined);
  const naming = useMemo(
    () => ({ triggerId, triggerDomId, setTriggerDomId }),
    [triggerId, triggerDomId],
  );
  return (
    <PopoverNamingContext.Provider value={naming}>
      <RadixPopover.Root {...props}>{children}</RadixPopover.Root>
    </PopoverNamingContext.Provider>
  );
}

// ─── Trigger ──────────────────────────────────────────────

// Thin wrappers, not bare re-exports: setting `displayName` on the Radix
// part itself renames Radix's shared component for every consumer.
export const PopoverTrigger = forwardRef<
  ElementRef<typeof RadixPopover.Trigger>,
  ComponentPropsWithoutRef<typeof RadixPopover.Trigger>
>(function PopoverTrigger({ id, ...props }, ref) {
  const naming = useContext(PopoverNamingContext);
  const setTriggerDomId = naming?.setTriggerDomId;
  const setRef = useCallback(
    (node: HTMLButtonElement | null) => {
      setTriggerDomId?.(node?.id || undefined);
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [setTriggerDomId, ref],
  );
  return <RadixPopover.Trigger ref={setRef} id={id ?? naming?.triggerId} {...props} />;
});
PopoverTrigger.displayName = 'PopoverTrigger';

// ─── Anchor ───────────────────────────────────────────────

export const PopoverAnchor = forwardRef<
  ElementRef<typeof RadixPopover.Anchor>,
  ComponentPropsWithoutRef<typeof RadixPopover.Anchor>
>(function PopoverAnchor(props, ref) {
  return <RadixPopover.Anchor ref={ref} {...props} />;
});
PopoverAnchor.displayName = 'PopoverAnchor';

// ─── Close ────────────────────────────────────────────────

export const PopoverClose = forwardRef<
  ElementRef<typeof RadixPopover.Close>,
  ComponentPropsWithoutRef<typeof RadixPopover.Close>
>(function PopoverClose(props, ref) {
  return <RadixPopover.Close ref={ref} {...props} />;
});
PopoverClose.displayName = 'PopoverClose';

// ─── Content ──────────────────────────────────────────────

/**
 * Rendered inside the open panel only. This wrapper also renders while the
 * popover is closed — before the trigger has mounted and reported its id —
 * so checking there warned about every popover on the page.
 */
function UnnamedPopoverWarning() {
  useEffect(() => {
    devWarning(
      'PopoverContent:name',
      'PopoverContent has no accessible name — screen readers announce only "dialog". ' +
        'Open it from a <PopoverTrigger> (the panel is labelled by it), or pass ' +
        'aria-label or aria-labelledby.',
    );
  }, []);
  return null;
}

export const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(
  function PopoverContent(
    {
      side = 'bottom',
      align = 'center',
      sideOffset = DEFAULT_SIDE_OFFSET,
      collisionPadding = COLLISION_PADDING,
      showClose = false,
      className,
      children,
      ...props
    },
    ref,
  ) {
    const classes = ['ds-popover', showClose && 'ds-popover--has-close', className]
      .filter(Boolean)
      .join(' ');

    // Name: the consumer's label wins; otherwise the trigger names the panel.
    const naming = useContext(PopoverNamingContext);
    const ariaLabel = props['aria-label'];
    const ariaLabelledBy = props['aria-labelledby'];
    const triggerId = naming?.triggerDomId;
    const labelledBy = ariaLabelledBy ?? (ariaLabel ? undefined : triggerId);
    const unnamed = !ariaLabel && !labelledBy;

    return (
      <RadixPopover.Portal>
        <RadixPopover.Content
          ref={ref}
          className={classes}
          side={side}
          align={align}
          sideOffset={sideOffset}
          collisionPadding={collisionPadding}
          aria-labelledby={labelledBy}
          {...props}
        >
          {unnamed && <UnnamedPopoverWarning />}
          {children}
          {showClose && (
            <RadixPopover.Close type="button" className="ds-popover__close" aria-label="Close">
              <X size="sm" />
            </RadixPopover.Close>
          )}
        </RadixPopover.Content>
      </RadixPopover.Portal>
    );
  },
);
PopoverContent.displayName = 'PopoverContent';

// ─── Arrow ────────────────────────────────────────────────

export const PopoverArrow = forwardRef<
  SVGSVGElement,
  ComponentPropsWithoutRef<typeof RadixPopover.Arrow>
>(function PopoverArrow({ className, asChild, children, ...props }, ref) {
  const classes = ['ds-popover__arrow', className].filter(Boolean).join(' ');

  // A consumer-supplied arrow shape passes straight through.
  if (asChild) {
    return (
      <RadixPopover.Arrow ref={ref} className={classes} asChild {...props}>
        {children}
      </RadixPopover.Arrow>
    );
  }

  // Radix's default arrow is a bare filled triangle. The panel has a
  // border, so that triangle floated outside it with the border line
  // running straight across its base. This one draws the two slanted
  // edges in the border color (no base) and tucks 1px into the panel
  // (see CSS), so the arrow reads as part of the panel's outline.
  return (
    <RadixPopover.Arrow ref={ref} className={classes} asChild {...props}>
      <svg viewBox="0 0 10 5" preserveAspectRatio="none" aria-hidden="true">
        <path className="ds-popover__arrow-fill" d="M0 0L5 5L10 0Z" />
        <path className="ds-popover__arrow-edge" d="M0 0L5 5L10 0" />
      </svg>
    </RadixPopover.Arrow>
  );
});
PopoverArrow.displayName = 'PopoverArrow';
