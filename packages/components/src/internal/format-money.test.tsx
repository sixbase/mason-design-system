import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CartLineItem } from '../cart-line-item';
import { ProductCard } from '../product-card';
import { formatMoney } from './format-money';

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe('formatMoney', () => {
  it('formats integer hundredths', () => {
    expect(formatMoney(4800)).toBe('$48.00');
    expect(formatMoney(-4800)).toBe('-$48.00');
    expect(formatMoney(480000, 'JPY', 'ja-JP')).toBe('￥4,800');
  });

  // Bad product JSON used to show "$0.00" (null — reads as free), "$NaN",
  // "$∞", or "$0.48" for the Storefront API's decimal string "48.0".
  it.each([null, undefined, Number.NaN, Infinity, -Infinity, '48.0', '4800', {}])(
    'renders %j as blank rather than a wrong price',
    (bad) => {
      expect(formatMoney(bad as unknown as number)).toBe('');
    },
  );
});

describe('a product with a missing price', () => {
  it('ProductCard shows no price instead of $0.00', () => {
    const { container } = render(<ProductCard name="Tote" image="" price={null as unknown as number} />);
    expect(container.querySelector('.ds-product-card__price')?.textContent).toBe('');
  });

  it('CartLineItem shows neither a $0.00 unit price nor a $0.00 line total', () => {
    const { container } = render(
      <CartLineItem
        id="1"
        name="Tote"
        price={null as unknown as number}
        quantity={2}
        onQuantityChange={() => {}}
        onRemove={() => {}}
      />,
    );
    expect(container.textContent).not.toMatch(/\$0\.00|NaN/);
  });
});
