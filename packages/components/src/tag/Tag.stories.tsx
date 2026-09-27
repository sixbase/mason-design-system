import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Check } from '../icon';
import { Tag } from './Tag';

const meta: Meta<typeof Tag> = {
  title: 'Components/Tag',
  component: Tag,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A small chip, often removable — used for active filters like “Size: M”.',
      },
    },
  },
  argTypes: {
    variant: { control: 'select', options: ['default', 'outline'] },
    size: { control: 'select', options: ['sm', 'md'] },
  },
};
export default meta;

type Story = StoryObj<typeof Tag>;

/* ─── Individual variants ──────────────────────────────────────── */

export const Default: Story = { args: { children: 'Blue' } };
export const Outline: Story = { args: { variant: 'outline', children: 'Size: M' } };
export const Small: Story = { args: { size: 'sm', children: 'Blue' } };

export const WithIcon: Story = {
  args: { icon: <Check />, children: 'In stock' },
};

export const Dismissible: Story = {
  args: { children: 'Under $50', onDismiss: () => {} },
};

/* ─── All variants ─────────────────────────────────────────────── */

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap', alignItems: 'center' }}>
      <Tag variant="default">Blue</Tag>
      <Tag variant="outline">Size: M</Tag>
      <Tag variant="default" size="sm">Cotton</Tag>
      <Tag variant="outline" size="sm">Under $50</Tag>
      <Tag variant="default" onDismiss={() => {}}>Sage</Tag>
      <Tag variant="outline" onDismiss={() => {}}>In stock</Tag>
    </div>
  ),
};

/* ─── Active filter row ────────────────────────────────────────── */

function ActiveFiltersDemo() {
  const [filters, setFilters] = useState(['Blue', 'Size: M', 'Under $50', 'In stock']);
  return (
    <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap', alignItems: 'center' }}>
      {filters.map((filter) => (
        <Tag
          key={filter}
          onDismiss={() => setFilters((prev) => prev.filter((f) => f !== filter))}
        >
          {filter}
        </Tag>
      ))}
    </div>
  );
}

export const ActiveFilters: Story = {
  render: () => <ActiveFiltersDemo />,
};
