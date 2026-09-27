import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { act, render, screen, within } from '@testing-library/react';
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

  // Regression: the bump compared against the count at mount, so going
  // back to it (remove the item just added) changed the count silently.
  it('bumps the count on every change after load, including back to the starting count', () => {
    const { container, rerender } = render(<Header logoSrc="/logo.svg" cartCount={2} />);
    const badge = () => container.querySelector('.ds-header__cart-count');
    expect(badge()).not.toHaveClass('ds-header__cart-count--bump');
    rerender(<Header logoSrc="/logo.svg" cartCount={3} />);
    expect(badge()).toHaveClass('ds-header__cart-count--bump');
    rerender(<Header logoSrc="/logo.svg" cartCount={2} />);
    expect(badge()).toHaveTextContent('2');
    expect(badge()).toHaveClass('ds-header__cart-count--bump');
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

  // ── Regressions (QA break pass) ─────────────────────────

  describe('regressions', () => {
    afterEach(() => {
      // @ts-expect-error — jsdom has no matchMedia; remove the test double
      delete window.matchMedia;
    });

    function mockMatchMedia() {
      const listeners = new Set<(event: { matches: boolean }) => void>();
      window.matchMedia = vi.fn(() => ({
        matches: false,
        addEventListener: (_: string, cb: (event: { matches: boolean }) => void) =>
          listeners.add(cb),
        removeEventListener: (_: string, cb: (event: { matches: boolean }) => void) =>
          listeners.delete(cb),
      })) as unknown as typeof window.matchMedia;
      return {
        cross: (matches: boolean) => listeners.forEach((cb) => cb({ matches })),
        listeners,
      };
    }

    it('closes the mobile drawer when the viewport grows past the md breakpoint', async () => {
      const media = mockMatchMedia();
      const user = userEvent.setup();
      const { unmount } = render(<Header logoSrc="/logo.svg" navItems={navItems} />);

      await user.click(screen.getByRole('button', { name: 'Open menu' }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      act(() => media.cross(true));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      // Listener is only attached while open, and cleaned up.
      expect(media.listeners.size).toBe(0);
      unmount();
    });

    it('still switches theme when localStorage throws (sandboxed iframe, blocked storage)', async () => {
      vi.stubGlobal('localStorage', {
        ...localStorageStub,
        setItem: () => {
          throw new DOMException('Access denied', 'SecurityError');
        },
      });
      const errors: unknown[] = [];
      const onError = (event: ErrorEvent) => {
        errors.push(event.error);
        event.preventDefault();
      };
      window.addEventListener('error', onError);
      const user = userEvent.setup();
      render(<Header logoSrc="/logo.svg" />);

      await user.click(screen.getByRole('button', { name: 'Toggle dark mode' }));
      window.removeEventListener('error', onError);

      expect(errors).toEqual([]);
      expect(document.documentElement).toHaveClass('dark');
    });

    it('exposes the theme state with aria-pressed', async () => {
      const user = userEvent.setup();
      render(<Header logoSrc="/logo.svg" />);
      const toggle = screen.getByRole('button', { name: 'Toggle dark mode' });
      expect(toggle).toHaveAttribute('aria-pressed', 'false');
      await user.click(toggle);
      expect(toggle).toHaveAttribute('aria-pressed', 'true');
    });

    it('toggles from the live theme when another control changed it', async () => {
      const user = userEvent.setup();
      render(<Header logoSrc="/logo.svg" />);
      document.documentElement.classList.add('dark'); // e.g. the docs sidebar toggle
      await user.click(screen.getByRole('button', { name: 'Toggle dark mode' }));
      expect(document.documentElement).not.toHaveClass('dark');
    });

    it('accepts repeated nav labels without React key collisions', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      render(
        <Header
          logoSrc="/logo.svg"
          navItems={[
            { label: 'Sale', href: '/sale' },
            { label: 'Sale', href: '/outlet' },
          ]}
        />,
      );
      expect(spy.mock.calls.flat().join(' ')).not.toMatch(/same key/);
      spy.mockRestore();
    });

    it('omits the built-in skip link when skipHref is false', () => {
      const { container } = render(<Header logoSrc="/logo.svg" skipHref={false} />);
      expect(container.querySelector('.ds-header__skip-link')).not.toBeInTheDocument();
      expect(screen.queryByText('Skip to content')).not.toBeInTheDocument();
    });

    it('renders the built-in skip link as the shared SkipLink (one look for one control)', () => {
      render(<Header logoSrc="/logo.svg" />);
      expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveClass(
        'ds-skip-link',
        'ds-header__skip-link',
      );
    });

    it('marks the current nav item with aria-current in the bar and the drawer', async () => {
      const user = userEvent.setup();
      render(
        <Header
          logoSrc="/logo.svg"
          navItems={navItems.map((item) => ({ ...item, current: item.label === 'Hardware' }))}
        />,
      );
      const bar = screen.getByRole('navigation', { name: 'Main' });
      expect(within(bar).getByRole('link', { name: 'Hardware' })).toHaveAttribute('aria-current', 'page');
      expect(within(bar).getByRole('link', { name: 'Kitchen' })).not.toHaveAttribute('aria-current');

      await user.click(screen.getByRole('button', { name: 'Open menu' }));
      const drawerNav = screen.getByRole('dialog').querySelector('nav')!;
      expect(within(drawerNav).getByRole('link', { name: 'Hardware' })).toHaveAttribute(
        'aria-current',
        'page',
      );
    });

    it('flags a header with navigation for the centred-logo phone layout', () => {
      const { rerender } = render(<Header logoSrc="/logo.svg" navItems={navItems} />);
      expect(screen.getByRole('banner')).toHaveClass('ds-header--has-nav');
      rerender(<Header logoSrc="/logo.svg" />);
      expect(screen.getByRole('banner')).not.toHaveClass('ds-header--has-nav');
    });
  });

  // Regression: print always uses the light tokens, but the dark-mode logo
  // invert still applied, so a page printed from dark mode had a white logo
  // on white paper. The invert is screen-only (and honours data-theme too).
  it('inverts the dark-mode logo on screen only', () => {
    const css = readFileSync(resolve(__dirname, 'Header.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    expect(css).toMatch(
      /@media screen\s*\{\s*:is\(\.dark, \[data-theme="dark"\]\) \.ds-header__logo-img\s*\{\s*filter: invert\(1\);\s*\}\s*\}/,
    );
    expect(css.match(/invert\(1\)/g)).toHaveLength(1);
  });

  // Round 5 (shopper journeys): the sticky header's scroll-padding made
  // Chromium and WebKit "reveal" the header's own controls — Shift+Tab into
  // the header, or closing the mobile menu, threw the page up by up to half
  // a screen. While focus is inside the bar (not on the skip link, whose
  // #main-content jump needs the padding) the padding is switched off.
  it('drops the sticky scroll-padding while focus is in the header', () => {
    const css = readFileSync(resolve(__dirname, 'Header.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    expect(css).toMatch(
      /html:has\(\.ds-header--sticky :focus:not\(\.ds-skip-link\)\)\s*\{\s*scroll-padding-top: 0;\s*\}/,
    );
  });
});
