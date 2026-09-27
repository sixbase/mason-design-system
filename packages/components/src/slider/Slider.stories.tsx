import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Slider } from './Slider';

const meta: Meta<typeof Slider> = {
  title: 'Components/Slider',
  component: Slider,
  parameters: {
    docs: {
      description: {
        component:
          'A handle you drag along a track to pick a number or a range, like a price range.',
      },
    },
  },
  argTypes: {
    disabled: { control: 'boolean' },
    showValue: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj<typeof Slider>;

export const Default: Story = {
  args: { label: 'Gift card amount', min: 25, max: 200, step: 5, defaultValue: [50] },
};

export const WithValue: Story = {
  args: {
    label: 'Gift card amount',
    min: 25,
    max: 200,
    step: 5,
    defaultValue: [50],
    formatValue: (v: number) => `$${v}`,
    showValue: true,
  },
};

export const Range: Story = {
  args: {
    label: 'Price',
    min: 0,
    max: 200,
    defaultValue: [25, 80],
    formatValue: (v: number) => `$${v}`,
    showValue: true,
  },
};

export const Stepped: Story = {
  name: 'Moves in steps of 5',
  args: {
    label: 'Bulk order (mugs)',
    min: 0,
    max: 50,
    step: 5,
    defaultValue: [20],
    showValue: true,
  },
};

export const Disabled: Story = {
  args: { label: 'Gift card amount', min: 25, max: 200, defaultValue: [50], disabled: true },
};

export const DisabledRange: Story = {
  args: {
    label: 'Price',
    defaultValue: [25, 80],
    formatValue: (v: number) => `$${v}`,
    showValue: true,
    disabled: true,
  },
};

export const PriceFilter: Story = {
  name: 'Price filter in a narrow sidebar',
  render: function PriceFilterStory() {
    const [range, setRange] = useState([25, 80]);
    return (
      <div style={{ width: '100%', maxWidth: 'var(--spacing-phi-89)' }}>
        <Slider
          label="Price"
          min={0}
          max={200}
          step={5}
          value={range}
          onValueChange={setRange}
          formatValue={(v) => `$${v}`}
          thumbLabels={['Minimum price', 'Maximum price']}
          showValue
        />
      </div>
    );
  },
};
