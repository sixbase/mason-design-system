import * as TabsPrimitive from '@radix-ui/react-tabs';
import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { Badge } from '../badge';
import './Tabs.css';

// ─── Types ────────────────────────────────────────────────

export interface TabsProps extends ComponentPropsWithoutRef<typeof TabsPrimitive.Root> {}

export interface TabsListProps extends ComponentPropsWithoutRef<typeof TabsPrimitive.List> {}

export interface TabsTriggerProps extends ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  /**
   * Optional badge shown after the label — e.g. a review count.
   * Strings and numbers render inside a secondary `<Badge>`;
   * any other node renders as-is.
   */
  badge?: ReactNode;
}

export interface TabsContentProps extends ComponentPropsWithoutRef<typeof TabsPrimitive.Content> {}

// ─── Root ─────────────────────────────────────────────────

/**
 * Tabs
 *
 * A tabbed content switcher for organizing related content into panels.
 * Built on Radix UI Tabs for full keyboard and screen reader support.
 *
 * Compound component API:
 * ```tsx
 * <Tabs defaultValue="description">
 *   <TabsList>
 *     <TabsTrigger value="description">Description</TabsTrigger>
 *     <TabsTrigger value="reviews">Reviews</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="description">Product description...</TabsContent>
 *   <TabsContent value="reviews">Customer reviews...</TabsContent>
 * </Tabs>
 * ```
 */
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  function Tabs({ className, ...props }, ref) {
    const classes = ['ds-tabs', className].filter(Boolean).join(' ');
    return <TabsPrimitive.Root ref={ref} className={classes} {...props} />;
  },
);
Tabs.displayName = 'Tabs';

// ─── List ─────────────────────────────────────────────────

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  function TabsList({ className, ...props }, ref) {
    const classes = ['ds-tabs__list', className].filter(Boolean).join(' ');
    return <TabsPrimitive.List ref={ref} className={classes} {...props} />;
  },
);
TabsList.displayName = 'TabsList';

// ─── Trigger ──────────────────────────────────────────────

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  function TabsTrigger({ className, badge, children, ...props }, ref) {
    const classes = ['ds-tabs__trigger', className].filter(Boolean).join(' ');
    return (
      <TabsPrimitive.Trigger ref={ref} className={classes} {...props}>
        <span className="ds-tabs__trigger-label">{children}</span>
        {badge != null &&
          (typeof badge === 'string' || typeof badge === 'number' ? (
            <Badge size="sm" variant="secondary" className="ds-tabs__badge">
              {badge}
            </Badge>
          ) : (
            <span className="ds-tabs__badge">{badge}</span>
          ))}
      </TabsPrimitive.Trigger>
    );
  },
);
TabsTrigger.displayName = 'TabsTrigger';

// ─── Content ──────────────────────────────────────────────

export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  function TabsContent({ className, ...props }, ref) {
    const classes = ['ds-tabs__content', className].filter(Boolean).join(' ');
    return <TabsPrimitive.Content ref={ref} className={classes} {...props} />;
  },
);
TabsContent.displayName = 'TabsContent';
