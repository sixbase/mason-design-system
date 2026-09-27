import * as TabsPrimitive from '@radix-ui/react-tabs';
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
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
  function Tabs({ className, onValueChange, ...props }, ref) {
    // Panels rise in when the tab changes, not on page load: the first panel
    // (often above the fold — product details) just shows. A switch is a
    // tab picked here, or a controlled `value` that moved since mount (a
    // "Read reviews" link).
    const [picked, setPicked] = useState(false);
    const initialValue = useRef(props.value);
    const valueMoved = useRef(false); // sticky: a/b/a still counts as switched
    if (props.value !== initialValue.current) valueMoved.current = true;
    const switched = picked || valueMoved.current;
    const handleValueChange = useCallback(
      (value: string) => {
        setPicked(true);
        onValueChange?.(value);
      },
      [onValueChange],
    );
    const classes = ['ds-tabs', switched && 'ds-tabs--switched', className]
      .filter(Boolean)
      .join(' ');
    return (
      <TabsPrimitive.Root
        ref={ref}
        className={classes}
        onValueChange={handleValueChange}
        {...props}
      />
    );
  },
);
Tabs.displayName = 'Tabs';

// ─── List ─────────────────────────────────────────────────

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  function TabsList({ className, ...props }, ref) {
    const classes = ['ds-tabs__list', className].filter(Boolean).join(' ');
    const listRef = useRef<HTMLDivElement | null>(null);

    // Merge forwarded ref with internal ref
    const setListRef = useCallback(
      (node: HTMLDivElement | null) => {
        listRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );

    // Keep the selected tab inside the scrollable list. Keyboard focus
    // already scrolls itself into view, but a selection that doesn't move
    // focus — an off-screen `defaultValue`, or a controlled change from a
    // "Read reviews" link — left the active tab hidden past the edge on
    // narrow screens. Adjusts scrollLeft only (never scrollIntoView, which
    // would also scroll the page vertically).
    useEffect(() => {
      const list = listRef.current;
      if (!list) return;

      const revealActive = () => {
        const active = list.querySelector<HTMLElement>('[role="tab"][data-state="active"]');
        if (!active) return;
        const listBox = list.getBoundingClientRect();
        const tabBox = active.getBoundingClientRect();
        if (tabBox.left < listBox.left) {
          list.scrollLeft -= listBox.left - tabBox.left;
        } else if (tabBox.right > listBox.right) {
          list.scrollLeft += tabBox.right - listBox.right;
        }
      };

      revealActive();
      if (typeof MutationObserver === 'undefined') return;
      const observer = new MutationObserver(revealActive);
      observer.observe(list, {
        subtree: true,
        attributes: true,
        attributeFilter: ['data-state'],
      });
      return () => observer.disconnect();
    }, []);

    return <TabsPrimitive.List ref={setListRef} className={classes} {...props} />;
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
