import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select' },
    shape: { control: 'select' },
  },
};
export default meta;

type Story = StoryObj<typeof Avatar>;

const SAMPLE_IMAGE =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 55 55"%3E%3Crect width="55" height="55" fill="%23847D73"/%3E%3Ccircle cx="27.5" cy="21" r="9" fill="%23FAF9F7"/%3E%3Cellipse cx="27.5" cy="46" rx="16" ry="13" fill="%23FAF9F7"/%3E%3C/svg%3E';

/* ─── Individual states ────────────────────────────────────────── */

export const WithImage: Story = {
  args: { name: 'Ada Lovelace', src: SAMPLE_IMAGE },
};

export const InitialsFallback: Story = {
  args: { name: 'Ada Lovelace' },
};

export const BrokenImage: Story = {
  args: { name: 'Grace Hopper', src: '/does-not-exist.jpg' },
};

export const Square: Story = {
  args: { name: 'Mason Supply', shape: 'square' },
};

/* ─── Sizes ────────────────────────────────────────────────────── */

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-2)', alignItems: 'center' }}>
      <Avatar name="Ada Lovelace" size="sm" />
      <Avatar name="Ada Lovelace" size="md" />
      <Avatar name="Ada Lovelace" size="lg" />
    </div>
  ),
};

/* ─── Fallback tones ───────────────────────────────────────────── */

export const FallbackTones: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-2)', alignItems: 'center' }}>
      <Avatar name="Ada Lovelace" />
      <Avatar name="Grace Hopper" />
      <Avatar name="Alan Turing" />
      <Avatar name="Katherine Johnson" />
      <Avatar name="Edsger Dijkstra" />
      <Avatar name="Barbara Liskov" />
    </div>
  ),
};
