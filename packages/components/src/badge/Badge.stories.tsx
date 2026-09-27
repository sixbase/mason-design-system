import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from '../button';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  parameters: {
    docs: {
      description: {
        component:
          'A small label for status or promotion: “New”, “Sale”, “Low stock”, or a count.',
      },
    },
  },
  argTypes: {
    variant: { control: 'select', options: ['default', 'secondary', 'success', 'warning', 'destructive', 'outline'] },
    size: { control: 'select', options: ['sm', 'md'] },
  },
};
export default meta;

type Story = StoryObj<typeof Badge>;

export const Default: Story = { args: { children: 'New' } };

export const Secondary: Story = { args: { variant: 'secondary', children: 'Sale' } };

export const Success: Story = { args: { variant: 'success', children: 'In stock' } };

export const Warning: Story = { args: { variant: 'warning', children: 'Low stock' } };

export const Destructive: Story = { args: { variant: 'destructive', children: 'Out of stock' } };

export const Outline: Story = { args: { variant: 'outline', children: 'Archive' } };

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap', alignItems: 'center' }}>
      <Badge variant="default">New</Badge>
      <Badge variant="secondary">Sale</Badge>
      <Badge variant="success">In stock</Badge>
      <Badge variant="warning">Low stock</Badge>
      <Badge variant="destructive">Out of stock</Badge>
      <Badge variant="outline">Archive</Badge>
    </div>
  ),
};

export const Small: Story = { args: { size: 'sm', children: 'New' } };

export const WithDot: Story = {
  args: { variant: 'success', dot: true, children: 'In stock' },
};

export const StatusDots: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap', alignItems: 'center' }}>
      <Badge variant="success" dot>In stock</Badge>
      <Badge variant="warning" dot>Low stock</Badge>
      <Badge variant="destructive" dot>Out of stock</Badge>
      <Badge variant="outline" dot>Discontinued</Badge>
    </div>
  ),
};

export const NotificationCount: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-2)', alignItems: 'center' }}>
      <Badge count={3} />
      <Badge count={1} variant="destructive" />
      <Badge count={99} variant="secondary" />
    </div>
  ),
};

/**
 * A badge is silent by default. Give it `role="status"` only when its text
 * changes while the customer watches (an order moving from Processing to
 * Shipped) — screen readers then read the new text aloud.
 */
export const LiveStatus: Story = {
  name: 'Live status (read aloud when it changes)',
  render: function LiveStatusStory() {
    const steps = [
      ['warning', 'Processing'],
      ['default', 'Shipped'],
      ['success', 'Delivered'],
    ] as const;
    const [step, setStep] = useState(0);
    const [variant, label] = steps[step]!;
    return (
      <div style={{ display: 'flex', gap: 'var(--spacing-3)', flexWrap: 'wrap', alignItems: 'center' }}>
        <Badge role="status" variant={variant} dot>
          {label}
        </Badge>
        <Button size="sm" variant="secondary" onClick={() => setStep((s) => (s + 1) % steps.length)}>
          Next status
        </Button>
      </div>
    );
  },
};

export const EcommerceContext: Story = {
  name: 'In the store (product labels)',
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap', alignItems: 'center' }}>
      <Badge variant="default" size="sm">New arrival</Badge>
      <Badge variant="secondary" size="sm">20% off</Badge>
      <Badge variant="success" size="sm">Free shipping</Badge>
      <Badge variant="destructive" size="sm">Final sale</Badge>
      <Badge variant="warning" size="sm">2 left</Badge>
    </div>
  ),
};
