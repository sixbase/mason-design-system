import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AnnouncementBar } from '../announcement-bar';
import { Breadcrumb } from '../breadcrumb';
import { CartDrawer } from '../cart-drawer';
import { CartLineItem } from '../cart-line-item';
import { EmptyState } from '../empty-state';
import { Footer } from '../footer';
import { Header } from '../header';
import { Pagination } from '../pagination';
import { safeHref } from './safe-url';

// Link destinations come from store data. React 18 renders javascript: URLs
// as given (dev warning only), so every link-rendering component routes its
// hrefs through safeHref.
const EVIL = [
  'javascript:alert(1)',
  'JavaScript:alert(1)',
  ' \u0000javascript:alert(1)',
  'java\tscript:alert(1)',
  'jav\nascript:alert(1)',
  'vbscript:msgbox(1)',
  'data:text/html,<script>alert(1)</script>',
];

const hrefs = (root: ParentNode) =>
  Array.from(root.querySelectorAll('a')).map((a) => a.getAttribute('href'));

const noScriptHrefs = (root: ParentNode) =>
  hrefs(root).every((h) => h === null || !/^\s*(javascript|vbscript|data):/i.test(h.replace(/[\t\n\r]/g, '')));

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe('safeHref', () => {
  it.each(EVIL)('refuses %j', (href) => {
    expect(safeHref(href)).toBeUndefined();
  });

  it.each([
    '/products/tote',
    '#main-content',
    '?page=2',
    'https://example.com/a?b=c#d',
    'mailto:hello@example.com',
    'tel:+15555550100',
    'products/javascript:guide', // a path segment, not a scheme
  ])('keeps %j as written', (href) => {
    expect(safeHref(href)).toBe(href);
  });

  it('passes null and undefined through as undefined', () => {
    expect(safeHref(undefined)).toBeUndefined();
    expect(safeHref(null)).toBeUndefined();
  });
});

describe('components never render a script URL', () => {
  it('Breadcrumb: link becomes text, and JSON-LD carries no item URL', () => {
    const { container } = render(
      <Breadcrumb
        schema="https://shop.example"
        items={[{ label: 'Home', href: 'javascript:alert(1)' }, { label: 'Bags', href: '/bags' }, { label: 'Tote' }]}
      />,
    );
    expect(hrefs(container)).toEqual(['/bags']);
    expect(container.textContent).toContain('Home');
    const ld = JSON.parse(container.querySelector('script')!.textContent!);
    expect(ld.itemListElement[0].item).toBeUndefined();
    expect(ld.itemListElement[1].item).toBe('https://shop.example/bags');
  });

  it('Breadcrumb JSON-LD cannot close its own <script> element', () => {
    const label = 'A</script><script>alert(1)</script><!--';
    const { container } = render(<Breadcrumb schema items={[{ label, href: '/a' }, { label: 'B' }]} />);
    const raw = container.querySelector('script')!.textContent!;
    expect(raw).not.toMatch(/</);
    expect(JSON.parse(raw).itemListElement[0].name).toBe(label);
  });

  it.each(EVIL)('AnnouncementBar, Footer, EmptyState, Header, CartLineItem, Pagination with %j', (evil) => {
    const { container } = render(
      <>
        <AnnouncementBar href={evil}>Free shipping</AnnouncementBar>
        <Footer
          logoSrc="/logo.svg"
          logoHref={evil}
          columns={[{ heading: 'Shop', links: [{ label: 'All', href: evil }] }]}
          legalLinks={[{ label: 'Privacy', href: evil }]}
        />
        <EmptyState heading="Nothing here" action={{ label: 'Shop', href: evil }} secondaryAction={{ label: 'Home', href: evil }} />
        <Header logoSrc="/logo.svg" logoHref={evil} cartHref={evil} navItems={[{ label: 'Shop', href: evil }]} />
        <CartLineItem id="1" name="Tote" price={4800} quantity={1} href={evil} onQuantityChange={() => {}} onRemove={() => {}} />
        <Pagination currentPage={2} totalPages={5} baseUrl={evil} />
      </>,
    );
    expect(noScriptHrefs(container)).toBe(true);
    // Text stays on screen — only the destination is dropped
    expect(container.textContent).toContain('Free shipping');
    expect(container.textContent).toContain('Tote');
  });

  it('CartDrawer checkout link', () => {
    render(
      <CartDrawer
        open
        onOpenChange={() => {}}
        items={[{ id: '1', name: 'Tote', price: 4800, quantity: 1, href: 'javascript:alert(1)' }]}
        subtotal={4800}
        checkoutUrl="javascript:alert(1)"
        onUpdateQuantity={() => {}}
        onRemoveItem={() => {}}
      />,
    );
    expect(noScriptHrefs(document.body)).toBe(true);
  });
});
