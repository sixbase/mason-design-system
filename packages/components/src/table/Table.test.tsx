import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resetDevWarnings } from '../internal/dev-warning';
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from './Table';

/** Helper: renders a basic labelled table with header + body */
function renderTable(props: Record<string, unknown> = {}) {
  return render(
    <Table aria-label="Size chart" {...props}>
      <Table.Header>
        <Table.Row>
          <Table.Head>Name</Table.Head>
          <Table.Head>Value</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <Table.Row>
          <Table.Cell>Width</Table.Cell>
          <Table.Cell>100cm</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Height</Table.Cell>
          <Table.Cell>50cm</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>,
  );
}

describe('Table', () => {
  /* ─── Rendering ──────────────────────────────────────────── */

  it('renders a table element', () => {
    renderTable();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('renders header cells as th with scope="col"', () => {
    renderTable();
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(2);
    expect(headers[0]).toHaveAttribute('scope', 'col');
  });

  it('renders body cells as td', () => {
    renderTable();
    const cells = screen.getAllByRole('cell');
    expect(cells).toHaveLength(4);
  });

  it('renders rows', () => {
    renderTable();
    // 1 header row + 2 body rows
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(3);
  });

  /* ─── Variant classes ────────────────────────────────────── */

  it('applies default variant class', () => {
    renderTable();
    expect(screen.getByRole('table')).toHaveClass('ds-table--default');
  });

  it('applies striped variant class', () => {
    renderTable({ variant: 'striped' });
    expect(screen.getByRole('table')).toHaveClass('ds-table--striped');
  });

  /* ─── Size classes ───────────────────────────────────────── */

  it('applies default md size class', () => {
    renderTable();
    expect(screen.getByRole('table')).toHaveClass('ds-table--md');
  });

  it('applies sm size class', () => {
    renderTable({ size: 'sm' });
    expect(screen.getByRole('table')).toHaveClass('ds-table--sm');
  });

  /* ─── Sticky header ─────────────────────────────────────── */

  it('applies sticky header class', () => {
    renderTable({ stickyHeader: true });
    expect(screen.getByRole('table')).toHaveClass('ds-table--sticky-header');
  });

  it('does not apply sticky header class by default', () => {
    renderTable();
    expect(screen.getByRole('table')).not.toHaveClass('ds-table--sticky-header');
  });

  /* ─── Scroll wrapper ────────────────────────────────────── */

  it('wraps table in a scrollable region', () => {
    renderTable();
    const region = screen.getByRole('region');
    expect(region).toBeInTheDocument();
    expect(region).toHaveClass('ds-table-wrapper');
  });

  it('scroll region is keyboard-focusable with tabindex="0"', () => {
    renderTable();
    const region = screen.getByRole('region');
    expect(region).toHaveAttribute('tabindex', '0');
  });

  it('scroll region has an accessible label', () => {
    renderTable({ 'aria-label': 'Size chart' });
    expect(screen.getByRole('region', { name: 'Size chart' })).toBeInTheDocument();
  });

  // Regression: the region was always named "Data table", ignoring
  // aria-labelledby and <caption>, and two tables on one page produced
  // duplicate landmarks (axe landmark-unique).
  it('names the region from aria-labelledby', () => {
    render(
      <>
        <span id="orders-title">Orders</span>
        <Table aria-labelledby="orders-title">
          <Table.Body><Table.Row><Table.Cell>1</Table.Cell></Table.Row></Table.Body>
        </Table>
      </>,
    );
    expect(screen.getByRole('region', { name: 'Orders' })).toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Orders' })).toBeInTheDocument();
  });

  it('names the region from a caption', () => {
    render(
      <Table>
        <caption>Recent orders</caption>
        <Table.Body><Table.Row><Table.Cell>1</Table.Cell></Table.Row></Table.Body>
      </Table>,
    );
    expect(screen.getByRole('region', { name: 'Recent orders' })).toBeInTheDocument();
  });

  it('does not create duplicate landmarks for unlabelled tables', async () => {
    const { container } = render(
      <div>
        <Table><Table.Body><Table.Row><Table.Cell>1</Table.Cell></Table.Row></Table.Body></Table>
        <Table><Table.Body><Table.Row><Table.Cell>2</Table.Cell></Table.Row></Table.Body></Table>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
    // Still a keyboard-scrollable area
    expect(container.querySelectorAll('.ds-table-wrapper[tabindex="0"]')).toHaveLength(2);
  });

  // The scroll wrapper is always a tab stop; unnamed, keyboard focus lands
  // on a region with no name. There is no safe default name, so the
  // developer is warned (development builds only).
  describe('dev warnings', () => {
    beforeEach(() => resetDevWarnings());

    it('warns when the focusable table has no caption, aria-label or aria-labelledby', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        render(<Table><Table.Body><Table.Row><Table.Cell>1</Table.Cell></Table.Row></Table.Body></Table>);
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('Table: the table\'s scroll area is a keyboard tab stop but has no accessible name'));
      } finally {
        warn.mockRestore();
      }
    });

    it('stays quiet when a caption, aria-label or aria-labelledby names it', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        render(
          <>
            <span id="t-title">Orders</span>
            <Table aria-label="Size chart"><Table.Body><Table.Row><Table.Cell>1</Table.Cell></Table.Row></Table.Body></Table>
            <Table aria-labelledby="t-title"><Table.Body><Table.Row><Table.Cell>2</Table.Cell></Table.Row></Table.Body></Table>
            <Table>
              <caption>Recent orders</caption>
              <Table.Body><Table.Row><Table.Cell>3</Table.Cell></Table.Row></Table.Body>
            </Table>
          </>,
        );
        expect(warn).not.toHaveBeenCalled();
      } finally {
        warn.mockRestore();
      }
    });
  });

  // Regression: the wrapper's overflow-x makes it the sticky header's
  // scroll container, but nothing bounded its height — the header never
  // stuck. maxHeight now bounds the table's own scroll area.
  it('bounds the scroll area for a sticky header via maxHeight', () => {
    const { container } = render(
      <Table stickyHeader maxHeight="var(--size-modal-md)" aria-label="Sizes">
        <Table.Body><Table.Row><Table.Cell>1</Table.Cell></Table.Row></Table.Body>
      </Table>,
    );
    const wrapper = container.querySelector('.ds-table-wrapper') as HTMLElement;
    expect(wrapper).toHaveClass('ds-table-wrapper--sticky');
    expect(wrapper.style.getPropertyValue('--table-max-height')).toBe('var(--size-modal-md)');
  });

  // Regression: the bound sat on the sticky-only rule, so maxHeight
  // without stickyHeader was silently ignored.
  it('bounds the scroll area via maxHeight without a sticky header too', () => {
    const style = document.createElement('style');
    style.textContent = readFileSync(resolve(__dirname, 'Table.css'), 'utf8');
    document.head.appendChild(style);
    try {
      const { container } = render(
        <Table maxHeight="var(--size-modal-sm)" aria-label="Sizes">
          <Table.Body><Table.Row><Table.Cell>1</Table.Cell></Table.Row></Table.Body>
        </Table>,
      );
      const wrapper = container.querySelector('.ds-table-wrapper') as HTMLElement;
      expect(wrapper).not.toHaveClass('ds-table-wrapper--sticky');
      expect(getComputedStyle(wrapper).maxHeight).toBe('var(--table-max-height)');
      expect(wrapper.style.getPropertyValue('--table-max-height')).toBe('var(--size-modal-sm)');
    } finally {
      style.remove();
    }
  });

  /* ─── Responsive: stack ─────────────────────────────────── */

  it('injects column headers as data-label on cells in stack mode', () => {
    renderTable({ responsive: 'stack' });
    const cells = screen.getAllByRole('cell');
    expect(cells[0]).toHaveAttribute('data-label', 'Name');
    expect(cells[1]).toHaveAttribute('data-label', 'Value');
    expect(cells[2]).toHaveAttribute('data-label', 'Name');
    expect(cells[3]).toHaveAttribute('data-label', 'Value');
  });

  it('does not inject data-label in scroll mode', () => {
    renderTable();
    const cells = screen.getAllByRole('cell');
    expect(cells[0]).not.toHaveAttribute('data-label');
  });

  it('applies stack classes to wrapper and table', () => {
    renderTable({ responsive: 'stack' });
    expect(screen.getByRole('region')).toHaveClass('ds-table-wrapper--stack');
    expect(screen.getByRole('table')).toHaveClass('ds-table--stack');
  });

  it('keeps semantic table markup in stack mode', () => {
    renderTable({ responsive: 'stack' });
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader')).toHaveLength(2);
    expect(screen.getAllByRole('row')).toHaveLength(3);
  });

  // Regression: a row header (Table.Head in the body) didn't advance the
  // column index, so every label after it was shifted one column left.
  it('keeps stack labels aligned after a row header and colSpan', () => {
    render(
      <Table responsive="stack" aria-label="Mugs">
        <Table.Header>
          <Table.Row>
            <Table.Head>Product</Table.Head>
            <Table.Head colSpan={2}>Price</Table.Head>
            <Table.Head>Stock</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Head>Camp mug</Table.Head>
            <Table.Cell>$18</Table.Cell>
            <Table.Cell>USD</Table.Cell>
            <Table.Cell>12</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>,
    );
    expect(screen.getByText('$18').closest('td')).toHaveAttribute('data-label', 'Price');
    expect(screen.getByText('USD').closest('td')).toHaveAttribute('data-label', 'Price');
    expect(screen.getByText('12').closest('td')).toHaveAttribute('data-label', 'Stock');
  });

  // Regression: body headers got role="columnheader" in stack mode and
  // scope="col" by default.
  it('treats a body Table.Head as a row header', () => {
    render(
      <Table responsive="stack" aria-label="Mugs">
        <Table.Header><Table.Row><Table.Head>Product</Table.Head><Table.Head>Price</Table.Head></Table.Row></Table.Header>
        <Table.Body><Table.Row><Table.Head>Camp mug</Table.Head><Table.Cell>$18</Table.Cell></Table.Row></Table.Body>
      </Table>,
    );
    const rowHeader = screen.getByRole('rowheader', { name: 'Camp mug' });
    expect(rowHeader).toHaveAttribute('scope', 'row');
  });

  // Regression: each child of a labelled cell became its own item in the
  // label | value grid, so a second part (a Badge, a second button)
  // wrapped under the label column.
  it('wraps multi-part stack cell content in one value element', () => {
    render(
      <Table responsive="stack" aria-label="Orders">
        <Table.Header><Table.Row><Table.Head>Status</Table.Head></Table.Row></Table.Header>
        <Table.Body><Table.Row><Table.Cell>Shipped <span>Today</span></Table.Cell></Table.Row></Table.Body>
      </Table>,
    );
    const cell = screen.getByRole('cell');
    expect(cell.children).toHaveLength(1);
    expect(cell.firstElementChild).toHaveClass('ds-table__cell-value');
    expect(cell).toHaveTextContent('Shipped Today');
  });

  it('respects an explicit data-label override on a cell', () => {
    render(
      <Table responsive="stack">
        <Table.Header>
          <Table.Row>
            <Table.Head>Name</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell data-label="Custom">Width</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>,
    );
    expect(screen.getByRole('cell')).toHaveAttribute('data-label', 'Custom');
  });

  it('has no accessibility violations in stack mode', async () => {
    const { container } = render(
      <Table responsive="stack" aria-label="Stacked specifications">
        <Table.Header>
          <Table.Row>
            <Table.Head>Property</Table.Head>
            <Table.Head>Value</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Width</Table.Cell>
            <Table.Cell>100cm</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  /* ─── Sort indicator ────────────────────────────────────── */

  it('renders ascending sort indicator', () => {
    render(
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head sorted="asc">Price</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>$10</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>,
    );
    const header = screen.getByRole('columnheader');
    expect(header).toHaveAttribute('aria-sort', 'ascending');
    expect(header).toHaveClass('ds-table__head--sorted');
  });

  it('renders descending sort indicator', () => {
    render(
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head sorted="desc">Price</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>$10</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>,
    );
    const header = screen.getByRole('columnheader');
    expect(header).toHaveAttribute('aria-sort', 'descending');
  });

  /* ─── Sortable headers ──────────────────────────────────── */

  it('renders a real button inside sortable headers', () => {
    render(
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head onSort={() => {}}>Price</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>$10</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>,
    );
    const button = screen.getByRole('button', { name: 'Price' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('ds-table__sort-button');
  });

  it('calls onSort when the sort button is clicked', async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();
    render(
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head onSort={onSort}>Price</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>$10</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>,
    );
    await user.click(screen.getByRole('button', { name: 'Price' }));
    expect(onSort).toHaveBeenCalledOnce();
  });

  it('sortable but unsorted header exposes aria-sort="none"', () => {
    render(
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head sortable>Price</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>$10</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>,
    );
    expect(screen.getByRole('columnheader')).toHaveAttribute('aria-sort', 'none');
  });

  it('sorted sortable header exposes direction and calls back', () => {
    render(
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head sorted="asc" onSort={() => {}}>Price</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>$10</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>,
    );
    const header = screen.getByRole('columnheader');
    expect(header).toHaveAttribute('aria-sort', 'ascending');
    expect(header).toHaveClass('ds-table__head--sorted');
  });

  it('has no accessibility violations with sortable headers', async () => {
    const { container } = render(
      <Table aria-label="Sortable products">
        <Table.Header>
          <Table.Row>
            <Table.Head sorted="asc" onSort={() => {}}>Name</Table.Head>
            <Table.Head onSort={() => {}}>Price</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Bowl</Table.Cell>
            <Table.Cell>$48.00</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  /* ─── Empty state ───────────────────────────────────────── */

  it('renders empty state message', () => {
    render(
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Name</Table.Head>
            <Table.Head>Value</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Empty colSpan={2} />
        </Table.Body>
      </Table>,
    );
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('renders custom empty message', () => {
    render(
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Name</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Empty colSpan={1} message="No products found" />
        </Table.Body>
      </Table>,
    );
    expect(screen.getByText('No products found')).toBeInTheDocument();
  });

  /* ─── HTML attributes ───────────────────────────────────── */

  it('passes through custom className', () => {
    renderTable({ className: 'custom-class' });
    expect(screen.getByRole('region')).toHaveClass('custom-class');
  });

  /* ─── Accessibility ─────────────────────────────────────── */

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Table aria-label="Product specifications">
        <Table.Header>
          <Table.Row>
            <Table.Head>Property</Table.Head>
            <Table.Head>Value</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Width</Table.Cell>
            <Table.Cell>100cm</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no accessibility violations with striped variant', async () => {
    const { container } = render(
      <Table variant="striped" aria-label="Size chart">
        <Table.Header>
          <Table.Row>
            <Table.Head>Size</Table.Head>
            <Table.Head>Chest</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>S</Table.Cell>
            <Table.Cell>86cm</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>M</Table.Cell>
            <Table.Cell>92cm</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('exposes every part as a flat named export (same component as Table.X)', () => {
    expect(TableHeader).toBe(Table.Header);
    expect(TableBody).toBe(Table.Body);
    expect(TableRow).toBe(Table.Row);
    expect(TableHead).toBe(Table.Head);
    expect(TableCell).toBe(Table.Cell);
    expect(TableEmpty).toBe(Table.Empty);
  });

  it('flat named parts render a stack-mode table with header labels', () => {
    render(
      <Table aria-label="Sizes" responsive="stack">
        <TableHeader>
          <TableRow>
            <TableHead>Size</TableHead>
            <TableHead>Chest</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>S</TableCell>
            <TableCell>86cm</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByText('86cm').closest('td')).toHaveAttribute('data-label', 'Chest');
  });
});
