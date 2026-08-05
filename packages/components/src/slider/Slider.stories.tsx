import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Slider } from './Slider';

const meta: Meta<typeof Slider> = {
  title: 'Components/Slider',
  component: Slider,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    showValue: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj<typeof Slider>;

export const Default: Story = {
  args: { label: 'Volume', defaultValue: [60] },
};

export const WithValue: Story = {
  args: { label: 'Brightness', defaultValue: [45], showValue: true },
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
  args: {
    label: 'Quantity',
    min: 0,
    max: 50,
    step: 5,
    defaultValue: [20],
    showValue: true,
  },
};

export const Disabled: Story = {
  args: { label: 'Unavailable', defaultValue: [40], disabled: true },
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
  render: function PriceFilterStory() {
    const [range, setRange] = useState([25, 80]);
    return (
      <div style={{ width: '280px' }}>
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
