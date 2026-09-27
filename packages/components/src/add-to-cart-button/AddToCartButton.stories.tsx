import { useState, useCallback } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AddToCartButton } from './AddToCartButton';

const meta: Meta<typeof AddToCartButton> = {
  title: 'Ecommerce/AddToCartButton',
  component: AddToCartButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'The main “Add to bag” button on a product page, with its own states: adding, added, sold out and pre-order.',
      },
    },
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['idle', 'loading', 'success', 'sold-out', 'pre-order'],
      description: 'Current status of the add-to-cart action',
    },
    size: {
      control: 'select',
      options: ['md', 'lg'],
      description: 'Size of the button',
    },
    fullWidth: { control: 'boolean' },
    labels: { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof AddToCartButton>;

// ─── Status stories ──────────────────────────────────────────

export const Idle: Story = {
  args: {
    status: 'idle',
    size: 'lg',
  },
};

export const Loading: Story = {
  args: {
    status: 'loading',
    size: 'lg',
  },
};

export const Success: Story = {
  args: {
    status: 'success',
    size: 'lg',
  },
};

export const SoldOut: Story = {
  args: {
    status: 'sold-out',
    size: 'lg',
  },
};

export const PreOrder: Story = {
  args: {
    status: 'pre-order',
    size: 'lg',
  },
};

// ─── All statuses ─────────────────────────────────────────────

export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)', width: 'calc(var(--spacing-phi-55) * 2)' }}>
      <AddToCartButton status="idle" />
      <AddToCartButton status="loading" />
      <AddToCartButton status="success" />
      <AddToCartButton status="sold-out" />
      <AddToCartButton status="pre-order" />
    </div>
  ),
};

// ─── Sizes ─────────────────────────────────────────────────────

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--spacing-3)' }}>
      <AddToCartButton size="md" />
      <AddToCartButton size="lg" />
    </div>
  ),
};

// ─── Full width ────────────────────────────────────────────────

export const FullWidth: Story = {
  args: {
    fullWidth: true,
    status: 'idle',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 'var(--size-modal-sm)', maxWidth: '100%' }}>
        <Story />
      </div>
    ),
  ],
};

// ─── Custom labels ─────────────────────────────────────────────

export const CustomLabels: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)', width: 'calc(var(--spacing-phi-55) * 2)' }}>
      <AddToCartButton
        status="idle"
        labels={{ idle: 'Add to Cart' }}
      />
      <AddToCartButton
        status="sold-out"
        labels={{ soldOut: 'Notify Me' }}
      />
      <AddToCartButton
        status="pre-order"
        labels={{ preOrder: 'Reserve Now' }}
      />
    </div>
  ),
};

// ─── Interactive demo ──────────────────────────────────────────

export const InteractiveDemo: Story = {
  name: 'Try it: click to add',
  render: function InteractiveDemoRender() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

    const handleClick = useCallback(() => {
      setStatus('loading');
      setTimeout(() => {
        setStatus('success');
        setTimeout(() => setStatus('idle'), 2000);
      }, 1500);
    }, []);

    return (
      <div style={{ width: 'calc(var(--spacing-phi-55) * 2)' }}>
        <AddToCartButton
          status={status}
          onClick={handleClick}
          fullWidth
        />
      </div>
    );
  },
};
