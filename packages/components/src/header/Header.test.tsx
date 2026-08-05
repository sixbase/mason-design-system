import { render, screen, within } from '@testing-library/react';
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

  // ── Skip link ───────────────────────────────────────────

  it('renders a skip link as the first focusable element', () => {
    render(<Header logoSrc="/logo.svg" navItems={navItems} />);
    const skip = screen.getByRole('link', { name: 'Skip to content' });
    expect(skip).toHaveAttribute('href', '#main-content');
    expect(skip).toBe(screen.getByRole('banner').firstElementChild);
  });

  it('honours a custom skipHref', () => {
    render(<Header logoSrc="/logo.svg" skipHref="#content" />);
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute(
      'href',
      '#content',
    );
  });

  // ── Sticky ──────────────────────────────────────────────

  it('applies the sticky modifier class when sticky is set', () => {
    render(<Header logoSrc="/logo.svg" sticky />);
    expect(screen.getByRole('banner')).toHaveClass('ds-header--sticky');
  });

  it('does not apply the sticky modifier by default', () => {
    render(<Header logoSrc="/logo.svg" />);
    expect(screen.getByRole('banner')).not.toHaveClass('ds-header--sticky');
  });

  // ── Cart count badge ────────────────────────────────────

  it('renders a visual cart count badge hidden from screen readers', () => {
    const { container } = render(<Header logoSrc="/logo.svg" cartCount={3} />);
    const badge = container.querySelector('.ds-header__cart-count');
    expect(badge).toHaveTextContent('3');
    expect(badge).toHaveAttribute('aria-hidden', 'true');
  });

  it('omits the cart count badge when the cart is empty', () => {
    const { container } = render(<Header logoSrc="/logo.svg" cartCount={0} />);
    expect(container.querySelector('.ds-header__cart-count')).not.toBeInTheDocument();
  });

  it('caps the cart count badge at 99+', () => {
    const { container } = render(<Header logoSrc="/logo.svg" cartCount={120} />);
    expect(container.querySelector('.ds-header__cart-count')).toHaveTextContent('99+');
  });

  // ── Mobile menu ─────────────────────────────────────────

  it('renders the menu button when navItems are provided', () => {
    render(<Header logoSrc="/logo.svg" navItems={navItems} />);
    const trigger = screen.getByRole('button', { name: 'Open menu' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).not.toHaveAttribute('aria-controls');
  });

  it('omits the menu button when no navItems are given', () => {
    render(<Header logoSrc="/logo.svg" />);
    expect(screen.queryByRole('button', { name: 'Open menu' })).not.toBeInTheDocument();
  });

  it('opens the nav drawer with stacked links on menu click', async () => {
    const user = userEvent.setup();
    render(<Header logoSrc="/logo.svg" navItems={navItems} />);
    const trigger = screen.getByRole('button', { name: 'Open menu' });

    await user.click(trigger);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-label', 'Menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    const drawerNav = within(dialog).getByRole('navigation', { name: 'Main' });
    expect(trigger.getAttribute('aria-controls')).toBe(drawerNav.getAttribute('id'));
    navItems.forEach((item) => {
      expect(within(drawerNav).getByRole('link', { name: item.label })).toHaveAttribute(
        'href',
        item.href,
      );
    });
  });

  // Hash hrefs below avoid jsdom "navigation not implemented" noise when
  // the link click actually fires.
  it('closes the drawer when a nav link is clicked', async () => {
    const user = userEvent.setup();
    render(
      <Header logoSrc="/logo.svg" navItems={[{ label: 'Kitchen', href: '#kitchen' }]} />,
    );

    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('link', { name: 'Kitchen' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('supports controlled menu state', async () => {
    const user = userEvent.setup();
    const onMenuOpenChange = vi.fn();
    render(
      <Header
        logoSrc="/logo.svg"
        navItems={[{ label: 'Kitchen', href: '#kitchen' }]}
        menuOpen
        onMenuOpenChange={onMenuOpenChange}
      />,
    );

    // Drawer is open because menuOpen is controlled to true
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();

    // Closing requests a state change but does not close by itself
    await user.click(within(dialog).getByRole('link', { name: 'Kitchen' }));
    expect(onMenuOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('has no accessibility violations with the menu open', async () => {
    const user = userEvent.setup();
    const { baseElement } = render(
      <Header logoSrc="/logo.svg" logoAlt="Mason Supply home" navItems={navItems} />,
    );
    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(await axe(baseElement)).toHaveNoViolations();
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
