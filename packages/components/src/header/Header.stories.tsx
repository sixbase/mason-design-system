import type { Meta, StoryObj } from '@storybook/react';
import { Header } from './Header';

/* Inline wordmark so stories are self-contained (Storybook serves no static assets). */
const LOGO_SRC = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="20" viewBox="0 0 120 20"><text x="0" y="15" font-family="Georgia, serif" font-size="14" font-weight="600" fill="currentColor">MASON</text></svg>',
)}`;

const NAV_ITEMS = [
  { label: 'Shop', href: '#' },
  { label: 'Collections', href: '#' },
  { label: 'Journal', href: '#' },
  { label: 'About', href: '#' },
];

const meta: Meta<typeof Header> = {
  title: 'Components/Header',
  component: Header,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    cartCount: { control: 'number' },
    showThemeToggle: { control: 'boolean' },
  },
  args: {
    logoSrc: LOGO_SRC,
    logoAlt: 'Mason Supply Co.',
    navItems: NAV_ITEMS,
  },
};
export default meta;

type Story = StoryObj<typeof Header>;

export const Default: Story = {};

export const WithCartItems: Story = {
  args: {
    cartCount: 3,
  },
};

export const WithoutThemeToggle: Story = {
  args: {
    showThemeToggle: false,
  },
};

export const LogoOnly: Story = {
  args: {
    navItems: [],
    showThemeToggle: false,
  },
};
