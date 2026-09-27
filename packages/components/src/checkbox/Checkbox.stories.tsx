import type { Meta, StoryObj } from '@storybook/react';
import { Text } from '../typography/Typography';
import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A tick box for yes/no choices, with an optional hint or error below it.',
      },
    },
  },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md'] },
    checked: { control: 'select', options: [true, false, 'indeterminate'] },
  },
};
export default meta;

type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: { label: 'Remember me' },
};

export const Checked: Story = {
  args: { label: 'Gift wrap this order', defaultChecked: true },
};

export const Indeterminate: Story = {
  args: { label: 'Select all items', checked: 'indeterminate' },
};

export const Small: Story = {
  args: { label: 'In stock only', size: 'sm' },
};

export const WithHint: Story = {
  args: {
    label: 'Subscribe to newsletter',
    hint: 'We send at most one email per week',
  },
};

export const WithError: Story = {
  args: {
    label: 'I agree to the terms and conditions',
    error: 'You must accept the terms to continue',
  },
};

export const Disabled: Story = {
  args: { label: 'Out of stock', disabled: true },
};

export const DisabledChecked: Story = {
  args: { label: 'Included', disabled: true, defaultChecked: true },
};

/** A disabled box keeps its hint readable, so the reason it's unavailable still shows. */
export const DisabledWithHint: Story = {
  args: {
    label: 'Express delivery',
    hint: 'Not available for oversized items',
    disabled: true,
  },
};

export const FilterPanel: Story = {
  name: 'In a filter list',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)', width: '100%', maxWidth: 'var(--size-modal-sm)' }}>
      <Text size="xs" weight="semibold" muted style={{ textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wider)' }}>
        Size
      </Text>
      <Checkbox size="sm" label="XS" defaultChecked />
      <Checkbox size="sm" label="S" defaultChecked />
      <Checkbox size="sm" label="M" />
      <Checkbox size="sm" label="L" />
      <Checkbox size="sm" label="XL" disabled />
    </div>
  ),
};

export const CheckoutForm: Story = {
  name: 'In a checkout form',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)', width: '100%', maxWidth: 'var(--size-modal-sm)' }}>
      <Checkbox
        label="Save this card for future purchases"
        hint="Your card is encrypted and stored securely"
      />
      <Checkbox
        label="Sign me up for email updates"
        hint="Get early access to sales and new arrivals"
      />
      <Checkbox
        label="I agree to the Terms of Service and Privacy Policy"
        error="You must agree to continue"
      />
    </div>
  ),
};
