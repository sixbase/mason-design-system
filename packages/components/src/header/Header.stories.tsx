import type { Meta, StoryObj } from '@storybook/react';
import { Header } from './Header';

const meta: Meta<typeof Header> = {
  title: 'Components/Header',
  component: Header,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
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
