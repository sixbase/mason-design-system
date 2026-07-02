import type { Meta, StoryObj } from '@storybook/react';
import { PriceDisplay } from './PriceDisplay';

const meta: Meta<typeof PriceDisplay> = {
  title: 'Components/PriceDisplay',
  component: PriceDisplay,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};
export default meta;

type Story = StoryObj<typeof PriceDisplay>;

export const Default: Story = {
  args: { price: '$48.00' },
};

export const OnSale: Story = {
  args: { price: '$38.00', comparePrice: '$48.00' },
};

export const Small: Story = {
  args: { price: '$14.00', size: 'sm' },
};

export const Large: Story = {
  args: { price: '$120.00', size: 'lg' },
};

export const LargeOnSale: Story = {
  args: { price: '$96.00', comparePrice: '$120.00', size: 'lg' },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
      <PriceDisplay price="$14.00" size="sm" />
      <PriceDisplay price="$48.00" size="md" />
      <PriceDisplay price="$120.00" size="lg" />
    </div>
  ),
};
