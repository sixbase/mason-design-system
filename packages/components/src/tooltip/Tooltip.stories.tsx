import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../button';
import { Heart } from '../icon';
import { Tooltip } from './Tooltip';

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A tiny label that appears when you hover over or tab to a button, naming what it does.',
      },
    },
  },
  argTypes: {
    side: { control: 'select', options: ['top', 'right', 'bottom', 'left'] },
    align: { control: 'select', options: ['start', 'center', 'end'] },
  },
};
export default meta;

type Story = StoryObj<typeof Tooltip>;

/** Open on load so it can be seen without hovering; it closes like any tooltip once you move away. */
export const Default: Story = {
  args: {
    content: 'Add to wishlist',
    defaultOpen: true,
  },
  render: (args) => (
    <div style={{ padding: 'var(--spacing-12) 0' }}>
      <Tooltip {...args}>
        <Button variant="secondary" iconOnly aria-label="Add to wishlist">
          <Heart size="sm" />
        </Button>
      </Tooltip>
    </div>
  ),
};

export const AllSides: Story = {
  render: () => (
    // Wraps on phones: four triggers plus 64px side padding overflowed 375px
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'var(--spacing-4)', padding: 'var(--spacing-16) 0' }}>
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
  name: 'No delay before showing',
  render: () => (
    <Tooltip content="Share this product" delayDuration={0}>
      <Button variant="secondary">Share</Button>
    </Tooltip>
  ),
};
