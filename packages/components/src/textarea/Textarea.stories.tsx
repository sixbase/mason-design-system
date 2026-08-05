import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from './Textarea';

const meta: Meta<typeof Textarea> = {
  title: 'Components/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A multi-line text input with built-in label, hint, and error state. Accessible by default.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '320px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: {
    label: 'Order notes',
    placeholder: 'Delivery instructions, gate codes, etc.',
  },
};

export const WithHint: Story = {
  args: {
    label: 'Gift message',
    hint: 'Printed on the packing slip — max 200 characters',
  },
};

export const WithError: Story = {
  args: {
    label: 'Review',
    defaultValue: 'Great!',
    error: 'Please write at least 20 characters',
  },
};

export const Required: Story = {
  args: {
    label: 'Message',
    required: true,
    placeholder: 'How can we help?',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Archived note',
    defaultValue: 'This order shipped on March 3.',
    disabled: true,
  },
};

export const AutoResize: Story = {
  args: {
    label: 'Gift message',
    autoResize: true,
    rows: 2,
    placeholder: 'Grows as you type...',
    hint: 'The field expands to fit your message',
  },
};

export const CustomRows: Story = {
  args: {
    label: 'Product review',
    rows: 8,
    placeholder: 'What did you like or dislike?',
  },
};
