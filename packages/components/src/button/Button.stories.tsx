import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'The primary interactive element. Supports four variants, three sizes, loading state, and polymorphic rendering.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'destructive'],
      description: 'Visual style variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the button',
    },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    iconOnly: { control: 'boolean' },
    asChild: { table: { disable: true } },
    leadingIcon: { table: { disable: true } },
    trailingIcon: { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// ─── Primary stories ──────────────────────────────────────────

export const Primary: Story = {
  args: {
    children: 'Button',
    variant: 'primary',
    size: 'md',
  },
};

export const Secondary: Story = {
  args: { ...Primary.args, variant: 'secondary' },
};

export const Ghost: Story = {
  args: { ...Primary.args, variant: 'ghost' },
};

export const Destructive: Story = {
  args: { ...Primary.args, variant: 'destructive', children: 'Delete' },
};

// ─── Sizes ───────────────────────────────────────────────────

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

// ─── All variants ─────────────────────────────────────────────

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
};

// ─── States ───────────────────────────────────────────────────

export const Loading: Story = {
  args: { ...Primary.args, loading: true, children: 'Saving...' },
};

export const Disabled: Story = {
  args: { ...Primary.args, disabled: true },
};

export const FullWidth: Story = {
  args: { ...Primary.args, fullWidth: true },
  decorators: [
    (Story) => (
      <div style={{ width: '320px' }}>
        <Story />
      </div>
    ),
  ],
};

// ─── With icons ───────────────────────────────────────────────

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M3 8h10M9 4l4 4-4 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const WithLeadingIcon: Story = {
  args: {
    ...Primary.args,
    leadingIcon: <PlusIcon />,
    children: 'New item',
  },
};

export const WithTrailingIcon: Story = {
  args: {
    ...Primary.args,
    trailingIcon: <ArrowIcon />,
    children: 'Continue',
  },
};

// ─── Icon-only ────────────────────────────────────────────────
// On coarse pointers, sm/md sizes expand their tap zone to
// --size-hit-area (44px) via an invisible pseudo-element.

export const IconOnly: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
      <Button size="sm" iconOnly aria-label="Add item (small)">
        <PlusIcon />
      </Button>
      <Button size="md" iconOnly aria-label="Add item (medium)">
        <PlusIcon />
      </Button>
      <Button size="lg" variant="secondary" iconOnly aria-label="Continue (large)">
        <ArrowIcon />
      </Button>
    </div>
  ),
};

// ─── Polymorphic ──────────────────────────────────────────────

export const AsLink: Story = {
  render: () => (
    <Button asChild variant="secondary">
      <a href="#example">Open link</a>
    </Button>
  ),
};
