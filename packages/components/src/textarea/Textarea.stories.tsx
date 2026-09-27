import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from './Textarea';

const meta: Meta<typeof Textarea> = {
  title: 'Components/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A multi-line text box for notes and messages, with an optional hint or error.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', maxWidth: 'var(--size-modal-sm)' }}>
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

export const Required: Story = {
  args: {
    label: 'Message',
    required: true,
    placeholder: 'How can we help?',
  },
};

export const CustomRows: Story = {
  name: 'Taller to start (8 rows)',
  args: {
    label: 'Product review',
    rows: 8,
    placeholder: 'What did you like or dislike?',
  },
};

/** `autoResize` starts at `rows` (2 here) and grows with the message. */
export const AutoResize: Story = {
  name: 'Grows as you type',
  args: {
    label: 'Gift message',
    autoResize: true,
    rows: 2,
    placeholder: 'Grows as you type…',
    hint: 'The field expands to fit your message',
  },
};

/** A message that arrives pre-filled opens at its full height, not cut off at `rows`. */
export const AutoResizePrefilled: Story = {
  name: 'Grows to fit a pre-filled message',
  args: {
    label: 'Gift message',
    autoResize: true,
    rows: 2,
    defaultValue:
      'Happy housewarming, Sam and Priya!\n\nWe hope this mug sees a lot of slow Sunday mornings in the new place. Can’t wait to visit.\n\n— Love, the Chens',
  },
};

export const WithError: Story = {
  args: {
    label: 'Review',
    defaultValue: 'Great!',
    error: 'Please write at least 20 characters',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Archived note',
    defaultValue: 'This order shipped on March 3.',
    disabled: true,
  },
};
