import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  parameters: {
    docs: {
      description: {
        component:
          'A small round picture of a person — or their initials when there’s no photo.',
      },
    },
  },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    shape: { control: 'select', options: ['circle', 'square'] },
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
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-2)', alignItems: 'center' }}>
      {/* One name per tone (0–4): the old list hashed to only 3 of the 5 */}
      <Avatar name="Linus Torvalds" />
      <Avatar name="Grace Hopper" />
      <Avatar name="Katherine Johnson" />
      <Avatar name="Mary Kenneth Keller" />
      <Avatar name="Ada Lovelace" />
    </div>
  ),
};
