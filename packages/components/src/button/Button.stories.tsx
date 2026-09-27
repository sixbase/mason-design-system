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
          'The standard button: four styles, three sizes, plus loading, disabled and icon versions.',
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

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--spacing-3)' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--spacing-3)' }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

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
      <div style={{ width: '100%', maxWidth: 'var(--size-modal-sm)' }}>
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
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--spacing-3)' }}>
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

/** `asChild` gives a real link (it navigates, opens in a new tab) the button's look. */
export const AsLink: Story = {
  name: 'As a link (looks like a button)',
  render: () => (
    <Button asChild variant="secondary">
      <a href="/collections/new-arrivals">Shop new arrivals</a>
    </Button>
  ),
};
