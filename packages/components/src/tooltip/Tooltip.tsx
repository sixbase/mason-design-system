import * as RadixTooltip from '@radix-ui/react-tooltip';
import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import './Tooltip.css';

// ─── Types ────────────────────────────────────────────────

export type TooltipSide = 'top' | 'right' | 'bottom' | 'left';
export type TooltipAlign = 'start' | 'center' | 'end';

/**
 * Default open delay. φ transition scale: 262ms = var(--transition-duration-slow).
 * Keep in sync with the tokens — CSS custom properties are not readable in JS
 * without a runtime lookup, so the value is mirrored here.
 */
const DEFAULT_DELAY_DURATION = 262;

/** Collision padding: 16px = var(--spacing-4). Keeps content clear of viewport edges. */
const COLLISION_PADDING = 16;

/** Gap between trigger and tooltip: 4px = var(--spacing-1). */
const DEFAULT_SIDE_OFFSET = 4;

export interface TooltipProps
  extends Omit<ComponentPropsWithoutRef<typeof RadixTooltip.Content>, 'content'> {
  /** Tooltip text or content shown in the floating bubble */
  content: ReactNode;
  /** The trigger element — must accept a ref (Radix `asChild`) */
  children: ReactNode;
  /** Preferred side — flips automatically on collision */
  side?: TooltipSide;
  /** Alignment along the trigger edge */
  align?: TooltipAlign;
  /** Delay before showing, in ms. Defaults to 262 (= --transition-duration-slow) */
  delayDuration?: number;
  /** Controlled open state */
  open?: boolean;
  /** Initial open state (uncontrolled) */
  defaultOpen?: boolean;
  /** Open state change handler */
  onOpenChange?: (open: boolean) => void;
}

/**
 * Tooltip
 *
 * A small floating label that appears on hover or keyboard focus. Built on
 * Radix UI Tooltip for correct positioning, collision handling, and ARIA wiring.
 *
 * Provider-wrapped convenience API — each Tooltip carries its own provider,
 * so no app-level setup is required.
 *
 * Accessibility note: tooltips never appear on touch devices. Never make the
 * tooltip the only way to access information — it must be supplementary.
 *
 * @example
 * <Tooltip content="Add to wishlist">
 *   <Button variant="ghost" aria-label="Add to wishlist"><Heart /></Button>
 * </Tooltip>
 */
export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(function Tooltip(
  {
    content,
    children,
    side = 'top',
    align = 'center',
    delayDuration = DEFAULT_DELAY_DURATION,
    open,
    defaultOpen,
    onOpenChange,
    className,
    sideOffset = DEFAULT_SIDE_OFFSET,
    collisionPadding = COLLISION_PADDING,
    ...contentProps
  },
  ref,
) {
  const contentClasses = ['ds-tooltip', className].filter(Boolean).join(' ');

  return (
    <RadixTooltip.Provider delayDuration={delayDuration}>
      <RadixTooltip.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            ref={ref}
            className={contentClasses}
            side={side}
            align={align}
            sideOffset={sideOffset}
            collisionPadding={collisionPadding}
            {...contentProps}
          >
            {content}
            {/* Decorative: without aria-hidden the SVG surfaced as an unnamed image */}
            <RadixTooltip.Arrow className="ds-tooltip__arrow" aria-hidden="true" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
});
Tooltip.displayName = 'Tooltip';
