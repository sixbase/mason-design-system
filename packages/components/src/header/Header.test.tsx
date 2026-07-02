import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { afterEach, describe, expect, it } from 'vitest';
import { Header } from './Header';
import type { HeaderNavItem } from './Header';

const sampleNavItems: HeaderNavItem[] = [
  { label: 'Shop', href: '/collections/all' },
  { label: 'About', href: '/pages/about' },
  { label: 'Journal', href: '/blogs/journal' },
];

const defaultProps = {
  logoSrc: '/logo.svg',
  logoAlt: 'Mason Supply Co.',
  navItems: sampleNavItems,
};

afterEach(() => {
  document.documentElement.classList.remove('dark');
  localStorage.clear();
});

describe('Header', () => {
  // ── Rendering ──────────────────────────────────────────

  it('renders as a banner landmark', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders the logo image with alt text', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByAltText('Mason Supply Co.')).toBeInTheDocument();
  });

  it('links the logo to the logoHref', () => {
    render(<Header {...defaultProps} logoHref="/home" />);
    const logoLink = screen.getByRole('link', { name: 'Mason Supply Co.' });
    expect(logoLink).toHaveAttribute('href', '/home');
  });

  // ── Navigation ─────────────────────────────────────────

  it('renders the main navigation landmark', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
  });

  it('renders nav links with correct hrefs', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByRole('link', { name: 'Shop' })).toHaveAttribute(
      'href',
      '/collections/all',
    );
    expect(screen.getByRole('link', { name: 'Journal' })).toHaveAttribute(
      'href',
      '/blogs/journal',
    );
  });

  it('omits the navigation when no nav items are provided', () => {
    render(<Header logoSrc="/logo.svg" navItems={[]} />);
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  // ── Cart ───────────────────────────────────────────────

  it('renders the cart link with default href', () => {
    render(<Header {...defaultProps} />);
    const cartLink = screen.getByRole('link', { name: 'Shopping bag (0 items)' });
    expect(cartLink).toHaveAttribute('href', '/cart');
  });

  it('uses a custom cart href', () => {
    render(<Header {...defaultProps} cartHref="/bag" />);
    expect(
      screen.getByRole('link', { name: 'Shopping bag (0 items)' }),
    ).toHaveAttribute('href', '/bag');
  });

  it('announces the cart count in the accessible name', () => {
    render(<Header {...defaultProps} cartCount={3} />);
    expect(
      screen.getByRole('link', { name: 'Shopping bag (3 items)' }),
    ).toBeInTheDocument();
  });

  it('uses singular phrasing for a single cart item', () => {
    render(<Header {...defaultProps} cartCount={1} />);
    expect(
      screen.getByRole('link', { name: 'Shopping bag (1 item)' }),
    ).toBeInTheDocument();
  });

  // ── Theme toggle ───────────────────────────────────────

  it('renders the theme toggle by default', () => {
    render(<Header {...defaultProps} />);
    expect(
      screen.getByRole('button', { name: 'Toggle dark mode' }),
    ).toBeInTheDocument();
  });

  it('hides the theme toggle when showThemeToggle is false', () => {
    render(<Header {...defaultProps} showThemeToggle={false} />);
    expect(
      screen.queryByRole('button', { name: 'Toggle dark mode' }),
    ).not.toBeInTheDocument();
  });

  it('enables dark mode on toggle click', async () => {
    const user = userEvent.setup();
    render(<Header {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Toggle dark mode' }));

    expect(document.documentElement).toHaveClass('dark');
    expect(localStorage.getItem('ds-theme')).toBe('dark');
  });

  it('returns to light mode on a second toggle click', async () => {
    const user = userEvent.setup();
    render(<Header {...defaultProps} />);

    const toggle = screen.getByRole('button', { name: 'Toggle dark mode' });
    await user.click(toggle);
    await user.click(toggle);

    expect(document.documentElement).not.toHaveClass('dark');
    expect(localStorage.getItem('ds-theme')).toBe('light');
  });

  it('syncs with an existing dark class on mount', async () => {
    document.documentElement.classList.add('dark');
    const user = userEvent.setup();
    render(<Header {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Toggle dark mode' }));

    expect(document.documentElement).not.toHaveClass('dark');
    expect(localStorage.getItem('ds-theme')).toBe('light');
  });

  // ── API ────────────────────────────────────────────────

  it('merges a custom className', () => {
    render(<Header {...defaultProps} className="custom-class" />);
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('ds-header');
    expect(header).toHaveClass('custom-class');
  });

  // ── Accessibility ──────────────────────────────────────

  it('has no accessibility violations', async () => {
    const { container } = render(<Header {...defaultProps} cartCount={2} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no accessibility violations without nav or toggle', async () => {
    const { container } = render(
      <Header logoSrc="/logo.svg" showThemeToggle={false} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
