import type { Meta, StoryObj } from '@storybook/react';
import { StockIndicator } from './StockIndicator';

const meta: Meta<typeof StockIndicator> = {
  title: 'Components/StockIndicator',
  component: StockIndicator,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A short line saying whether a product is in stock, running low or sold out.',
      },
    },
  },
  argTypes: {
    status: { control: 'select', options: ['in-stock', 'low-stock', 'out-of-stock'] },
  },
};
export default meta;

type Story = StoryObj<typeof StockIndicator>;

export const InStock: Story = {
  args: { status: 'in-stock' },
};

export const LowStock: Story = {
  args: { status: 'low-stock' },
};

export const OutOfStock: Story = {
  args: { status: 'out-of-stock' },
};

export const CustomLabel: Story = {
  args: { status: 'low-stock', label: 'Only 2 left — ships tomorrow' },
};

export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
      <StockIndicator status="in-stock" />
      <StockIndicator status="low-stock" />
      <StockIndicator status="out-of-stock" />
    </div>
  ),
};
