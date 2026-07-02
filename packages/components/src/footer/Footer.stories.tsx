import type { Meta, StoryObj } from '@storybook/react';
import { Footer } from './Footer';

/* Inline wordmark so stories are self-contained (Storybook serves no static assets). */
const LOGO_SRC = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="20" viewBox="0 0 120 20"><text x="0" y="15" font-family="Georgia, serif" font-size="14" font-weight="600" fill="currentColor">MASON</text></svg>',
)}`;

const COLUMNS = [
  {
    heading: 'Shop',
    links: [
      { label: 'Phone Cases', href: '#' },
      { label: 'Wallets', href: '#' },
      { label: 'Bags', href: '#' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Journal', href: '#' },
      { label: 'Careers', href: '#' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'Contact', href: '#' },
      { label: 'FAQ', href: '#' },
      { label: 'Warranty', href: '#' },
    ],
  },
];

const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
];

const meta: Meta<typeof Footer> = {
  title: 'Components/Footer',
  component: Footer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    logoSrc: LOGO_SRC,
    logoAlt: 'Mason Supply Co.',
    style: { marginTop: 0 },
  },
};
export default meta;

type Story = StoryObj<typeof Footer>;

export const Default: Story = {
  args: {
    tagline: 'Thoughtfully designed accessories for everyday carry.',
    columns: COLUMNS,
    copyright: '© 2026 Mason Supply Co. All rights reserved.',
    legalLinks: LEGAL_LINKS,
  },
};

export const Minimal: Story = {
  args: {
    copyright: '© 2026 Mason Supply Co. All rights reserved.',
  },
};

export const ColumnsOnly: Story = {
  args: {
    columns: COLUMNS,
  },
};

export const WithoutLegalLinks: Story = {
  args: {
    tagline: 'Thoughtfully designed accessories for everyday carry.',
    columns: COLUMNS,
    copyright: '© 2026 Mason Supply Co. All rights reserved.',
  },
};
