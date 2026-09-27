import type { Meta, StoryObj } from '@storybook/react';
import { Spinner } from './Spinner';

const meta: Meta<typeof Spinner> = {
  title: 'Components/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A small spinning circle that says something is loading.',
      },
    },
  },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};
export default meta;

type Story = StoryObj<typeof Spinner>;

export const Default: Story = {
  args: {},
};

export const Small: Story = {
  args: { size: 'sm' },
};

export const Large: Story = {
  args: { size: 'lg' },
};

export const WithVisibleLabel: Story = {
  args: { label: 'Loading products', showLabel: true },
};

export const CustomLabel: Story = {
  args: { label: 'Checking availability' },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-6)' }}>
      <Spinner size="sm" label="Small spinner" />
      <Spinner size="md" label="Medium spinner" />
      <Spinner size="lg" label="Large spinner" />
    </div>
  ),
};

export const EcommerceContext: Story = {
  name: 'In the store (with visible labels)',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
      <Spinner size="sm" label="Checking availability" showLabel />
      <Spinner size="md" label="Updating cart" showLabel />
      <Spinner size="lg" label="Loading search results" showLabel />
    </div>
  ),
};
