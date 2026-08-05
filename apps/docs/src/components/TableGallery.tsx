import { useState } from 'react';
import { Table } from '@ds/components';
import { Preview } from './Preview';

/* ─── Sample data ─────────────────────────────────────────── */

const specData = [
  { property: 'Material', value: '100% Organic Cotton' },
  { property: 'Weight', value: '180 GSM' },
  { property: 'Care', value: 'Machine wash cold, tumble dry low' },
  { property: 'Origin', value: 'Made in Portugal' },
  { property: 'Certification', value: 'GOTS Certified' },
];

const sizeChartData = [
  { size: 'XS', chest: '82', waist: '64', hips: '88' },
  { size: 'S', chest: '86', waist: '68', hips: '92' },
  { size: 'M', chest: '92', waist: '74', hips: '98' },
  { size: 'L', chest: '98', waist: '80', hips: '104' },
  { size: 'XL', chest: '106', waist: '88', hips: '112' },
];

/* ─── Default ─────────────────────────────────────────────── */

export function TableDefault() {
  return (
    <Preview stack>
      <Table aria-label="Product specifications">
        <Table.Header>
          <Table.Row>
            <Table.Head>Property</Table.Head>
            <Table.Head>Value</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {specData.map((row) => (
            <Table.Row key={row.property}>
              <Table.Cell>{row.property}</Table.Cell>
              <Table.Cell>{row.value}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Preview>
  );
}

/* ─── Striped ─────────────────────────────────────────────── */

export function TableStriped() {
  return (
    <Preview stack>
      <Table variant="striped" aria-label="Size chart">
        <Table.Header>
          <Table.Row>
            <Table.Head>Size</Table.Head>
            <Table.Head>Chest (cm)</Table.Head>
            <Table.Head>Waist (cm)</Table.Head>
            <Table.Head>Hips (cm)</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {sizeChartData.map((row) => (
            <Table.Row key={row.size}>
              <Table.Cell>{row.size}</Table.Cell>
              <Table.Cell>{row.chest}</Table.Cell>
              <Table.Cell>{row.waist}</Table.Cell>
              <Table.Cell>{row.hips}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Preview>
  );
}

/* ─── Small size ──────────────────────────────────────────── */

export function TableSmall() {
  return (
    <Preview stack>
      <Table size="sm" aria-label="Compact specifications">
        <Table.Header>
          <Table.Row>
            <Table.Head>Property</Table.Head>
            <Table.Head>Value</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {specData.map((row) => (
            <Table.Row key={row.property}>
              <Table.Cell>{row.property}</Table.Cell>
              <Table.Cell>{row.value}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Preview>
  );
}

/* ─── Responsive stack ────────────────────────────────────── */

export function TableResponsiveStack() {
  return (
    <Preview stack>
      <Table responsive="stack" variant="striped" aria-label="Size chart (stacked on mobile)">
        <Table.Header>
          <Table.Row>
            <Table.Head>Size</Table.Head>
            <Table.Head>Chest (cm)</Table.Head>
            <Table.Head>Waist (cm)</Table.Head>
            <Table.Head>Hips (cm)</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {sizeChartData.map((row) => (
            <Table.Row key={row.size}>
              <Table.Cell>{row.size}</Table.Cell>
              <Table.Cell>{row.chest}</Table.Cell>
              <Table.Cell>{row.waist}</Table.Cell>
              <Table.Cell>{row.hips}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Preview>
  );
}

/* ─── Sortable headers ────────────────────────────────────── */

export function TableSortable() {
  function SortableDemo() {
    const [sortKey, setSortKey] = useState<'size' | 'chest'>('size');
    const [direction, setDirection] = useState<'asc' | 'desc'>('asc');

    const handleSort = (key: 'size' | 'chest') => {
      if (key === sortKey) {
        setDirection(direction === 'asc' ? 'desc' : 'asc');
      } else {
        setSortKey(key);
        setDirection('asc');
      }
    };

    const rows = [...sizeChartData].sort((a, b) => {
      const compared =
        sortKey === 'size'
          ? a.size.localeCompare(b.size)
          : Number(a.chest) - Number(b.chest);
      return direction === 'asc' ? compared : -compared;
    });

    return (
      <Table aria-label="Sortable size chart">
        <Table.Header>
          <Table.Row>
            <Table.Head sorted={sortKey === 'size' && direction} onSort={() => handleSort('size')}>
              Size
            </Table.Head>
            <Table.Head
              sorted={sortKey === 'chest' && direction}
              onSort={() => handleSort('chest')}
            >
              Chest (cm)
            </Table.Head>
            <Table.Head>Waist (cm)</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((row) => (
            <Table.Row key={row.size}>
              <Table.Cell>{row.size}</Table.Cell>
              <Table.Cell>{row.chest}</Table.Cell>
              <Table.Cell>{row.waist}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    );
  }
  return (
    <Preview stack>
      <SortableDemo />
    </Preview>
  );
}

/* ─── Sort indicators ─────────────────────────────────────── */

export function TableSorted() {
  return (
    <Preview stack>
      <Table aria-label="Sortable size chart">
        <Table.Header>
          <Table.Row>
            <Table.Head sorted="asc">Size</Table.Head>
            <Table.Head>Chest (cm)</Table.Head>
            <Table.Head sorted="desc">Waist (cm)</Table.Head>
            <Table.Head>Hips (cm)</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {sizeChartData.map((row) => (
            <Table.Row key={row.size}>
              <Table.Cell>{row.size}</Table.Cell>
              <Table.Cell>{row.chest}</Table.Cell>
              <Table.Cell>{row.waist}</Table.Cell>
              <Table.Cell>{row.hips}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Preview>
  );
}

/* ─── Empty state ─────────────────────────────────────────── */

export function TableEmpty() {
  return (
    <Preview stack>
      <Table aria-label="Empty table">
        <Table.Header>
          <Table.Row>
            <Table.Head>Product</Table.Head>
            <Table.Head>SKU</Table.Head>
            <Table.Head>Stock</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Empty colSpan={3} message="No products match your filters" />
        </Table.Body>
      </Table>
    </Preview>
  );
}
