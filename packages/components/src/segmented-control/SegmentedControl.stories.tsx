import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Icon } from '../icon';
import { SegmentedControl, SegmentedControlItem } from './SegmentedControl';

const GridGlyph = () => (
  <Icon size="sm">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </Icon>
);

const ListGlyph = () => (
  <Icon size="sm">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </Icon>
);

const meta: Meta<typeof SegmentedControl> = {
  title: 'Components/SegmentedControl',
  component: SegmentedControl,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md'] },
    value: { control: false },
    defaultValue: { control: false },
    onValueChange: { control: false },
  },
};
export default meta;

type Story = StoryObj<typeof SegmentedControl>;

export const Default: Story = {
  render: () => (
    <SegmentedControl aria-label="View" defaultValue="grid">
      <SegmentedControlItem value="grid">Grid</SegmentedControlItem>
      <SegmentedControlItem value="list">List</SegmentedControlItem>
    </SegmentedControl>
  ),
};

export const ThreeSegments: Story = {
  render: () => (
    <SegmentedControl aria-label="Sort by" defaultValue="newest">
      <SegmentedControlItem value="newest">Newest</SegmentedControlItem>
      <SegmentedControlItem value="price">Price</SegmentedControlItem>
      <SegmentedControlItem value="rating">Rating</SegmentedControlItem>
    </SegmentedControl>
  ),
};

export const IconOnly: Story = {
  render: () => (
    <SegmentedControl aria-label="View" defaultValue="grid">
      <SegmentedControlItem value="grid" aria-label="Grid view">
        <GridGlyph />
      </SegmentedControlItem>
      <SegmentedControlItem value="list" aria-label="List view">
        <ListGlyph />
      </SegmentedControlItem>
    </SegmentedControl>
  ),
};

export const IconWithLabel: Story = {
  render: () => (
    <SegmentedControl aria-label="View" defaultValue="grid">
      <SegmentedControlItem value="grid">
        <GridGlyph />
        Grid
      </SegmentedControlItem>
      <SegmentedControlItem value="list">
        <ListGlyph />
        List
      </SegmentedControlItem>
    </SegmentedControl>
  ),
};

export const Small: Story = {
  render: () => (
    <SegmentedControl aria-label="View" defaultValue="grid" size="sm">
      <SegmentedControlItem value="grid">Grid</SegmentedControlItem>
      <SegmentedControlItem value="list">List</SegmentedControlItem>
    </SegmentedControl>
  ),
};

export const DisabledSegment: Story = {
  render: () => (
    <SegmentedControl aria-label="Availability" defaultValue="all">
      <SegmentedControlItem value="all">All</SegmentedControlItem>
      <SegmentedControlItem value="in-stock">In stock</SegmentedControlItem>
      <SegmentedControlItem value="preorder" disabled>Preorder</SegmentedControlItem>
    </SegmentedControl>
  ),
};

export const Controlled: Story = {
  render: function ControlledStory() {
    const [view, setView] = useState('grid');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
        <SegmentedControl aria-label="View" value={view} onValueChange={setView}>
          <SegmentedControlItem value="grid">Grid</SegmentedControlItem>
          <SegmentedControlItem value="list">List</SegmentedControlItem>
          <SegmentedControlItem value="map">Map</SegmentedControlItem>
        </SegmentedControl>
        <span>Selected: {view}</span>
      </div>
    );
  },
};
