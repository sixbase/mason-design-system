import type { Meta, StoryObj } from '@storybook/react';
import { PriceDisplay } from './PriceDisplay';

const meta: Meta<typeof PriceDisplay> = {
  title: 'Components/PriceDisplay',
  component: PriceDisplay,
  parameters: {
    docs: {
      description: {
        component:
          'A price — and when something’s on sale, the old price crossed out beside it.',
      },
    },
  },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    emphasis: { control: 'select', options: ['none', 'sale'] },
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

/** Sale emphasis without a compare price — forces the destructive color. */
export const SaleEmphasis: Story = {
  args: { price: '$38.00', emphasis: 'sale' },
};

/** In narrow containers the compare price wraps instead of overflowing. */
export const NarrowContainerWrap: Story = {
  render: () => (
    <div style={{ width: 'var(--spacing-phi-34)' }}>
      <PriceDisplay price="$1,238.00" comparePrice="$1,560.00" />
    </div>
  ),
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
