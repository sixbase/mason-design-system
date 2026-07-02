import type { Meta, StoryObj } from '@storybook/react';
import { Footer } from './Footer';

const meta: Meta<typeof Footer> = {
  title: 'Components/Footer',
  component: Footer,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof Footer>;

const logoSrc =
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="140" height="24" viewBox="0 0 140 24"><text x="0" y="18" font-family="Georgia, serif" font-size="18" fill="%23342F2A">Mason Supply</text></svg>';

const columns = [
  {
    heading: 'Shop',
    links: [
      { label: 'Kitchen', href: '/collections/kitchen' },
      { label: 'Hardware', href: '/collections/hardware' },
      { label: 'Workshop', href: '/collections/workshop' },
      { label: 'Gift Cards', href: '/products/gift-card' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'Our Story', href: '/pages/about' },
      { label: 'Journal', href: '/blogs/journal' },
      { label: 'Contact', href: '/pages/contact' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'Shipping & Returns', href: '/pages/shipping' },
      { label: 'Care Guides', href: '/pages/care' },
      { label: 'FAQ', href: '/pages/faq' },
    ],
  },
];

export const Default: Story = {
  args: {
    logoSrc,
    logoAlt: 'Mason Supply home',
    tagline: 'Housewares and hardware built to outlast trends.',
    columns,
    copyright: '© 2026 Mason Supply Co. All rights reserved.',
    legalLinks: [
      { label: 'Privacy Policy', href: '/policies/privacy' },
      { label: 'Terms of Service', href: '/policies/terms' },
    ],
  },
};

export const WithoutTagline: Story = {
  args: {
    logoSrc,
    logoAlt: 'Mason Supply home',
    columns,
    copyright: '© 2026 Mason Supply Co. All rights reserved.',
  },
};

export const Minimal: Story = {
  args: {
    logoSrc,
    logoAlt: 'Mason Supply home',
    copyright: '© 2026 Mason Supply Co. All rights reserved.',
  },
};
