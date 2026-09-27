import type { Meta, StoryObj } from '@storybook/react';
import { ProgressBar } from './ProgressBar';

const meta: Meta<typeof ProgressBar> = {
  title: 'Components/ProgressBar',
  component: ProgressBar,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A bar that fills to show progress — toward free shipping, through checkout, or while loading.',
      },
    },
  },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    size: { control: 'select', options: ['sm', 'md'] },
    variant: { control: 'select', options: ['default', 'success'] },
  },
};
export default meta;

type Story = StoryObj<typeof ProgressBar>;

export const Default: Story = {
  args: { value: 60, label: 'Checkout progress' },
};

export const WithPercentage: Story = {
  args: { value: 45, label: 'Uploading your review photo', showValue: true },
};

export const WithCustomText: Story = {
  args: {
    value: 75,
    label: 'Free shipping progress',
    valueText: '$12 away from free shipping!',
  },
};

export const Small: Story = {
  args: { value: 50, size: 'sm', 'aria-label': 'Checkout progress' },
};

export const Medium: Story = {
  args: { value: 50, size: 'md', 'aria-label': 'Checkout progress' },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)', maxWidth: 'var(--size-modal-sm)' }}>
      <ProgressBar value={60} size="sm" label="Small" />
      <ProgressBar value={60} size="md" label="Medium" />
    </div>
  ),
};

export const SuccessComplete: Story = {
  name: 'Success, complete',
  args: {
    value: 100,
    variant: 'success',
    label: 'Free shipping unlocked!',
    showValue: true,
  },
};

/** The success colour only arrives at 100% — below that it looks like the default bar. */
export const SuccessIncomplete: Story = {
  name: 'Success, not yet complete',
  args: {
    value: 60,
    variant: 'success',
    label: 'Free shipping progress',
    showValue: true,
  },
};

export const Indeterminate: Story = {
  args: { indeterminate: true, label: 'Loading products' },
};

export const IndeterminateSmall: Story = {
  args: { indeterminate: true, size: 'sm', label: 'Refreshing cart' },
};

export const Empty: Story = {
  args: { value: 0, label: 'Not started', showValue: true },
};

export const Full: Story = {
  args: { value: 100, label: 'Complete', showValue: true },
};

export const FreeShippingThreshold: Story = {
  render: () => (
    <div style={{ maxWidth: 'var(--size-modal-sm)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
      <ProgressBar
        value={36}
        max={48}
        label="Free shipping progress"
        valueText="$12 away from free shipping!"
        size="sm"
      />
      <ProgressBar
        value={48}
        max={48}
        variant="success"
        label="Free shipping unlocked!"
        size="sm"
      />
    </div>
  ),
};

export const MultiStepCheckout: Story = {
  render: () => (
    <div style={{ maxWidth: 'var(--size-modal-md)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
      <ProgressBar value={33} label="Step 1 of 3: Shipping" showValue />
      <ProgressBar value={66} label="Step 2 of 3: Payment" showValue />
      <ProgressBar value={100} variant="success" label="Step 3 of 3: Confirmation" showValue />
    </div>
  ),
};
