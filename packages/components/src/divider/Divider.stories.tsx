import type { Meta, StoryObj } from '@storybook/react';
import { Divider } from './Divider';

const meta: Meta<typeof Divider> = {
  title: 'Components/Divider',
  component: Divider,
  tags: ['autodocs'],
  argTypes: {
    orientation: { control: 'select' },
    variant: { control: 'select' },
    spacing: { control: 'select' },
  },
};
export default meta;

type Story = StoryObj<typeof Divider>;

/* ─── Basic ────────────────────────────────────────────────── */

export const Default: Story = {};

export const Subtle: Story = { args: { variant: 'subtle' } };

/* ─── Spacing variants ─────────────────────────────────────── */

export const SpacingNone: Story = { args: { spacing: 'none' } };
export const SpacingSm: Story = { args: { spacing: 'sm' } };
export const SpacingMd: Story = { args: { spacing: 'md' } };
export const SpacingLg: Story = { args: { spacing: 'lg' } };

/* ─── Labeled ("OR" pattern) ───────────────────────────────── */

export const WithLabel: Story = { args: { label: 'OR' } };

export const CheckoutOrPattern: Story = {
  render: () => (
    <div style={{ maxWidth: '400px' }}>
      <p>Express checkout</p>
      <Divider label="OR" spacing="lg" />
      <p>Pay with card</p>
    </div>
  ),
};

export const LabeledSubtle: Story = {
  args: { label: 'Continue as guest', variant: 'subtle', spacing: 'lg' },
};

/* ─── Vertical ─────────────────────────────────────────────── */

export const Vertical: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', height: '48px' }}>
      <span>Left</span>
      <Divider orientation="vertical" />
      <span>Right</span>
    </div>
  ),
};

export const VerticalSubtle: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', height: '48px' }}>
      <span>Left</span>
      <Divider orientation="vertical" variant="subtle" />
      <span>Right</span>
    </div>
  ),
};

/* ─── In context ───────────────────────────────────────────── */

export const BetweenSections: Story = {
  render: () => (
    <div>
      <p>Section one content goes here.</p>
      <Divider />
      <p>Section two content goes here.</p>
      <Divider variant="subtle" />
      <p>Section three content goes here.</p>
    </div>
  ),
};

export const AllSpacings: Story = {
  render: () => (
    <div>
      <p>No spacing</p>
      <Divider spacing="none" />
      <p>Small spacing</p>
      <Divider spacing="sm" />
      <p>Medium spacing (default)</p>
      <Divider spacing="md" />
      <p>Large spacing</p>
      <Divider spacing="lg" />
      <p>End</p>
    </div>
  ),
};
