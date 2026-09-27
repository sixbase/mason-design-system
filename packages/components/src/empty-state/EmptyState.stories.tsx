import type { Meta, StoryObj } from '@storybook/react';
import { Icon } from '../icon/Icon';
import { Heading } from '../typography/Typography';
import { EmptyState } from './EmptyState';

const meta: Meta<typeof EmptyState> = {
  title: 'Components/EmptyState',
  component: EmptyState,
  parameters: {
    docs: {
      description: {
        component:
          'What shows when there’s nothing there yet — an empty cart, no search results, no orders.',
      },
    },
  },
  argTypes: {
    compact: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

// ─── Icons ─────────────────────────────────────────────────

const ShoppingBagIcon = () => (
  <Icon decorative>
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </Icon>
);

const SearchIcon = () => (
  <Icon decorative>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </Icon>
);

const PackageIcon = () => (
  <Icon decorative>
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </Icon>
);

const HeartIcon = () => (
  <Icon decorative>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </Icon>
);

// ─── Stories ───────────────────────────────────────────────

export const Default: Story = {
  args: {
    heading: 'Your bag is empty',
    description: "Looks like you haven't added anything yet.",
    action: { label: 'Browse collection', href: '/collections' },
    icon: <ShoppingBagIcon />,
  },
};

export const EmptyCart: Story = {
  name: 'With a second action',
  args: {
    icon: <ShoppingBagIcon />,
    heading: 'Your bag is empty',
    description: "Looks like you haven't added anything yet.",
    action: { label: 'Browse collection', href: '/collections' },
    secondaryAction: { label: 'Continue shopping', href: '/' },
  },
};

export const NoSearchResults: Story = {
  args: {
    icon: <SearchIcon />,
    heading: 'No results found',
    description: 'Try adjusting your search or browse our collections.',
    action: { label: 'Clear search', href: '/search' },
  },
};

export const NoOrders: Story = {
  args: {
    icon: <PackageIcon />,
    heading: 'No orders yet',
    description: "When you place an order, it'll appear here.",
    action: { label: 'Start shopping', href: '/' },
  },
};

export const EmptyWishlist: Story = {
  args: {
    icon: <HeartIcon />,
    heading: 'Your wishlist is empty',
    description: 'Save items you love to revisit them later.',
    action: { label: 'Explore products', href: '/collections' },
  },
};

export const InformationalOnly: Story = {
  args: {
    heading: 'No items match your filters',
    description: 'Try removing some filters to see more results.',
  },
};

export const WithoutDescription: Story = {
  args: {
    icon: <ShoppingBagIcon />,
    heading: 'Your bag is empty',
    action: { label: 'Browse collection', href: '/collections' },
  },
};

export const Compact: Story = {
  args: {
    icon: <ShoppingBagIcon />,
    heading: 'Your bag is empty',
    description: "You haven't added anything yet.",
    action: { label: 'Browse collection', href: '/collections' },
    compact: true,
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 'var(--size-modal-sm)', border: 'var(--border-width-sm) solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
        <Story />
      </div>
    ),
  ],
};

/**
 * Under a section's own h2, drop the empty state's heading one level with
 * `headingLevel="h3"` — same size on screen, correct page outline.
 */
export const InsideSection: Story = {
  name: 'Inside a section (heading one level down)',
  render: () => (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
      <Heading as="h2" size="xl">Your orders</Heading>
      <EmptyState
        headingLevel="h3"
        icon={<PackageIcon />}
        heading="No orders yet"
        description="When you place an order, it’ll appear here."
        action={{ label: 'Start shopping', href: '/' }}
      />
    </section>
  ),
};

export const AllVariations: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-10)' }}>
      <EmptyState
        icon={<ShoppingBagIcon />}
        heading="Your bag is empty"
        description="Looks like you haven't added anything yet."
        action={{ label: 'Browse collection', href: '/collections' }}
        secondaryAction={{ label: 'Continue shopping', href: '/' }}
      />
      <EmptyState
        icon={<SearchIcon />}
        heading="No results found"
        description="Try adjusting your search or browse our collections."
        action={{ label: 'Clear search', href: '/search' }}
      />
      <EmptyState
        heading="No items match your filters"
        description="Try removing some filters to see more results."
      />
    </div>
  ),
};
