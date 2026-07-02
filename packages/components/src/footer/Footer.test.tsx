import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import { Footer } from './Footer';

const columns = [
  {
    heading: 'Shop',
    links: [
      { label: 'Kitchen', href: '/collections/kitchen' },
      { label: 'Hardware', href: '/collections/hardware' },
    ],
  },
  {
    heading: 'Support',
    links: [{ label: 'Shipping & Returns', href: '/pages/shipping' }],
  },
];

describe('Footer', () => {
  it('renders as a footer landmark', () => {
    render(<Footer logoSrc="/logo.svg" />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('renders the logo linked to logoHref', () => {
    render(<Footer logoSrc="/logo.svg" logoAlt="Mason Supply home" logoHref="/" />);
    const link = screen.getByRole('link', { name: 'Mason Supply home' });
    expect(link).toHaveAttribute('href', '/');
  });

  it('renders the tagline when provided', () => {
    render(<Footer logoSrc="/logo.svg" tagline="Housewares built to outlast trends." />);
    expect(screen.getByText('Housewares built to outlast trends.')).toBeInTheDocument();
  });

  it('renders column headings and links', () => {
    render(<Footer logoSrc="/logo.svg" columns={columns} />);
    expect(screen.getByRole('heading', { name: 'Shop' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Kitchen' })).toHaveAttribute('href', '/collections/kitchen');
    expect(screen.getByRole('link', { name: 'Shipping & Returns' })).toHaveAttribute('href', '/pages/shipping');
  });

  it('renders copyright text', () => {
    render(<Footer logoSrc="/logo.svg" copyright="© 2026 Mason Supply Co." />);
    expect(screen.getByText('© 2026 Mason Supply Co.')).toBeInTheDocument();
  });

  it('renders legal links', () => {
    render(
      <Footer
        logoSrc="/logo.svg"
        legalLinks={[
          { label: 'Privacy Policy', href: '/policies/privacy' },
          { label: 'Terms of Service', href: '/policies/terms' },
        ]}
      />,
    );
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/policies/privacy');
    expect(screen.getByRole('link', { name: 'Terms of Service' })).toBeInTheDocument();
  });

  it('omits the bottom bar when no copyright or legal links are given', () => {
    const { container } = render(<Footer logoSrc="/logo.svg" columns={columns} />);
    expect(container.querySelector('.ds-footer__bottom')).not.toBeInTheDocument();
  });

  it('merges custom className', () => {
    render(<Footer logoSrc="/logo.svg" className="custom" />);
    expect(screen.getByRole('contentinfo')).toHaveClass('custom', 'ds-footer');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<Footer ref={ref} logoSrc="/logo.svg" />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Footer
        logoSrc="/logo.svg"
        logoAlt="Mason Supply home"
        tagline="Housewares built to outlast trends."
        columns={columns}
        copyright="© 2026 Mason Supply Co. All rights reserved."
        legalLinks={[{ label: 'Privacy Policy', href: '/policies/privacy' }]}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
