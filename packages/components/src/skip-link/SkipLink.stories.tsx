import type { Meta, StoryObj } from '@storybook/react';
import { Text } from '../typography/Typography';
import { SkipLink } from './SkipLink';

const meta: Meta<typeof SkipLink> = {
  title: 'Components/SkipLink',
  component: SkipLink,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof SkipLink>;

/* ─── Default ──────────────────────────────────────────────────── */
/* The link is visually hidden until it receives keyboard focus —
   click inside the canvas, then press Tab to reveal it. */

export const Default: Story = {
  render: () => (
    <div>
      <SkipLink />
      <Text size="sm">
        Click here, then press Tab — the skip link appears fixed at the
        top-left of the viewport.
      </Text>
    </div>
  ),
};

export const CustomTarget: Story = {
  render: () => (
    <div>
      <SkipLink href="#product-list">Skip to products</SkipLink>
      <Text size="sm">
        Custom target and label: press Tab to reveal “Skip to products”.
      </Text>
    </div>
  ),
};
