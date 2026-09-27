import type { Decorator, Meta, StoryObj } from '@storybook/react';
// Aliased: this file exports a story called `Text`
import { Text as Copy } from '../typography/Typography';
import { Skeleton } from './Skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'Components/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Grey placeholder shapes that stand in for content while it loads.',
      },
    },
  },
  argTypes: {
    variant: { control: 'select', options: ['text', 'circular', 'rectangular'] },
    width: { control: 'text' },
    height: { control: 'text' },
    lines: { control: 'number' },
    animate: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj<typeof Skeleton>;

/** A card-width column, so full-width placeholders have an edge to stop at. */
const column: Decorator = (Story) => (
  <div style={{ maxWidth: 'var(--size-modal-sm)' }}>
    <Story />
  </div>
);

export const Rectangular: Story = {
  args: { variant: 'rectangular', height: 'var(--spacing-phi-89)' },
  decorators: [column],
};

export const Circular: Story = {
  args: { variant: 'circular', width: 'var(--spacing-12)', height: 'var(--spacing-12)' },
};

export const Text: Story = {
  args: { variant: 'text' },
  decorators: [column],
};

export const TextMultipleLines: Story = {
  args: { variant: 'text', lines: 4 },
  decorators: [column],
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)', maxWidth: 'var(--size-modal-sm)' }}>
      {([
        ['Rectangular', <Skeleton key="r" variant="rectangular" height="var(--spacing-20)" />],
        ['Circular', <Skeleton key="c" variant="circular" width="var(--spacing-12)" height="var(--spacing-12)" />],
        ['Text (single line)', <Skeleton key="t" variant="text" />],
        ['Text (3 lines)', <Skeleton key="t3" variant="text" lines={3} />],
      ] as const).map(([name, shape]) => (
        <div key={name} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
          <Copy size="sm" muted>{name}</Copy>
          {shape}
        </div>
      ))}
    </div>
  ),
};

export const Static: Story = {
  name: 'Still (no shimmer)',
  args: { variant: 'rectangular', height: 'var(--spacing-20)', animate: false },
  decorators: [column],
};

export const ProductCardSkeleton: Story = {
  render: () => (
    // A 4:5 picture over three lines, like a product card
    <div style={{ width: 'calc(var(--spacing-phi-55) * 2)', maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
      <Skeleton variant="rectangular" height="calc(var(--spacing-phi-55) * 2.5)" />
      <Skeleton variant="text" />
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="40%" />
    </div>
  ),
};

export const AvatarWithText: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-3)', alignItems: 'center' }}>
      <Skeleton variant="circular" width="var(--spacing-10)" height="var(--spacing-10)" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
        <Skeleton variant="text" width="50%" />
        <Skeleton variant="text" width="80%" />
      </div>
    </div>
  ),
};

export const ProductGridSkeleton: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-6)' }}>
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
          <Skeleton variant="rectangular" height="var(--spacing-phi-89)" />
          <Skeleton variant="text" />
          <Skeleton variant="text" width="60%" />
        </div>
      ))}
    </div>
  ),
};
