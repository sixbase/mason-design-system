import {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useId,
} from 'react';
import type {
  CSSProperties,
  HTMLAttributes,
  ReactElement,
  ReactNode,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from 'react';
import { devWarning } from '../internal/dev-warning';
import { Text } from '../typography';
import './Table.css';

// ─── Contexts ───────────────────────────────────────────────
//
// Stack mode needs each body cell to know its column header so the
// CSS can render it as a label (`content: attr(data-label)`).
// Table extracts the header text once and provides it via context;
// Table.Row injects `data-label` into its Table.Cell children.

/** Column header labels — provided by Table when `responsive="stack"`. */
const TableLabelsContext = createContext<string[] | null>(null);

/** Which table section a row belongs to. */
const TableSectionContext = createContext<'header' | 'body' | null>(null);

/** Flattens a ReactNode tree to its text content. */
function extractText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (isValidElement(node)) {
    return extractText((node.props as { children?: ReactNode }).children);
  }
  return '';
}

/** Columns a cell occupies (`colSpan`, default 1). */
function spanOf(cell: ReactElement): number {
  const span = Number((cell.props as { colSpan?: number | string }).colSpan);
  return Number.isFinite(span) && span > 1 ? span : 1;
}

/** Collects header cell text from Table children (Header → Row → Head). */
function extractHeaderLabels(children: ReactNode): string[] {
  const labels: string[] = [];
  Children.forEach(children, (section) => {
    if (!isValidElement(section) || section.type !== TableHeader) return;
    const sectionChildren = (section.props as { children?: ReactNode }).children;
    Children.forEach(sectionChildren, (row) => {
      if (!isValidElement(row) || row.type !== TableRow) return;
      const rowChildren = (row.props as { children?: ReactNode }).children;
      Children.forEach(rowChildren, (head) => {
        if (isValidElement(head) && head.type === TableHead) {
          // A colSpan header labels every column it covers.
          const text = extractText((head.props as { children?: ReactNode }).children);
          for (let i = 0; i < spanOf(head); i += 1) labels.push(text);
        }
      });
    });
  });
  return labels;
}

// ─── Table ──────────────────────────────────────────────────

export type TableVariant = 'default' | 'striped';
export type TableSize = 'sm' | 'md';
export type TableResponsive = 'scroll' | 'stack';

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  /** Row style variant */
  variant?: TableVariant;
  /** Cell padding density */
  size?: TableSize;
  /** Sticky header on vertical scroll */
  stickyHeader?: boolean;
  /**
   * Bounds the table's own scroll area (any CSS length — prefer a token,
   * e.g. `"var(--size-modal-sm)"`). Required for `stickyHeader`: the
   * wrapper scrolls horizontally, which makes it the header's scroll
   * container, so the header can only stick inside a height-bounded
   * wrapper — never to the page.
   */
  maxHeight?: string;
  /**
   * Mobile strategy below the sm breakpoint:
   * - `'scroll'` (default) — keeps the horizontal scroll region
   * - `'stack'` — each row renders as a card; cells show their
   *   column header as a label (markup stays a semantic `<table>`)
   */
  responsive?: TableResponsive;
}

export const Table = forwardRef<HTMLTableElement, TableProps>(function Table(
  {
    variant = 'default',
    size = 'md',
    stickyHeader = false,
    responsive = 'scroll',
    maxHeight,
    className,
    children,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    ...props
  },
  ref,
) {
  const isStack = responsive === 'stack';
  const labels = isStack ? extractHeaderLabels(children) : null;

  // Name the scroll region from what names the table: aria-labelledby,
  // aria-label, or a <caption> child. No generic fallback — a fixed
  // "Data table" gave every table on a page the same landmark name
  // (axe landmark-unique).
  const generatedCaptionId = useId();
  let captionId: string | undefined;
  const content = Children.map(children, (child) => {
    if (!isValidElement(child) || child.type !== 'caption') return child;
    const caption = child as ReactElement<{ id?: string }>;
    captionId = caption.props.id ?? generatedCaptionId;
    return caption.props.id ? caption : cloneElement(caption, { id: captionId });
  });
  const regionLabelledBy = ariaLabelledBy ?? (ariaLabel ? undefined : captionId);
  // An unnamed role="region" still counts as a landmark to axe, and two
  // of them collide — only claim the role when there is a name for it.
  const isNamedRegion = Boolean(ariaLabel || regionLabelledBy);

  // The wrapper is always a tab stop (below), so an unnamed table puts
  // keyboard focus on a region announced with no name at all — screen
  // readers say just "group" or nothing. There is no safe generic name
  // (see above), so tell the developer instead.
  if (!isNamedRegion) {
    devWarning(
      'Table:unnamed',
      'Table: the table\'s scroll area is a keyboard tab stop but has no accessible name — add a <caption>, `aria-label` or `aria-labelledby`.',
    );
  }

  const classes = [
    'ds-table-wrapper',
    isStack && 'ds-table-wrapper--stack',
    stickyHeader && 'ds-table-wrapper--sticky',
    className,
  ].filter(Boolean).join(' ');

  const tableClasses = [
    'ds-table',
    `ds-table--${variant}`,
    `ds-table--${size}`,
    stickyHeader && 'ds-table--sticky-header',
    isStack && 'ds-table--stack',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      role={isNamedRegion ? 'region' : undefined}
      aria-label={ariaLabel}
      aria-labelledby={regionLabelledBy}
      style={
        maxHeight !== undefined
          ? ({ '--table-max-height': maxHeight } as CSSProperties)
          : undefined
      }
      // Scrollable region: keyboard users need a tab stop to scroll
      // wide tables with arrow keys (WAI scrollable-region pattern).
      tabIndex={0}
    >
      <TableLabelsContext.Provider value={labels}>
        {/* Explicit roles keep table semantics intact when stack mode
            overrides `display` below the sm breakpoint. */}
        <table
          ref={ref}
          role={isStack ? 'table' : undefined}
          className={tableClasses}
          aria-labelledby={ariaLabelledBy}
          {...props}
        >
          {content}
        </table>
      </TableLabelsContext.Provider>
    </div>
  );
}) as TableComponent;

Table.displayName = 'Table';

// ─── Table.Header ───────────────────────────────────────────

export type TableHeaderProps = HTMLAttributes<HTMLTableSectionElement>;

const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(function TableHeader(
  { className, ...props },
  ref,
) {
  const isStack = useContext(TableLabelsContext) != null;
  const classes = ['ds-table__header', className].filter(Boolean).join(' ');
  return (
    <TableSectionContext.Provider value="header">
      <thead ref={ref} role={isStack ? 'rowgroup' : undefined} className={classes} {...props} />
    </TableSectionContext.Provider>
  );
});

TableHeader.displayName = 'Table.Header';

// ─── Table.Body ─────────────────────────────────────────────

export type TableBodyProps = HTMLAttributes<HTMLTableSectionElement>;

const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(function TableBody(
  { className, ...props },
  ref,
) {
  const isStack = useContext(TableLabelsContext) != null;
  const classes = ['ds-table__body', className].filter(Boolean).join(' ');
  return (
    <TableSectionContext.Provider value="body">
      <tbody ref={ref} role={isStack ? 'rowgroup' : undefined} className={classes} {...props} />
    </TableSectionContext.Provider>
  );
});

TableBody.displayName = 'Table.Body';

// ─── Table.Row ──────────────────────────────────────────────

export type TableRowProps = HTMLAttributes<HTMLTableRowElement>;

const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow(
  { className, children, ...props },
  ref,
) {
  const classes = ['ds-table__row', className].filter(Boolean).join(' ');
  const labels = useContext(TableLabelsContext);
  const section = useContext(TableSectionContext);

  // Stack mode: inject each cell's column header as data-label. The
  // column index advances for row headers (Table.Head scope="row") and
  // by colSpan, so labels stay aligned with their columns.
  let content = children;
  if (labels && section === 'body') {
    let column = 0;
    content = Children.map(children, (child) => {
      if (!isValidElement(child)) return child;
      const index = column;
      if (child.type === TableCell || child.type === TableHead) column += spanOf(child);
      if (child.type === TableCell) {
        const cell = child as ReactElement<TableCellProps>;
        const label = labels[index];
        if (cell.props['data-label'] === undefined && label !== undefined && label !== '') {
          return cloneElement(cell, { 'data-label': label });
        }
      }
      return child;
    });
  }

  return (
    <tr ref={ref} role={labels ? 'row' : undefined} className={classes} {...props}>
      {content}
    </tr>
  );
});

TableRow.displayName = 'Table.Row';

// ─── Table.Head ─────────────────────────────────────────────

export interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  /** Sort direction indicator */
  sorted?: 'asc' | 'desc' | false;
  /** Renders the header content inside a sort button (implied by `onSort`) */
  sortable?: boolean;
  /** Called when the sort button is activated */
  onSort?: () => void;
}

const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(function TableHead(
  { sorted, sortable, onSort, className, children, ...props },
  ref,
) {
  const isSortable = Boolean(sortable) || onSort != null;

  const classes = [
    'ds-table__head',
    sorted && 'ds-table__head--sorted',
    isSortable && 'ds-table__head--sortable',
    className,
  ].filter(Boolean).join(' ');

  const isStack = useContext(TableLabelsContext) != null;
  // A th in the body is a row header (the row's title), not a column header.
  const inBody = useContext(TableSectionContext) === 'body';
  const scope = props.scope ?? (inBody ? 'row' : 'col');

  const ariaSort =
    sorted === 'asc'
      ? 'ascending'
      : sorted === 'desc'
        ? 'descending'
        : isSortable
          ? 'none'
          : undefined;

  const iconClasses = [
    'ds-table__sort-icon',
    isSortable && !sorted && 'ds-table__sort-icon--idle',
  ].filter(Boolean).join(' ');

  return (
    <th
      ref={ref}
      className={classes}
      scope={scope}
      role={isStack ? (scope === 'row' ? 'rowheader' : 'columnheader') : undefined}
      aria-sort={ariaSort}
      {...props}
    >
      {isSortable ? (
        <button type="button" className="ds-table__sort-button" onClick={onSort}>
          {children}
          <span className={iconClasses} aria-hidden="true">
            {sorted === 'asc' ? '↑' : sorted === 'desc' ? '↓' : '↕'}
          </span>
        </button>
      ) : (
        <>
          {children}
          {sorted && (
            <span className="ds-table__sort-icon" aria-hidden="true">
              {sorted === 'asc' ? '↑' : '↓'}
            </span>
          )}
        </>
      )}
    </th>
  );
});

TableHead.displayName = 'Table.Head';

// ─── Table.Cell ─────────────────────────────────────────────

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  /**
   * Column label shown in stack mode. Injected automatically from the
   * matching Table.Head when the Table has `responsive="stack"` —
   * set explicitly only to override.
   */
  'data-label'?: string;
}

const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell(
  { className, children, ...props },
  ref,
) {
  const isStack = useContext(TableLabelsContext) != null;
  const classes = ['ds-table__cell', className].filter(Boolean).join(' ');
  // Stack mode lays a labelled cell out as a 2-column grid (label | value).
  // Wrap the content so multi-part values ("Shipped" + <Badge>, two
  // action buttons) stay in the value column instead of each part
  // becoming its own grid item and wrapping under the label.
  const content =
    isStack && props['data-label'] ? (
      <div className="ds-table__cell-value">{children}</div>
    ) : (
      children
    );
  return (
    <td ref={ref} role={isStack ? 'cell' : undefined} className={classes} {...props}>
      {content}
    </td>
  );
});

TableCell.displayName = 'Table.Cell';

// ─── Table.Empty ────────────────────────────────────────────

export interface TableEmptyProps extends HTMLAttributes<HTMLTableRowElement> {
  /** Number of columns to span */
  colSpan: number;
  /** Message to display */
  message?: string;
}

const TableEmpty = forwardRef<HTMLTableRowElement, TableEmptyProps>(function TableEmpty(
  { colSpan, message = 'No data available', className, ...props },
  ref,
) {
  const isStack = useContext(TableLabelsContext) != null;
  const classes = ['ds-table__row', 'ds-table__row--empty', className].filter(Boolean).join(' ');
  return (
    <tr ref={ref} role={isStack ? 'row' : undefined} className={classes} {...props}>
      <td
        className="ds-table__cell ds-table__cell--empty"
        role={isStack ? 'cell' : undefined}
        colSpan={colSpan}
      >
        <Text as="span" size="sm" muted>
          {message}
        </Text>
      </td>
    </tr>
  );
});

TableEmpty.displayName = 'Table.Empty';

// ─── Compound export ────────────────────────────────────────

interface TableComponent
  extends React.ForwardRefExoticComponent<TableProps & React.RefAttributes<HTMLTableElement>> {
  Header: typeof TableHeader;
  Body: typeof TableBody;
  Row: typeof TableRow;
  Head: typeof TableHead;
  Cell: typeof TableCell;
  Empty: typeof TableEmpty;
}

Table.Header = TableHeader;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Head = TableHead;
Table.Cell = TableCell;
Table.Empty = TableEmpty;

// Flat named exports — the library-wide compound convention (ModalHeader,
// TabsTrigger, AccordionItem). `Table.Header` dot access keeps working;
// the flat names also survive React Server Component boundaries, where
// property access on a client component reference is not allowed.
export { TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty };
