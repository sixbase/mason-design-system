import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import './layout-grid.css';

// ─── LayoutGrid ───────────────────────────────────────────────
//
// React API over the layout grid system defined in layout-grid.css.
// The CSS is the source of truth (see docs/playbook/09-layout-grid.md);
// these components only compose the existing classes:
//
//   .ds-page-container   → <PageContainer>
//   .ds-section          → <Section>
//   .ds-layout--*        → <LayoutGrid variant="…">
//   .ds-layout__sticky   → <LayoutGridItem sticky>
//   .ds-layout__span-all → <LayoutGridItem spanAll>

/** Column split variants — see docs/playbook/09-layout-grid.md */
export type LayoutGridVariant =
  | 'full'
  | 'halves'
  | 'golden'
  | 'golden-reverse'
  | 'thirds'
  | 'quarters'
  | 'wide-narrow';

export interface LayoutGridProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Column split. Defaults to 'full' (every child spans 12 columns).
   * Use 'golden' (7+5) as the default choice for two-column layouts.
   */
  variant?: LayoutGridVariant;
  /** Adds `.ds-section` for the 64px section rhythm (`--spacing-16`). */
  section?: boolean;
}

/**
 * LayoutGrid
 *
 * 12-column CSS Grid for section-level page composition.
 * Renders `.ds-layout` with a split modifier. All layouts collapse
 * to a single column below 768px (handled by the CSS).
 *
 * Not for repeating card grids — use `Grid` for those.
 *
 * @example
 * <LayoutGrid variant="golden" section>
 *   <LayoutGridItem>Primary content (7 cols)</LayoutGridItem>
 *   <LayoutGridItem sticky>Sticky sidebar (5 cols)</LayoutGridItem>
 * </LayoutGrid>
 */
export const LayoutGrid = forwardRef<HTMLDivElement, LayoutGridProps>(function LayoutGrid(
  { variant = 'full', section = false, className, children, ...props },
  ref,
) {
  const classes = [
    'ds-layout',
    `ds-layout--${variant}`,
    section && 'ds-section',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={ref} className={classes} {...props}>
      {children}
    </div>
  );
});

LayoutGrid.displayName = 'LayoutGrid';

// ─── LayoutGridItem ───────────────────────────────────────────

export interface LayoutGridItemProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Sticky column (PDP details, cart summary). Sticks 24px from the
   * viewport top; becomes static below 768px when the grid stacks.
   */
  sticky?: boolean;
  /** Span the full grid width (`grid-column: 1 / -1`) regardless of variant. */
  spanAll?: boolean;
}

/**
 * LayoutGridItem
 *
 * Direct child of `LayoutGrid`. Column spans come from the parent
 * variant's positional rules; this component only adds the sticky
 * and span-all utilities.
 */
export const LayoutGridItem = forwardRef<HTMLDivElement, LayoutGridItemProps>(
  function LayoutGridItem({ sticky = false, spanAll = false, className, children, ...props }, ref) {
    const classes = [
      sticky && 'ds-layout__sticky',
      spanAll && 'ds-layout__span-all',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={classes || undefined} {...props}>
        {children}
      </div>
    );
  },
);

LayoutGridItem.displayName = 'LayoutGridItem';

// ─── PageContainer ────────────────────────────────────────────

export type PageContainerElement = 'div' | 'main';

export interface PageContainerProps extends HTMLAttributes<HTMLElement> {
  /** Element to render. Use 'main' when wrapping the page's main content. */
  as?: PageContainerElement;
}

/**
 * PageContainer
 *
 * The page-level container: `--size-container` (1200px) max-width,
 * centered, responsive padding. One per page — never nested.
 * For non-page contexts use `Container` instead.
 */
export const PageContainer = forwardRef<HTMLElement, PageContainerProps>(function PageContainer(
  { as: Tag = 'div', className, children, ...props },
  ref,
) {
  return (
    <Tag
      ref={ref as never}
      className={['ds-page-container', className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </Tag>
  );
});

PageContainer.displayName = 'PageContainer';

// ─── Section ──────────────────────────────────────────────────

export type SectionElement = 'section' | 'div';

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  /** Element to render. Defaults to the semantic `section`. */
  as?: SectionElement;
}

/**
 * Section
 *
 * Major page division with the 64px (`--spacing-16`) vertical rhythm.
 * Use between major content blocks only — not for internal component
 * spacing.
 */
export const Section = forwardRef<HTMLElement, SectionProps>(function Section(
  { as: Tag = 'section', className, children, ...props },
  ref,
) {
  return (
    <Tag
      ref={ref as never}
      className={['ds-section', className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </Tag>
  );
});

Section.displayName = 'Section';
