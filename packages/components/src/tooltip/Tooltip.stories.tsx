import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../button';
import { Heart } from '../icon';
import { Tooltip } from './Tooltip';

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  argTypes: {
    side: { control: 'select', options: ['top', 'right', 'bottom', 'left'] },
    align: { control: 'select', options: ['start', 'center', 'end'] },
  },
};
export default meta;

type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  args: {
    content: 'Add to wishlist',
  },
  render: (args) => (
    <Tooltip {...args}>
      <Button variant="secondary" aria-label="Add to wishlist">
        <Heart size="sm" />
      </Button>
    </Tooltip>
  ),
};

export const AllSides: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-4)', padding: 'var(--spacing-16)' }}>
      <Tooltip content="Tooltip on top" side="top">
        <Button variant="secondary">Top</Button>
      </Tooltip>
      <Tooltip content="Tooltip on right" side="right">
        <Button variant="secondary">Right</Button>
      </Tooltip>
      <Tooltip content="Tooltip on bottom" side="bottom">
        <Button variant="secondary">Bottom</Button>
      </Tooltip>
      <Tooltip content="Tooltip on left" side="left">
        <Button variant="secondary">Left</Button>
      </Tooltip>
    </div>
  ),
};

export const LongContent: Story = {
  render: () => (
    <Tooltip content="Free standard shipping applies to orders over $75 after discounts and before taxes. Excludes oversized items.">
      <Button variant="secondary">Shipping details</Button>
    </Tooltip>
  ),
};

export const InstantOpen: Story = {
  render: () => (
    <Tooltip content="No delay on this one" delayDuration={0}>
      <Button variant="secondary">Hover me</Button>
    </Tooltip>
  ),
};

export const DefaultOpen: Story = {
  render: () => (
    <div style={{ padding: 'var(--spacing-12)' }}>
      <Tooltip content="Visible on mount" defaultOpen>
        <Button variant="secondary">Trigger</Button>
      </Tooltip>
    </div>
  ),
};
