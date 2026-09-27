import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Text } from '../typography/Typography';
import { QuantitySelector } from './QuantitySelector';

const meta: Meta<typeof QuantitySelector> = {
  title: 'Components/QuantitySelector',
  component: QuantitySelector,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Minus and plus buttons around a number, for choosing how many.',
      },
    },
  },
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
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-4)', alignItems: 'center' }}>
      <Controlled size="sm" />
      <Controlled size="md" />
      <Controlled size="lg" />
    </div>
  ),
};

export const WithLimits: Story = {
  name: 'With limits (1 to 5)',
  render: () => <Controlled min={1} max={5} value={3} />,
};

/** At the limit the plus button turns off (here, only 5 left in stock). At 1, minus does. */
export const AtMaximum: Story = {
  name: 'At the maximum (plus turned off)',
  render: () => <Controlled min={1} max={5} value={5} />,
};

export const Disabled: Story = {
  render: () => <Controlled value={2} disabled />,
};

export const TypedEntry: Story = {
  name: 'Typing a number',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
      <Text as="span" size="sm" muted>
        Click the value and type a quantity — it clamps to min 1 / max 20 on blur or Enter.
        Arrow Up/Down step, Home/End jump to the bounds.
      </Text>
      <Controlled min={1} max={20} value={5} />
    </div>
  ),
};
