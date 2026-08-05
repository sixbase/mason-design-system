import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A text input with built-in label, hint, and error state. Accessible by default.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '320px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    label: 'Email address',
    type: 'email',
    placeholder: 'you@example.com',
  },
};

export const WithHint: Story = {
  args: {
    label: 'Password',
    type: 'password',
    hint: 'Must be at least 8 characters',
  },
};

export const WithError: Story = {
  args: {
    label: 'Email address',
    type: 'email',
    defaultValue: 'not-an-email',
    error: 'Please enter a valid email address',
  },
};

export const Required: Story = {
  args: {
    label: 'Full name',
    required: true,
    placeholder: 'Jane Smith',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Username',
    defaultValue: 'jane_smith',
    disabled: true,
  },
};

export const ReadOnly: Story = {
  args: {
    label: 'Order number',
    defaultValue: 'MS-1042',
    readOnly: true,
    hint: 'Read-only — the value can be selected and copied but not edited',
  },
};

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="6.5" cy="6.5" r="4" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const WithLeadingIcon: Story = {
  args: {
    placeholder: 'Search...',
    leadingAdornment: <SearchIcon />,
  },
};

export const NoLabel: Story = {
  args: {
    'aria-label': 'Search',
    placeholder: 'Search...',
  },
};

export const Small: Story = {
  args: {
    label: 'Promo code',
    size: 'sm',
    placeholder: 'SUMMER25',
  },
};

export const Large: Story = {
  args: {
    label: 'Search',
    size: 'lg',
    placeholder: 'Search for products...',
    leadingAdornment: <SearchIcon />,
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
      <Input size="sm" label="Small" placeholder="32px height" />
      <Input size="md" label="Medium" placeholder="40px height (default)" />
      <Input size="lg" label="Large" placeholder="48px height" />
    </div>
  ),
};
