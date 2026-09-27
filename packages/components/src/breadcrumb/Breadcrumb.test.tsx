import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import { Breadcrumb } from './Breadcrumb';

const items = [
  { label: 'Home', href: '/' },
  { label: 'Women', href: '/women' },
  { label: 'Dresses', href: '/women/dresses' },
  { label: 'Silk Wrap Dress' },
];

describe('Breadcrumb', () => {
  it('renders all items', () => {
    render(<Breadcrumb items={items} />);
    items.forEach((item) => {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    });
  });

  it('renders links for non-last items with href', () => {
    render(<Breadcrumb items={items} />);
    expect(screen.getByText('Home').closest('a')).toHaveAttribute('href', '/');
    expect(screen.getByText('Women').closest('a')).toHaveAttribute('href', '/women');
  });

  it('marks last item as current page', () => {
    render(<Breadcrumb items={items} />);
    expect(screen.getByText('Silk Wrap Dress')).toHaveAttribute('aria-current', 'page');
  });

  it('last item is not a link', () => {
    render(<Breadcrumb items={items} />);
    expect(screen.getByText('Silk Wrap Dress').closest('a')).toBeNull();
  });

  it('uses chevron as default separator', () => {
    const { container } = render(<Breadcrumb items={items} />);
    expect(container.querySelector('.ds-breadcrumb__separator')?.textContent).toBe('›');
  });

  it('renders separators between items', () => {
    const { container } = render(<Breadcrumb items={items} />);
    const separators = container.querySelectorAll('.ds-breadcrumb__separator');
    expect(separators).toHaveLength(items.length - 1);
  });

  it('separators are hidden from screen readers', () => {
    const { container } = render(<Breadcrumb items={items} />);
    const separators = container.querySelectorAll('.ds-breadcrumb__separator');
    separators.forEach((sep) => {
      expect(sep).toHaveAttribute('aria-hidden', 'true');
    });
  });

  it('supports custom separator', () => {
    const { container } = render(<Breadcrumb items={items} separator="/" />);
    expect(container.querySelector('.ds-breadcrumb__separator')?.textContent).toBe('/');
  });

  it('renders nav landmark with aria-label', () => {
    render(<Breadcrumb items={items} />);
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
  });

  describe('maxItems truncation', () => {
    const longItems = [
      { label: 'Home', href: '/' },
      { label: 'Electronics', href: '/electronics' },
      { label: 'Phones', href: '/electronics/phones' },
      { label: 'Accessories', href: '/electronics/phones/accessories' },
      { label: 'Aramid Fiber Case' },
    ];

    it('marks middle items as collapsible when maxItems is set', () => {
      render(<Breadcrumb items={longItems} maxItems={3} />);
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Accessories')).toBeInTheDocument();
      expect(screen.getByText('Aramid Fiber Case')).toBeInTheDocument();
      // Middle items are in DOM but marked collapsible
      expect(screen.getByText('Electronics').closest('li')).toHaveClass('ds-breadcrumb__item--collapsible');
      expect(screen.getByText('Phones').closest('li')).toHaveClass('ds-breadcrumb__item--collapsible');
      // First and last items are NOT collapsible
      expect(screen.getByText('Home').closest('li')).not.toHaveClass('ds-breadcrumb__item--collapsible');
      expect(screen.getByText('Aramid Fiber Case').closest('li')).not.toHaveClass('ds-breadcrumb__item--collapsible');
    });

    it('renders ellipsis when truncated', () => {
      const { container } = render(<Breadcrumb items={longItems} maxItems={3} />);
      expect(container.querySelector('.ds-breadcrumb__ellipsis')).toBeInTheDocument();
      expect(container.querySelector('.ds-breadcrumb__ellipsis')?.textContent).toBe('…');
    });

    it('ellipsis is hidden from screen readers', () => {
      const { container } = render(<Breadcrumb items={longItems} maxItems={3} />);
      expect(container.querySelector('.ds-breadcrumb__ellipsis')).toHaveAttribute('aria-hidden', 'true');
    });

    it('shows all items without collapsible class when count is within maxItems', () => {
      const { container } = render(<Breadcrumb items={longItems} maxItems={10} />);
      longItems.forEach((item) => {
        expect(screen.getByText(item.label)).toBeInTheDocument();
      });
      expect(container.querySelectorAll('.ds-breadcrumb__item--collapsible')).toHaveLength(0);
      expect(container.querySelector('.ds-breadcrumb__ellipsis')).not.toBeInTheDocument();
    });
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Breadcrumb items={items} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  // ── Regressions (QA break pass) ─────────────────────────

  it('accepts repeated labels without React key collisions', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <Breadcrumb
        items={[
          { label: 'Sale', href: '/sale' },
          { label: 'Sale', href: '/sale/outlet' },
          { label: 'Linen Apron' },
        ]}
      />,
    );
    expect(spy.mock.calls.flat().join(' ')).not.toMatch(/same key/);
    spy.mockRestore();
  });

  it('wraps each label in a truncating span inside the link', () => {
    // The ellipsis lives on the label span so the link keeps overflow
    // visible (its focus ring and coarse-pointer hit area are not clipped).
    render(<Breadcrumb items={items} />);
    const link = screen.getByRole('link', { name: 'Women' });
    expect(link.querySelector('.ds-breadcrumb__label')).toHaveTextContent('Women');
  });

  describe('structured data (schema)', () => {
    const jsonLd = (container: HTMLElement) => {
      const script = container.querySelector('script[type="application/ld+json"]');
      return script ? JSON.parse(script.textContent ?? '') : null;
    };

    it('emits no JSON-LD unless asked', () => {
      const { container } = render(<Breadcrumb items={items} />);
      expect(jsonLd(container)).toBeNull();
    });

    it('emits a BreadcrumbList with absolute URLs from a base URL', () => {
      const { container } = render(<Breadcrumb items={items} schema="https://shop.example" />);
      expect(jsonLd(container)).toEqual({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://shop.example/' },
          { '@type': 'ListItem', position: 2, name: 'Women', item: 'https://shop.example/women' },
          { '@type': 'ListItem', position: 3, name: 'Dresses', item: 'https://shop.example/women/dresses' },
          // The current page is the page itself: no item URL
          { '@type': 'ListItem', position: 4, name: 'Silk Wrap Dress' },
        ],
      });
    });

    it('keeps hrefs as written with schema={true}', () => {
      const { container } = render(<Breadcrumb items={items} schema />);
      expect(jsonLd(container).itemListElement[1].item).toBe('/women');
    });

    it('cannot be broken out of by a label containing </script>', () => {
      const { container } = render(
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: '</script><b>x</b>' }]} schema />,
      );
      const script = container.querySelector('script[type="application/ld+json"]');
      expect(script?.innerHTML).not.toContain('</script>');
      expect(jsonLd(container).itemListElement[1].name).toBe('</script><b>x</b>');
    });

    it('leaves the visible trail unchanged', () => {
      render(<Breadcrumb items={items} schema="https://shop.example" />);
      expect(screen.getAllByRole('listitem')).toHaveLength(4);
      expect(screen.getAllByRole('link').map((a) => a.textContent)).toEqual(['Home', 'Women', 'Dresses']);
    });
  });
});
