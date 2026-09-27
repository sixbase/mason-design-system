import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import { ProductCard } from './ProductCard';

describe('ProductCard', () => {
  it('renders product name', () => {
    render(<ProductCard name="Classic T-Shirt" price={3200} image="/tshirt.jpg" />);
    expect(screen.getByText('Classic T-Shirt')).toBeInTheDocument();
  });

  it('formats price in dollars', () => {
    render(<ProductCard name="Watch" price={28500} image="/watch.jpg" />);
    expect(screen.getByText('$285.00')).toBeInTheDocument();
  });

  // A card is usually wrapped in a link. With alt = name, the link was
  // announced "Sunglasses Sunglasses $99.00". The name is the text below.
  it('treats the photo as decorative by default, so a card link reads the name once', () => {
    render(
      <a href="/products/sunglasses">
        <ProductCard name="Sunglasses" price={9900} image="/sunglasses.jpg" />
      </a>,
    );
    expect(screen.getByRole('link')).toHaveAccessibleName('Sunglasses $99.00');
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('uses imageAlt when the photo is described', () => {
    render(
      <ProductCard
        name="Sunglasses"
        price={9900}
        image="/sunglasses.jpg"
        imageAlt="Tortoiseshell sunglasses folded on a linen towel"
      />,
    );
    expect(
      screen.getByRole('img', { name: 'Tortoiseshell sunglasses folded on a linen towel' }),
    ).toBeInTheDocument();
  });

  it('adds no size modifier by default and ds-product-card--lg for size="lg"', () => {
    const { container, rerender } = render(
      <ProductCard name="Mug" price={2400} image="/mug.jpg" />,
    );
    const root = () => container.querySelector('.ds-product-card');
    expect(root()?.className).not.toMatch(/ds-product-card--(default|lg)/);
    rerender(<ProductCard name="Mug" price={2400} image="/mug.jpg" size="lg" />);
    expect(root()).toHaveClass('ds-product-card--lg');
  });

  it('adds the fluid modifier only when fluid is set', () => {
    const { container, rerender } = render(
      <ProductCard name="Mug" price={2400} image="/mug.jpg" />,
    );
    expect(container.querySelector('.ds-product-card')).not.toHaveClass('ds-product-card--fluid');
    rerender(<ProductCard name="Mug" price={2400} image="/mug.jpg" fluid />);
    expect(container.querySelector('.ds-product-card')).toHaveClass('ds-product-card--fluid');
  });

  it('supports custom currency', () => {
    render(<ProductCard name="Bag" price={15000} image="/bag.jpg" currency="EUR" />);
    expect(screen.getByText('€150.00')).toBeInTheDocument();
  });

  describe('locale formatting', () => {
    // Expected strings come from Intl itself so ICU spacing (no-break and
    // narrow no-break spaces) never makes the tests brittle.
    const intl = (locale: string, currency: string, amount: number) =>
      new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
    // Keep the no-break spaces and bidi marks: the default normalizer turns
    // them into plain spaces on the page side only.
    const exact = { normalizer: (s: string) => s };

    it('formats in the given locale (was hardcoded en-US)', () => {
      render(<ProductCard name="Bag" price={4800} image="/bag.jpg" currency="EUR" locale="de-DE" />);
      const expected = intl('de-DE', 'EUR', 48);
      expect(expected).toContain('48,00');
      expect(screen.getByText(expected, exact)).toBeInTheDocument();
    });

    it('zero-decimal currencies still take hundredths (Shopify rule): 480000 JPY = ¥4,800', () => {
      render(<ProductCard name="Bag" price={480000} image="/bag.jpg" currency="JPY" locale="ja-JP" />);
      const expected = intl('ja-JP', 'JPY', 4800);
      expect(expected).not.toMatch(/[.,]\d{2}$/); // no ".00" on yen
      expect(screen.getByText(expected)).toBeInTheDocument();
    });

    it('renders native digits for locales that use them (ar-EG)', () => {
      render(<ProductCard name="Bag" price={4800} image="/bag.jpg" locale="ar-EG" />);
      expect(screen.getByText(intl('ar-EG', 'USD', 48), exact)).toBeInTheDocument();
    });

    it('does not crash on an unknown currency code', () => {
      render(<ProductCard name="Bag" price={4800} image="/bag.jpg" currency="NOTACODE" />);
      expect(screen.getByText(/48\.00 NOTACODE/)).toBeInTheDocument();
    });
  });

  it('applies product card class', () => {
    render(<ProductCard name="Hat" price={2500} image="/hat.jpg" data-testid="card" />);
    expect(screen.getByTestId('card')).toHaveClass('ds-product-card');
  });

  it('renders custom price via renderPrice', () => {
    render(
      <ProductCard
        name="Sale Item"
        price={2400}
        image="/sale.jpg"
        renderPrice={(price, currency) => <span data-testid="custom-price">${(price / 100).toFixed(2)}</span>}
      />,
    );
    expect(screen.getByTestId('custom-price')).toHaveTextContent('$24.00');
    // Default formatted price should not appear — only the custom one.
    // (Was `.toBeNull` without parens: a no-op that asserted nothing.)
    expect(screen.getAllByText('$24.00')).toHaveLength(1);
  });

  it('passes the card currency to renderPrice', () => {
    const renderPrice = vi.fn(() => <span>custom</span>);
    render(<ProductCard name="Tote" price={2400} image="/tote.jpg" currency="EUR" renderPrice={renderPrice} />);
    expect(renderPrice).toHaveBeenCalledWith(2400, 'EUR');
  });

  it('renders badge overlay', () => {
    render(
      <ProductCard
        name="New Item"
        price={5000}
        image="/new.jpg"
        badge={<span data-testid="badge">New</span>}
      />,
    );
    expect(screen.getByTestId('badge')).toHaveTextContent('New');
  });

  it('renders hover image with aria-hidden', () => {
    const { container } = render(
      <ProductCard
        name="Hover Item"
        price={3200}
        image="/main.jpg"
        hoverImage="/hover.jpg"
      />,
    );
    const hoverImg = container.querySelector('.ds-product-card__hover-image');
    expect(hoverImg).toBeInTheDocument();
    expect(hoverImg).toHaveAttribute('aria-hidden', 'true');
    expect(hoverImg).toHaveAttribute('src', '/hover.jpg');
  });

  it('applies has-hover-image modifier class', () => {
    render(
      <ProductCard
        name="Hover Item"
        price={3200}
        image="/main.jpg"
        hoverImage="/hover.jpg"
        data-testid="card"
      />,
    );
    expect(screen.getByTestId('card')).toHaveClass('ds-product-card--has-hover-image');
  });

  it('renders actionSlot content in the image overlay', () => {
    const { container } = render(
      <ProductCard
        name="Wishlist Item"
        price={3200}
        image="/item.jpg"
        actionSlot={
          <button type="button" aria-label="Add to wishlist" data-testid="wishlist">
            ♥
          </button>
        }
      />,
    );
    const overlay = container.querySelector('.ds-product-card__action');
    expect(overlay).toBeInTheDocument();
    expect(overlay).toContainElement(screen.getByTestId('wishlist'));
    // Slot lives inside the image wrapper so it overlays the image
    expect(container.querySelector('.ds-product-card__image-wrapper')).toContainElement(
      overlay as HTMLElement,
    );
  });

  it('renders footerSlot content after the card body', () => {
    const { container } = render(
      <ProductCard
        name="Quick Add Item"
        price={3200}
        image="/item.jpg"
        footerSlot={
          <button type="button" data-testid="quick-add">
            Quick add
          </button>
        }
      />,
    );
    const footer = container.querySelector('.ds-product-card__footer');
    expect(footer).toBeInTheDocument();
    expect(footer).toContainElement(screen.getByTestId('quick-add'));
  });

  it('does not render slot wrappers when slots are omitted', () => {
    const { container } = render(
      <ProductCard name="Plain" price={3200} image="/plain.jpg" />,
    );
    expect(container.querySelector('.ds-product-card__action')).not.toBeInTheDocument();
    expect(container.querySelector('.ds-product-card__footer')).not.toBeInTheDocument();
  });

  it('does not set an inline aspect-ratio style (token-driven via CSS)', () => {
    const { container } = render(
      <ProductCard name="Tokenized" price={3200} image="/t.jpg" />,
    );
    const imageEl = container.querySelector('.ds-card-image');
    expect(imageEl).not.toHaveAttribute('style');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <ProductCard name="Classic T-Shirt" price={3200} image="/tshirt.jpg" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no accessibility violations with action and footer slots', async () => {
    const { container } = render(
      <ProductCard
        name="Slotted"
        price={3200}
        image="/s.jpg"
        actionSlot={
          <button type="button" aria-label="Add to wishlist">
            ♥
          </button>
        }
        footerSlot={<button type="button">Quick add</button>}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no accessibility violations with badge and hover image', async () => {
    const { container } = render(
      <ProductCard
        name="Full Featured"
        price={3200}
        image="/main.jpg"
        hoverImage="/hover.jpg"
        badge={<span>Sale</span>}
        renderPrice={(p) => <span>${(p / 100).toFixed(2)}</span>}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('renders a placeholder tile instead of a broken image when image is empty', () => {
    const { container } = render(
      <ProductCard name="No photo yet" price={1000} image="" hoverImage="/hover.jpg" />,
    );
    expect(container.querySelector('img')).toBeNull();
    const placeholder = container.querySelector('.ds-product-card__placeholder');
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('.ds-product-card--has-hover-image')).toBeNull();
  });

  // Regression: the card's no-shadow hover (0-3-0) outranked Card's focus
  // ring (0-2-0), so a keyboard-focused card lost its ring while the mouse
  // rested on it. jsdom has no :hover, so the cascade is checked in source.
  it('restates the focus ring after its no-shadow hover and press overrides', () => {
    const css = readFileSync(resolve(__dirname, 'ProductCard.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    const hover = css.indexOf('.ds-product-card.ds-card--interactive:hover');
    const press = css.indexOf('.ds-product-card.ds-card--interactive:active');
    const ring = css.search(
      /\.ds-product-card\.ds-card--interactive:focus-visible,\s*:focus-visible > \.ds-product-card\.ds-card--interactive\s*\{[^}]*box-shadow:\s*var\(--focus-ring\)/,
    );
    expect(hover).toBeGreaterThan(-1);
    expect(ring).toBeGreaterThan(Math.max(hover, press));
  });
});
