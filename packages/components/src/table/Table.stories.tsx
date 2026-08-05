import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Table } from './Table';

const meta: Meta<typeof Table> = {
  title: 'Components/Table',
  component: Table,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'striped'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
    },
    stickyHeader: {
      control: 'boolean',
    },
    responsive: {
      control: 'select',
      options: ['scroll', 'stack'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Table>;

/* ─── Sample data ─────────────────────────────────────────── */

const sizeChartData = [
  { size: 'XS', chest: '82', waist: '64', hips: '88' },
  { size: 'S', chest: '86', waist: '68', hips: '92' },
  { size: 'M', chest: '92', waist: '74', hips: '98' },
  { size: 'L', chest: '98', waist: '80', hips: '104' },
  { size: 'XL', chest: '106', waist: '88', hips: '112' },
];

const specData = [
  { property: 'Material', value: '100% Organic Cotton' },
  { property: 'Weight', value: '180 GSM' },
  { property: 'Care', value: 'Machine wash cold, tumble dry low' },
  { property: 'Origin', value: 'Made in Portugal' },
  { property: 'Certification', value: 'GOTS Certified' },
];

/* ─── Stories ─────────────────────────────────────────────── */

export const Default: Story = {
  args: {
    'aria-label': 'Product specifications',
  },
  render: (args) => (
    <Table {...args}>
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
  ),
};

export const Striped: Story = {
  render: () => (
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
  ),
};

export const SmallSize: Story = {
  render: () => (
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
  ),
};

export const WithSortIndicator: Story = {
  render: () => (
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
  ),
};

export const EmptyState: Story = {
  render: () => (
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
  ),
};

export const StickyHeader: Story = {
  render: () => {
    const manyRows = Array.from({ length: 20 }, (_, i) => ({
      size: `Size ${i + 1}`,
      chest: `${80 + i * 2}`,
      waist: `${62 + i * 2}`,
    }));
    return (
      <div style={{ maxHeight: '300px', overflow: 'auto' }}>
        <Table stickyHeader aria-label="Long table with sticky header">
          <Table.Header>
            <Table.Row>
              <Table.Head>Size</Table.Head>
              <Table.Head>Chest (cm)</Table.Head>
              <Table.Head>Waist (cm)</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {manyRows.map((row) => (
              <Table.Row key={row.size}>
                <Table.Cell>{row.size}</Table.Cell>
                <Table.Cell>{row.chest}</Table.Cell>
                <Table.Cell>{row.waist}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    );
  },
};

export const ResponsiveStack: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    docs: {
      description: {
        story:
          'With `responsive="stack"`, rows render as cards below the sm breakpoint (640px) and each cell shows its column header as a label. Markup stays a semantic table. Resize the viewport to see it.',
      },
    },
  },
  render: () => (
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
  ),
};

export const SortableHeaders: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Pass `onSort` (or `sortable`) to render the header content in a real button with `aria-sort`. Sorting logic stays external.',
      },
    },
  },
  render: () => {
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
              <Table.Head
                sorted={sortKey === 'size' && direction}
                onSort={() => handleSort('size')}
              >
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
    return <SortableDemo />;
  },
};

export const WideTableScroll: Story = {
  render: () => (
    <div style={{ maxWidth: '400px' }}>
      <Table aria-label="Wide table demonstrating horizontal scroll">
        <Table.Header>
          <Table.Row>
            <Table.Head>Size</Table.Head>
            <Table.Head>Chest (cm)</Table.Head>
            <Table.Head>Waist (cm)</Table.Head>
            <Table.Head>Hips (cm)</Table.Head>
            <Table.Head>Shoulder (cm)</Table.Head>
            <Table.Head>Sleeve (cm)</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {sizeChartData.map((row) => (
            <Table.Row key={row.size}>
              <Table.Cell>{row.size}</Table.Cell>
              <Table.Cell>{row.chest}</Table.Cell>
              <Table.Cell>{row.waist}</Table.Cell>
              <Table.Cell>{row.hips}</Table.Cell>
              <Table.Cell>{Number(row.chest) - 46}</Table.Cell>
              <Table.Cell>{Number(row.chest) - 22}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  ),
};
