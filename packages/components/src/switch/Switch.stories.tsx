import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from './Switch';

const meta: Meta<typeof Switch> = {
  title: 'Components/Switch',
  component: Switch,
  parameters: {
    docs: {
      description: {
        component:
          'An on/off toggle for settings that take effect straight away.',
      },
    },
  },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md'] },
  },
};
export default meta;

type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  args: { label: 'Email me about restocks' },
};

export const Checked: Story = {
  args: { label: 'Order updates', defaultChecked: true },
};

export const Small: Story = {
  args: { label: 'Save my details for next time', size: 'sm' },
};

export const WithHint: Story = {
  args: {
    label: 'Gift wrapping',
    hint: 'Adds $5.00 at checkout',
  },
};

export const WithError: Story = {
  args: {
    label: 'I accept the subscription terms',
    error: 'You must enable this to continue',
  },
};

export const Disabled: Story = {
  args: { label: 'SMS notifications', disabled: true },
};

export const DisabledChecked: Story = {
  args: { label: 'Required security alerts', disabled: true, defaultChecked: true },
};

/** A disabled switch keeps its hint readable, so the reason still shows. */
export const DisabledWithHint: Story = {
  args: { label: 'SMS notifications', hint: 'Add a phone number to turn this on', disabled: true },
};

export const NotificationSettings: Story = {
  name: 'In account settings',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)', width: '100%', maxWidth: 'var(--size-modal-sm)' }}>
      <Switch label="Order updates" defaultChecked hint="Shipping and delivery notifications" />
      <Switch label="Restock alerts" hint="When wishlist items are back in stock" />
      <Switch label="Promotions" hint="Sales, discounts, and early access" />
      <Switch label="SMS notifications" disabled hint="Add a phone number to enable" />
    </div>
  ),
};
