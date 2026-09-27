import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CartLineItem } from '../cart-line-item';
import { ImageGallery } from '../image-gallery';
import type { GalleryImage } from '../image-gallery';
import { VariantSelector } from '../variant-selector';
import type { VariantOption } from '../variant-selector';

// There are no error boundaries inside the design system: one component
// that throws on a malformed product blanks the whole page. These cover the
// malformed shapes real store data produced.

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe('one bad product never crashes the page', () => {
  it('ImageGallery skips a null entry in the media list', () => {
    const images = [{ src: '/a.jpg', alt: 'Tote, front' }, null, { src: '/b.jpg', alt: 'Tote, back' }];
    render(<ImageGallery images={images as unknown as GalleryImage[]} />);
    expect(screen.getByAltText('Tote, front')).toBeInTheDocument();
    expect(screen.getAllByRole('tab').map((t) => t.getAttribute('aria-label'))).toEqual([
      'Tote, front',
      'Tote, back',
    ]);
  });

  it('VariantSelector drops an option that has no values list', () => {
    const options = [
      { name: 'Material', type: 'button' },
      { name: 'Size', type: 'button', values: [{ label: 'Large', value: 'l' }] },
    ] as unknown as VariantOption[];
    render(<VariantSelector options={options} selectedValues={{}} onValueChange={() => {}} />);
    expect(screen.getByRole('radio', { name: 'Large' })).toBeInTheDocument();
    expect(screen.queryByText('Material')).not.toBeInTheDocument();
  });

  it('CartLineItem with a null quantity shows no $0.00 line total', () => {
    const { container } = render(
      <CartLineItem
        id="1"
        name="Tote"
        price={4800}
        quantity={null as unknown as number}
        onQuantityChange={() => {}}
        onRemove={() => {}}
      />,
    );
    expect(container.querySelector('.ds-cart-line-item__price')?.textContent).toBe('');
  });
});
