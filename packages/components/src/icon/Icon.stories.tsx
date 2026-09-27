import type { Meta, StoryObj } from '@storybook/react';
import { Text } from '../typography/Typography';
import { Icon } from './Icon';

const meta: Meta<typeof Icon> = {
  title: 'Components/Icon',
  component: Icon,
  parameters: {
    docs: {
      description: {
        component:
          'Small line drawings (heart, search, cart) that take on the colour of the text around them.',
      },
    },
  },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    decorative: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj<typeof Icon>;

/* ─── Sample SVG paths (Lucide-compatible viewBox 0 0 24 24) ──── */

const HeartPath = () => (
  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
);

const StarPath = () => (
  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
);

const SearchPath = () => (
  <>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </>
);

const CheckPath = () => <polyline points="20 6 9 17 4 12" />;

const CartPath = () => (
  <>
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </>
);

const AlertPath = () => (
  <>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </>
);

/* ─── Default ──────────────────────────────────────── */

export const Default: Story = {
  args: {
    children: <HeartPath />,
  },
};

/* ─── Sizes ────────────────────────────────────────── */

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-4)', alignItems: 'center' }}>
      <Icon size="sm"><HeartPath /></Icon>
      <Icon size="md"><HeartPath /></Icon>
      <Icon size="lg"><HeartPath /></Icon>
    </div>
  ),
};

/* ─── Icon gallery ─────────────────────────────────── */

export const IconSet: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-4)', alignItems: 'center', flexWrap: 'wrap' }}>
      <Icon><HeartPath /></Icon>
      <Icon><StarPath /></Icon>
      <Icon><SearchPath /></Icon>
      <Icon><CheckPath /></Icon>
      <Icon><CartPath /></Icon>
      <Icon><AlertPath /></Icon>
    </div>
  ),
};

/* ─── Color inheritance ────────────────────────────── */

export const ColorInheritance: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-4)', alignItems: 'center' }}>
      <span style={{ color: 'var(--color-foreground)' }}>
        <Icon><HeartPath /></Icon>
      </span>
      <span style={{ color: 'var(--color-foreground-subtle)' }}>
        <Icon><HeartPath /></Icon>
      </span>
      <span style={{ color: 'var(--color-success)' }}>
        <Icon><CheckPath /></Icon>
      </span>
      <span style={{ color: 'var(--color-destructive)' }}>
        <Icon><AlertPath /></Icon>
      </span>
      <span style={{ color: 'var(--color-warning)' }}>
        <Icon><AlertPath /></Icon>
      </span>
    </div>
  ),
};

/* ─── Accessible (labelled) ────────────────────────── */

/** A standalone icon that carries meaning on its own gets `decorative={false}` and a `label`. */
export const Accessible: Story = {
  name: 'Meaningful on its own (has a label)',
  args: {
    decorative: false,
    label: 'Favorite',
    children: <HeartPath />,
  },
};

/* ─── Inline with text ─────────────────────────────── */

export const InlineWithText: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
      <Text as="span" size="sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
        <Icon size="sm"><CartPath /></Icon>
        Add to cart
      </Text>
      <Text as="span" size="base" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
        <Icon size="md"><SearchPath /></Icon>
        Search products
      </Text>
      <Text as="span" size="lg" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
        <Icon size="lg"><HeartPath /></Icon>
        Wishlist
      </Text>
    </div>
  ),
};
