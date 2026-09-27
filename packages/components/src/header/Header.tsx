import { forwardRef, useCallback, useEffect, useId, useRef, useState } from 'react';
import { Menu, Moon, ShoppingBag, Sun } from '../icon';
import { Drawer } from '../drawer';
import { SkipLink } from '../skip-link';
import { safeHref } from '../internal/safe-url';
import './Header.css';

export interface HeaderNavItem {
  /** Link text (shown in the desktop nav and the mobile menu) */
  label: string;
  /** Link destination */
  href: string;
  /** Marks the link for the page (or section) being viewed — sets `aria-current="page"` */
  current?: boolean;
}

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  /** Logo image URL */
  logoSrc: string;
  /** Logo alt text */
  logoAlt?: string;
  /** Logo link destination */
  logoHref?: string;
  /** Main navigation links */
  navItems?: HeaderNavItem[];
  /** Cart icon link destination */
  cartHref?: string;
  /** Number of items in cart */
  cartCount?: number;
  /** Show dark/light theme toggle */
  showThemeToggle?: boolean;
  /** Stick the header to the top of the viewport on scroll */
  sticky?: boolean;
  /**
   * Skip-to-content link target. Pass `false` to omit the built-in skip
   * link — e.g. when the page renders its own `<SkipLink>` before an
   * AnnouncementBar, so there is exactly one skip link and it comes first.
   */
  skipHref?: string | false;
  /** Controlled open state for the mobile navigation drawer */
  menuOpen?: boolean;
  /** Called when the mobile navigation drawer open state changes */
  onMenuOpenChange?: (open: boolean) => void;
}

export const Header = forwardRef<HTMLElement, HeaderProps>(
  (
    {
      logoSrc,
      logoAlt = 'Home',
      logoHref = '/',
      navItems = [],
      cartHref = '/cart',
      cartCount = 0,
      showThemeToggle = true,
      sticky = false,
      skipHref = '#main-content',
      menuOpen,
      onMenuOpenChange,
      className,
      ...props
    },
    ref,
  ) => {
    const [isDark, setIsDark] = useState(false);
    // The count the page loaded with doesn't bump; every change after that
    // does — including a return to the starting count (2 → 3 → 2), which a
    // plain "differs from the initial count" check left un-bumped.
    const initialCartCount = useRef(cartCount);
    const cartCountChanged = useRef(false);
    if (cartCount !== initialCartCount.current) cartCountChanged.current = true;
    const [internalMenuOpen, setInternalMenuOpen] = useState(false);
    const menuId = useId();

    // Controlled when menuOpen is provided, uncontrolled otherwise.
    const isMenuOpen = menuOpen ?? internalMenuOpen;

    const handleMenuOpenChange = useCallback(
      (open: boolean) => {
        if (menuOpen === undefined) setInternalMenuOpen(open);
        onMenuOpenChange?.(open);
      },
      [menuOpen, onMenuOpenChange],
    );

    useEffect(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    }, []);

    // The drawer is a mobile-only pattern (the menu button is hidden at
    // md+). If the viewport grows past the breakpoint while it's open —
    // rotating a tablet, resizing a window — close it, otherwise the modal
    // overlay, focus trap and scroll lock linger over the desktop nav.
    useEffect(() => {
      if (!isMenuOpen || typeof window.matchMedia !== 'function') return;
      // @breakpoint-md = 768px (matches the .ds-header__menu-btn media query)
      const desktop = window.matchMedia('(min-width: 768px)');
      // React to the crossing only (not the current width), so a consumer
      // that deliberately opens the drawer on a wide screen isn't overridden.
      const close = (event: MediaQueryListEvent) => {
        if (event.matches) handleMenuOpenChange(false);
      };
      desktop.addEventListener('change', close);
      return () => desktop.removeEventListener('change', close);
    }, [isMenuOpen, handleMenuOpenChange]);

    const toggleTheme = useCallback(() => {
      // Read the live class rather than local state: another toggle on the
      // page (docs sidebar, theme editor) may have changed it since mount.
      const next = !document.documentElement.classList.contains('dark');
      setIsDark(next);
      document.documentElement.classList.toggle('dark', next);
      try {
        localStorage.setItem('ds-theme', next ? 'dark' : 'light');
      } catch {
        // Storage can be unavailable (sandboxed iframe, blocked site data,
        // quota). The theme still switches for this page view.
      }
    }, []);

    const hasNav = navItems.length > 0;

    const classes = [
      'ds-header',
      sticky && 'ds-header--sticky',
      // Drives the centred-logo phone layout (menu · logo · actions).
      hasNav && 'ds-header--has-nav',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <header ref={ref} className={classes} {...props}>
        {/* The shared SkipLink, so the built-in one looks and behaves exactly
            like a standalone <SkipLink> (it used to be a restyled copy: a
            white pill here, a dark one there, for the same control). */}
        {skipHref !== false && <SkipLink href={skipHref} className="ds-header__skip-link" />}

        <div className="ds-header__inner">
          {hasNav && (
            <button
              type="button"
              className="ds-header__icon-btn ds-header__menu-btn"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              // Reference only while the drawer (and thus the nav) is mounted
              // to avoid a dangling ID reference when closed.
              aria-controls={isMenuOpen ? menuId : undefined}
              onClick={() => handleMenuOpenChange(!isMenuOpen)}
            >
              <Menu />
            </button>
          )}

          <a href={safeHref(logoHref)} className="ds-header__logo" aria-label={logoAlt}>
            <img src={logoSrc} alt={logoAlt} className="ds-header__logo-img" />
          </a>

          {hasNav && (
            <nav className="ds-header__nav" aria-label="Main">
              {navItems.map((item, index) => (
                // Index-qualified key: labels (e.g. two "Sale" links) can repeat.
                <a
                  key={`${index}-${item.href}`}
                  href={safeHref(item.href)}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          )}

          <div className="ds-header__actions">
            {showThemeToggle && (
              <button
                type="button"
                className="ds-header__icon-btn ds-header__theme-toggle"
                aria-label="Toggle dark mode"
                aria-pressed={isDark}
                onClick={toggleTheme}
              >
                <Sun className="ds-header__theme-icon ds-header__theme-icon--sun" />
                <Moon className="ds-header__theme-icon ds-header__theme-icon--moon" />
              </button>
            )}

            <a
              href={safeHref(cartHref)}
              className="ds-header__icon-btn ds-header__cart"
              aria-label={`Shopping bag (${cartCount} ${cartCount === 1 ? 'item' : 'items'})`}
              // Landing spot for @ds/motion's flyToCart()
              data-motion-cart-target=""
            >
              <ShoppingBag />
              {cartCount > 0 && (
                <span
                  // Re-keyed on every change so the bump keyframe replays.
                  key={cartCount}
                  className={[
                    'ds-header__cart-count',
                    cartCountChanged.current && 'ds-header__cart-count--bump',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-hidden="true"
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </a>
          </div>
        </div>

        {hasNav && (
          <Drawer
            open={isMenuOpen}
            onOpenChange={handleMenuOpenChange}
            side="left"
            title="Menu"
          >
            <nav id={menuId} className="ds-header__drawer-nav" aria-label="Main">
              {navItems.map((item, index) => (
                <a
                  key={`${index}-${item.href}`}
                  href={safeHref(item.href)}
                  aria-current={item.current ? 'page' : undefined}
                  onClick={() => handleMenuOpenChange(false)}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </Drawer>
        )}
      </header>
    );
  },
);

Header.displayName = 'Header';
