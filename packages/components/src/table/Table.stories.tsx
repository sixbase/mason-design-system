import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Table } from './Table';

const meta: Meta<typeof Table> = {
  title: 'Components/Table',
  component: Table,
  parameters: {
    docs: {
      description: {
        component:
          'Rows and columns of data — order history, size charts, specifications.',
      },
    },
  },
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
    maxHeight: {
      control: 'text',
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
  name: 'Small (tighter rows)',
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
  name: 'Shows the sort order',
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

export const SortableHeaders: Story = {
  name: 'Click a header to sort',
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

export const StickyHeader: Story = {
  name: 'Header stays put while scrolling',
  render: () => {
    const manyRows = Array.from({ length: 20 }, (_, i) => ({
      size: `Size ${i + 1}`,
      chest: `${80 + i * 2}`,
      waist: `${62 + i * 2}`,
    }));
    // maxHeight bounds the table's own scroll area — an outer scrolling
    // div can't work: the wrapper's overflow-x makes it the header's
    // scroll container, so the header only sticks inside the wrapper.
    return (
      <Table stickyHeader maxHeight="var(--size-modal-sm)" aria-label="Long table with sticky header">
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
    );
  },
};

export const ResponsiveStack: Story = {
  name: 'Stacks into cards on phones',
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

export const WideTableScroll: Story = {
  name: 'Too wide: scrolls sideways',
  render: () => (
    <div style={{ maxWidth: 'var(--size-modal-sm)' }}>
      <Table aria-label="Full size chart">
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
