import type { Meta, StoryObj } from '@storybook/react';
import { Header } from './Header';

const meta: Meta<typeof Header> = {
  title: 'Components/Header',
  component: Header,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The top of every page: logo, main links, theme switch and cart. On phones the links move into a menu.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Header>;

const logoSrc =
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="140" height="24" viewBox="0 0 140 24"><text x="0" y="18" font-family="Georgia, serif" font-size="18" fill="%23342F2A">Mason Supply</text></svg>';

const navItems = [
  { label: 'Kitchen', href: '/collections/kitchen' },
  { label: 'Hardware', href: '/collections/hardware' },
  { label: 'Workshop', href: '/collections/workshop' },
  { label: 'Journal', href: '/blogs/journal' },
];

export const Default: Story = {
  args: {
    logoSrc,
    logoAlt: 'Mason Supply home',
    navItems,
  },
};

export const WithCartItems: Story = {
  args: {
    logoSrc,
    logoAlt: 'Mason Supply home',
    navItems,
    cartCount: 3,
  },
};

export const WithoutThemeToggle: Story = {
  args: {
    logoSrc,
    logoAlt: 'Mason Supply home',
    navItems,
    showThemeToggle: false,
  },
};

export const LogoOnly: Story = {
  args: {
    logoSrc,
    logoAlt: 'Mason Supply home',
    showThemeToggle: false,
  },
};

export const CurrentPage: Story = {
  args: {
    logoSrc,
    logoAlt: 'Mason Supply home',
    navItems: navItems.map((item) => ({ ...item, current: item.label === 'Hardware' })),
    cartCount: 1,
  },
};

/* A long menu: from 768px the links wrap on the centre track rather than
   pushing the logo or the actions; below 768px they move into the drawer. */
export const ManyLinks: Story = {
  args: {
    logoSrc,
    logoAlt: 'Mason Supply home',
    navItems: [
      ...navItems,
      { label: 'Outdoor', href: '/collections/outdoor' },
      { label: 'Lighting', href: '/collections/lighting' },
      { label: 'Textiles', href: '/collections/textiles' },
      { label: 'Gift Cards', href: '/products/gift-card' },
      { label: 'Sale', href: '/collections/sale' },
    ],
    cartCount: 12,
  },
};

export const Sticky: Story = {
  args: {
    logoSrc,
    logoAlt: 'Mason Supply home',
    navItems,
    sticky: true,
    cartCount: 2,
  },
  render: (args) => (
    <div style={{ height: 'var(--size-content-lg)' }}>
      <Header {...args} />
    </div>
  ),
};

export const MobileMenu: Story = {
  args: {
    logoSrc,
    logoAlt: 'Mason Supply home',
    navItems,
    cartCount: 3,
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
};
