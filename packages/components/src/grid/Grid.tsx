import { forwardRef } from 'react';
import type { CSSProperties, HTMLAttributes } from 'react';
import './Grid.css';

export type GridCols = 1 | 2 | 3 | 4 | 5 | 6;

export type GridGap = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24;

export type GridAlign = 'start' | 'center' | 'end' | 'stretch';

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  /** Columns below sm breakpoint. Default: 1. */
  cols?: GridCols;
  /** Columns at sm (640px+). Default: 2. */
  colsSm?: GridCols;
  /** Columns at md (768px+). Default: 3. */
  colsMd?: GridCols;
  /** Columns at lg (1024px+). Default: 4. */
  colsLg?: GridCols;
  /** Gap spacing token scale (e.g. 4 = --spacing-4 = 16px). Applies to both row and column gap. */
  gap?: GridGap;
  /** Row gap spacing token scale. Overrides `gap` on the row axis. */
  rowGap?: GridGap;
  /** Column gap spacing token scale. Overrides `gap` on the column axis. */
  columnGap?: GridGap;
  /** Block-axis alignment of items within their cells. */
  alignItems?: GridAlign;
  /** Inline-axis alignment of items within their cells. */
  justifyItems?: GridAlign;
  /**
   * Auto-fit mode: columns are derived from a minimum child width
   * instead of fixed counts. When set, `cols`/`colsSm`/`colsMd`/`colsLg`
   * are ignored at every breakpoint.
   *
   * Pass a CSS length — prefer a token reference
   * (e.g. `"var(--size-content-sm)"`) over a raw value.
   */
  minChildWidth?: string;
}

/**
 * Grid
 *
 * A responsive CSS Grid layout with token-driven gaps.
 * Default columns: 1 → 2 → 3 → 4 across breakpoints.
 * Default gap: spacing-4 (16px), stepping to spacing-6 (24px) at desktop.
 *
 * With `minChildWidth`, the grid switches to auto-fit mode:
 * `repeat(auto-fill, minmax(min(100%, <width>), 1fr))` — the column
 * count adapts to the available space and the breakpoint column
 * props are ignored.
 *
 * @example
 * <Grid cols={2} colsMd={3} colsLg={4}>
 *   {products.map(p => <ProductCard key={p.id} fluid {...p} />)}
 * </Grid>
 */
export const Grid = forwardRef<HTMLDivElement, GridProps>(function Grid(
  {
    cols,
    colsSm,
    colsMd,
    colsLg,
    gap,
    rowGap,
    columnGap,
    alignItems,
    justifyItems,
    minChildWidth,
    className,
    style,
    children,
    ...props
  },
  ref,
) {
  const cssVars: Record<string, string | number> = {};
  if (cols !== undefined) cssVars['--grid-cols'] = cols;
  if (colsSm !== undefined) cssVars['--grid-cols-sm'] = colsSm;
  if (colsMd !== undefined) cssVars['--grid-cols-md'] = colsMd;
  if (colsLg !== undefined) cssVars['--grid-cols-lg'] = colsLg;
  if (gap !== undefined) cssVars['--grid-gap'] = `var(--spacing-${gap})`;
  if (rowGap !== undefined) cssVars['--grid-row-gap'] = `var(--spacing-${rowGap})`;
  if (columnGap !== undefined) cssVars['--grid-column-gap'] = `var(--spacing-${columnGap})`;
  if (minChildWidth !== undefined) cssVars['--grid-min-child'] = minChildWidth;

  const classes = [
    'ds-grid',
    minChildWidth !== undefined && 'ds-grid--auto-fit',
    alignItems && `ds-grid--align-${alignItems}`,
    justifyItems && `ds-grid--justify-${justifyItems}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={ref}
      className={classes}
      style={{ ...style, ...cssVars } as CSSProperties}
      {...props}
    >
      {children}
    </div>
  );
});
Grid.displayName = 'Grid';
