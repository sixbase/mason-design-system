import type { Meta, StoryObj } from '@storybook/react';
import { Countdown } from './Countdown';

const MINUTE = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;

const meta: Meta<typeof Countdown> = {
  title: 'Components/Countdown',
  component: Countdown,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md'] },
    hideZeroUnits: { control: 'boolean' },
    target: { control: false },
    onComplete: { control: false },
  },
};
export default meta;

type Story = StoryObj<typeof Countdown>;

export const Default: Story = {
  args: {
    target: new Date(Date.now() + 2 * DAY + 3 * HOUR + 24 * MINUTE),
  },
};

export const Small: Story = {
  args: {
    target: new Date(Date.now() + 2 * DAY + 3 * HOUR + 24 * MINUTE),
    size: 'sm',
  },
};

export const CustomLabels: Story = {
  args: {
    target: new Date(Date.now() + 6 * HOUR + 12 * MINUTE),
    labels: { days: 'd', hours: 'h', minutes: 'm', seconds: 's' },
  },
};

export const HideZeroUnits: Story = {
  args: {
    target: new Date(Date.now() + 45 * MINUTE),
    hideZeroUnits: true,
  },
};

export const EndingSoon: Story = {
  args: {
    target: new Date(Date.now() + 15_000),
    hideZeroUnits: true,
  },
};

export const Completed: Story = {
  args: {
    target: new Date(Date.now() - HOUR),
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
      <Countdown target={new Date(Date.now() + 2 * DAY + 3 * HOUR)} size="md" />
      <Countdown target={new Date(Date.now() + 2 * DAY + 3 * HOUR)} size="sm" />
    </div>
  ),
};
