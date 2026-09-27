import { forwardRef } from 'react';
import { Heading, Text } from '../typography';
import type { HeadingLevel } from '../typography';
import { safeHref } from '../internal/safe-url';
import './Footer.css';

export interface FooterColumn {
  /** Column heading (rendered at `headingLevel`) — also names the column's `<nav>` landmark */
  heading: string;
  /** Links in the column, top to bottom */
  links: { label: string; href: string }[];
}

export interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  /** Logo image URL */
  logoSrc: string;
  /** Logo alt text */
  logoAlt?: string;
  /** Logo link destination */
  logoHref?: string;
  /** Brand tagline displayed below the logo */
  tagline?: string;
  /** Link columns */
  columns?: FooterColumn[];
  /** Copyright text */
  copyright?: string;
  /** Legal links shown at the bottom */
  legalLinks?: { label: string; href: string }[];
  /**
   * Heading level for the column headings (default `'h2'`). The footer is
   * a top-level landmark, so h2 never skips a level after the page's h1;
   * lower it only when the footer is nested inside a deeper section.
   */
  headingLevel?: Exclude<HeadingLevel, 'h1'>;
}

export const Footer = forwardRef<HTMLElement, FooterProps>(
  (
    {
      logoSrc,
      logoAlt = 'Home',
      logoHref = '/',
      tagline,
      columns = [],
      copyright,
      legalLinks = [],
      headingLevel = 'h2',
      className,
      ...props
    },
    ref,
  ) => {
    const classes = ['ds-footer', className].filter(Boolean).join(' ');

    return (
      <footer ref={ref} className={classes} {...props}>
        <div className="ds-footer__inner">
          <div className="ds-footer__grid">
            <div className="ds-footer__brand">
              <a href={safeHref(logoHref)} className="ds-footer__logo" aria-label={logoAlt}>
                <img src={logoSrc} alt={logoAlt} className="ds-footer__logo-img" />
              </a>
              {tagline && (
                <Text size="sm" className="ds-footer__tagline">
                  {tagline}
                </Text>
              )}
            </div>

            {columns.map((col, index) => (
              <nav key={index} className="ds-footer__column" aria-label={col.heading}>
                <Heading as={headingLevel} size="xl" className="ds-footer__heading">
                  {col.heading}
                </Heading>
                <ul className="ds-footer__links">
                  {col.links.map((link) => (
                    <li key={link.href + link.label}>
                      <a href={safeHref(link.href)}>{link.label}</a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          {(copyright || legalLinks.length > 0) && (
            <div className="ds-footer__bottom">
              {copyright && (
                <Text size="sm" className="ds-footer__copyright">
                  {copyright}
                </Text>
              )}
              {legalLinks.length > 0 && (
                <div className="ds-footer__legal">
                  {legalLinks.map((link) => (
                    <a key={link.href + link.label} href={safeHref(link.href)}>
                      {link.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </footer>
    );
  },
);

Footer.displayName = 'Footer';
