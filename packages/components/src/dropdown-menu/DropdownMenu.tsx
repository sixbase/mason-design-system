import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef, ElementRef } from 'react';
import { Check } from '../icon';
import './DropdownMenu.css';

// ─── Types ────────────────────────────────────────────────

export type DropdownMenuSide = 'top' | 'right' | 'bottom' | 'left';
export type DropdownMenuAlign = 'start' | 'center' | 'end';
export type DropdownMenuItemVariant = 'default' | 'destructive';

/** Collision padding: 16px = var(--spacing-4). Keeps content clear of viewport edges. */
const COLLISION_PADDING = 16;

/** Gap between trigger and menu: 4px = var(--spacing-1). */
const DEFAULT_SIDE_OFFSET = 4;

export interface DropdownMenuProps
  extends ComponentPropsWithoutRef<typeof RadixDropdownMenu.Root> {}

export interface DropdownMenuContentProps
  extends ComponentPropsWithoutRef<typeof RadixDropdownMenu.Content> {
  /** Preferred side — flips automatically on collision */
  side?: DropdownMenuSide;
  /** Alignment along the trigger edge */
  align?: DropdownMenuAlign;
}

export interface DropdownMenuItemProps
  extends ComponentPropsWithoutRef<typeof RadixDropdownMenu.Item> {
  /** Visual intent — destructive for irreversible actions (delete, remove) */
  variant?: DropdownMenuItemVariant;
}

export interface DropdownMenuCheckboxItemProps
  extends ComponentPropsWithoutRef<typeof RadixDropdownMenu.CheckboxItem> {}

export interface DropdownMenuRadioGroupProps
  extends ComponentPropsWithoutRef<typeof RadixDropdownMenu.RadioGroup> {}

export interface DropdownMenuRadioItemProps
  extends ComponentPropsWithoutRef<typeof RadixDropdownMenu.RadioItem> {}

export interface DropdownMenuLabelProps
  extends ComponentPropsWithoutRef<typeof RadixDropdownMenu.Label> {}

export interface DropdownMenuSeparatorProps
  extends ComponentPropsWithoutRef<typeof RadixDropdownMenu.Separator> {}

// ─── Root ─────────────────────────────────────────────────

/**
 * DropdownMenu
 *
 * An accessible action menu built on Radix UI DropdownMenu. Full keyboard
 * navigation (arrows, typeahead, Home/End), correct menu ARIA roles, and
 * collision-aware positioning.
 *
 * Common ecommerce uses: account menu, order actions, sort/display options.
 *
 * Compound component API:
 * ```tsx
 * <DropdownMenu>
 *   <DropdownMenuTrigger asChild>
 *     <Button variant="secondary">Account</Button>
 *   </DropdownMenuTrigger>
 *   <DropdownMenuContent>
 *     <DropdownMenuItem>Profile</DropdownMenuItem>
 *     <DropdownMenuSeparator />
 *     <DropdownMenuItem variant="destructive">Sign out</DropdownMenuItem>
 *   </DropdownMenuContent>
 * </DropdownMenu>
 * ```
 */
export function DropdownMenu({ children, ...props }: DropdownMenuProps) {
  return <RadixDropdownMenu.Root {...props}>{children}</RadixDropdownMenu.Root>;
}

// ─── Trigger ──────────────────────────────────────────────

// Thin wrapper, not a bare re-export: setting `displayName` on the Radix
// part itself renames Radix's shared component for every consumer.
export const DropdownMenuTrigger = forwardRef<
  ElementRef<typeof RadixDropdownMenu.Trigger>,
  ComponentPropsWithoutRef<typeof RadixDropdownMenu.Trigger>
>(function DropdownMenuTrigger(props, ref) {
  return <RadixDropdownMenu.Trigger ref={ref} {...props} />;
});
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

// ─── Content ──────────────────────────────────────────────

export const DropdownMenuContent = forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  function DropdownMenuContent(
    {
      side = 'bottom',
      align = 'start',
      sideOffset = DEFAULT_SIDE_OFFSET,
      collisionPadding = COLLISION_PADDING,
      className,
      children,
      ...props
    },
    ref,
  ) {
    const classes = ['ds-dropdown-menu', className].filter(Boolean).join(' ');

    return (
      <RadixDropdownMenu.Portal>
        <RadixDropdownMenu.Content
          ref={ref}
          className={classes}
          side={side}
          align={align}
          sideOffset={sideOffset}
          collisionPadding={collisionPadding}
          {...props}
        >
          {children}
        </RadixDropdownMenu.Content>
      </RadixDropdownMenu.Portal>
    );
  },
);
DropdownMenuContent.displayName = 'DropdownMenuContent';

// ─── Item ─────────────────────────────────────────────────

export const DropdownMenuItem = forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  function DropdownMenuItem({ variant = 'default', className, ...props }, ref) {
    const classes = [
      'ds-dropdown-menu__item',
      variant === 'destructive' && 'ds-dropdown-menu__item--destructive',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return <RadixDropdownMenu.Item ref={ref} className={classes} {...props} />;
  },
);
DropdownMenuItem.displayName = 'DropdownMenuItem';

// ─── CheckboxItem ─────────────────────────────────────────

export const DropdownMenuCheckboxItem = forwardRef<
  HTMLDivElement,
  DropdownMenuCheckboxItemProps
>(function DropdownMenuCheckboxItem({ className, children, ...props }, ref) {
  const classes = [
    'ds-dropdown-menu__item',
    'ds-dropdown-menu__item--indented',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <RadixDropdownMenu.CheckboxItem ref={ref} className={classes} {...props}>
      <span className="ds-dropdown-menu__indicator-slot" aria-hidden="true">
        <RadixDropdownMenu.ItemIndicator className="ds-dropdown-menu__indicator">
          <Check size="sm" />
        </RadixDropdownMenu.ItemIndicator>
      </span>
      {children}
    </RadixDropdownMenu.CheckboxItem>
  );
});
DropdownMenuCheckboxItem.displayName = 'DropdownMenuCheckboxItem';

// ─── RadioGroup + RadioItem ───────────────────────────────

export const DropdownMenuRadioGroup = forwardRef<HTMLDivElement, DropdownMenuRadioGroupProps>(
  function DropdownMenuRadioGroup(props, ref) {
    return <RadixDropdownMenu.RadioGroup ref={ref} {...props} />;
  },
);
DropdownMenuRadioGroup.displayName = 'DropdownMenuRadioGroup';

export const DropdownMenuRadioItem = forwardRef<HTMLDivElement, DropdownMenuRadioItemProps>(
  function DropdownMenuRadioItem({ className, children, ...props }, ref) {
    const classes = [
      'ds-dropdown-menu__item',
      'ds-dropdown-menu__item--indented',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <RadixDropdownMenu.RadioItem ref={ref} className={classes} {...props}>
        <span className="ds-dropdown-menu__indicator-slot" aria-hidden="true">
          <RadixDropdownMenu.ItemIndicator className="ds-dropdown-menu__indicator">
            <span className="ds-dropdown-menu__radio-dot" />
          </RadixDropdownMenu.ItemIndicator>
        </span>
        {children}
      </RadixDropdownMenu.RadioItem>
    );
  },
);
DropdownMenuRadioItem.displayName = 'DropdownMenuRadioItem';

// ─── Label ────────────────────────────────────────────────

export const DropdownMenuLabel = forwardRef<HTMLDivElement, DropdownMenuLabelProps>(
  function DropdownMenuLabel({ className, ...props }, ref) {
    return (
      <RadixDropdownMenu.Label
        ref={ref}
        className={['ds-dropdown-menu__label', className].filter(Boolean).join(' ')}
        {...props}
      />
    );
  },
);
DropdownMenuLabel.displayName = 'DropdownMenuLabel';

// ─── Separator ────────────────────────────────────────────

export const DropdownMenuSeparator = forwardRef<HTMLDivElement, DropdownMenuSeparatorProps>(
  function DropdownMenuSeparator({ className, ...props }, ref) {
    return (
      <RadixDropdownMenu.Separator
        ref={ref}
        className={['ds-dropdown-menu__separator', className].filter(Boolean).join(' ')}
        {...props}
      />
    );
  },
);
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';
