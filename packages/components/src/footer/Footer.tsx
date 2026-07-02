import { forwardRef } from 'react';
import { Heading, Text } from '../typography';
import './Footer.css';

export interface FooterColumn {
  heading: string;
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
              <a href={logoHref} className="ds-footer__logo" aria-label={logoAlt}>
                <img src={logoSrc} alt={logoAlt} className="ds-footer__logo-img" />
              </a>
              {tagline && <Text className="ds-footer__tagline">{tagline}</Text>}
            </div>

            {columns.map((col) => (
              <div key={col.heading} className="ds-footer__column">
                <Heading as="h3" className="ds-footer__heading">
                  {col.heading}
                </Heading>
                <ul className="ds-footer__links">
                  {col.links.map((link) => (
                    <li key={link.href + link.label}>
                      <a href={link.href}>{link.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {(copyright || legalLinks.length > 0) && (
            <div className="ds-footer__bottom">
              {copyright && <Text className="ds-footer__copyright">{copyright}</Text>}
              {legalLinks.length > 0 && (
                <div className="ds-footer__legal">
                  {legalLinks.map((link) => (
                    <a key={link.href + link.label} href={link.href}>
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
