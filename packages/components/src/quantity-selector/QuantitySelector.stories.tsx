import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { QuantitySelector } from './QuantitySelector';

const meta: Meta<typeof QuantitySelector> = {
  title: 'Components/QuantitySelector',
  component: QuantitySelector,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof QuantitySelector>;

function Controlled(props: Partial<React.ComponentProps<typeof QuantitySelector>>) {
  const [value, setValue] = useState(props.value ?? 1);
  return <QuantitySelector {...props} value={value} onChange={setValue} />;
}

export const Default: Story = {
  render: () => <Controlled />,
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-4)', alignItems: 'center' }}>
      <Controlled size="sm" />
      <Controlled size="md" />
      <Controlled size="lg" />
    </div>
  ),
};

export const WithLimits: Story = {
  render: () => <Controlled min={1} max={5} value={3} />,
};

export const Disabled: Story = {
  render: () => <Controlled value={2} disabled />,
};
