import type { ReactNode } from 'react';
import { Footer, Header } from '@ds/components';
import { useCartCount } from '../data/cart-count';
import '../specimens.css';

// In-frame routes: store links stay inside the frame (see environment.ts).
const R = '#/page/examples';
const LOGO = `${import.meta.env.BASE_URL}mason-supply-co-logo.svg`;

const NAV_ITEMS = [
  { id: 'homepage', label: 'Shop', href: `${R}/homepage` },
  { id: 'collection', label: 'Collections', href: `${R}/collection` },
  { id: 'sale', label: 'Sale', href: `${R}/sale` },
];

const FOOTER_COLUMNS = [
  { heading: 'Shop', links: [{ label: 'Phone Cases', href: `${R}/collection` }, { label: 'Wallets', href: `${R}/collection` }, { label: 'Bags', href: `${R}/collection` }] },
  { heading: 'Company', links: [{ label: 'About', href: '#' }, { label: 'Journal', href: '#' }, { label: 'Sustainability', href: '#' }] },
  { heading: 'Support', links: [{ label: 'Contact', href: '#' }, { label: 'Shipping & Returns', href: `${R}/terms` }, { label: 'Account', href: `${R}/account` }] },
];

/** The storefront frame every page demo sits in: header, main, footer. */
export function PageChrome({ children, page }: { children: ReactNode; page?: string }) {
  // Follows the demo cart (data/cart-count) — it was a constant 4
  const cartCount = useCartCount();
  return (
    <>
      <Header
        logoSrc={LOGO}
        logoAlt="Mason Supply Co."
        logoHref={`${R}/homepage`}
        navItems={NAV_ITEMS.map(({ id, ...item }) => ({ ...item, current: id === page }))}
        cartHref={`${R}/cart`}
        cartCount={cartCount}
        sticky
      />
      <main className="ds-page-container wb-page-main" id="main-content" tabIndex={-1}>
        {children}
      </main>
      <Footer
        logoSrc={LOGO}
        logoAlt="Mason Supply Co."
        logoHref={`${R}/homepage`}
        tagline="Thoughtfully designed accessories for everyday carry."
        columns={FOOTER_COLUMNS}
        copyright="© 2026 Mason Supply Co. All rights reserved."
        legalLinks={[{ label: 'Privacy Policy', href: '#' }, { label: 'Terms of Service', href: `${R}/terms` }]}
      />
    </>
  );
}

export const PAGE_BASE = '#/page';
