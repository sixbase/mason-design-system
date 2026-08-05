import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select' },
    size: { control: 'select' },
  },
};
export default meta;

type Story = StoryObj<typeof Badge>;

/* ─── Individual variants ──────────────────────────────────────── */

export const Default: Story = { args: { children: 'New' } };
export const Secondary: Story = { args: { variant: 'secondary', children: 'Sale' } };
export const Success: Story = { args: { variant: 'success', children: 'In stock' } };
export const Warning: Story = { args: { variant: 'warning', children: 'Low stock' } };
export const Destructive: Story = { args: { variant: 'destructive', children: 'Out of stock' } };
export const Outline: Story = { args: { variant: 'outline', children: 'Archive' } };
export const Small: Story = { args: { size: 'sm', children: 'New' } };

/* ─── Status dot ───────────────────────────────────────────────── */

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

/* ─── Notification count ───────────────────────────────────────── */

export const NotificationCount: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-2)', alignItems: 'center' }}>
      <Badge count={3} />
      <Badge count={1} variant="destructive" />
      <Badge count={99} variant="secondary" />
    </div>
  ),
};

/* ─── All variants ─────────────────────────────────────────────── */

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

export const EcommerceContext: Story = {
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
