import type { Decorator, Meta, StoryObj } from '@storybook/react';
import { Text } from '../typography/Typography';
import { Divider } from './Divider';

const meta: Meta<typeof Divider> = {
  title: 'Components/Divider',
  component: Divider,
  parameters: {
    docs: {
      description: {
        component:
          'A thin line between pieces of content, optionally with a word in the middle like “OR”.',
      },
    },
  },
  argTypes: {
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    spacing: { control: 'select', options: ['none', 'sm', 'md', 'lg'] },
  },
};
export default meta;

type Story = StoryObj<typeof Divider>;

/** Text above and below, so the line — and the space it keeps around it — is visible. */
const inContext: Decorator = (Story) => (
  <div style={{ maxWidth: 'var(--measure-reading)' }}>
    <Text>Handmade in Portland from organic cotton canvas.</Text>
    <Story />
    <Text>Ships in 1–2 business days.</Text>
  </div>
);

export const Default: Story = { decorators: [inContext] };

export const SpacingNone: Story = { args: { spacing: 'none' }, decorators: [inContext] };

export const SpacingSm: Story = { args: { spacing: 'sm' }, decorators: [inContext] };

export const SpacingMd: Story = { args: { spacing: 'md' }, decorators: [inContext] };

export const SpacingLg: Story = { args: { spacing: 'lg' }, decorators: [inContext] };

export const AllSpacings: Story = {
  render: () => (
    <div>
      <Text>No spacing</Text>
      <Divider spacing="none" />
      <Text>Small spacing</Text>
      <Divider spacing="sm" />
      <Text>Medium spacing (default)</Text>
      <Divider spacing="md" />
      <Text>Large spacing</Text>
      <Divider spacing="lg" />
      <Text>End</Text>
    </div>
  ),
};

export const WithLabel: Story = { args: { label: 'OR' }, decorators: [inContext] };

export const CheckoutOrPattern: Story = {
  name: '“OR” between checkout options',
  render: () => (
    <div style={{ maxWidth: 'var(--measure-reading)' }}>
      <Text>Express checkout</Text>
      <Divider label="OR" spacing="lg" />
      <Text>Pay with card</Text>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', height: 'var(--spacing-12)' }}>
      <Text as="span">Left</Text>
      <Divider orientation="vertical" />
      <Text as="span">Right</Text>
    </div>
  ),
};

export const BetweenSections: Story = {
  name: 'Between lines of an order summary',
  render: () => (
    <div>
      <Text>Subtotal · $137.00</Text>
      <Divider />
      <Text>Shipping · Free</Text>
      <Divider />
      <Text>Estimated tax · $11.30</Text>
    </div>
  ),
};
