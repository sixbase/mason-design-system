import { forwardRef, useCallback, useEffect, useId, useState } from 'react';
import { Menu, Moon, ShoppingBag, Sun } from '../icon';
import { Drawer } from '../drawer';
import './Header.css';

export interface HeaderNavItem {
  label: string;
  href: string;
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
  /** Skip-to-content link target */
  skipHref?: string;
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

    const toggleTheme = useCallback(() => {
      const next = !isDark;
      setIsDark(next);
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem('ds-theme', next ? 'dark' : 'light');
    }, [isDark]);

    const classes = ['ds-header', sticky && 'ds-header--sticky', className]
      .filter(Boolean)
      .join(' ');

    return (
      <header ref={ref} className={classes} {...props}>
        <a href={skipHref} className="ds-header__skip-link">
          Skip to content
        </a>

        <div className="ds-header__inner">
          {navItems.length > 0 && (
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

          <a href={logoHref} className="ds-header__logo" aria-label={logoAlt}>
            <img src={logoSrc} alt={logoAlt} className="ds-header__logo-img" />
          </a>

          {navItems.length > 0 && (
            <nav className="ds-header__nav" aria-label="Main">
              {navItems.map((item) => (
                <a key={item.label} href={item.href}>
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
                onClick={toggleTheme}
              >
                <Sun className="ds-header__theme-icon ds-header__theme-icon--sun" />
                <Moon className="ds-header__theme-icon ds-header__theme-icon--moon" />
              </button>
            )}

            <a
              href={cartHref}
              className="ds-header__icon-btn ds-header__cart"
              aria-label={`Shopping bag (${cartCount} ${cartCount === 1 ? 'item' : 'items'})`}
            >
              <ShoppingBag />
              {cartCount > 0 && (
                <span className="ds-header__cart-count" aria-hidden="true">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </a>
          </div>
        </div>

        {navItems.length > 0 && (
          <Drawer
            open={isMenuOpen}
            onOpenChange={handleMenuOpenChange}
            side="left"
            title="Menu"
          >
            <nav id={menuId} className="ds-header__drawer-nav" aria-label="Main">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
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
