/**
 * Sample content for the component stories — one small Mason Supply Co.
 * catalogue, so a product reads the same (name, price, picture) in the
 * product card, the cart, search and the carousel.
 *
 * Story-only. Nothing in `src/index.ts` imports it and it isn't a
 * `src/<folder>/index.ts` build entry, so it never ships.
 *
 * Pictures are generated SVG placeholders (a flat stone tint with the
 * product's name), not photos: they load offline, never change, and so
 * never make a screenshot comparison flicker. The fill colours are picture
 * content, not styling — the same stone values the palette uses.
 */

export interface SampleProduct {
  id: string;
  name: string;
  /** Price in cents (4800 = $48.00) */
  price: number;
  /** Original price in cents, when on sale */
  compareAtPrice?: number;
  /** Placeholder picture (4:5) */
  image: string;
  /** Specific alt text for the picture */
  imageAlt: string;
  href: string;
}

/** Background + text colour pairs for placeholder pictures (stone 200/500, 300/600, 400/800, 500/50) */
const TONES = [
  ['E3DED6', '847D73'],
  ['C8C2B8', '675F56'],
  ['A59E94', '342F2A'],
  ['847D73', 'FAF9F7'],
] as const;

/** A 4:5 placeholder picture with a short label, as a data URL. */
export function productImage(label: string, tone: 0 | 1 | 2 | 3 = 0): string {
  const [bg, fg] = TONES[tone];
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">` +
    `<rect width="400" height="500" fill="#${bg}"/>` +
    `<text x="200" y="250" text-anchor="middle" dominant-baseline="central" ` +
    `font-family="system-ui,sans-serif" font-size="22" fill="#${fg}">${label}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function product(
  id: string,
  name: string,
  label: string,
  tone: 0 | 1 | 2 | 3,
  price: number,
  imageAlt: string,
  compareAtPrice?: number,
): SampleProduct {
  return { id, name, price, compareAtPrice, image: productImage(label, tone), imageAlt, href: `/products/${id}` };
}

/** The catalogue. Keep names and prices stable — stories across components share them. */
export const PRODUCTS = {
  tote: product('canvas-tote', 'Minimal Canvas Tote', 'Canvas tote', 0, 4800, 'Natural canvas tote with leather handles, hanging from a hook'),
  mug: product('ceramic-mug', 'Handmade Ceramic Mug', 'Ceramic mug', 1, 3200, 'Speckled stoneware mug with a matte white glaze'),
  shirt: product('linen-shirt', 'Relaxed Linen Shirt', 'Linen shirt', 2, 8900, 'Oat-coloured linen shirt folded on a wooden bench', 11200),
  wallet: product('leather-wallet', 'Vegetable-Tanned Wallet', 'Wallet', 3, 6500, 'Tan leather bifold wallet, open to show card slots'),
  apron: product('canvas-apron', 'Waxed Canvas Apron', 'Apron', 1, 6400, 'Olive waxed-canvas apron with brass buckles'),
  beanie: product('merino-beanie', 'Merino Wool Beanie', 'Beanie', 0, 3200, 'Charcoal ribbed merino beanie, folded'),
  blanket: product('wool-blanket', 'Wool Throw Blanket', 'Throw blanket', 2, 12800, 'Striped wool throw draped over an armchair', 16000),
  candle: product('soy-candle', 'Cedar & Sage Soy Candle', 'Candle', 3, 2600, 'Amber glass candle jar with a wooden lid'),
} satisfies Record<string, SampleProduct>;

export type SampleProductKey = keyof typeof PRODUCTS;
