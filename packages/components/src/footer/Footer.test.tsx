import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import { Footer } from './Footer';
import type { FooterColumn } from './Footer';

const sampleColumns: FooterColumn[] = [
  {
    heading: 'Shop',
    links: [
      { label: 'Phone Cases', href: '/collections/phone-cases' },
      { label: 'Wallets', href: '/collections/wallets' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '/pages/about' },
      { label: 'Journal', href: '/blogs/journal' },
    ],
  },
];

const defaultProps = {
  logoSrc: '/logo.svg',
  logoAlt: 'Mason Supply Co.',
  tagline: 'Thoughtfully designed accessories for everyday carry.',
  columns: sampleColumns,
  copyright: '© 2026 Mason Supply Co. All rights reserved.',
  legalLinks: [
    { label: 'Privacy Policy', href: '/policies/privacy' },
    { label: 'Terms of Service', href: '/policies/terms' },
  ],
};

describe('Footer', () => {
  // ── Rendering ──────────────────────────────────────────

  it('renders as a contentinfo landmark', () => {
    render(<Footer {...defaultProps} />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('renders the logo image with alt text', () => {
    render(<Footer {...defaultProps} />);
    expect(screen.getByAltText('Mason Supply Co.')).toBeInTheDocument();
  });

  it('links the logo to the logoHref', () => {
    render(<Footer {...defaultProps} logoHref="/home" />);
    const logoLink = screen.getByRole('link', { name: 'Mason Supply Co.' });
    expect(logoLink).toHaveAttribute('href', '/home');
  });

  it('renders the tagline', () => {
    render(<Footer {...defaultProps} />);
    expect(
      screen.getByText('Thoughtfully designed accessories for everyday carry.'),
    ).toBeInTheDocument();
  });

  // ── Columns ────────────────────────────────────────────

  it('renders column headings as level-3 headings', () => {
    render(<Footer {...defaultProps} />);
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings).toHaveLength(2);
    expect(headings[0]).toHaveTextContent('Shop');
    expect(headings[1]).toHaveTextContent('Company');
  });

  it('renders each column heading via getByRole', () => {
    render(<Footer {...defaultProps} />);
    expect(screen.getByRole('heading', { level: 3, name: 'Shop' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Company' })).toBeInTheDocument();
  });

  it('renders column links with correct hrefs', () => {
    render(<Footer {...defaultProps} />);
    expect(screen.getByRole('link', { name: 'Phone Cases' })).toHaveAttribute(
      'href',
      '/collections/phone-cases',
    );
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute(
      'href',
      '/pages/about',
    );
  });

  it('renders no headings when columns are omitted', () => {
    render(<Footer logoSrc="/logo.svg" />);
    expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument();
  });

  // ── Bottom bar ─────────────────────────────────────────

  it('renders the copyright text', () => {
    render(<Footer {...defaultProps} />);
    expect(
      screen.getByText('© 2026 Mason Supply Co. All rights reserved.'),
    ).toBeInTheDocument();
  });

  it('renders legal links with correct hrefs', () => {
    render(<Footer {...defaultProps} />);
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute(
      'href',
      '/policies/privacy',
    );
    expect(screen.getByRole('link', { name: 'Terms of Service' })).toHaveAttribute(
      'href',
      '/policies/terms',
    );
  });

  it('omits the bottom bar without copyright or legal links', () => {
    const { container } = render(
      <Footer logoSrc="/logo.svg" columns={sampleColumns} />,
    );
    expect(container.querySelector('.ds-footer__bottom')).not.toBeInTheDocument();
  });

  // ── API ────────────────────────────────────────────────

  it('merges a custom className', () => {
    render(<Footer {...defaultProps} className="custom-class" />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('ds-footer');
    expect(footer).toHaveClass('custom-class');
  });

  it('forwards additional HTML attributes', () => {
    render(<Footer {...defaultProps} data-testid="site-footer" />);
    expect(screen.getByTestId('site-footer')).toBeInTheDocument();
  });

  // ── Accessibility ──────────────────────────────────────

  it('has no accessibility violations', async () => {
    const { container } = render(<Footer {...defaultProps} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no accessibility violations in minimal form', async () => {
    const { container } = render(
      <Footer logoSrc="/logo.svg" copyright="© 2026 Mason Supply Co." />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
