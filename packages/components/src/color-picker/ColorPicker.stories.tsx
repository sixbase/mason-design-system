import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Text } from '../typography/Typography';
import { ColorPicker } from './ColorPicker';
import type { ColorOption } from './ColorPicker';

const meta: Meta<typeof ColorPicker> = {
  title: 'Components/ColorPicker',
  component: ColorPicker,
  parameters: {
    docs: {
      description: {
        component:
          'Round colour swatches for choosing a product finish, like Brushed Brass or Carbon Black.',
      },
    },
  },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};
export default meta;

type Story = StoryObj<typeof ColorPicker>;

/* ─── Product finish options ───────────────────────────────────── */

const finishes: ColorOption[] = [
  { color: '#26241F', label: 'Carbon Black', value: 'carbon-black' },
  { color: '#B08D57', label: 'Brushed Brass', value: 'brushed-brass' },
  { color: '#8A8D8F', label: 'Satin Nickel', value: 'satin-nickel' },
  { color: '#F5F2EC', label: 'Matte White', value: 'matte-white' },
];

function Controlled(props: Partial<React.ComponentProps<typeof ColorPicker>>) {
  const [value, setValue] = useState(props.value ?? 'carbon-black');
  const selected = finishes.find((f) => f.value === value);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
      <Text as="span" size="sm" muted>
        Finish: {selected?.label}
      </Text>
      <ColorPicker
        {...props}
        options={props.options ?? finishes}
        value={value}
        onChange={setValue}
        aria-label="Cabinet pull finish"
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <Controlled />,
};

export const Preselected: Story = {
  render: () => <Controlled value="brushed-brass" />,
};

/** `showLabel` names the chosen finish beside the swatches. Arrow keys move between them. */
export const WithSelectedLabel: Story = {
  render: () => <ControlledWithLabel />,
};

export const Small: Story = {
  render: () => <Controlled size="sm" />,
};

export const Large: Story = {
  render: () => <Controlled size="lg" />,
};

function ControlledWithLabel(props: Partial<React.ComponentProps<typeof ColorPicker>>) {
  const [value, setValue] = useState('carbon-black');
  return (
    <ColorPicker
      {...props}
      options={finishes}
      value={value}
      onChange={setValue}
      showLabel
      aria-label="Cabinet pull finish"
    />
  );
}

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
      <Controlled size="sm" />
      <Controlled size="md" />
      <Controlled size="lg" />
    </div>
  ),
};
