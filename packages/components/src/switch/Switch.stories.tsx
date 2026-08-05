import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from './Switch';

const meta: Meta<typeof Switch> = {
  title: 'Components/Switch',
  component: Switch,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select' },
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

export const Small: Story = {
  args: { label: 'Compact toggle', size: 'sm' },
};

export const NotificationSettings: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)', width: '320px' }}>
      <Switch label="Order updates" defaultChecked hint="Shipping and delivery notifications" />
      <Switch label="Restock alerts" hint="When wishlist items are back in stock" />
      <Switch label="Promotions" hint="Sales, discounts, and early access" />
      <Switch label="SMS notifications" disabled hint="Add a phone number to enable" />
    </div>
  ),
};
