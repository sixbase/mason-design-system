import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Header } from './Header';

const navItems = [
  { label: 'Kitchen', href: '/collections/kitchen' },
  { label: 'Hardware', href: '/collections/hardware' },
  { label: 'Workshop', href: '/collections/workshop' },
];

// The jsdom environment here ships a localStorage object without Storage
// methods, so stub a minimal working implementation for the theme toggle.
const storage = new Map<string, string>();
const localStorageStub = {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => void storage.set(key, String(value)),
  removeItem: (key: string) => void storage.delete(key),
  clear: () => storage.clear(),
};

describe('Header', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', localStorageStub);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    storage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('renders as a banner landmark', () => {
    render(<Header logoSrc="/logo.svg" />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders the logo linked to logoHref', () => {
    render(<Header logoSrc="/logo.svg" logoAlt="Mason Supply home" logoHref="/" />);
    expect(screen.getByRole('link', { name: 'Mason Supply home' })).toHaveAttribute('href', '/');
  });

  it('renders navigation links', () => {
    render(<Header logoSrc="/logo.svg" navItems={navItems} />);
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Kitchen' })).toHaveAttribute('href', '/collections/kitchen');
  });

  it('omits the nav when no items are given', () => {
    render(<Header logoSrc="/logo.svg" />);
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('renders the cart link with an item count label', () => {
    render(<Header logoSrc="/logo.svg" cartCount={3} cartHref="/cart" />);
    expect(screen.getByRole('link', { name: 'Shopping bag (3 items)' })).toHaveAttribute('href', '/cart');
  });

  it('uses singular label for a single cart item', () => {
    render(<Header logoSrc="/logo.svg" cartCount={1} />);
    expect(screen.getByRole('link', { name: 'Shopping bag (1 item)' })).toBeInTheDocument();
  });

  it('shows the theme toggle by default', () => {
    render(<Header logoSrc="/logo.svg" />);
    expect(screen.getByRole('button', { name: 'Toggle dark mode' })).toBeInTheDocument();
  });

  it('hides the theme toggle when showThemeToggle is false', () => {
    render(<Header logoSrc="/logo.svg" showThemeToggle={false} />);
    expect(screen.queryByRole('button', { name: 'Toggle dark mode' })).not.toBeInTheDocument();
  });

  it('toggles the dark class on the document root', async () => {
    const user = userEvent.setup();
    render(<Header logoSrc="/logo.svg" />);
    const toggle = screen.getByRole('button', { name: 'Toggle dark mode' });

    await user.click(toggle);
    expect(document.documentElement).toHaveClass('dark');
    expect(localStorage.getItem('ds-theme')).toBe('dark');

    await user.click(toggle);
    expect(document.documentElement).not.toHaveClass('dark');
    expect(localStorage.getItem('ds-theme')).toBe('light');
  });

  it('merges custom className', () => {
    render(<Header logoSrc="/logo.svg" className="custom" />);
    expect(screen.getByRole('banner')).toHaveClass('custom', 'ds-header');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<Header ref={ref} logoSrc="/logo.svg" />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Header logoSrc="/logo.svg" logoAlt="Mason Supply home" navItems={navItems} cartCount={2} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
