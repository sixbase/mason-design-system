import { forwardRef, useState, useEffect, useCallback } from 'react';
import { Moon, ShoppingBag, Sun } from '../icon';
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
      className,
      ...props
    },
    ref,
  ) => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    }, []);

    const toggleTheme = useCallback(() => {
      const next = !isDark;
      setIsDark(next);
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem('ds-theme', next ? 'dark' : 'light');
    }, [isDark]);

    const classes = ['ds-header', className].filter(Boolean).join(' ');

    return (
      <header ref={ref} className={classes} {...props}>
        <div className="ds-header__inner">
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
            </a>
          </div>
        </div>
      </header>
    );
  },
);

Header.displayName = 'Header';
