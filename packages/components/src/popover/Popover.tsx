import * as RadixPopover from '@radix-ui/react-popover';
import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import { X } from '../icon';
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

// ─── Root ─────────────────────────────────────────────────

/**
 * Popover
 *
 * A floating panel anchored to a trigger, for rich interactive content that
 * doesn't warrant a modal — filters, size guides, mini forms, info panels.
 * Built on Radix UI Popover: focus is moved into the panel on open, trapped
 * appropriately, and returned to the trigger on close.
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
  return <RadixPopover.Root {...props}>{children}</RadixPopover.Root>;
}

// ─── Trigger ──────────────────────────────────────────────

export const PopoverTrigger = RadixPopover.Trigger;
PopoverTrigger.displayName = 'PopoverTrigger';

// ─── Anchor ───────────────────────────────────────────────

export const PopoverAnchor = RadixPopover.Anchor;
PopoverAnchor.displayName = 'PopoverAnchor';

// ─── Close ────────────────────────────────────────────────

export const PopoverClose = RadixPopover.Close;
PopoverClose.displayName = 'PopoverClose';

// ─── Content ──────────────────────────────────────────────

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
    const classes = ['ds-popover', className].filter(Boolean).join(' ');

    return (
      <RadixPopover.Portal>
        <RadixPopover.Content
          ref={ref}
          className={classes}
          side={side}
          align={align}
          sideOffset={sideOffset}
          collisionPadding={collisionPadding}
          {...props}
        >
          {children}
          {showClose && (
            <RadixPopover.Close className="ds-popover__close" aria-label="Close">
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
>(function PopoverArrow({ className, ...props }, ref) {
  return (
    <RadixPopover.Arrow
      ref={ref}
      className={['ds-popover__arrow', className].filter(Boolean).join(' ')}
      {...props}
    />
  );
});
PopoverArrow.displayName = 'PopoverArrow';
