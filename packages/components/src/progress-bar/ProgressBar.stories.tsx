import type { Meta, StoryObj } from '@storybook/react';
import { ProgressBar } from './ProgressBar';

const meta: Meta<typeof ProgressBar> = {
  title: 'Components/ProgressBar',
  component: ProgressBar,
  tags: ['autodocs'],
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    size: { control: 'select' },
    variant: { control: 'select' },
  },
};
export default meta;

type Story = StoryObj<typeof ProgressBar>;

/* ─── Basic ───────────────────────────────────────────────────────── */

export const Default: Story = {
  args: { value: 60, label: 'Progress' },
};

export const WithPercentage: Story = {
  args: { value: 45, label: 'Upload progress', showValue: true },
};

export const WithCustomText: Story = {
  args: {
    value: 75,
    label: 'Free shipping progress',
    valueText: '$12 away from free shipping!',
  },
};

/* ─── Indeterminate ───────────────────────────────────────────────── */

export const Indeterminate: Story = {
  args: { indeterminate: true, label: 'Loading products' },
};

export const IndeterminateSmall: Story = {
  args: { indeterminate: true, size: 'sm', label: 'Refreshing cart' },
};

/* ─── Sizes ───────────────────────────────────────────────────────── */

export const Small: Story = {
  args: { value: 50, size: 'sm' },
};

export const Medium: Story = {
  args: { value: 50, size: 'md' },
};

/* ─── Success variant ─────────────────────────────────────────────── */

export const SuccessComplete: Story = {
  args: {
    value: 100,
    variant: 'success',
    label: 'Free shipping unlocked!',
    showValue: true,
  },
};

export const SuccessIncomplete: Story = {
  args: {
    value: 60,
    variant: 'success',
    label: 'Free shipping progress',
    showValue: true,
  },
};

/* ─── Edge cases ──────────────────────────────────────────────────── */

export const Empty: Story = {
  args: { value: 0, label: 'Not started', showValue: true },
};

export const Full: Story = {
  args: { value: 100, label: 'Complete', showValue: true },
};

/* ─── Ecommerce context ───────────────────────────────────────────── */

export const FreeShippingThreshold: Story = {
  render: () => (
    <div style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
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
    <div style={{ maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
      <ProgressBar value={33} label="Step 1 of 3: Shipping" showValue />
      <ProgressBar value={66} label="Step 2 of 3: Payment" showValue />
      <ProgressBar value={100} variant="success" label="Step 3 of 3: Confirmation" showValue />
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)', maxWidth: '400px' }}>
      <ProgressBar value={60} size="sm" label="Small" />
      <ProgressBar value={60} size="md" label="Medium" />
    </div>
  ),
};
